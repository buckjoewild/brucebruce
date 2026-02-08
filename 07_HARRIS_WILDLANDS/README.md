# Harris Wildlands MUD

An AI-powered Multi-User Dungeon inspired by Avendar, featuring:
- Orchestrator build system with human-in-the-loop governance
- 33-room world with NPCs, items, and quests
- AI-driven NPCs via Ollama/local LLMs
- Bruce AI companion character

## Quick Start

```bash
# Interactive mode
python server/Harris_Wildlands_Server.py

# Telnet server mode
python server/Harris_Wildlands_Server.py --server
# Connect: telnet localhost 9999
```

## Directory Structure

```
07_HARRIS_WILDLANDS/
├── server/              # Main MUD server code
│   ├── Harris_Wildlands_Server.py  # Primary entry point
│   ├── harriswildlands_ai.py       # AI-focused version
│   ├── world.py                    # Rooms, NPCs, items
│   ├── player.py                   # Player class
│   └── server.py                   # Full feature reference
│
├── orchestrator/        # Build system (Codex 5.2 integration)
│   ├── build_loop.py    # Spec → Patch → Test → Log
│   ├── codex_adapter.py # AI patch generation
│   ├── mode_state.py    # PLAN/BUILD mode governance
│   ├── patch_apply.py   # Safe diff application
│   └── tests/           # Orchestrator tests
│
├── data/
│   ├── lore/            # Avendar wiki lore JSON
│   ├── canon/           # Bible texts (akjv, asv) for grounding
│   └── world/           # World state saves
│
├── evidence/            # Build audit trail
│   ├── event_log.jsonl  # All build events
│   ├── patches/         # Applied diffs
│   └── transcripts/     # Codex session logs
│
├── tools/               # Utilities
│   └── avendar_offline_builder.py  # Log parser + wiki scraper
│
├── docs/                # Documentation
│
└── reference/           # Original code + design docs
    ├── harris_wildlands_core-main/
    └── DESIGN_DOCS/
```

## In-Game Commands

### Gameplay
- `look` / `l` - View current room
- `north/south/east/west` or `n/s/e/w` - Movement
- `say <message>` - Speak to room
- `kill <target>` - Initiate combat
- `exits` - List available directions

### Build System (Orchestrator)
- `/plan <intent>` - Log build intent (PLAN mode)
- `/build on` - Enter BUILD mode and arm
- `/consent yes` - Confirm build action
- `dev buildstub` - Execute stub build
- `dev status` - Show mode/armed/consent state
- `dev log tail <n>` - View recent build events

## Build Governance

The orchestrator enforces human-in-the-loop control:
1. Player logs intent with `/plan`
2. Player arms with `/build on`
3. Player confirms with `/consent yes`
4. Build executes ONE operation
5. System snaps back to PLAN mode
6. Next build requires re-arming

All builds are logged with `durable: false` until committed.

## Environment Variables

```bash
USE_CODEX=1       # Enable real Codex AI (default: stub mode)
CODEX_CLI=<path>  # Path to Codex binary
CODEX_DRYRUN=1    # Log only, no patch apply
```

## Tests

```bash
# Run orchestrator tests
python -m pytest orchestrator/tests/test_build_loop.py -v
```

---
*Created with the GRAVITY swarm: Architect, Coder, PM, and Bruce*

## Unified Startup (BruceOps + MUD)
- `bruce-scripts\\start-all.bat` starts BruceOps + WS MUD (via `bruce-master.bat`).
- `bruce-scripts\\open-dashboard.bat` opens the web UI and MUD terminal.
- `bruce-scripts\\health-logs.bat` shows status and tails logs.
- Copies of these BAT files are also placed on the Desktop.

## MUD Servers
- Telnet MUD: `server\\Harris_Wildlands_Server.py` (port 9999).
- WebSocket MUD: `structure\\mud-server\\src\\server.py` (port 4008), used by the web UI via `/mud/ws`.