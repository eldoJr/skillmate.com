import 'dotenv/config'
import { serve } from '@hono/node-server'
import { createNodeWebSocket } from '@hono/node-ws'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from '@hono/node-server/serve-static'
import { verifyToken } from './lib/auth.js'
import { wsManager } from './lib/ws.js'

import authRoutes         from './routes/auth.js'
import usersRoutes        from './routes/users.js'
import listingsRoutes     from './routes/listings.js'
import messagesRoutes     from './routes/messages.js'
import reviewsRoutes      from './routes/reviews.js'
import notificationsRoutes from './routes/notifications.js'
import skillsRoutes       from './routes/skills.js'
import portfolioRoutes    from './routes/portfolio.js'
import certificatesRoutes from './routes/certificates.js'
import proposalsRoutes    from './routes/proposals.js'
import skillGapRoutes     from './routes/skillGap.js'
import roadmapRoutes      from './routes/roadmap.js'
import mentorRoutes       from './routes/mentor.js'
import matchingRoutes     from './routes/matching.js'
import recommendationsRoutes from './routes/recommendations.js'

const app = new Hono()

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })

app.use('*', cors({
  origin:      (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173').split(','),
  credentials: true,
}))

app.use('/media/*', serveStatic({ root: './' }))

// ─── REST routes ──────────────────────────────────────────────────────────────
app.route('/api/v1/auth',            authRoutes)
app.route('/api/v1/users',           usersRoutes)
app.route('/api/v1/listings',        listingsRoutes)
app.route('/api/v1/messages',        messagesRoutes)
app.route('/api/v1/reviews',         reviewsRoutes)
app.route('/api/v1/notifications',   notificationsRoutes)
app.route('/api/v1/skills',          skillsRoutes)
app.route('/api/v1/portfolio',       portfolioRoutes)
app.route('/api/v1/certificates',    certificatesRoutes)
app.route('/api/v1/proposals',       proposalsRoutes)
app.route('/api/v1/skill-gap',       skillGapRoutes)
app.route('/api/v1/roadmap',         roadmapRoutes)
app.route('/api/v1/mentor',          mentorRoutes)
app.route('/api/v1/matching',        matchingRoutes)
app.route('/api/v1/recommendations', recommendationsRoutes)

// ─── WebSocket: messages ──────────────────────────────────────────────────────
app.get('/api/v1/messages/ws', upgradeWebSocket(async c => {
  const token  = c.req.query('token')
  const userId = token ? await verifyToken(token, 'access') : null

  return {
    onOpen(_, ws) {
      if (!userId) { ws.close(4001, 'Unauthorized'); return }
      wsManager.add(userId, ws.raw as unknown as WebSocket)
    },
    onClose(_, ws) {
      if (userId) wsManager.remove(userId, ws.raw as unknown as WebSocket)
    },
    onMessage() {}, // server-initiated only
  }
}))

// ─── WebSocket: notifications ─────────────────────────────────────────────────
app.get('/api/v1/notifications/ws', upgradeWebSocket(async c => {
  const token  = c.req.query('token')
  const userId = token ? await verifyToken(token, 'access') : null

  return {
    onOpen(_, ws) {
      if (!userId) { ws.close(4001, 'Unauthorized'); return }
      wsManager.add(userId, ws.raw as unknown as WebSocket)
    },
    onClose(_, ws) {
      if (userId) wsManager.remove(userId, ws.raw as unknown as WebSocket)
    },
    onMessage() {},
  }
}))

app.get('/', c => c.json({ status: 'ok', version: '0.1.0' }))

const port = Number(process.env.PORT ?? 8000)
const server = serve({ fetch: app.fetch, port }, () => console.log(`Skillmate API running on http://localhost:${port}`))
injectWebSocket(server)
