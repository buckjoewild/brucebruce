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
- `server.py` — Main server (HTTP + WebSocket MUD + orchestrator + bot auth/gate/rate-limit)
- `ai_player.py` — External AI player client (stub brain, token auth, --test-deny mode)
- `requirements.txt` — Python dependencies (websockets, pytest)
- `RUN_MUD.bat` — Windows one-click launcher (venv, deps, tests, server) with IDLE_MODE=1 safe default
- `RUN_MUD_UNSAFE_BUILD.bat` — Windows launcher with IDLE_MODE=0 (builds allowed, use when present)
- `Dockerfile` — Docker escape pod (python:3.12-slim, websockets only)
- `docker-compose.yml` — Single-service compose with full env passthrough
- `docs/hosting.md` — Caddy/Nginx reverse proxy configs, DNS notes, production checklist
- `07_HARRIS_WILDLANDS/orchestrator/mode_state.py` — ModeStateManager (PLAN/BUILD modes, arm/consent flow)
- `07_HARRIS_WILDLANDS/orchestrator/build_loop.py` — BuildOrchestrator (execute builds with gates)
- `07_HARRIS_WILDLANDS/orchestrator/bot_audit.py` — BotAuditLogger + RateLimiter (append-only JSONL provenance)
- `07_HARRIS_WILDLANDS/orchestrator/codex_adapter.py` — Codex patch generator (stub/real modes)
- `07_HARRIS_WILDLANDS/orchestrator/patch_apply.py` — PatchApplier for applying diffs
- `07_HARRIS_WILDLANDS/structure/mud-server/world/rooms.json` — Room definitions
- `07_HARRIS_WILDLANDS/structure/mud-server/world/npcs.json` — NPC definitions
- `07_HARRIS_WILDLANDS/orchestrator/bruce_memory.py` — BruceMemory (append-only JSONL, fact readback from event_log.jsonl)
- `07_HARRIS_WILDLANDS/orchestrator/tests/test_build_loop.py` — 15 orchestrator tests
- `07_HARRIS_WILDLANDS/orchestrator/tests/test_bruce_memory.py` — 14 Bruce memory tests
- `07_HARRIS_WILDLANDS/orchestrator/tests/test_banner.py` — 6 banner content tests
- `07_HARRIS_WILDLANDS/orchestrator/tests/test_ai_player.py` — 27 AI player tests (auth, gate, rate limit, audit)

## MUD Commands
- Movement: `north/south/east/west/up/down` (or `n/s/e/w/u/d`)
- World: `look`, `say <msg>`, `who`, `inventory`, `status`, `help`
- Build System: `/plan <text>`, `/build on|off`, `/consent yes`
- Dev Tools: `dev status`, `dev buildstub`, `dev log tail <n>`

## AI Player System
- **Auth**: Bot must send `{"type":"auth","token":"...","name":"..."}` as first message
- **Role**: Server assigns `role="bot"` — never from client payload
- **Permission Gate**: `authorize(player, cmd)` blocks bots from: `/build`, `/consent`, `create`, `spawn`, `dev buildstub`
- **Rate Limit**: 5 commands per 10 seconds (sliding window), 2KB message cap, 500 char command cap
- **Audit**: All bot commands logged to `evidence/bot_audit.jsonl` (allowed + denied + rate_limited)
- **Kill Switch**: Set `MUD_BOT_ENABLED=false` to disable all bot connections
- **Stub Client**: `python ai_player.py --host ws://localhost:5000`
- **Deny Test**: `python ai_player.py --test-deny` — proves bots can't build

## Scripts
- `python server.py` — Start the MUD server
- `python ai_player.py` — Run AI player client (requires BOT_AUTH_TOKEN env)
- `python ai_player.py --test-deny` — Run denial tests against live server
- `python -m pytest 07_HARRIS_WILDLANDS/orchestrator/tests/ -v` — Run all tests (62 total)

## Deployment
- Target: VM (persistent WebSocket connections)
- Run command: `python server.py`
- Port: 5000

## Environment Variables
- `HOST` — Bind address (default: `0.0.0.0`)
- `PORT` — Listen port (default: `5000`)
- `IDLE_MODE` — Set to `1` to block all build operations (safe unattended mode)
- `MUD_BRUCE_AUTOPILOT` — Set to `false` to disable Bruce NPC (default: `true`)
- `BOT_AUTH_TOKEN` — Secret token for AI player authentication (required for bot connections)
- `MUD_BOT_ENABLED` — Set to `false` to disable all bot connections (default: `true`)

## Windows Launch
- `RUN_MUD.bat` — Safe mode (IDLE_MODE=1): creates venv, installs deps, runs tests, starts server
- `RUN_MUD_UNSAFE_BUILD.bat` — Build mode (IDLE_MODE=0): same flow but allows in-game builds
- Edit `RUN_TESTS=0` in RUN_MUD.bat to skip tests for faster boot

## Recent Changes
- 2026-02-08: feat: AI Integration Phase 1 — external AI player with token auth, permission gate (authorize choke point), rate limiting (5/10s), provenance audit log (bot_audit.jsonl), ai_player.py stub client with --test-deny mode, 62 tests pass
- 2026-02-08: feat: Windows .bat launchers (RUN_MUD.bat + RUN_MUD_UNSAFE_BUILD.bat) + requirements.txt
- 2026-02-08: fix: single source of truth — bruce_memory.jsonl stores only player_chat/bruce_observation, build facts read from event_log.jsonl, source validation enforced, 35 tests pass
- 2026-02-08: feat: ASCII login banner — full art displayed on WebSocket connect before name prompt, 32 tests pass
- 2026-02-08: feat: Bruce memory v1 — append-only JSONL in evidence/, player chat logging, Bruce cites only confirmed builds, 26 tests pass
- 2026-02-08: feat: Docker escape pod + hosting docs (Dockerfile, docker-compose.yml, docs/hosting.md with Caddy/Nginx/DNS)
- 2026-02-08: feat: host-agnostic runtime (HOST/PORT env vars) + IDLE_MODE safety flag blocks arm/consent/build when active, 15 tests pass
- 2026-02-08: Created unified server.py with HTTP+WebSocket multiplexing, integrated orchestrator, CRT terminal UI, 10-room world, Bruce autopilot NPC
