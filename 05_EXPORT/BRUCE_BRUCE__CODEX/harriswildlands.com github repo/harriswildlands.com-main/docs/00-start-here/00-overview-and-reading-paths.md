# Start here

**Last updated:** 2025-12-27

This is the minimum context needed to use, operate, or extend the system without reading the full keystone.

## System summary (conceptual)

BruceOps is a personal operating system that consolidates four operational "lanes" into a unified web application:

- **LifeOps:** Minimal-input daily ledger (yes/no + 1-10 scales + optional reflection)
- **ThinkOps:** Idea pipeline kept separate from operations
- **Weekly review:** Computes basic stats (e.g., completion rate) and emits **drift flags** as factual signals
- **Exports:** Download a JSON bundle of user data for personal backup
- **Authentication modes:** Replit OIDC when configured; standalone/demo fallback when not
- **AI is optional:** "Provider ladder" can fall back to OFF when keys are missing

### Core philosophy

> "Faith over fear & systems over skills"

## Reading paths

### 1) New user (standalone)
1. `10-user-guide/10-quickstart-standalone-docker.md`
2. `10-user-guide/11-first-run-demo-mode.md`
3. `10-user-guide/12-lifeops-daily-logging.md`
4. `10-user-guide/13-thinkops-ideas-pipeline.md`
5. `10-user-guide/14-weekly-review.md`
6. `10-user-guide/15-export-and-personal-backups.md`

### 2) Operator (self-host / standalone)
1. `20-operator-guide/20-standalone-deployment-docker-compose.md`
2. `20-operator-guide/21-configuration-env.md`
3. `20-operator-guide/22-data-storage-and-persistence.md`
4. `20-operator-guide/23-updates-and-upgrades.md`
5. `20-operator-guide/24-security-local-lan-and-auth-modes.md`
6. `20-operator-guide/25-healthchecks-and-basic-monitoring.md`
7. `20-operator-guide/26-disaster-recovery.md`

### 3) Developer / maintainer
1. `30-developer-reference/30-architecture-overview.md`
2. `30-developer-reference/31-repo-layout.md`
3. `30-developer-reference/33-database-schema-reference.md`
4. `30-developer-reference/32-api-routes-reference.md`
5. `30-developer-reference/34-auth-replit-oidc-and-fallbacks.md`
6. `30-developer-reference/35-ai-provider-ladder.md`
7. `30-developer-reference/36-validation-and-testing-checklist.md`

## Terminology

See: `00-start-here/01-glossary.md`
