// Simple in-process WebSocket connection manager
// user_id -> Set of WebSockets
const connections = new Map<string, Set<WebSocket>>()

export const wsManager = {
  add(userId: string, ws: WebSocket) {
    if (!connections.has(userId)) connections.set(userId, new Set())
    connections.get(userId)!.add(ws)
  },
  remove(userId: string, ws: WebSocket) {
    connections.get(userId)?.delete(ws)
  },
  send(userId: string, payload: unknown) {
    const sockets = connections.get(userId)
    if (!sockets) return
    const data = JSON.stringify(payload)
    for (const ws of sockets) {
      try { ws.send(data) } catch { sockets.delete(ws) }
    }
  },
}
