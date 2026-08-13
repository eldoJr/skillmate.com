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
  if (!Number(row.count)) return { totalReviews: 0, overallAvg: 0, avgReliability: 0, avgProfessionalism: 0, avgGrowth: 0 }
  const rel = Number(row.rel), pro = Number(row.pro), gro = Number(row.gro)
  return { totalReviews: Number(row.count), overallAvg: Math.round(((rel + pro + gro) / 3) * 100) / 100, avgReliability: rel, avgProfessionalism: pro, avgGrowth: gro }
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

app.get('/listings', requireAuth, async c => {
  try { requireAI() } catch { return c.json({ detail: 'AI features not configured' }, 503) }
  const user = c.get('user')
  const limit = Math.min(50, Number(c.req.query('limit') ?? 10))

  const embedding = await ensureUserEmbedding(user.id)
  const raw = await cosineSearch('listings', embedding, limit * 3, 'is_active = true AND is_deleted = false')
  if (!raw.length) return c.json([])

  const scoreMap = Object.fromEntries(raw.map(r => [r.id, r.score]))
  const listingRows = await db.select().from(listings).where(sql`id = ANY(ARRAY[${sql.join(raw.map(r => sql`${r.id}`), sql`, `)}])`)

  const results = []
  for (const r of raw) {
    const listing = listingRows.find(l => l.id === r.id)
    if (!listing || listing.ownerId === user.id) continue
    const agg = await getAggregate(listing.ownerId)
    const rep = reputationSignal(agg.overallAvg, agg.totalReviews)
    const act = activitySignal(listing.createdAt, agg.totalReviews)
    results.push({ listing, vectorScore: scoreMap[r.id], reputationScore: rep, activityScore: act, finalScore: finalScore(scoreMap[r.id], rep, act) })
  }

  results.sort((a, b) => b.finalScore - a.finalScore)
  return c.json(results.slice(0, limit))
})

app.get('/students/:listingId', requireAuth, async c => {
  try { requireAI() } catch { return c.json({ detail: 'AI features not configured' }, 503) }
  const limit = Math.min(50, Number(c.req.query('limit') ?? 10))

  const embedding = await ensureListingEmbedding(c.req.param('listingId'))
  const [listing] = await db.select().from(listings).where(eq(listings.id, c.req.param('listingId'))).limit(1)
  if (!listing) return c.json({ detail: 'Listing not found' }, 404)

  const raw = await cosineSearch('users', embedding, limit * 3, 'is_active = true')
  if (!raw.length) return c.json([])

  const scoreMap = Object.fromEntries(raw.map(r => [r.id, r.score]))
  const userRows = await db.select().from(users).where(sql`id = ANY(ARRAY[${sql.join(raw.map(r => sql`${r.id}`), sql`, `)}])`)

  const results = []
  for (const r of raw) {
    const student = userRows.find(u => u.id === r.id)
    if (!student || student.id === listing.ownerId) continue
    const agg = await getAggregate(student.id)
    const rep = reputationSignal(agg.overallAvg, agg.totalReviews)
    const act = activitySignal(student.createdAt, agg.totalReviews)
    const { hashedPassword, verificationToken, verificationTokenExpiresAt, resetToken, resetTokenExpiresAt, ...pub } = student
    results.push({ student: pub, vectorScore: scoreMap[r.id], reputationScore: rep, activityScore: act, finalScore: finalScore(scoreMap[r.id], rep, act), scores: agg })
  }

  results.sort((a, b) => b.finalScore - a.finalScore)
  return c.json(results.slice(0, limit))
})

app.get('/feed', requireAuth, async c => {
  try { requireAI() } catch { return c.json({ detail: 'AI features not configured' }, 503) }
  const user = c.get('user')

  const [recListings, recStudents] = await Promise.all([
    fetch(`http://localhost:${process.env.PORT ?? 8000}/api/v1/recommendations/listings?limit=6`, {
      headers: { Authorization: c.req.header('Authorization') ?? '' },
    }).then(r => r.json()).catch(() => []),
    (async () => {
      const [latestListing] = await db.select().from(listings)
        .where(eq(listings.ownerId, user.id)).orderBy(sql`created_at desc`).limit(1)
      if (!latestListing || latestListing.isDeleted) return []
      return fetch(`http://localhost:${process.env.PORT ?? 8000}/api/v1/recommendations/students/${latestListing.id}?limit=6`, {
        headers: { Authorization: c.req.header('Authorization') ?? '' },
      }).then(r => r.json()).catch(() => [])
    })(),
  ])

  return c.json({ recommendedListings: recListings, recommendedStudents: recStudents })
})

export default app
