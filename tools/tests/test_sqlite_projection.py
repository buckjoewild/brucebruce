"""
Tests for tools/project_events_to_sqlite.py

Verifies:
- DB schema created correctly
- Events ingested and queryable
- Incremental re-run inserts 0 duplicates
- File truncation/rotation triggers reset and re-ingest
- Projector does NOT import any server modules
- raw_json always stored
"""

import hashlib
import importlib
import json
import os
import sqlite3
import sys
import tempfile

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from tools.project_events_to_sqlite import init_db, ingest_log


SAMPLE_EVENTS = [
    {
        "ts": "2026-02-09T10:00:00+00:00",
        "event_id": "evt_aaa",
        "event_type": "growth.offer.created",
        "actor": "Tester",
        "window_key": "2026-02-09",
        "offer_id": "off_123",
        "detail": {"title": "New Meadow"},
        "sha256": "fake_checksum",
    },
    {
        "ts": "2026-02-09T10:01:00+00:00",
        "event_id": "evt_bbb",
        "event_type": "growth.apply.succeeded",
        "actor": "Tester",
        "window_key": "2026-02-09",
        "offer_id": "off_123",
        "detail": {"success": True, "room_id": "growth_meadow"},
        "sha256": "fake_checksum_2",
    },
    {
        "ts": "2026-02-09T10:02:00+00:00",
        "action": "look",
        "event_id": "ba_ccc",
        "room": {"id": "spawn", "name": "The Clearing"},
        "detail": {"exits": ["north"], "npcs": 1, "players": 2},
        "sha256": "fake_checksum_3",
    },
]


@pytest.fixture
def tmp_db():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        path = f.name
    conn = init_db(path)
    yield conn, path
    conn.close()
    os.unlink(path)


@pytest.fixture
def tmp_jsonl():
    with tempfile.NamedTemporaryFile(mode="w", suffix=".jsonl", delete=False) as f:
        for evt in SAMPLE_EVENTS:
            f.write(json.dumps(evt) + "\n")
        path = f.name
    yield path
    os.unlink(path)


class TestSchemaCreation:
    def test_tables_exist(self, tmp_db):
        conn, _ = tmp_db
        tables = {
            r[0]
            for r in conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }
        assert "events" in tables
        assert "ingest_state" in tables

    def test_indexes_exist(self, tmp_db):
        conn, _ = tmp_db
        indexes = {
            r[0]
            for r in conn.execute(
                "SELECT name FROM sqlite_master WHERE type='index'"
            ).fetchall()
        }
        assert "idx_events_ts" in indexes
        assert "idx_events_kind" in indexes
        assert "idx_events_offer_id" in indexes


class TestIngestion:
    def test_ingest_inserts_all_events(self, tmp_db, tmp_jsonl):
        conn, _ = tmp_db
        count = ingest_log(conn, tmp_jsonl)
        assert count == 3
        rows = conn.execute("SELECT COUNT(*) FROM events").fetchone()[0]
        assert rows == 3

    def test_raw_json_stored(self, tmp_db, tmp_jsonl):
        conn, _ = tmp_db
        ingest_log(conn, tmp_jsonl)
        raw = conn.execute("SELECT raw_json FROM events WHERE event_id='evt_aaa'").fetchone()[0]
        obj = json.loads(raw)
        assert obj["event_type"] == "growth.offer.created"

    def test_sha256_computed(self, tmp_db, tmp_jsonl):
        conn, _ = tmp_db
        ingest_log(conn, tmp_jsonl)
        row = conn.execute("SELECT raw_json, sha256 FROM events WHERE event_id='evt_aaa'").fetchone()
        expected = hashlib.sha256(row[0].encode("utf-8")).hexdigest()
        assert row[1] == expected

    def test_schema_drift_tolerance(self, tmp_db, tmp_jsonl):
        conn, _ = tmp_db
        ingest_log(conn, tmp_jsonl)
        kinds = [
            r[0] for r in conn.execute("SELECT kind FROM events ORDER BY line_no").fetchall()
        ]
        assert kinds == ["growth.offer.created", "growth.apply.succeeded", "look"]

    def test_room_extraction(self, tmp_db, tmp_jsonl):
        conn, _ = tmp_db
        ingest_log(conn, tmp_jsonl)
        room = conn.execute("SELECT room_id FROM events WHERE event_id='ba_ccc'").fetchone()[0]
        assert room == "spawn"

    def test_offer_id_extraction(self, tmp_db, tmp_jsonl):
        conn, _ = tmp_db
        ingest_log(conn, tmp_jsonl)
        offer_ids = [
            r[0]
            for r in conn.execute(
                "SELECT offer_id FROM events WHERE offer_id IS NOT NULL ORDER BY line_no"
            ).fetchall()
        ]
        assert offer_ids == ["off_123", "off_123"]


class TestIncremental:
    def test_rerun_inserts_zero(self, tmp_db, tmp_jsonl):
        conn, _ = tmp_db
        first = ingest_log(conn, tmp_jsonl)
        assert first == 3
        second = ingest_log(conn, tmp_jsonl)
        assert second == 0
        rows = conn.execute("SELECT COUNT(*) FROM events").fetchone()[0]
        assert rows == 3

    def test_append_ingests_only_new(self, tmp_db, tmp_jsonl):
        conn, _ = tmp_db
        ingest_log(conn, tmp_jsonl)
        with open(tmp_jsonl, "a") as f:
            f.write(json.dumps({"ts": "2026-02-09T11:00:00", "event_type": "bonus", "actor": "X"}) + "\n")
        second = ingest_log(conn, tmp_jsonl)
        assert second == 1
        rows = conn.execute("SELECT COUNT(*) FROM events").fetchone()[0]
        assert rows == 4


class TestRotationReset:
    def test_shrink_triggers_reset(self, tmp_db, tmp_jsonl):
        conn, _ = tmp_db
        ingest_log(conn, tmp_jsonl)
        assert conn.execute("SELECT COUNT(*) FROM events").fetchone()[0] == 3

        with open(tmp_jsonl, "w") as f:
            f.write(json.dumps({"ts": "2026-02-10T00:00:00", "event_type": "rotated", "actor": "Sys"}) + "\n")

        count = ingest_log(conn, tmp_jsonl)
        assert count == 1
        total = conn.execute("SELECT COUNT(*) FROM events").fetchone()[0]
        assert total == 1


class TestMissingFile:
    def test_missing_file_returns_zero(self, tmp_db):
        conn, _ = tmp_db
        count = ingest_log(conn, "/nonexistent/file.jsonl")
        assert count == 0


class TestNoServerImports:
    def test_projector_does_not_import_server_modules(self):
        spec = importlib.util.find_spec("tools.project_events_to_sqlite")
        assert spec is not None
        source = spec.origin
        with open(source, "r") as f:
            content = f.read()
        assert "import server" not in content
        assert "from server" not in content
        assert "from 07_HARRIS_WILDLANDS" not in content
        assert "import orchestrator" not in content
