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
- `07_HARRIS_WILDLANDS/orchestrator/mode_state.py` — ModeStateManager (PLAN/BUILD modes, arm/consent flow)
- `07_HARRIS_WILDLANDS/orchestrator/build_loop.py` — BuildOrchestrator (execute builds with gates)
- `07_HARRIS_WILDLANDS/orchestrator/codex_adapter.py` — Codex patch generator (stub/real modes)
- `07_HARRIS_WILDLANDS/orchestrator/patch_apply.py` — PatchApplier for applying diffs
- `07_HARRIS_WILDLANDS/structure/mud-server/world/rooms.json` — Room definitions
- `07_HARRIS_WILDLANDS/structure/mud-server/world/npcs.json` — NPC definitions
- `07_HARRIS_WILDLANDS/orchestrator/tests/test_build_loop.py` — 13 orchestrator tests

## MUD Commands
- Movement: `north/south/east/west/up/down` (or `n/s/e/w/u/d`)
- World: `look`, `say <msg>`, `who`, `inventory`, `status`, `help`
- Build System: `/plan <text>`, `/build on|off`, `/consent yes`
- Dev Tools: `dev status`, `dev buildstub`, `dev log tail <n>`

## Scripts
- `python server.py` — Start the MUD server
- `python -m pytest 07_HARRIS_WILDLANDS/orchestrator/tests/test_build_loop.py -v` — Run orchestrator tests

## Deployment
- Target: VM (persistent WebSocket connections)
- Run command: `python server.py`
- Port: 5000

## Recent Changes
- 2026-02-08: Created unified server.py with HTTP+WebSocket multiplexing, integrated orchestrator, CRT terminal UI, 10-room world, Bruce autopilot NPC
