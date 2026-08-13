import { Hono } from 'hono'
import type { AppEnv } from '../lib/types.js'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { proposals, listings, notifications } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'
import { wsManager } from '../lib/ws.js'

const app = new Hono<AppEnv>()

app.get('/', requireAuth, async c => {
  const user = c.get('user')
  const rows = await db.select().from(proposals)
    .where(eq(proposals.ownerId, user.id)).orderBy(desc(proposals.updatedAt))
  return c.json(rows)
})

app.get('/:id', requireAuth, async c => {
  const user = c.get('user')
  const [proposal] = await db.select().from(proposals)
    .where(and(eq(proposals.id, c.req.param('id')), eq(proposals.ownerId, user.id))).limit(1)
  if (!proposal) return c.json({ detail: 'Proposal not found' }, 404)
  return c.json(proposal)
})

app.post('/', requireAuth, async c => {
  const user = c.get('user')
  const { listing_id, intro, understanding, plan, timeline, pricing } = await c.req.json()

  const [listing] = await db.select().from(listings)
    .where(and(eq(listings.id, listing_id), eq(listings.isDeleted, false))).limit(1)
  if (!listing) return c.json({ detail: 'Listing not found' }, 404)
  if (listing.ownerId === user.id) return c.json({ detail: 'Cannot write a proposal for your own listing' }, 400)

  const [proposal] = await db.insert(proposals).values({
    ownerId: user.id, listingId: listing_id, status: 'draft',
    intro, understanding, plan, timeline, pricing,
  }).returning()
  return c.json(proposal, 201)
})

app.patch('/:id', requireAuth, async c => {
  const user = c.get('user')
  const [proposal] = await db.select().from(proposals)
    .where(and(eq(proposals.id, c.req.param('id')), eq(proposals.ownerId, user.id))).limit(1)
  if (!proposal) return c.json({ detail: 'Proposal not found' }, 404)
  if (proposal.status !== 'draft') return c.json({ detail: 'Only draft proposals can be edited' }, 400)

  const body = await c.req.json()
  const update: Record<string, unknown> = { updatedAt: new Date() }
  for (const f of ['intro', 'understanding', 'plan', 'timeline', 'pricing']) if (f in body) update[f] = body[f]

  const [updated] = await db.update(proposals).set(update).where(eq(proposals.id, proposal.id)).returning()
  return c.json(updated)
})

app.post('/:id/send', requireAuth, async c => {
  const user = c.get('user')
  const [proposal] = await db.select().from(proposals)
    .where(and(eq(proposals.id, c.req.param('id')), eq(proposals.ownerId, user.id))).limit(1)
  if (!proposal) return c.json({ detail: 'Proposal not found' }, 404)
  if (proposal.status !== 'draft') return c.json({ detail: 'Proposal has already been sent' }, 400)

  const [listing] = await db.select().from(listings).where(eq(listings.id, proposal.listingId)).limit(1)
  const [updated] = await db.update(proposals).set({ status: 'sent', updatedAt: new Date() }).where(eq(proposals.id, proposal.id)).returning()

  const [notif] = await db.insert(notifications).values({
    userId: listing.ownerId, type: 'new_proposal',
    title: `${user.firstName} sent a proposal for "${listing.title}"`,
  }).returning()
  wsManager.send(listing.ownerId, { event: 'notification', data: notif })

  return c.json(updated)
})

export default app
