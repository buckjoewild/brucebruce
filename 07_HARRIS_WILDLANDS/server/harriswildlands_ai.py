# Harris Wildlands Full AI-Integrated Server (Offline Wiki Edition)

import socket
import threading
import argparse
import time
import random
import json
import os
import subprocess
import sys

# --- Orchestrator Integration ---
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from orchestrator.mode_state import ModeStateManager
from orchestrator.build_loop import BuildOrchestrator

# Global orchestrator instances (shared MODE_MANAGER)
_repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # structure/
_evidence_dir = os.path.join(_repo_root, 'evidence')
MODE_MANAGER = ModeStateManager()
BUILD_ORCHESTRATOR = BuildOrchestrator(_repo_root, _evidence_dir, mode_manager=MODE_MANAGER)

# --- AI Controller ---
class AIController:
    def __init__(self, model_path="llama2", temperature=0.7):
        self.model_path = model_path
        self.temperature = temperature

    def query_ai(self, prompt):
        try:
            result = subprocess.run(
                ["ollama", "run", self.model_path],
                input=prompt,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            return result.stdout.strip()
        except Exception as e:
            return f"[AI Error]: {e}"

# --- AI NPC ---
class AINPC:
    def __init__(self, name, personality):
        self.name = name
        self.personality = personality
        self.ai = AIController()
        self.hp = 100
        self.max_hp = 100
        self.xp_value = 0
        self.inventory = []
        self.effects = []
        self.actions = {'talk': "Generated response incoming..."}

    def respond(self, message):
        prompt = f"{self.personality}\nPlayer: {message}\n{self.name}:"
        return self.ai.query_ai(prompt)

# --- Quest Master with Offline Wiki Lore ---
class LLMQuestMaster:
    def __init__(self):
        self.npcs = []
        self.wiki_lore = {
            "var bandor": "Var Bandor is a bustling merchant city in southern Ch'zak, known for its black-stoned streets and rich houses. It's a hub of trade with areas like Ilrin Street and Naidji Alley hiding secrets.",
            "sythtys swamp": "Sythtys Swamp is a murky wetland filled with twisted mangroves, venomous creatures, and hidden magic. Bog witches guard ancient prophecies amid the mist.",
            "ashta harrud": "Ashta Harrud is a desolate desert canyon with red rock formations and howling winds. Nomads roam the sands, facing scorpions and guarding water sources vital for survival.",
            "earendam": "Earendam is an elven city beyond the Dantaron River, with rolling hills and ruins. It's a center of ancient lore, bustling squares, and shadowy forests like Shadowgrove.",
            "default": "An ancient mystery from the lands of Avendar, where heroes rise against forgotten evils."
        }

    def register(self, name, theme, tone):
        personality = f"You are {name}, a quest giver NPC. Your tone is: {tone}. Your quests focus on themes like: {theme}. Be brief, vivid, and interactive."
        self.npcs.append(AINPC(name, personality))

    def fetch_wiki_lore(self, topic):
        return self.wiki_lore.get(topic.lower(), self.wiki_lore["default"])

    def assign_quest(self, npc_name, topic, wiki_mode=True):
        npc = next((n for n in self.npcs if n.name.lower() == npc_name.lower()), None)
        if not npc:
            return f"No NPC named {npc_name} registered."
        lore = self.fetch_wiki_lore(topic) if wiki_mode else ""
        prompt = f"Generate a quest titled '{topic}' in 3 lines. Include reward and task. Infuse with this Avendar lore: {lore}"
        return npc.respond(prompt)

# --- Item Class ---
class Item:
    def __init__(self, name, description, equip_slot=None, flags=None, weight=0.0, ac=0, affects=None, container=False, liquid=False, food=False, potion=False, price=0):
        self.name = name
        self.description = description
        self.equip_slot = equip_slot
        self.flags = flags or []
        self.weight = weight
        self.ac = ac
        self.affects = affects or {}
        self.container = container
        self.inventory = [] if container else None
        self.locked = False if container else None
        self.liquid = liquid
        self.food = food
        self.potion = potion
        self.price = price

# --- Room Class ---
class Room:
    def __init__(self, name, description, exits=None, items=None, npcs=None, level_range=(1, 51), locked=False, water=False, interactables=None):
        self.name = name
        self.description = description
        self.exits = exits or {}
        self.players = []
        self.npcs = npcs or []
        self.items = items or []
        self.corpses = []
        self.level_range = level_range
        self.locked = locked
        self.water = water
        self.door_states = {dir: 'closed' if '+' in dir else 'open' for dir in exits} if exits else {}
        self.interactables = interactables or {}
        self.original_npcs = [npc for npc in npcs] if npcs else []
        self.event_cooldown = 0

# --- Player Class (Simplified) ---
class Player:
    def __init__(self, name):
        self.name = name
        self.hp = 100
        self.mana = 100
        self.mv = 100
        self.quests = {}
        self.room = None

    def start_quest(self, quest_id, quest_data):
        self.quests[quest_id] = quest_data
        print(f"Quest started: {quest_data['description']}")

# --- Game Logic ---
def setup_world(questmaster):
    rooms = []
    center_square = Room(
        "Center Square",
        "A burbling fountain dominates the center of the square...",
        items=[Item("marble fountain", "A large marble fountain gurgles peacefully here.")],
        npcs=[
            AINPC("Bruce™", "You are Bruce™, a chaotic but loving surfer-sage...")
        ],
        level_range=(1, 51),
        interactables={'fountain': {'drink': 'You drink from the fountain, feeling refreshed.'}}
    )
    rooms.append(center_square)
    questmaster.register("Seer Elowen", "prophecy, lost magic, balance", "mystic and kind")
    for room in rooms:
        room.original_npcs = room.npcs[:]
    return center_square, rooms

# --- Command Handling ---
def process_command(player, bruce, command, world_rooms, questmaster):
    parts = command.split()
    if not parts:
        return ""
    cmd = parts[0].lower()
    args = " ".join(parts[1:])

    # --- Mode/Build Commands (Orchestrator Integration) ---
    if cmd == "/plan":
        state = MODE_MANAGER.get_state(player.name)
        return state.set_plan(args)

    elif cmd == "/build":
        state = MODE_MANAGER.get_state(player.name)
        if args.lower() == "on":
            result = state.enter_build_mode()
            return result + "\n" + state.arm()
        elif args.lower() == "off":
            state.armed = False
            state.consented = False
            return "Build disarmed."
        else:
            return "Usage: /build on | /build off"

    elif cmd == "/consent":
        state = MODE_MANAGER.get_state(player.name)
        if args.lower() == "yes":
            return state.consent()
        else:
            return "Usage: /consent yes"

    elif cmd == "dev":
        arg_parts = args.split()
        subcmd = arg_parts[0].lower() if arg_parts else ""

        if subcmd == "status":
            state = MODE_MANAGER.get_state(player.name)
            return state.status()

        elif subcmd == "buildstub":
            # Execute a stub build - requires armed+consent
            state = MODE_MANAGER.get_state(player.name)
            if not state.can_build():
                return f"BUILD BLOCKED: {state.status()}\nUse /build on -> /consent yes first."

            # Run the build via orchestrator
            build_args = " ".join(arg_parts[1:]) if len(arg_parts) > 1 else ""
            result = BUILD_ORCHESTRATOR.execute_build(
                player_id=player.name,
                verb="dev buildstub",
                args={"raw": build_args},
                intent=state.last_plan_text,
            )
            return result

        elif subcmd == "log":
            # Show recent build events
            count = int(arg_parts[2]) if len(arg_parts) > 2 else 5
            events = BUILD_ORCHESTRATOR.get_event_log_tail(count)
            if not events:
                return "No build events logged yet."
            output = "Recent build events:\n"
            for evt in events:
                output += f"  [{evt.get('ts', '?')[:19]}] {evt.get('verb', '?')} -> {evt.get('result', '?')}\n"
            return output

        else:
            return "Dev commands: dev status | dev buildstub | dev log tail <n>"

    # --- Original commands ---
    elif cmd == "quest":
        return questmaster.assign_quest("Seer Elowen", args)
    elif cmd == "tell":
        target_name, message = args.split(" ", 1)
        target = next((n for n in player.room.npcs if target_name.lower() in n.name.lower()), None)
        if target and isinstance(target, AINPC) and "quest" in message.lower():
            quest_response = target.respond(message)
            print(f"{target.name}: {quest_response}")
            player.start_quest("ai_quest", {"description": quest_response, "type": "ai_generated", "progress": 0, "goal": 1, "xp_reward": 500})
            return ""
        return "They are not here."
    return "Unknown command."

# --- Game Loop ---
def game_loop(player, bruce, starting_room, world_rooms, questmaster):
    player.room = starting_room
    starting_room.players.append(player)
    print(f"Welcome to Harris Wildlands! You start in {player.room.name}.")
    while True:
        command = input(f"<{player.hp}hp {player.mana}m {player.mv}mv> ").strip()
        if command == "quit":
            print("Thanks for playing!")
            break
        response = process_command(player, bruce, command, world_rooms, questmaster)
        print(response)

# --- Entry Point ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--server', action='store_true')
    args = parser.parse_args()

    questmaster = LLMQuestMaster()
    starting_room, world_rooms = setup_world(questmaster)
    bruce = next((n for r in world_rooms for n in r.npcs if isinstance(n, AINPC) and n.name == "Bruce™"), None)

    if args.server:
        print("[Server mode not implemented in this canvas snippet]")
    else:
        game_loop(Player("Wildlander"), bruce, starting_room, world_rooms, questmaster)
