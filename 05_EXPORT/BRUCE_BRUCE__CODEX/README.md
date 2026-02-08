# BruceOps MCP Server

**Professional MCP integration for BruceOps personal operating system**

## 🎯 What This Is

This is a Model Context Protocol (MCP) server that connects Claude Desktop directly to your BruceOps API running at `localhost:5000`. It transforms your BruceOps data into native Claude tools, enabling natural conversation about your personal data.

## ⚡ Quick Start

### Windows
```bash
# 1. Run setup script
setup.bat

# 2. Note the directory path it shows
# 3. Edit Claude Desktop config (see SETUP_INSTRUCTIONS.md)
# 4. Restart Claude Desktop
```

### Mac/Linux
```bash
# 1. Make setup script executable
chmod +x setup.sh

# 2. Run setup
./setup.sh

# 3. Note the directory path it shows
# 4. Edit Claude Desktop config (see SETUP_INSTRUCTIONS.md)
# 5. Restart Claude Desktop
```

## 🛠️ Available Tools

### Health & Monitoring
- `check_api_health()` - Check BruceOps server status
- `get_ai_quota()` - View AI usage and costs

### LifeOps (Daily Logs)
- `get_recent_logs(days=7)` - View recent daily logs
- `search_logs(query, limit=10)` - AI-powered semantic search

### ThinkOps (Ideas)
- `list_ideas(status=None, limit=20)` - Browse ideas
- `get_idea_reality_check(idea_id)` - Run AI reality check

### Goals & Reviews
- `list_goals(domain=None)` - View active goals
- `get_weekly_review()` - Get weekly summary

### AI Analysis
- `ask_ai_squad(question)` - Multi-AI perspectives
- `find_correlations(days=30)` - Pattern discovery
- `get_weekly_synthesis()` - AI narrative synthesis

### Data Management
- `export_all_data()` - Export metadata

## 💬 Example Conversations

Instead of clicking buttons in a web UI, just talk to Claude naturally:

**You:** "Show me my logs from the last week"  
**Claude:** [Calls `get_recent_logs(7)` and shows formatted results]

**You:** "Find days when I had high energy"  
**Claude:** [Calls `search_logs("high energy")` with AI analysis]

**You:** "What patterns do you see in my stress levels?"  
**Claude:** [Calls `find_correlations(30)` and interprets results]

**You:** "Should I focus on health or work goals this week?"  
**Claude:** [Calls `ask_ai_squad()` with your question]

## 📊 Cost Protection

All the cost protections from your BruceOps API are preserved:
- ✅ Daily quota limits (100 calls/day)
- ✅ Rate limiting (10 req/min)
- ✅ 24-hour response caching
- ✅ Real-time cost tracking

Check your usage: "What's my AI quota today?"

## 🔒 Security

- **Local only:** MCP server connects to `localhost:5000` only
- **No external access:** Your data never leaves your machine
- **Session-based:** Uses your existing BruceOps authentication
- **Same security as your API:** All API protections apply

## 📁 File Structure

```
bruceops-mcp/
├── bruceops_mcp_server.py    # Main MCP server
├── requirements.txt           # Python dependencies
├── setup.bat                  # Windows setup script
├── setup.sh                   # Mac/Linux setup script
├── SETUP_INSTRUCTIONS.md      # Detailed setup guide
└── README.md                  # This file
```

## 🚀 Advantages Over Browser Artifact

| Feature | Browser Artifact | MCP Server |
|---------|------------------|------------|
| **Integration** | Manual clicks | Natural conversation |
| **Memory** | None | Claude remembers context |
| **Authentication** | Complex | Automatic |
| **CORS** | Issues | No issues |
| **Reliability** | Fragile | Bulletproof |
| **Workflow** | Disruptive | Seamless |

## 🔧 Requirements

- **Python:** 3.10 or higher
- **UV:** Package manager (you have this!)
- **BruceOps:** Running at `localhost:5000`
- **Claude Desktop:** Latest version

## 📖 Documentation

- **SETUP_INSTRUCTIONS.md** - Full setup guide with troubleshooting
- **Code comments** - Every tool is documented in the Python file

## 🎓 Learning Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [FastMCP Guide](https://github.com/jlowin/fastmcp)
- [Claude Desktop MCP](https://docs.anthropic.com/claude/docs/mcp)

## 🤝 Support

**Common Issues:**

1. **"Can't connect to localhost:5000"**
   → Start your BruceOps server first!

2. **"MCP server not found"**
   → Check your `claude_desktop_config.json` path

3. **"Module not found"**
   → Run `uv pip install -r requirements.txt`

See SETUP_INSTRUCTIONS.md for detailed troubleshooting.

## 🎯 Next Steps

Once working, try:

1. **Daily check-ins:** "Show me today's progress"
2. **Pattern analysis:** "What correlations do you see?"
3. **Idea exploration:** "Run reality checks on my active ideas"
4. **Weekly reviews:** "Generate this week's synthesis"

## 📝 License

This MCP server is part of your BruceOps personal operating system.

---

**Built with:** FastMCP, Python, and bulletproof engineering principles 🛡️

**For:** Bruce's personal command and control infrastructure
