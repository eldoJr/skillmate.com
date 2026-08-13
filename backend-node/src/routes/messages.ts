import { Hono } from 'hono'
import type { AppEnv } from '../lib/types.js'
import { eq, and, or, sql, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { messages, users, notifications } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'
import { wsManager } from '../lib/ws.js'
import { v4 as uuidv4 } from 'uuid'

const app = new Hono<AppEnv>()

function userBrief(u: typeof users.$inferSelect) {
  return { id: u.id, first_name: u.firstName, last_name: u.lastName, avatar_url: u.avatarUrl }
}

function serializeMsg(m: typeof messages.$inferSelect) {
  return {
    id:          m.id,
    senderId:    m.senderId,
    receiverId:  m.receiverId,
    content:     m.content,
    isRead:      m.isRead,
    createdAt:   m.createdAt,
  }
}

app.post('/', requireAuth, async c => {
  const sender = c.get('user')
  const { receiver_id, content } = await c.req.json()

  if (sender.id === receiver_id) return c.json({ detail: 'Cannot message yourself' }, 400)
  const [receiver] = await db.select().from(users).where(eq(users.id, receiver_id)).limit(1)
  if (!receiver) return c.json({ detail: 'User not found' }, 404)

  const [msg] = await db.insert(messages).values({ senderId: sender.id, receiverId: receiver_id, content }).returning()

  // Notify receiver
  const [notif] = await db.insert(notifications).values({
    userId: receiver_id, type: 'new_message',
    title: `New message from ${sender.firstName}`, body: content.slice(0, 100),
  }).returning()
  wsManager.send(receiver_id, { event: 'new_message', data: serializeMsg(msg) })
  wsManager.send(receiver_id, { event: 'notification', data: notif })

  return c.json(serializeMsg(msg), 201)
})

app.get('/conversations', requireAuth, async c => {
  const user = c.get('user')

  const sentIds    = await db.selectDistinct({ id: messages.receiverId }).from(messages).where(eq(messages.senderId, user.id))
  const receivedIds = await db.selectDistinct({ id: messages.senderId }).from(messages).where(eq(messages.receiverId, user.id))
  const partnerIds = [...new Set([...sentIds.map(r => r.id), ...receivedIds.map(r => r.id)])]

  const convos = await Promise.all(partnerIds.map(async pid => {
    const [partner] = await db.select().from(users).where(eq(users.id, pid)).limit(1)
    if (!partner) return null

    const [last] = await db.select().from(messages).where(
      or(and(eq(messages.senderId, user.id), eq(messages.receiverId, pid)),
         and(eq(messages.senderId, pid), eq(messages.receiverId, user.id)))!
    ).orderBy(desc(messages.createdAt)).limit(1)

    const [{ unread }] = await db.select({ unread: sql<number>`count(*)` }).from(messages)
      .where(and(eq(messages.senderId, pid), eq(messages.receiverId, user.id), eq(messages.isRead, false)))

    return { partner: userBrief(partner), last_message: last?.content ?? '', last_message_at: last?.createdAt?.toISOString() ?? new Date().toISOString(), unread_count: Number(unread) }
  }))

  return c.json(convos.filter(Boolean).sort((a, b) => new Date(b!.last_message_at!).getTime() - new Date(a!.last_message_at!).getTime()))
})

app.get('/thread/:partnerId', requireAuth, async c => {
  const user      = c.get('user')
  const partnerId = c.req.param('partnerId')
  const page      = Math.max(1, Number(c.req.query('page') ?? 1))
  const pageSize  = Math.min(100, Number(c.req.query('page_size') ?? 20))

  const rows = await db.select().from(messages).where(
    or(and(eq(messages.senderId, user.id), eq(messages.receiverId, partnerId)),
       and(eq(messages.senderId, partnerId), eq(messages.receiverId, user.id)))!
  ).orderBy(desc(messages.createdAt)).limit(pageSize).offset((page - 1) * pageSize)

  return c.json(rows.map(serializeMsg))
})

app.post('/thread/:partnerId/read', requireAuth, async c => {
  const user      = c.get('user')
  const partnerId = c.req.param('partnerId')
  await db.update(messages).set({ isRead: true })
    .where(and(eq(messages.senderId, partnerId), eq(messages.receiverId, user.id), eq(messages.isRead, false)))
  return c.body(null, 204)
})

app.get('/unread', requireAuth, async c => {
  const user = c.get('user')
  const [{ unread }] = await db.select({ unread: sql<number>`count(*)` }).from(messages)
    .where(and(eq(messages.receiverId, user.id), eq(messages.isRead, false)))
  return c.json({ unread: Number(unread) })
})

export default app
