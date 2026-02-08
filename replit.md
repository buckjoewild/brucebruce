# Harris Wildlands MUD

## Overview
A Python-based Multi-User Dungeon (MUD) text adventure game with a closed-loop AI build system. Features a retro CRT terminal interface served over the web, WebSocket-based multiplayer gameplay, and an orchestrator that follows PLAN/BUILD/CONSENT governance for AI-assisted development within the game environment itself.

## Project Architecture
- **Entry Point**: `server.py` — unified HTTP + WebSocket server on port 5000
- **Frontend**: Retro CRT terminal HTML served at `/` (green-on-black with scanline effects)
- **WebSocket**: MUD game server at `/ws` path
- **World Data**: JSON files in `07_HARRIS_WILDLANDS/structure/mud-server/world/` (10 rooms, NPCs)
- **Orchestrator**: `07_HARRIS_WILDLANDS/orchestrator/` — PLAN/BUILD/CONSENT build governance
- **Language**: Python 3.12 with websockets library

## Key Files
- `server.py` — Main server (HTTP + WebSocket MUD + orchestrator integration)
- `Dockerfile` — Docker escape pod (python:3.12-slim, websockets only)
- `docker-compose.yml` — Single-service compose with full env passthrough
- `docs/hosting.md` — Caddy/Nginx reverse proxy configs, DNS notes, production checklist
- `07_HARRIS_WILDLANDS/orchestrator/mode_state.py` — ModeStateManager (PLAN/BUILD modes, arm/consent flow)
- `07_HARRIS_WILDLANDS/orchestrator/build_loop.py` — BuildOrchestrator (execute builds with gates)
- `07_HARRIS_WILDLANDS/orchestrator/codex_adapter.py` — Codex patch generator (stub/real modes)
- `07_HARRIS_WILDLANDS/orchestrator/patch_apply.py` — PatchApplier for applying diffs
- `07_HARRIS_WILDLANDS/structure/mud-server/world/rooms.json` — Room definitions
- `07_HARRIS_WILDLANDS/structure/mud-server/world/npcs.json` — NPC definitions
- `07_HARRIS_WILDLANDS/orchestrator/bruce_memory.py` — BruceMemory (append-only JSONL, fact readback)
- `07_HARRIS_WILDLANDS/orchestrator/tests/test_build_loop.py` — 15 orchestrator tests
- `07_HARRIS_WILDLANDS/orchestrator/tests/test_bruce_memory.py` — 11 Bruce memory tests
- `07_HARRIS_WILDLANDS/orchestrator/tests/test_banner.py` — 6 banner content tests

## MUD Commands
- Movement: `north/south/east/west/up/down` (or `n/s/e/w/u/d`)
- World: `look`, `say <msg>`, `who`, `inventory`, `status`, `help`
- Build System: `/plan <text>`, `/build on|off`, `/consent yes`
- Dev Tools: `dev status`, `dev buildstub`, `dev log tail <n>`

## Scripts
- `python server.py` — Start the MUD server
- `python -m pytest 07_HARRIS_WILDLANDS/orchestrator/tests/ -v` — Run all tests (32 total)

## Deployment
- Target: VM (persistent WebSocket connections)
- Run command: `python server.py`
- Port: 5000

## Environment Variables
- `HOST` — Bind address (default: `0.0.0.0`)
- `PORT` — Listen port (default: `5000`)
- `IDLE_MODE` — Set to `1` to block all build operations (safe unattended mode)
- `MUD_BRUCE_AUTOPILOT` — Set to `false` to disable Bruce NPC (default: `true`)

## Recent Changes
- 2026-02-08: feat: ASCII login banner — full art displayed on WebSocket connect before name prompt, 32 tests pass
- 2026-02-08: feat: Bruce memory v1 — append-only JSONL in evidence/, player chat logging, Bruce cites only confirmed builds, 26 tests pass
- 2026-02-08: feat: Docker escape pod + hosting docs (Dockerfile, docker-compose.yml, docs/hosting.md with Caddy/Nginx/DNS)
- 2026-02-08: feat: host-agnostic runtime (HOST/PORT env vars) + IDLE_MODE safety flag blocks arm/consent/build when active, 15 tests pass
- 2026-02-08: Created unified server.py with HTTP+WebSocket multiplexing, integrated orchestrator, CRT terminal UI, 10-room world, Bruce autopilot NPC
