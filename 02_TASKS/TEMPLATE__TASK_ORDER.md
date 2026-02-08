# TASK: [REPLACE WITH TASK TITLE]

**Status:** ACTIVE (edit as work progresses)

---

## Objective

[What outcome must exist when this task is complete?]

**Example:** "Create GRAVITY GATEKEEPER v1 with folder verification and hash integrity checking."

---

## Scope

### WRITE (required)
- C:\GRAVITY\[specific subfolders or paths]

### READ (required)
- C:\GRAVITY (all) or specific folders
- C:\Users\wilds\harriswildlands.com (if reference needed)

### SUPPORT (if needed)
- C:\Users\wilds\Desktop\UV (execute-only for toolchain)

**Rule:** Scope must be explicit. No wildcards. No assumptions.

---

## Constraints

- [Constraint 1: e.g., "Minimal change only (no refactors)"]
- [Constraint 2: e.g., "No secrets logged"]
- [Constraint 3: e.g., "Must follow VERIFY → PATCH → TEST → LOG → PUBLISH"]

---

## Deliverables

List exact files that must exist when complete:
- C:\GRAVITY\[path]\[filename]
- C:\GRAVITY\[path]\[filename]
- Bundle: C:\GRAVITY\06_PUBLISH\bundle_YYYY-MM-DD__[topic]

---

## Success Criteria

How will we know this is done? Be specific.

- [ ] [Testable criterion 1]
- [ ] [Testable criterion 2]
- [ ] [Testable criterion 3]
- [ ] SESSION_LOG entry exists with [VERIFY], [PATCH], [TEST], [LOG], [PUBLISH] phases

---

## Stop Conditions

OPERATOR pauses immediately and asks if:

- Scope is ambiguous or contradicts ALLOWED_PATHS.md
- Task description seems unclear
- Instructions conflict with OPERATOR_RULES.md
- Required files are missing or unreadable
- Health checks fail (API/MCP offline)
- Secrets appear

**Action:** Stop, describe the issue, quote the stopping point, ask FOREMAN.

---

## Execution Path

OPERATOR must follow:

1. **VERIFY** — Check current state, confirm scope, run health checks
2. **PATCH** — Make minimal changes as specified
3. **TEST** — Prove changes work
4. **LOG** — Record work in SESSION_LOG_YYYY-MM-DD.md
5. **PUBLISH** — Create bundle with artifacts + log snapshot

---

## Task Log Reference

**Session Log:** C:\GRAVITY\04_LOGS\SESSION_LOG_YYYY-MM-DD.md

Entry format:
```markdown
## [Task Name]

Task: C:\GRAVITY\02_TASKS\TASK__YYYYMMDD__topic__status.md

### [VERIFY]
- [evidence]

### [PATCH]
- [changes]

### [TEST]
- [proof]

### [LOG]
- [summary]

### [PUBLISH]
- [bundle path]
```

---

## Status Timeline

**Created:** YYYY-MM-DD HH:MM:SS
**Started:** [date/time or "not yet"]
**Completed:** [date/time or "in progress"]
**Status:** [ACTIVE | COMPLETE | BLOCKED | WAITING]

---

## Completion Checklist (OPERATOR fills at end)

- [ ] All deliverables exist
- [ ] All success criteria met
- [ ] No scope violations
- [ ] SESSION_LOG entry complete
- [ ] Bundle published
- [ ] Task marked COMPLETE

---

## Notes

[FOREMAN: Add any special instructions, context, or warnings]

[OPERATOR: Record progress, blockers, decisions]

---

## Template Version

Version: GATEKEEPER v1
Date: 2026-01-29
Format: Matches 02_TASKS\README.md rules
