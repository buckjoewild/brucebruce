# 🤖 REPLIT AGENT - MCP SERVER CREATION PROMPT

**Copy this ENTIRE prompt and paste it into Replit Agent**

---

```
TASK: Create MCP Server for BruceOps

I need you to create a complete MCP (Model Context Protocol) server that connects Claude Desktop to my BruceOps API.

API DETAILS:
- Production URL: https://harriswildlands.com
- Dev URL: http://localhost:5000
- Authentication: Session-based (cookies)

ENDPOINTS TO IMPLEMENT (All require authentication):

1. GET /api/ai/quota
   Returns: {used, limit, remaining, resetAt, cacheSize}
   Purpose: Check daily AI usage stats

2. POST /api/ai/search
   Body: {query: string, limit?: number}
   Returns: {count, samples, insight, cached}
   Purpose: Search logs with AI analysis

3. POST /api/ai/squad
   Body: {question: string}
   Returns: {claude, grok, chatgpt, cached}
   Purpose: Multi-perspective AI analysis

4. POST /api/ai/weekly-synthesis
   Body: none
   Returns: {stats, driftFlags, narrative, cached}
   Purpose: Generate weekly narrative report

5. POST /api/ai/correlations
   Body: {days?: number}
   Returns: {daysAnalyzed, correlations, cached}
   Purpose: Find patterns in life data

6. POST /api/test/ai/cache/clear
   Body: none
   Returns: {message, before, after}
   Purpose: Clear AI response cache

CREATE THESE FILES:

1. FILE: bruceops_mcp_server.py
   - Use FastMCP library
   - Create tools for all 6 endpoints above
   - Use httpx for HTTP requests
   - Include proper error handling
   - Add helpful descriptions for each tool
   - Use environment variable for API_BASE (default: http://localhost:5000)

2. FILE: requirements.txt
   - mcp>=1.0.0
   - httpx>=0.27.0

3. FILE: README_MCP.md
   - Installation instructions
   - How to configure Claude Desktop
   - Example config for claude_desktop_config.json
   - Testing instructions

IMPORTANT REQUIREMENTS:

1. The MCP server should be a standalone Python script
2. Use FastMCP's @mcp.tool() decorator for each endpoint
3. Include clear docstrings explaining each tool
4. Handle errors gracefully (network errors, auth errors, etc.)
5. Use httpx.AsyncClient for requests
6. Make API_BASE configurable via environment variable

EXAMPLE TOOL STRUCTURE:

@mcp.tool()
async def check_api_health() -> str:
    """Check BruceOps API health and connection status"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{API_BASE}/api/health")
            if response.status_code == 200:
                data = response.json()
                return f"✅ API Status: {data.get('status', 'ok')}"
    except Exception as e:
        return f"❌ Error: {str(e)}"

CLAUDE DESKTOP CONFIG FORMAT:

{
  "mcpServers": {
    "bruceops": {
      "command": "python",
      "args": ["C:\\Users\\wilds\\brucebruce codex\\bruceops_mcp_server.py"]
    }
  }
}

Please create all files now and show me:
1. The complete bruceops_mcp_server.py
2. The requirements.txt
3. The Claude Desktop config snippet
4. Instructions on how to test it

Make the code production-ready with proper error handling and user-friendly responses.
```

---

## HOW TO USE THIS PROMPT

1. **Copy** everything between the ``` marks above
2. **Paste** into Replit Agent
3. **Send**
4. **Wait** for Replit to create the files

Replit will create:
- ✅ `bruceops_mcp_server.py` (complete MCP server)
- ✅ `requirements.txt` (dependencies)
- ✅ `README_MCP.md` (setup instructions)
- ✅ Claude Desktop config snippet

---

## AFTER REPLIT CREATES THE FILES

### Step 1: Get the Files from Replit

Replit will show you the files. You can either:

**Option A: Download from Replit**
- Download the created files
- Move them to `C:\Users\wilds\brucebruce codex\`

**Option B: Copy-Paste**
- Copy each file's content from Replit
- Create the files locally in `C:\Users\wilds\brucebruce codex\`

### Step 2: Install Dependencies

Open Command Prompt:
```cmd
cd "C:\Users\wilds\brucebruce codex"
pip install -r requirements.txt
```

### Step 3: Test the MCP Server

```cmd
python bruceops_mcp_server.py
```

Should show: "BruceOps MCP Server running..."

### Step 4: Configure Claude Desktop

Edit (or create):
```cmd
notepad "%APPDATA%\Claude\claude_desktop_config.json"
```

Paste the config Replit gives you!

### Step 5: Restart Claude Desktop

Completely quit and reopen!

### Step 6: Test It

In Claude Desktop:
```
Check my BruceOps API health
```

---

## EXPECTED OUTPUT FROM REPLIT

Replit will create something like:

```python
# bruceops_mcp_server.py
import os
from mcp.server.fastmcp import FastMCP
import httpx

API_BASE = os.getenv("BRUCEOPS_API_BASE", "http://localhost:5000")

mcp = FastMCP("BruceOps")

@mcp.tool()
async def get_ai_quota() -> str:
    """Check current AI usage and quota status"""
    # ... implementation

@mcp.tool()
async def search_logs(query: str, limit: int = 10) -> str:
    """Search life logs with AI-powered analysis"""
    # ... implementation

# ... etc for all 6 endpoints

if __name__ == "__main__":
    mcp.run()
```

---

## TROUBLESHOOTING

### If Replit says "I can't create files outside Replit"

That's okay! Just:
1. Copy the code Replit shows you
2. Create the files manually on your computer
3. Save them to `C:\Users\wilds\brucebruce codex\`

### If you need to switch from localhost to production

Change the environment variable:
```cmd
set BRUCEOPS_API_BASE=https://harriswildlands.com
python bruceops_mcp_server.py
```

Or edit the file:
```python
API_BASE = "https://harriswildlands.com"
```

---

## PASTE THIS INTO REPLIT AGENT NOW!

The prompt at the top has everything Replit needs to create your complete MCP server!

**Time: 2-3 minutes for Replit to generate**  
**Then: 5 minutes to install and test**  
**Total: ~8 minutes to natural language access!** 🚀
