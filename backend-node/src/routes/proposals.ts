import { Hono } from 'hono'
import type { AppEnv } from '../lib/types.js'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { proposals, listings, notifications, users, userSkills, skills } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'
import { wsManager } from '../lib/ws.js'
import { chatCompletion, parseJSON, requireAI } from '../lib/nim.js'

const app = new Hono<AppEnv>()

function fmt(p: typeof proposals.$inferSelect) {
  return {
    id: p.id, owner_id: p.ownerId, listing_id: p.listingId, status: p.status,
    intro: p.intro, understanding: p.understanding, plan: p.plan,
    timeline: p.timeline, pricing: p.pricing,
    created_at: p.createdAt, updated_at: p.updatedAt,
  }
}

app.get('/', requireAuth, async c => {
  const user = c.get('user')
  const rows = await db.select().from(proposals)
    .where(eq(proposals.ownerId, user.id)).orderBy(desc(proposals.updatedAt))
  return c.json(rows.map(fmt))
})

app.get('/:id', requireAuth, async c => {
  const user = c.get('user')
  const [proposal] = await db.select().from(proposals)
    .where(and(eq(proposals.id, c.req.param('id')), eq(proposals.ownerId, user.id))).limit(1)
  if (!proposal) return c.json({ detail: 'Proposal not found' }, 404)
  return c.json(fmt(proposal))
})

app.post('/generate', requireAuth, async c => {
  try { requireAI() } catch { return c.json({ detail: 'AI features not configured' }, 503) }
  const user = c.get('user')
  const { listing_id } = await c.req.json()
  if (!listing_id) return c.json({ detail: 'listing_id is required' }, 400)

  const [listing] = await db.select().from(listings)
    .where(and(eq(listings.id, listing_id), eq(listings.isDeleted, false))).limit(1)
  if (!listing) return c.json({ detail: 'Listing not found' }, 404)
  if (listing.ownerId === user.id) return c.json({ detail: 'Cannot write a proposal for your own listing' }, 400)

  // check for existing
  const [existing] = await db.select().from(proposals)
    .where(and(eq(proposals.ownerId, user.id), eq(proposals.listingId, listing_id))).limit(1)
  if (existing) return c.json(fmt(existing))

  const skillNames = await db.select({ name: skills.name }).from(userSkills)
    .innerJoin(skills, eq(userSkills.skillId, skills.id)).where(eq(userSkills.userId, user.id))

  const context = `Student: ${user.firstName} ${user.lastName}\nUniversity: ${user.university ?? 'N/A'}\nSkills: ${skillNames.map(s => s.name).join(', ') || 'none'}\nBio: ${user.bio ?? 'N/A'}\n\nListing title: ${listing.title}\nListing description: ${listing.description}\nCategory: ${listing.category}`

  const raw = await chatCompletion([{ role: 'user', content: `${context}\n\nWrite a professional proposal for this listing. Return a JSON object with exactly these keys: {"intro": string, "understanding": string, "plan": string, "timeline": string, "pricing": string}. Each value should be 2-4 sentences. No explanation outside the JSON.` }], { temperature: 0.5, maxTokens: 1200 })
  const generated = parseJSON(raw, { intro: '', understanding: '', plan: '', timeline: '', pricing: '' })

  const [proposal] = await db.insert(proposals).values({
    ownerId: user.id, listingId: listing_id, status: 'draft',
    intro: generated.intro ?? '',
    understanding: generated.understanding ?? '',
    plan: generated.plan ?? '',
    timeline: generated.timeline ?? '',
    pricing: generated.pricing ?? '',
  }).returning()

  return c.json(fmt(proposal), 201)
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
    intro: intro ?? '', understanding: understanding ?? '',
    plan: plan ?? '', timeline: timeline ?? '', pricing: pricing ?? '',
  }).returning()
  return c.json(fmt(proposal), 201)
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
  return c.json(fmt(updated))
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

  return c.json(fmt(updated))
})

export default app
