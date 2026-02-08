"""
Bruce memory — append-only JSONL store for Bruce NPC observations.

Sources (allowed in bruce_memory.jsonl):
  player_chat      — what players said
  bruce_observation — Bruce's own actions/sayings

Build events live in event_log.jsonl (single source of truth).
Memory never mutates world data (rooms.json / npcs.json).
"""
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

ALLOWED_SOURCES = {"player_chat", "bruce_observation"}


class BruceMemory:
    """Append-only memory store backed by a JSONL file."""

    def __init__(self, evidence_dir: str):
        self.evidence_dir = Path(evidence_dir)
        self.evidence_dir.mkdir(parents=True, exist_ok=True)
        self.memory_path = self.evidence_dir / "bruce_memory.jsonl"

    def append_entry(
        self,
        source: str,
        content: str,
        *,
        player: Optional[str] = None,
        room: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> dict:
        """
        Append one entry to bruce_memory.jsonl.

        Args:
            source: Must be one of player_chat, bruce_observation
            content: Text content of the entry
            player: Player name (if relevant)
            room: Room id (if relevant)
            metadata: Extra data

        Returns:
            The entry dict that was written

        Raises:
            ValueError: If source is not in ALLOWED_SOURCES
        """
        if source not in ALLOWED_SOURCES:
            raise ValueError(
                f"Invalid source '{source}'. "
                f"Allowed: {', '.join(sorted(ALLOWED_SOURCES))}"
            )

        entry = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "source": source,
            "content": content,
        }
        if player:
            entry["player"] = player
        if room:
            entry["room"] = room
        if metadata:
            entry["metadata"] = metadata

        with open(self.memory_path, "a") as f:
            f.write(json.dumps(entry) + "\n")

        return entry

    def read_recent(
        self,
        n: int = 10,
        source_filter: Optional[str] = None,
    ) -> list:
        """
        Read the last N entries, optionally filtered by source.

        Args:
            n: Number of entries to return
            source_filter: If set, only return entries with this source

        Returns:
            List of entry dicts (most recent last)
        """
        if not self.memory_path.exists():
            return []

        entries = []
        with open(self.memory_path, "r") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                    if source_filter is None or entry.get("source") == source_filter:
                        entries.append(entry)
                except json.JSONDecodeError:
                    continue

        return entries[-n:]


def format_build_fact_response(event_log_path: str, n: int = 5) -> str:
    """
    Read build facts from event_log.jsonl (the single source of truth).
    Only events with result=="ok" are treated as confirmed facts.

    Args:
        event_log_path: Path to event_log.jsonl
        n: Max number of recent facts to include

    Returns:
        A formatted string Bruce can use for "what happened" responses.
    """
    path = Path(event_log_path)
    if not path.exists():
        return "The build log has no confirmed builds yet."

    facts = []
    with open(path, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
                if entry.get("result") == "ok":
                    facts.append(entry)
            except json.JSONDecodeError:
                continue

    if not facts:
        return "The build log has no confirmed builds yet."

    recent = facts[-n:]
    lines = ["The build log confirms:"]
    for fact in recent:
        verb = fact.get("verb", "unknown")
        ts = fact.get("ts", "?")
        actor = fact.get("actor", "unknown")
        lines.append(f"  [{ts}] {verb} by {actor}")

    return "\n".join(lines)
