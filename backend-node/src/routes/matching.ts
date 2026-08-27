import { Hono } from 'hono'
import { eq, and, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { listings, users, listingSkills, skills, userSkills, reviews } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'
import { embedText, chatCompletion, parseJSON, requireAI } from '../lib/nim.js'
import type { AppEnv } from '../lib/types.js'

const app = new Hono<AppEnv>()

// Scoring weights — same as Python backend
const WEIGHTS = { vector: 0.55, reputation: 0.30, activity: 0.15 }

function reputationSignal(overallAvg: number, totalReviews: number): number {
  if (totalReviews === 0) return 0.5
  const confidence = Math.min(totalReviews / 10, 1.0)
  return Math.round((0.5 * (1 - confidence) + (overallAvg / 5) * confidence) * 10000) / 10000
}

function activitySignal(createdAt: Date, reviewCount: number): number {
  const daysOld = Math.max((Date.now() - createdAt.getTime()) / 86400000, 0)
  const recency = Math.max(0, 1 - daysOld / 180)
  const volume = Math.min(reviewCount / 20, 1.0)
  return Math.round((recency * 0.6 + volume * 0.4) * 10000) / 10000
}

function computeFinalScore(vector: number, reputation: number, activity: number): number {
  return Math.round(Math.min(WEIGHTS.vector * vector + WEIGHTS.reputation * reputation + WEIGHTS.activity * activity, 1.0) * 10000) / 10000
}

async function cosineSearch(table: 'listings' | 'users', embedding: number[], limit: number, filter: string): Promise<{ id: string; score: number }[]> {
  const vecStr = `[${embedding.join(',')}]`
  const result = await db.execute(sql.raw(`
    SELECT id, 1 - (embedding <=> '${vecStr}'::vector) AS score
    FROM ${table}
    WHERE embedding IS NOT NULL AND ${filter}
    ORDER BY embedding <=> '${vecStr}'::vector
    LIMIT ${limit}
  `))
  return (result as unknown as { id: string; score: number }[]).map(r => ({ id: r.id, score: Math.round(Number(r.score) * 10000) / 10000 }))
}

async function getAggregate(userId: string) {
  const [row] = await db.select({
    count: sql<number>`count(*)`,
    rel:   sql<number>`avg(${reviews.reliabilityScore})`,
    pro:   sql<number>`avg(${reviews.professionalismScore})`,
    gro:   sql<number>`avg(${reviews.growthScore})`,
  }).from(reviews).where(eq(reviews.revieweeId, userId))
  if (!Number(row.count)) return { totalReviews: 0, overallAvg: 0 }
  const rel = Number(row.rel), pro = Number(row.pro), gro = Number(row.gro)
  return { totalReviews: Number(row.count), overallAvg: Math.round(((rel + pro + gro) / 3) * 100) / 100 }
}

async function getUserEmbedding(userId: string): Promise<number[] | null> {
  const [u] = await db.execute(sql.raw(`SELECT embedding::text FROM users WHERE id = '${userId}'`)) as { embedding: string | null }[]
  if (!u?.embedding) return null
  return JSON.parse(u.embedding.replace(/^\[/, '[').replace(/\]$/, ']'))
}

async function ensureUserEmbedding(userId: string): Promise<number[]> {
  const existing = await getUserEmbedding(userId)
  if (existing) return existing

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  const skillNames = await db.select({ name: skills.name }).from(userSkills)
    .innerJoin(skills, eq(userSkills.skillId, skills.id)).where(eq(userSkills.userId, userId))

  const text = [user.firstName, user.lastName, user.headline ?? '', user.bio ?? '', user.university ?? '', user.role ?? '', skillNames.map(s => s.name).join(' ')].filter(Boolean).join(' ')
  const embedding = await embedText(text)
  await db.execute(sql.raw(`UPDATE users SET embedding = '[${embedding.join(',')}]'::vector WHERE id = '${userId}'`))
  return embedding
}

app.get('/', requireAuth, async c => {
  try { requireAI() } catch { return c.json({ detail: 'AI features not configured' }, 503) }

  const user = c.get('user')
  const limit = Math.min(50, Math.max(1, Number(c.req.query('limit') ?? 10)))
  const explain = c.req.query('explain') !== 'false'

  const embedding = await ensureUserEmbedding(user.id)
  const raw = await cosineSearch('listings', embedding, limit, 'is_active = true AND is_deleted = false')
  if (!raw.length) return c.json({ items: [], total: 0 })

  const scoreMap = Object.fromEntries(raw.map(r => [r.id, r.score]))
  const listingRows = await db.select().from(listings).where(sql`id = ANY(ARRAY[${sql.join(raw.map(r => sql`${r.id}`), sql`, `)}])`)
  const filtered = raw.map(r => listingRows.find(l => l.id === r.id)).filter(l => l && l.ownerId !== user.id) as typeof listingRows
  if (!filtered.length) return c.json({ items: [], total: 0 })

  // join owners
  const ownerIds = [...new Set(filtered.map(l => l.ownerId))]
  const ownerRows = await db.select().from(users).where(sql`id = ANY(ARRAY[${sql.join(ownerIds.map(id => sql`${id}`), sql`, `)}])`)
  const ownerMap = Object.fromEntries(ownerRows.map(u => [u.id, u]))

  // join skills
  const listingIds = filtered.map(l => l.id)
  const skillRows = await db.select({ listingId: listingSkills.listingId, id: skills.id, name: skills.name, category: skills.category })
    .from(listingSkills).innerJoin(skills, eq(listingSkills.skillId, skills.id))
    .where(sql`${listingSkills.listingId} = ANY(ARRAY[${sql.join(listingIds.map(id => sql`${id}`), sql`, `)}])`)
  const skillMap: Record<string, { id: string; name: string; category: string }[]> = {}
  for (const s of skillRows) {
    if (!skillMap[s.listingId]) skillMap[s.listingId] = []
    skillMap[s.listingId].push({ id: s.id, name: s.name, category: s.category })
  }

  let explanations: string[] = []
  if (explain && filtered.length) {
    const skillNames = await db.select({ name: skills.name }).from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.id)).where(eq(userSkills.userId, user.id))
    const items = filtered.map((l, i) => `${i + 1}. ${l.title}`).join('\n')
    const raw2 = await chatCompletion([{ role: 'user', content: `Student skills: ${skillNames.map(s => s.name).join(', ') || 'none'}\n\nListings:\n${items}\n\nFor each listing, write exactly one sentence explaining why it matches this student. Return a JSON array of ${filtered.length} strings in the same order. No explanation outside the JSON.` }], { temperature: 0.4, maxTokens: 600 })
    explanations = parseJSON(raw2, [])
  }

  const items = filtered.map((l, i) => {
    const owner = ownerMap[l.ownerId]
    return {
      score: scoreMap[l.id],
      explanation: explanations[i] ?? null,
      listing: {
        id: l.id, owner_id: l.ownerId, title: l.title, description: l.description,
        category: l.category, listing_type: l.listingType,
        price: l.price, price_min: l.priceMin, price_max: l.priceMax,
        delivery_days: l.deliveryDays, cover_image: l.coverImage,
        is_active: l.isActive, created_at: l.createdAt, updated_at: l.updatedAt,
        skills: skillMap[l.id] ?? [],
        owner: owner ? {
          id: owner.id, first_name: owner.firstName, last_name: owner.lastName,
          university: owner.university, headline: owner.headline,
          avatar_url: owner.avatarUrl, is_verified: owner.isVerified,
        } : null,
      },
    }
  })
  return c.json({ items, total: items.length })
})

app.post('/refresh', requireAuth, async c => {
  try { requireAI() } catch { return c.json({ detail: 'AI features not configured' }, 503) }
  const user = c.get('user')
  await db.execute(sql.raw(`UPDATE users SET embedding = NULL WHERE id = '${user.id}'`))
  await ensureUserEmbedding(user.id)
  return c.json({ refreshed: true })
})

export default app
