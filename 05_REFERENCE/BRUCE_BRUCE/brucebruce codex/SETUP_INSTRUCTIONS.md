# BruceOps MCP Server - Setup Instructions

## What This Does

This MCP server gives Claude Desktop **direct native access** to your BruceOps API at `localhost:5000`. Instead of using browser artifacts, you can now:

- Ask Claude to check your recent logs
- Search your life data with natural language
- Get AI squad perspectives
- Find correlations and patterns
- Generate weekly syntheses
- Run reality checks on ideas
- All with native tool calling!

## Prerequisites

1. **Python 3.10+** (check with `python --version` or `python3 --version`)
2. **UV package manager** (you just installed this!)
3. **BruceOps running** at `localhost:5000`

## Installation Steps

### Step 1: Create Virtual Environment (Recommended)

```bash
# Navigate to where you saved these files
cd /path/to/bruceops-mcp

# Create virtual environment with UV
uv venv

# Activate it
# On Windows:
.venv\Scripts\activate
# On Mac/Linux:
source .venv/bin/activate
```

### Step 2: Install Dependencies

```bash
uv pip install -r requirements.txt
```

### Step 3: Configure Claude Desktop

You need to add the MCP server to Claude Desktop's configuration file.

**Find your Claude config file:**

- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Edit the config file** and add this configuration:

```json
{
  "mcpServers": {
    "bruceops": {
      "command": "uv",
      "args": [
        "--directory",
        "C:\\Users\\YourUsername\\path\\to\\bruceops-mcp",
        "run",
        "bruceops_mcp_server.py"
      ]
    }
  }
}
```

**Important:** Replace `C:\\Users\\YourUsername\\path\\to\\bruceops-mcp` with the **actual full path** to where you saved the MCP server files.

**Mac/Linux users:** Use forward slashes and your actual path:
```json
{
  "mcpServers": {
    "bruceops": {
      "command": "uv",
      "args": [
        "--directory",
        "/Users/yourname/path/to/bruceops-mcp",
        "run",
        "bruceops_mcp_server.py"
      ]
    }
  }
}
```

### Step 4: Restart Claude Desktop

Close and reopen Claude Desktop completely for the changes to take effect.

### Step 5: Verify Installation

Start a new conversation in Claude Desktop and try:

```
Check my BruceOps API health
```

If it works, you'll see a health status report with database and AI provider info!

## Available Commands (Examples)

Once set up, you can ask Claude things like:

### Health & Status
- "Check my BruceOps API health"
- "What's my AI quota today?"

### LifeOps
- "Show me my logs from the last 7 days"
- "Search for high energy days"
- "Find patterns in my stress levels"

### ThinkOps
- "List my active ideas"
- "Run a reality check on idea #5"
- "Show me my archived ideas"

### Goals
- "List my health goals"
- "Show me this week's review"

### AI Analysis
- "Find correlations in my last 30 days"
- "Generate a weekly synthesis"
- "Ask the AI squad: Should I focus on health or work this week?"

### Data
- "Export all my data"

## Troubleshooting

### "Connection refused" or "Can't connect to localhost:5000"

**Solution:** Make sure your BruceOps server is running!

```bash
# In your harriswildlands.com directory
cd harriswildlands.com
export STANDALONE_MODE=true
npm run dev
```

### "MCP server not found" in Claude Desktop

**Solution:** 
1. Check that the path in `claude_desktop_config.json` is correct
2. Make sure you're using the full absolute path, not relative
3. On Windows, use double backslashes: `C:\\Users\\...`
4. Restart Claude Desktop after changing config

### "Module not found: mcp"

**Solution:** Make sure you installed dependencies:
```bash
uv pip install -r requirements.txt
```

### Can't find claude_desktop_config.json

**Create it if it doesn't exist:**

Windows:
```bash
mkdir "%APPDATA%\Claude"
echo {} > "%APPDATA%\Claude\claude_desktop_config.json"
```

Mac:
```bash
mkdir -p ~/Library/Application\ Support/Claude
echo '{}' > ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

## Testing the Server Directly

You can test the MCP server without Claude Desktop:

```bash
# Make sure virtual environment is activated
# On Windows: .venv\Scripts\activate
# On Mac/Linux: source .venv/bin/activate

# Run the server
python bruceops_mcp_server.py
```

It should start without errors. Press Ctrl+C to stop.

## What's Different from the Artifact?

**Old way (Browser Artifact):**
- Run in browser
- Limited by CORS
- Needs manual button clicks
- No conversation memory
- Fragile

**New way (MCP Server):**
- Native Claude Desktop integration
- Direct API access
- Natural conversation ("show me my recent logs")
- Claude remembers context
- Professional, bulletproof

## Next Steps

Once this is working, you can:

1. **Use it daily** - Just chat with Claude naturally about your data
2. **Extend it** - Add more tools to the Python file
3. **Automate workflows** - Have Claude check your data on a schedule
4. **Build on it** - This is the foundation for even more powerful integrations

## Support

If you run into issues:

1. Check that localhost:5000 is running (`curl http://localhost:5000/api/health`)
2. Verify the config file path is correct
3. Make sure Claude Desktop is fully restarted
4. Check the Claude Desktop logs (Help → View Logs)

---

**You're building bulletproof infrastructure, Bruce!** 🚀
