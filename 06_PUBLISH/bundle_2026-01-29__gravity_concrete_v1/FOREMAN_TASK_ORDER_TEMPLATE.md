# FOREMAN TASK ORDER TEMPLATE

Use this template every time you give Claude a task in GRAVITY.

Copy, fill in the bracketed sections, and send to Claude.

---

## Objective

[What outcome must exist when complete?]

Example: "Create GRAVITY bootstrap system with 10 documentation files"

---

## Allowed Scope

**WRITE:**
- C:\GRAVITY\[exact subpaths or list folders]

**READ-ONLY:**
- C:\Users\wilds\harriswildlands.com

**SUPPORT (execute only, no writes except for toolchain operations):**
- C:\Users\wilds\Desktop\UV

---

## Constraints

- Minimal change only (no refactors, no optimization)
- No secrets logged (redact immediately if they appear)
- Must follow rhythm: VERIFY → PATCH → TEST → LOG → PUBLISH
- No assumptions about existing files
- No writes outside allowed scope

---

## Deliverables

List exact files/paths that must exist:
- C:\GRAVITY\00_INDEX\[filename]
- C:\GRAVITY\01_RUNBOOKS\[filename]
- etc.

And/or:

- Bundle: C:\GRAVITY\06_PUBLISH\bundle_YYYY-MM-DD__[topic]

---

## Success Criteria

What constitutes "done":
- [specific test or proof required]
- [what verification looks like]
- [any numerical/structural requirements]

Example:
- Directory tree shows all 7 folders created
- All 10 markdown files exist with correct byte sizes
- SESSION_LOG includes [VERIFY], [PATCH], [TEST], [LOG], [PUBLISH] sections
- Integrity hashes match expected values

---

## Stop Conditions

Claude stops immediately and asks if:
- Task scope is ambiguous
- Instructions seem contradictory
- Scope would require writing outside C:\GRAVITY
- Health checks fail (API/MCP offline)
- Any secrets appear

Do not proceed under uncertainty.

---

## FILLED-IN EXAMPLE

# FOREMAN TASK ORDER — GRAVITY BOOTSTRAP

## Objective
Create the complete GRAVITY folder structure and write the 12 core documentation files.

## Allowed Scope
**WRITE:**
- C:\GRAVITY\00_INDEX
- C:\GRAVITY\01_RUNBOOKS
- C:\GRAVITY\02_STATE
- C:\GRAVITY\03_WORK
- C:\GRAVITY\04_LOGS
- C:\GRAVITY\05_REFERENCE
- C:\GRAVITY\06_PUBLISH

**READ-ONLY:**
- C:\Users\wilds\harriswildlands.com

**SUPPORT:**
- C:\Users\wilds\Desktop\UV

## Constraints
- Write files exactly as specified (no edits, no creativity)
- Verify each file after writing
- Generate SHA256 hashes for frozen docs
- Stop if any file write fails

## Deliverables
All files must exist:
- C:\GRAVITY\00_INDEX\START_HERE.md
- C:\GRAVITY\00_INDEX\SYSTEM_MAP.md
- C:\GRAVITY\00_INDEX\CURRENT_STATE.md
- C:\GRAVITY\00_INDEX\FOREMAN_TASK_ORDER_TEMPLATE.md
- C:\GRAVITY\00_INDEX\OPERATOR_SESSION_PROMPT.md
- C:\GRAVITY\01_RUNBOOKS\OPERATOR_RULES.md
- C:\GRAVITY\01_RUNBOOKS\SESSION_START.md
- C:\GRAVITY\01_RUNBOOKS\SESSION_END.md
- C:\GRAVITY\01_RUNBOOKS\PUBLISH_PROCESS.md
- C:\GRAVITY\01_RUNBOOKS\EMERGENCY_RESET.md
- C:\GRAVITY\02_STATE\STATE_SCHEMA.md
- C:\GRAVITY\03_WORK\GRAVITY_OPERATIONS_README.md

Plus:
- Bundle: C:\GRAVITY\06_PUBLISH\bundle_2026-01-29__gravity_bootstrap

## Success Criteria
- `tree /f C:\GRAVITY` shows all 7 folders and 12 files
- Each file verified for existence and byte size
- SESSION_LOG includes complete [VERIFY], [PATCH], [TEST], [LOG], [PUBLISH] phases
- Integrity hashes generated and saved
- Bundle contains all artifacts + session log

## Stop Conditions
- Any folder creation fails
- Any file write fails or truncates
- Health check fails
- Out-of-scope path encountered
