# MASTER KEYSTONE — Harris Wildlands MUD

## What Exists (Facts)

- **Server**: Python 3.12 + websockets, unified HTTP + WebSocket on port 5000
- **World**: 10 rooms, NPCs, Bruce autopilot steward
- **Build System**: PLAN/BUILD/CONSENT governance loop with orchestrator
- **AI Player Framework**: External bot clients with token-based auth
- **Evidence System**: Append-only JSONL files with sha256 signatures
- **Artifact Intake**: Structured witnessing of external artifacts (text, JSON, diffs, notes)

## Threat Model (Plain Language)

| Threat | Mitigation |
|--------|-----------|
| Bot impersonates human | Server assigns role; first message must be explicit auth/join handshake |
| Bot escalates to human role | Role is set server-side only; no client-settable role field |
| Bot runs privileged commands | `authorize()` choke point blocks `/build`, `/consent`, `create`, `spawn`, `bruce`, `dev buildstub` |
| Shell injection via AI test commands | Test commands whitelisted; `shell=False` enforced in subprocess |
| Build without consent | Armed + consented + BUILD mode required; arming expires after 300 seconds |
| Evidence tampering | sha256 signatures on every JSONL entry; `dev verify` command checks integrity |
| Duplicate player names | Server rejects connection if name already in use |
| Concurrent state corruption | `asyncio.Lock` protects world mutations (player/room/npc changes) |
| Log files grow unbounded | Rotation at 5MB; degraded flag on write failure |
| Encoding issues | All JSONL I/O specifies `encoding="utf-8"` |
| Patch corruption | Manual apply verifies context lines match before writing; fails hard on mismatch |

## Enforced Invariants

| Invariant | Code Location | Test Name |
|-----------|--------------|-----------|
| Explicit auth/join required | `server.py:handle_client` | `test_auth_requires_explicit_first_message` (concept) |
| No bot→human escalation | `bot_security.py:authorize()` | `test_bot_cannot_skip_auth_and_gain_human_role` |
| Bruce role is "npc" | `server.py:bruce_autopilot` | `test_bruce_role_not_human` |
| Build arming timeout (300s) | `mode_state.py:can_build()` | `test_build_arm_timeout_expires` |
| Hash verification exists | `heartbeat.py:verify_jsonl_hashes()` | `test_verify_passes_on_clean_log`, `test_verify_detects_tamper` |
| No AI shell execution | `build_loop.py:_run_tests()` | `test_subprocess_invoked_without_shell`, `test_ai_tests_command_rejected_or_ignored` |
| Player name uniqueness | `server.py:handle_client` | `test_duplicate_name_concept` |
| World lock for mutations | `server.py:cmd_go/create/spawn` | (structural; see concurrency test) |
| Evidence rotation + failure visibility | `heartbeat.py:_rotate_if_needed` | `test_rotation_occurs_at_threshold`, `test_write_failure_sets_degraded_flag` |
| UTF-8 encoding | All JSONL open() calls | `test_non_ascii_name_logged_roundtrip` |
| Patch context verification | `patch_apply.py:_apply_hunks` | `test_multi_hunk_patch_rejected_if_context_mismatch` |
| Context includes snippets | `build_loop.py:_gather_context` | `test_gather_context_includes_snippets`, `test_gather_context_redacts_secrets` |

## Known Limitations

- World state can be mutated by allowed commands (this is gameplay, not a security issue)
- Logs prove activity and integrity (when verified) but not intent
- Long-running operation needs monitoring: disk space, rotation thresholds
- No session_id or player created_at tracking (no session lifecycle events)
- Governance denials are not logged to evidence files (only bot audit logs denials)
- Timestamp formats are inconsistent across modules (4 distinct patterns)
- Evidence integrity depends on host filesystem; no remote attestation
- Manual patch apply is best-effort; complex multi-hunk patches may still fail
- `dev verify` checks hashes but cannot detect deleted entries (append-only assumption)

## Verification

### Run Tests
```bash
python -m pytest 07_HARRIS_WILDLANDS/orchestrator/tests/ -v
```

### Smoke Test
```bash
bash scripts/smoke.sh
```

### Manual Checks
1. Connect via browser terminal
2. Confirm join flow requires name entry (sends `{"type":"join","name":"..."}`)
3. Confirm `/build on` → `/consent yes` → `dev buildstub` works
4. Confirm `dev verify heartbeat` returns PASS
5. Confirm bot client requires valid token

## Change Log

- **2026-02-08**: Audit hardening — explicit auth, verify hashes, lock mutations, safe subprocess, timeouts, rotation, UTF-8, patch safety, context gathering. 120 tests passing.
