import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { eq, and, asc, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { mentorConversations, mentorMessages, skillGapReports, careerRoadmaps, reviews, userSkills, skills } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'
import { streamChatCompletion, chatCompletion, parseJSON, requireAI } from '../lib/nim.js'
import type { AppEnv } from '../lib/types.js'
import { v4 as uuidv4 } from 'uuid'

const app = new Hono<AppEnv>()

async function buildContext(userId: string) {
  const user = (await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, userId) }))!

  const skillNames = await db.select({ name: skills.name }).from(userSkills)
    .innerJoin(skills, eq(userSkills.skillId, skills.id)).where(eq(userSkills.userId, userId))

  const gapRows = await db.select().from(skillGapReports).where(eq(skillGapReports.userId, userId))
  const roadmapRows = await db.select().from(careerRoadmaps).where(eq(careerRoadmaps.userId, userId)).orderBy(desc(careerRoadmaps.version))

  const seenRoles = new Set<string>()
  const roadmaps = roadmapRows.filter(r => { if (seenRoles.has(r.targetRole)) return false; seenRoles.add(r.targetRole); return true })
    .map(r => ({ targetRole: r.targetRole, totalWeeks: r.totalWeeks, version: r.version }))

  const [avgRow] = await db.select({
    rel: db.$count(reviews, eq(reviews.revieweeId, userId)),
  }).from(reviews).where(eq(reviews.revieweeId, userId))

  return {
    firstName: user.firstName, lastName: user.lastName,
    university: user.university, role: user.role, headline: user.headline, bio: user.bio,
    skills: skillNames.map(s => s.name),
    gapReports: gapRows.map(r => ({ targetRole: r.targetRole, missingSkills: JSON.parse(r.missingSkills), presentSkills: JSON.parse(r.presentSkills), estimatedWeeks: r.estimatedWeeks })),
    roadmaps,
  }
}

function buildSystemPrompt(ctx: Awaited<ReturnType<typeof buildContext>>) {
  const gapSection = ctx.gapReports.length
    ? 'Skill gap reports:\n' + ctx.gapReports.map(r => `  - ${r.targetRole}: missing ${r.missingSkills.slice(0, 5).map((m: { skill: string }) => m.skill).join(', ') || 'nothing critical'}`).join('\n')
    : ''
  const roadmapSection = ctx.roadmaps.length
    ? 'Active roadmaps:\n' + ctx.roadmaps.map(r => `  - ${r.targetRole}: ${r.totalWeeks} week roadmap (v${r.version})`).join('\n')
    : ''
  return `You are the Skillmate AI Career Mentor — a knowledgeable, encouraging, and honest career advisor for university students.

Student profile:
  Name: ${ctx.firstName} ${ctx.lastName}
  University: ${ctx.university ?? 'N/A'}
  Current role/focus: ${ctx.role ?? 'N/A'}
  Headline: ${ctx.headline ?? 'N/A'}
  Skills: ${ctx.skills.join(', ') || 'None listed'}

${gapSection}
${roadmapSection}

Guidelines:
- Give specific, actionable advice grounded in the student's actual profile above
- Be concise — 2-4 paragraphs max unless a detailed breakdown is explicitly requested
- Never make up certifications, courses, or companies — only suggest real, well-known ones
- If you don't know something, say so honestly
- Refer to the student by first name occasionally to keep it personal`
}

async function generateTitle(userMessage: string, assistantReply: string): Promise<string> {
  try {
    const raw = await chatCompletion([
      {
        role: 'user',
        content:
          `User asked: ${userMessage.slice(0, 300)}\n` +
          `Assistant replied: ${assistantReply.slice(0, 300)}\n\n` +
          'Write a concise 4-6 word title for this conversation. ' +
          'No punctuation, no quotes, lowercase only. Return only the title.',
      },
    ], { temperature: 0.3, maxTokens: 20 })
    const title = raw.trim().replace(/["'.]/g, '').replace(/\.$/, '')
    return title.slice(0, 80) || userMessage.slice(0, 60)
  } catch {
    return userMessage.slice(0, 60)
  }
}

app.post('/chat', requireAuth, async c => {
  try { requireAI() } catch { return c.json({ detail: 'AI features not configured' }, 503) }

  const user = c.get('user')
  const { message, conversation_id } = await c.req.json()
  if (!message) return c.json({ detail: 'message is required' }, 400)

  const ctx = await buildContext(user.id)

  // Get or create conversation
  let conv: typeof mentorConversations.$inferSelect
  if (conversation_id) {
    const [found] = await db.select().from(mentorConversations)
      .where(and(eq(mentorConversations.id, conversation_id), eq(mentorConversations.userId, user.id))).limit(1)
    if (!found) return c.json({ detail: 'Conversation not found' }, 404)
    conv = found
  } else {
    ;[conv] = await db.insert(mentorConversations).values({ userId: user.id }).returning()
  }

  // Load history
  const history = await db.select().from(mentorMessages)
    .where(eq(mentorMessages.conversationId, conv.id)).orderBy(asc(mentorMessages.createdAt))

  const nimMessages = [
    { role: 'system', content: buildSystemPrompt(ctx) },
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ]

  return streamSSE(c, async stream => {
    await stream.writeSSE({ data: JSON.stringify({ conversation_id: conv.id }) })

    let fullReply = ''
    for await (const chunk of streamChatCompletion(nimMessages)) {
      fullReply += chunk
      await stream.writeSSE({ data: JSON.stringify({ content: chunk }) })
    }
    await stream.writeSSE({ data: JSON.stringify({ content: '', done: true }) })

    // Persist messages
    await db.insert(mentorMessages).values([
      { id: uuidv4(), conversationId: conv.id, role: 'user', content: message },
      { id: uuidv4(), conversationId: conv.id, role: 'assistant', content: fullReply },
    ])
    // Set title on first message
    if (!conversation_id) {
      const title = await generateTitle(message, fullReply)
      await db.update(mentorConversations).set({ title, updatedAt: new Date() }).where(eq(mentorConversations.id, conv.id))
    } else {
      await db.update(mentorConversations).set({ updatedAt: new Date() }).where(eq(mentorConversations.id, conv.id))
    }
  })
})

app.get('/conversations', requireAuth, async c => {
  const user = c.get('user')
  const rows = await db.select().from(mentorConversations)
    .where(eq(mentorConversations.userId, user.id)).orderBy(desc(mentorConversations.updatedAt))
  return c.json(rows)
})

app.get('/conversations/:id', requireAuth, async c => {
  const user = c.get('user')
  const [conv] = await db.select().from(mentorConversations)
    .where(and(eq(mentorConversations.id, c.req.param('id')), eq(mentorConversations.userId, user.id))).limit(1)
  if (!conv) return c.json({ detail: 'Conversation not found' }, 404)
  const msgs = await db.select().from(mentorMessages)
    .where(eq(mentorMessages.conversationId, conv.id)).orderBy(asc(mentorMessages.createdAt))
  return c.json({ ...conv, messages: msgs })
})

app.delete('/conversations/:id', requireAuth, async c => {
  const user = c.get('user')
  const [conv] = await db.select().from(mentorConversations)
    .where(and(eq(mentorConversations.id, c.req.param('id')), eq(mentorConversations.userId, user.id))).limit(1)
  if (!conv) return c.json({ detail: 'Conversation not found' }, 404)
  await db.delete(mentorConversations).where(eq(mentorConversations.id, conv.id))
  return c.body(null, 204)
})

app.get('/proactive', requireAuth, async c => {
  try { requireAI() } catch { return c.json([]) }

  const user = c.get('user')
  const ctx = await buildContext(user.id)

  const prompt = `Student: ${ctx.firstName}, skills: ${ctx.skills.join(', ') || 'none'}, gap reports: ${ctx.gapReports.length}, roadmaps: ${ctx.roadmaps.length}.\n\nGenerate 2-3 short proactive career suggestions for this student right now. Return a JSON array where each item has: {"type": "next_step"|"opportunity"|"reminder", "message": string, "action_label": string|null, "action_url": string|null}. Keep each message under 20 words. No explanation outside the JSON.`

  const raw = await chatCompletion([{ role: 'user', content: prompt }], { temperature: 0.5, maxTokens: 512 })
  return c.json(parseJSON(raw, []))
})

export default app
