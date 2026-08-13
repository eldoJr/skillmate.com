import { Hono } from 'hono'
import type { AppEnv } from '../lib/types.js'
import { eq, and, ilike, sql, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { skills } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'

const app = new Hono<AppEnv>()

app.get('/', async c => {
  const rows = await db.select().from(skills).orderBy(skills.category, skills.name)
  const grouped: Record<string, typeof rows> = {}
  for (const s of rows) {
    if (!grouped[s.category]) grouped[s.category] = []
    grouped[s.category].push(s)
  }
  return c.json(Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => ({ category, skills: items })))
})

app.get('/category/:category', async c => {
  const rows = await db.select().from(skills).where(ilike(skills.category, c.req.param('category'))).orderBy(skills.name)
  return c.json(rows)
})

app.post('/', requireAuth, async c => {
  const { name, category } = await c.req.json()
  const [existing] = await db.select().from(skills).where(ilike(skills.name, name.trim())).limit(1)
  if (existing) return c.json(existing)
  const [skill] = await db.insert(skills).values({ name: name.trim(), category: category.trim() }).returning()
  return c.json(skill, 201)
})

app.post('/seed', async c => {
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(skills)
  if (Number(count) > 0) return c.json({ message: `Skills already seeded (${count} records)` })
  // Redirect to seed script — run `npm run db:seed` instead
  return c.json({ message: 'Run `npm run db:seed` to seed skills' })
})

export default app
