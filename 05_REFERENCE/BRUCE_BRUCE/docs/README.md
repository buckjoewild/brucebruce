# Documentation

**Last updated:** 2025-12-27

This folder contains the official documentation set for HarrisWildlands / BruceOps.

## How to use these docs

### Reading paths
- **New user (standalone):** `00-start-here/00-overview-and-reading-paths.md` → `10-user-guide/10-quickstart-standalone-docker.md`
- **Operator (self-host / standalone):** `00-start-here/00-overview-and-reading-paths.md` → `20-operator-guide/20-standalone-deployment-docker-compose.md`
- **Developer / maintainer:** `30-developer-reference/30-architecture-overview.md`

### Verification status legend
- **VERIFIED:** Confirmed via acceptance checklist in `50-releases-and-evidence/51-acceptance-test-checklist.md`
- **PENDING:** Listed in checklist but not yet marked PASS
- **TBD:** Not implemented or not documented yet

## Quick links
- Start here: `00-start-here/00-overview-and-reading-paths.md`
- Standalone quickstart: `10-user-guide/10-quickstart-standalone-docker.md`
- Security (local vs LAN, auth modes): `20-operator-guide/24-security-local-lan-and-auth-modes.md`
- Keystone reference (v1.0): `50-releases-and-evidence/50-keystone-v1.0-2025-12-27.md`
- Acceptance checklist: `50-releases-and-evidence/51-acceptance-test-checklist.md`
- Change log: `50-releases-and-evidence/52-changelog.md`

## Document structure

```
docs/
  README.md                          # This file

  00-start-here/                     # Entry point and terminology
    00-overview-and-reading-paths.md
    01-glossary.md

  10-user-guide/                     # End-user documentation
    10-quickstart-standalone-docker.md
    11-first-run-demo-mode.md
    12-lifeops-daily-logging.md
    13-thinkops-ideas-pipeline.md
    14-weekly-review.md
    15-export-and-personal-backups.md
    16-troubleshooting.md

  20-operator-guide/                 # Self-hosting and operations
    20-standalone-deployment-docker-compose.md
    21-configuration-env.md
    22-data-storage-and-persistence.md
    23-updates-and-upgrades.md
    24-security-local-lan-and-auth-modes.md
    25-healthchecks-and-basic-monitoring.md
    26-disaster-recovery.md

  30-developer-reference/            # Technical reference
    30-architecture-overview.md
    31-repo-layout.md
    32-api-routes-reference.md
    33-database-schema-reference.md
    34-auth-replit-oidc-and-fallbacks.md
    35-ai-provider-ladder.md
    36-validation-and-testing-checklist.md

  40-protocols-and-governance/       # Project philosophy and constraints
    40-lifeops-thinkops-separation.md
    41-drift-detection-signals.md
    42-privacy-red-zones-and-sharing-boundaries.md
    43-non-goals-and-safety-constraints.md

  50-releases-and-evidence/          # Release artifacts and proof
    50-keystone-v1.0-2025-12-27.md
    51-acceptance-test-checklist.md
    52-changelog.md
```
