"""Tests for the World Growth Budget system."""
import json
import os
import pytest
from datetime import datetime, timezone, timedelta

from orchestrator.growth_budget import GrowthBudget, get_window_key
from orchestrator.growth_offer import (
    propose, apply_offer, GrowthOffer, ALL_TEMPLATES, ROOM_TEMPLATES, NPC_TEMPLATES,
)
from orchestrator.flight_recorder import FlightRecorder


class FakeRoom:
    def __init__(self, id, name, description):
        self.id = id
        self.name = name
        self.description = description
        self.exits = {}
        self.objects = []
        self.npcs = []
        self.players = set()


class FakeNPC:
    def __init__(self, id, name, description, npc_type="friendly"):
        self.id = id
        self.name = name
        self.description = description
        self.type = npc_type
        self.room_id = None


class FakeWorld:
    def __init__(self):
        self.rooms = {}
        self.npcs = {}
        spawn = FakeRoom("spawn", "The Clearing", "A mossy clearing.")
        spawn.exits = {"north": "forest_north"}
        north = FakeRoom("forest_north", "Whispering Pines", "Tall pines.")
        north.exits = {"south": "spawn"}
        self.rooms["spawn"] = spawn
        self.rooms["forest_north"] = north


class TestWindowKey:
    def test_day_window(self):
        dt = datetime(2026, 2, 9, 14, 30, tzinfo=timezone.utc)
        assert get_window_key(dt, "day") == "2026-02-09"

    def test_hour_window(self):
        dt = datetime(2026, 2, 9, 14, 30, tzinfo=timezone.utc)
        assert get_window_key(dt, "hour") == "2026-02-09T14"

    def test_different_days_different_keys(self):
        day1 = datetime(2026, 2, 9, tzinfo=timezone.utc)
        day2 = datetime(2026, 2, 10, tzinfo=timezone.utc)
        assert get_window_key(day1, "day") != get_window_key(day2, "day")


class TestGrowthBudget:
    @pytest.fixture
    def budget(self, tmp_path):
        state_path = str(tmp_path / "growth_state.json")
        return GrowthBudget(state_path)

    def test_initial_status(self, budget):
        status = budget.status()
        assert status["budget_total"] == 2
        assert status["budget_used"] == 0
        assert status["budget_remaining"] == 2

    def test_can_consume_initially(self, budget):
        assert budget.can_consume() is True

    def test_consume_decrements(self, budget):
        budget.consume("test_apply_1")
        status = budget.status()
        assert status["budget_used"] == 1
        assert status["budget_remaining"] == 1
        assert status["last_apply_id"] == "test_apply_1"

    def test_consume_twice_exhausts(self, budget):
        budget.consume("apply_1")
        budget.consume("apply_2")
        assert budget.can_consume() is False

    def test_consume_when_exhausted_raises(self, budget):
        budget.consume("apply_1")
        budget.consume("apply_2")
        with pytest.raises(RuntimeError, match="exhausted"):
            budget.consume("apply_3")

    def test_window_reset(self, tmp_path):
        state_path = str(tmp_path / "growth_state.json")
        budget = GrowthBudget(state_path)
        today = datetime(2026, 2, 9, tzinfo=timezone.utc)
        budget.consume("apply_1", today)
        budget.consume("apply_2", today)
        assert budget.can_consume(today) is False
        tomorrow = datetime(2026, 2, 10, tzinfo=timezone.utc)
        assert budget.can_consume(tomorrow) is True
        status = budget.status(tomorrow)
        assert status["budget_remaining"] == 2

    def test_state_persists(self, tmp_path):
        state_path = str(tmp_path / "growth_state.json")
        budget1 = GrowthBudget(state_path)
        budget1.consume("apply_1")
        budget2 = GrowthBudget(state_path)
        status = budget2.status()
        assert status["budget_used"] == 1

    def test_custom_config(self, tmp_path):
        config_path = str(tmp_path / "config.json")
        with open(config_path, "w") as f:
            json.dump({"budget_total": 5, "window_kind": "hour"}, f)
        budget = GrowthBudget(str(tmp_path / "state.json"), config_path)
        status = budget.status()
        assert status["budget_total"] == 5
        assert status["window_kind"] == "hour"


class TestGrowthOffer:
    def test_propose_returns_offer(self):
        world = FakeWorld()
        offer = propose(world)
        assert isinstance(offer, GrowthOffer)
        assert offer.offer_id.startswith("off_")
        assert offer.kind in ("room", "npc")
        assert len(offer.ops) == 1

    def test_offer_has_one_op(self):
        world = FakeWorld()
        for _ in range(20):
            offer = propose(world)
            assert len(offer.ops) == 1

    def test_offer_to_dict(self):
        world = FakeWorld()
        offer = propose(world)
        d = offer.to_dict()
        assert "offer_id" in d
        assert "ops" in d
        assert "will_write_evidence" in d
        assert "will_not_touch" in d

    def test_offer_to_card(self):
        world = FakeWorld()
        offer = propose(world)
        card = offer.to_card(budget_remaining=2, budget_total=2)
        assert "OFFER:" in card
        assert offer.offer_id in card
        assert "/build on" in card

    def test_room_offer_has_id(self):
        world = FakeWorld()
        for _ in range(50):
            offer = propose(world)
            if offer.kind == "room":
                assert offer.ops[0]["params"]["id"].startswith("growth_")
                return
        pytest.skip("No room offer generated in 50 tries")


class TestApplyOffer:
    def test_apply_room(self):
        world = FakeWorld()
        offer = propose(world)
        while offer.kind != "room":
            offer = propose(world)
        result = apply_offer(world, offer, room_factory=FakeRoom, npc_factory=FakeNPC)
        assert result["success"] is True
        assert result["room_id"] in world.rooms
        new_room = world.rooms[result["room_id"]]
        assert len(new_room.exits) > 0

    def test_apply_npc(self):
        world = FakeWorld()
        offer = propose(world)
        while offer.kind != "npc":
            offer = propose(world)
        result = apply_offer(world, offer, room_factory=FakeRoom, npc_factory=FakeNPC)
        assert result["success"] is True
        assert result["npc_id"] in world.npcs
        npc = world.npcs[result["npc_id"]]
        assert npc.room_id in world.rooms

    def test_apply_creates_bidirectional_exits(self):
        world = FakeWorld()
        offer = propose(world)
        while offer.kind != "room":
            offer = propose(world)
        result = apply_offer(world, offer, room_factory=FakeRoom, npc_factory=FakeNPC)
        assert result["success"] is True
        new_room = world.rooms[result["room_id"]]
        connected_room = world.rooms[result["connected_to"]]
        assert result["room_id"] in connected_room.exits.values()
        assert result["connected_to"] in new_room.exits.values()

    def test_apply_duplicate_room_fails(self):
        world = FakeWorld()
        offer = GrowthOffer(
            offer_id="test_dup",
            kind="room",
            title="Dup",
            summary="dup",
            ops=[{"op": "ADD_ROOM", "params": {"id": "spawn", "name": "Dup"}}],
        )
        result = apply_offer(world, offer, room_factory=FakeRoom)
        assert result["success"] is False
        assert "already exists" in result["error"]

    def test_apply_empty_ops_fails(self):
        offer = GrowthOffer(
            offer_id="empty", kind="room", title="Empty", summary="empty", ops=[]
        )
        result = apply_offer(FakeWorld(), offer)
        assert result["success"] is False

    def test_apply_unknown_op_fails(self):
        offer = GrowthOffer(
            offer_id="unk", kind="room", title="Unk", summary="unk",
            ops=[{"op": "DELETE_ROOM", "params": {}}],
        )
        result = apply_offer(FakeWorld(), offer)
        assert result["success"] is False
        assert "Unknown op" in result["error"]

    def test_no_factory_fails(self):
        world = FakeWorld()
        offer = propose(world)
        while offer.kind != "room":
            offer = propose(world)
        result = apply_offer(world, offer)
        assert result["success"] is False
        assert "factory" in result["error"].lower()


class TestFlightRecorder:
    @pytest.fixture
    def recorder(self, tmp_path):
        return FlightRecorder(str(tmp_path / "evidence"))

    def test_record_creates_file(self, recorder):
        recorder.record("growth.offer.created", actor="test", window_key="2026-02-09")
        assert recorder.log_path.exists()

    def test_record_returns_entry(self, recorder):
        entry = recorder.record("growth.offer.created", actor="alice", window_key="2026-02-09")
        assert entry["event_type"] == "growth.offer.created"
        assert entry["actor"] == "alice"
        assert "event_id" in entry
        assert "sha256" in entry

    def test_tail_returns_entries(self, recorder):
        recorder.record("growth.offer.created", actor="a", window_key="w1")
        recorder.record("growth.apply.succeeded", actor="b", window_key="w1")
        entries = recorder.tail(10)
        assert len(entries) == 2
        assert entries[0]["event_type"] == "growth.offer.created"
        assert entries[1]["event_type"] == "growth.apply.succeeded"

    def test_tail_limits(self, recorder):
        for i in range(5):
            recorder.record(f"event_{i}", actor="x", window_key="w")
        entries = recorder.tail(2)
        assert len(entries) == 2

    def test_tail_empty(self, recorder):
        assert recorder.tail() == []

    def test_offer_id_in_entry(self, recorder):
        entry = recorder.record(
            "growth.offer.created", actor="a", window_key="w",
            offer_id="off_123",
        )
        assert entry["offer_id"] == "off_123"

    def test_detail_in_entry(self, recorder):
        entry = recorder.record(
            "growth.apply.succeeded", actor="a", window_key="w",
            detail={"room_id": "new_room"},
        )
        assert entry["detail"]["room_id"] == "new_room"


class TestTemplates:
    def test_room_templates_have_required_fields(self):
        for t in ROOM_TEMPLATES:
            assert "title" in t
            assert "summary" in t
            assert t["op"] == "ADD_ROOM"
            assert "name" in t["params"]

    def test_npc_templates_have_required_fields(self):
        for t in NPC_TEMPLATES:
            assert "title" in t
            assert "summary" in t
            assert t["op"] == "ADD_NPC"
            assert "name" in t["params"]

    def test_all_templates_present(self):
        assert len(ALL_TEMPLATES) == len(ROOM_TEMPLATES) + len(NPC_TEMPLATES)
        assert len(ALL_TEMPLATES) >= 4
