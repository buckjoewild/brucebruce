# GRAVITY — SYSTEM MAP

This document explains what each folder is for and what is truth vs reference.

---

## Folder Structure

### C:\GRAVITY (ROOT)

**Status:** WRITE
**Purpose:** Operational system — everything lives here
**Modification:** Controlled — OPERATOR writes only within rules

---

### C:\GRAVITY\00_INDEX

**Status:** READ (with planned updates)
**Purpose:** Orientation and reference documents
**Contains:**
- START_HERE.md — entry point
- SYSTEM_MAP.md — this file
- CURRENT_STATE.md — snapshot of operational reality

**Who writes:** OPERATOR, only under FOREMAN task order
**Who reads:** Everyone, always
**Modification frequency:** Rare (only when system structure changes)

---

### C:\GRAVITY\00_INBOX

**Status:** WRITE (input queue)
**Purpose:** Incoming materials, references, task staging
**Contains:**
- Unprocessed FOREMAN materials
- Temporary staging for new tasks

**Who writes:** FOREMAN or OPERATOR during task setup
**Who reads:** OPERATOR, to understand incoming scope
**Modification frequency:** Per task

---

### C:\GRAVITY\01_RUNBOOKS

**Status:** READ (frozen until formal revision)
**Purpose:** Operating procedures and rules
**Contains:**
- OPERATOR_RULES.md — the law
- SESSION_START.md — pre-flight checklist
- SESSION_END.md — completion checklist
- PUBLISH_PROCESS.md — how work leaves GRAVITY
- EMERGENCY_RESET.md — recovery procedure
- ALLOWED_PATHS.md — authoritative scope reference

**Who writes:** FOREMAN only, through explicit update orders
**Who reads:** Everyone, always
**Modification frequency:** Rare (major revisions only)

**Rule:** These documents must be read before every session.

**Note on ALLOWED_PATHS.md:** This file defines exact allowed scope. It must not contradict OPERATOR_RULES.md scope definitions.

---

### C:\GRAVITY\02_TASKS

**Status:** WRITE (active work queue)
**Purpose:** Task definitions and context
**Contains:**
- Active FOREMAN task orders
- Task-specific context and requirements
- References to related work

**Who writes:** FOREMAN or OPERATOR during task execution
**Who reads:** OPERATOR, for task understanding
**Modification frequency:** Per task

---

### C:\GRAVITY\02_STATE

**Status:** WRITE (machine-readable snapshots)
**Purpose:** Current operational state in JSON format
**Contains:**
- mcp_status.json — MCP server health
- api_status.json — API and database status
- last_session.json — metadata from last session

**Who writes:** OPERATOR, automatically during SESSION_START
**Who reads:** OPERATOR, for verification
**Modification frequency:** Every session

**Rule:** State files are generated from live checks, not edited manually.

---

### C:\GRAVITY\03_WORK

**Status:** WRITE (task artifacts)
**Purpose:** Work in progress and deliverables
**Contains:**
- GRAVITY_OPERATIONS_README.md — daily operating reference
- Task-specific files created during work

**Who writes:** OPERATOR, during task execution
**Who reads:** OPERATOR during execution, FOREMAN for review
**Modification frequency:** Per task

**Rule:** Work files are temporary. They move to 06_PUBLISH when complete.

---

### C:\GRAVITY\04_LOGS

**Status:** WRITE (append-only)
**Purpose:** Complete record of all sessions
**Contains:**
- SESSION_LOG_YYYY-MM-DD.md — daily log entries

**Who writes:** OPERATOR, appending new entries
**Who reads:** OPERATOR for context, FOREMAN for review, anyone for history
**Modification frequency:** Every session (append only)

**Rule:** Logs are never deleted or edited. Only appended.

---

### C:\GRAVITY\05_EXPORT

**Status:** WRITE (external deliverables)
**Purpose:** Finalized outputs for delivery outside GRAVITY
**Contains:**
- Reports formatted for external use
- Artifacts prepared for handoff
- Final packaging before external delivery

**Who writes:** OPERATOR, during final preparation phase
**Who reads:** FOREMAN, for external delivery
**Modification frequency:** Per task completion

---

### C:\GRAVITY\05_REFERENCE

**Status:** READ-ONLY
**Purpose:** External reference material
**Contains:**
- Documentation from external sources
- Historical context
- Reference implementations

**Who writes:** FOREMAN only, with explicit file placement
**Who reads:** OPERATOR, for context during work
**Modification frequency:** Rarely

**Rule:** Reference material is immutable. If outdated, create a new dated version.

---

### C:\GRAVITY\06_PUBLISH

**Status:** WRITE (versioned bundles)
**Purpose:** Completed work ready for delivery
**Contains:**
- bundle_YYYY-MM-DD__topic\ subdirectories
  - Work artifacts
  - SESSION_LOG snapshot
  - Manifest (if applicable)

**Who writes:** OPERATOR, during PUBLISH phase
**Who reads:** FOREMAN, for delivery and review
**Modification frequency:** Once per task

**Rule:** Bundles are immutable once created. New work creates new bundles.

---

## Truth vs Reference

### Truth (Authoritative, Written Here)

- C:\GRAVITY (all contents)
- Local filesystem state
- SESSION_LOG entries
- Published bundles

**Principle:** Local filesystem is the source of truth. Everything else is a map.

### Reference (Informational, Consulted Here)

- C:\Users\wilds\harriswildlands.com (READ-ONLY)
- External websites
- External documentation

**Principle:** Reference material informs decisions but does not override local state.

---

## What Never Gets Edited

**Freeze-level documents:**
- C:\GRAVITY\01_RUNBOOKS\* — operational procedures
- C:\GRAVITY\04_LOGS\* — historical log entries
- C:\GRAVITY\06_PUBLISH\* — completed bundles

**Exception:** FOREMAN may order formal revisions. This is rare and explicit.

---

## Scope Enforcement

**OPERATOR write scope:**
- C:\GRAVITY (within task order boundaries)

**OPERATOR read scope:**
- C:\GRAVITY (all)
- C:\Users\wilds\harriswildlands.com (reference only)

**OPERATOR execute scope:**
- C:\Users\wilds\Desktop\UV (toolchain only, no writes except for uv operations)

**Anything outside this scope requires explicit FOREMAN approval.**

---

## State Tracking

Operational state is stored in C:\GRAVITY\02_STATE as JSON snapshots.

This enables:
- Restart recovery
- Status verification
- Session continuity

**Who updates state:** OPERATOR, automatically at SESSION_START and SESSION_END

---

## Next Steps

1. Read C:\GRAVITY\01_RUNBOOKS\OPERATOR_RULES.md
2. Understand the execution rhythm
3. Read C:\GRAVITY\00_INDEX\CURRENT_STATE.md
4. Understand what is currently operational
5. Await task order
