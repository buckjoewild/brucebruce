# player.py - Player class for Harris Wildlands MUD
import random
import json
import os

# Import CLASS_REGISTRY from world module
from world import CLASS_REGISTRY, Item

class Player:
    """Player class with full MUD functionality including economy, PvP, quests, skills, and spells."""

    def __init__(self, name, race="human", class_type="warrior", hp=422, max_hp=422, mana=366, max_mana=366, mv=238, max_mv=238):
        self.name = name
        self.race = race
        self.class_type = class_type
        self.hp = hp
        self.max_hp = max_hp
        self.mana = mana
        self.max_mana = max_mana
        self.mv = mv
        self.max_mv = max_mv
        self.exp = 0
        self.ep = 0
        self.gold = 100  # Economy start
        self.quests = {}  # quest_id: {"desc": "", "task": "", "progress": 0, "reward": ""}
        self.room = None
        self.inventory = [Item("shoes of speed", "Tuck's custom shoes of speed. (mv+50, res fatigue 3, dex+2, hp+10).", equip_slot="feet", affects={"mv": 50, "res fatigue": 3, "dex": 2, "hp": 10}, price=200)]
        self.equipped = {}
        self.skills = {
            "dagger": 1, "sword": 75, "dodge": 1, "dual wield": 1, "disarm": 1,
            "parry": 1, "meditation": 1, "rescue": 1, "enhanced damage": 1,
            "grace": 1, "recover": 1, "second attack": 1, "third attack": 1,
            "fourth attack": 1, "stunning blow": 1, "trance": 1, "offhand parry": 1,
            "offhand disarm": 1, "feint": 1, "reversal of fortune": 1,
            "versatility": 1, "favored blade": 1, "bash": 1, "trip": 1, "dirt": 1
        }
        self.spells = {
            "armor": 75, "detect invis": 75, "create food": 75, "iceshard": 79,
            "create spring": 75, "noble refuge": 75, "shield": 75, "frozen shield": 75,
            "sunset sigil": 75, "frostbrand": 1, "refresh": 1, "whiteout": 1,
            "rotheld's bulwark": 1, "icebolt": 1, "rune of life": 1, "sanctuary": 1,
            "douse": 1, "mending": 1, "cone of cold": 1, "holy water": 1,
            "wall of water": 1, "glyph of frost": 1, "icy prison": 1, "freeze": 1
        }
        self.language = "common"
        self.effects = []  # e.g., "flying", "sanctuary"
        self.combat_target = None
        self.group = []  # list players
        self.leader = None  # for follow
        self.following = None  # who player is following
        self.forms = {"monkey": False}
        self.pvp_consent = False  # PvP toggle
        self.aliases = {}  # command aliases
        self.title = CLASS_REGISTRY[self.class_type].titles[0] if self.class_type in CLASS_REGISTRY else "Adventurer"
        self.level = 1
        self.apply_race_class()

    def apply_race_class(self):
        """Apply racial and class bonuses."""
        if self.race == "caladaran":
            self.max_mana += 20
        if self.class_type == "swordmaster":
            self.skills["sword"] = 100

    def move(self, direction):
        """Move player in specified direction."""
        if not self.room:
            print("You are nowhere!")
            return
        direction = direction.lower()
        if direction in self.room.exits and self.room.exits[direction]:
            # Check movement points
            if self.mv <= 0:
                print("You are too exhausted to move.")
                return
            # Leave current room
            if self in self.room.players:
                self.room.players.remove(self)
            # Move to new room
            self.room = self.room.exits[direction]
            if self not in self.room.players:
                self.room.players.append(self)
            self.mv -= 1
            print(f"You move {direction}.")
        else:
            print("Alas, you cannot go that way.")

    def say(self, message):
        """Say something to the room."""
        print(f"You say, '{message}'")
        for player in self.room.players:
            if player != self:
                print(f"{self.name} says, '{message}'")

    def speak(self, message):
        """Speak in current language."""
        print(f"You speak in {self.language}: '{message}'")

    def tell(self, target, message):
        """Send private message to another player."""
        print(f"You tell {target.name}, '{message}'")

    def kill(self, target):
        """Initiate combat with a target."""
        self.combat_target = target
        print(f"You attack {target.name}!")
        # Simple combat round
        damage = random.randint(10, 30)
        target.hp -= damage
        print(f"You hit {target.name} for {damage} damage!")
        if target.hp <= 0:
            print(f"{target.name} is DEAD!")
            self.combat_target = None
            if hasattr(target, 'xp_value'):
                xp_gain = target.xp_value
                self.gain_xp(xp_gain)

    def flee(self):
        """Flee from combat."""
        if not self.combat_target:
            print("You aren't fighting anyone.")
            return
        exits = list(self.room.exits.keys())
        if exits:
            direction = random.choice(exits)
            self.combat_target = None
            self.move(direction)
            print(f"You flee {direction}!")
        else:
            print("PANIC! You can't find an exit!")

    def rescue(self, target_name):
        """Rescue a group member from combat."""
        target = next((p for p in self.group if p.name.lower() == target_name.lower()), None)
        if target and target.combat_target:
            target.combat_target.combat_target = self
            self.combat_target = target.combat_target
            target.combat_target = None
            print(f"You rescue {target.name}!")
        else:
            print("You can't rescue them.")

    def sleep(self, args=None):
        """Go to sleep to regenerate faster."""
        print("You lie down and go to sleep.")
        self.effects.append("sleeping")

    def areas(self):
        """List available areas."""
        print("Areas: Var Bandor, Tower of Water, Mountain Trail, Kor Thrandir...")

    def exits(self):
        """Show exits from current room."""
        if self.room:
            print(f"[Exits: {' '.join(self.room.exits.keys())}]")
        else:
            print("You are nowhere!")

    def examine(self, target):
        """Examine an object or NPC."""
        # Check items
        item = next((i for i in self.room.items if target.lower() in i.name.lower()), None)
        if item:
            print(item.identify())
            return
        # Check NPCs
        npc = next((n for n in self.room.npcs if target.lower() in n.name.lower()), None)
        if npc:
            print(f"{npc.name}: {npc.personality}")
            print(f"HP: {npc.hp}/{npc.max_hp}")
            return
        print("You don't see that here.")

    def corpsewhere(self):
        """Find corpses in the world."""
        print("You sense for corpses in the area...")
        # Stub implementation

    def finditems(self):
        """Find items in nearby rooms."""
        print("You search for items...")
        if self.room:
            for item in self.room.items:
                print(f"  {item.name} - {item.description}")

    def findherbs(self):
        """Find herbs for alchemy."""
        print("You search for herbs...")
        # Stub implementation

    def findwater(self):
        """Find water sources."""
        print("You search for water...")
        if self.room and self.room.water:
            print("There is water here.")
        # Stub implementation

    def huntersense(self):
        """Use hunter's sense to detect creatures."""
        print("You sense your surroundings...")
        if self.room:
            for npc in self.room.npcs:
                print(f"  {npc.name} is here.")

    def wildmove(self):
        """Move through wilderness terrain easier."""
        print("You prepare to move through wild terrain...")
        # Stub implementation

    def plant(self, seed):
        """Plant a seed or herb."""
        print(f"You plant {seed}...")
        # Stub implementation

    def roadblock(self):
        """Create a roadblock."""
        print("You attempt to create a roadblock...")
        # Stub implementation

    def setambush(self):
        """Set an ambush."""
        print("You prepare an ambush...")
        # Stub implementation

    def setsnare(self):
        """Set a snare trap."""
        print("You set a snare...")
        # Stub implementation

    def save(self):
        """Save player data to file."""
        save_path = os.path.join(os.path.dirname(__file__), f"saves/{self.name.lower()}.json")
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        player_data = {
            "name": self.name,
            "race": self.race,
            "class_type": self.class_type,
            "hp": self.hp,
            "max_hp": self.max_hp,
            "mana": self.mana,
            "max_mana": self.max_mana,
            "mv": self.mv,
            "max_mv": self.max_mv,
            "exp": self.exp,
            "ep": self.ep,
            "gold": self.gold,
            "level": self.level,
            "title": self.title,
            "inventory": [item.name for item in self.inventory],
            "equipped": {slot: item.name for slot, item in self.equipped.items()},
            "skills": self.skills,
            "spells": self.spells,
            "effects": self.effects,
            "quests": self.quests,
            "pvp_consent": self.pvp_consent,
            "room_name": self.room.name if self.room else None
        }
        try:
            with open(save_path, 'w') as f:
                json.dump(player_data, f, indent=2)
            print(f"Character saved to {save_path}")
        except Exception as e:
            print(f"Error saving character: {e}")

    def load(self, world_rooms=None):
        """Load player data from file."""
        save_path = os.path.join(os.path.dirname(__file__), f"saves/{self.name.lower()}.json")
        if not os.path.exists(save_path):
            print("No saved character found.")
            return
        try:
            with open(save_path, 'r') as f:
                player_data = json.load(f)
            self.race = player_data.get("race", self.race)
            self.class_type = player_data.get("class_type", self.class_type)
            self.hp = player_data.get("hp", self.hp)
            self.max_hp = player_data.get("max_hp", self.max_hp)
            self.mana = player_data.get("mana", self.mana)
            self.max_mana = player_data.get("max_mana", self.max_mana)
            self.mv = player_data.get("mv", self.mv)
            self.max_mv = player_data.get("max_mv", self.max_mv)
            self.exp = player_data.get("exp", self.exp)
            self.ep = player_data.get("ep", self.ep)
            self.gold = player_data.get("gold", self.gold)
            self.level = player_data.get("level", self.level)
            self.title = player_data.get("title", self.title)
            self.skills = player_data.get("skills", self.skills)
            self.spells = player_data.get("spells", self.spells)
            self.effects = player_data.get("effects", self.effects)
            self.quests = player_data.get("quests", self.quests)
            self.pvp_consent = player_data.get("pvp_consent", self.pvp_consent)
            # Restore room if world_rooms provided
            if world_rooms and player_data.get("room_name"):
                room = next((r for r in world_rooms if r.name == player_data["room_name"]), None)
                if room:
                    self.room = room
            print(f"Character loaded from {save_path}")
        except Exception as e:
            print(f"Error loading character: {e}")

    def toggle_pvp(self):
        """Toggle PvP consent."""
        self.pvp_consent = not self.pvp_consent
        return "PvP " + ("on" if self.pvp_consent else "off")

    def pvp_attack(self, other_player):
        """Attack another player (requires mutual consent)."""
        if other_player.pvp_consent and self.pvp_consent:
            self.combat_target = other_player
            return f"You attack {other_player.name} (PvP)!"
        return "No consent."

    def trade(self, item_name, other_player):
        """Trade an item to another player."""
        item = next((i for i in self.inventory if i.name.lower() == item_name.lower()), None)
        if item:
            self.inventory.remove(item)
            other_player.inventory.append(item)
            return f"You trade {item.name} to {other_player.name}."
        return "No item."

    def buy(self, item_name, vendor):
        """Buy an item from a vendor."""
        if vendor.is_vendor:
            return vendor.sell(item_name, self)
        return "Not a vendor."

    def sell(self, item_name, vendor):
        """Sell an item to a vendor."""
        if vendor.is_vendor:
            return vendor.buy(item_name, self)
        return "Not a vendor."

    def start_quest(self, quest_id, quest_data, task, reward):
        """Start a new quest."""
        self.quests[quest_id] = {"desc": quest_data, "task": task, "progress": 0, "reward": reward}
        return f"Quest started: {quest_data}"

    def update_quest(self, quest_id, progress):
        """Update quest progress."""
        if quest_id in self.quests:
            self.quests[quest_id]["progress"] += progress
            if self.quests[quest_id]["progress"] >= 100:
                reward = self.quests[quest_id]["reward"]
                if "gold" in reward:
                    self.gold += 100
                elif "item" in reward:
                    self.inventory.append(Item("reward item", "A reward.", price=50))
                return f"Quest complete! Reward: {reward}"
            return f"Quest progress: {self.quests[quest_id]['progress']}%"
        return "No quest."

    def level_up(self):
        """Level up the player."""
        self.level += 1
        self.max_hp += 10
        self.max_mana += 5
        self.max_mv += 5
        try:
            self.title = CLASS_REGISTRY[self.class_type].titles[min(self.level // 5, len(CLASS_REGISTRY[self.class_type].titles) - 1)]
        except:
            self.title = "Adventurer"

    def gain_xp(self, amount):
        """Gain experience points."""
        self.exp += amount
        xp_needed = self.level * 100
        if self.exp >= xp_needed:
            self.exp -= xp_needed
            self.level_up()
            return f"Level up! You are now level {self.level} - {self.title}"
        return f"You gain {amount} XP."

    def cast(self, spell_name):
        """Cast a spell."""
        if self.class_type in CLASS_REGISTRY:
            if spell_name not in CLASS_REGISTRY[self.class_type].spells and spell_name not in self.spells:
                return f"You do not know the spell '{spell_name}'."
        cost = 10
        if self.mana < cost:
            return "You don't have enough mana."
        self.mana -= cost
        return f"You cast {spell_name}!"

    def skill_success(self, skill_name):
        """Check if a skill succeeds."""
        success_rate = 70 + (self.level * 2)
        roll = random.randint(1, 100)
        return roll <= success_rate
