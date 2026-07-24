from collections import defaultdict
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # user_id -> list of active WebSocket connections
        self._connections: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, user_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self._connections[user_id].append(ws)

    def disconnect(self, user_id: str, ws: WebSocket) -> None:
        self._connections[user_id].discard(ws) if hasattr(self._connections[user_id], "discard") else None
        try:
            self._connections[user_id].remove(ws)
        except ValueError:
            pass

    async def send_to(self, user_id: str, payload: dict) -> None:
        for ws in list(self._connections.get(user_id, [])):
            try:
                await ws.send_json(payload)
            except Exception:
                self.disconnect(user_id, ws)


manager = ConnectionManager()
