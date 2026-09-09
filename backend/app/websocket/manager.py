from typing import List

from fastapi import WebSocket


class ConnectionManager:
    """
    Handles all active WebSocket connections for NekoAI.
    """

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(
        self,
        websocket: WebSocket,
    ) -> None:
        """
        Accept and register a new connection.
        """

        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(
        self,
        websocket: WebSocket,
    ) -> None:
        """
        Remove a disconnected client.
        """

        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(
        self,
        message: str,
        websocket: WebSocket,
    ) -> None:
        """
        Send a message to one client.
        """

        await websocket.send_text(message)

    async def broadcast(
        self,
        message: str,
    ) -> None:
        """
        Send a message to every connected client.
        Dead connections are removed automatically.
        """

        disconnected = []

        for connection in self.active_connections:

            try:
                await connection.send_text(message)

            except Exception:
                disconnected.append(connection)

        for connection in disconnected:
            self.disconnect(connection)

    async def send_message(
        self,
        message: str,
    ) -> None:
        """
        Backward-compatible wrapper.
        """

        await self.broadcast(message)


manager = ConnectionManager()