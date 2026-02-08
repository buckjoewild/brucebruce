"""
Bruce heartbeat + activity logger — append-only JSONL evidence files.

Heartbeat: periodic snapshot of Bruce's world state (every N minutes).
Activity: per-action log of every Bruce action (look/move/say/spawn).

Both produce sha256-signed JSONL entries for tamper evidence.
"""
import hashlib
import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


HEARTBEAT_INTERVAL_MINUTES = int(os.environ.get("BRUCE_HEARTBEAT_MINUTES", "15"))


def _sha256(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def _make_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class HeartbeatLogger:
    """Writes periodic heartbeat snapshots to evidence/heartbeat.jsonl."""

    def __init__(self, evidence_dir: str):
        self.evidence_dir = Path(evidence_dir)
        self.evidence_dir.mkdir(parents=True, exist_ok=True)
        self.heartbeat_path = self.evidence_dir / "heartbeat.jsonl"

    def run_heartbeat_tick(self, world, bruce_player) -> dict:
        room = world.rooms.get(bruce_player.room_id) if bruce_player else None

        room_info = {"id": "unknown", "name": "unknown"}
        snapshot = {"exits": [], "npcs": 0, "players": 0, "items": 0}

        if room:
            room_info = {"id": room.id, "name": room.name}
            snapshot = {
                "exits": list(room.exits.keys()),
                "npcs": len(room.npcs),
                "players": len(room.players),
                "items": len(room.objects),
            }

        entry = {
            "ts": _now_iso(),
            "tick_id": _make_id("hb"),
            "player_id": "Bruce",
            "room": room_info,
            "snapshot": snapshot,
            "world_summary": {
                "total_rooms": len(world.rooms),
                "total_npcs": len(world.npcs),
                "total_players": len(world.players),
            },
            "explored_rooms": len(bruce_player.explored_rooms) if bruce_player else 0,
        }

        line = json.dumps(entry, separators=(",", ":"))
        entry["sha256"] = _sha256(line)

        signed_line = json.dumps(entry, separators=(",", ":"))
        with open(self.heartbeat_path, "a") as f:
            f.write(signed_line + "\n")

        return entry

    def tail(self, n: int = 3) -> list:
        if not self.heartbeat_path.exists():
            return []
        entries = []
        with open(self.heartbeat_path, "r") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entries.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
        return entries[-n:]


class ActivityLogger:
    """Writes per-action Bruce activity entries to evidence/bruce_activity.jsonl."""

    def __init__(self, evidence_dir: str):
        self.evidence_dir = Path(evidence_dir)
        self.evidence_dir.mkdir(parents=True, exist_ok=True)
        self.activity_path = self.evidence_dir / "bruce_activity.jsonl"

    def log_action(
        self,
        action: str,
        room_id: str,
        room_name: str,
        detail: Optional[dict] = None,
    ) -> dict:
        entry = {
            "ts": _now_iso(),
            "event_id": _make_id("ba"),
            "action": action,
            "room": {"id": room_id, "name": room_name},
            "detail": detail or {},
        }

        line = json.dumps(entry, separators=(",", ":"))
        entry["sha256"] = _sha256(line)

        signed_line = json.dumps(entry, separators=(",", ":"))
        with open(self.activity_path, "a") as f:
            f.write(signed_line + "\n")

        return entry

    def tail(self, n: int = 10) -> list:
        if not self.activity_path.exists():
            return []
        entries = []
        with open(self.activity_path, "r") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entries.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
        return entries[-n:]


def get_evidence_sizes(evidence_dir: str) -> dict:
    p = Path(evidence_dir)
    files = [
        "heartbeat.jsonl",
        "bruce_activity.jsonl",
        "bruce_memory.jsonl",
        "event_log.jsonl",
        "bot_audit.jsonl",
    ]
    sizes = {}
    for name in files:
        fp = p / name
        if fp.exists():
            sizes[name] = fp.stat().st_size
        else:
            sizes[name] = None
    return sizes
