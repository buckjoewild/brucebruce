# GRAVITY — STATE SCHEMA

This document defines the structure of machine-readable state files.

State files are JSON snapshots of system and session information.

---

## mcp_status.json

**Location:** C:\GRAVITY\02_STATE\mcp_status.json

**Purpose:** MCP server health and configuration status

**Schema:**

```json
{
  "timestamp": "2026-01-29T18:30:00Z",
  "status": "operational",
  "mcp_server": "Desktop Commander",
  "version": "1.0.0",
  "checks": {
    "config_readable": true,
    "default_shell": "powershell.exe",
    "allowed_directories": 3,
    "blocked_commands": 0
  },
  "errors": null,
  "notes": "MCP operational and configured correctly"
}
```

**Fields:**
- `timestamp`: ISO 8601 datetime of last check
- `status`: "operational" | "degraded" | "offline"
- `mcp_server`: Name of MCP server
- `version`: Server version number
- `checks`: Dictionary of individual status checks
- `errors`: Error messages, or null if no errors
- `notes`: Human-readable status note

**When to update:** Every SESSION_START

---

## api_status.json

**Location:** C:\GRAVITY\02_STATE\api_status.json

**Purpose:** API and database connection status

**Schema:**

```json
{
  "timestamp": "2026-01-29T18:30:00Z",
  "api": {
    "name": "BruceOps",
    "status": "ok",
    "endpoint": "https://api.bruceops.local",
    "latency_ms": 42
  },
  "database": {
    "status": "connected",
    "type": "PostgreSQL",
    "latency_ms": 12
  },
  "ai_providers": {
    "claude": "ready",
    "grok": "ready",
    "chatgpt": "ready"
  },
  "last_successful_call": "2026-01-29T18:29:00Z",
  "errors": null
}
```

**Fields:**
- `timestamp`: ISO 8601 datetime of last check
- `api`: API server status
- `database`: Database connection status
- `ai_providers`: Status of AI model providers
- `last_successful_call`: Timestamp of last successful API call
- `errors`: Error messages, or null if no errors

**When to update:** Every SESSION_START, and after critical operations

---

## last_session.json

**Location:** C:\GRAVITY\02_STATE\last_session.json

**Purpose:** Metadata from the previous session

**Schema:**

```json
{
  "session_date": "2026-01-29",
  "session_start": "2026-01-29T18:30:00Z",
  "session_end": "2026-01-29T19:45:00Z",
  "operator": "Claude Desktop",
  "task": "GRAVITY System Consolidation",
  "status": "COMPLETE",
  "bundle_path": "C:\\GRAVITY\\06_PUBLISH\\bundle_2026-01-29__gravity_consolidation",
  "files_created": 10,
  "files_modified": 2,
  "errors": null,
  "notes": "System consolidation complete. All documentation prepared."
}
```

**Fields:**
- `session_date`: Date of session (YYYY-MM-DD)
- `session_start`: ISO 8601 datetime when session started
- `session_end`: ISO 8601 datetime when session ended
- `operator`: Identifier of the operator (AI or human)
- `task`: Description of work performed
- `status`: "COMPLETE" | "INCOMPLETE" | "FAILED"
- `bundle_path`: Path to published bundle, or null
- `files_created`: Count of new files created
- `files_modified`: Count of existing files modified
- `errors`: Summary of any errors, or null
- `notes`: Free-form notes about the session

**When to update:** At SESSION_END

---

## File Write Rules

**Who writes:** OPERATOR (automated at SESSION_START and SESSION_END)

**Who reads:** OPERATOR (for verification), FOREMAN (for review)

**Rules:**
- State files are generated from live checks, not edited manually
- Always overwrite (do not append) — only latest state matters
- Use ISO 8601 for all timestamps
- Use null for missing values, not empty strings
- Keep JSON valid and parseable

**Never manually edit state files unless explicitly ordered to do so.**

---

## Using State Files

**At SESSION_START:**
- Read mcp_status.json to verify MCP is configured
- Read api_status.json to verify API and DB are healthy
- Read last_session.json to understand previous state
- Create new entries in each file with current timestamp

**During work:**
- Refer to state files if you need to verify system health
- Do not modify state files during work

**At SESSION_END:**
- Update last_session.json with session metadata
- Write new mcp_status.json and api_status.json

---

## Example Usage

**Check if API was healthy last session:**
```
Read: last_session.json
If errors field is not null:
  Read: SESSION_LOG entry with matching date
  Understand what failed
  Proceed with awareness of past issue
```

**Verify MCP is still configured correctly:**
```
Read: mcp_status.json
Check: status == "operational"
If false:
  Run: EMERGENCY_RESET.md
```

---

## Summary

State files are:
- Machine-readable snapshots
- Updated automatically by OPERATOR
- Used for health verification
- Part of system recovery

They are not:
- Manual configuration files
- User-editable
- Persistent across system restarts (recreated each session)
- Used for logging (see SESSION_LOG for that)
