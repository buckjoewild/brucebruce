# PHASE 3A — MCP ATTACHMENT FAILURE & FIX

**Timestamp**: 2026-01-29  
**Status**: ❌ FAILED → ✅ PATCHED

---

## PROBLEM DETECTED

MCP startup errors on Claude Desktop restart:
- ❌ `could not attach MCP bruceops`
- ❌ `could not attach MCP windows-mcp`

---

## ROOT CAUSE ANALYSIS

Examined logs: `C:\Users\wilds\AppData\Roaming\Claude\logs\mcp-server-bruceops.log`

**Critical pattern in logs** (repeated dozens of times):

```
C:\Users\wilds\AppData\Local\Programs\Python\Python312\python.exe: 
can't open file 'C:\\Users\\wilds\\harriswildlands.com\\brucebruce codex\x08ruceops_mcp_server.py': 
[Errno 22] Invalid argument
```

**Key diagnostic**: `\x08ruceops`

The `\x08` is a **backspace escape character**. The path had:
```
brucebruce codex\bruceops_mcp_server.py
```

In JSON, `\b` is interpreted as backspace (`\x08`), corrupting the filename to:
```
brucebruce codex[BACKSPACE]ruceops_mcp_server.py  (invalid)
```

---

## SOURCE OF ERROR

The setup BAT script generated:

```json
"args": ["C:\\Users\\wilds\\harriswildlands.com\\brucebruce codex\bruceops_mcp_server.py"]
```

The final backslash before "bruceops" was **not escaped**. Should be:

```json
"args": ["C:\\Users\\wilds\\harriswildlands.com\\brucebruce codex\\bruceops_mcp_server.py"]
```

---

## FIX APPLIED

**File**: `C:\Users\wilds\AppData\Roaming\Claude\claude_desktop_config.json`

**Changed**:
```
"brucebruce codex\bruceops_mcp_server.py"
```

**To**:
```
"brucebruce codex\\bruceops_mcp_server.py"
```

**Verification**: Path now correctly escapes to 4 backslashes before "bruceops"

---

## NEXT STEP

**Action Required**: Restart Claude Desktop again to confirm MCP loads successfully.

Steps:
1. Close Claude Desktop completely
2. Wait 5 seconds
3. Reopen Claude Desktop
4. Check that NO MCP attachment errors appear
5. Report back: "Claude opened without errors" or paste any new error text

---

## NOTES

- `windows-mcp` error may be a separate config issue (not part of bruceops setup)
- Focus first on confirming bruceops attaches successfully
- Keep logs available for further diagnostics if needed

**Status**: Ready for restart validation.

