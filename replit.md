# Harris Wildlands MUD

## Overview
Harris Wildlands MUD is a Python-based Multi-User Dungeon (MUD) text adventure game designed with a closed-loop AI build system. Its core purpose is to provide an interactive, multiplayer text-based gaming experience while enabling AI-assisted development directly within the game environment. The project aims to explore novel methods of game world evolution through a governed AI orchestration process.

Key capabilities include:
- A retro CRT terminal-style web interface for immersive gameplay.
- Real-time multiplayer interaction via WebSockets.
- An internal orchestrator that employs a PLAN/BUILD/CONSENT governance model for AI-driven world modifications.
- An external AI player system featuring token-based authentication, permission gates, rate limiting, and comprehensive provenance logging for secure and auditable AI interaction.

The vision is to create a dynamic game world that can grow and adapt with AI assistance, offering a unique blend of traditional MUD gameplay with cutting-edge AI development practices.

## User Preferences
I prefer clear and concise communication.
I like an iterative development approach.
Ask before making major architectural changes or introducing new external dependencies.
Ensure all AI-driven changes are auditable and follow a strict governance model.
I expect detailed logging and verification mechanisms for all AI actions.

## System Architecture

The Harris Wildlands MUD features a unified `server.py` acting as the central entry point, handling both HTTP and WebSocket connections. The architecture emphasizes a clear separation of concerns, robust security for AI interactions, and comprehensive logging for all system activities.

### UI/UX Decisions
- **Frontend**: A retro CRT terminal look and feel is achieved through an HTML interface served at the root path, featuring green-on-black text with scanline effects to evoke nostalgia and provide an immersive text-based experience.

### Technical Implementations
- **Core Server**: `server.py` multiplexes HTTP and WebSocket services, integrating the MUD game server, orchestrator, and bot security mechanisms.
- **Game World**: The MUD world data, including rooms and NPCs, is defined using JSON files located in `07_HARRIS_WILDLANDS/structure/mud-server/world/`.
- **Multiplayer**: WebSocket technology (`/ws` path) facilitates real-time, persistent connections for multiplayer gameplay.
- **Orchestrator**: The `07_HARRIS_WILDLANDS/orchestrator/` module implements a PLAN/BUILD/CONSENT governance model for AI-assisted development. This includes state management for build modes, gated execution of builds, and a patch application system.
- **AI Player System**: An external `ai_player.py` client interacts with the MUD. This system incorporates token-based authentication, a robust permission gate (`authorize` function in `bot_security.py`), strict rate limiting (5 commands/10 seconds, 2KB message cap), and an audit trail (`bot_audit.jsonl`).
- **Observability (Bruce)**: An always-on NPC steward named Bruce autonomously wanders the world, observes, interacts, and logs activities. Bruce's actions (look, move, say, spawn attempts) and world state snapshots are meticulously logged to `evidence/` files (e.g., `heartbeat.jsonl`, `bruce_activity.jsonl`), all with sha256 checksums for integrity.
- **World Growth System**: A controlled expansion mechanism allows for world modifications (e.g., adding rooms or NPCs) through a budget system (e.g., 2 operations per day). Proposals are generated (`/growth propose`) and require a full consent cycle (`/build on` -> `/consent yes` -> `/growth apply`) to be applied. All growth events are logged to `evidence/growth_events.jsonl`.
- **Artifact Intake System**: A system for ingesting, validating, storing, and logging development artifacts. It supports `bruce intake`, `inspect`, `link`, and `annotate` commands, with accepted artifacts stored in `artifacts/archive/` and suspicious ones in `artifacts/quarantine/`.

### Design Choices
- **Language**: Python 3.12 is the primary development language.
- **Data Persistence**: JSON files are used for world data, and append-only JSONL files with sha256 checksums are used for all audit and evidence logging to ensure data integrity and traceability.
- **Security**: Strong emphasis on security for AI interactions, including authentication, granular permission gates, rate limiting, and comprehensive audit trails. `IDLE_MODE=1` provides a safe, unattended operational mode that blocks all build operations.
- **Modularity**: Components like the orchestrator, bot security, and logging are designed as distinct modules for maintainability and testability.
- **Environment Configuration**: Key operational parameters are controlled via environment variables (e.g., `IDLE_MODE`, `BRUCE_HEARTBEAT_MINUTES`, `BOT_AUTH_TOKEN`) for flexible deployment.

## External Dependencies
- **`websockets` library**: Used for establishing and managing WebSocket connections for real-time multiplayer functionality.
- **`pytest`**: Employed as the testing framework for unit and integration tests.
- **Operating System**: Windows for batch file launchers (`RUN_MUD.bat`, `RUN_MUD_UNSAFE_BUILD.bat`).
- **Containerization**: Docker (`Dockerfile`, `docker-compose.yml`) for creating an isolated and portable runtime environment.