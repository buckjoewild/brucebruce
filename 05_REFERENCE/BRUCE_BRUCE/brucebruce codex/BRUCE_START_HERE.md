# 🚀 BRUCE'S MCP SERVER - ULTRA SIMPLE SETUP

**You have all the files. Let's get this running in 5 minutes!**

---

## ✅ **WHAT YOU HAVE:**

In `C:\Users\wilds\brucebruce codex\`:
- ✅ `bruceops_mcp_server.py` (the MCP server)
- ✅ `requirements.txt` (dependencies)
- ✅ `setup.bat` (Windows installer)
- ✅ `SETUP_INSTRUCTIONS.md` (detailed guide)

---

## ⚡ **5-MINUTE SETUP:**

### **Step 1: Run the Setup Script (2 minutes)**

1. **Open Command Prompt**
   - Press `Win + R`
   - Type `cmd`
   - Press Enter

2. **Navigate to the folder:**
   ```cmd
   cd "C:\Users\wilds\brucebruce codex"
   ```

3. **Run the setup:**
   ```cmd
   setup.bat
   ```

4. **Wait for it to finish**
   - It will install Python dependencies
   - Test the server
   - Tell you the folder path (write this down!)

### **Step 2: Configure Claude Desktop (2 minutes)**

1. **Find Claude Desktop config file:**
   - Press `Win + R`
   - Type: `%APPDATA%\Claude`
   - Press Enter
   - Look for `claude_desktop_config.json`

2. **If file doesn't exist, create it:**
   ```cmd
   notepad "%APPDATA%\Claude\claude_desktop_config.json"
   ```

3. **Paste this (REPLACE THE PATH!):**
   ```json
   {
     "mcpServers": {
       "bruceops": {
         "command": "uv",
         "args": [
           "--directory",
           "C:\\Users\\wilds\\brucebruce codex",
           "run",
           "bruceops_mcp_server.py"
         ]
       }
     }
   }
   ```

   **IMPORTANT:** 
   - Use double backslashes `\\`
   - Use YOUR actual path (should be `C:\\Users\\wilds\\brucebruce codex`)

4. **Save the file** (Ctrl+S)

### **Step 3: Restart Claude Desktop (30 seconds)**

1. **Completely quit Claude Desktop**
   - Right-click taskbar icon
   - Click "Exit" or "Quit"

2. **Reopen Claude Desktop**

3. **Test it!**

### **Step 4: Test Your MCP Connection (30 seconds)**

Open a new chat in Claude Desktop and say:

```
Check my BruceOps API health
```

**If it works, you'll see:**
```
✅ API Status: ok
✅ Database: connected

AI Providers:
  ✅ gemini: available
```

**If it works: YOU'RE DONE!** 🎉

---

## 🐛 **IF IT DOESN'T WORK:**

### **Error: "Module not found"**

Run this:
```cmd
cd "C:\Users\wilds\brucebruce codex"
uv pip install -r requirements.txt
```

### **Error: "UV not found"**

UV might not be installed. Try:
```cmd
cd "C:\Users\wilds\brucebruce codex"
python -m pip install mcp httpx
```

Then update the Claude config to use `python` instead of `uv`:
```json
{
  "mcpServers": {
    "bruceops": {
      "command": "python",
      "args": [
        "C:\\Users\\wilds\\brucebruce codex\\bruceops_mcp_server.py"
      ]
    }
  }
}
```

### **Error: "Can't connect to localhost:5000"**

Your Replit server isn't running! You need to:

**Option 1: Use Replit's Public URL**

1. In Replit, look for the "Webview" URL (something like `https://yourproject.replit.app`)
2. Update the MCP server to use that URL instead of localhost

**Edit `bruceops_mcp_server.py` line 19:**
```python
# Change from:
API_BASE = "http://localhost:5000"

# To:
API_BASE = "https://your-replit-url.replit.app"
```

**Option 2: Keep Replit Running**

Just keep your Replit tab open and the server running!

---

## 🎯 **WHAT YOU CAN DO ONCE IT WORKS:**

Instead of curl commands, just talk to Claude:

```
"Show me my recent logs"
"Search for high energy days"
"What patterns do you see in my stress levels?"
"Generate my weekly synthesis"
"Find correlations in my last 30 days"
"What's my AI quota today?"
```

**Claude will just... answer!** ✨

---

## 📊 **QUICK CHECKLIST:**

- [ ] Run `setup.bat` in brucebruce codex folder
- [ ] Create/edit `claude_desktop_config.json`
- [ ] Put the correct path (with `\\`)
- [ ] Save the file
- [ ] Restart Claude Desktop completely
- [ ] Test: "Check my BruceOps API health"
- [ ] See success message!

---

## 🚀 **THE MOMENT OF TRUTH:**

After Claude Desktop restarts, open a new chat and say:

```
Check my BruceOps API health
```

**If you see the health status:** ✅ **YOU'RE DONE!**

**If you see an error:** Check the troubleshooting above!

---

## 💡 **MOST COMMON ISSUE:**

**"Can't find server" or "Connection refused"**

This means Replit isn't running. 

**Fix:** Keep your Replit project open and running, OR use Replit's public URL (see troubleshooting above).

---

## 🎁 **AFTER IT'S WORKING:**

You can:

1. **Ask natural questions** - "Show me yesterday's logs"
2. **Get AI insights** - "What correlations do you see?"
3. **Generate reports** - "Create my weekly synthesis"
4. **Check usage** - "What's my AI quota?"
5. **Discover patterns** - "Find patterns in my energy levels"

**All through natural conversation!**

---

## ⚡ **TL;DR VERSION:**

```cmd
cd "C:\Users\wilds\brucebruce codex"
setup.bat
```

Then edit:
```
%APPDATA%\Claude\claude_desktop_config.json
```

Add your MCP config, restart Claude Desktop, test:
```
Check my BruceOps API health
```

**Done!** 🎉

---

**GO DO IT NOW! You're 5 minutes away!** 🚀
