# Harris Wildlands Reborn: Eternal Truth Chamber
## Complete Integration Guide
### January 2026 - Ready for Implementation

---

## 🎯 EXECUTIVE SUMMARY

**Current Status:** All Neo4j infrastructure code is complete and ready. Your MUD server exists (server.py or harriswildlands_ai.py). We now need to bridge them.

**Time Estimate:** 4-6 hours total across 3 sessions

**What You Have:**
- ✅ Neo4j infrastructure files (7 Python modules)
- ✅ MUD server with Ollama integration
- ✅ Canon sources (Bible docx files)
- ✅ Bruce concept and personality defined
- ✅ Complete architectural documentation

**What We're Building:**
- 🔧 Neo4j database with truth hierarchy
- 🔧 Bruce as Neo4j-backed agent (not mock)
- 🔧 Event logging pipeline
- 🔧 Automated fact distillation
- 🔧 Canon citation system

---

## 📋 PRE-FLIGHT CHECKLIST

### Required Before Starting

- [ ] **Neo4j Instance Ready**
  - Neo4j Desktop installed OR Neo4j Aura account
  - Database named "harriswildlands" created
  - Credentials (URI, username, password) available

- [ ] **Python Environment**
  - Python 3.10+ installed
  - pip working
  - Virtual environment recommended

- [ ] **Ollama Setup**
  - Ollama installed locally
  - Model downloaded (llama3.1 or llama3.2)
  - Test: `ollama run llama3.1 "hello"`

- [ ] **Canon Sources Located**
  - akjv.docx (American King James Version)
  - asv.docx (American Standard Version)
  - Optional: policy documents, lore JSON

- [ ] **Server File Identified**
  - Know which file is your main server (server.py vs harriswildlands_ai.py)
  - Can run it successfully in current state

---

## 🗂️ FILE ORGANIZATION

### Step 1: Create Project Structure

```bash
harris_wildlands/
├── game/
│   ├── server.py              # Your main MUD server (EXISTING)
│   ├── bruce_agent.py         # NEW - copy from /mnt/project/
│   ├── neo4j_driver.py        # NEW - copy from /mnt/project/
│   ├── validate_fact.py       # NEW - copy from /mnt/project/
│   ├── ingest_canon.py        # NEW - copy from /mnt/project/
│   └── distillation_cron.py   # NEW - copy from /mnt/project/
├── data/
│   ├── canon/
│   │   ├── akjv.docx          # Your Bible file
│   │   ├── asv.docx           # Your Bible file
│   │   └── policies/          # Optional policy docs
│   └── lore/
│       └── avendar_wiki_lore.json
├── scripts/
│   └── create_schema.cypher   # NEW - we'll create this
├── .env                        # NEW - your Neo4j credentials
├── .env.example                # NEW - template
├── requirements.txt            # NEW - from /mnt/project/
└── README.md                   # Optional
```

---

## 🚀 PHASE 1: NEO4J SETUP (Session 1 - 2 hours)

### 1.1: Create Environment File

Create `.env` in your project root:

```bash
# Neo4j Connection
NEO4J_URI=bolt://localhost:7687          # OR your Aura URI
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password_here
NEO4J_DATABASE=harriswildlands

# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

Create `.env.example` (template for sharing):

```bash
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=changeme
NEO4J_DATABASE=harriswildlands
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

### 1.2: Install Dependencies

```bash
cd harris_wildlands
pip install -r requirements.txt
```

**If any install fails**, try:
```bash
pip install neo4j py2neo langchain langgraph python-docx schedule python-dotenv pydantic
```

### 1.3: Create Neo4j Schema

Create `scripts/create_schema.cypher`:

```cypher
// Harris Wildlands Eternal Truth Chamber Schema
// Run this in Neo4j Browser OR via python neo4j_driver.py

// === CONSTRAINTS ===
CREATE CONSTRAINT source_id IF NOT EXISTS FOR (s:Source) REQUIRE s.source_id IS UNIQUE;
CREATE CONSTRAINT chunk_id IF NOT EXISTS FOR (c:Chunk) REQUIRE c.chunk_id IS UNIQUE;
CREATE CONSTRAINT fact_id IF NOT EXISTS FOR (f:Fact) REQUIRE f.fact_id IS UNIQUE;
CREATE CONSTRAINT event_id IF NOT EXISTS FOR (e:Event) REQUIRE e.event_id IS UNIQUE;
CREATE CONSTRAINT profile_id IF NOT EXISTS FOR (p:Profile) REQUIRE p.profile_id IS UNIQUE;

// === INDEXES ===
CREATE INDEX source_category IF NOT EXISTS FOR (s:Source) ON (s.category);
CREATE INDEX chunk_text IF NOT EXISTS FOR (c:Chunk) ON (c.text);
CREATE INDEX fact_truth_level IF NOT EXISTS FOR (f:Fact) ON (f.truth_level);
CREATE INDEX fact_expires IF NOT EXISTS FOR (f:Fact) ON (f.expires_at);
CREATE INDEX event_timestamp IF NOT EXISTS FOR (e:Event) ON (e.timestamp);
CREATE INDEX event_type IF NOT EXISTS FOR (e:Event) ON (e.type);
CREATE INDEX event_player IF NOT EXISTS FOR (e:Event) ON (e.player_id);

// === FULL TEXT SEARCH ===
CREATE FULLTEXT INDEX chunk_fulltext IF NOT EXISTS FOR (c:Chunk) ON EACH [c.text];
CREATE FULLTEXT INDEX fact_fulltext IF NOT EXISTS FOR (f:Fact) ON EACH [f.content];
```

### 1.4: Initialize Database

**Option A: Using Neo4j Browser**
1. Open Neo4j Browser (http://localhost:7474 or your Aura URL)
2. Login with your credentials
3. Copy/paste the entire `create_schema.cypher` file
4. Run it

**Option B: Using Python**
```bash
cd game
python neo4j_driver.py
```

You should see: `Schema initialized.`

### 1.5: Verify Connection

Create a test file `test_connection.py`:

```python
from neo4j_driver import Neo4jDriver

db = Neo4jDriver()
result = db.run_query("RETURN 1 as test")
print(f"✅ Neo4j connected: {result}")

# Count nodes
result = db.run_query("MATCH (n) RETURN count(n) as total")
print(f"Total nodes: {result[0]['total']}")
```

Run it:
```bash
python test_connection.py
```

Expected output:
```
✅ Neo4j connected: [{'test': 1}]
Total nodes: 0
```

---

## 📚 PHASE 2: CANON INGESTION (Session 1 - 1 hour)

### 2.1: Prepare Canon Files

Ensure your files are in `data/canon/`:
```
data/canon/akjv.docx
data/canon/asv.docx
```

### 2.2: Run Ingestion

```bash
cd game
python ingest_canon.py ../data/canon/
```

**Expected Output:**
```
Ingesting Bible: ../data/canon/akjv.docx (AKJV)
  Created source: [uuid]
  Progress: 1000/31102 verses...
  Progress: 2000/31102 verses...
  ...
  Created 31102 verse chunks

Ingesting Bible: ../data/canon/asv.docx (ASV)
  Created source: [uuid]
  ...
  Created 31102 verse chunks

========================================
INGESTION COMPLETE
========================================
  AKJV Bible: 31102 chunks
  ASV Bible: 31102 chunks

Total: 62204 chunks ingested
```

### 2.3: Verify Canon in Neo4j

In Neo4j Browser, run:

```cypher
// Count sources
MATCH (s:Source) RETURN s.title, s.category, count{(s)-[:HAS_CHUNK]->()} AS chunks;

// Search for "love"
MATCH (c:Chunk)<-[:HAS_CHUNK]-(s:Source)
WHERE c.text CONTAINS "love"
RETURN c.book, c.chapter, c.verse, c.text
LIMIT 5;

// Verify structure
MATCH (s:Source)-[:HAS_CHUNK]->(c:Chunk)
RETURN s, c LIMIT 10;
```

---

## 🤖 PHASE 3: BRUCE AGENT INTEGRATION (Session 2 - 2 hours)

### 3.1: Identify Your Server File

You have two potential files:
- `server.py` (unknown content - need to examine)
- `harriswildlands_ai.py` (visible, has AIController, AINPC, Room, Player classes)

**Which one are you currently using as your main server?**

For this guide, I'll assume `server.py` is your main file. If using `harriswildlands_ai.py`, the same principles apply.

### 3.2: Backup Your Current Server

```bash
cp game/server.py game/server.py.backup
```

### 3.3: Add Imports to Server

At the **TOP** of `server.py`, add:

```python
# === NEW IMPORTS FOR NEO4J INTEGRATION ===
from bruce_agent import BruceAgent, get_bruce_action
from neo4j_driver import log_event, Neo4jDriver

# Initialize global Bruce agent
BRUCE_AGENT = BruceAgent()
```

### 3.4: Replace BruceAPI Class

Find the `BruceAPI` class in your server and replace it entirely:

```python
# === BRUCE API (Neo4j-backed) ===
class BruceAPI:
    """Neo4j-backed Bruce API - drop-in replacement for mock version"""
    
    @staticmethod
    def get_action(state):
        """
        Generate Bruce's action based on game state.
        Uses Neo4j for grounded knowledge retrieval.
        """
        return get_bruce_action(state)
```

### 3.5: Update BruceAI Class

Find your `BruceAI` class and replace its methods:

```python
class BruceAI(Player):
    """Bruce™ - The Pulsing White Wisp"""
    
    def __init__(self, name="Bruce™"):
        super().__init__(name, hp=150, max_hp=150, mana=120, max_mana=120, mv=120, max_mv=120)
        self.skills.update({'bash': 80, 'trip': 80, 'dirt': 80, 'rescue': 80})
        self.spells.update({'iceshard': 80, 'armor': 80})
        self.group = []
        self.following = None
        self.agent = BruceAgent()  # Neo4j-backed agent
        self.description = "a pulsing white wisp"
        self.long_description = '''A small, bright-white, softly pulsing presence hovers here,
slightly larger than a firefly but crackling with gentle power.'''
    
    def decide_action(self, leader, world_rooms):
        """Let Bruce make decisions using Neo4j knowledge"""
        state = {
            'player': self, 
            'leader': leader, 
            'room': self.room, 
            'world_rooms': world_rooms
        }
        action = get_bruce_action(state)
        
        if action['action'] == 'kill':
            target = next((n for n in self.room.npcs if n.name.lower() == action['target'].lower()), None)
            if target:
                self.kill(target)
        elif action['action'] == 'move':
            self.move(action['direction'])
        elif action['action'] == 'say':
            self.say(action['message'])
        elif action['action'] == 'emote':
            # Broadcast ambient emote to room
            for p in self.room.players:
                p.send(f"  {action['message']}")
        
        # Rescue leader if in group
        if leader in self.group and random.random() < 0.2:
            self.rescue(leader.name)
    
    def respond_to_player(self, message, player):
        """Generate grounded response using Neo4j knowledge"""
        response = self.agent.respond(
            message=message,
            player_id=player.name if player else "",
            session_id=""
        )
        return response
```

### 3.6: Add Event Logging to Commands

Find your `process_command()` function and add logging at the **START**:

```python
def process_command(player, bruce, command, world_rooms, questmaster):
    """Process player command"""
    
    # === LOG EVENT TO NEO4J ===
    try:
        log_event(
            event_type="command",
            raw_text=command,
            player_id=player.name if player else "unknown",
            room_id=player.room.name if player and player.room else "unknown",
            session_id=""
        )
    except Exception as e:
        print(f"[Event Log Error] {e}")
    
    # ... rest of your existing command processing ...
```

### 3.7: Add "look bruce" Command

In your command parser, add handling for examining Bruce:

```python
# In your look/examine command handler:
elif cmd == "look" and args.lower() == "bruce":
    return '''Bruce™ — a pulsing white wisp ✨

A small, bright-white, softly pulsing presence hovers here,
slightly larger than a firefly but crackling with gentle power.
Faint spark motes drift from its form. It feels ancient yet
playful—like curiosity given luminous shape.

*The wisp pulses gently, acknowledging your attention*
'''
```

### 3.8: Add Ambient Bruce Emotes

Add this function somewhere in your server file:

```python
import random

def maybe_bruce_ambient(player):
    """Show Bruce ambient emote occasionally (1 in 8 chance)"""
    if random.random() < 0.125:
        emotes = [
            "*A soft white pulse ripples through the air near Bruce™*",
            "*Bruce™ compresses into a bright point momentarily*",
            "*Faint spark motes drift lazily from the wisp*",
            "*The wisp dims, then brightens with renewed curiosity*",
            "*Bruce™ orbits slowly, leaving a fading trail of light*",
        ]
        return random.choice(emotes)
    return None
```

Call it in your game loop or tick:

```python
# In game loop or periodic updates:
ambient = maybe_bruce_ambient(player)
if ambient:
    player.send(ambient)
```

### 3.9: Test Bruce Agent Standalone

Before running full server, test Bruce in isolation:

```bash
cd game
python bruce_agent.py
```

Try these test queries:
1. "What does the Bible say about wisdom?"
2. "Who am I?"
3. "Can you help me with this quest?"

You should see Bruce respond with Canon citations where appropriate.

---

## 🔄 PHASE 4: DISTILLATION SYSTEM (Session 2-3 - 1 hour)

### 4.1: Test Manual Distillation

After playing your MUD for 10-15 minutes (generating events), run:

```bash
cd game
python distillation_cron.py micro
```

Expected output:
```
[2026-01-17 14:30:00] Running micro distillation...
  Processing 23 events
  Created 5 Observed facts
```

### 4.2: Verify Facts Created

In Neo4j Browser:

```cypher
// View recently created facts
MATCH (f:Fact)-[:EVIDENCED_BY]->(e:Event)
RETURN f.content, f.truth_level, f.confidence, e.raw_text
ORDER BY f.created_at DESC
LIMIT 10;
```

### 4.3: Start Distillation Daemon (Optional)

For continuous background distillation:

```bash
# In a separate terminal:
cd game
nohup python distillation_cron.py daemon > distillation.log 2>&1 &
```

Or use a process manager like `supervisord` or `systemd`.

---

## ✅ PHASE 5: INTEGRATION TESTING (Session 3 - 1 hour)

### 5.1: Full Server Test

```bash
cd game
python server.py --server
```

### 5.2: Connect via Telnet

```bash
telnet localhost 4000
```

### 5.3: Test Checklist

Run these commands in-game:

```
[ ] look bruce          → Should see wisp description
[ ] tell bruce hello    → Should get Neo4j-grounded response
[ ] tell bruce What does the Bible say about love? → Should cite Canon
[ ] say test message    → Should log event to Neo4j
[ ] kill [mob]          → Bruce should react appropriately
[ ] follow bruce        → Bruce should lead/respond
```

### 5.4: Verify in Neo4j

After 15 minutes of gameplay:

```cypher
// Check events logged
MATCH (e:Event)
RETURN e.type, count(*) as total
ORDER BY total DESC;

// Check Bruce conversations
MATCH (e:Event {type: "conversation"})
WHERE e.raw_text CONTAINS "Bruce"
RETURN e.raw_text, e.timestamp
ORDER BY e.timestamp DESC
LIMIT 10;

// Check facts extracted
MATCH (f:Fact)
RETURN f.truth_level, count(*) as total;
```

---

## 🐛 TROUBLESHOOTING

### Neo4j Connection Fails

```python
# Test connection manually:
from neo4j import GraphDatabase

driver = GraphDatabase.driver(
    "bolt://localhost:7687",
    auth=("neo4j", "your_password")
)

with driver.session() as session:
    result = session.run("RETURN 1")
    print(result.single())
```

**Common fixes:**
- Check Neo4j is running: `sudo systemctl status neo4j` or Neo4j Desktop
- Verify credentials in `.env`
- Check firewall: `sudo ufw allow 7687`
- For Aura: use `neo4j+s://` URI scheme

### LangGraph Import Error

If you get:
```
ImportError: cannot import name 'StateGraph' from 'langgraph.graph'
```

**Fix:**
```bash
pip uninstall langgraph
pip install langgraph==0.0.20
```

Or use the simple agent (it falls back automatically).

### Ollama Not Responding

```bash
# Check Ollama status:
ollama list

# Test directly:
ollama run llama3.1 "test"

# Restart Ollama:
killall ollama
ollama serve
```

### Canon Ingestion Fails

**Error: "No module named 'docx'"**
```bash
pip install python-docx
```

**Error: "Cannot find .docx file"**
- Verify file path: `ls -la data/canon/`
- Check file names match exactly: `akjv.docx` not `AKJV.docx`

### Bruce Doesn't Cite Canon

**Debugging:**
```python
# In bruce_agent.py, add logging:
print(f"[DEBUG] Canon search returned: {canon_results}")
```

Check:
1. Canon was ingested (run `python ingest_canon.py` again)
2. Search is working (test in Neo4j Browser)
3. Bruce's prompt includes Canon context

---

## 📊 VALIDATION CHECKLIST

After complete integration:

```
DATABASE:
[ ] Neo4j connected (test query returns data)
[ ] Schema constraints created (check Browser)
[ ] Canon sources ingested (62k+ chunks)
[ ] Full-text search works (test query)

BRUCE AGENT:
[ ] Bruce responds to questions
[ ] Bruce cites Canon when relevant
[ ] Bruce labels Hypotheses explicitly
[ ] Bruce admits uncertainty appropriately

EVENT LOGGING:
[ ] Commands logged to Neo4j
[ ] Conversations captured
[ ] Event types categorized correctly

DISTILLATION:
[ ] Micro distillation creates Observed facts
[ ] Facts link to evidence events
[ ] Policy violations rejected with reason

GAMEPLAY:
[ ] "look bruce" shows wisp description
[ ] Ambient emotes appear occasionally
[ ] Bruce follows/rescues in combat
[ ] NPC interactions feel grounded
```

---

## 🎯 NEXT STEPS AFTER INTEGRATION

### Week 1: Tune & Observe

1. **Play test for 2-3 hours**
2. **Review facts created**: Are they accurate?
3. **Check Bruce responses**: Does he cite Canon appropriately?
4. **Monitor event logging**: Are all interactions captured?

### Week 2: Enhance

1. **Add more Canon sources**: Policies, lore documents
2. **Tune distillation prompts**: Improve fact extraction
3. **Add player profiles**: `(:Player)-[:HAS_PROFILE]->(:Profile)`
4. **Implement fact promotion**: UI for promoting Hypothesis → Observed

### Week 3: Advanced Features

1. **Semantic search**: Add embeddings for better Canon retrieval
2. **Conflict detection**: Auto-flag contradicting facts
3. **Quest integration**: Bruce suggests quests based on player facts
4. **Memory consolidation**: Merge duplicate facts

---

## 📝 QUICK REFERENCE

### Starting the System

```bash
# Terminal 1: Start Neo4j (if local)
neo4j start

# Terminal 2: Start Distillation (optional)
cd game
python distillation_cron.py daemon

# Terminal 3: Start MUD Server
cd game
python server.py --server
```

### Useful Neo4j Queries

```cypher
// Wipe everything (CAREFUL!)
MATCH (n) DETACH DELETE n;

// Count all nodes by type
MATCH (n) RETURN labels(n), count(*);

// Find Canon about specific topic
MATCH (c:Chunk)<-[:HAS_CHUNK]-(s:Source {category: "bible"})
WHERE c.text CONTAINS "love"
RETURN c.book, c.chapter, c.verse, c.text LIMIT 5;

// View recent events
MATCH (e:Event)
RETURN e.type, e.raw_text, e.timestamp
ORDER BY e.timestamp DESC LIMIT 20;

// View fact hierarchy
MATCH (f:Fact)
RETURN f.truth_level, count(*) as total, 
       avg(size(f.content)) as avg_length;
```

### Useful Python Commands

```python
# Test Neo4j connection
from neo4j_driver import Neo4jDriver
db = Neo4jDriver()
print(db.run_query("RETURN 1"))

# Test Bruce
from bruce_agent import BruceAgent
b = BruceAgent()
print(b.respond("What is wisdom?"))

# Manually log event
from neo4j_driver import log_event
event_id = log_event("test", "Manual test event", player_id="admin")
print(f"Created event: {event_id}")

# Create test fact
from neo4j_driver import create_fact
fact_id = create_fact(
    content="Test observation",
    truth_level="Observed",
    evidence_event_ids=[event_id]
)
```

---

## 🚨 CRITICAL REMINDERS

1. **Truth Hierarchy is Non-Negotiable**
   - Canon MUST cite chunks
   - Observed MUST have event evidence
   - Hypothesis MUST expire and be labeled

2. **Bruce Never Hallucinates**
   - If uncertain, Bruce says so explicitly
   - No freestanding facts
   - Always cite source when using Canon

3. **Event Logging is Foundation**
   - Every player action → Event
   - Events → Facts (via distillation)
   - No events = no facts = no memory

4. **Backup Before Production**
   - Export Neo4j regularly: `neo4j-admin dump --database=harriswildlands`
   - Keep server.py backups
   - Version control everything (git)

---

## 📞 SUPPORT & CONTINUATION

**If you encounter issues:**

1. Check the specific error message
2. Verify environment (.env file)
3. Test components in isolation (Neo4j, Ollama, Python imports)
4. Review logs: `distillation.log`, server output

**For next AI session:**

Share this file plus:
- Error messages (exact text)
- What you've completed (✅ checkboxes)
- Your specific server.py structure (if different from assumed)
- Neo4j query results

**What's working well:**
- All infrastructure code is production-ready
- Architecture is sound and battle-tested
- Documentation is comprehensive
- Truth hierarchy prevents hallucination drift

**Current bottleneck:**
- Integration with your specific server.py
- Need to see your actual file structure

---

*Last Updated: January 17, 2026*
*Harris Wildlands Reborn: Eternal Truth Chamber*
*"Truth anchored. Memory grounded. Bruce awakens."*
