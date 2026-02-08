"""
Tests for Bruce memory system.

Verifies:
- Append-only writes (file only grows)
- read_recent returns correct count and respects filter
- format_fact_response only cites build_event entries with result="ok"
"""
import pytest
import tempfile
import json
import os
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from orchestrator.bruce_memory import BruceMemory


class TestAppendEntry:
    """Test append-only behavior."""

    def test_append_creates_file(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            mem = BruceMemory(tmpdir)
            assert not mem.memory_path.exists()

            mem.append_entry("player_chat", "hello", player="Alice")
            assert mem.memory_path.exists()

    def test_append_only_grows(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            mem = BruceMemory(tmpdir)

            mem.append_entry("player_chat", "first message", player="Alice")
            size_after_one = mem.memory_path.stat().st_size

            mem.append_entry("player_chat", "second message", player="Bob")
            size_after_two = mem.memory_path.stat().st_size

            assert size_after_two > size_after_one

            mem.append_entry("bruce_observation", "Bruce looked around")
            size_after_three = mem.memory_path.stat().st_size

            assert size_after_three > size_after_two

    def test_append_never_rewrites(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            mem = BruceMemory(tmpdir)

            mem.append_entry("player_chat", "line one", player="Alice")
            with open(mem.memory_path, "r") as f:
                first_line = f.readline()

            mem.append_entry("player_chat", "line two", player="Bob")
            with open(mem.memory_path, "r") as f:
                check_first = f.readline()

            assert first_line == check_first

    def test_entry_has_required_fields(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            mem = BruceMemory(tmpdir)
            entry = mem.append_entry(
                "build_event",
                "Room added",
                player="Alice",
                room="clearing",
                metadata={"verb": "build room", "result": "ok"},
            )

            assert entry["source"] == "build_event"
            assert entry["content"] == "Room added"
            assert entry["player"] == "Alice"
            assert entry["room"] == "clearing"
            assert entry["metadata"]["result"] == "ok"
            assert "ts" in entry


class TestReadRecent:
    """Test read_recent filtering and count."""

    def test_read_empty(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            mem = BruceMemory(tmpdir)
            assert mem.read_recent() == []

    def test_read_returns_last_n(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            mem = BruceMemory(tmpdir)
            for i in range(20):
                mem.append_entry("player_chat", f"msg {i}", player="Alice")

            recent = mem.read_recent(5)
            assert len(recent) == 5
            assert recent[0]["content"] == "msg 15"
            assert recent[4]["content"] == "msg 19"

    def test_read_with_source_filter(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            mem = BruceMemory(tmpdir)
            mem.append_entry("player_chat", "chat 1", player="Alice")
            mem.append_entry("build_event", "build 1", metadata={"result": "ok"})
            mem.append_entry("player_chat", "chat 2", player="Bob")
            mem.append_entry("bruce_observation", "Bruce looked")

            chats = mem.read_recent(10, source_filter="player_chat")
            assert len(chats) == 2
            assert all(e["source"] == "player_chat" for e in chats)

            builds = mem.read_recent(10, source_filter="build_event")
            assert len(builds) == 1


class TestFormatFactResponse:
    """Test that format_fact_response only cites result='ok' build events."""

    def test_empty_memory(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            mem = BruceMemory(tmpdir)
            result = mem.format_fact_response()
            assert "empty" in result.lower() or "nothing" in result.lower()

    def test_no_successful_builds(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            mem = BruceMemory(tmpdir)
            mem.append_entry("build_event", "Failed build", metadata={"result": "error", "verb": "build room"})
            mem.append_entry("build_event", "Blocked build", metadata={"result": "blocked", "verb": "build room"})
            mem.append_entry("player_chat", "hello", player="Alice")

            result = mem.format_fact_response()
            assert "no confirmed builds" in result.lower()

    def test_only_ok_builds_cited(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            mem = BruceMemory(tmpdir)
            mem.append_entry("build_event", "Failed attempt", metadata={"result": "error", "verb": "build room"})
            mem.append_entry("build_event", "Cabin added", metadata={"result": "ok", "verb": "build room"})
            mem.append_entry("build_event", "Trail added", metadata={"result": "ok", "verb": "build trail"})
            mem.append_entry("build_event", "Reverted", metadata={"result": "reverted", "verb": "build room"})

            result = mem.format_fact_response()
            assert "build log confirms" in result.lower()
            assert "Cabin added" in result
            assert "Trail added" in result
            assert "Failed attempt" not in result
            assert "Reverted" not in result

    def test_player_chat_never_cited_as_fact(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            mem = BruceMemory(tmpdir)
            mem.append_entry("player_chat", "I built a castle!", player="Liar")
            mem.append_entry("bruce_observation", "Bruce saw something")

            result = mem.format_fact_response()
            assert "castle" not in result.lower()
            assert "Bruce saw" not in result


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
