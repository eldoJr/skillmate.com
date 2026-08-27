import { Hono } from 'hono'
import type { AppEnv } from '../lib/types.js'
import { eq, sql, and, inArray } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users, userSkills, skills, userActivities, reviews, listings, portfolios } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'
import { writeFile, unlink } from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { serializeUser } from '../lib/serialize.js'

const app = new Hono<AppEnv>()
const AVATAR_DIR = 'media/avatars'
const COVER_DIR  = 'media/covers'
const ALLOWED    = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_SIZE   = 5 * 1024 * 1024

function stripSensitive(u: typeof users.$inferSelect) {
  return serializeUser(u)
}

async function withSkills(userId: string) {
  const rows = await db.select({ skill: skills }).from(userSkills)
    .innerJoin(skills, eq(userSkills.skillId, skills.id))
    .where(eq(userSkills.userId, userId))
  return rows.map(r => r.skill)
}

app.get('/me', requireAuth, async c => {
  const user = c.get('user')
  return c.json(serializeUser(user, await withSkills(user.id)))
})

app.patch('/me', requireAuth, async c => {
  const user = c.get('user')
  const body = await c.req.json()
  // accept both camelCase and snake_case from frontend
  const map: Record<string, string> = {
    firstName: 'firstName', first_name: 'firstName',
    lastName: 'lastName',   last_name: 'lastName',
    university: 'university', role: 'role', headline: 'headline', bio: 'bio',
    portfolioUrl: 'portfolioUrl', portfolio_url: 'portfolioUrl',
    githubUsername: 'githubUsername', github_username: 'githubUsername',
    location: 'location',
  }
  const update: Record<string, unknown> = { updatedAt: new Date() }
  for (const [k, v] of Object.entries(body)) if (map[k]) update[map[k]] = v

  const [updated] = await db.update(users).set(update).where(eq(users.id, user.id)).returning()
  return c.json(serializeUser(updated, await withSkills(user.id)))
})

app.get('/me/completion', requireAuth, async c => {
  const user = c.get('user')
  const userWithSkills = await withSkills(user.id)
  const checks: Record<string, unknown> = {
    headline: user.headline, bio: user.bio, university: user.university,
    role: user.role, avatar: user.avatarUrl, portfolio_url: user.portfolioUrl,
    skills: userWithSkills.length > 0,
  }
  const completed = Object.entries(checks).filter(([, v]) => v).map(([k]) => k)
  const missing   = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k)
  return c.json({ score: Math.round((completed.length / Object.keys(checks).length) * 100), missing })
})

app.post('/me/avatar', requireAuth, async c => {
  const user = c.get('user')
  const body = await c.req.parseBody()
  const file = body['file'] as File
  if (!file) return c.json({ detail: 'No file provided' }, 400)
  if (!ALLOWED.has(file.type)) return c.json({ detail: 'Only JPEG, PNG, and WebP allowed' }, 400)

  const buf = await file.arrayBuffer()
  if (buf.byteLength > MAX_SIZE) return c.json({ detail: 'Image must be under 5MB' }, 400)

  if (!existsSync(AVATAR_DIR)) mkdirSync(AVATAR_DIR, { recursive: true })
  if (user.avatarUrl) {
    const old = user.avatarUrl.replace(/^\//, '')
    if (existsSync(old)) await unlink(old).catch(() => {})
  }

  const ext      = file.type.split('/')[1]
  const filename = `${user.id}_${uuidv4().replace(/-/g, '')}.${ext}`
  await writeFile(path.join(AVATAR_DIR, filename), Buffer.from(buf))

  const avatarUrl = `/media/avatars/${filename}`
  await db.update(users).set({ avatarUrl, updatedAt: new Date() }).where(eq(users.id, user.id))
  return c.json({ avatar_url: avatarUrl })
})

app.post('/me/cover', requireAuth, async c => {
  const user = c.get('user')
  const body = await c.req.parseBody()
  const file = body['file'] as File
  if (!file) return c.json({ detail: 'No file provided' }, 400)
  if (!ALLOWED.has(file.type)) return c.json({ detail: 'Only JPEG, PNG, and WebP allowed' }, 400)

  const buf = await file.arrayBuffer()
  if (buf.byteLength > MAX_SIZE) return c.json({ detail: 'Image must be under 5MB' }, 400)

  if (!existsSync(COVER_DIR)) mkdirSync(COVER_DIR, { recursive: true })
  if (user.coverUrl) {
    const old = user.coverUrl.replace(/^\//, '')
    if (existsSync(old)) await unlink(old).catch(() => {})
  }

  const ext      = file.type.split('/')[1]
  const filename = `${user.id}_${uuidv4().replace(/-/g, '')}.${ext}`
  await writeFile(path.join(COVER_DIR, filename), Buffer.from(buf))

  const coverUrl = `/media/covers/${filename}`
  await db.update(users).set({ coverUrl, updatedAt: new Date() }).where(eq(users.id, user.id))
  return c.json({ cover_url: coverUrl })
})
app.put('/me/skills', requireAuth, async c => {
  const user = c.get('user')
  const { skill_ids } = await c.req.json() as { skill_ids: string[] }

  await db.delete(userSkills).where(eq(userSkills.userId, user.id))
  if (skill_ids?.length) {
    const found = await db.select().from(skills).where(inArray(skills.id, skill_ids))
    if (found.length !== skill_ids.length) return c.json({ detail: 'One or more skill IDs are invalid' }, 400)
    await db.insert(userSkills).values(skill_ids.map(skillId => ({ userId: user.id, skillId })))
  }

  const [updated] = await db.select().from(users).where(eq(users.id, user.id)).limit(1)
  return c.json(serializeUser(updated, await withSkills(user.id)))
})

app.post('/me/skills/:skillId', requireAuth, async c => {
  const user    = c.get('user')
  const skillId = c.req.param('skillId')
  const [skill] = await db.select().from(skills).where(eq(skills.id, skillId)).limit(1)
  if (!skill) return c.json({ detail: 'Skill not found' }, 404)

  await db.insert(userSkills).values({ userId: user.id, skillId }).onConflictDoNothing()
  const [updated] = await db.select().from(users).where(eq(users.id, user.id)).limit(1)
  return c.json(serializeUser(updated, await withSkills(user.id)))
})

app.delete('/me/skills/:skillId', requireAuth, async c => {
  const user    = c.get('user')
  const skillId = c.req.param('skillId')
  await db.delete(userSkills).where(and(eq(userSkills.userId, user.id), eq(userSkills.skillId, skillId)))
  const [updated] = await db.select().from(users).where(eq(users.id, user.id)).limit(1)
  return c.json(serializeUser(updated, await withSkills(user.id)))
})

app.get('/me/stats', requireAuth, async c => {
  const user = c.get('user')
  return c.json(await getStats(user.id))
})

app.get('/:userId/stats', async c => {
  return c.json(await getStats(c.req.param('userId')))
})

app.get('/:userId', async c => {
  const [user] = await db.select().from(users)
    .where(and(eq(users.id, c.req.param('userId')), eq(users.isActive, true))).limit(1)
  if (!user) return c.json({ detail: 'User not found' }, 404)

  await db.update(users).set({ profileViews: sql`${users.profileViews} + 1` }).where(eq(users.id, user.id))
  return c.json(serializeUser(user, await withSkills(user.id)))
})

async function getStats(userId: string) {
  const [{ views }] = await db.select({ views: users.profileViews }).from(users).where(eq(users.id, userId))
  const [{ rc }]    = await db.select({ rc: sql<number>`count(*)` }).from(reviews).where(eq(reviews.revieweeId, userId))
  const [{ lc }]    = await db.select({ lc: sql<number>`count(*)` }).from(listings).where(eq(listings.ownerId, userId))
  const [{ pc }]    = await db.select({ pc: sql<number>`count(*)` }).from(portfolios).where(eq(portfolios.userId, userId))

  const avgRow = await db.select({
    r: sql<number>`avg(${reviews.reliabilityScore})`,
    p: sql<number>`avg(${reviews.professionalismScore})`,
    g: sql<number>`avg(${reviews.growthScore})`,
  }).from(reviews).where(eq(reviews.revieweeId, userId))

  const { r, p, g } = avgRow[0]
  const reputation = r ? Math.round(((Number(r) + Number(p) + Number(g)) / 3) * 10) / 10 : 0

  const heatmap = await db.select({ date: userActivities.activityDate, count: userActivities.count })
    .from(userActivities).where(eq(userActivities.userId, userId))
    .orderBy(userActivities.activityDate)

  // compute active_days and max_streak from heatmap
  let activeDays = 0, maxStreak = 0, currentStreak = 0
  let prevDate: Date | null = null
  for (const row of heatmap) {
    if (row.count > 0) {
      activeDays++
      const d = new Date(row.date)
      if (prevDate) {
        const diff = (d.getTime() - prevDate.getTime()) / 86400000
        currentStreak = diff === 1 ? currentStreak + 1 : 1
      } else { currentStreak = 1 }
      if (currentStreak > maxStreak) maxStreak = currentStreak
      prevDate = d
    } else { prevDate = null; currentStreak = 0 }
  }

  return {
    profile_views: views ?? 0,
    total_reviews: Number(rc),
    total_listings: Number(lc),
    total_portfolio: Number(pc),
    reputation_score: reputation,
    active_days: activeDays,
    max_streak: maxStreak,
    activity_heatmap: heatmap,
  }
}

export default app
