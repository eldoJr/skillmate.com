import { Hono } from 'hono'
import { eq, and, desc, max, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { careerRoadmaps, skillGapReports } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'
import { chatCompletion, parseJSON, requireAI } from '../lib/nim.js'
import type { AppEnv } from '../lib/types.js'

const app = new Hono<AppEnv>()

app.post('/generate', requireAuth, async c => {
  try { requireAI() } catch { return c.json({ detail: 'AI features not configured' }, 503) }

  const user = c.get('user')
  const { target_role } = await c.req.json()
  if (!target_role) return c.json({ detail: 'target_role is required' }, 400)

  const [gap] = await db.select().from(skillGapReports)
    .where(and(eq(skillGapReports.userId, user.id), eq(skillGapReports.targetRole, target_role))).limit(1)
  if (!gap) return c.json({ detail: 'Run a skill gap analysis for this role first before generating a roadmap.' }, 400)

  const gapCtx = {
    presentSkills: JSON.parse(gap.presentSkills),
    missingSkills: JSON.parse(gap.missingSkills),
    estimatedWeeks: gap.estimatedWeeks,
  }

  const profileSummary = `Student: ${user.firstName} ${user.lastName}\nUniversity: ${user.university ?? 'N/A'} | Role: ${user.role ?? 'N/A'}\nTarget role: ${target_role}\nPresent skills: ${gapCtx.presentSkills.join(', ') || 'None'}\nMissing skills: ${gapCtx.missingSkills.map((m: { skill: string; estimated_weeks: number }) => `${m.skill} (~${m.estimated_weeks}w)`).join(', ')}\nEstimated total weeks: ${gapCtx.estimatedWeeks ?? 'unknown'}`

  // Step 1: milestones
  const milestonesRaw = await chatCompletion([{ role: 'user', content: `${profileSummary}\n\nBased on this profile and skill gap, identify 3-5 major learning milestones needed to reach the target role. Return a JSON array where each item has: {"title": string, "description": string, "skills": [string], "week_start": int, "week_end": int, "certifications": [string], "projects": [string]}. No explanation outside the JSON.` }], { temperature: 0.3, maxTokens: 1500 })
  const milestones = parseJSON(milestonesRaw, [])
  const totalWeeks = Math.max(...milestones.map((m: { week_end: number }) => m.week_end ?? 0), 12)

  // Step 2: weekly plan
  const planRaw = await chatCompletion([{ role: 'user', content: `Target role: ${target_role}\nMilestones:\n${JSON.stringify(milestones, null, 2)}\n\nCreate a week-by-week study plan for ${totalWeeks} weeks. Return a JSON array where each item has: {"week": int, "focus": string, "tasks": [string], "resources": [string]}. Keep tasks concrete and actionable. No explanation outside the JSON.` }], { temperature: 0.4, maxTokens: 3000 })
  const weeklyPlan = parseJSON(planRaw, [])

  // Step 3: summary
  const summary = await chatCompletion([{ role: 'user', content: `Student profile summary:\n${profileSummary}\n\nCareer roadmap: ${milestones.length} milestones over ${totalWeeks} weeks to become a ${target_role}.\n\nWrite a motivating 3-4 sentence overview of this roadmap. Mention the key milestones and the end goal. Plain text only.` }], { temperature: 0.7, maxTokens: 300 })

  // Version bump
  const [{ maxVer }] = await db.select({ maxVer: sql<number>`coalesce(max(${careerRoadmaps.version}), 0)` })
    .from(careerRoadmaps).where(and(eq(careerRoadmaps.userId, user.id), eq(careerRoadmaps.targetRole, target_role)))

  const [roadmap] = await db.insert(careerRoadmaps).values({
    userId: user.id, targetRole: target_role,
    version: Number(maxVer) + 1,
    milestones: JSON.stringify(milestones),
    weeklyPlan: JSON.stringify(weeklyPlan),
    summary, totalWeeks,
  }).returning()

  return c.json(formatRoadmap(roadmap), 201)
})

app.get('/:targetRole/latest', requireAuth, async c => {
  const user = c.get('user')
  const [roadmap] = await db.select().from(careerRoadmaps)
    .where(and(eq(careerRoadmaps.userId, user.id), eq(careerRoadmaps.targetRole, c.req.param('targetRole'))))
    .orderBy(desc(careerRoadmaps.version)).limit(1)
  if (!roadmap) return c.json({ detail: 'No roadmap found for this role.' }, 404)
  return c.json(formatRoadmap(roadmap))
})

app.get('/:targetRole/versions', requireAuth, async c => {
  const user = c.get('user')
  const rows = await db.select().from(careerRoadmaps)
    .where(and(eq(careerRoadmaps.userId, user.id), eq(careerRoadmaps.targetRole, c.req.param('targetRole'))))
    .orderBy(desc(careerRoadmaps.version))
  return c.json(rows.map(r => ({ id: r.id, version: r.version, targetRole: r.targetRole, totalWeeks: r.totalWeeks, createdAt: r.createdAt })))
})

app.get('/:targetRole/versions/:version', requireAuth, async c => {
  const user = c.get('user')
  const [roadmap] = await db.select().from(careerRoadmaps).where(and(
    eq(careerRoadmaps.userId, user.id),
    eq(careerRoadmaps.targetRole, c.req.param('targetRole')),
    eq(careerRoadmaps.version, Number(c.req.param('version'))),
  )).limit(1)
  if (!roadmap) return c.json({ detail: 'Roadmap version not found.' }, 404)
  return c.json(formatRoadmap(roadmap))
})

function formatRoadmap(r: typeof careerRoadmaps.$inferSelect) {
  return { ...r, milestones: JSON.parse(r.milestones), weeklyPlan: JSON.parse(r.weeklyPlan) }
}

export default app
