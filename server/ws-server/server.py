#!/usr/bin/env python3
"""
WebSocket Server for Real-time Collaborative Graph Editing
Integrates with arrows.app for live collaboration
"""

import asyncio
import json
import websockets
import urllib.request
import urllib.error
from datetime import datetime
from typing import Dict, Set, Optional
import sys
import os

SHARE_SERVER_URL = os.environ.get('SHARE_SERVER_URL', 'http://localhost:3001')
PORT = int(os.environ.get('PORT', 3002))
API_KEY = os.environ.get('API_KEY')


def _api_headers(extra: dict = None) -> dict:
    h = {}
    if API_KEY:
        h['x-api-key'] = API_KEY
    if extra:
        h.update(extra)
    return h


def fetch_graph_from_share_server(session_id: str) -> Optional[dict]:
    """Fetch current graph_data from the share server (synchronous)."""
    try:
        url = f"{SHARE_SERVER_URL}/api/share/{session_id}"
        req = urllib.request.Request(url, headers=_api_headers())
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
            return data.get('graphData')
    except Exception as e:
        print(f"[ws] Could not fetch graph for {session_id}: {e}")
        return None


def persist_graph_to_share_server(session_id: str, graph_data: dict):
    """Persist updated graph_data to the share server (synchronous fire-and-forget)."""
    try:
        payload = json.dumps({'graphData': graph_data}).encode()
        req = urllib.request.Request(
            f"{SHARE_SERVER_URL}/api/share/{session_id}/graph",
            data=payload,
            headers=_api_headers({'Content-Type': 'application/json'}),
            method='PUT'
        )
        urllib.request.urlopen(req, timeout=5)
    except Exception as e:
        print(f"[ws] Could not persist graph for {session_id}: {e}")


class CollaborativeSession:
    """Manages a collaborative editing session"""

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.clients: Set[websockets.WebSocketServerProtocol] = set()
        self.users: Dict[websockets.WebSocketServerProtocol, dict] = {}
        self.current_graph: Optional[dict] = None
        self.created_at = datetime.now()

    async def add_client(self, websocket, user_id: str, user_name: str):
        """Add a client to the session and send them the current graph state."""
        self.clients.add(websocket)
        self.users[websocket] = {
            'id': user_id,
            'name': user_name,
            'cursor': None,
            'joined_at': datetime.now().isoformat()
        }

        # Fetch graph from share server if we don't have it cached
        if self.current_graph is None:
            loop = asyncio.get_event_loop()
            self.current_graph = await loop.run_in_executor(
                None, fetch_graph_from_share_server, self.session_id
            )

        # Notify others about new participant
        await self.broadcast({
            'type': 'participant_joined',
            'data': {
                'user_id': user_id,
                'user_name': user_name,
                'participant_count': len(self.clients)
            }
        }, exclude=websocket)

        # Send session state (with graph) to new client
        await websocket.send(json.dumps({
            'type': 'session_state',
            'data': {
                'session_id': self.session_id,
                'graph': self.current_graph,
                'participants': [
                    {'user_id': u['id'], 'user_name': u['name']}
                    for ws, u in self.users.items() if ws != websocket
                ]
            }
        }))

    async def remove_client(self, websocket):
        """Remove a client from the session."""
        if websocket in self.clients:
            user_info = self.users.get(websocket, {})
            self.clients.discard(websocket)
            self.users.pop(websocket, None)

            await self.broadcast({
                'type': 'participant_left',
                'data': {
                    'user_id': user_info.get('id'),
                    'participant_count': len(self.clients)
                }
            })

    async def broadcast(self, message: dict, exclude=None):
        """Broadcast message to all clients except excluded."""
        message['timestamp'] = datetime.now().isoformat()
        message_json = json.dumps(message)

        disconnected = []
        for client in list(self.clients):
            if client != exclude:
                try:
                    await client.send(message_json)
                except websockets.exceptions.ConnectionClosed:
                    disconnected.append(client)

        for client in disconnected:
            await self.remove_client(client)

    async def handle_message(self, websocket, message: dict):
        """Handle incoming message from a client."""
        user = self.users.get(websocket, {})
        msg_type = message.get('type')

        if msg_type == 'graph_update':
            graph_data = message.get('data')
            if graph_data is not None:
                self.current_graph = graph_data
                # Persist asynchronously
                loop = asyncio.get_event_loop()
                loop.run_in_executor(
                    None, persist_graph_to_share_server, self.session_id, graph_data
                )
            # Broadcast to all other clients
            await self.broadcast({
                'type': 'graph_update',
                'data': graph_data,
                'user_id': user.get('id')
            }, exclude=websocket)

        elif msg_type == 'get_state':
            # Respond to requesting client with current graph
            await websocket.send(json.dumps({
                'type': 'session_state',
                'data': {
                    'session_id': self.session_id,
                    'graph': self.current_graph,
                    'participants': [
                        {'user_id': u['id'], 'user_name': u['name']}
                        for ws, u in self.users.items() if ws != websocket
                    ]
                },
                'timestamp': datetime.now().isoformat()
            }))

        elif msg_type == 'cursor_move':
            if websocket in self.users:
                self.users[websocket]['cursor'] = message.get('data', {}).get('position')
            await self.broadcast({
                'type': 'cursor_update',
                'data': {
                    'user_id': user.get('id'),
                    'user_name': user.get('name'),
                    'position': message.get('data', {}).get('position')
                }
            }, exclude=websocket)

        elif msg_type == 'chat_message':
            await self.broadcast({
                'type': 'chat_message',
                'data': {
                    'user_id': user.get('id'),
                    'user_name': user.get('name'),
                    'message': message.get('data', {}).get('message')
                }
            })


class CollaborationServer:
    """WebSocket server managing multiple collaborative sessions"""

    def __init__(self):
        self.sessions: Dict[str, CollaborativeSession] = {}
        self.host = '0.0.0.0'
        self.port = PORT

    async def register_client(self, websocket):
        """Handle new WebSocket connection."""
        session = None
        session_id = 'default'
        try:
            raw_path = getattr(websocket, 'path', None) or websocket.request.path
            import urllib.parse
            parsed = urllib.parse.urlparse(raw_path)
            params = urllib.parse.parse_qs(parsed.query)

            session_id = params.get('session', ['default'])[0]
            user_id = params.get('user', ['anonymous'])[0]
            user_name = params.get('name', ['Anonymous'])[0]

            if session_id not in self.sessions:
                self.sessions[session_id] = CollaborativeSession(session_id)

            session = self.sessions[session_id]
            await session.add_client(websocket, user_id, user_name)

            async for message in websocket:
                try:
                    data = json.loads(message)
                    await session.handle_message(websocket, data)
                except json.JSONDecodeError:
                    await websocket.send(json.dumps({
                        'type': 'error',
                        'data': {'message': 'Invalid JSON'}
                    }))

        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            if session is not None:
                await session.remove_client(websocket)
                if len(session.clients) == 0:
                    self.sessions.pop(session_id, None)

    async def start(self):
        """Start the WebSocket server."""
        print(f"🚀 WebSocket Collaboration Server starting on {self.host}:{self.port}")
        print(f"   Connect: ws://{self.host}:{self.port}/ws?session=SESSION_ID&user=USER_ID")
        print(f"   Share server: {SHARE_SERVER_URL}")

        async with websockets.serve(
            self.register_client,
            self.host,
            self.port,
            ping_interval=20,
            ping_timeout=10
        ):
            await asyncio.Future()  # Run forever


if __name__ == "__main__":
    server = CollaborationServer()
    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
