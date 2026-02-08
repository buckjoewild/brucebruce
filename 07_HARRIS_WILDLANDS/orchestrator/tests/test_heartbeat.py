"""Tests for Bruce heartbeat and activity logging."""
import hashlib
import json
import os
import tempfile
from pathlib import Path

import pytest

from orchestrator.heartbeat import HeartbeatLogger, ActivityLogger, get_evidence_sizes, _sha256


class FakeRoom:
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.exits = {"north": "forest_north", "south": "forest_south"}
        self.npcs = ["npc1", "npc2"]
        self.players = {"Bruce", "Wanderer"}
        self.objects = ["stone altar"]


class FakePlayer:
    def __init__(self):
        self.name = "Bruce"
        self.room_id = "spawn"
        self.explored_rooms = {"spawn", "forest_north"}


class FakeWorld:
    def __init__(self, room):
        self.rooms = {"spawn": room}
        self.npcs = {"npc1": None, "npc2": None}
        self.players = {"Bruce": None}


@pytest.fixture
def tmp_evidence(tmp_path):
    return str(tmp_path)


class TestSha256:
    def test_sha256_consistency(self):
        data = '{"ts":"2026-01-01T00:00:00+00:00","tick_id":"hb_abc123"}'
        h1 = _sha256(data)
        h2 = _sha256(data)
        assert h1 == h2
        assert len(h1) == 64

    def test_sha256_differs_for_different_input(self):
        assert _sha256("hello") != _sha256("world")


class TestHeartbeatLogger:
    def test_writes_valid_jsonl(self, tmp_evidence):
        logger = HeartbeatLogger(tmp_evidence)
        room = FakeRoom("spawn", "The Clearing")
        player = FakePlayer()
        world = FakeWorld(room)

        entry = logger.run_heartbeat_tick(world, player)

        assert entry["player_id"] == "Bruce"
        assert entry["room"]["id"] == "spawn"
        assert entry["room"]["name"] == "The Clearing"
        assert entry["snapshot"]["npcs"] == 2
        assert entry["snapshot"]["players"] == 2
        assert entry["snapshot"]["items"] == 1
        assert len(entry["snapshot"]["exits"]) == 2
        assert entry["world_summary"]["total_rooms"] == 1
        assert "sha256" in entry
        assert entry["tick_id"].startswith("hb_")

        hb_path = Path(tmp_evidence) / "heartbeat.jsonl"
        assert hb_path.exists()
        line = hb_path.read_text().strip()
        parsed = json.loads(line)
        assert parsed["sha256"] == entry["sha256"]

    def test_append_only(self, tmp_evidence):
        logger = HeartbeatLogger(tmp_evidence)
        room = FakeRoom("spawn", "The Clearing")
        player = FakePlayer()
        world = FakeWorld(room)

        logger.run_heartbeat_tick(world, player)
        logger.run_heartbeat_tick(world, player)

        hb_path = Path(tmp_evidence) / "heartbeat.jsonl"
        lines = [l for l in hb_path.read_text().strip().split("\n") if l]
        assert len(lines) == 2

    def test_tail_empty_file(self, tmp_evidence):
        logger = HeartbeatLogger(tmp_evidence)
        result = logger.tail(3)
        assert result == []

    def test_tail_returns_last_n(self, tmp_evidence):
        logger = HeartbeatLogger(tmp_evidence)
        room = FakeRoom("spawn", "The Clearing")
        player = FakePlayer()
        world = FakeWorld(room)

        for _ in range(5):
            logger.run_heartbeat_tick(world, player)

        result = logger.tail(2)
        assert len(result) == 2

    def test_sha256_verifiable(self, tmp_evidence):
        logger = HeartbeatLogger(tmp_evidence)
        room = FakeRoom("spawn", "The Clearing")
        player = FakePlayer()
        world = FakeWorld(room)

        entry = logger.run_heartbeat_tick(world, player)
        stored_hash = entry["sha256"]

        verify_entry = {k: v for k, v in entry.items() if k != "sha256"}
        verify_line = json.dumps(verify_entry, separators=(",", ":"))
        expected_hash = hashlib.sha256(verify_line.encode("utf-8")).hexdigest()
        assert stored_hash == expected_hash


class TestActivityLogger:
    def test_writes_valid_jsonl(self, tmp_evidence):
        logger = ActivityLogger(tmp_evidence)
        entry = logger.log_action("look", "spawn", "The Clearing", {"exits": ["north", "south"]})

        assert entry["action"] == "look"
        assert entry["room"]["id"] == "spawn"
        assert entry["event_id"].startswith("ba_")
        assert "sha256" in entry

        act_path = Path(tmp_evidence) / "bruce_activity.jsonl"
        assert act_path.exists()
        parsed = json.loads(act_path.read_text().strip())
        assert parsed["action"] == "look"

    def test_logs_all_action_types(self, tmp_evidence):
        logger = ActivityLogger(tmp_evidence)

        logger.log_action("look", "spawn", "The Clearing", {"exits": ["north"]})
        logger.log_action("move", "forest_north", "Whispering Pines", {"direction": "north", "result": "moved"})
        logger.log_action("say", "spawn", "The Clearing", {"phrase": "The forest remembers."})
        logger.log_action("spawn_attempt", "spawn", "The Clearing", {"npc_name": "Wanderer"})

        act_path = Path(tmp_evidence) / "bruce_activity.jsonl"
        lines = [l for l in act_path.read_text().strip().split("\n") if l]
        assert len(lines) == 4
        actions = [json.loads(l)["action"] for l in lines]
        assert actions == ["look", "move", "say", "spawn_attempt"]

    def test_tail_empty_file(self, tmp_evidence):
        logger = ActivityLogger(tmp_evidence)
        assert logger.tail(5) == []

    def test_tail_returns_last_n(self, tmp_evidence):
        logger = ActivityLogger(tmp_evidence)
        for i in range(8):
            logger.log_action("look", "spawn", "The Clearing", {"tick": i})
        result = logger.tail(3)
        assert len(result) == 3


class TestGetEvidenceSizes:
    def test_returns_none_for_missing_files(self, tmp_evidence):
        sizes = get_evidence_sizes(tmp_evidence)
        assert sizes["heartbeat.jsonl"] is None
        assert sizes["bruce_activity.jsonl"] is None

    def test_returns_sizes_for_existing_files(self, tmp_evidence):
        (Path(tmp_evidence) / "heartbeat.jsonl").write_text('{"test":1}\n')
        sizes = get_evidence_sizes(tmp_evidence)
        assert sizes["heartbeat.jsonl"] is not None
        assert sizes["heartbeat.jsonl"] > 0
