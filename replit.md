# Harris Wildlands MUD

## Overview
A Python-based Multi-User Dungeon (MUD) text adventure game with a closed-loop AI build system. Features a retro CRT terminal interface served over the web, WebSocket-based multiplayer gameplay, an orchestrator that follows PLAN/BUILD/CONSENT governance for AI-assisted development within the game environment itself, and an external AI player system with token-based auth, permission gates, rate limiting, and provenance logging.

## Project Architecture
- **Entry Point**: `server.py` — unified HTTP + WebSocket server on port 5000
- **Frontend**: Retro CRT terminal HTML served at `/` (green-on-black with scanline effects)
- **WebSocket**: MUD game server at `/ws` path
- **World Data**: JSON files in `07_HARRIS_WILDLANDS/structure/mud-server/world/` (10 rooms, NPCs)
- **Orchestrator**: `07_HARRIS_WILDLANDS/orchestrator/` — PLAN/BUILD/CONSENT build governance
- **AI Player**: `ai_player.py` — external AI client with stub brain, token auth, deny-test mode
- **Language**: Python 3.12 with websockets library

## Key Files
- `server.py` — Main server (HTTP + WebSocket MUD + orchestrator + bot auth/gate/rate-limit + Bruce autopilot with heartbeat)
- `ai_player.py` — External AI player client (stub brain, token auth, --test-deny mode)
- `requirements.txt` — Python dependencies (websockets, pytest)
- `RUN_MUD.bat` — Windows one-click launcher (venv, deps, tests, server) with IDLE_MODE=1 safe default
- `RUN_MUD_UNSAFE_BUILD.bat` — Windows launcher with IDLE_MODE=0 (builds allowed, use when present)
- `Dockerfile` — Docker escape pod (python:3.12-slim, websockets only)
- `docker-compose.yml` — Single-service compose with full env passthrough
- `docs/hosting.md` — Caddy/Nginx reverse proxy configs, DNS notes, production checklist
- `docs/UPDATE_FREEZE_TO_MEASURE_v1.md` — Evidence-driven hardening spec (Freeze→Measure)
- `07_HARRIS_WILDLANDS/orchestrator/mode_state.py` — ModeStateManager (PLAN/BUILD modes, arm/consent flow)
- `07_HARRIS_WILDLANDS/orchestrator/build_loop.py` — BuildOrchestrator (execute builds with gates)
- `07_HARRIS_WILDLANDS/orchestrator/bot_security.py` — Single source of truth: authorize(), deny sets, check_bot_interlock(), constants
- `07_HARRIS_WILDLANDS/orchestrator/bot_audit.py` — BotAuditLogger + RateLimiter (append-only JSONL provenance)
- `07_HARRIS_WILDLANDS/orchestrator/heartbeat.py` — HeartbeatLogger + ActivityLogger (sha256-signed JSONL, periodic snapshots)
- `07_HARRIS_WILDLANDS/orchestrator/codex_adapter.py` — Codex patch generator (stub/real modes)
- `07_HARRIS_WILDLANDS/orchestrator/patch_apply.py` — PatchApplier for applying diffs
- `07_HARRIS_WILDLANDS/orchestrator/bruce_memory.py` — BruceMemory (append-only JSONL, fact readback from event_log.jsonl)
- `07_HARRIS_WILDLANDS/orchestrator/artifacts.py` — Artifact intake: schema, validation, storage, append-only JSONL logging
- `docs/artifact_intake.md` — Artifact intake system documentation
- `07_HARRIS_WILDLANDS/structure/mud-server/world/rooms.json` — Room definitions
- `07_HARRIS_WILDLANDS/structure/mud-server/world/npcs.json` — NPC definitions

## Bruce Observability
Bruce is an always-on NPC steward who wanders the world, observes, speaks, and logs everything he does.

### What Bruce Does
- **Autopilot**: Runs as an async task inside the server process (starts on boot)
- **Actions** (every 10-20 seconds): look (45%), move (35%), say a phrase (15%), spawn attempt (5%)
- **Heartbeat**: Every 15 minutes (configurable), writes a structured world-state snapshot
- **First heartbeat fires on startup** for immediate verification

### What Gets Logged (all append-only JSONL with sha256 signatures)
| File | Contents | Written When |
|------|----------|------|
| `evidence/heartbeat.jsonl` | World-state snapshots: room, exits, NPC/player/item counts, total world stats | Every BRUCE_HEARTBEAT_MINUTES (default 15) + once on startup |
| `evidence/bruce_activity.jsonl` | Per-action log: look/move/say/spawn_attempt with room and detail | Every Bruce action (every 10-20s) |
| `evidence/bruce_memory.jsonl` | Bruce sayings + player chat (source-validated) | On "say" actions and player chat |
| `evidence/event_log.jsonl` | Build events (single source of truth for confirmed builds) | On build executions |
| `evidence/bot_audit.jsonl` | Bot command audit trail (allowed/denied/rate_limited) | On bot commands |

### Verification Commands (in-game)
- `dev heartbeat` — Show last 3 heartbeat entries (timestamp, room, snapshot)
- `dev bruce tail <n>` — Show last N Bruce activity entries
- `dev logsizes` — Show evidence log file sizes
- `dev verify heartbeat|activity|artifacts` — Verify sha256 hash integrity of evidence files

### What Is NOT Logged
- Bruce's `look` command output text (only metadata: exits, NPC count, player count)
- Exact world state diffs between heartbeats (delta is best-effort)
- Player session lifecycle events (no session_id, no created_at on Player)

## MUD Commands
- Movement: `north/south/east/west/up/down` (or `n/s/e/w/u/d`)
- World: `look`, `say <msg>`, `who`, `inventory`, `status`, `help`
- Build System: `/plan <text>`, `/build on|off`, `/consent yes`
- Dev Tools: `dev status`, `dev buildstub`, `dev log tail <n>`
- Bruce Observability: `dev heartbeat`, `dev bruce tail <n>`, `dev logsizes`
- Artifact Intake: `bruce intake <type> <source> [id] <content>`, `bruce inspect <id>`, `bruce link <a> <b> [note]`, `bruce annotate <id> <text>`

## AI Player System
- **Auth**: Bot must send `{"type":"auth","token":"...","name":"..."}` as first message
- **Role**: Server assigns `role="bot"` — never from client payload
- **Permission Gate**: `authorize(player, cmd)` blocks bots from: `/build`, `/consent`, `create`, `spawn`, `bruce`, `dev buildstub`
- **Rate Limit**: 5 commands per 10 seconds (sliding window), 2KB message cap, 500 char command cap
- **Audit**: All bot commands logged to `evidence/bot_audit.jsonl` (allowed + denied + rate_limited)
- **Kill Switch**: Set `MUD_BOT_ENABLED=false` to disable all bot connections
- **Stub Client**: `python ai_player.py --host ws://localhost:5000`
- **Deny Test**: `python ai_player.py --test-deny` — proves bots can't build

## Evidence Files
All evidence lives in `07_HARRIS_WILDLANDS/evidence/`:
- `heartbeat.jsonl` — Bruce heartbeat snapshots (sha256-signed, every 15min)
- `bruce_activity.jsonl` — Bruce per-action log (sha256-signed, every 10-20s)
- `bruce_memory.jsonl` — Bruce sayings + player chat (UTC timestamps)
- `event_log.jsonl` — Build event log (UTC timestamps)
- `bot_audit.jsonl` — Bot command audit trail (UTC timestamps)
- `patches/` — Applied patch files
- `artifacts/intake.jsonl` — Artifact intake event log (sha256-signed)
- `artifacts/archive/` — Accepted artifact storage
- `artifacts/quarantine/` — Quarantined artifact storage

## Heartbeat Cadence Policy (Governance)

- Default cadence (dev): **15 minutes** (code default in `heartbeat.py`)
- Default cadence (production): **60 minutes** (set via env var at deployment)
- Override mechanism: **BRUCE_HEARTBEAT_MINUTES** environment variable only
- Rationale: 15m supports rapid verification during active development; 60m reduces log churn in long-running production
- Any change to cadence must be evidence-backed (log intervals + proof output)

## Evidence Log Retention Policy (Current)

- Policy: **Automatic rotation at 5MB** (rotates to .1 file, logs rotation event)
- Write failures set `logging_degraded` flag (visible fault state, no silent death)
- All JSONL I/O specifies `encoding="utf-8"` for Windows compatibility
- Governance: retention changes must be explicit, documented, and accompanied by a new proof-of-life capture

## Governance Notes

- `scripts/_quarantine/prove_bruce_alive.py` — created during drift event 2026-02-08 (read-only verification window). Quarantined, not trusted until re-reviewed and approved.

## Tests
- `07_HARRIS_WILDLANDS/orchestrator/tests/test_build_loop.py` — 15 orchestrator tests
- `07_HARRIS_WILDLANDS/orchestrator/tests/test_bruce_memory.py` — 14 Bruce memory tests
- `07_HARRIS_WILDLANDS/orchestrator/tests/test_banner.py` — 6 banner content tests
- `07_HARRIS_WILDLANDS/orchestrator/tests/test_ai_player.py` — 27 AI player tests (auth, gate, rate limit, audit)
- `07_HARRIS_WILDLANDS/orchestrator/tests/test_heartbeat.py` — 13 heartbeat tests (sha256 consistency, JSONL write, tail parser, activity logging)
- `07_HARRIS_WILDLANDS/orchestrator/tests/test_artifact_intake.py` — 15 artifact intake tests (accept/quarantine/refuse, hash verification, link/annotate)
- `07_HARRIS_WILDLANDS/orchestrator/tests/test_hardening.py` — 26 hardening tests (auth, timeout, shell injection, hash verify, rotation, UTF-8, patch safety, context)
- **Total: 120 tests, all passing**

## Scripts
- `python server.py` — Start the MUD server
- `python ai_player.py` — Run AI player client (requires BOT_AUTH_TOKEN env)
- `python ai_player.py --test-deny` — Run denial tests against live server
- `python -m pytest 07_HARRIS_WILDLANDS/orchestrator/tests/ -v` — Run all tests (120 total)
- `bash scripts/smoke.sh` — Run smoke tests (pytest + live server handshake + duplicate name + auth checks)

## Deployment
- Target: VM (persistent WebSocket connections)
- Run command: `python server.py`
- Port: 5000

## Environment Variables
- `HOST` — Bind address (default: `0.0.0.0`)
- `PORT` — Listen port (default: `5000`)
- `IDLE_MODE` — Set to `1` to block all build operations (safe unattended mode)
- `MUD_BRUCE_AUTOPILOT` — Set to `false` to disable Bruce NPC (default: `true`)
- `BRUCE_HEARTBEAT_MINUTES` — Heartbeat interval in minutes (default: `15`)
- `BOT_AUTH_TOKEN` — Secret token for AI player authentication (required for bot connections)
- `MUD_BOT_ENABLED` — Set to `false` to disable all bot connections (default: `true`)
- `MUD_BOT_ALLOW_WHEN_ACTIVE` — Set to `1` to allow bots when IDLE_MODE=0 (default: `0`, bots blocked during active builds)

## Windows Launch
- `RUN_MUD.bat` — Safe mode (IDLE_MODE=1): creates venv, installs deps, runs tests, starts server
- `RUN_MUD_UNSAFE_BUILD.bat` — Build mode (IDLE_MODE=0): same flow but allows in-game builds
- Edit `RUN_TESTS=0` in RUN_MUD.bat to skip tests for faster boot

## Recent Changes
- 2026-02-08: audit hardening: explicit auth handshake, hash verification (dev verify), world lock for mutations, safe subprocess (no shell=True), build arm timeout (300s), log rotation (5MB), UTF-8 everywhere, patch context verification, context snippets for Codex, Bruce role=npc, duplicate name rejection, smoke.sh, MASTER_KEYSTONE.md — 120 tests pass
- 2026-02-08: feat: Artifact Intake System — bruce intake/inspect/link/annotate commands, schema validation, sha256-signed JSONL logging, archive/quarantine storage, bot deny gate, 94 tests pass
- 2026-02-08: governance: quarantined drift artifact (prove_bruce_alive.py), documented heartbeat cadence policy (15m dev / 60m prod), documented retention policy (unbounded, revisit at 5MB)
- 2026-02-08: feat: Bruce observability — heartbeat every 15min (configurable via BRUCE_HEARTBEAT_MINUTES), per-action activity log, sha256-signed JSONL entries, dev commands (heartbeat/bruce tail/logsizes), 79 tests pass
- 2026-02-08: docs: Freeze→Measure spec (UPDATE_FREEZE_TO_MEASURE_v1.md) — evidence-driven hardening template with filled evidence pack (timestamp map, log analysis, session gaps, denial coverage, known pain points)
- 2026-02-08: refactor: single source of truth for bot security — extracted authorize/denylist/interlock into bot_security.py, tests import real production code, added IDLE_MODE safety interlock (bots blocked when builds active), 66 tests pass
- 2026-02-08: feat: AI Integration Phase 1 — external AI player with token auth, permission gate (authorize choke point), rate limiting (5/10s), provenance audit log (bot_audit.jsonl), ai_player.py stub client with --test-deny mode, 62 tests pass
- 2026-02-08: feat: Windows .bat launchers (RUN_MUD.bat + RUN_MUD_UNSAFE_BUILD.bat) + requirements.txt
- 2026-02-08: fix: single source of truth — bruce_memory.jsonl stores only player_chat/bruce_observation, build facts read from event_log.jsonl, source validation enforced, 35 tests pass
- 2026-02-08: feat: ASCII login banner — full art displayed on WebSocket connect before name prompt, 32 tests pass
- 2026-02-08: feat: Bruce memory v1 — append-only JSONL in evidence/, player chat logging, Bruce cites only confirmed builds, 26 tests pass
- 2026-02-08: feat: Docker escape pod + hosting docs (Dockerfile, docker-compose.yml, docs/hosting.md with Caddy/Nginx/DNS)
- 2026-02-08: feat: host-agnostic runtime (HOST/PORT env vars) + IDLE_MODE safety flag blocks arm/consent/build when active, 15 tests pass
- 2026-02-08: Created unified server.py with HTTP+WebSocket multiplexing, integrated orchestrator, CRT terminal UI, 10-room world, Bruce autopilot NPC
