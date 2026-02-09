# Artifact Intake System

## Overview

The artifact intake system provides a structured pipeline for submitting, validating, archiving, and witnessing external artifacts within the Harris Wildlands MUD. Bruce acts as the sole witness — he receives artifacts, hashes them, validates them, and logs everything to append-only evidence files.

**Design principle**: Bruce witnesses, he does not interpret. No network calls, no DB, no hidden actions. Plain files only.

## Flow

```
Artifact Created → Submitted via MUD command → Intake Check → Witnessed Statement → Archived
```

1. A human player submits an artifact via `bruce intake <type> <source> [id] <content>`
2. The system validates: bounded size, known type, declared provenance
3. Content is hashed (sha256 of raw bytes — always computed, never trusted from input)
4. Based on validation:
   - **ACCEPTED**: Stored in `archive/`, logged to `intake.jsonl`
   - **QUARANTINED**: Stored in `quarantine/`, logged with reason
   - **REFUSED**: Not stored, logged with reason only
5. Bruce announces the result in the MUD

## Commands

All commands are restricted to human players only. Bots are denied via the authorization gate.

### `bruce intake <type> <source> [artifact_id] <content>`

Submit an artifact for intake.

- **type**: TEXT, JSON, MARKDOWN, LOG, DIFF, NOTE, ANALYSIS
- **source**: human, codex, openclaw, script, unknown
- **artifact_id**: Optional custom ID (auto-generated uuid4 if omitted)
- **content**: The artifact content (remaining args after type/source/id)

Example:
```
bruce intake TEXT human my-note-001 This is a field observation about room connectivity
```

Response:
```
INTAKE ACCEPTED: my-note-001 (ok) hash=a1b2c3d4e5f6...
```

### `bruce inspect <artifact_id>`

View a stored artifact's metadata and content preview (first 200 chars).

Example:
```
bruce inspect my-note-001
```

### `bruce link <artifact_id_a> <artifact_id_b> [note]`

Record a relationship between two artifacts. No graph DB — just an append-only event.

Example:
```
bruce link my-note-001 my-note-002 These observations are related
```

### `bruce annotate <artifact_id> <text>`

Add a timestamped annotation to an artifact's record.

Example:
```
bruce annotate my-note-001 Confirmed by visual inspection on 2026-02-08
```

## File Locations

All evidence lives under `07_HARRIS_WILDLANDS/evidence/artifacts/`:

| Path | Contents |
|------|----------|
| `intake.jsonl` | Append-only log of all intake events, links, and annotations (sha256-checksummed) |
| `archive/<id>.json` | Full content of accepted artifacts |
| `quarantine/<id>.json` | Full content of quarantined artifacts (failed validation) |

## Evidence Format (JSONL)

Each line in `intake.jsonl` is a JSON object with an appended `sha256` field computed on the unsigned payload:

### INTAKE event
```json
{
  "event_type": "INTAKE",
  "timestamp": "2026-02-08T20:00:00+00:00",
  "actor": "bruce",
  "artifact_id": "abc123",
  "status": "ACCEPTED",
  "artifact_type": "TEXT",
  "source": "human",
  "content_hash": "<sha256 of content bytes>",
  "bytes": 42,
  "reason": "ok",
  "archive_path": "evidence/artifacts/archive/abc123.json",
  "sha256": "<sha256 of this event line>"
}
```

### LINK event
```json
{
  "event_type": "LINK",
  "timestamp": "...",
  "actor": "bruce",
  "artifact_id_a": "abc123",
  "artifact_id_b": "def456",
  "note": "optional note",
  "sha256": "..."
}
```

### ANNOTATE event
```json
{
  "event_type": "ANNOTATE",
  "timestamp": "...",
  "actor": "bruce",
  "artifact_id": "abc123",
  "text": "annotation content",
  "sha256": "..."
}
```

## Validation Rules

- **Bounded**: Content must be <= 1MB (1,000,000 bytes)
- **Typed**: `artifact_type` must be one of the allowed enum values
- **Provenance declared**: `source` must be non-empty and from the allowed set
- **Hash integrity**: Content hash is always computed from received bytes; provided hashes are ignored

## Falsification Checks

1. `intake.jsonl` only grows (append-only) — file size should never decrease
2. Every line in `intake.jsonl` has a `sha256` field that can be independently verified
3. Archive files contain `content_hash` that matches sha256 of `content_text`
4. Quarantined files are stored separately with the reason for quarantine
5. `dev logsizes` shows file growth over time

## Security

- `bruce` command is in the bot deny list — bots cannot submit, inspect, link, or annotate artifacts
- Only human players can execute bruce commands
- All artifact actions are logged to `bruce_activity.jsonl` via the activity logger
