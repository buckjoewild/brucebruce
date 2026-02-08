# Harris Wildlands — Freeze→Measure Update File (v1)
**Status:** DRAFT SPEC CONTAINER (no edits applied yet)  
**Scope posture:** Observation Freeze is currently ACTIVE. This file defines *what will be built later* once evidence is collected.  
**Primary objective:** Add measurement + hardening with minimal behavior change.  
**Top priority:** Canonical clock (single source of time).

---

## 0) Non-Negotiables (Operator Constraints)
**During Freeze (now):**
- ❌ No patching
- ❌ No schema changes
- ❌ No commits
- ❌ No AI-initiated mutations

**After Freeze (when explicitly unlocked):**
- ✅ Changes must be additive-first
- ✅ Minimal diff / minimal surface area
- ✅ No behavior expansion until measurement is trustworthy
- ✅ All new signals must be bounded (caps, rotation, limits)

---

## 1) Goal Statement (Factual)
We want the system to produce reliable evidence about:
- event rate over time
- governance denial rate over time
- which event types dominate log growth
- basic resource drift signals (cpu/mem if available, or loop timing if not)

We do *not* want:
- new agent autonomy
- new AI capabilities
- new world mutation channels
- hidden background loops

---

## 2) Canonical Clock (Single Source of Time) 🕰️
### 2.1 Requirement
All timestamps in:
- event logs
- heartbeats
- session open/close
- governance checks/denials
- any derived metrics

MUST come from a single canonical function/module.

### 2.2 Output formats
- **Machine:** UTC epoch milliseconds (or seconds; choose one and standardize)
- **Human:** ISO-8601 UTC string (optional but helpful)

### 2.3 Audit rule
No direct calls to `time.time()`, `datetime.now()`, etc. outside the clock module
(allowed only inside the canonical clock implementation).

### 2.4 Evidence needed before implementation
Paste here:
- current time usage locations (files, functions)
- example existing log line(s) showing timestamps or lack of them

**EVIDENCE:**
- [x] Files that currently stamp time:
  - `server.py:78` — `Room.__init__`: `self.created_at = datetime.now()`
  - `server.py:361` — `cmd_create`: `datetime.now().timestamp()` for room ID generation
  - `server.py:373` — `cmd_spawn`: `datetime.now().timestamp()` for NPC ID generation
  - `server.py:447` — `broadcast()`: `datetime.now().isoformat()` in broadcast payloads
  - `server.py:542` — `handle_client` response loop: `datetime.now().isoformat()` in response payloads
  - `07_HARRIS_WILDLANDS/orchestrator/bot_audit.py:74` — `BotAuditLogger.log()`: `datetime.now(timezone.utc).isoformat()` ← uses UTC
  - `07_HARRIS_WILDLANDS/orchestrator/bruce_memory.py:59` — `BruceMemory.append_entry()`: `datetime.now(timezone.utc).isoformat()` ← uses UTC
  - `07_HARRIS_WILDLANDS/orchestrator/build_loop.py:87,107` — `BuildOrchestrator`: `datetime.now(timezone.utc).isoformat()` ← uses UTC
  - `07_HARRIS_WILDLANDS/orchestrator/mode_state.py:40` — `ModeStateManager`: `time.time()` for arm timeout (epoch float)
  - `07_HARRIS_WILDLANDS/orchestrator/bot_audit.py:21` — `RateLimiter.check()`: `time.monotonic()` for sliding window timing (monotonic float, not wall-clock)
  - `07_HARRIS_WILDLANDS/orchestrator/patch_apply.py:59` — `PatchApplier`: `datetime.now().strftime(...)` ← local time, no TZ
  - `07_HARRIS_WILDLANDS/orchestrator/codex_adapter.py:185,190` — `CodexAdapter`: `datetime.now().strftime(...)` + `.isoformat()` ← local time, no TZ
- [x] Example log snippets:
  - event_log.jsonl: `{"ts": "2026-02-08T03:28:35.770730+00:00", "id": "evt_2a798a331eb4", ...}` (UTC ISO-8601 with offset)
  - bruce_memory.jsonl: `{"ts": "2026-02-08T17:49:40.294523+00:00", "source": "bruce_observation", ...}` (UTC ISO-8601 with offset)
  - bot_audit.jsonl: `{"ts": "...", "actor_id": "...", "role": "bot", ...}` (UTC ISO-8601 with offset)
  - server.py broadcast: `"timestamp": datetime.now().isoformat()` (local time, NO timezone info)
- [x] Inconsistency summary (4 distinct time representations):
  - Orchestrator modules (bot_audit.log, bruce_memory, build_loop) use `datetime.now(timezone.utc).isoformat()` ← UTC ISO-8601 with offset
  - server.py uses `datetime.now().isoformat()` ← local time, no TZ info, inconsistent
  - mode_state.py uses `time.time()` ← epoch float (wall-clock seconds)
  - bot_audit.py RateLimiter uses `time.monotonic()` ← monotonic float (not wall-clock, for interval measurement only)
  - patch_apply.py and codex_adapter.py use `datetime.now().strftime(...)` ← local time, no TZ

---

## 3) Event Model + Typing (Small enum, huge clarity)
### 3.1 Requirement
Every emitted event must include:
- `event_id` (unique)
- `ts` (canonical clock)
- `event_type` (finite enum)
- `actor_type` (human | ai | system | npc)
- `actor_id` (session/player/npc id when available)
- `session_id` (when applicable)
- `payload` (small, structured, bounded)

### 3.2 Initial `event_type` enum (v1)
Minimum required:
- `heartbeat`
- `session_open`
- `session_close`
- `player_command`
- `governance_check`
- `governance_denial`
- `npc_respawn`
- `error`

Optional (only if already meaningful in runtime):
- `autopilot_tick`
- `ai_decision`
- `world_save`
- `world_load`

### 3.3 Bounded payload policy
- payload must be JSON-serializable
- strict max bytes per event (cap defined in section 6)
- no raw prompt/context dumps
- no secrets

**EVIDENCE (current logging / event stream format):**
- [x] Where logging happens now:
  - `07_HARRIS_WILDLANDS/orchestrator/bot_audit.py` — `BotAuditLogger.log()` writes to `evidence/bot_audit.jsonl`
  - `07_HARRIS_WILDLANDS/orchestrator/bruce_memory.py` — `BruceMemory.append_entry()` writes to `evidence/bruce_memory.jsonl`
  - `07_HARRIS_WILDLANDS/orchestrator/build_loop.py` — `BuildOrchestrator` writes to `evidence/event_log.jsonl`
  - `server.py` — uses `print()` for console logging only (no structured file logging)
- [x] Sample logs (from each source):
  - **event_log.jsonl** (build events): `{"ts": "2026-02-08T04:05:38.893531+00:00", "id": "evt_b85085d7eed0", "actor": "TestPlayer3", "mode": "BUILD", "verb": "dev buildstub", "args": {"raw": ""}, "result": "ok", "durable": false, "patch": {...}, "tests": {...}, "ohp": null, "error": null}`
  - **bruce_memory.jsonl** (NPC memory): `{"ts": "2026-02-08T18:15:55.230589+00:00", "source": "bruce_observation", "content": "We build in truth, not haste.", "player": "Bruce", "room": "forest_east"}`
  - **bot_audit.jsonl** (bot commands): `{"ts": "...", "actor_id": "TestBot", "role": "bot", "source": "ai_player", "cmd_text": "look", "result": "allowed", "reason": "allowed"}`
  - **server.py console**: `Player connected: Wanderer (role=human)` / `Bot authenticated: AIPlayer` / `Player disconnected: Wanderer` (unstructured print statements)
- [x] Three separate log files, three separate schemas, no shared event model

---

## 4) Governance Denial Reason Codes (Countable, stable)
### 4.1 Requirement
Governance denials MUST emit an event with:
- `event_type = governance_denial`
- `deny_code` (stable string enum)
- `deny_detail` (short human explanation, optional)
- `requested_action` (structured)

### 4.2 Initial deny codes (draft)
- `DENY_FREEZE_ACTIVE`
- `DENY_BUILD_MODE_REQUIRED`
- `DENY_AI_AUTONOMY_DISABLED`
- `DENY_INVALID_COMMAND`
- `DENY_SCOPE_VIOLATION`
- `DENY_RATE_LIMIT`
- `DENY_UNKNOWN`

**EVIDENCE (current denial behavior):**
- [x] Current denial sources (from `bot_security.py`):
  - `authorize()` returns `(False, "bot denied: {cmd}")` for DENIED_BOT_COMMANDS: `/build`, `/consent`, `create`, `spawn`
  - `authorize()` returns `(False, "bot denied: {sub}")` for DENIED_BOT_SUBCOMMANDS: `dev buildstub`
  - `check_bot_interlock()` returns `(False, "builds active (IDLE_MODE=0), bot connections refused...")` when builds active
  - `RateLimiter.check()` returns `(False, "rate limited: 5 cmds / 10.0s")` when rate exceeded
  - `BotAuditLogger.validate_message()` returns `(False, "message exceeds 2048 bytes")` for oversized messages
  - `BotAuditLogger.validate_command()` returns `(False, "command exceeds 500 chars")` for long commands
- [x] Bot audit logs denials with `result: "denied"` or `result: "rate_limited"` — these ARE logged to bot_audit.jsonl
- [x] Governance denials for build operations (IDLE_MODE blocking) are NOT logged — server closes connection silently after sending error message
- [x] Human command errors return text to player but are NOT logged anywhere

---

## 5) Idle Heartbeat (Zero authority)
### 5.1 Requirement
A periodic heartbeat that:
- logs a `heartbeat` event
- includes loop timing / tick duration if available
- performs **no** world mutations
- is safe under freeze conditions

### 5.2 Heartbeat payload (v1)
- `uptime_s`
- `tick_ms` (if measurable)
- `active_sessions`
- `queue_depth` (only if exists)
- `notes` (optional)

**EVIDENCE (what loop exists, tick cadence, where to attach):**
- [x] Where the main loop / tick is:
  - `server.py:869` — `async def main()`: starts websocket server with `websockets.serve()`, then `await asyncio.Future()` (infinite wait, no tick loop)
  - `server.py:565` — `bruce_autopilot()`: the ONLY periodic loop — `while True` with `asyncio.sleep(random.randint(10, 20))` (10-20 second random cadence)
  - There is NO dedicated server tick loop — websocket library handles connections event-driven
- [x] Current cadence:
  - Bruce autopilot: 10-20 seconds per tick (random)
  - No heartbeat exists — would need a new `asyncio.create_task()` in `main()`
- [x] Where to attach heartbeat:
  - New `asyncio.create_task(heartbeat_loop())` in `main()` alongside bruce_autopilot
  - Could piggyback on bruce_autopilot but should be separate (zero authority principle)

---

## 6) Safety Caps + Log Rotation (Hard bounds)
### 6.1 Requirement
Hard caps for:
- max event bytes
- max log file size
- rotation count
- max sessions (if relevant)
- optional rate limits (governance/AI)

### 6.2 Default caps (draft; adjust with evidence)
- `MAX_EVENT_BYTES = 4096`
- `LOG_ROTATE_BYTES = 5_000_000` (5MB)
- `LOG_ROTATE_FILES = 10`

**EVIDENCE (current log volume / file sizes):**
- [x] Current log paths:
  - `07_HARRIS_WILDLANDS/evidence/event_log.jsonl` — 10,126 bytes (10 KB)
  - `07_HARRIS_WILDLANDS/evidence/bruce_memory.jsonl` — 20,996 bytes (21 KB)
  - `07_HARRIS_WILDLANDS/evidence/bot_audit.jsonl` — not yet created (no bot connections in production yet)
  - `07_HARRIS_WILDLANDS/evidence/patches/` — 9 patch files, each 31-191 bytes
- [x] Current log sizes (observed via `ls -la` on 2026-02-08):
  - bruce_memory.jsonl: 20,996 bytes — timestamps span 2026-02-08T15:29 to 2026-02-08T18:16 (~2.8 hours of autopilot writes)
  - event_log.jsonl: 10,126 bytes — timestamps span 2026-02-08T03:28 to 2026-02-08T04:41 (historical build tests, no current writes)
  - bot_audit.jsonl: does not exist yet (no bot connections have occurred)
  - No rotation exists — all files are append-only with no caps
- [x] Growth rate estimate (derived from bruce_memory.jsonl: 21 KB over ~2.8 hours):
  - Bruce memory: ~7.5 KB/hour ≈ 180 KB/day (estimate, depends on autopilot "say" frequency which is ~35% of 10-20s ticks)
  - At this rate, bruce_memory.jsonl would reach 5 MB in ~27 days without rotation
- [x] Existing rate limits (bot only):
  - `MAX_MESSAGE_BYTES = 2048` (per message, bot_audit.py)
  - `MAX_CMD_LENGTH = 500` (per command, bot_audit.py)
  - `BOT_RATE_LIMIT = 5` commands per `BOT_RATE_WINDOW = 10.0` seconds (bot_security.py)
  - No rate limits on human players

---

## 7) Session Lifecycle Events
### 7.1 Requirement
Emit:
- `session_open` when connection established
- `session_close` on disconnect/timeout
Include:
- `session_id`
- `player_id` (if known)
- `actor_type`
- `duration_s` (on close)

**EVIDENCE (where sessions are created/destroyed):**
- [x] Code locations:
  - `server.py:457-521` — `handle_client()`: WebSocket connection handler
    - Line 460-463: Sends login banner (connection start)
    - Line 464: Awaits first message (name/auth)
    - Line 470-496: Bot authentication branch (auth token check, interlock check)
    - Line 510-521: Player object created, added to `world.players` dict, room assigned
    - Line 550-563: `finally` block — player removed from `world.players`, room, connections; prints disconnect
  - `server.py:78` — `Room.__init__`: `self.created_at = datetime.now()` (this is Room, NOT Player — Player has no creation timestamp)
  - `server.py:111-118` — `Player.__init__`: stores name, room_id, inventory, role, websocket, explored_rooms — no `created_at`, no `session_id`
- [x] Session tracking gaps:
  - No `session_id` generated — player tracked by name only (names are unique while connected)
  - No `created_at` on Player — no way to calculate session duration on disconnect
  - No structured session events emitted — only `print()` statements
  - Bruce autopilot creates a Player but never goes through handle_client (no session lifecycle)
- [x] Sample connection logs (from server console):
  - `Player connected: Wanderer (role=human)`
  - `Bot authenticated: AIPlayer`
  - `Player disconnected: Wanderer`
  - `Client error: <exception>` (on unexpected disconnects)

---

## 8) `/status` One-Breath Self-Description
### 8.1 Requirement
A safe read-only command returns:
- freeze state
- governance flags
- uptime
- counts (sessions, maybe events emitted today)

**EVIDENCE (current command routing / help text):**
- [x] Where commands are parsed:
  - `server.py:196` — `MUDWorld.handle_command()`: main command dispatcher
  - Routes: look, go/movement, say, /plan, /build, /consent, create, spawn, inventory, who, help, status, dev (subcommands)
  - Authorization check at line 196-214: calls `authorize()` from bot_security.py before execution
- [x] Existing status command:
  - `server.py:416-427` — `cmd_status()` returns: room count, NPC count, players online, player location, explored rooms, build mode state
  - Does NOT include: freeze state (IDLE_MODE), uptime, governance flags, bot enabled status, event counts
- [x] Help text includes:
  - Movement commands, world commands (look, say, who, inventory, status, help), build system (/plan, /build, /consent), dev tools (dev status, dev buildstub, dev log tail)

---

## 9) Compatibility + Minimal Diff Rules
- Prefer single new module(s) over touching many files
- No refactors unless required for correctness
- No behavior changes except:
  - emitting new events
  - adding caps/rotation
  - standardizing timestamps
- All new features default OFF unless explicitly enabled (except canonical clock and event typing if they are internal)

---

## 10) Implementation Targets (Filled by Evidence)

### 10.1 Candidate modules/files
- **main server loop:** `server.py:869` — `async def main()` + `websockets.serve()`
- **command handler:** `server.py:196` — `MUDWorld.handle_command()`
- **governance gate:** `07_HARRIS_WILDLANDS/orchestrator/bot_security.py` — `authorize()`, `check_bot_interlock()`
- **persistence/logging:** `07_HARRIS_WILDLANDS/orchestrator/bot_audit.py`, `bruce_memory.py`, `build_loop.py` (three separate JSONL writers)
- **session lifecycle:** `server.py:457` — `MUDServer.handle_client()` (connect/disconnect)
- **autopilot loop:** `server.py:565` — `bruce_autopilot()` (only periodic task)

### 10.2 Integration points
- **Where to emit events:** New unified event emitter module, called from handle_command, handle_client, bruce_autopilot, authorize
- **Where to stamp time:** Replace all `datetime.now()` and `datetime.now(timezone.utc)` calls with canonical clock function
- **Where to enforce caps:** New wrapper around JSONL file writes (bot_audit.py, bruce_memory.py, build_loop.py, and the new event emitter)

---

## 11) Acceptance Gates (What "done" means)
### 11.1 Tests / verifications (minimum)
- [ ] All events share the canonical clock format
- [ ] Governance denials always emit a denial event (no silent blocking)
- [ ] Heartbeat emits at expected cadence without mutations
- [ ] Log rotation works (cap enforced)
- [ ] Event payload never exceeds MAX_EVENT_BYTES
- [ ] `/status` returns accurate freeze + flags

### 11.2 "No behavior drift" checks
- [ ] Players can still connect and play as before
- [ ] NPC respawn behavior unchanged (except better logging)
- [ ] No new AI autonomy pathways introduced

---

## 12) Evidence Pack (Paste-in Section)

### 12.1 Environment flags (from `env | grep` on running instance, 2026-02-08)
- **IDLE_MODE:** not set in env (code default: `"0"` in `bot_security.py:56`)
- **MUD_BRUCE_AUTOPILOT:** not set in env (code default: `"true"` in `server.py:888`)
- **MUD_BOT_ENABLED:** `false` (explicitly set)
- **BOT_AUTH_TOKEN:** set (secret, not displayed)
- **MUD_BOT_ALLOW_WHEN_ACTIVE:** `0` (explicitly set)
- **HOST:** not set in env (code default: `"0.0.0.0"` in `server.py:870`)
- **PORT:** not set in env (code default: `"5000"` in `server.py:871`)

### 12.2 Logs (raw snippets)

**event_log.jsonl (last 4 entries):**
```json
{"ts": "2026-02-08T04:40:37.080340+00:00", "id": "evt_0c76324dc2c0", "actor": "Bruce", "mode": "BUILD", "verb": "dev buildstub", "args": {"raw": ""}, "result": "ok", "durable": false, "patch": {"path": "...", "sha256": "...", "files": ["test_file.txt"]}, "tests": {"ran": true, "cmd": "python -m pytest ...", "ok": true, "output_tail": "13 passed in 0.30s"}, "ohp": null, "error": null}
{"ts": "2026-02-08T04:41:06.853548+00:00", "id": "evt_81912dd8273e", "actor": "Bruce", "mode": "BUILD", "verb": "dev buildstub", "args": {"raw": "surf_shack"}, "result": "ok", ...}
{"ts": "2026-02-08T04:41:17.953683+00:00", "id": "evt_703b0b165370", "actor": "Bruce", "mode": "BUILD", "verb": "dev buildstub", "args": {"raw": ""}, "result": "ok", ...}
```

**bruce_memory.jsonl (last 6 entries):**
```json
{"ts": "2026-02-08T18:11:15.063685+00:00", "source": "bruce_observation", "content": "Listen to the wind. It is old.", "player": "Bruce", "room": "forest_north"}
{"ts": "2026-02-08T18:11:15.063857+00:00", "source": "player_chat", "content": "Listen to the wind. It is old.", "player": "Bruce", "room": "forest_north"}
{"ts": "2026-02-08T18:13:19.131729+00:00", "source": "bruce_observation", "content": "Listen to the wind. It is old.", "player": "Bruce", "room": "forest_east"}
{"ts": "2026-02-08T18:13:19.131938+00:00", "source": "player_chat", "content": "Listen to the wind. It is old.", "player": "Bruce", "room": "forest_east"}
{"ts": "2026-02-08T18:15:55.230589+00:00", "source": "bruce_observation", "content": "We build in truth, not haste.", "player": "Bruce", "room": "forest_east"}
{"ts": "2026-02-08T18:16:12.235543+00:00", "source": "bruce_observation", "content": "The forest remembers.", "player": "Bruce", "room": "forest_east"}
```

**server.py console output (typical boot + runtime):**
```
============================================
  HARRIS WILDLANDS MUD SERVER
  Unified HTTP + WebSocket on port 5000
============================================
World loaded from JSON with 10 rooms
World initialized with 10 rooms
Server running on http://0.0.0.0:5000
WebSocket at ws://0.0.0.0:5000/ws
Bruce autopilot online
Player connected: Wanderer (role=human)
Player disconnected: Wanderer
```

### 12.3 Repo structure snapshot
```
server.py                                          ← entry point, HTTP + WebSocket server
ai_player.py                                       ← external AI player client
requirements.txt                                   ← websockets, pytest
07_HARRIS_WILDLANDS/
  orchestrator/
    bot_security.py                                ← SINGLE SOURCE OF TRUTH: authorize(), deny sets, interlock
    bot_audit.py                                   ← BotAuditLogger + RateLimiter → evidence/bot_audit.jsonl
    bruce_memory.py                                ← BruceMemory → evidence/bruce_memory.jsonl
    build_loop.py                                  ← BuildOrchestrator → evidence/event_log.jsonl
    mode_state.py                                  ← ModeStateManager (PLAN/BUILD, arm/consent)
    codex_adapter.py                               ← Codex patch generator (stub/real)
    patch_apply.py                                 ← PatchApplier for diffs
    tests/
      test_build_loop.py                           ← 15 orchestrator tests
      test_bruce_memory.py                         ← 14 Bruce memory tests
      test_banner.py                               ← 6 banner content tests
      test_ai_player.py                            ← 27 AI player tests (auth, gate, rate, audit)
  evidence/
    event_log.jsonl                                ← build event log (10 KB)
    bruce_memory.jsonl                             ← Bruce NPC memory (21 KB)
    bot_audit.jsonl                                ← bot command audit (not yet created)
    patches/                                       ← applied patch backups
  structure/
    mud-server/world/rooms.json                    ← 10 room definitions
    mud-server/world/npcs.json                     ← NPC definitions
    mud-terminal/index.html                        ← original standalone terminal
docs/
  hosting.md                                       ← Caddy/Nginx reverse proxy configs
  UPDATE_FREEZE_TO_MEASURE_v1.md                   ← THIS FILE
Dockerfile                                         ← Docker escape pod
docker-compose.yml                                 ← single-service compose
RUN_MUD.bat                                        ← Windows launcher (safe mode)
RUN_MUD_UNSAFE_BUILD.bat                           ← Windows launcher (build mode)
```

### 12.4 Known pain points observed
- **Timestamp inconsistency:** server.py uses `datetime.now()` (local, no TZ), orchestrator uses `datetime.now(timezone.utc)` (UTC with offset), mode_state uses `time.time()` (epoch float). Three different time representations across the codebase.
- **No log rotation:** All three JSONL files are append-only with no size caps. bruce_memory.jsonl grows ~432 KB/day with autopilot running. Will hit 5 MB in ~11 days.
- **No heartbeat:** No way to detect server health or liveness. The only periodic task is bruce_autopilot which mutates world state (moves Bruce, says things).
- **Silent governance blocking:** When IDLE_MODE blocks a build or bot interlock refuses connection, the denial is sent to the client but NOT logged to any evidence file. Only bot permission denials are audited.
- **No session_id:** Players are tracked by name only. No unique session identifier. No session duration tracking. `created_at` exists on Player but is never used for duration calculation on disconnect.
- **Dual-write in bruce_autopilot:** Each Bruce "say" action writes both a `bruce_observation` AND a `player_chat` entry — doubling log volume for the same event.
- **Console-only server logging:** Server uses `print()` for all operational logging. Not structured, not persisted, not searchable. Lost on restart.

---

## 13) Change Manifest (Filled by Builder AI)
> After evidence is pasted and freeze is lifted, the builder AI will populate:

- files changed:
- new files added:
- summary of diffs:
- risk notes:
- verification outputs:

---

_End of update file._
