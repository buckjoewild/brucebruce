"""
Growth Offer — represents a single proposed world-change.

An offer is a structured description of exactly ONE growth operation that can
be applied to the world through the governance cycle (PLAN -> BUILD ON -> CONSENT).

Offers do not mutate the world. They are proposals that must be explicitly
applied through the consent cycle.
"""
import json
import random
import uuid
from datetime import datetime, timezone
from typing import Optional


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _make_id() -> str:
    return f"off_{uuid.uuid4().hex[:12]}"


ROOM_TEMPLATES = [
    {
        "title": "Hidden Spring",
        "summary": "A natural spring bubbles up from mossy rocks, surrounded by ferns.",
        "op": "ADD_ROOM",
        "params": {
            "id": None,
            "name": "Hidden Spring",
            "description": "Crystal-clear water bubbles up from between mossy rocks. Ferns and wildflowers crowd the edges. The air smells of wet stone and green growth.",
            "objects": ["smooth pebble", "wild mint"],
        },
    },
    {
        "title": "Old Root Cellar",
        "summary": "A half-buried cellar from a forgotten homestead, cool and dim.",
        "op": "ADD_ROOM",
        "params": {
            "id": None,
            "name": "Old Root Cellar",
            "description": "Rough stone walls hold back the earth. Shelves of rotting wood line the walls. The air is cool and smells of clay and old apples.",
            "objects": ["dusty jar", "iron hook"],
        },
    },
    {
        "title": "Hawk Ridge Overlook",
        "summary": "A windswept ridge with views across the wildlands. Hawks circle below.",
        "op": "ADD_ROOM",
        "params": {
            "id": None,
            "name": "Hawk Ridge Overlook",
            "description": "Wind whips across the bare ridge. Far below, the forest canopy stretches to the horizon. Hawks ride the thermals, calling to each other.",
            "objects": ["hawk feather"],
        },
    },
    {
        "title": "Mushroom Hollow",
        "summary": "A damp hollow where strange fungi grow in rings on fallen logs.",
        "op": "ADD_ROOM",
        "params": {
            "id": None,
            "name": "Mushroom Hollow",
            "description": "Fallen logs covered in shelf fungus create a natural amphitheater. Strange mushrooms glow faintly in the dim light. The ground is soft and spongy.",
            "objects": ["glowing mushroom", "bark scroll"],
        },
    },
]

NPC_TEMPLATES = [
    {
        "title": "Wandering Herbalist",
        "summary": "A quiet herbalist who gathers plants and shares remedies.",
        "op": "ADD_NPC",
        "params": {
            "name": "Wandering Herbalist",
            "description": "A weathered figure with keen eyes and plant-stained hands. They carry a satchel overflowing with dried herbs and roots.",
            "type": "friendly",
        },
    },
    {
        "title": "Old Cartographer",
        "summary": "An elderly map-maker documenting the wildlands, one trail at a time.",
        "op": "ADD_NPC",
        "params": {
            "name": "Old Cartographer",
            "description": "A bent figure peering through thick spectacles, constantly scribbling on a roll of parchment. Ink stains cover their fingers.",
            "type": "friendly",
        },
    },
]

ALL_TEMPLATES = ROOM_TEMPLATES + NPC_TEMPLATES


class GrowthOffer:
    def __init__(
        self,
        offer_id: str,
        kind: str,
        title: str,
        summary: str,
        ops: list,
        created_at: str = None,
        risk_notes: str = None,
    ):
        self.offer_id = offer_id
        self.kind = kind
        self.title = title
        self.summary = summary
        self.ops = ops
        self.created_at = created_at or _now_iso()
        self.risk_notes = risk_notes

    def to_dict(self) -> dict:
        d = {
            "offer_id": self.offer_id,
            "created_at": self.created_at,
            "kind": self.kind,
            "title": self.title,
            "summary": self.summary,
            "ops": self.ops,
            "will_write_evidence": ["growth_events.jsonl"],
            "will_not_touch": ["persistence schema", "auth", "network", "files outside world/"],
        }
        if self.risk_notes:
            d["risk_notes"] = self.risk_notes
        return d

    def to_card(self, budget_remaining: int, budget_total: int) -> str:
        op = self.ops[0] if self.ops else {}
        params_summary = ", ".join(f"{k}={v}" for k, v in op.get("params", {}).items() if k != "description")
        remaining_after = max(0, budget_remaining - 1)
        return (
            f"OFFER: {self.offer_id} [{self.kind}]\n"
            f"Title: {self.title}\n"
            f"Summary: {self.summary}\n"
            f"Op: {op.get('op', '?')} {params_summary}\n"
            f"Budget remaining if applied: {remaining_after}/{budget_total}\n"
            f"Next: /build on -> /consent yes (applies ONE op)"
        )


def propose(world, context: dict = None) -> GrowthOffer:
    template = random.choice(ALL_TEMPLATES)

    offer_id = _make_id()
    kind = "room" if template["op"] == "ADD_ROOM" else "npc"

    params = dict(template["params"])
    if kind == "room" and params.get("id") is None:
        safe_name = template["title"].lower().replace(" ", "_")
        params["id"] = f"growth_{safe_name}_{uuid.uuid4().hex[:6]}"

    ops = [{"op": template["op"], "params": params}]

    return GrowthOffer(
        offer_id=offer_id,
        kind=kind,
        title=template["title"],
        summary=template["summary"],
        ops=ops,
    )


def apply_offer(world, offer: GrowthOffer, room_factory=None, npc_factory=None) -> dict:
    if not offer.ops or len(offer.ops) != 1:
        return {"success": False, "error": "Offer must have exactly 1 op"}

    op = offer.ops[0]
    op_type = op.get("op", "")
    params = op.get("params", {})

    if op_type == "ADD_ROOM":
        return _apply_add_room(world, params, offer.offer_id, room_factory)
    elif op_type == "ADD_NPC":
        return _apply_add_npc(world, params, offer.offer_id, npc_factory)
    else:
        return {"success": False, "error": f"Unknown op type: {op_type}"}


def _apply_add_room(world, params: dict, offer_id: str, room_factory=None) -> dict:
    room_id = params.get("id")
    if not room_id:
        return {"success": False, "error": "Room id required"}

    if room_id in world.rooms:
        return {"success": False, "error": f"Room {room_id} already exists"}

    existing_rooms = list(world.rooms.keys())
    if not existing_rooms:
        return {"success": False, "error": "No existing rooms to connect to"}

    connect_to = random.choice(existing_rooms)
    direction_pairs = [("north", "south"), ("east", "west")]
    pair = random.choice(direction_pairs)

    from_room = world.rooms[connect_to]
    if pair[0] in from_room.exits:
        pair = direction_pairs[1] if pair == direction_pairs[0] else direction_pairs[0]
        if pair[0] in from_room.exits:
            available = [d for d in ["north", "south", "east", "west"] if d not in from_room.exits]
            if not available:
                return {"success": False, "error": f"No available exits from {connect_to}"}
            chosen_dir = available[0]
            reverse = {"north": "south", "south": "north", "east": "west", "west": "east"}
            pair = (chosen_dir, reverse[chosen_dir])

    if room_factory:
        new_room = room_factory(room_id, params.get("name", "New Room"), params.get("description", "A newly grown space."))
    else:
        return {"success": False, "error": "No room factory provided"}
    new_room.exits = {pair[1]: connect_to}
    new_room.objects = params.get("objects", [])
    world.rooms[room_id] = new_room
    from_room.exits[pair[0]] = room_id

    return {
        "success": True,
        "message": f"Room '{new_room.name}' created, connected {pair[0]} from '{from_room.name}'",
        "room_id": room_id,
        "connected_to": connect_to,
        "direction": pair[0],
        "offer_id": offer_id,
    }


def _apply_add_npc(world, params: dict, offer_id: str, npc_factory=None) -> dict:
    npc_name = params.get("name")
    if not npc_name:
        return {"success": False, "error": "NPC name required"}

    existing_rooms = list(world.rooms.keys())
    if not existing_rooms:
        return {"success": False, "error": "No rooms to place NPC in"}

    room_id = random.choice(existing_rooms)

    npc_id = f"npc_{uuid.uuid4().hex[:8]}"
    if npc_factory:
        npc = npc_factory(npc_id, npc_name, params.get("description", "A new arrival."), params.get("type", "friendly"))
    else:
        return {"success": False, "error": "No NPC factory provided"}
    npc.room_id = room_id
    world.npcs[npc_id] = npc
    world.rooms[room_id].npcs.append(npc)

    return {
        "success": True,
        "message": f"NPC '{npc_name}' placed in '{world.rooms[room_id].name}'",
        "npc_id": npc_id,
        "room_id": room_id,
        "offer_id": offer_id,
    }
