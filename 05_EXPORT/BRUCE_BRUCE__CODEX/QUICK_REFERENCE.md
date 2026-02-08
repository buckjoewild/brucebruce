# BruceOps MCP Quick Reference

## 🚀 Setup (5 Minutes)

1. **Extract files** to a permanent location
2. **Run setup:**
   - Windows: `setup.bat`
   - Mac/Linux: `chmod +x setup.sh && ./setup.sh`
3. **Edit Claude Desktop config:**
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
4. **Add this JSON:**
   ```json
   {
     "mcpServers": {
       "bruceops": {
         "command": "uv",
         "args": [
           "--directory",
           "/FULL/PATH/TO/bruceops-mcp",
           "run",
           "bruceops_mcp_server.py"
         ]
       }
     }
   }
   ```
5. **Restart Claude Desktop**

## 💬 Usage Examples

### Daily Check-ins
```
Show me my logs from the last week
What were my energy levels yesterday?
Find days when I felt stressed
```

### Pattern Analysis
```
Find correlations in my last 30 days
What patterns do you see in my sleep quality?
When am I most productive?
```

### Ideas & Planning
```
List my active ideas
Run a reality check on idea #3
What are my health goals?
Show me this week's review
```

### AI Analysis
```
Generate a weekly synthesis
Ask the AI squad: Should I prioritize health or work?
What's my AI quota today?
```

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Connection refused | Start BruceOps: `cd harriswildlands.com && npm run dev` |
| MCP not found | Check path in `claude_desktop_config.json` |
| Module error | Run `uv pip install -r requirements.txt` |

## 📊 What You Get

- ✅ Natural conversation about your data
- ✅ All API cost protections intact
- ✅ Cached responses (cheaper!)
- ✅ Pattern discovery
- ✅ Multi-AI perspectives
- ✅ Weekly syntheses
- ✅ Reality checks
- ✅ No browser needed!

## 🎯 Power Moves

1. **Morning routine:** "Show me yesterday's review and today's priorities"
2. **Weekly planning:** "Generate synthesis and find correlations"
3. **Idea validation:** "Reality check all active ideas"
4. **Performance tracking:** "What patterns emerge in my energy levels?"

---

**From artifact to infrastructure. From clicks to conversation.** 🚀
