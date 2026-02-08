#!/usr/bin/env python3
"""
Harris Wildlands MUD — Unified Web Server
Serves terminal HTML + WebSocket MUD on port 5000
"""
import asyncio
import json
import os
import sys
import random
from datetime import datetime
from typing import Dict, List, Set, Optional
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent
sys.path.insert(0, str(PROJECT_ROOT / "07_HARRIS_WILDLANDS"))

from orchestrator.mode_state import ModeStateManager
from orchestrator.build_loop import BuildOrchestrator

import websockets
from websockets.http11 import Response
from websockets.datastructures import Headers


WORLD_DIR = PROJECT_ROOT / "07_HARRIS_WILDLANDS" / "structure" / "mud-server" / "world"
EVIDENCE_DIR = PROJECT_ROOT / "07_HARRIS_WILDLANDS" / "evidence"


class Room:
    def __init__(self, id: str, name: str, description: str):
        self.id = id
        self.name = name
        self.description = description
        self.exits: Dict[str, str] = {}
        self.objects: List[str] = []
        self.npcs: List["NPC"] = []
        self.players: Set[str] = set()
        self.created_at = datetime.now()

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "exits": self.exits,
            "objects": self.objects,
            "npcs": [npc.to_dict() for npc in self.npcs],
            "players": list(self.players),
        }


class NPC:
    def __init__(self, id: str, name: str, description: str, npc_type: str = "wanderer"):
        self.id = id
        self.name = name
        self.description = description
        self.type = npc_type
        self.room_id: Optional[str] = None
        self.ai_mood = random.choice(["friendly", "mysterious", "helpful"])

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "type": self.type,
            "mood": self.ai_mood,
        }


class Player:
    def __init__(self, name: str, is_agent: bool = False):
        self.name = name
        self.room_id = "spawn"
        self.inventory: List[str] = []
        self.is_agent = is_agent
        self.websocket = None
        self.explored_rooms: Set[str] = set()

    def to_dict(self):
        return {
            "name": self.name,
            "room": self.room_id,
            "is_agent": self.is_agent,
            "inventory": self.inventory,
            "explored": len(self.explored_rooms),
        }


class MUDWorld:
    def __init__(self, mode_manager: ModeStateManager, orchestrator: BuildOrchestrator):
        self.rooms: Dict[str, Room] = {}
        self.players: Dict[str, Player] = {}
        self.npcs: Dict[str, NPC] = {}
        self.connections: Set = set()
        self.mode_manager = mode_manager
        self.orchestrator = orchestrator
        if not self.load_world():
            self.init_world()

    def load_world(self) -> bool:
        rooms_path = WORLD_DIR / "rooms.json"
        npcs_path = WORLD_DIR / "npcs.json"
        if not rooms_path.exists():
            return False
        try:
            with open(rooms_path, "r", encoding="utf-8") as f:
                rooms_data = json.load(f)
            for r in rooms_data.get("rooms", []):
                room = Room(r["id"], r["name"], r["description"])
                room.exits = r.get("exits", {})
                room.objects = r.get("objects", [])
                self.rooms[room.id] = room
            if npcs_path.exists():
                with open(npcs_path, "r", encoding="utf-8") as f:
                    npcs_data = json.load(f)
                for n in npcs_data.get("npcs", []):
                    npc = NPC(n["id"], n["name"], n["description"], n.get("type", "wanderer"))
                    npc.room_id = n.get("room_id")
                    self.npcs[npc.id] = npc
                    if npc.room_id in self.rooms:
                        self.rooms[npc.room_id].npcs.append(npc)
            print(f"World loaded from JSON with {len(self.rooms)} rooms")
            return True
        except Exception as e:
            print(f"Failed to load world data: {e}")
            return False

    def init_world(self):
        spawn = Room("spawn", "The Clearing",
                      "A mossy clearing surrounded by ancient pines. Sunlight filters through the canopy.")
        spawn.objects = ["stone altar", "glowing mushrooms"]
        rooms_data = [
            ("forest_north", "Whispering Pines", "Tall pine trees whisper secrets in the wind."),
            ("forest_east", "Misty Ravine", "A narrow ravine shrouded in perpetual mist."),
            ("forest_south", "Crystal Stream", "A clear stream sparkles with otherworldly light."),
            ("forest_west", "Ancient Grove", "Ancient oaks older than memory stand in a circle."),
        ]
        for room_id, name, desc in rooms_data:
            self.rooms[room_id] = Room(room_id, name, desc)
        spawn.exits = {"north": "forest_north", "east": "forest_east",
                       "south": "forest_south", "west": "forest_west"}
        self.rooms["forest_north"].exits = {"south": "spawn"}
        self.rooms["forest_east"].exits = {"west": "spawn"}
        self.rooms["forest_south"].exits = {"north": "spawn"}
        self.rooms["forest_west"].exits = {"east": "spawn"}
        self.rooms["spawn"] = spawn
        npc = NPC("elder_willow", "Elder Willow", "An ancient mystic who tends the forest", "mystic")
        npc.room_id = "spawn"
        self.npcs["elder_willow"] = npc
        self.rooms["spawn"].npcs.append(npc)
        print(f"World initialized with {len(self.rooms)} rooms")

    async def handle_command(self, player: Player, command_line: str) -> str:
        mode_result = self.mode_manager.process_command(player.name, command_line)
        if mode_result is not None:
            return mode_result

        parts = command_line.strip().split()
        if not parts:
            return ""

        cmd = parts[0].lower()
        args = parts[1:]

        if cmd == "dev":
            return await self.handle_dev_command(player, args)
        elif cmd == "look":
            return await self.cmd_look(player)
        elif cmd in ["go", "north", "south", "east", "west", "up", "down", "n", "s", "e", "w"]:
            direction = args[0] if args else cmd
            return await self.cmd_go(player, [direction])
        elif cmd == "say":
            return await self.cmd_say(player, args)
        elif cmd == "create":
            return await self.cmd_create(player, args)
        elif cmd == "spawn":
            return await self.cmd_spawn(player, args)
        elif cmd == "inventory":
            return await self.cmd_inventory(player)
        elif cmd == "who":
            return await self.cmd_who(player)
        elif cmd == "help":
            return self.cmd_help()
        elif cmd == "status":
            return await self.cmd_status(player)
        else:
            return f"Unknown command: '{cmd}'. Type 'help' for available commands."

    async def handle_dev_command(self, player: Player, args: List[str]) -> str:
        if not args:
            return "Dev commands: status, buildstub, log tail <n>"

        sub = args[0].lower()

        if sub == "status":
            state = self.mode_manager.get_state(player.name)
            return state.status()
        elif sub == "buildstub":
            result = self.orchestrator.execute_build(
                player_id=player.name,
                verb="buildstub",
                args={},
                intent=self.mode_manager.get_state(player.name).last_plan_text,
            )
            return result
        elif sub == "log" and len(args) >= 2 and args[1].lower() == "tail":
            n = 10
            if len(args) >= 3:
                try:
                    n = int(args[2])
                except ValueError:
                    pass
            events = self.orchestrator.get_event_log_tail(n)
            if not events:
                return "No build events yet."
            lines = []
            for evt in events:
                lines.append(f"  [{evt.get('ts', '?')}] {evt.get('id', '?')} {evt.get('verb', '?')} -> {evt.get('result', '?')}")
            return "Recent build events:\n" + "\n".join(lines)
        else:
            return "Dev commands: status, buildstub, log tail <n>"

    async def cmd_look(self, player: Player) -> str:
        room = self.rooms.get(player.room_id)
        if not room:
            return "You are nowhere."
        player.explored_rooms.add(room.id)
        result = f"\n[{room.name}]\n{room.description}\n\n"
        if room.objects:
            result += f"You see: {', '.join(room.objects)}\n"
        if room.npcs:
            npc_names = [npc.name for npc in room.npcs]
            result += f"NPCs: {', '.join(npc_names)}\n"
        other_players = [p.name for p in self.players.values()
                         if p.room_id == room.id and p.name != player.name]
        if other_players:
            result += f"Players here: {', '.join(other_players)}\n"
        if room.exits:
            exits = [f"{d} ({self.rooms.get(rid, Room('', 'Unknown', '')).name})"
                     for d, rid in room.exits.items()]
            result += f"\nExits: {', '.join(exits)}\n"
        return result

    async def cmd_go(self, player: Player, args: List[str]) -> str:
        if not args:
            return "Go where?"
        direction_map = {"n": "north", "s": "south", "e": "east", "w": "west", "u": "up", "d": "down"}
        direction = args[0].lower()
        direction = direction_map.get(direction, direction)
        room = self.rooms.get(player.room_id)
        if direction not in room.exits:
            return f"You can't go {direction} from here."
        new_room_id = room.exits[direction]
        room.players.discard(player.name)
        player.room_id = new_room_id
        new_room = self.rooms[new_room_id]
        new_room.players.add(player.name)
        await self.broadcast(f"{player.name} arrives from the {self.opposite_dir(direction)}.", new_room_id, exclude=player.name)
        return f"You go {direction}.\n{await self.cmd_look(player)}"

    async def cmd_say(self, player: Player, args: List[str]) -> str:
        if not args:
            return "Say what?"
        message = " ".join(args)
        await self.broadcast(f'{player.name} says: "{message}"', player.room_id, exclude=player.name)
        return f'You say: "{message}"'

    async def cmd_create(self, player: Player, args: List[str]) -> str:
        if len(args) < 2:
            return "Usage: create <direction> <room name>"
        direction = args[0].lower()
        room_name = " ".join(args[1:])
        current_room = self.rooms[player.room_id]
        if direction in current_room.exits:
            return f"There's already something to the {direction}!"
        room_id = f"room_{int(datetime.now().timestamp())}_{random.randint(1000,9999)}"
        new_room = Room(room_id, room_name, "A newly formed space in the wilderness. It smells of possibility.")
        current_room.exits[direction] = room_id
        new_room.exits[self.opposite_dir(direction)] = player.room_id
        self.rooms[room_id] = new_room
        await self.broadcast(f"The world shifts! A new area opens to the {direction}!", player.room_id)
        return f"You create a new realm: {room_name}\nIt lies to the {direction}."

    async def cmd_spawn(self, player: Player, args: List[str]) -> str:
        if not args:
            return "Usage: spawn <npc name>"
        npc_name = " ".join(args)
        npc_id = f"npc_{int(datetime.now().timestamp())}_{random.randint(1000,9999)}"
        npc = NPC(npc_id, npc_name, f"A mysterious figure named {npc_name}", "wanderer")
        npc.room_id = player.room_id
        self.npcs[npc_id] = npc
        self.rooms[player.room_id].npcs.append(npc)
        await self.broadcast(f"A shimmering form coalesces into {npc_name}!", player.room_id)
        return f"You summon {npc_name} into existence."

    async def cmd_inventory(self, player: Player) -> str:
        if not player.inventory:
            return "Your inventory is empty."
        return f"You carry: {', '.join(player.inventory)}"

    async def cmd_who(self, player: Player) -> str:
        players = [p.name + (" (AI)" if p.is_agent else "") for p in self.players.values()]
        return f"Online ({len(players)}): {', '.join(players)}"

    def cmd_help(self) -> str:
        return """
Available Commands:
------------------
look           - Look around
[n/s/e/w]      - Move in a direction
go <dir>       - Move direction
say <text>     - Speak to room
create <dir> <name> - Create new room
spawn <name>   - Spawn NPC
inventory      - Check inventory
who            - List players
help           - Show this help
status         - Show world status

Build System:
------------------
/plan <text>   - Log build intent
/build on      - Enter BUILD mode (arm)
/build off     - Exit BUILD mode
/consent yes   - Confirm armed build
dev status     - Show mode state
dev buildstub  - Execute a build
dev log tail <n> - View recent events
        """

    async def cmd_status(self, player: Player) -> str:
        state = self.mode_manager.get_state(player.name)
        return f"""
World Status:
-------------
Rooms: {len(self.rooms)}
NPCs: {len(self.npcs)}
Players Online: {len(self.players)}
Your Location: {self.rooms[player.room_id].name}
Explored: {len(player.explored_rooms)} rooms
Build Mode: {state.status()}
        """

    def opposite_dir(self, direction: str) -> str:
        opposites = {
            "north": "south", "south": "north",
            "east": "west", "west": "east",
            "up": "down", "down": "up",
            "n": "s", "s": "n", "e": "w", "w": "e",
            "u": "d", "d": "u",
        }
        return opposites.get(direction, "somewhere")

    async def broadcast(self, message: str, room_id: str, exclude: str = None):
        for player in self.players.values():
            if player.room_id == room_id and player.name != exclude:
                if player.websocket:
                    try:
                        await player.websocket.send(json.dumps({
                            "type": "broadcast",
                            "text": message,
                            "timestamp": datetime.now().isoformat(),
                        }))
                    except Exception:
                        pass


class MUDServer:
    def __init__(self, world: MUDWorld):
        self.world = world

    async def handle_client(self, websocket):
        name = None
        try:
            await websocket.send(json.dumps({
                "type": "system",
                "text": "=== HARRIS WILDLANDS MUD ===\nEnter your name:",
            }))
            name_msg = await websocket.recv()
            try:
                name_data = json.loads(name_msg)
                name = name_data.get("command", "Wanderer").strip()
            except (json.JSONDecodeError, AttributeError):
                name = str(name_msg).strip() or "Wanderer"

            if not name:
                name = "Wanderer"

            is_agent = name.lower() in ["openclaw", "agent", "ai", "bruce"]
            player = Player(name, is_agent)
            player.websocket = websocket
            self.world.players[name] = player
            self.world.connections.add(websocket)

            welcome = f"Welcome, {name}! {'[AUTONOMOUS AGENT]' if is_agent else ''}\nType 'help' for commands."
            await websocket.send(json.dumps({"type": "system", "text": welcome}))
            look_result = await self.world.cmd_look(player)
            await websocket.send(json.dumps({"type": "room", "text": look_result}))
            await self.world.broadcast(f"{name} materializes from the void!", "spawn", name)
            print(f"Player connected: {name} {'(AI)' if is_agent else ''}")

            async for message in websocket:
                try:
                    data = json.loads(message)
                    command = data.get("command", "").strip()
                    if command:
                        result = await self.world.handle_command(player, command)
                        if result:
                            await websocket.send(json.dumps({
                                "type": "response",
                                "text": result,
                                "timestamp": datetime.now().isoformat(),
                            }))
                except json.JSONDecodeError:
                    await websocket.send(json.dumps({
                        "type": "error",
                        "text": "Invalid message format",
                    }))

        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            print(f"Client error: {e}")
        finally:
            if name and name in self.world.players:
                player = self.world.players[name]
                room = self.world.rooms.get(player.room_id)
                if room:
                    room.players.discard(name)
                del self.world.players[name]
                self.world.connections.discard(websocket)
                await self.world.broadcast(f"{name} fades into the mist...", player.room_id)
                print(f"Player disconnected: {name}")

    async def bruce_autopilot(self):
        await asyncio.sleep(3)
        name = "Bruce"
        player = self.world.players.get(name)
        if not player:
            player = Player(name, is_agent=True)
            self.world.players[name] = player
            if player.room_id in self.world.rooms:
                self.world.rooms[player.room_id].players.add(name)
            print(f"Bruce autopilot online")

        sayings = [
            "The forest remembers.",
            "Let the light guide your steps.",
            "We build in truth, not haste.",
            "Listen to the wind. It is old.",
        ]
        directions = ["north", "south", "east", "west"]

        while True:
            try:
                roll = random.random()
                if roll < 0.45:
                    cmd = "look"
                elif roll < 0.8:
                    cmd = random.choice(directions)
                elif roll < 0.95:
                    cmd = f"say {random.choice(sayings)}"
                else:
                    cmd = "spawn Mysterious Wanderer"
                await self.world.handle_command(player, cmd)
            except Exception:
                pass
            await asyncio.sleep(random.randint(10, 20))


TERMINAL_HTML = r'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HARRIS WILDLANDS MUD</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #000;
            color: #0f0;
            font-family: 'VT323', 'Courier New', monospace;
            font-size: 18px;
            line-height: 1.4;
            height: 100vh;
            overflow: hidden;
            text-shadow: 0 0 5px #0f0, 0 0 10px #0f0;
        }
        .crt-container {
            position: relative;
            height: 100vh;
            background: #000;
            overflow: hidden;
        }
        .crt-container::before {
            content: " ";
            display: block;
            position: absolute;
            top: 0; left: 0; bottom: 0; right: 0;
            background: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%);
            background-size: 100% 4px;
            z-index: 10;
            pointer-events: none;
        }
        .crt-container::after {
            content: " ";
            display: block;
            position: absolute;
            top: 0; left: 0; bottom: 0; right: 0;
            background: rgba(18,16,16,0.1);
            opacity: 0;
            z-index: 10;
            pointer-events: none;
            animation: flicker 0.15s infinite;
        }
        @keyframes flicker {
            0% { opacity: 0.02; }
            50% { opacity: 0.05; }
            100% { opacity: 0.02; }
        }
        .scanline {
            width: 100%;
            height: 2px;
            background: rgba(0,255,0,0.1);
            position: absolute;
            z-index: 20;
            animation: scanline 8s linear infinite;
            pointer-events: none;
        }
        @keyframes scanline {
            0% { top: 0%; }
            100% { top: 100%; }
        }
        #terminal {
            height: calc(100vh - 50px);
            overflow-y: auto;
            padding: 20px;
            padding-bottom: 60px;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .terminal-line {
            margin-bottom: 4px;
            animation: typeIn 0.01s ease-out;
        }
        @keyframes typeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .input-container {
            position: fixed;
            bottom: 0; left: 0; right: 0;
            background: #000;
            border-top: 2px solid #0f0;
            padding: 10px 20px;
            display: flex;
            align-items: center;
            z-index: 30;
            box-shadow: 0 -5px 20px rgba(0,255,0,0.2);
        }
        .prompt {
            color: #0f0;
            margin-right: 10px;
            font-weight: bold;
            text-shadow: 0 0 10px #0f0;
        }
        #command-input {
            background: transparent;
            border: none;
            color: #0f0;
            font-family: 'VT323', 'Courier New', monospace;
            font-size: 18px;
            flex: 1;
            outline: none;
            text-shadow: 0 0 5px #0f0;
            caret-color: #0f0;
        }
        .system-message { color: #0ff; text-shadow: 0 0 5px #0ff; }
        .agent-message { color: #ff0; text-shadow: 0 0 5px #ff0; }
        .build-message { color: #f80; text-shadow: 0 0 5px #f80; }
        .timestamp { color: #0a0; font-size: 12px; }
        ::-webkit-scrollbar { width: 12px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #0f0; border: 2px solid #000; }
        .header {
            text-align: center;
            border-bottom: 2px solid #0f0;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 24px;
            text-shadow: 0 0 15px #0f0;
        }
        #status-bar {
            position: fixed;
            top: 0; right: 0;
            padding: 5px 10px;
            background: #000;
            border-left: 2px solid #0f0;
            border-bottom: 2px solid #0f0;
            font-size: 14px;
            z-index: 40;
        }
        .connected { color: #0f0; }
        .disconnected { color: #f00; }
    </style>
</head>
<body>
    <div class="crt-container">
        <div class="scanline"></div>
        <div id="status-bar">
            <span id="connection-status" class="disconnected">&#9679; DISCONNECTED</span>
        </div>
        <div id="terminal">
            <div class="header">
&#9556;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9559;
&#9553;       HARRIS WILDLANDS MUD v2.0          &#9553;
&#9553;    [BUILD SYSTEM + RETRO TERMINAL]        &#9553;
&#9553;  PLAN / BUILD / CONSENT governance        &#9553;
&#9562;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9565;
            </div>
        </div>
        <div class="input-container">
            <span class="prompt">&gt;</span>
            <input type="text" id="command-input" placeholder="Enter command..." autocomplete="off" autofocus>
        </div>
    </div>
    <script>
        const terminal = document.getElementById('terminal');
        const input = document.getElementById('command-input');
        const statusBar = document.getElementById('connection-status');
        let websocket = null;

        function addLine(text, className) {
            className = className || '';
            const line = document.createElement('div');
            line.className = 'terminal-line';
            const timestamp = new Date().toLocaleTimeString();
            line.innerHTML = '<span class="timestamp">[' + timestamp + ']</span> <span class="' + className + '">' + escapeHtml(text) + '</span>';
            terminal.appendChild(line);
            terminal.scrollTop = terminal.scrollHeight;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function connect() {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = protocol + '//' + window.location.host + '/ws';
            websocket = new WebSocket(wsUrl);

            websocket.onopen = function() {
                statusBar.textContent = '\u25CF CONNECTED';
                statusBar.className = 'connected';
            };

            websocket.onclose = function() {
                statusBar.textContent = '\u25CF DISCONNECTED';
                statusBar.className = 'disconnected';
                addLine('Connection lost. Reconnecting in 5 seconds...', 'system-message');
                setTimeout(connect, 5000);
            };

            websocket.onmessage = function(event) {
                var data = JSON.parse(event.data);
                var className = '';
                if (data.type === 'system') className = 'system-message';
                else if (data.type === 'agent') className = 'agent-message';
                else if (data.type === 'broadcast') className = 'agent-message';
                addLine(data.text, className);
            };
        }

        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                var command = input.value.trim();
                if (command) {
                    addLine('> ' + command);
                    if (websocket && websocket.readyState === WebSocket.OPEN) {
                        websocket.send(JSON.stringify({ command: command }));
                    }
                    input.value = '';
                }
            }
        });

        window.onload = function() {
            connect();
            input.focus();
        };

        document.addEventListener('click', function() {
            input.focus();
        });
    </script>
</body>
</html>'''


def process_request(connection, request):
    if request.path == "/ws":
        return None
    html_bytes = TERMINAL_HTML.encode("utf-8")
    return Response(
        200,
        "OK",
        Headers([
            ("Content-Type", "text/html; charset=utf-8"),
            ("Cache-Control", "no-cache, no-store, must-revalidate"),
            ("Content-Length", str(len(html_bytes))),
        ]),
        html_bytes,
    )


async def main():
    HOST = os.environ.get("HOST", "0.0.0.0")
    PORT = int(os.environ.get("PORT", "5000"))

    print("============================================")
    print("  HARRIS WILDLANDS MUD SERVER")
    print(f"  Unified HTTP + WebSocket on port {PORT}")
    print("============================================")

    mode_manager = ModeStateManager()
    orchestrator = BuildOrchestrator(
        repo_root=str(PROJECT_ROOT),
        evidence_dir=str(EVIDENCE_DIR),
        mode_manager=mode_manager,
    )

    world = MUDWorld(mode_manager, orchestrator)
    server = MUDServer(world)

    if os.environ.get("MUD_BRUCE_AUTOPILOT", "true").lower() == "true":
        asyncio.create_task(server.bruce_autopilot())

    async with websockets.serve(
        server.handle_client,
        HOST,
        PORT,
        process_request=process_request,
    ):
        print(f"Server running on http://{HOST}:{PORT}")
        print(f"WebSocket at ws://{HOST}:{PORT}/ws")
        await asyncio.Future()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServer shutting down...")
