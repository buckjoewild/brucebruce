# BruceOps MCP - Visual Setup Guide

## The Big Picture

```
Before (Browser Artifact):
You → Browser → Artifact → localhost:5000 API
     [CORS issues] [Manual clicks] [No memory]

After (MCP Server):
You → Claude Desktop → MCP Server → localhost:5000 API
     [Natural conversation] [Direct access] [Full context]
```

## Step-by-Step Visual Guide

### Step 1: Extract & Locate Files

```
📁 bruceops-mcp/
   ├── 📄 bruceops_mcp_server.py    ← The MCP server
   ├── 📄 requirements.txt          ← Dependencies
   ├── 📄 setup.bat                 ← Windows installer
   ├── 📄 setup.sh                  ← Mac/Linux installer
   ├── 📄 README.md                 ← Full docs
   ├── 📄 SETUP_INSTRUCTIONS.md     ← Detailed guide
   └── 📄 QUICK_REFERENCE.md        ← This file
```

**IMPORTANT:** Note the full path to this folder! You'll need it.

Example paths:
- Windows: `C:\Users\Bruce\Documents\bruceops-mcp`
- Mac: `/Users/bruce/Documents/bruceops-mcp`

### Step 2: Run Setup Script

**Windows (Command Prompt):**
```batch
cd C:\Users\Bruce\Documents\bruceops-mcp
setup.bat
```

**Mac/Linux (Terminal):**
```bash
cd /Users/bruce/Documents/bruceops-mcp
chmod +x setup.sh
./setup.sh
```

**What it does:**
```
[1/4] Creating virtual environment...  ✓
[2/4] Activating virtual environment... ✓
[3/4] Installing dependencies...        ✓
[4/4] Testing server...                 ✓
```

### Step 3: Configure Claude Desktop

**Find config file:**

Windows:
```
%APPDATA%\Claude\claude_desktop_config.json

Full path usually:
C:\Users\YourName\AppData\Roaming\Claude\claude_desktop_config.json
```

Mac:
```
~/Library/Application Support/Claude/claude_desktop_config.json

Full path usually:
/Users/yourname/Library/Application Support/Claude/claude_desktop_config.json
```

**Edit the file:**

If it doesn't exist, create it with this content:
```json
{
  "mcpServers": {
    "bruceops": {
      "command": "uv",
      "args": [
        "--directory",
        "PUT_YOUR_FULL_PATH_HERE",
        "run",
        "bruceops_mcp_server.py"
      ]
    }
  }
}
```

**Replace `PUT_YOUR_FULL_PATH_HERE` with your actual path!**

Windows example:
```json
{
  "mcpServers": {
    "bruceops": {
      "command": "uv",
      "args": [
        "--directory",
        "C:\\Users\\Bruce\\Documents\\bruceops-mcp",
        "run",
        "bruceops_mcp_server.py"
      ]
    }
  }
}
```

Mac example:
```json
{
  "mcpServers": {
    "bruceops": {
      "command": "uv",
      "args": [
        "--directory",
        "/Users/bruce/Documents/bruceops-mcp",
        "run",
        "bruceops_mcp_server.py"
      ]
    }
  }
}
```

**Important notes:**
- Windows: Use double backslashes `\\`
- Mac/Linux: Use forward slashes `/`
- No trailing slash at the end
- Must be the FULL path, not relative

### Step 4: Start BruceOps Server

**In harriswildlands.com directory:**
```bash
export STANDALONE_MODE=true
npm run dev
```

You should see:
```
===========================================
STANDALONE MODE ACTIVE
Auto-login enabled
===========================================
✅ CORS enabled
✅ Rate limiting enabled
serving on port 5000
```

### Step 5: Restart Claude Desktop

**Completely close and reopen Claude Desktop**

Not just closing the window - actually quit the application:
- Windows: Right-click taskbar icon → Exit
- Mac: Cmd+Q

Then reopen it.

### Step 6: Test It!

Start a new conversation in Claude Desktop and say:

```
Check my BruceOps API health
```

**If it works, you'll see:**
```
✅ API Status: ok
✅ Database: connected

AI Providers:
  ✅ gemini: available
  ⚠️ openrouter: not configured
```

**If it doesn't work, see troubleshooting below.**

## How to Use

Just talk naturally! Examples:

### Morning Check-in
```
You: Show me my logs from the last week

Claude: [Uses get_recent_logs tool]
📅 Last 7 days:

**2025-01-03**
  Energy: 8/10 | Stress: 3/10 | Mood: 8/10
  Win: Completed morning workout

**2025-01-02**
  Energy: 6/10 | Stress: 5/10 | Mood: 7/10
  Win: Made progress on project
...
```

### Pattern Discovery
```
You: What patterns do you see in my stress levels?

Claude: [Uses find_correlations tool]
🔗 Correlation Analysis (30 days)

Based on your data, I notice:
- Stress peaks on Mondays (avg 7/10)
- Exercise days show 40% lower stress
- Late screens correlate with +2 stress next day
...
```

### Idea Validation
```
You: List my active ideas

Claude: [Uses list_ideas tool]
💡 5 Ideas:

**Teaching Marketplace** (active)
  Excitement: 9/10 | Feasibility: 6/10
  Platform for sharing lesson plans...

**AI Study Buddy** (exploring)
  Excitement: 7/10 | Feasibility: 8/10
  Personalized learning assistant...
```

### AI Squad Consultation
```
You: Should I focus on health or work goals this week?

Claude: [Uses ask_ai_squad tool]
🤖 AI Squad Response

**Claude** (Systems Thinker):
Consider your current energy levels. Last week showed...

**Grok** (Data Analyst):
Your productivity data suggests...

**ChatGPT** (Human Advocate):
From a wellbeing perspective...
```

## Troubleshooting Guide

### Problem: "Connection refused" or "Can't connect to localhost:5000"

**Diagnosis:** BruceOps server isn't running

**Solution:**
```bash
cd harriswildlands.com
export STANDALONE_MODE=true
npm run dev
```

Verify it's running:
```bash
curl http://localhost:5000/api/health
```

Should return JSON with status.

---

### Problem: "MCP server not found" or tools don't appear

**Diagnosis:** Config file issue

**Checklist:**
1. ✅ Config file exists?
2. ✅ JSON is valid? (no syntax errors)
3. ✅ Path is correct and full?
4. ✅ Windows uses `\\` not `\`?
5. ✅ Claude Desktop fully restarted?

**Solution:**
```bash
# Windows - verify path exists
dir "C:\Users\Bruce\Documents\bruceops-mcp\bruceops_mcp_server.py"

# Mac - verify path exists
ls "/Users/bruce/Documents/bruceops-mcp/bruceops_mcp_server.py"
```

If file exists, edit config again and restart Claude.

---

### Problem: "Module not found: mcp" or import errors

**Diagnosis:** Dependencies not installed

**Solution:**
```bash
cd /path/to/bruceops-mcp

# Activate virtual environment
# Windows:
.venv\Scripts\activate

# Mac/Linux:
source .venv/bin/activate

# Install dependencies
uv pip install -r requirements.txt
```

---

### Problem: Tools work but return errors

**Diagnosis:** API endpoint issues

**Solutions:**
1. Check API is in standalone mode
2. Verify endpoints with curl:
   ```bash
   curl http://localhost:5000/api/health
   curl http://localhost:5000/api/logs
   ```
3. Check server logs for errors

---

### Problem: Config file doesn't exist

**Solution - Create it:**

Windows (Command Prompt):
```batch
mkdir "%APPDATA%\Claude"
echo {} > "%APPDATA%\Claude\claude_desktop_config.json"
```

Mac (Terminal):
```bash
mkdir -p ~/Library/Application\ Support/Claude
echo '{}' > ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Then edit the file and add the MCP config.

## Success Checklist

- [ ] Files extracted to permanent location
- [ ] Setup script ran successfully
- [ ] BruceOps server running on localhost:5000
- [ ] Claude Desktop config file edited with correct path
- [ ] Claude Desktop completely restarted
- [ ] Test command works: "Check my BruceOps API health"
- [ ] Can query data: "Show me my recent logs"

## What's Next?

Once everything works:

1. **Explore commands** - Try the examples above
2. **Build workflows** - "Show me weekly review then find correlations"
3. **Get insights** - Let Claude analyze your patterns
4. **Automate reviews** - Daily check-ins become conversations
5. **Extend features** - Add more tools to the Python file

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│ You                                             │
│ "Show me my recent logs"                        │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ Claude Desktop                                  │
│ - Understands request                           │
│ - Decides to use get_recent_logs tool          │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ MCP Server (bruceops_mcp_server.py)            │
│ - Receives tool call                            │
│ - Makes HTTP request to API                     │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ BruceOps API (localhost:5000)                   │
│ - Queries database                              │
│ - Returns JSON data                             │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ MCP Server                                      │
│ - Formats response                              │
│ - Returns to Claude                             │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ Claude Desktop                                  │
│ - Receives data                                 │
│ - Generates natural language response           │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ You                                             │
│ See formatted logs with AI insights             │
└─────────────────────────────────────────────────┘
```

## Files You Received

| File | Purpose |
|------|---------|
| `bruceops_mcp_server.py` | The MCP server (15 tools!) |
| `requirements.txt` | Python dependencies |
| `setup.bat` | Windows auto-installer |
| `setup.sh` | Mac/Linux auto-installer |
| `README.md` | Full documentation |
| `SETUP_INSTRUCTIONS.md` | Detailed setup guide |
| `QUICK_REFERENCE.md` | Command examples |
| `VISUAL_GUIDE.md` | This file |

## Support

If you're stuck:

1. Check this troubleshooting section
2. Verify all checklist items
3. Check Claude Desktop logs (Help → View Logs)
4. Test MCP server directly: `python bruceops_mcp_server.py`

---

**You're upgrading from browser artifacts to production infrastructure!** 🚀
