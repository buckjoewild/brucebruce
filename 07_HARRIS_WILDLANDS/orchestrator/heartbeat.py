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
DEFAULT_MAX_LOG_BYTES = 5 * 1024 * 1024  # 5MB


def _sha256(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def _make_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _rotate_if_needed(path: Path, max_bytes: int) -> bool:
    """Rotate log file if it exceeds max_bytes. Returns True if rotated."""
    if not path.exists():
        return False
    try:
        size = path.stat().st_size
        if size >= max_bytes:
            rotated = Path(str(path) + ".1")
            if rotated.exists():
                rotated.unlink()
            path.rename(rotated)
            rotation_entry = {
                "ts": _now_iso(),
                "event": "log_rotated",
                "rotated_to": str(rotated),
                "previous_size": size,
            }
            with open(path, "a", encoding="utf-8") as f:
                f.write(json.dumps(rotation_entry, separators=(",", ":")) + "\n")
            return True
    except Exception:
        pass
    return False


def verify_jsonl_hashes(filepath: str) -> dict:
    """
    Verify sha256 hashes on every line of a JSONL evidence file.

    Returns dict with:
      total: number of entries checked
      valid: number passing verification
      invalid: number failing
      first_invalid_line: 1-based line number of first failure (or None)
      skipped: entries without sha256 field
    """
    result = {"total": 0, "valid": 0, "invalid": 0, "first_invalid_line": None, "skipped": 0}
    path = Path(filepath)
    if not path.exists():
        return result

    with open(path, "r", encoding="utf-8") as f:
        for line_num, raw_line in enumerate(f, 1):
            raw_line = raw_line.strip()
            if not raw_line:
                continue
            try:
                entry = json.loads(raw_line)
            except json.JSONDecodeError:
                result["total"] += 1
                result["invalid"] += 1
                if result["first_invalid_line"] is None:
                    result["first_invalid_line"] = line_num
                continue

            result["total"] += 1
            stored_hash = entry.get("sha256")
            if stored_hash is None:
                result["skipped"] += 1
                continue

            unsigned = dict(entry)
            del unsigned["sha256"]
            canonical = json.dumps(unsigned, separators=(",", ":"))
            computed = _sha256(canonical)

            if computed == stored_hash:
                result["valid"] += 1
            else:
                result["invalid"] += 1
                if result["first_invalid_line"] is None:
                    result["first_invalid_line"] = line_num

    return result


class HeartbeatLogger:
    """Writes periodic heartbeat snapshots to evidence/heartbeat.jsonl."""

    def __init__(self, evidence_dir: str, max_bytes: int = DEFAULT_MAX_LOG_BYTES):
        self.evidence_dir = Path(evidence_dir)
        self.evidence_dir.mkdir(parents=True, exist_ok=True)
        self.heartbeat_path = self.evidence_dir / "heartbeat.jsonl"
        self.max_bytes = max_bytes
        self.logging_degraded = False

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
        self._safe_append(self.heartbeat_path, signed_line)

        return entry

    def tail(self, n: int = 3) -> list:
        if not self.heartbeat_path.exists():
            return []
        entries = []
        with open(self.heartbeat_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entries.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
        return entries[-n:]

    def _safe_append(self, path: Path, line: str) -> None:
        """Append with rotation and error handling."""
        try:
            _rotate_if_needed(path, self.max_bytes)
            with open(path, "a", encoding="utf-8") as f:
                f.write(line + "\n")
            self.logging_degraded = False
        except Exception as e:
            self.logging_degraded = True
            print(f"LOGGING DEGRADED (heartbeat): {e}")


class ActivityLogger:
    """Writes per-action Bruce activity entries to evidence/bruce_activity.jsonl."""

    def __init__(self, evidence_dir: str, max_bytes: int = DEFAULT_MAX_LOG_BYTES):
        self.evidence_dir = Path(evidence_dir)
        self.evidence_dir.mkdir(parents=True, exist_ok=True)
        self.activity_path = self.evidence_dir / "bruce_activity.jsonl"
        self.max_bytes = max_bytes
        self.logging_degraded = False

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
        self._safe_append(self.activity_path, signed_line)

        return entry

    def tail(self, n: int = 10) -> list:
        if not self.activity_path.exists():
            return []
        entries = []
        with open(self.activity_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entries.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
        return entries[-n:]

    def _safe_append(self, path: Path, line: str) -> None:
        """Append with rotation and error handling."""
        try:
            _rotate_if_needed(path, self.max_bytes)
            with open(path, "a", encoding="utf-8") as f:
                f.write(line + "\n")
            self.logging_degraded = False
        except Exception as e:
            self.logging_degraded = True
            print(f"LOGGING DEGRADED (activity): {e}")


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
