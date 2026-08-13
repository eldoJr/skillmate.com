import { createMiddleware } from 'hono/factory'
import { verifyToken } from '../lib/auth.js'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import type { AppEnv } from '../lib/types.js'

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header('Authorization')
  const token  = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return c.json({ detail: 'Missing token' }, 401)

  const userId = await verifyToken(token, 'access')
  if (!userId) return c.json({ detail: 'Invalid or expired token' }, 401)

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user)          return c.json({ detail: 'User not found' }, 401)
  if (!user.isActive) return c.json({ detail: 'Account is inactive' }, 403)

  c.set('user', user)
  await next()
})

export const requireVerified = createMiddleware<AppEnv>(async (c, next) => {
  await requireAuth(c, async () => {})
  const user = c.get('user')
  if (!user?.isVerified) return c.json({ detail: 'Email not verified' }, 403)
  await next()
})
