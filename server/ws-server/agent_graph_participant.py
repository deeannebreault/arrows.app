#!/usr/bin/env python3
"""
Agent Graph Participant
Connects to an arrows.app collab WebSocket session as an AI agent participant.

Usage:
  python3 agent_graph_participant.py SESSION_ID [--prompt "instruction"]
  python3 agent_graph_participant.py SESSION_ID --interactive
"""

import asyncio
import json
import sys
import argparse
import websockets
import os

WS_URL = os.environ.get('WS_URL', 'ws://localhost:3002')
AGENT_USER_ID = 'agent-claude'
AGENT_USER_NAME = 'Claude (Agent)'


class AgentParticipant:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.current_graph = None
        self.ws = None

    def _ws_url(self) -> str:
        return (
            f"{WS_URL}?session={self.session_id}"
            f"&user={AGENT_USER_ID}"
            f"&name={AGENT_USER_NAME.replace(' ', '%20')}"
        )

    async def connect(self):
        url = self._ws_url()
        print(f"[agent] Connecting to {url}", file=sys.stderr)
        self.ws = await websockets.connect(url)
        print(f"[agent] Connected to session {self.session_id}", file=sys.stderr)

    async def disconnect(self):
        if self.ws:
            await self.ws.close()

    async def receive_initial_state(self, timeout=10):
        """Wait for session_state message from server."""
        try:
            async with asyncio.timeout(timeout):
                async for raw in self.ws:
                    msg = json.loads(raw)
                    if msg.get('type') == 'session_state':
                        self.current_graph = msg['data'].get('graph')
                        participants = msg['data'].get('participants', [])
                        print(f"[agent] Got graph. Nodes: {len((self.current_graph or {}).get('nodes', []))},"
                              f" Rels: {len((self.current_graph or {}).get('relationships', []))},"
                              f" Other participants: {len(participants)}", file=sys.stderr)
                        return True
        except TimeoutError:
            print("[agent] Timed out waiting for session state", file=sys.stderr)
        return False

    async def send_graph(self, graph: dict):
        """Push a new graph state to all collaborators."""
        self.current_graph = graph
        await self.ws.send(json.dumps({'type': 'graph_update', 'data': graph}))
        print(f"[agent] Sent graph update ({len(graph.get('nodes', []))} nodes)", file=sys.stderr)

    async def listen(self, callback=None):
        """Listen for incoming messages and invoke callback on graph_update."""
        async for raw in self.ws:
            msg = json.loads(raw)
            if msg.get('type') == 'graph_update':
                self.current_graph = msg.get('data')
                if callback:
                    await callback(self.current_graph)
            elif msg.get('type') == 'session_state':
                self.current_graph = msg['data'].get('graph')
                if callback:
                    await callback(self.current_graph)


def apply_instruction(graph: dict, instruction: str) -> dict:
    """
    Apply a natural language instruction to the graph.
    This is a simple rule-based implementation. Wire to Claude API for smarter edits.
    """
    import re
    graph = json.loads(json.dumps(graph))  # deep copy
    nodes = graph.setdefault('nodes', [])
    rels = graph.setdefault('relationships', [])

    # "Add a node called X" / "Add node X"
    add_match = re.search(r'add (?:a )?node (?:called |named )?["\']?([^"\']+)["\']?', instruction, re.IGNORECASE)
    if add_match:
        label = add_match.group(1).strip()
        # Position: offset from last node or center
        x = 200 + len(nodes) * 150
        y = 200
        node_id = f"n{len(nodes) + 1}"
        nodes.append({
            'id': node_id,
            'position': {'x': x, 'y': y},
            'caption': label,
            'labels': [],
            'properties': {},
            'style': {}
        })
        print(f"[agent] Added node '{label}' (id={node_id})", file=sys.stderr)
        return graph

    # "Remove node X" / "Delete node X"
    rm_match = re.search(r'(?:remove|delete) node ["\']?([^"\']+)["\']?', instruction, re.IGNORECASE)
    if rm_match:
        label = rm_match.group(1).strip()
        before = len(nodes)
        nodes[:] = [n for n in nodes if n.get('caption', '').lower() != label.lower()]
        removed_ids = {n['id'] for n in nodes}
        rels[:] = [r for r in rels if r.get('fromId') in removed_ids and r.get('toId') in removed_ids]
        print(f"[agent] Removed {before - len(nodes)} node(s) matching '{label}'", file=sys.stderr)
        return graph

    # "Connect X to Y" / "Link X to Y"
    conn_match = re.search(r'(?:connect|link) ["\']?([^"\']+)["\']? to ["\']?([^"\']+)["\']?', instruction, re.IGNORECASE)
    if conn_match:
        from_label = conn_match.group(1).strip()
        to_label = conn_match.group(2).strip()
        from_node = next((n for n in nodes if n.get('caption', '').lower() == from_label.lower()), None)
        to_node = next((n for n in nodes if n.get('caption', '').lower() == to_label.lower()), None)
        if from_node and to_node:
            rel_id = f"r{len(rels) + 1}"
            rels.append({
                'id': rel_id,
                'type': '',
                'fromId': from_node['id'],
                'toId': to_node['id'],
                'style': {},
                'properties': {}
            })
            print(f"[agent] Connected '{from_label}' -> '{to_label}'", file=sys.stderr)
        else:
            missing = []
            if not from_node: missing.append(from_label)
            if not to_node: missing.append(to_label)
            print(f"[agent] Node(s) not found: {missing}", file=sys.stderr)
        return graph

    print(f"[agent] Unrecognized instruction: '{instruction}'", file=sys.stderr)
    return graph


async def run_single_prompt(session_id: str, instruction: str):
    agent = AgentParticipant(session_id)
    await agent.connect()
    got_state = await agent.receive_initial_state()
    if not got_state:
        print("[agent] ERROR: Could not get graph state", file=sys.stderr)
        await agent.disconnect()
        return

    if not agent.current_graph:
        agent.current_graph = {'nodes': [], 'relationships': [], 'style': {}}

    new_graph = apply_instruction(agent.current_graph, instruction)
    await agent.send_graph(new_graph)
    # Brief pause to ensure the message is delivered
    await asyncio.sleep(0.5)
    await agent.disconnect()
    print(json.dumps(new_graph, indent=2))


async def run_interactive(session_id: str):
    agent = AgentParticipant(session_id)
    await agent.connect()
    got_state = await agent.receive_initial_state()
    if not got_state:
        print("[agent] ERROR: Could not get graph state", file=sys.stderr)
        await agent.disconnect()
        return

    print("[agent] Interactive mode. Type instructions (or 'quit' to exit):", file=sys.stderr)
    print(f"[agent] Graph: {len((agent.current_graph or {}).get('nodes', []))} nodes", file=sys.stderr)

    loop = asyncio.get_event_loop()
    while True:
        try:
            instruction = await loop.run_in_executor(None, input, '> ')
        except EOFError:
            break
        if instruction.strip().lower() in ('quit', 'exit', 'q'):
            break
        if not instruction.strip():
            continue
        if not agent.current_graph:
            agent.current_graph = {'nodes': [], 'relationships': [], 'style': {}}
        new_graph = apply_instruction(agent.current_graph, instruction)
        await agent.send_graph(new_graph)

    await agent.disconnect()


def main():
    parser = argparse.ArgumentParser(description='Agent graph participant for arrows.app collab sessions')
    parser.add_argument('session_id', help='Collab session ID')
    parser.add_argument('--prompt', '-p', help='Instruction to apply to the graph', default=None)
    parser.add_argument('--interactive', '-i', action='store_true', help='Interactive mode')
    args = parser.parse_args()

    if args.interactive or not args.prompt:
        asyncio.run(run_interactive(args.session_id))
    else:
        asyncio.run(run_single_prompt(args.session_id, args.prompt))


if __name__ == '__main__':
    main()
