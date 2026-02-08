#!/usr/bin/env python3
"""
Harris Wilderness MUD Server
Bruce's Living ASCII World
"""

import asyncio
import websockets
import json
import random
import os
from datetime import datetime
from typing import Dict, List, Set

class Room:
    def __init__(self, id: str, name: str, description: str):
        self.id = id
        self.name = name
        self.description = description
        self.exits = {}
        self.objects = []
        self.npcs = []
        self.players = set()
        self.created_at = datetime.now()
        
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "exits": self.exits,
            "objects": self.objects,
            "npcs": [npc.to_dict() for npc in self.npcs],
            "players": list(self.players)
        }

class NPC:
    def __init__(self, id: str, name: str, description: str, npc_type: str = "wanderer"):
        self.id = id
        self.name = name
        self.description = description
        self.type = npc_type
        self.room_id = None
        self.ai_mood = random.choice(["friendly", "mysterious", "helpful"])
        
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "type": self.type,
            "mood": self.ai_mood
        }

class Player:
    def __init__(self, name: str, is_agent: bool = False):
        self.name = name
        self.room_id = "spawn"
        self.inventory = []
        self.is_agent = is_agent
        self.websocket = None
        self.explored_rooms = set()
        
    def to_dict(self):
        return {
            "name": self.name,
            "room": self.room_id,
            "is_agent": self.is_agent,
            "inventory": self.inventory,
            "explored": len(self.explored_rooms)
        }

class MUDWorld:
    def __init__(self):
        self.rooms: Dict[str, Room] = {}
        self.players: Dict[str, Player] = {}
        self.npcs: Dict[str, NPC] = {}
        self.connections: Set = set()
        if not self.load_world():
            self.init_world()
        
    def load_world(self) -> bool:
        """Load world data from JSON files if present."""
        import os
        base = os.path.join(os.path.dirname(__file__), "..", "world")
        rooms_path = os.path.join(base, "rooms.json")
        npcs_path = os.path.join(base, "npcs.json")
        if not os.path.exists(rooms_path):
            return False
        try:
            with open(rooms_path, "r", encoding="utf-8") as f:
                rooms_data = json.load(f)
            for r in rooms_data.get("rooms", []):
                room = Room(r["id"], r["name"], r["description"])
                room.exits = r.get("exits", {})
                room.objects = r.get("objects", [])
                self.rooms[room.id] = room
            # load npcs
            if os.path.exists(npcs_path):
                with open(npcs_path, "r", encoding="utf-8") as f:
                    npcs_data = json.load(f)
                for n in npcs_data.get("npcs", []):
                    npc = NPC(n["id"], n["name"], n["description"], n.get("type", "wanderer"))
                    npc.room_id = n.get("room_id")
                    self.npcs[npc.id] = npc
                    if npc.room_id in self.rooms:
                        self.rooms[npc.room_id].npcs.append(npc)
            print(" World loaded from JSON with", len(self.rooms), "rooms")
            return True
        except Exception as e:
            print(" Failed to load world data:", e)
            return False
        
    def init_world(self):
        # Spawn point
        spawn = Room("spawn", "The Clearing", 
            "A mossy clearing surrounded by ancient pines. Sunlight filters through the canopy.")
        spawn.objects = ["stone altar", "glowing mushrooms"]
        
        # Create world
        rooms_data = [
            ("forest_north", "Whispering Pines", "Tall pine trees whisper secrets in the wind."),
            ("forest_east", "Misty Ravine", "A narrow ravine shrouded in perpetual mist."),
            ("forest_south", "Crystal Stream", "A clear stream sparkles with otherworldly light."),
            ("forest_west", "Ancient Grove", "Ancient oaks older than memory stand in a circle."),
        ]
        
        for room_id, name, desc in rooms_data:
            self.rooms[room_id] = Room(room_id, name, desc)
        
        # Connect rooms
        spawn.exits = {"north": "forest_north", "east": "forest_east", 
                       "south": "forest_south", "west": "forest_west"}
        self.rooms["forest_north"].exits = {"south": "spawn"}
        self.rooms["forest_east"].exits = {"west": "spawn"}
        self.rooms["forest_south"].exits = {"north": "spawn"}
        self.rooms["forest_west"].exits = {"east": "spawn"}
        
        self.rooms["spawn"] = spawn
        
        # Create NPCs
        npcs_data = [
            ("elder_willow", "Elder Willow", "An ancient mystic who tends the forest", "mystic", "spawn"),
        ]
        
        for npc_id, name, desc, npc_type, room_id in npcs_data:
            npc = NPC(npc_id, name, desc, npc_type)
            npc.room_id = room_id
            self.npcs[npc_id] = npc
            self.rooms[room_id].npcs.append(npc)
        
        print(" World initialized with", len(self.rooms), "rooms")
    
    async def handle_command(self, player: Player, command_line: str) -> str:
        parts = command_line.strip().split()
        if not parts:
            return ""
            
        cmd = parts[0].lower()
        args = parts[1:]
        
        if cmd == "look":
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
            exits = [f"{dir} ({self.rooms.get(rid, Room('', 'Unknown', '')).name})" 
                    for dir, rid in room.exits.items()]
            result += f"\nExits: {', '.join(exits)}\n"
        
        return result
    
    async def cmd_go(self, player: Player, args: List[str]) -> str:
        if not args:
            return "Go where?"
        
        direction_map = {
            "n": "north", "s": "south", "e": "east", "w": "west",
            "u": "up", "d": "down"
        }
        
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
        
        await self.broadcast(f"{player.name} arrives from the {self.opposite_dir(direction)}.", 
                           new_room_id, exclude=player.name)
        
        return f"You go {direction}.\n{await self.cmd_look(player)}"
    
    async def cmd_say(self, player: Player, args: List[str]) -> str:
        if not args:
            return "Say what?"
        
        message = ' '.join(args)
        room_id = player.room_id
        
        await self.broadcast(f"{player.name} says: \"{message}\"", room_id, exclude=player.name)
        
        return f"You say: \"{message}\""
    
    async def cmd_create(self, player: Player, args: List[str]) -> str:
        if len(args) < 2:
            return "Usage: create <direction> <room name>"
        
        direction = args[0].lower()
        room_name = ' '.join(args[1:])
        
        current_room = self.rooms[player.room_id]
        
        if direction in current_room.exits:
            return f"There's already something to the {direction}!"
        
        room_id = f"room_{int(datetime.now().timestamp())}_{random.randint(1000,9999)}"
        new_room = Room(room_id, room_name, 
            f"A newly formed space in the wilderness. It smells of possibility.")
        
        current_room.exits[direction] = room_id
        new_room.exits[self.opposite_dir(direction)] = player.room_id
        
        self.rooms[room_id] = new_room
        
        await self.broadcast(f"The world shifts! A new area opens to the {direction}!", 
                           player.room_id)
        
        return f"You create a new realm: {room_name}\nIt lies to the {direction}."
    
    async def cmd_spawn(self, player: Player, args: List[str]) -> str:
        if not args:
            return "Usage: spawn <npc name>"
        
        npc_name = ' '.join(args)
        npc_id = f"npc_{int(datetime.now().timestamp())}_{random.randint(1000,9999)}"
        
        npc = NPC(npc_id, npc_name, f"A mysterious figure named {npc_name}", "wanderer")
        npc.room_id = player.room_id
        
        self.npcs[npc_id] = npc
        self.rooms[player.room_id].npcs.append(npc)
        
        await self.broadcast(f"A shimmering form coalesces into {npc_name}!", 
                           player.room_id)
        
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
        """
    
    async def cmd_status(self, player: Player) -> str:
        return f"""
World Status:
-------------
Rooms: {len(self.rooms)}
NPCs: {len(self.npcs)}
Players Online: {len(self.players)}
Your Location: {self.rooms[player.room_id].name}
Explored: {len(player.explored_rooms)} rooms
        """
    
    def opposite_dir(self, direction: str) -> str:
        opposites = {
            "north": "south", "south": "north",
            "east": "west", "west": "east",
            "up": "down", "down": "up",
            "n": "s", "s": "n", "e": "w", "w": "e",
            "u": "d", "d": "u"
        }
        return opposites.get(direction, "somewhere")
    
    async def broadcast(self, message: str, room_id: str, exclude: str = None):
        for player in self.players.values():
            if player.room_id == room_id and player.name != exclude:
                if player.websocket and not player.websocket.closed:
                    try:
                        await player.websocket.send(json.dumps({
                            "type": "broadcast",
                            "text": message,
                            "timestamp": datetime.now().isoformat()
                        }))
                    except:
                        pass

class MUDServer:
    def __init__(self, world: MUDWorld, host: str = "localhost", port: int = 4008):
        self.world = world
        self.host = host
        self.port = port
        
    async def handle_client(self, websocket, path=None):
        name = None
        try:
            await websocket.send(json.dumps({
                "type": "system",
                "text": "=== HARRIS WILDERNESS MUD ===\nEnter your name:"
            }))
            
            name_msg = await websocket.recv()
            # Handle both JSON and plain text
            try:
                name_data = json.loads(name_msg)
                name = name_data.get("command", "Wanderer").strip()
            except json.JSONDecodeError:
                name = str(name_msg).strip() or "Wanderer"
            
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
            
            print(f" Player connected: {name} {'(AI)' if is_agent else ''}")
            
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
                                "timestamp": datetime.now().isoformat()
                            }))
                            
                except json.JSONDecodeError:
                    await websocket.send(json.dumps({
                        "type": "error",
                        "text": "Invalid message format"
                    }))
                    
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            if name in self.world.players:
                player = self.world.players[name]
                room = self.world.rooms.get(player.room_id)
                if room:
                    room.players.discard(name)
                del self.world.players[name]
                self.world.connections.discard(websocket)
                await self.world.broadcast(f"{name} fades into the mist...", player.room_id)
                print(f" Player disconnected: {name}")
    
    async def start(self):
        print(f" MUD Server starting on ws://{self.host}:{self.port}")

        # Optional persistent Bruce autopilot
        if os.environ.get("MUD_BRUCE_AUTOPILOT", "true").lower() == "true":
            asyncio.create_task(self.bruce_autopilot())

        async with websockets.serve(self.handle_client, self.host, self.port):
            print(" Server running!")
            await asyncio.Future()

    async def bruce_autopilot(self):
        name = os.environ.get("MUD_BRUCE_NAME", "Bruce")
        player = self.world.players.get(name)
        if not player:
            player = Player(name, is_agent=True)
            self.world.players[name] = player
            if player.room_id in self.world.rooms:
                self.world.rooms[player.room_id].players.add(name)
            print(f" Bruce autopilot online as {name}")

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

def main():
    print(
        "============================================\\n"
        "  HARRIS WILDERNESS MUD SERVER\\n"
        "  Bruce's ASCII World\\n"
        "============================================"
    )
    
    world = MUDWorld()
    mud_port = int(os.environ.get("MUD_PORT", "4008"))
    server = MUDServer(world, port=mud_port)
    
    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        print("\n Server shutting down...")

if __name__ == "__main__":
    main()

