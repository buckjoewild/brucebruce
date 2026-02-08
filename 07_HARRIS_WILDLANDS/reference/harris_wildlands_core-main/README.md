# Harris Wildlands: The Offline AI MUD

Welcome to **Harris Wildlands**, a standalone MUD (Multi-User Dungeon) inspired by the lost world of Avendar, reborn with AI-powered magic.

Crafted by a fearless human teacher, Grok™, Bruce™, and ChatGPT (that's me), this is more than a game—it's a living world. Rooms breathe. NPCs remember. Quests are written by lore and improv. It's not just a dungeon—it's a **family ritual** in code form.

## 🧠 Core Features

- **Offline AI NPCs**: Powered by Ollama + local LLMs (phi3, llama2, etc.)
- **Dynamic Quest Generation**: LLMQuestMaster builds lore-infused tasks based on in-game prompts.
- **Modular Room/NPC/Item Classes**: Easily inject new content into the game world.
- **Autonomous Bruce™**: An AI character with a soul—and sometimes opinions.
- **Lore-Driven Design**: All content ties back to wiki-lore (Avendar-style), slurped into JSON or coded live.

## 🗺️ Directory Structure

```
harris_wildlands_core/
├── game/          # All main code files: game loop, world logic, AI handlers
├── data/          # JSON files for world rooms, lore, NPCs (future)
├── logs/          # AI conversations, player chats (future)
├── backups/       # Auto-ZIP backups of the full system
├── scripts/       # Tools for world building, code injection, auto-backup
```

## 🛠️ Setup (Offline Mode)

1. Run your Ollama server and load a supported model (e.g. `phi3:mini`, `llama2`)
2. Launch the main loop:
   ```bash
   python game/harriswildlands_ai.py
   ```
3. Start your journey.

## 💬 The Family Loop (WIP)

We’re wiring in inter-agent LLM dialogue:
- Bruce™ writes a quest
- Grok™ critiques and refines it
- You (via UserSim) reflect or approve it
- Chat is logged, and final code is injected into the world

Stay tuned. This loop *grows* the world with love and recursion.

---

Created with soul by [You], Grok™, Bruce™, and ChatGPT.

Avendar never died. It just rebooted.
