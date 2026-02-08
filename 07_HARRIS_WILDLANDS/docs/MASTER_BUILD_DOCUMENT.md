# Harris Wildlands Reborn: Eternal Truth Chamber
## Master Build Document v1.0
### Compiled: January 2026

---

## EXECUTIVE SUMMARY

**Project:** Text-based MUD with AI-powered NPCs grounded in a truth hierarchy that prevents hallucination drift.

**Core Innovation:** Neo4j graph database enforcing Canon > Observed > Hypothesis truth levels with mandatory evidence relationships.

**Status:** MUD server runs. Canon sources ready. Neo4j integration files generated. Ready for assembly.

---

## WHAT EXISTS (Verified)

| Component | File(s) | Status |
|-----------|---------|--------|
| Telnet MUD Server | `server.py`, `Harris_Wildlands_Server.py` | ✅ Running |
| 50+ Rooms | Var Bandor, towers, mountains, etc. | ✅ Built |
| Player System | Skills, spells, gold, quests, PvP | ✅ Complete |
| NPC Classes | `AINPC`, `NPC`, `LLMQuestMaster` | ✅ Working |
| Ollama Integration | `AIController` class | ✅ Functional |
| Canon Sources | `akjv.docx`, `asv.docx` | ✅ Ready |
| Lore Database | `avendar_wiki_lore.json` | ✅ Loaded |
| Policy Documents | Semantic Memory, Drift Detection | ✅ Complete |
| Bruce Mock | `BruceAPI.get_action()` | ✅ Stub only |

## WHAT'S NEW (Generated This Session)

| File | Purpose |
|------|---------|
| `requirements.txt` | All Python dependencies |
| `.env.example` | Environment template |
| `create_schema.cypher` | Neo4j schema with constraints/indexes |
| `neo4j_driver.py` | Connection wrapper + query helpers |
| `validate_fact.py` | Policy enforcement before writes |
| `ingest_canon.py` | Bible/policy chunking pipeline |
| `bruce_agent.py` | LangGraph agent with tools |
| `distillation_cron.py` | Event → Fact extraction scheduler |

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                     PLAYER (Telnet)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Harris Wildlands Server                     │
│  server.py / Harris_Wildlands_Server.py                     │
│  - Command parser                                            │
│  - Room/NPC/Item management                                  │
│  - Player sessions                                           │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│     Bruce Agent         │     │      Neo4j Driver           │
│  bruce_agent.py         │     │   neo4j_driver.py           │
│  - LangGraph workflow   │◄───►│   - Query helpers           │
│  - Tool: search_canon   │     │   - create_fact()           │
│  - Tool: log_observation│     │   - log_event()             │
│  - Ollama LLM calls     │     │   - get_*_facts()           │
└─────────────────────────┘     └─────────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Neo4j Graph                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                  │
│  │ :Source │───►│ :Chunk  │◄───│ :Fact   │                  │
│  │ (Canon) │    │ (verses)│    │ (truth) │                  │
│  └─────────┘    └─────────┘    └────┬────┘                  │
│                                      │                       │
│                                      ▼                       │
│                               ┌─────────┐                    │
│                               │ :Event  │                    │
│                               │ (logs)  │                    │
│                               └─────────┘                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Distillation Cron                               │
│  distillation_cron.py                                        │
│  - Micro: every 15 min (recent observations)                │
│  - Nightly: preferences + hypotheses                        │
│  - Weekly: pattern detection, conflict flags                │
└─────────────────────────────────────────────────────────────┘
```

---

## TRUTH HIERARCHY (Non-Negotiable)

```
CANON (highest authority)
  │  Source: Bible, policies, approved lore
  │  Relationship: [:CITES]->(:Chunk)
  │  Rule: Exact quotes only, never paraphrase
  │
  ▼
OBSERVED (direct evidence)
  │  Source: Events the system witnessed
  │  Relationship: [:EVIDENCED_BY]->(:Event)
  │  Rule: Must link to logged events
  │
  ▼
HYPOTHESIS (inference, uncertain)
     Source: Pattern detection, guesses
     Relationship: [:EVIDENCED_BY]->(:Event) + expires_at
     Rule: Auto-expires, labeled "Hypothesis" in output
```

---

## BUILD ORDER (Prioritized)

### Phase 1: Neo4j Foundation (Day 1) ⏱️ 2 hours

1. **Connect Neo4j**
   ```bash
   # In Replit or local:
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your Neo4j Aura credentials
   ```

2. **Initialize Schema**
   ```bash
   python neo4j_driver.py
   # Or run create_schema.cypher in Neo4j Browser
   ```

3. **Test Connection**
   ```python
   from neo4j_driver import Neo4jDriver
   db = Neo4jDriver()
   print(db.run_query("RETURN 1"))
   ```

### Phase 2: Canon Ingestion (Day 1-2) ⏱️ 1 hour

1. **Ingest Bible + Policies**
   ```bash
   python ingest_canon.py /path/to/uploads
   ```

2. **Verify in Neo4j Browser**
   ```cypher
   MATCH (s:Source)-[:HAS_CHUNK]->(c:Chunk)
   RETURN s.title, count(c) AS chunks
   ```

### Phase 3: Wire Bruce Agent (Day 2-3) ⏱️ 2 hours

1. **Replace Mock BruceAPI**
   
   In `server.py`, change:
   ```python
   # OLD:
   from world import BruceAPI
   
   # NEW:
   from bruce_agent import get_bruce_action
   
   # In BruceAI.decide_action():
   action = get_bruce_action(state)  # Drop-in replacement
   ```

2. **Test Bruce**
   ```bash
   python bruce_agent.py
   # Interactive test of responses
   ```

### Phase 4: Start Distillation (Day 3-4) ⏱️ 30 min

1. **Run Manual Test**
   ```bash
   python distillation_cron.py micro
   ```

2. **Start Daemon (Background)**
   ```bash
   nohup python distillation_cron.py daemon &
   ```

### Phase 5: Integration Test (Day 4-5) ⏱️ 1 hour

1. **Start MUD Server**
   ```bash
   python server.py --server
   ```

2. **Connect & Test**
   ```bash
   telnet localhost 4000
   # Talk to Bruce, verify he cites Canon
   # Check Neo4j for logged events
   ```

---

## FILE INTEGRATION GUIDE

### Where to Put New Files

```
harris_wildlands/
├── game/
│   ├── server.py              # EXISTING - add import
│   ├── bruce_agent.py         # NEW - copy here
│   ├── neo4j_driver.py        # NEW - copy here
│   ├── validate_fact.py       # NEW - copy here
│   ├── ingest_canon.py        # NEW - copy here
│   └── distillation_cron.py   # NEW - copy here
├── data/
│   ├── avendar_wiki_lore.json # EXISTING
│   ├── akjv.docx              # Canon source
│   └── asv.docx               # Canon source
├── create_schema.cypher       # NEW - run once
├── requirements.txt           # NEW
├── .env                       # NEW - from .env.example
└── .env.example               # NEW
```

### Minimal server.py Changes

```python
# Add at top of server.py:
from bruce_agent import BruceAgent, get_bruce_action
from neo4j_driver import log_event

# Replace BruceAPI class with:
# (Delete the old BruceAPI class entirely)

# In process_command(), add event logging:
def process_command(player, bruce, command, world_rooms, questmaster):
    # Log every command as event
    log_event(
        event_type="command",
        raw_text=command,
        player_id=player.name,
        room_id=player.room.name if player.room else ""
    )
    # ... rest of function
```

---

## DELEGATION ASSIGNMENTS

### Claude Desktop Tasks (Code Generation)

Prompt 1: "Update server.py to import bruce_agent and neo4j_driver, replacing BruceAPI"

Prompt 2: "Add event logging to all player commands in process_command()"

Prompt 3: "Create a 'look bruce' command that shows wisp description"

### Replit Tasks (Build & Test)

1. Create new Replit project
2. Upload all files from `/home/claude/harris_wildlands_neo4j/`
3. Install dependencies: `pip install -r requirements.txt`
4. Add secrets for NEO4J_URI, NEO4J_PASSWORD
5. Run `python neo4j_driver.py` to init schema
6. Run `python ingest_canon.py` to load Canon
7. Run `python server.py --server` to start MUD
8. Test telnet connection

### Your Tasks (Approval & Testing)

1. Copy `.env.example` to `.env`, fill in Neo4j credentials
2. Approve Canon sources (currently: AKJV, ASV, policies)
3. Test Bruce responses for truth compliance
4. Review weekly reflection reports

---

## BRUCE WISP PRESENTATION

Replace all "surfer-sage" descriptions with:

**Short Description:**
```
Bruce™ — a pulsing white wisp ✨
```

**Long Description:**
```
A small, bright-white, softly pulsing presence hovers here, 
slightly larger than a firefly but crackling with gentle power. 
Faint spark motes drift from its form. It feels ancient yet 
playful—like curiosity given luminous shape.
```

**Ambient Emotes (1 per 8 player commands):**
```
*A soft white pulse ripples through the air near Bruce™*
*Bruce™ compresses into a bright point momentarily*
*Faint spark motes drift lazily from the wisp*
*The wisp dims, then brightens with renewed curiosity*
```

---

## VERIFICATION CHECKLIST

```
[ ] Neo4j connection works (test query returns data)
[ ] Schema initialized (constraints exist)
[ ] Canon ingested (chunks visible in graph)
[ ] Bruce responds (quotes Canon when relevant)
[ ] Events logged (conversation nodes created)
[ ] Distillation runs (facts extracted from events)
[ ] Policy enforced (invalid facts rejected with reason)
[ ] Wisp presentation (description updated in code)
```

---

## QUICK REFERENCE

### Neo4j Queries

```cypher
-- Count all nodes
MATCH (n) RETURN labels(n), count(*)

-- View Canon sources
MATCH (s:Source) RETURN s.title, s.category

-- Search chunks
MATCH (c:Chunk) WHERE c.text CONTAINS "wisdom" RETURN c.text LIMIT 5

-- View recent events
MATCH (e:Event) RETURN e ORDER BY e.timestamp DESC LIMIT 10

-- View facts by truth level
MATCH (f:Fact) RETURN f.truth_level, count(f)
```

### Python Quick Tests

```python
# Test Neo4j
from neo4j_driver import get_canon_facts
print(get_canon_facts("love"))

# Test Bruce
from bruce_agent import BruceAgent
b = BruceAgent()
print(b.respond("What is wisdom?"))

# Test validation
from validate_fact import validate_fact_creation
print(validate_fact_creation("test", "Observed", evidence_event_ids=[]))
```

---

## NEXT SESSION HANDOFF

**For any AI continuing this work:**

1. All infrastructure code is in `/home/claude/harris_wildlands_neo4j/`
2. Schema is designed, not yet deployed to Neo4j instance
3. Bruce agent is complete, needs wiring into server.py
4. Canon files (Bibles) are in uploads, ready for ingestion
5. User has Neo4j Desktop + Aura with instance "harriswildlands"
6. User prefers Ollama (local) over cloud LLMs

**First task for next session:**
1. Help user deploy `.env` with Neo4j credentials
2. Run `python neo4j_driver.py` to init schema
3. Run `python ingest_canon.py` to load Bibles
4. Test `python bruce_agent.py` for responses

---

*Document generated by Claude Opus 4.5 — January 2026*
*Harris Wildlands Reborn: Eternal Truth Chamber*
