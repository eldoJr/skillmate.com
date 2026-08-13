import { Hono } from 'hono'
import type { AppEnv } from '../lib/types.js'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { portfolios } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'
import { writeFile, unlink } from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const app = new Hono<AppEnv>()
const MEDIA_DIR = 'media/portfolio'
const ALLOWED   = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_SIZE  = 8 * 1024 * 1024

app.post('/', requireAuth, async c => {
  const user = c.get('user')
  const { title, summary, impact_statement, technologies, project_url } = await c.req.json()
  const [entry] = await db.insert(portfolios).values({
    userId: user.id, title, summary, impactStatement: impact_statement,
    technologies: technologies ? JSON.stringify(technologies) : null, projectUrl: project_url,
  }).returning()
  return c.json({ ...entry, technologies: entry.technologies ? JSON.parse(entry.technologies) : null }, 201)
})

app.get('/user/:userId', async c => {
  const rows = await db.select().from(portfolios)
    .where(eq(portfolios.userId, c.req.param('userId'))).orderBy(desc(portfolios.createdAt))
  return c.json(rows.map(e => ({ ...e, technologies: e.technologies ? JSON.parse(e.technologies) : null })))
})

app.get('/:id', async c => {
  const [entry] = await db.select().from(portfolios).where(eq(portfolios.id, c.req.param('id'))).limit(1)
  if (!entry) return c.json({ detail: 'Portfolio entry not found' }, 404)
  return c.json({ ...entry, technologies: entry.technologies ? JSON.parse(entry.technologies) : null })
})

app.patch('/:id', requireAuth, async c => {
  const user = c.get('user')
  const [entry] = await db.select().from(portfolios).where(eq(portfolios.id, c.req.param('id'))).limit(1)
  if (!entry) return c.json({ detail: 'Portfolio entry not found' }, 404)
  if (entry.userId !== user.id) return c.json({ detail: 'Not your portfolio entry' }, 403)

  const body = await c.req.json()
  const update: Record<string, unknown> = { updatedAt: new Date() }
  if ('title' in body)            update.title           = body.title
  if ('summary' in body)          update.summary         = body.summary
  if ('impact_statement' in body) update.impactStatement = body.impact_statement
  if ('technologies' in body)     update.technologies    = body.technologies ? JSON.stringify(body.technologies) : null
  if ('project_url' in body)      update.projectUrl      = body.project_url

  const [updated] = await db.update(portfolios).set(update).where(eq(portfolios.id, entry.id)).returning()
  return c.json({ ...updated, technologies: updated.technologies ? JSON.parse(updated.technologies) : null })
})

app.delete('/:id', requireAuth, async c => {
  const user = c.get('user')
  const [entry] = await db.select().from(portfolios).where(eq(portfolios.id, c.req.param('id'))).limit(1)
  if (!entry) return c.json({ detail: 'Portfolio entry not found' }, 404)
  if (entry.userId !== user.id) return c.json({ detail: 'Not your portfolio entry' }, 403)
  await db.delete(portfolios).where(eq(portfolios.id, entry.id))
  return c.body(null, 204)
})

app.post('/:id/image', requireAuth, async c => {
  const user = c.get('user')
  const [entry] = await db.select().from(portfolios).where(eq(portfolios.id, c.req.param('id'))).limit(1)
  if (!entry) return c.json({ detail: 'Portfolio entry not found' }, 404)
  if (entry.userId !== user.id) return c.json({ detail: 'Not your portfolio entry' }, 403)

  const body = await c.req.parseBody()
  const file = body['file'] as File
  if (!file) return c.json({ detail: 'No file provided' }, 400)
  if (!ALLOWED.has(file.type)) return c.json({ detail: 'Invalid image type' }, 400)
  const buf = await file.arrayBuffer()
  if (buf.byteLength > MAX_SIZE) return c.json({ detail: 'Image exceeds 8MB' }, 400)

  if (!existsSync(MEDIA_DIR)) mkdirSync(MEDIA_DIR, { recursive: true })
  if (entry.imageUrl) {
    const old = entry.imageUrl.replace(/^\//, '')
    if (existsSync(old)) await unlink(old).catch(() => {})
  }

  const ext      = file.name.split('.').pop()
  const filename = `${uuidv4()}.${ext}`
  await writeFile(path.join(MEDIA_DIR, filename), Buffer.from(buf))

  const imageUrl = `/media/portfolio/${filename}`
  await db.update(portfolios).set({ imageUrl }).where(eq(portfolios.id, entry.id))
  return c.json({ image_url: imageUrl })
})

export default app
