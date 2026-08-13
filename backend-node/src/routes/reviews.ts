import { Hono } from 'hono'
import type { AppEnv } from '../lib/types.js'
import { eq, and, sql, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { reviews, users, notifications } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'
import { wsManager } from '../lib/ws.js'

const app = new Hono<AppEnv>()

app.post('/', requireAuth, async c => {
  const reviewer = c.get('user')
  const body = await c.req.json()
  const { reviewee_id, listing_id, reliability_score, professionalism_score, growth_score, comment } = body

  if (reviewer.id === reviewee_id) return c.json({ detail: 'Cannot review yourself' }, 400)
  const [reviewee] = await db.select().from(users).where(eq(users.id, reviewee_id)).limit(1)
  if (!reviewee) return c.json({ detail: 'User not found' }, 404)

  if (listing_id) {
    const [existing] = await db.select().from(reviews)
      .where(and(eq(reviews.reviewerId, reviewer.id), eq(reviews.listingId, listing_id))).limit(1)
    if (existing) return c.json({ detail: 'You have already reviewed this listing' }, 409)
  }

  const [review] = await db.insert(reviews).values({
    reviewerId: reviewer.id, revieweeId: reviewee_id, listingId: listing_id ?? null,
    reliabilityScore: reliability_score, professionalismScore: professionalism_score,
    growthScore: growth_score, comment,
  }).returning()

  const [notif] = await db.insert(notifications).values({
    userId: reviewee_id, type: 'new_review',
    title: `${reviewer.firstName} left you a review`,
  }).returning()
  wsManager.send(reviewee_id, { event: 'notification', data: notif })

  return c.json(review, 201)
})

app.get('/user/:userId', async c => {
  const userId   = c.req.param('userId')
  const page     = Math.max(1, Number(c.req.query('page') ?? 1))
  const pageSize = Math.min(50, Number(c.req.query('page_size') ?? 10))

  const rows = await db.select().from(reviews).where(eq(reviews.revieweeId, userId))
    .orderBy(desc(reviews.createdAt)).limit(pageSize).offset((page - 1) * pageSize)
  const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(reviews).where(eq(reviews.revieweeId, userId))

  return c.json({ items: rows, total: Number(total), page, pages: Math.ceil(Number(total) / pageSize) })
})

app.get('/user/:userId/aggregate', async c => {
  const userId = c.req.param('userId')
  const [row] = await db.select({
    count: sql<number>`count(*)`,
    rel:   sql<number>`avg(${reviews.reliabilityScore})`,
    pro:   sql<number>`avg(${reviews.professionalismScore})`,
    gro:   sql<number>`avg(${reviews.growthScore})`,
  }).from(reviews).where(eq(reviews.revieweeId, userId))

  if (!Number(row.count)) return c.json({ total_reviews: 0, avg_reliability: 0, avg_professionalism: 0, avg_growth: 0, overall_avg: 0 })
  const rel = Math.round(Number(row.rel) * 100) / 100
  const pro = Math.round(Number(row.pro) * 100) / 100
  const gro = Math.round(Number(row.gro) * 100) / 100
  return c.json({ total_reviews: Number(row.count), avg_reliability: rel, avg_professionalism: pro, avg_growth: gro, overall_avg: Math.round(((rel + pro + gro) / 3) * 100) / 100 })
})

export default app
