# GRAVITY — PUBLISH PROCESS

This explains how completed work leaves GRAVITY and becomes deliverable.

---

## What Is Publishing?

Publishing is the final step of the execution rhythm.

It means:
- Work artifacts are copied to a bundle
- Session log is included
- Bundle is versioned and dated
- Work is no longer "in progress" — it is delivered

**Without publish, a task is incomplete.**

---

## Bundle Naming Rules

Bundles are stored in: C:\GRAVITY\06_PUBLISH\

Naming format: `bundle_YYYY-MM-DD__topic`

**Examples:**
- `bundle_2026-01-29__gravity_consolidation`
- `bundle_2026-01-29__path_expansion`
- `bundle_2026-01-29__api_update`

**Rules:**
- Date is session date (YYYY-MM-DD format)
- Topic is short description (alphanumeric and underscores only)
- One bundle per task
- Bundle directory names are immutable

---

## Required Bundle Contents

Every bundle must contain:

### 1. Work Artifacts

**What:** Files created or modified during the task

**Examples:**
- Markdown documents
- Configuration files
- Generated reports
- Code files

**Rule:** Copy exactly what was created/modified. No edits to artifacts once published.

### 2. SESSION_LOG Snapshot

**File:** SESSION_LOG_YYYY-MM-DD.md (or appropriate date)

**Contents:** Complete log entry for this task session

**Rule:** This is a snapshot, not a live file. It is immutable once published.

### 3. Optional: Manifest

**File:** MANIFEST.txt (if complex deliverable)

**Contents:**
```
BUNDLE: bundle_YYYY-MM-DD__topic
DATE: YYYY-MM-DD
TASK: [description]
ARTIFACTS:
- [filename] — [description]
- [filename] — [description]
STATUS: [COMPLETE or INCOMPLETE]
```

**Rule:** Include manifest only if bundle has 3+ files or complex structure.

---

## What Gets Published

### Always Publish

- All files created during the task
- SESSION_LOG entry for the task
- Any configuration files modified
- Any documentation created

### Never Publish

- Temporary/working files
- Secrets or credentials (redacted if necessary)
- Unfinished work (unless marked explicitly INCOMPLETE)
- Personal notes or brainstorming
- Logs of failed attempts (only successful final attempt)

---

## Publishing Procedure

### Step 1: Prepare Artifacts

**Action:** Gather all files to be published

**Verification:**
- All files exist and are readable
- No secrets are included (redact if needed)
- Files are in final form (no more edits)

**Log:** "Prepared artifacts: [list]"

---

### Step 2: Create Bundle Directory

**Action:** Create bundle directory with correct naming

**Command:**
```
Create: C:\GRAVITY\06_PUBLISH\bundle_YYYY-MM-DD__topic
```

**Verification:**
- Directory exists and is empty
- Path follows naming rules

**Log:** "Created bundle directory"

---

### Step 3: Copy Artifacts to Bundle

**Action:** Copy all work files to bundle

**For each file:**
```
Copy: [source] → bundle_YYYY-MM-DD__topic\[filename]
```

**Verification:**
- File exists in bundle
- Content is identical to source
- No truncation or corruption

**Log:** "Copied [filename]"

---

### Step 4: Copy SESSION_LOG Snapshot

**Action:** Copy today's session log to bundle

**Command:**
```
Copy: C:\GRAVITY\04_LOGS\SESSION_LOG_YYYY-MM-DD.md 
      → bundle_YYYY-MM-DD__topic\SESSION_LOG_YYYY-MM-DD.md
```

**Verification:**
- File exists in bundle
- Contains complete log entry for this task
- Includes [VERIFY], [PATCH], [TEST], [LOG] sections

**Log:** "Copied SESSION_LOG snapshot"

---

### Step 5: Verify Bundle Contents

**Action:** List and verify all bundle contents

**Command:**
```
List: C:\GRAVITY\06_PUBLISH\bundle_YYYY-MM-DD__topic
```

**Verification:**
- All expected files are present
- No unexpected files
- Bundle is complete

**Log:** 
```
✅ Bundle verified
- [filename]
- [filename]
- SESSION_LOG_YYYY-MM-DD.md
```

---

### Step 6: Update Log with Bundle Reference

**Action:** Add final entry to SESSION_LOG

**Entry:**
```markdown
### [PUBLISH]

**Bundle:** C:\GRAVITY\06_PUBLISH\bundle_YYYY-MM-DD__topic

**Contents:**
- [artifact name]
- [artifact name]
- SESSION_LOG snapshot

**Status:** COMPLETE
```

---

## Bundle Immutability

Once published:

- Bundle directory is frozen
- Files in bundle cannot be modified
- If changes are needed, create a new bundle with updated date
- Do not edit published bundles

**Exception:** FOREMAN may order explicit revision. This creates a new dated bundle.

---

## Delivery

Published bundles are ready for:
- FOREMAN review
- External delivery
- Archive
- Integration

Bundles are the official output of GRAVITY work.

---

## Publishing Failures

If publish fails:

1. **Stop**
2. **Describe the failure**
3. **Check:**
   - Bundle directory exists
   - Write permissions are available
   - Required files exist
   - No conflicts
4. **Fix the issue**
5. **Retry publish**
6. **Log the retry**

If publish cannot complete:
- Mark task INCOMPLETE
- Note the failure in log
- Ask FOREMAN for guidance

---

## Summary

Publishing means:
- Artifacts are copied to a dated, named bundle
- Session log is included
- Bundle is frozen (immutable)
- Work is officially delivered
- Log entry references the bundle

Without publish, work is not complete.
