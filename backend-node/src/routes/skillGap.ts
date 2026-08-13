import { Hono } from 'hono'
import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { skillGapReports, users, userSkills, skills } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'
import { chatCompletion, parseJSON, requireAI } from '../lib/nim.js'
import type { AppEnv } from '../lib/types.js'

const app = new Hono<AppEnv>()

async function getUserSkills(userId: string): Promise<string[]> {
  const rows = await db.select({ name: skills.name }).from(userSkills)
    .innerJoin(skills, eq(userSkills.skillId, skills.id))
    .where(eq(userSkills.userId, userId))
  return rows.map(r => r.name)
}

app.post('/analyze', requireAuth, async c => {
  try { requireAI() } catch { return c.json({ detail: 'AI features not configured' }, 503) }

  const user = c.get('user')
  const { target_role } = await c.req.json()
  if (!target_role) return c.json({ detail: 'target_role is required' }, 400)

  const skillNames = await getUserSkills(user.id)

  const profileText = `Name: ${user.firstName} ${user.lastName}\nUniversity: ${user.university ?? 'N/A'}\nRole: ${user.role ?? 'N/A'}\nHeadline: ${user.headline ?? 'N/A'}\nBio: ${user.bio ?? 'N/A'}\nCurrent skills: ${skillNames.join(', ') || 'None listed'}`

  // Step 1: assess present skills
  const presentRaw = await chatCompletion([{ role: 'user', content: `${profileText}\n\nTarget role: ${target_role}\n\nList the skills they already have that are relevant to this role. Reply with a JSON array of skill name strings only. No explanation.` }], { temperature: 0.2, maxTokens: 512 })
  const presentSkills: string[] = parseJSON(presentRaw, [])

  // Step 2: identify missing skills
  const missingRaw = await chatCompletion([{ role: 'user', content: `Target role: ${target_role}\nSkills the student already has: ${presentSkills.join(', ') || 'None'}\n\nIdentify the top missing skills needed for this role. Return a JSON array where each item has: {"skill": string, "priority": int (1=highest), "reason": string, "estimated_weeks": int}. Return at most 8 items. No explanation outside the JSON.` }], { temperature: 0.3, maxTokens: 1024 })
  const missingSkills: { skill: string; priority: number; reason: string; estimated_weeks: number }[] = parseJSON(missingRaw, [])
  const estimatedWeeks = missingSkills.reduce((s, m) => s + (m.estimated_weeks ?? 0), 0) || null

  // Step 3: summary
  const summary = await chatCompletion([{ role: 'user', content: `Student target role: ${target_role}\nPresent skills: ${presentSkills.join(', ') || 'None'}\nMissing skills: ${missingSkills.map(m => m.skill).join(', ') || 'None'}\n\nWrite a concise 2-3 sentence summary of this student's skill gap. Be encouraging but honest. Plain text only.` }], { temperature: 0.6, maxTokens: 256 })

  // Upsert
  const [existing] = await db.select().from(skillGapReports)
    .where(and(eq(skillGapReports.userId, user.id), eq(skillGapReports.targetRole, target_role))).limit(1)

  let report
  if (existing) {
    ;[report] = await db.update(skillGapReports).set({
      presentSkills: JSON.stringify(presentSkills),
      missingSkills: JSON.stringify(missingSkills),
      summary, estimatedWeeks, updatedAt: new Date(),
    }).where(eq(skillGapReports.id, existing.id)).returning()
  } else {
    ;[report] = await db.insert(skillGapReports).values({
      userId: user.id, targetRole: target_role,
      presentSkills: JSON.stringify(presentSkills),
      missingSkills: JSON.stringify(missingSkills),
      summary, estimatedWeeks,
    }).returning()
  }

  return c.json(formatReport(report), existing ? 200 : 201)
})

app.get('/', requireAuth, async c => {
  const user = c.get('user')
  const rows = await db.select().from(skillGapReports)
    .where(eq(skillGapReports.userId, user.id)).orderBy(desc(skillGapReports.updatedAt))
  return c.json(rows.map(formatReport))
})

app.get('/:targetRole', requireAuth, async c => {
  const user = c.get('user')
  const [report] = await db.select().from(skillGapReports)
    .where(and(eq(skillGapReports.userId, user.id), eq(skillGapReports.targetRole, c.req.param('targetRole')))).limit(1)
  if (!report) return c.json({ detail: 'No gap report found for this role. Run an analysis first.' }, 404)
  return c.json(formatReport(report))
})

function formatReport(r: typeof skillGapReports.$inferSelect) {
  return {
    ...r,
    presentSkills: JSON.parse(r.presentSkills),
    missingSkills: JSON.parse(r.missingSkills),
  }
}

export default app
