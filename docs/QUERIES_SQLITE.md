# SQLite Event Projection — Query Reference

## Overview
The SQLite database at `evidence/derived/events.db` is a **derived read-model** projected from the append-only JSONL evidence logs. It is NOT the truth source — the JSONL files are.

### Terminology
- JSONL logs are **append-only** evidence.
- Checksums are **checksums** (SHA-256 of raw JSON line). They are called **tamper-evident (HMAC-signed)** only when `EVIDENCE_HMAC_KEY` is set.
- The SQLite database is a **projection** for fast queries. It does not expose any network SQL endpoint.

## Running the Projector
```bash
python tools/project_events_to_sqlite.py \
  --db 07_HARRIS_WILDLANDS/evidence/derived/events.db \
  --log 07_HARRIS_WILDLANDS/evidence/event_log.jsonl \
  --log 07_HARRIS_WILDLANDS/evidence/growth_events.jsonl \
  --log 07_HARRIS_WILDLANDS/evidence/heartbeat.jsonl \
  --log 07_HARRIS_WILDLANDS/evidence/bruce_activity.jsonl \
  --log 07_HARRIS_WILDLANDS/evidence/bruce_memory.jsonl \
  -v
```

Ingestion is incremental by byte offset. Re-running inserts only new lines. If a log file shrinks (rotation/truncation), the projector resets that log and re-ingests from the top.

## Running Named Queries
```bash
python tools/query_sqlite.py <query_name> [--db PATH] [--since ISO_TIMESTAMP]
```

Available query names: `recent`, `growth_story`, `security`, `hot_rooms`, `budget_compliance`

---

## Query 1: What Changed Since Timestamp
Shows all events since a given time (default: last 1 hour).

```sql
SELECT ts, kind, actor, event_id, room_id,
       SUBSTR(payload_json, 1, 120) AS payload_preview
FROM events
WHERE ts >= '2026-02-09T00:00:00'
ORDER BY ts ASC;
```

**CLI:** `python tools/query_sqlite.py recent --since 2026-02-09T00:00:00`

---

## Query 2: Growth Story
Full lifecycle of growth offers: created, applied, succeeded, failed.

```sql
SELECT ts, kind, actor, offer_id, window_key,
       SUBSTR(payload_json, 1, 200) AS detail
FROM events
WHERE kind LIKE 'growth.%'
ORDER BY ts ASC;
```

**CLI:** `python tools/query_sqlite.py growth_story`

---

## Query 3: Security Events
Denial, auth, rate-limit, and rejection events.

```sql
SELECT ts, kind, actor, event_id,
       SUBSTR(payload_json, 1, 150) AS detail
FROM events
WHERE kind LIKE '%deny%'
   OR kind LIKE '%auth%'
   OR kind LIKE '%unauth%'
   OR kind LIKE '%rate%'
   OR kind LIKE '%block%'
   OR kind LIKE '%reject%'
ORDER BY ts ASC;
```

**CLI:** `python tools/query_sqlite.py security`

---

## Query 4: Hot Rooms
Most-referenced rooms across all events.

```sql
SELECT room_id, COUNT(*) AS event_count,
       MIN(ts) AS first_seen, MAX(ts) AS last_seen
FROM events
WHERE room_id IS NOT NULL
GROUP BY room_id
ORDER BY event_count DESC
LIMIT 20;
```

**CLI:** `python tools/query_sqlite.py hot_rooms`

---

## Query 5: Growth Budget Compliance by Window
Verifies budget enforcement per time window.

```sql
SELECT window_key,
       SUM(CASE WHEN kind = 'growth.offer.created'   THEN 1 ELSE 0 END) AS offers,
       SUM(CASE WHEN kind = 'growth.apply.started'   THEN 1 ELSE 0 END) AS applies_started,
       SUM(CASE WHEN kind = 'growth.apply.succeeded' THEN 1 ELSE 0 END) AS applies_ok,
       SUM(CASE WHEN kind = 'growth.apply.failed'    THEN 1 ELSE 0 END) AS applies_fail
FROM events
WHERE window_key IS NOT NULL
GROUP BY window_key
ORDER BY window_key ASC;
```

**CLI:** `python tools/query_sqlite.py budget_compliance`

---

## In-Game `/status` Command
The `status` command in-game now includes an **Event Pulse** section showing:
- Total events logged
- Growth offers created
- Growth applies succeeded

This uses predefined read-only queries only. No freeform SQL. Zero mutation.

## Schema
```
events(
    id, event_id, ts, kind, actor, role, mode,
    offer_id, apply_id, window_key, room_id,
    payload_json, raw_json, sha256,
    log_path, line_no
)
ingest_state(log_path, last_size, last_mtime)
```

Indexes: `ts`, `kind`, `offer_id`, `apply_id`, `(log_path, line_no)`, `room_id`
