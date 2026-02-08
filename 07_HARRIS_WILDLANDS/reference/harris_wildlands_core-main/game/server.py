import socket
import threading
import argparse
import time
import random
import json
import os
import sqlite3
import subprocess

# === Avendar Class Lore Database ===
with open("avendar_wiki_lore.json", "r") as lore_file:
    AVENDAR_CLASSES = json.load(lore_file)

# === Class Metadata ===
class ClassData:
    def __init__(self, name, description, skills, spells, titles):
        self.name = name
        self.description = description
        self.skills = skills
        self.spells = spells
        self.titles = titles

CLASS_REGISTRY = {
    "swordmaster": ClassData(
        name="Swordmaster",
        description=AVENDAR_CLASSES.get("swordmaster", "Elite blade master."),
        skills=["bash", "trip", "whirlwind", "parry"],
        spells=[],
        titles=["Blade Novice", "Blade Adept", "Swordmaster"]
    ),
    "mage": ClassData(
        name="Mage",
        description=AVENDAR_CLASSES.get("mage", "Master of arcane arts."),
        skills=["lore", "meditation"],
        spells=["iceshard", "cone of cold", "fireball"],
        titles=["Arcanist", "Elementalist", "Archmage"]
    ),
    # Add more classes here
}

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

# --- AI NPC (Vendor for Economy) ---
class AINPC:
    def __init__(self, name, personality, hp=100, attacks=None, inventory=None, is_vendor=False):
        self.name = name
        self.personality = personality
        self.ai = AIController()
        self.hp = hp
        self.max_hp = hp
        self.xp_value = random.randint(50, 100)
        self.inventory = inventory or []  # For vendors
        self.effects = []
        self.actions = {'talk': "Generated response incoming..."}
        self.attacks = attacks or {"punch": (5, 10)}
        self.is_vendor = is_vendor

    def respond(self, message):
        prompt = f"{self.personality}\nPlayer: {message}\n{self.name}:"
        return self.ai.query_ai(prompt)

    def attack(self):
        attack_type = random.choice(list(self.attacks.keys()))
        min_dmg, max_dmg = self.attacks[attack_type]
        return random.randint(min_dmg, max_dmg), attack_type

    def sell(self, item_name, player):
        item = next((i for i in self.inventory if i.name.lower() == item_name.lower()), None)
        if item and player.gold >= item.price:
            player.gold -= item.price
            player.inventory.append(item)
            self.inventory.remove(item)
            return f"You buy {item.name} for {item.price} gold."
        return "Can't sell that."

    def buy(self, item_name, player):
        item = next((i for i in player.inventory if i.name.lower() == item_name.lower()), None)
        if item:
            player.gold += item.price // 2  # Half price
            self.inventory.append(item)
            player.inventory.remove(item)
            return f"You sell {item.name} for {item.price // 2} gold."
        return "You don't have that."

# --- Quest Master (with task/progress/rewards) ---
class LLMQuestMaster:
    def __init__(self):
        self.npcs = []
        self.wiki_lore = self.load_wiki_lore()

    def load_wiki_lore(self):
        filename = "avendar_wiki_lore.json"
        if os.path.exists(filename):
            with open(filename, 'r') as f:
                return json.load(f)
        else:
            return {"default": "An ancient mystery from the lands of Avendar..."}

    def register(self, name, theme, tone):
        personality = f"You are {name}, quest giver. Tone: {tone}. Quests: {theme}. Be brief, vivid, interactive."
        self.npcs.append(AINPC(name, personality))

    def fetch_wiki_lore(self, topic):
        return self.wiki_lore.get(topic.lower(), self.wiki_lore["default"])

    def assign_quest(self, npc_name, topic, wiki_mode=True):
        npc = next((n for n in self.npcs if n.name.lower() == npc_name.lower()), None)
        if not npc:
            return f"No NPC named {npc_name} registered."
        lore = self.fetch_wiki_lore(topic) if wiki_mode else ""
        prompt = f"Generate quest '{topic}' in 3 lines. Reward/task. Infuse Avendar lore: {lore}"
        response = npc.respond(prompt)
        # Parse (stub - assume "Task: X" "Reward: Y")
        task = "Complete X"  # Parse
        reward = "Y item/gold"  # Parse
        return response, task, reward

# --- Item Class (with Tuck's shoes) ---
class Item:
    def __init__(self, name, description, equip_slot=None, flags=None, weight=0.0, ac=0, affects=None, container=False, liquid=False, food=False, potion=False, price=0, damage=None):
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
        self.damage = damage  # (dice, type)

    def identify(self):
        return f"Object: {self.name}\nDescription: {self.description}\nAffects: {self.affects}\nDamage: {self.damage}\nPrice: {self.price}"

# --- Room Class (with ambiance/terrain) ---
class Room:
    def __init__(self, name, description, exits=None, items=None, npcs=None, level_range=(1, 51), locked=False, water=False, interactables=None, terrain="normal", ambiance=None):
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
        self.door_states = {d: 'closed' if locked else 'open' for d in exits} if exits else {}
        self.interactables = interactables or {}
        self.original_npcs = [npc for npc in npcs] if npcs else []
        self.terrain = terrain  # "water", "mountain"
        self.ambiance = ambiance or ["Wind blows...", "Distant shouts..."]  # flavor lines

    def get_ambiance(self):
        return random.choice(self.ambiance) if self.ambiance else ""

# --- Player Class (Phase 5: Economy/PvP/Procedural) ---
class Player:
    def __init__(self, name, race="human", class_type="warrior"):
        self.name = name
        self.race = race
        self.class_type = class_type
        self.hp = 422
        self.max_hp = 422
        self.mana = 366
        self.max_mana = 366
        self.mv = 238
        self.max_mv = 238
        self.exp = 0
        self.ep = 0
        self.gold = 100  # Economy start
        self.quests = {}  # quest_id: {"desc": "", "task": "", "progress": 0, "reward": ""}
        self.room = None
        self.inventory = [Item("shoes of speed", "Tuck's custom shoes of speed. (mv+50, res fatigue 3, dex+2, hp+10).", equip_slot="feet", affects={"mv": 50, "res fatigue": 3, "dex": 2, "hp": 10}, price=200)]  # Tuck's item
        self.equipped = {}
        self.skills = {"dagger": 1, "sword": 75, "dodge": 1, "dual wield": 1, "disarm": 1, "parry": 1, "meditation": 1, "rescue": 1, "enhanced damage": 1, "grace": 1, "recover": 1, "second attack": 1, "third attack": 1, "fourth attack": 1, "stunning blow": 1, "trance": 1, "offhand parry": 1, "offhand disarm": 1, "feint": 1, "reversal of fortune": 1, "versatility": 1, "favored blade": 1}  # expanded
        self.spells = {"armor": 75, "detect invis": 75, "create food": 75, "iceshard": 79, "create spring": 75, "noble refuge": 75, "shield": 75, "frozen shield": 75, "sunset sigil": 75, "frostbrand": 1, "refresh": 1, "whiteout": 1, "rotheld's bulwark": 1, "icebolt": 1, "rune of life": 1, "sanctuary": 1, "douse": 1, "mending": 1, "cone of cold": 1, "holy water": 1, "wall of water": 1, "glyph of frost": 1, "icy prison": 1, "freeze": 1}  # expanded
        self.language = "common"
        self.effects = []  # e.g., "flying", "sanctuary"
        self.combat_target = None
        self.group = []  # list players
        self.leader = None  # for follow
        self.forms = {"monkey": False}
        self.pvp_consent = False  # PvP toggle
        self.apply_race_class()  # Init
        self.title = CLASS_REGISTRY[self.class_type].titles[0] if self.class_type in CLASS_REGISTRY else "Adventurer"
        self.level = 1

    def apply_race_class(self):
        if self.race == "caladaran":
            self.max_mana += 20
            # Limit heavy gear
        if self.class_type == "swordmaster":
            self.skills["sword"] = 100
            # Limit spells

    def toggle_pvp(self):
        self.pvp_consent = not self.pvp_consent
        return "PvP " + ("on" if self.pvp_consent else "off")

    def pvp_attack(self, other_player):
        if other_player.pvp_consent and self.pvp_consent:
            self.combat_target = other_player
            return f"You attack {other_player.name} (PvP)!"
        return "No consent."

    def trade(self, item_name, other_player):
        item = next((i for i in self.inventory if i.name.lower() == item_name.lower()), None)
        if item:
            self.inventory.remove(item)
            other_player.inventory.append(item)
            return f"You trade {item.name} to {other_player.name}."
        return "No item."

    def buy(self, item_name, vendor):
        if vendor.is_vendor:
            return vendor.sell(item_name, self)
        return "Not a vendor."

    def sell(self, item_name, vendor):
        if vendor.is_vendor:
            return vendor.buy(item_name, self)
        return "Not a vendor."

    def start_quest(self, quest_id, quest_data, task, reward):
        self.quests[quest_id] = {"desc": quest_data, "task": task, "progress": 0, "reward": reward}
        return f"Quest started: {quest_data}"

    def update_quest(self, quest_id, progress):
        if quest_id in self.quests:
            self.quests[quest_id]["progress"] += progress
            if self.quests[quest_id]["progress"] >= 100:
                reward = self.quests[quest_id]["reward"]
                if "gold" in reward:
                    self.gold += 100  # Stub
                elif "item" in reward:
                    self.inventory.append(Item("reward item", "A reward.", price=50))
                return f"Quest complete! Reward: {reward}"
            return f"Quest progress: {self.quests[quest_id]['progress']}%"
        return "No quest."

    def level_up(self):
        self.level += 1
        try:
            self.title = CLASS_REGISTRY[self.class_type].titles[min(self.level // 5, len(CLASS_REGISTRY[self.class_type].titles) - 1)]
        except:
            self.title = "Adventurer"

    def gain_xp(self, amount):
        self.exp += amount
        xp_needed = self.level * 100
        if self.exp >= xp_needed:
            self.exp -= xp_needed
            self.level_up()
            return f"Level up! You are now level {self.level} - {self.title}"
        return f"You gain {amount} XP."

    def cast(self, spell_name):
        if spell_name not in CLASS_REGISTRY[self.class_type].spells:
            return f"You do not know the spell '{spell_name}'."
        cost = 10
        if self.mana < cost:
            return "You don't have enough mana."
        self.mana -= cost
        return f"You cast {spell_name}!"

    def skill_success(self, skill_name):
        success_rate = 70 + (self.level * 2)
        roll = random.randint(1, 100)
        return roll <= success_rate

# --- Enemy Class (from Bruce) ---
class Enemy:
    def __init__(self, name, level, tags):
        self.name = name
        self.hp = 100 + (level * 10)
        self.tags = tags
        self.level = level

    def is_alive(self):
        return self.hp > 0

# --- World Setup ---
def setup_world(questmaster):
    rooms = {}
    # Var Bandor Center Square
    center_square = Room(
        "Center Square",
        "A burbling fountain dominates the center of the square... (full log desc)",
        exits={},
        items=[Item("marble fountain", "A large marble fountain gurgles peacefully here.")],
        npcs=[AINPC("Bruce™", "You are Bruce™, a chaotic but loving surfer-sage...", attacks={"punch": (5, 10)})],
        ambiance=["The fountain burbles peacefully.", "Citizens chatter nearby."],
    )
    rooms["center_square"] = center_square

    # Ilrin Street
    ilrin_street = Room(
        "Ilrin Street",
        "A wide street composed of black stones... (log)",
        exits={"north": center_square, "south": None, "east": None, "west": None},
        items=[Item("basket of flowers", "Baskets of flowers hang from the sides of buildings.")],
        npcs=[AINPC("young scholar", "A young scholar of Var Bandor walks along the street.", hp=100, attacks={"punch": (5, 10)}),
              AINPC("hired servant", "A hired servant tends to shaped shrubs.", hp=80, attacks={"kick": (5, 15)})],
    )
    rooms["ilrin_street"] = ilrin_street
    center_square.exits["south"] = ilrin_street
    ilrin_street.exits["north"] = center_square

    # Wheelwright's
    wheelwright = Room(
        "The Wheelwright's",
        "The room is filled with thick dust... (log)",
        exits={"north": ilrin_street},
        items=[Item("huge wooden wheel", "A huge, wooden wheel is here lying broken on the ground.", weight=20),
               Item("saw", "A saw for carving.", damage=(5, 10, "slash"))],
        npcs=[AINPC("Terintbanch Plun", "Terintbanch is bending pieces of metal and wood to his will.", hp=150, attacks={"pierce": (10, 20)})],
    )
    rooms["wheelwright"] = wheelwright
    ilrin_street.exits["south"] = wheelwright
    wheelwright.exits["north"] = ilrin_street

    # Iron Street
    iron_street = Room(
        "Iron Street",
        "Iron street is in a working class part of Var Bandor... (log)",
        exits={"north": None, "east": ilrin_street, "south": wheelwright, "west": None},
        items=[Item("cramped house", "Small, cramped houses line the streets.")],
        npcs=[AINPC("Bromrin", "Bromrin, alatharyan Captain of Var Bandor law enforcement, patrols here.", hp=200, attacks={"slash": (15, 25)}),
              AINPC("child", "A child wearing ragged clothes plays outdoors.", hp=50, attacks={"kick": (2, 5)})],
    )
    rooms["iron_street"] = iron_street
    ilrin_street.exits["west"] = iron_street
    iron_street.exits["east"] = ilrin_street
    wheelwright.exits["west"] = iron_street
    iron_street.exits["south"] = wheelwright

    # Tower of Water Antechamber
    antechamber = Room(
        "Antechamber",
        "This is the antechamber to the well-known Tower of Water... (log)",
        exits={"north": None, "south": None},
        items=[Item("blue-pillowed chair", "Blue-pillowed chairs line the room.")],
        npcs=[AINPC("spirit templar", "A spirit templar stands guard inside the Tower of Water.", hp=300, attacks={"bash": (20, 30)})],
    )
    rooms["antechamber"] = antechamber

    # Chamber of Spirit
    chamber_spirit = Room(
        "The Chamber of Spirit",
        "This chamber is used by the visiting scholars of spirit... (log)",
        exits={"north": antechamber, "east": None},
        npcs=[AINPC("Guildmaster Baldrae", "Guildmaster Baldrae, leader of the Spirit Scholars, practices an incantation.", hp=250, attacks={"energy": (15, 25)})],
    )
    rooms["chamber_spirit"] = chamber_spirit
    antechamber.exits["south"] = chamber_spirit
    chamber_spirit.exits["north"] = antechamber

    # Chamber of Water
    chamber_water = Room(
        "The Chamber of Water",
        "The dominant faction in the tower, the scholars of water... (log)",
        exits={"north": chamber_spirit, "west": None},
        npcs=[AINPC("Guildmaster Lenimbar", "Guildmaster Lenimbar, leader of the Water Scholars, studies at a desk.", hp=250, attacks={"iceshard": (15, 25)})],
        items=[Item("bed", "A few beds are here for the most injured.")],
    )
    rooms["chamber_water"] = chamber_water
    chamber_spirit.exits["east"] = chamber_water
    chamber_water.exits["west"] = chamber_spirit

    # Stairwell
    stairwell = Room(
        "Stairwell",
        "Carved from solid granite, this stairwell leads up to the second floor... (log)",
        exits={"south": chamber_water, "up": None},
        npcs=[AINPC("Guildmaster Porsom", "Slightly overweight, Guildmaster Porsom awaits students to instruct.", hp=200, attacks={"pound": (10, 20)})],
    )
    rooms["stairwell"] = stairwell
    chamber_water.exits["north"] = stairwell
    stairwell.exits["south"] = chamber_water

    # Arcanos Street
    arcanos_street = Room(
        "Arcanos Street",
        "Arcanos Street is a wide avenue paved with gray stones... (log)",
        exits={"north": None, "east": None, "south": antechamber, "west": ilrin_street},
        npcs=[AINPC("journeyman templar", "A journeyman templar of the Var Bandor faction walks along the street.", hp=150, attacks={"slash": (10, 20)}),
              AINPC("messenger", "A messenger strides along the street with a delivery.", hp=100, attacks={"punch": (5, 10)})],
    )
    rooms["arcanos_street"] = arcanos_street
    antechamber.exits["north"] = arcanos_street
    arcanos_street.exits["south"] = antechamber
    ilrin_street.exits["east"] = arcanos_street
    arcanos_street.exits["west"] = ilrin_street

    # Commerce Street
    commerce_street = Room(
        "Commerce Street",
        "Surrounded by newly constructed buildings, Commerce Street winds through the merchant quarter... (log)",
        exits={"north": None, "east": ilrin_street, "west": None},
        npcs=[],
    )
    rooms["commerce_street"] = commerce_street
    ilrin_street.exits["west"] = commerce_street
    commerce_street.exits["east"] = ilrin_street

    # Dantaron Street
    dantaron_street = Room(
        "Dantaron Street",
        "Dantaron Street bisects the west half of Var Bandor... (log)",
        exits={"north": None, "east": center_square, "south": None, "west": None},
        npcs=[AINPC("spirit templar", "A spirit templar stands guard.", hp=300, attacks={"bash": (20, 30)})],
    )
    rooms["dantaron_street"] = dantaron_street
    center_square.exits["west"] = dantaron_street
    dantaron_street.exits["east"] = center_square

    # Eastern Docks
    eastern_docks = Room(
        "The Eastern Docks of Var Bandor",
        "You stand near the edge of the docks of Var Bandor... (log)",
        exits={"north": None, "east": None, "south": None, "west": dantaron_street},
        npcs=[AINPC("citizen", "A citizen of Var Bandor strolls along.", hp=100, attacks={"punch": (5, 10)}),
              AINPC("recently disembarked traveler", "A recently disembarked traveler strolls along the docks.", hp=80, attacks={"kick": (3, 8)})],
    )
    rooms["eastern_docks"] = eastern_docks
    dantaron_street.exits["west"] = eastern_docks
    eastern_docks.exits["east"] = dantaron_street  # Swap if needed

    # Aragol River
    aragol_river = Room(
        "The Aragol River",
        "The Aragol river runs swiftly over shallow rocks and small, dark pools... (log)",
        exits={"north": eastern_docks, "south": None, "east": None, "west": None},
        water=True,
        npcs=[AINPC("dusty brown goose", "A dusty brown goose waddles about nervously.", hp=50, attacks={"peck": (2, 5)})],
    )
    rooms["aragol_river"] = aragol_river
    eastern_docks.exits["east"] = aragol_river
    aragol_river.exits["west"] = eastern_docks

    # Mountain Trail
    mountain_trail = Room(
        "A Mountain Trail",
        "A footpath worn by years of travelers curves downwards at this point... (log)",
        exits={"east": None, "down": None},
        terrain="mountain",
        npcs=[AINPC("mountain bear", "A mountain bear climbs along the rocky trail.", hp=200, attacks={"claw": (15, 25)})],
    )
    rooms["mountain_trail"] = mountain_trail
    # Link to river or others...

    # Intersection of Mountain Paths
    intersection = Room(
        "An Intersection of Mountain Paths",
        "A footpath worn into the mountain stone splits in two directions... (log)",
        exits={"north": None, "east": mountain_trail, "south": None},
        terrain="mountain",
        npcs=[AINPC("antelope", "An antelope makes its way along the mountain path.", hp=80, attacks={"kick": (5, 15)})],
    )
    rooms["intersection"] = intersection
    mountain_trail.exits["west"] = intersection
    intersection.exits["east"] = mountain_trail

    # Twisting Mountain Trail
    twisting_trail = Room(
        "A Twisting Mountain Trail",
        "A twisting mountain trail bends its way between outcroppings of stone... (log)",
        exits={"north": intersection, "east": None, "south": None, "west": None, "up": None, "down": None},
        terrain="mountain",
        npcs=[AINPC("hill giant", "A large hill giant clad in bear skins searches for game.", hp=250, attacks={"smash": (20, 30)})],
    )
    rooms["twisting_trail"] = twisting_trail
    intersection.exits["south"] = twisting_trail
    twisting_trail.exits["north"] = intersection

    # Rugged Mountain Path
    rugged_path = Room(
        "A Rugged Mountain Path",
        "A rugged mountain path leads between jagged rocks... (log)",
        exits={"east": twisting_trail, "west": None, "down": None},
        terrain="mountain",
        npcs=[],
    )
    rooms["rugged_path"] = rugged_path
    twisting_trail.exits["west"] = rugged_path
    rugged_path.exits["east"] = twisting_trail

    # Nearing a Mountain Peak
    nearing_peak = Room(
        "Nearing a Mountain Peak",
        "The mountainside slopes sharply upward to the south... (log)",
        exits={"north": None, "east": rugged_path, "south": None},
        terrain="mountain",
        npcs=[],
    )
    rooms["nearing_peak"] = nearing_peak
    rugged_path.exits["up"] = nearing_peak
    nearing_peak.exits["down"] = rugged_path

    # Mountain Peak
    mountain_peak = Room(
        "A Mountain Peak",
        "The rough trail disappears entirely as the jagged mountainside rises to its peak... (log)",
        exits={"north": None, "west": nearing_peak},
        terrain="mountain",
        npcs=[AINPC("mountain goat", "A mountain goat climbs along the rocky trail.", hp=100, attacks={"ram": (10, 20)})],
    )
    rooms["mountain_peak"] = mountain_peak
    nearing_peak.exits["east"] = mountain_peak
    mountain_peak.exits["west"] = nearing_peak

    # Hidden Cave
    hidden_cave = Room(
        "A Hidden Cave",
        "A door hidden in a smooth section of the cliff face swings open silently... (log)",
        exits={"south": mountain_peak},
        npcs=[],
        items=[Item("iron chest", "An iron chest sits here, covered in dust.", container=True, inventory=[Item("treasure", "Shiny treasure.", price=100)])],
    )
    rooms["hidden_cave"] = hidden_cave
    mountain_peak.exits["north"] = hidden_cave
    hidden_cave.exits["south"] = mountain_peak

    # Temple of Darkness
    temple_darkness = Room(
        "The Temple of Darkness",
        "Earendam's temple of darkness is an architectural hybrid... (log)",
        exits={"north": None, "east": None, "south": None},
        npcs=[AINPC("priest of the Aklaju", "A priest of the Aklaju offers the services of the dark gods.", hp=250, attacks={"energy": (15, 25)}),
              AINPC("bearded human minstrel", "A bearded human minstrel is here, holding a small mandolin.", hp=100, attacks={"punch": (5, 10)})],
    )
    rooms["temple_darkness"] = temple_darkness
    # Link...

    # Fortress Chapel
    fortress_chapel = Room(
        "The Fortress Chapel",
        "A large room of the upper floor of Krilin Fortress has been set aside for the worship... (log)",
        exits={"north": None, "east": None, "down": None},
        npcs=[AINPC("Ygring Starid", "Ygring Starid, the earth priest of Jolinn, stands in the chapel.", hp=200, attacks={"pound": (10, 20)})],
        items=[Item("tall circular table", "A tall, circular table of finely polished wood stands in the alcove.")],
    )
    rooms["fortress_chapel"] = fortress_chapel
    # Link to School or others...

    # Portal Chamber
    portal_chamber = Room(
        "The Portal Chamber",
        "This cubical room is made from blocks of hewn marble... (log)",
        exits={"north": fortress_chapel, "east": None, "south": None, "west": None, "down": None},
        npcs=[AINPC("magic mouth", "A magic mouth hovers in mid-air, grinning nonchalantly.", hp=50, attacks={"talk": (0, 0)})],
        items=[Item("wooden one-man canoe", "A wooden one-man canoe sits here.", container=True, liquid=True)],
    )
    rooms["portal_chamber"] = portal_chamber
    fortress_chapel.exits["down"] = portal_chamber
    portal_chamber.exits["up"] = fortress_chapel

    # Office of Applied Theology
    office_theology = Room(
        "Office of Applied Theology",
        "The office exudes an air of cold formality... (log)",
        exits={"north": portal_chamber, "east": None, "south": None, "down": None},
        npcs=[AINPC("Nistaru", "Nistaru stands behind the desk, sneering at petitioners.", hp=200, attacks={"sneer": (5, 10)})],
    )
    rooms["office_theology"] = office_theology
    portal_chamber.exits["south"] = office_theology
    office_theology.exits["north"] = portal_chamber

    # Southern Path
    southern_path = Room(
        "The Southern Path",
        "Large, wooden barricades line the southern path... (log)",
        exits={"north": office_theology, "south": None},
        npcs=[AINPC("human child", "A human child chases after a ball.", hp=50, attacks={"kick": (2, 5)}),
              AINPC("kor thrandian patroller", "A Kor Thrandian patroller scans the streets for trouble.", hp=150, attacks={"slash": (10, 20)})],
    )
    rooms["southern_path"] = southern_path
    office_theology.exits["south"] = southern_path
    southern_path.exits["north"] = office_theology

    # Gate to Archery Range
    gate_archery = Room(
        "The Gate to the Archery Range",
        "The gate to the archery range sits open... (log)",
        exits={"north": None, "west": southern_path},
        npcs=[],
    )
    rooms["gate_archery"] = gate_archery
    southern_path.exits["east"] = gate_archery
    gate_archery.exits["west"] = southern_path

    # Gate to Training Grounds
    gate_training = Room(
        "The Gate to the Training Grounds",
        "An open wooden gate serves as the entrance to the training grounds... (log)",
        exits={"north": None, "east": southern_path},
        npcs=[AINPC("kor thrandian soldier", "A Kor Thrandian soldier practices a drive with her weapon.", hp=150, attacks={"pound": (10, 20)})],
        items=[Item("wooden practice sword", "A perfectly balanced wooden sword lies here.", damage=(3, 4, "bash"))],
    )
    rooms["gate_training"] = gate_training
    southern_path.exits["west"] = gate_training
    gate_training.exits["east"] = southern_path

    # Path Through Training Grounds
    path_training = Room(
        "A Path Through the Training Grounds",
        "A small footpath cuts through the trampled grass... (log)",
        exits={"north": gate_training, "south": None, "west": None},
        npcs=[AINPC("kor thrandian soldier", "A Kor Thrandian soldier rests, exhausted from practice.", hp=150, attacks={"pound": (10, 20)})],
    )
    rooms["path_training"] = path_training
    gate_training.exits["north"] = path_training
    path_training.exits["south"] = gate_training

    # Training Grounds
    training_grounds = Room(
        "The Training Grounds",
        "The training grounds of Kor Thrandir are a hodgepodge of activity... (log)",
        exits={"east": path_training, "south": None, "west": None},
        npcs=[AINPC("kor thrandian soldier", "A Kor Thrandian soldier practices a drive with her weapon.", hp=150, attacks={"pound": (10, 20)}),
              AINPC("kor thrandian soldier", "A Kor Thrandian soldier lunges forward as she trains.", hp=150, attacks={"pound": (10, 20)})],
    )
    rooms["training_grounds"] = training_grounds
    path_training.exits["north"] = training_grounds
    training_grounds.exits["south"] = path_training

    # Archery Fields
    archery_fields = Room(
        "The Archery Fields",
        "The open fields of the archery range stretch out quite far... (log)",
        exits={"east": None, "south": None, "west": None},
        npcs=[AINPC("kor thrandian archer", "A Kor Thrandian archer pauses to wipe her brow, taking a deep breath.", hp=150, attacks={"shoot": (10, 20)}),
              AINPC("kor thrandian archer", "A Kor Thrandian archer prepares to shoot at a target.", hp=150, attacks={"shoot": (10, 20)})],
    )
    rooms["archery_fields"] = archery_fields
    gate_archery.exits["north"] = archery_fields
    archery_fields.exits["south"] = gate_archery

    # Archer Captain's Post
    archer_post = Room(
        "The Archer Captain's Post",
        "On the far side of the archery range is a small post for the overseeing captain... (log)",
        exits={"north": archery_fields, "south": None, "west": None},
        npcs=[AINPC("Captain Raiali", "Captain Raiali is here, overseeing the archery range. (log/wiki).", hp=300, attacks={"bow": (10, 20)})],
        items=[Item("iron canteen", "An iron canteen.", liquid=True, affects={"refresh": True})],
    )
    rooms["archer_post"] = archer_post
    archery_fields.exits["south"] = archer_post
    archer_post.exits["north"] = archery_fields

    # The Tipsy Swordmaster
    tipsy_swordmaster = Room(
        "The Tipsy Swordmaster",
        "The Tipsy Swordmaster is a tavern frequented by the less wealthy mercenary classes... (log)",
        exits={"north": None, "east": None, "south": None, "west": None},
        npcs=[AINPC("Thane Brondir", "Thane Brondir, Barbarian Lord, glares about the room. (log).", hp=250, attacks={"bash": (15, 25)}),
              AINPC("Jolcherus", "Jolcherus, a past arena champion, lounges about the bar area. (log).", hp=200, attacks={"punch": (10, 20)}),
              AINPC("Swordmaster Mengjaal", "Swordmaster Mengjaal rests on a chair in the corner, aloof from the rowdiness. (log).", hp=300, attacks={"slash": (15, 25)})],
    )
    rooms["tipsy_swordmaster"] = tipsy_swordmaster
    # Link to Raddin Street or others...

    # Raddin Street
    raddin_street = Room(
        "Raddin Street",
        "Raddin Street, named after an ancient hero from the War of Fire... (log)",
        exits={"north": None, "east": tipsy_swordmaster, "south": None, "west": None},
        npcs=[AINPC("battered and scarred gladiator", "A battered and scarred gladiator guards the entrance to the tavern.", hp=200, attacks={"slash": (15, 25)})],
    )
    rooms["raddin_street"] = raddin_street
    # Link...

    # Add all static from logs/searches (50+ NPCs/100+ items total static, procedural for random)
    # Procedural gen: In event_tick, if random < 0.1, gen mob/item with AI prompt "gen random hill giant" -> add to room with desc/attacks/items.

    questmaster.register("Seer Elowen", "prophecy, lost magic, balance", "mystic and kind")
    return rooms["center_square"], list(rooms.values())

# --- Event Loop Tick (Optimized 3x/sec with ambiance/random events) ---
def event_tick(player, world_rooms):
    while True:
        # Regen
        player.hp = min(player.max_hp, player.hp + 5)
        player.mana = min(player.max_mana, player.mana + 5)
        player.mv = min(player.max_mv, player.mv + 5)
        # Ambiance (weather, whispers, howls - zone-specific)
        if random.random() < 0.3:
            print(player.room.get_ambiance())
        # Random events/procedural gen (AI random mobs/items/events)
        if random.random() < 0.1:
            prompt = "Gen random Avendar mob/item/event with lore."
            response = player.ai.query_ai(prompt)  # Stub AI
            # Parse/add (stub - print)
            print("Random event: " + response)
        # Group sync stub
        time.sleep(1/3)  # 3x/sec

# --- Entry Point ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--server', action='store_true')
    args = parser.parse_args()

    questmaster = LLMQuestMaster()
    starting_room, world_rooms = setup_world(questmaster)
    bruce = next((n for r in world_rooms for n in r.npcs if n.name == "Bruce™"), None)

    if args.server:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('0.0.0.0', 4000))
            s.listen()
            print("[Server]: Listening on port 4000...")
            while True:
                conn, addr = s.accept()
                conn.sendall(b"MOTD: Welcome to Harris Wildlands! Login or create account.\n")
                def handle(conn):
                    name = conn.recv(1024).decode().strip()
                    player = Player(name)
                    player.load()
                    player.room = starting_room
                    threading.Thread(target=combat_tick, args=(player,), daemon=True).start()
                    threading.Thread(target=event_tick, args=(player, world_rooms), daemon=True).start()
                    while True:
                        conn.sendall(b"> ")
                        data = conn.recv(1024)
                        if not data:
                            break
                        cmd = data.decode().strip()
                        output = process_command(player, bruce, cmd, world_rooms, questmaster)
                        conn.sendall((output + "\n").encode())
                    player.save()
                    conn.close()
                threading.Thread(target=handle, args=(conn,), daemon=True).start()
    else:
        player = Player("Veljik", race="caladaran", class_type="swordmaster")
        player.room = starting_room
        starting_room.players.append(player)
        threading.Thread(target=combat_tick, args=(player,), daemon=True).start()
        threading.Thread(target=event_tick, args=(player, world_rooms), daemon=True).start()
        print(f"Welcome to Harris Wildlands! You start in {player.room.name}.")
        while True:
            command = input(f"<{player.hp}hp {player.mana}m {player.mv}mv> ").strip()
            if command == "quit":
                print("Thanks for playing!")
                break
            response = process_command(player, bruce, command, world_rooms, questmaster)
            print(response)