import { Hono } from 'hono'
import type { AppEnv } from '../lib/types.js'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { hashPassword, verifyPassword, signToken, verifyToken, generateToken, tokenExpiry } from '../lib/auth.js'
import { queueVerificationEmail, queuePasswordResetEmail } from '../lib/queue.js'
import { requireAuth } from '../middleware/auth.js'
import { serializeUser } from '../lib/serialize.js'

const app = new Hono<AppEnv>()

const registerSchema = z.object({
  email:      z.string().email(),
  password:   z.string().min(8),
  first_name: z.string().min(1),
  last_name:  z.string().min(1),
})

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string(),
})

function userResponse(u: typeof users.$inferSelect) {
  return serializeUser(u)
}

async function tokenPair(userId: string) {
  return {
    access_token:  await signToken(userId, 'access'),
    refresh_token: await signToken(userId, 'refresh'),
  }
}

app.post('/register', zValidator('json', registerSchema), async c => {
  const body = c.req.valid('json')
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, body.email)).limit(1)
  if (existing) return c.json({ detail: 'Email already registered' }, 409)

  const token = generateToken()
  const [user] = await db.insert(users).values({
    email:                      body.email,
    hashedPassword:             await hashPassword(body.password),
    firstName:                  body.first_name,
    lastName:                   body.last_name,
    verificationToken:          token,
    verificationTokenExpiresAt: tokenExpiry(24),
  }).returning()

  queueVerificationEmail(user.email, user.firstName, token)

  return c.json({ ...(await tokenPair(user.id)), user: userResponse(user) }, 201)
})

app.post('/login', zValidator('json', loginSchema), async c => {
  const { email, password } = c.req.valid('json')
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (!user || !(await verifyPassword(password, user.hashedPassword)))
    return c.json({ detail: 'Invalid credentials' }, 401)
  if (!user.isActive)
    return c.json({ detail: 'Account is inactive' }, 403)

  return c.json({ ...(await tokenPair(user.id)), user: userResponse(user) })
})

app.post('/refresh', async c => {
  const { refresh_token } = await c.req.json()
  const userId = await verifyToken(refresh_token, 'refresh')
  if (!userId) return c.json({ detail: 'Invalid or expired refresh token' }, 401)

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user || !user.isActive) return c.json({ detail: 'User not found' }, 401)

  return c.json({ ...(await tokenPair(user.id)), user: userResponse(user) })
})

app.post('/verify-email', async c => {
  const { token } = await c.req.json()
  const [user] = await db.select().from(users).where(eq(users.verificationToken, token)).limit(1)
  if (!user) return c.json({ detail: 'Invalid verification token' }, 400)
  if (user.isVerified) return c.json({ message: 'Email already verified' })
  if (user.verificationTokenExpiresAt! < new Date()) return c.json({ detail: 'Verification token has expired' }, 400)

  await db.update(users).set({ isVerified: true, verificationToken: null, verificationTokenExpiresAt: null }).where(eq(users.id, user.id))
  return c.json({ message: 'Email verified successfully' })
})

app.post('/resend-verification', async c => {
  const { email } = await c.req.json()
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (user && !user.isVerified) {
    const token = generateToken()
    await db.update(users).set({ verificationToken: token, verificationTokenExpiresAt: tokenExpiry(24) }).where(eq(users.id, user.id))
    queueVerificationEmail(user.email, user.firstName, token)
  }
  return c.json({ message: "If that email exists and is unverified, a new link has been sent" })
})

app.post('/forgot-password', async c => {
  const { email } = await c.req.json()
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (user && user.isActive) {
    const token = generateToken()
    await db.update(users).set({ resetToken: token, resetTokenExpiresAt: tokenExpiry(2) }).where(eq(users.id, user.id))
    queuePasswordResetEmail(user.email, user.firstName, token)
  }
  return c.json({ message: "If that email is registered, a reset link has been sent" })
})

app.post('/reset-password', async c => {
  const { token, new_password } = await c.req.json()
  const [user] = await db.select().from(users).where(eq(users.resetToken, token)).limit(1)
  if (!user) return c.json({ detail: 'Invalid reset token' }, 400)
  if (user.resetTokenExpiresAt! < new Date()) return c.json({ detail: 'Reset token has expired' }, 400)

  await db.update(users).set({ hashedPassword: await hashPassword(new_password), resetToken: null, resetTokenExpiresAt: null }).where(eq(users.id, user.id))
  return c.json({ message: 'Password reset successfully' })
})

export default app
