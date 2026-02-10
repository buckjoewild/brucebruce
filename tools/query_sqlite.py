#!/usr/bin/env python3
"""
Predefined-only query runner for the SQLite event projection.

Runs one of 5 named queries against evidence/derived/events.db.
NO freeform SQL is accepted — all queries are hardcoded here.

Usage:
    python tools/query_sqlite.py recent              # Events since 1h ago
    python tools/query_sqlite.py recent --since 2026-02-09T00:00:00
    python tools/query_sqlite.py growth_story
    python tools/query_sqlite.py security
    python tools/query_sqlite.py hot_rooms
    python tools/query_sqlite.py budget_compliance
"""

import argparse
import json
import sqlite3
import sys
from datetime import datetime, timedelta, timezone

DEFAULT_DB = "evidence/derived/events.db"

QUERIES = {
    "recent": {
        "description": "Events since a given timestamp (default: last 1 hour)",
        "sql": """
            SELECT ts, kind, actor, event_id, room_id,
                   SUBSTR(payload_json, 1, 120) AS payload_preview
            FROM events
            WHERE ts >= ?
            ORDER BY ts ASC
        """,
        "needs_since": True,
    },
    "growth_story": {
        "description": "Growth lifecycle: offers created, applies started/succeeded/failed",
        "sql": """
            SELECT ts, kind, actor, offer_id, window_key,
                   SUBSTR(payload_json, 1, 200) AS detail
            FROM events
            WHERE kind LIKE 'growth.%'
            ORDER BY ts ASC
        """,
        "needs_since": False,
    },
    "security": {
        "description": "Security-relevant events: deny, auth, unauth, rate-limit",
        "sql": """
            SELECT ts, kind, actor, event_id,
                   SUBSTR(payload_json, 1, 150) AS detail
            FROM events
            WHERE kind LIKE '%deny%'
               OR kind LIKE '%auth%'
               OR kind LIKE '%unauth%'
               OR kind LIKE '%rate%'
               OR kind LIKE '%block%'
               OR kind LIKE '%reject%'
            ORDER BY ts ASC
        """,
        "needs_since": False,
    },
    "hot_rooms": {
        "description": "Most-referenced rooms across all events",
        "sql": """
            SELECT room_id, COUNT(*) AS event_count,
                   MIN(ts) AS first_seen, MAX(ts) AS last_seen
            FROM events
            WHERE room_id IS NOT NULL
            GROUP BY room_id
            ORDER BY event_count DESC
            LIMIT 20
        """,
        "needs_since": False,
    },
    "budget_compliance": {
        "description": "Growth budget usage per window",
        "sql": """
            SELECT window_key,
                   SUM(CASE WHEN kind = 'growth.offer.created'   THEN 1 ELSE 0 END) AS offers,
                   SUM(CASE WHEN kind = 'growth.apply.started'   THEN 1 ELSE 0 END) AS applies_started,
                   SUM(CASE WHEN kind = 'growth.apply.succeeded' THEN 1 ELSE 0 END) AS applies_ok,
                   SUM(CASE WHEN kind = 'growth.apply.failed'    THEN 1 ELSE 0 END) AS applies_fail
            FROM events
            WHERE window_key IS NOT NULL
            GROUP BY window_key
            ORDER BY window_key ASC
        """,
        "needs_since": False,
    },
}


def run_query(db_path: str, query_name: str, since: str | None = None):
    if query_name not in QUERIES:
        print(f"Unknown query: {query_name}", file=sys.stderr)
        print(f"Available: {', '.join(QUERIES.keys())}", file=sys.stderr)
        sys.exit(1)

    q = QUERIES[query_name]
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row

    if q["needs_since"]:
        if since is None:
            since = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
        rows = conn.execute(q["sql"], (since,)).fetchall()
    else:
        rows = conn.execute(q["sql"]).fetchall()

    conn.close()

    print(f"=== {query_name}: {q['description']} ===")
    if q["needs_since"]:
        print(f"    (since {since})")
    print(f"    {len(rows)} row(s)\n")

    if not rows:
        print("  (no results)")
        return rows

    cols = rows[0].keys()
    for row in rows:
        parts = []
        for c in cols:
            v = row[c]
            if v is not None:
                parts.append(f"{c}={v}")
        print("  " + "  |  ".join(parts))

    return rows


def main():
    parser = argparse.ArgumentParser(description="Run predefined queries on the event projection DB.")
    parser.add_argument("query", choices=list(QUERIES.keys()), help="Named query to run")
    parser.add_argument("--db", default=DEFAULT_DB, help="SQLite DB path")
    parser.add_argument("--since", default=None, help="ISO timestamp for 'recent' query (default: 1h ago)")
    args = parser.parse_args()
    run_query(args.db, args.query, since=args.since)


if __name__ == "__main__":
    main()
