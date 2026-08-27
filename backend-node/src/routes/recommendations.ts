import { Hono } from 'hono'
import { eq, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { listings, users, reviews, userSkills, skills, listingSkills } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'
import { embedText, requireAI } from '../lib/nim.js'
import type { AppEnv } from '../lib/types.js'

const app = new Hono<AppEnv>()

const WEIGHTS = { vector: 0.55, reputation: 0.30, activity: 0.15 }

function reputationSignal(overallAvg: number, totalReviews: number) {
  if (totalReviews === 0) return 0.5
  const confidence = Math.min(totalReviews / 10, 1.0)
  return Math.round((0.5 * (1 - confidence) + (overallAvg / 5) * confidence) * 10000) / 10000
}

function activitySignal(createdAt: Date, reviewCount: number) {
  const daysOld = Math.max((Date.now() - createdAt.getTime()) / 86400000, 0)
  const recency = Math.max(0, 1 - daysOld / 180)
  return Math.round((recency * 0.6 + Math.min(reviewCount / 20, 1.0) * 0.4) * 10000) / 10000
}

function finalScore(v: number, r: number, a: number) {
  return Math.round(Math.min(WEIGHTS.vector * v + WEIGHTS.reputation * r + WEIGHTS.activity * a, 1.0) * 10000) / 10000
}

async function getAggregate(userId: string) {
  const [row] = await db.select({
    count: sql<number>`count(*)`,
    rel:   sql<number>`avg(${reviews.reliabilityScore})`,
    pro:   sql<number>`avg(${reviews.professionalismScore})`,
    gro:   sql<number>`avg(${reviews.growthScore})`,
  }).from(reviews).where(eq(reviews.revieweeId, userId))
  if (!Number(row.count)) return { total_reviews: 0, overall_avg: 0, avg_reliability: 0, avg_professionalism: 0, avg_growth: 0 }
  const rel = Number(row.rel), pro = Number(row.pro), gro = Number(row.gro)
  return {
    total_reviews: Number(row.count),
    overall_avg: Math.round(((rel + pro + gro) / 3) * 100) / 100,
    avg_reliability: rel, avg_professionalism: pro, avg_growth: gro,
  }
}

async function cosineSearch(table: string, embedding: number[], limit: number, filter: string) {
  const vecStr = `[${embedding.join(',')}]`
  const result = await db.execute(sql.raw(`SELECT id, 1 - (embedding <=> '${vecStr}'::vector) AS score FROM ${table} WHERE embedding IS NOT NULL AND ${filter} ORDER BY embedding <=> '${vecStr}'::vector LIMIT ${limit}`))
  return (result as unknown as { id: string; score: number }[]).map(r => ({ id: r.id, score: Math.round(Number(r.score) * 10000) / 10000 }))
}

async function ensureUserEmbedding(userId: string): Promise<number[]> {
  const [row] = await db.execute(sql.raw(`SELECT embedding::text FROM users WHERE id = '${userId}'`)) as { embedding: string | null }[]
  if (row?.embedding) return JSON.parse(row.embedding)
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  const skillNames = await db.select({ name: skills.name }).from(userSkills)
    .innerJoin(skills, eq(userSkills.skillId, skills.id)).where(eq(userSkills.userId, userId))
  const text = [user.firstName, user.lastName, user.headline ?? '', user.bio ?? '', user.university ?? '', user.role ?? '', skillNames.map(s => s.name).join(' ')].filter(Boolean).join(' ')
  const embedding = await embedText(text)
  await db.execute(sql.raw(`UPDATE users SET embedding = '[${embedding.join(',')}]'::vector WHERE id = '${userId}'`))
  return embedding
}

async function ensureListingEmbedding(listingId: string): Promise<number[]> {
  const [row] = await db.execute(sql.raw(`SELECT embedding::text FROM listings WHERE id = '${listingId}'`)) as { embedding: string | null }[]
  if (row?.embedding) return JSON.parse(row.embedding)
  const [listing] = await db.select().from(listings).where(eq(listings.id, listingId)).limit(1)
  const skillNames = await db.select({ name: skills.name }).from(listingSkills)
    .innerJoin(skills, eq(listingSkills.skillId, skills.id)).where(eq(listingSkills.listingId, listingId))
  const text = [listing.title, listing.description, listing.category, skillNames.map(s => s.name).join(' ')].filter(Boolean).join(' ')
  const embedding = await embedText(text)
  await db.execute(sql.raw(`UPDATE listings SET embedding = '[${embedding.join(',')}]'::vector WHERE id = '${listingId}'`))
  return embedding
}

// ── helpers to bulk-join owner + skills onto listings ─────────────────────────

async function attachListingDetails(listingRows: (typeof listings.$inferSelect)[]) {
  if (!listingRows.length) return []
  const ids = listingRows.map(l => l.id)
  const ownerIds = [...new Set(listingRows.map(l => l.ownerId))]

  const [ownerRows, skillRows] = await Promise.all([
    db.select().from(users).where(sql`id = ANY(ARRAY[${sql.join(ownerIds.map(id => sql`${id}`), sql`, `)}])`),
    db.select({ listingId: listingSkills.listingId, id: skills.id, name: skills.name, category: skills.category })
      .from(listingSkills).innerJoin(skills, eq(listingSkills.skillId, skills.id))
      .where(sql`${listingSkills.listingId} = ANY(ARRAY[${sql.join(ids.map(id => sql`${id}`), sql`, `)}])`),
  ])

  const ownerMap = Object.fromEntries(ownerRows.map(u => [u.id, u]))
  const skillMap: Record<string, { id: string; name: string; category: string }[]> = {}
  for (const s of skillRows) {
    if (!skillMap[s.listingId]) skillMap[s.listingId] = []
    skillMap[s.listingId].push({ id: s.id, name: s.name, category: s.category })
  }

  return listingRows.map(l => {
    const o = ownerMap[l.ownerId]
    return {
      id: l.id, owner_id: l.ownerId, title: l.title, description: l.description,
      category: l.category, listing_type: l.listingType,
      price: l.price, price_min: l.priceMin, price_max: l.priceMax,
      delivery_days: l.deliveryDays, cover_image: l.coverImage,
      is_active: l.isActive, created_at: l.createdAt, updated_at: l.updatedAt,
      skills: skillMap[l.id] ?? [],
      owner: o ? {
        id: o.id, first_name: o.firstName, last_name: o.lastName,
        university: o.university, headline: o.headline,
        avatar_url: o.avatarUrl, is_verified: o.isVerified,
      } : null,
    }
  })
}

async function attachStudentDetails(userRows: (typeof users.$inferSelect)[]) {
  if (!userRows.length) return []
  const ids = userRows.map(u => u.id)
  const skillRows = await db.select({ userId: userSkills.userId, id: skills.id, name: skills.name, category: skills.category })
    .from(userSkills).innerJoin(skills, eq(userSkills.skillId, skills.id))
    .where(sql`${userSkills.userId} = ANY(ARRAY[${sql.join(ids.map(id => sql`${id}`), sql`, `)}])`)
  const skillMap: Record<string, { id: string; name: string; category: string }[]> = {}
  for (const s of skillRows) {
    if (!skillMap[s.userId]) skillMap[s.userId] = []
    skillMap[s.userId].push({ id: s.id, name: s.name, category: s.category })
  }
  return userRows.map(u => ({
    id: u.id, first_name: u.firstName, last_name: u.lastName,
    university: u.university, headline: u.headline,
    avatar_url: u.avatarUrl, is_verified: u.isVerified,
    skills: skillMap[u.id] ?? [],
  }))
}

// ── routes ────────────────────────────────────────────────────────────────────

app.get('/listings', requireAuth, async c => {
  try { requireAI() } catch { return c.json({ detail: 'AI features not configured' }, 503) }
  const user = c.get('user')
  const limit = Math.min(50, Number(c.req.query('limit') ?? 10))

  const embedding = await ensureUserEmbedding(user.id)
  const raw = await cosineSearch('listings', embedding, limit * 3, 'is_active = true AND is_deleted = false')
  if (!raw.length) return c.json([])

  const scoreMap = Object.fromEntries(raw.map(r => [r.id, r.score]))
  const listingRows = await db.select().from(listings)
    .where(sql`id = ANY(ARRAY[${sql.join(raw.map(r => sql`${r.id}`), sql`, `)}])`)
  const filtered = raw.map(r => listingRows.find(l => l.id === r.id)).filter(l => l && l.ownerId !== user.id) as typeof listingRows

  const detailed = await attachListingDetails(filtered)
  const results = await Promise.all(detailed.map(async (l) => {
    const agg = await getAggregate(l.owner_id)
    const rep = reputationSignal(agg.overall_avg, agg.total_reviews)
    const act = activitySignal(new Date(l.created_at), agg.total_reviews)
    const fs  = finalScore(scoreMap[l.id], rep, act)
    return { listing: l, vector_score: scoreMap[l.id], reputation_score: rep, activity_score: act, final_score: fs }
  }))

  results.sort((a, b) => b.final_score - a.final_score)
  return c.json(results.slice(0, limit))
})

app.get('/students/:listingId', requireAuth, async c => {
  try { requireAI() } catch { return c.json({ detail: 'AI features not configured' }, 503) }
  const limit = Math.min(50, Number(c.req.query('limit') ?? 10))

  const [listing] = await db.select().from(listings).where(eq(listings.id, c.req.param('listingId'))).limit(1)
  if (!listing) return c.json({ detail: 'Listing not found' }, 404)

  const embedding = await ensureListingEmbedding(listing.id)
  const raw = await cosineSearch('users', embedding, limit * 3, 'is_active = true')
  if (!raw.length) return c.json([])

  const scoreMap = Object.fromEntries(raw.map(r => [r.id, r.score]))
  const userRows = await db.select().from(users)
    .where(sql`id = ANY(ARRAY[${sql.join(raw.map(r => sql`${r.id}`), sql`, `)}])`)
  const filtered = raw.map(r => userRows.find(u => u.id === r.id)).filter(u => u && u.id !== listing.ownerId) as typeof userRows

  const detailed = await attachStudentDetails(filtered)
  const results = await Promise.all(detailed.map(async (s) => {
    const agg = await getAggregate(s.id)
    const rep = reputationSignal(agg.overall_avg, agg.total_reviews)
    const act = activitySignal(new Date(filtered.find(u => u.id === s.id)!.createdAt), agg.total_reviews)
    const fs  = finalScore(scoreMap[s.id], rep, act)
    return { student: s, vector_score: scoreMap[s.id], reputation_score: rep, activity_score: act, final_score: fs, scores: agg }
  }))

  results.sort((a, b) => b.final_score - a.final_score)
  return c.json(results.slice(0, limit))
})

app.get('/feed', requireAuth, async c => {
  try { requireAI() } catch { return c.json({ detail: 'AI features not configured' }, 503) }
  const user = c.get('user')
  const auth = c.req.header('Authorization') ?? ''
  const base = `http://localhost:${process.env.PORT ?? 8000}/api/v1`

  const [recommended_listings, recommended_students] = await Promise.all([
    fetch(`${base}/recommendations/listings?limit=6`, { headers: { Authorization: auth } })
      .then(r => r.json()).catch(() => []),
    (async () => {
      const [latest] = await db.select().from(listings)
        .where(eq(listings.ownerId, user.id)).orderBy(sql`created_at desc`).limit(1)
      if (!latest || latest.isDeleted) return []
      return fetch(`${base}/recommendations/students/${latest.id}?limit=6`, { headers: { Authorization: auth } })
        .then(r => r.json()).catch(() => [])
    })(),
  ])

  return c.json({ recommended_listings, recommended_students })
})

export default app
