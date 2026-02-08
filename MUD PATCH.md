Implement MUD wiring now.
In C:\GRAVITY\HW_ENV\repo\structure\01_MUD_SERVER_CODE\ locate the telnet server command handler (process_command or equivalent).
Add a command: dev buildstub that:

requires armed+consent from the existing mode state (use per-player state if present)

calls orchestrator.build_loop.run_build(...) (or the equivalent function already written)

uses the codex_adapter stub (no real Codex yet)

writes one event line to structure/evidence/event_log.jsonl with durable:false

consumes the build cycle (snap back to PLAN) so the next dev buildstub is blocked until re-armed
Provide: (a) diff, (b) exact telnet manual test steps + expected output.

Implement real Codex 5.2 integration in orchestrator/codex_adapter.py behind a feature flag.
Requirements:

Default behavior unchanged unless USE_CODEX=1 is set in env.

When USE_CODEX=1, call the Codex 5.2 CLI from a configurable path env var CODEX_CLI (or fallback to codex on PATH).

Input to Codex: a structured prompt including: repo_root, intent text, verb, args, and a small context window (target files list, plus relevant file excerpts limited to N lines).

Output must be a unified diff only. If Codex returns anything else, fail safely (no apply).

Capture stdout+stderr into evidence/transcripts/codex_<timestamp>_<eventid>.txt and store sha256 in the PatchProposal metadata.

Return PatchProposal(diff, notes, tests) where tests remain: python -m pytest orchestrator/tests/test_build_loop.py -v

Add a tiny “dry-run” mode CODEX_DRYRUN=1 that logs transcript but returns no diff.
Deliver: diff + short runbook: how to set env vars and run dev buildstub in-game.

In BuildOrchestrator.execute_build, before applying diff:

reject diffs that touch files outside repo_root

reject diffs larger than a size cap (ex: 200KB) until you’re comfy