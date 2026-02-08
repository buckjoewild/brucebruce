# BruceOps MCP Server Path Fix — Patch v1.0
Date: January 28, 2026
Purpose: Fix backslash escape bug in MCP server path

## PROBLEM
Original config path contained backslash sequence `\b` which JSON parsed as backspace character (0x08):

```
C:\Users\wilds\harriswildlands.com\brucebruce codex\bruceops_mcp_server.py
                                   ↑ \b = BACKSPACE
```

Server failed to start because Python couldn't find the file.

## SOLUTION
Move script to path with NO SPACES and NO ESCAPE SEQUENCES.

Old path:
  C:\Users\wilds\harriswildlands.com\brucebruce codex\bruceops_mcp_server.py

New path:
  C:\Users\wilds\harriswildlands.com\bruceops\bruceops_mcp_server.py

## CHANGES

### 1. Created Directory
```bash
mkdir C:\Users\wilds\harriswildlands.com\bruceops
```

### 2. Moved Script
Old: C:\Users\wilds\harriswildlands.com\brucebruce codex\bruceops_mcp_server.py (629 lines)
New: C:\Users\wilds\harriswildlands.com\bruceops\bruceops_mcp_server.py (629 lines)

File is IDENTICAL — copy only, no modifications.

### 3. Update Claude Desktop Config

Find in your Claude Desktop config file (usually ~/.claude/config.json or similar):

**OLD (BROKEN):**
```json
{
  "name": "bruceops",
  "command": "python",
  "args": ["C:\\Users\\wilds\\harriswildlands.com\\brucebruce codex\\bruceops_mcp_server.py"]
}
```

**NEW (FIXED) — Option A (Forward Slashes):**
```json
{
  "name": "bruceops",
  "command": "python",
  "args": ["C:/Users/wilds/harriswildlands.com/bruceops/bruceops_mcp_server.py"]
}
```

**NEW (FIXED) — Option B (Double-Escaped Backslashes):**
```json
{
  "name": "bruceops",
  "command": "python",
  "args": ["C:\\Users\\wilds\\harriswildlands.com\\bruceops\\bruceops_mcp_server.py"]
}
```

Choose ONE. Option A (forward slashes) is preferred.

## VERIFICATION

After patching, restart Claude Desktop and check:

```powershell
# Test 1: Verify file exists at new path
Test-Path "C:\Users\wilds\harriswildlands.com\bruceops\bruceops_mcp_server.py"
# Should return: True

# Test 2: Try to run Python on it (should show usage, not file-not-found)
python "C:/Users/wilds/harriswildlands.com/bruceops/bruceops_mcp_server.py" --help
# Should show MCP server help, not FileNotFoundError

# Test 3: Check git status
cd C:\Users\wilds\harriswildlands.com
git status --short | grep bruceops
# Should show both old and new paths if you keep old file, or just new if deleted
```

## NEXT STEPS

1. Update your Claude Desktop config with the new path (Option A or B above)
2. Restart Claude Desktop
3. Test MCP server connectivity
4. Delete old file when confirmed working:
   `rm "C:\Users\wilds\harriswildlands.com\brucebruce codex\bruceops_mcp_server.py"`
5. Commit to git:
   ```
   git add bruceops/
   git commit -m "fix: move bruceops MCP server to safe path (fix \b escape bug)"
   ```

## ROLLBACK (if needed)

If something breaks:
1. Revert the config change to old path
2. Restore old file from git history
3. Report error and we'll debug further

---
Patch created by Claude Local Operator
