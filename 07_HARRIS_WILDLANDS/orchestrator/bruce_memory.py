"""
Bruce memory — append-only JSONL store for Bruce NPC observations.

Sources:
  player_chat      — what players said
  build_event      — build results (only result="ok" treated as fact)
  bruce_observation — Bruce's own actions/sayings

Memory never mutates world data (rooms.json / npcs.json).
"""
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


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
            source: One of player_chat, build_event, bruce_observation
            content: Text content of the entry
            player: Player name (if relevant)
            room: Room id (if relevant)
            metadata: Extra data (e.g. build result, verb)

        Returns:
            The entry dict that was written
        """
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

    def format_fact_response(self, n: int = 5) -> str:
        """
        Build a response string from build_event entries where result="ok".
        Only confirmed-successful builds are treated as factual.

        Returns:
            A formatted string Bruce can use, or a default if nothing found.
        """
        if not self.memory_path.exists():
            return "The build log is empty. Nothing has been built yet."

        facts = []
        with open(self.memory_path, "r") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                    if (
                        entry.get("source") == "build_event"
                        and entry.get("metadata", {}).get("result") == "ok"
                    ):
                        facts.append(entry)
                except json.JSONDecodeError:
                    continue

        if not facts:
            return "The build log shows no confirmed builds yet."

        recent = facts[-n:]
        lines = ["The build log confirms:"]
        for fact in recent:
            verb = fact.get("metadata", {}).get("verb", "unknown")
            ts = fact.get("ts", "?")
            content = fact.get("content", "")
            lines.append(f"  [{ts}] {verb}: {content}")

        return "\n".join(lines)
