"""
Tests for Bruce memory system.

Verifies:
- Append-only writes (file only grows)
- Source validation (only player_chat and bruce_observation allowed)
- read_recent returns correct count and respects filter
- format_build_fact_response reads from event_log.jsonl, cites only result="ok"
"""
import pytest
import tempfile
import json
import os
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from orchestrator.bruce_memory import BruceMemory, format_build_fact_response


class TestAppendEntry:
    """Test append-only behavior and source validation."""

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
                "player_chat",
                "hello world",
                player="Alice",
                room="clearing",
            )

            assert entry["source"] == "player_chat"
            assert entry["content"] == "hello world"
            assert entry["player"] == "Alice"
            assert entry["room"] == "clearing"
            assert "ts" in entry

    def test_rejects_build_event_source(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            mem = BruceMemory(tmpdir)
            with pytest.raises(ValueError, match="Invalid source"):
                mem.append_entry("build_event", "Room added", metadata={"result": "ok"})

    def test_rejects_unknown_source(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            mem = BruceMemory(tmpdir)
            with pytest.raises(ValueError, match="Invalid source"):
                mem.append_entry("system_event", "something")


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
            mem.append_entry("player_chat", "chat 2", player="Bob")
            mem.append_entry("bruce_observation", "Bruce looked")

            chats = mem.read_recent(10, source_filter="player_chat")
            assert len(chats) == 2
            assert all(e["source"] == "player_chat" for e in chats)

            obs = mem.read_recent(10, source_filter="bruce_observation")
            assert len(obs) == 1


def _write_event_log(path: str, events: list):
    """Helper: write mock event_log.jsonl entries."""
    with open(path, "w") as f:
        for evt in events:
            f.write(json.dumps(evt) + "\n")


class TestFormatBuildFactResponse:
    """Test that format_build_fact_response reads event_log.jsonl and cites only result='ok'."""

    def test_missing_event_log(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            result = format_build_fact_response(os.path.join(tmpdir, "event_log.jsonl"))
            assert "no confirmed builds" in result.lower()

    def test_empty_event_log(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            log_path = os.path.join(tmpdir, "event_log.jsonl")
            _write_event_log(log_path, [])
            result = format_build_fact_response(log_path)
            assert "no confirmed builds" in result.lower()

    def test_no_ok_events(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            log_path = os.path.join(tmpdir, "event_log.jsonl")
            _write_event_log(log_path, [
                {"ts": "2026-01-01T00:00:00Z", "verb": "build room", "actor": "Alice", "result": "failed"},
                {"ts": "2026-01-01T00:01:00Z", "verb": "build room", "actor": "Bob", "result": "blocked"},
                {"ts": "2026-01-01T00:02:00Z", "verb": "build room", "actor": "Eve", "result": "reverted"},
            ])
            result = format_build_fact_response(log_path)
            assert "no confirmed builds" in result.lower()

    def test_only_ok_events_cited(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            log_path = os.path.join(tmpdir, "event_log.jsonl")
            _write_event_log(log_path, [
                {"ts": "2026-01-01T00:00:00Z", "verb": "build room", "actor": "Alice", "result": "failed"},
                {"ts": "2026-01-01T00:01:00Z", "verb": "build room", "actor": "Bob", "result": "ok"},
                {"ts": "2026-01-01T00:02:00Z", "verb": "build trail", "actor": "Carol", "result": "ok"},
                {"ts": "2026-01-01T00:03:00Z", "verb": "build room", "actor": "Dave", "result": "reverted"},
            ])
            result = format_build_fact_response(log_path)
            assert "build log confirms" in result.lower()
            assert "Bob" in result
            assert "Carol" in result
            assert "Alice" not in result
            assert "Dave" not in result

    def test_player_chat_in_bruce_memory_never_cited_as_fact(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            mem = BruceMemory(tmpdir)
            mem.append_entry("player_chat", "I built a castle!", player="Liar")
            mem.append_entry("bruce_observation", "Bruce saw something")

            log_path = os.path.join(tmpdir, "event_log.jsonl")
            result = format_build_fact_response(log_path)
            assert "castle" not in result.lower()
            assert "Bruce saw" not in result


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
