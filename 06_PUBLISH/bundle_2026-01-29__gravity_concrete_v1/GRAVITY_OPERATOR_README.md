# GRAVITY Operator Manual

## Roles

**Foreman:** Strategic direction, scope definition, approval authority.
**Operator:** Execution within defined scope, verification before action, minimal changes.

## Allowed Scope

**WRITE:**
- C:\GRAVITY (runbooks, logs, work products)

**READ-ONLY:**
- C:\Users\wilds\harriswildlands.com (reference material)

**SUPPORT (READ/EXECUTE):**
- C:\Users\wilds\Desktop\UV (uv toolchain, no writes unless required for uv operations)

## Operating Rhythm

1. **VERIFY** — Check system health, API status, existing state
2. **PATCH** — Create or modify files (minimal changes only)
3. **TEST** — Confirm changes work, verify file existence, run harmless commands
4. **LOG** — Record what changed and why in SESSION_LOG
5. **PUBLISH** — Copy artifacts to versioned bundle folder for delivery

## Critical Rules

- **Redaction:** Never paste secrets, tokens, API keys, or credentials anywhere in logs or bundles.
- **Min-scope:** Do not add paths beyond scope. Do not use wildcards.
- **Verification:** Always show current state before modifying.
- **Truth source:** Local filesystem is authoritative. Website is the map.
- **Silence over guessing:** If unclear, stop and ask.

## Success Criteria

Task complete when:
- All files created/modified in scope
- Changes tested and verified
- SESSION_LOG records all phases
- Bundle published with artifacts
- No errors, no overwrites, no scope creep
