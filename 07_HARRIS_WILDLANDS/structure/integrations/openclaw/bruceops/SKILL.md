---
name: bruceops
description: Integrate with BruceOps personal operating system - manage daily logs, ideas, goals, teaching plans, and get AI insights from HarrisWildlands.com
metadata:
  {
    "openclaw":
      {
        "emoji": "🦞",
        "requires": { "env": ["BRUCEOPS_API_TOKEN"] },
        "homepage": "https://harriswildlands.com",
        "skillKey": "bruceops"
      }
  }
---

# BruceOps Integration for OpenClaw

Connect to your personal operating system to manage life tracking, ideas, and goals for Bruce Harris.

## System Overview

BruceOps (harriswildlands.com) is a full-stack TypeScript application with these domains:

- **LifeOps**: Daily logging (energy 1-10, stress 1-10, mood 1-10, vices, sleep, exercise)
- **ThinkOps**: Idea capture and pipeline (reality checks, promotion, milestones)
- **Goals**: Weekly goal tracking with daily check-ins across domains (faith, family, work, health, logistics, property, ideas, discipline)
- **Teaching**: AI lesson planning for 5th/6th grade
- **Harris**: Content generation for HarrisWildlands.com
- **AI Command Center**: Smart search, squad analysis, weekly synthesis, correlations

## Tools Available

### Dashboard & Status
- **bruceops-dashboard** - Quick stats (logs today, open loops, drift flags)
- **bruceops-health** - Check BruceOps API connectivity

### LifeOps - Daily Logging
- **bruceops-logs** - Fetch recent daily logs with metrics
- **bruceops-log-create** - Create a new daily log entry
- **bruceops-log-update** - Update an existing log
- **bruceops-log-by-date** - Get log for specific date (YYYY-MM-DD)

### ThinkOps - Ideas Pipeline
- **bruceops-ideas** - List ideas from pipeline
- **bruceops-idea-create** - Capture new idea
- **bruceops-idea-update** - Update idea status/priority
- **bruceops-reality-check** - Run AI reality check on idea

### Goals & Accountability
- **bruceops-goals** - List active goals with stats
- **bruceops-goal-create** - Create new goal
- **bruceops-checkins** - Get recent check-ins
- **bruceops-checkin-create** - Log goal progress
- **bruceops-weekly-review** - Generate weekly review report

### Teaching Assistant
- **bruceops-teaching** - Generate lesson plan for 5th/6th grade

### AI Insights
- **bruceops-ai-search** - Smart search across logs with AI analysis
- **bruceops-ai-squad** - Multi-perspective AI analysis
- **bruceops-ai-synthesis** - Generate weekly narrative summary
- **bruceops-ai-correlations** - Find patterns across metrics
- **bruceops-chat** - General chat with BruceOps AI

### Data Export
- **bruceops-export** - Export all user data as JSON

## Usage Examples

```
@bruceops dashboard
@bruceops logs --limit 5
@bruceops log-create --date 2025-01-31 --energy 7 --stress 4 --mood 8 --exercise true --topWin "Completed project"
@bruceops ideas
@bruceops idea-create --title "New app idea" --pitch "Description" --category tech
@bruceops reality-check --id 123
@bruceops goals
@bruceops checkin-create --goalId 1 --done true --note "30 min run"
@bruceops weekly-review
@bruceops teaching --grade 5th --topic "Fractions" --standard "CCSS.MATH.5.NF.A.1"
@bruceops ai-search --query "high energy days"
```

## Configuration

Required environment variables:
- `BRUCEOPS_API_TOKEN` - Bearer token from BruceOps Settings
- `BRUCEOPS_API_BASE` - API base URL (default: http://localhost:5000)

## Response Format

All tools return structured data. When responding to users:
1. Be concise and practical
2. Reference specific data points
3. Highlight drift flags or patterns
4. Suggest actionable next steps
5. Use Bruce's context (dad, teacher, creator)
