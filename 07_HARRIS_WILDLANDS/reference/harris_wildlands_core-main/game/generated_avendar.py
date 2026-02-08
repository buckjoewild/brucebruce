
# Auto-generated classes from Bruce™/Grok™ wiki prompts will be appended here.
# Initial placeholder - DO NOT DELETE

class RookeryChamber(Room):
    def __init__(self):
        super().__init__(
            name="Rookery Chamber",
            description="Rows of dark wooden perches line the walls, where messenger birds blink in dim light. Feathers drift through shafts of dust-filled sunlight from a cracked skylight. A scent of parchment and birdseed lingers in the air.",
            exits={"west": None},
            npcs=[],
            items=[Item("perch", "A worn wooden perch stands crooked near the wall."),
                   Item("scroll fragment", "A torn scroll lies forgotten under feathers.")],
            ambiance=["A distant flutter of wings echoes overhead.", "A messenger bird coos softly."]
        )


class QuestFrozenShield:
    def __init__(self):
        self.name = "Shield of Ice and Will"
        self.task = "Retrieve a shield and enchant it with 'frozen shield'."
        self.reward = "copper shield with +resistance and hitroll"
        self.description = "A spirit scholar believes the essence of frost lies dormant in a forgotten relic. Unlock it."

    def assign_to(self, player):
        player.start_quest("frozen_shield", self.description, self.task, self.reward)


class FrozenShieldSpell:
    def __init__(self):
        self.name = "Frozen Shield"
        self.effect = "Chills the air and enchants a shield with magical ice. Grants resistance to fire and bonus defense."
        self.syntax = "cast 'frozen shield' <target>"

    def cast(self, caster, target):
        if "shield" not in [item.equip_slot for item in target.equipped.values()]:
            return "Target has no shield equipped."
        target.effects.append("resist fire")
        target.effects.append("icy shield")
        return f"{caster.name} enchants {target.name}'s shield with frost!"


class AINPC_HillGiant(AINPC):
    def __init__(self):
        super().__init__(
            name="Hill Giant",
            personality="A brutish hill giant, dimwitted and aggressive, clad in bear skins. Searches for game, forces weaker creatures to bid.",
            hp=269,
            attacks={'smash': (20, 30)},
            is_vendor=False
        )


class Item_BoneHiltedRapier(Item):
    def __init__(self):
        super().__init__(
            name="Bone-Hilted Rapier",
            description="A bone-hilted rapier with a slender, sharply pointed blade and complex hilt. Pierce 5d9, dex+1, hit+3.",
            equip_slot="wield",
            damage=(5, 9, "pierce"),
            affects={'dex': 1, 'hit': 3},
            price=150
        )


class Reward_CopperShield(Item):
    def __init__(self):
        super().__init__(
            name="Copper Shield of Fire Resist",
            description="A gleaming copper shield inscribed with runes of frost. Offers strong resistance to fire and increased combat readiness.",
            equip_slot="shield",
            ac=1,
            affects={"res fire": 13, "mv": 20, "hp": 3, "hit": 1, "dam": 1},
            price=200
        )


# === Dynamic Injection Handler ===
def inject_mob_to_room(player, world_rooms, mob_class):
    mob = mob_class()
    player.room.npcs.append(mob)
    return f"A {mob.name} appears in {player.room.name}!"

def inject_item_to_player(player, item_class):
    item = item_class()
    player.inventory.append(item)
    return f"You receive: {item.name}"

def check_quest_kill_reward(player, npc_name):
    for quest_id, quest in player.quests.items():
        if npc_name.lower() in quest['task'].lower():
            quest['progress'] += 100
            if 'copper shield' in quest['reward'].lower():
                player.inventory.append(Reward_CopperShield())
            return player.update_quest(quest_id, 100)
    return None
