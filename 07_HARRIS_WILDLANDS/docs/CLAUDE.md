# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Harris Wildlands is an offline AI-powered MUD (Multi-User Dungeon) inspired by Avendar. It features AI-driven NPCs using local LLMs via Ollama, dynamic quest generation, and lore-infused content from the Avendar wiki.

## Running the Game

### Standalone Mode (Single Player)
```bash
python server.py
python "Harris Wildlands Server.py"
python harris_wildlands_core-main/game/harriswildlands_ai.py
```

### Server Mode (Telnet MUD)
```bash
python server.py --server          # Listens on port 4000
python "Harris Wildlands Server.py" --server  # Listens on port 9999
```
Connect with: `telnet localhost 4000` or `telnet localhost 9999`

### Offline Wiki Generator
```bash
python harris_wildlands_core-main/game/avendar_offline.py --logs "logs/*.txt" --output offline_site
```
Generates JSON database and static HTML from Avendar.net wiki + MUD logs.

## Prerequisites

- **Ollama** must be running with a loaded model (e.g., `phi3:mini`, `llama2`)
- Python packages: `requests`, `beautifulsoup4` (for wiki scraper)

## Architecture

### Core Classes

**AIController** (`server.py:43-59`)
- Wraps Ollama subprocess calls for LLM queries
- Default model: `llama2`, configurable temperature

**AINPC** (`server.py:62-101`)
- AI-driven NPCs with personality prompts, HP, attacks, inventory
- `respond(message)` - generates AI dialogue via Ollama
- Supports vendor functionality (buy/sell)

**LLMQuestMaster** (`server.py:104-134`)
- Manages quest-giving NPCs
- Loads lore from `avendar_wiki_lore.json`
- `assign_quest(npc_name, topic)` - generates lore-infused quests via AI

**Player** (`server.py:181-293`)
- Full RPG stats: HP, mana, MV, skills, spells, equipment, gold
- Race/class system with `CLASS_REGISTRY` definitions
- Quest tracking, PvP consent, group/follow mechanics
- Leveling with class-based titles

**Room** (`server.py:159-178`)
- Contains exits (linked Room objects), NPCs, items, corpses
- Terrain types, water flags, door states, ambiance lines
- Level ranges for content scaling

**Item** (`server.py:137-156`)
- Equipment slots, affects, containers, consumables (food/potion/liquid)
- Damage tuples for weapons, AC for armor, price for economy

### World Setup

`setup_world(questmaster)` builds the room graph starting from Center Square (Var Bandor), linking ~30+ rooms across:
- Var Bandor city (streets, Tower of Water, docks)
- Brintor Mountains (trails, peaks, hidden cave)
- Kor Thrandir (training grounds, archery range)
- Various temples and taverns

### Persistence

**Harris Wildlands Core Persistence.py**:
- `save_world(rooms)` - serializes rooms/NPCs/items to JSON
- `load_world(rooms, players)` - restores world state
- `respawn_npcs(rooms)` - handles NPC respawn timers

### Game Loop

- Runs at 3 ticks/second for regen, ambiance, random events
- `process_command()` handles player input (move, kill, cast, quest, trade, etc.)
- Combat runs in separate thread via `combat_tick()`

## Key Data Files

- `avendar_wiki_lore.json` - Room/NPC/item descriptions and class lore
- `world_save.json` - Persisted world state (generated at runtime)

## Multiple Server Versions

The project has several Python files representing different development iterations:
- `server.py` / `patched_server.py` - Full-featured versions with extensive room setups
- `Harris Wildlands Server.py` - Cleaner modular version importing from `world.py` and `player.py`
- `harriswildlands_ai.py` - Simplified AI-focused version
- `generated_avendar*.py` - Auto-generated content files

## Bruce AI Character

Bruce is a special AI NPC ("chaotic but loving surfer-sage") that:
- Has enhanced stats and skills (bash, trip, rescue)
- Can follow players and make autonomous decisions via `BruceAPI`
- Integrates with the group/follow system
