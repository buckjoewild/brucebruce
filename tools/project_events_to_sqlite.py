#!/usr/bin/env python3
"""
SQLite Event Projector — derives a queryable read-model from append-only JSONL evidence logs.

This tool is READ-ONLY with respect to world state.  It never imports server
modules or touches mutation gates (/build, /consent, growth apply, patching).

Input:  allowlisted JSONL log paths (--log PATH …)
Output: SQLite DB at --db (default: evidence/derived/events.db)

Ingestion is incremental by byte-offset.  If a source file shrinks (rotation /
truncation) the projector resets that log and re-ingests from the top.

stdlib only — no third-party dependencies.
"""

import argparse
import hashlib
import json
import os
import sqlite3
import sys
from pathlib import Path

DB_SCHEMA = """
CREATE TABLE IF NOT EXISTS ingest_state (
    log_path   TEXT PRIMARY KEY,
    last_size  INTEGER NOT NULL DEFAULT 0,
    last_mtime REAL    NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id      TEXT,
    ts            TEXT,
    kind          TEXT,
    actor         TEXT,
    role          TEXT,
    mode          TEXT,
    offer_id      TEXT,
    apply_id      TEXT,
    window_key    TEXT,
    room_id       TEXT,
    payload_json  TEXT,
    raw_json      TEXT    NOT NULL,
    sha256        TEXT    NOT NULL,
    log_path      TEXT    NOT NULL,
    line_no       INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_ts        ON events(ts);
CREATE INDEX IF NOT EXISTS idx_events_kind      ON events(kind);
CREATE INDEX IF NOT EXISTS idx_events_offer_id  ON events(offer_id);
CREATE INDEX IF NOT EXISTS idx_events_apply_id  ON events(apply_id);
CREATE INDEX IF NOT EXISTS idx_events_log_line  ON events(log_path, line_no);
CREATE INDEX IF NOT EXISTS idx_events_room_id   ON events(room_id);
"""


def init_db(db_path: str) -> sqlite3.Connection:
    parent = Path(db_path).parent
    parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.executescript(DB_SCHEMA)
    conn.commit()
    return conn


def _extract(obj: dict) -> dict:
    """Schema-drift-tolerant field extraction."""
    kind = obj.get("event_type") or obj.get("kind") or obj.get("action") or obj.get("verb") or obj.get("source") or obj.get("type") or "unknown"
    ts = obj.get("ts") or obj.get("timestamp") or None
    event_id = obj.get("event_id") or obj.get("id") or obj.get("tick_id") or None
    actor = obj.get("actor") or obj.get("player") or obj.get("player_id") or None
    role = obj.get("role") or None
    mode = obj.get("mode") or None
    offer_id = obj.get("offer_id") or None
    apply_id = obj.get("apply_id") or None
    window_key = obj.get("window_key") or None

    room_id = None
    room_val = obj.get("room")
    if isinstance(room_val, dict):
        room_id = room_val.get("id")
    elif isinstance(room_val, str):
        room_id = room_val

    detail = obj.get("detail") or obj.get("args") or obj.get("snapshot")
    payload_json = json.dumps(detail) if isinstance(detail, (dict, list)) else None

    return {
        "event_id": event_id,
        "ts": ts,
        "kind": kind,
        "actor": actor,
        "role": role,
        "mode": mode,
        "offer_id": offer_id,
        "apply_id": apply_id,
        "window_key": window_key,
        "room_id": room_id,
        "payload_json": payload_json,
    }


def _get_ingest_state(conn: sqlite3.Connection, log_path: str):
    row = conn.execute(
        "SELECT last_size, last_mtime FROM ingest_state WHERE log_path = ?",
        (log_path,),
    ).fetchone()
    if row:
        return {"last_size": row[0], "last_mtime": row[1]}
    return {"last_size": 0, "last_mtime": 0}


def _set_ingest_state(conn: sqlite3.Connection, log_path: str, size: int, mtime: float):
    conn.execute(
        """INSERT INTO ingest_state (log_path, last_size, last_mtime)
           VALUES (?, ?, ?)
           ON CONFLICT(log_path) DO UPDATE SET last_size=excluded.last_size, last_mtime=excluded.last_mtime""",
        (log_path, size, mtime),
    )


def ingest_log(conn: sqlite3.Connection, log_path: str, *, verbose: bool = False) -> int:
    """Ingest new lines from a single JSONL log.  Returns count of new events."""
    if not os.path.isfile(log_path):
        if verbose:
            print(f"  SKIP (not found): {log_path}", file=sys.stderr)
        return 0

    stat = os.stat(log_path)
    current_size = stat.st_size
    current_mtime = stat.st_mtime

    state = _get_ingest_state(conn, log_path)

    if current_size < state["last_size"]:
        if verbose:
            print(f"  RESET (file shrunk {state['last_size']} -> {current_size}): {log_path}", file=sys.stderr)
        conn.execute("DELETE FROM events WHERE log_path = ?", (log_path,))
        state = {"last_size": 0, "last_mtime": 0}

    if current_size == state["last_size"]:
        if verbose:
            print(f"  SKIP (no new bytes): {log_path}", file=sys.stderr)
        return 0

    offset = state["last_size"]
    existing_max_line = conn.execute(
        "SELECT COALESCE(MAX(line_no), 0) FROM events WHERE log_path = ?",
        (log_path,),
    ).fetchone()[0]

    inserted = 0
    with open(log_path, "r", encoding="utf-8") as f:
        f.seek(offset)
        line_no = existing_max_line
        for raw_line in f:
            line_no += 1
            raw_line = raw_line.strip()
            if not raw_line:
                continue
            try:
                obj = json.loads(raw_line)
            except json.JSONDecodeError:
                if verbose:
                    print(f"  WARN bad JSON at {log_path}:{line_no}", file=sys.stderr)
                continue

            sha = hashlib.sha256(raw_line.encode("utf-8")).hexdigest()
            fields = _extract(obj)

            conn.execute(
                """INSERT INTO events
                   (event_id, ts, kind, actor, role, mode,
                    offer_id, apply_id, window_key, room_id,
                    payload_json, raw_json, sha256, log_path, line_no)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    fields["event_id"],
                    fields["ts"],
                    fields["kind"],
                    fields["actor"],
                    fields["role"],
                    fields["mode"],
                    fields["offer_id"],
                    fields["apply_id"],
                    fields["window_key"],
                    fields["room_id"],
                    fields["payload_json"],
                    raw_line,
                    sha,
                    log_path,
                    line_no,
                ),
            )
            inserted += 1

    _set_ingest_state(conn, log_path, current_size, current_mtime)
    conn.commit()
    if verbose:
        print(f"  INGESTED {inserted} events from {log_path}", file=sys.stderr)
    return inserted


def main():
    parser = argparse.ArgumentParser(description="Project JSONL evidence logs into SQLite read-model.")
    parser.add_argument("--db", default="evidence/derived/events.db", help="Output SQLite database path")
    parser.add_argument("--log", action="append", dest="logs", required=True, help="JSONL log path (repeatable)")
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args()

    conn = init_db(args.db)
    total = 0
    for log_path in args.logs:
        total += ingest_log(conn, log_path, verbose=args.verbose)
    conn.close()

    if args.verbose or total > 0:
        print(f"Projection complete: {total} new events ingested into {args.db}", file=sys.stderr)


if __name__ == "__main__":
    main()
