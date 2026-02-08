# Harris Wildlands — Codex 5.2 ↔ MUD Build Environment (Starter Document)
Date: 2026-02-07 (America/Chicago)

This is a **shareable starter doc** to begin the “real environment”: a MUD you can log into, where **BUILD** actions are governed (armed/consent), and where a **Codex 5.2-powered builder** can propose + apply minimal diffs inside a repo.

It assumes you already have:
- A working Python telnet MUD prototype (Harris Wildlands server).
- The mode-state / per-player gating patch set (PLAN vs BUILD with one-op arming).
- A local “Codex 5.2” installation somewhere under your Gravity path (exact invocation may vary).

---

## 0) Do we have enough in place *right now*?
**Yes — for a functional “human-in-the-loop” builder loop.** ✅

You already have the critical governance primitives:
- **Session entrypoint**: a telnet server command loop.
- **Mode gate**: PLAN vs BUILD with explicit arming + consent.
- **Per-player isolation**: avoids state bleed.
- **Event logging concept**: append-only build events with durability honesty.

What’s *still missing* is not “AI magic,” it’s plumbing:
1) A **Codex adapter** (one Python module) that can:
   - take a small structured request (goal + repo context),
   - produce a **patch/diff** (or file edits),
   - return **rationale + test suggestions**.
2) A **Repo-scoped apply+test harness**:
   - apply patch,
   - run tests (or a smoke run),
   - log result,
   - optionally revert on failure.

That’s it. The rest is iterative polish.

---

## 1) Architecture: simplest working loop (no vibes)
**MUD is the UI + governance. Codex is the patch generator. Tests are the judge.**

### Components
- **MUD Server (Python, telnet)**  
  Owns: command grammar, player sessions, mode state, event log.
- **World State + Persistence**  
  Owns: rooms/items/npcs storage + save/load.
- **Builder Orchestrator (Python module)**  
  Owns: “Spec → Patch → Test → Log” loop and tool permissions.
- **Codex 5.2 Adapter (Python wrapper)**  
  Owns: calling Codex (CLI or API) and returning proposed code edits.

### Data flows
Player (telnet) → /plan … → logs intent  
Player → /build on → /consent yes → build …  
Builder Orchestrator → calls Codex → receives patch → applies patch → runs tests → logs outcome → snaps back to PLAN.

---

## 2) Repo layout (recommended)
Pick one repo root on Gravity, e.g.:
`C:\GRAVITY\HW_MUD\`

Inside:
```
HW_MUD/
  server.py
  core/
    room.py
    item.py
    npc.py
    persistence.py
  world/
    world_data.json  (or whatever you use)
  orchestrator/
    __init__.py
    mode_state.py
    build_loop.py
    codex_adapter.py
    patch_apply.py
    tests/
  evidence/
    event_log.jsonl
    patches/
    transcripts/
```

Notes:
- **event_log.jsonl** should be append-only (JSON lines).
- **patches/** stores every generated diff by timestamp (even failed ones).

---

## 3) Tool authorization map (minimum viable + safe)
This is the “don’t burn the house down” map.

### File system
- **READ**: repo root + evidence/
- **WRITE**: repo root + evidence/patches/ + evidence/event_log.jsonl
- **DENY**: everything else (default)

### Command runner
Allow only repo-local commands, for example:
- `python -m pytest`
- `python server.py --smoke` (if you add a smoke flag)
- `git status`, `git diff`, `git checkout -- <file>`

Deny network tools and arbitrary shell by default.

### Git
- Always work on a branch:
  - `hw/build-<date>-<slug>`
- Commit only after tests pass.
- Every commit message includes the build event id.

---

## 4) MUD command grammar (starter set)
These commands are the “operator cockpit.”

### Mode + consent
- `/plan <text>`  
  Logs intent. No mutation.
- `/build on`  
  Arms one build operation.
- `/consent yes`  
  Final confirmation (consent must be explicit).
- `/build off`  
  Disarms.

### Build verbs (examples)
- `build room "<name>" :: "<desc>"`
- `build connect "<from>" <dir> "<to>"`
- `build npc "<room>" "<npc_name>" :: "<persona>"`
- `build item "<room>" "<item_name>" :: "<desc>"`

### Developer verbs (optional but useful)
- `dev status` (shows mode, armed, last build result)
- `dev log tail 20` (tail events)
- `dev patch show last` (show last diff summary)

Governance rule:
- If not armed+consented, BUILD verbs return a blocked message with mode+armed flags.

---

## 5) The Codex 5.2 adapter (what it must do)
This is the “one file that makes it real.”

### Required interface (Python)
`codex_adapter.py` should expose something like:

- `propose_patch(task: dict, repo_context: dict) -> dict`

Where return dict includes:
- `diff`: unified diff (preferred) OR `edits`: list of file edits
- `notes`: short rationale
- `tests`: suggested tests to run

### Inputs that matter
- **Task**: what build verb requested + intent text
- **Context**:
  - file tree (paths)
  - relevant file snippets (small!)
  - current failing tests (if any)
  - mode invariant reminders

### How to call Codex 5.2
This depends on your install, so we support both:

**Option A: Codex CLI installed locally**  
Adapter runs a subprocess call (repo-scoped) and captures output.

**Option B: API-backed Codex**  
Adapter calls an API client (requires keys + network; only if you choose).

For this project, start with **A** if you truly have “Codex 5.2 in the Gravity path.”

---

## 6) Build loop: Spec → Patch → Test → Log
This should live in `orchestrator/build_loop.py`.

Pseudo-flow:
1) Validate mode gate (must be armed + consented).
2) Create a **BuildEvent** id, log `durable: False`.
3) Gather repo context (small, relevant).
4) Ask Codex for a patch.
5) Apply patch to working tree.
6) Run tests / smoke.
7) If pass:
   - commit (optional),
   - log result ok.
8) If fail:
   - revert changes,
   - log failure + error tail.
9) Consume the build cycle → snap back to PLAN.

---

## 7) “Reality-grade” acceptance test (manual)
This is the first definition of done.

1) Telnet in with Player A
2) `/plan add a test that asserts build consumes one op`
3) `/build on`
4) `/consent yes`
5) Run one build verb (or a dev verb that triggers a no-op patch)
6) Observe:
   - exactly one build succeeds
   - event log appended with `durable: False`
   - next build is blocked until re-armed

Repeat with Player B simultaneously to confirm per-player isolation.

---

## 8) What we start with (MVP scope)
Start with **one build verb that edits one file** and is easy to test:
- Example: `build room ...` writes to a JSON world file (or in-memory + save).

Avoid “generate 30 rooms” until the loop is bulletproof.

---

## 9) Starter tasks (first 3)
1) Implement `codex_adapter.py` with a stub return (no AI yet) that returns a known diff.
2) Implement `patch_apply.py` that applies unified diff safely (or uses git apply).
3) Implement `build_loop.py` that runs the stub patch + pytest + logs event.

Once that works, swap stub → real Codex call.

---

## Appendix A — Event log schema (JSONL)
Each line is an event:
```json
{
  "ts": "2026-02-07T20:11:00-06:00",
  "id": "evt_...",
  "actor": "playername",
  "mode": "BUILD",
  "verb": "build room",
  "args": {"rest": "room \"Cabin\" :: \"A simple cabin\""},
  "result": "ok",
  "durable": false,
  "patch": {"path": "evidence/patches/...", "sha256": "..."},
  "tests": {"ran": true, "cmd": "python -m pytest", "ok": true},
  "ohp": {"decision": "..."}
}
```

---

## Tiny operator-clarity line
**The system must behave like a state machine, not a state wipe.**

---

## SBVS footer
SBVS: Spec—MUD governs, Codex proposes, tests judge | Build—adapter + apply + loop | Verify—telnet DoD + pytest | Ship—branch + commit + log
