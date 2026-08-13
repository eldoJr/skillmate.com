import { Hono } from 'hono'
import type { AppEnv } from '../lib/types.js'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { certificates } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'

const app = new Hono<AppEnv>()

app.get('/', requireAuth, async c => {
  const user = c.get('user')
  const rows = await db.select().from(certificates)
    .where(eq(certificates.userId, user.id)).orderBy(desc(certificates.issueDate))
  return c.json(rows)
})

app.get('/user/:userId', async c => {
  const rows = await db.select().from(certificates)
    .where(eq(certificates.userId, c.req.param('userId'))).orderBy(desc(certificates.issueDate))
  return c.json(rows)
})

app.post('/', requireAuth, async c => {
  const user = c.get('user')
  const { title, issuer, issue_date, expiry_date, credential_id, credential_url, description } = await c.req.json()
  const [cert] = await db.insert(certificates).values({
    userId: user.id, title, issuer, issueDate: issue_date,
    expiryDate: expiry_date ?? null, credentialId: credential_id ?? null,
    credentialUrl: credential_url ?? null, description: description ?? null,
  }).returning()
  return c.json(cert, 201)
})

app.patch('/:id', requireAuth, async c => {
  const user = c.get('user')
  const [cert] = await db.select().from(certificates)
    .where(and(eq(certificates.id, c.req.param('id')), eq(certificates.userId, user.id))).limit(1)
  if (!cert) return c.json({ detail: 'Certificate not found' }, 404)

  const body = await c.req.json()
  const update: Record<string, unknown> = { updatedAt: new Date() }
  const fields = ['title', 'issuer', 'issue_date', 'expiry_date', 'credential_id', 'credential_url', 'description']
  const map: Record<string, string> = { issue_date: 'issueDate', expiry_date: 'expiryDate', credential_id: 'credentialId', credential_url: 'credentialUrl' }
  for (const f of fields) if (f in body) update[map[f] ?? f] = body[f]

  const [updated] = await db.update(certificates).set(update).where(eq(certificates.id, cert.id)).returning()
  return c.json(updated)
})

app.delete('/:id', requireAuth, async c => {
  const user = c.get('user')
  const [cert] = await db.select().from(certificates)
    .where(and(eq(certificates.id, c.req.param('id')), eq(certificates.userId, user.id))).limit(1)
  if (!cert) return c.json({ detail: 'Certificate not found' }, 404)
  await db.delete(certificates).where(eq(certificates.id, cert.id))
  return c.json({ message: 'Certificate deleted' })
})

export default app
