import { Hono } from 'hono'
import type { AppEnv } from '../lib/types.js'
import { eq, and, sql, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { notifications } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'

const app = new Hono<AppEnv>()

app.get('/', requireAuth, async c => {
  const user     = c.get('user')
  const page     = Math.max(1, Number(c.req.query('page') ?? 1))
  const pageSize = Math.min(50, Number(c.req.query('page_size') ?? 20))

  const rows = await db.select().from(notifications).where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt)).limit(pageSize).offset((page - 1) * pageSize)
  const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(notifications).where(eq(notifications.userId, user.id))

  const items = rows.map(n => ({
    id: n.id, type: n.type, title: n.title, body: n.body,
    is_read: n.isRead, created_at: n.createdAt,
  }))
  return c.json({ items, total: Number(total), page, pages: Math.ceil(Number(total) / pageSize) })
})

app.get('/unread', requireAuth, async c => {
  const user = c.get('user')
  const [{ unread }] = await db.select({ unread: sql<number>`count(*)` }).from(notifications)
    .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)))
  return c.json({ unread: Number(unread) })
})

app.post('/:id/read', requireAuth, async c => {
  const user = c.get('user')
  await db.update(notifications).set({ isRead: true })
    .where(and(eq(notifications.id, c.req.param('id')), eq(notifications.userId, user.id)))
  return c.body(null, 204)
})

app.post('/read-all', requireAuth, async c => {
  const user = c.get('user')
  await db.update(notifications).set({ isRead: true })
    .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)))
  return c.body(null, 204)
})

export default app
