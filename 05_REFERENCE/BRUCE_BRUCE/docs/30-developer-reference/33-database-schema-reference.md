# Database schema reference

**Audience:** Developers  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Complete database schema reference.

## Schema location

All models defined in: `shared/schema.ts`

## Core tables

### users

User accounts (Replit OIDC or standalone).

| Column | Type | Notes |
|--------|------|-------|
| id | text | Primary key (Replit user ID) |
| username | text | Display name |
| email | text | Email address (nullable) |
| profileImageUrl | text | Avatar URL (nullable) |
| createdAt | timestamp | Auto-generated |

### sessions

Express session storage.

| Column | Type | Notes |
|--------|------|-------|
| sid | text | Primary key (session ID) |
| sess | json | Session data |
| expire | timestamp | Expiration time |

### logs

LifeOps daily log entries.

| Column | Type | Notes |
|--------|------|-------|
| id | serial | Primary key |
| userId | text | Foreign key → users |
| date | date | Log date |
| data | jsonb | Flexible log data (see below) |

**Log data structure:**
```typescript
{
  // Scales (1-10)
  energyLevel?: number;
  stressLevel?: number;
  mood?: number;
  focus?: number;
  sleepQuality?: number;
  moneyPressure?: number;
  connection?: number;

  // Binary (boolean)
  vaping?: boolean;
  alcohol?: boolean;
  junkFood?: boolean;
  doomScrolling?: boolean;
  lateScreens?: boolean;
  skippedMeals?: boolean;
  excessCaffeine?: boolean;
  exercise?: boolean;

  // Categories (string)
  dayType?: string;
  primaryEmotion?: string;
  winCategory?: string;
  timeDrain?: string;

  // Text (string)
  topWin?: string;
  topFriction?: string;
  tomorrowPriority?: string;
  familyConnection?: string;
  faithAlignment?: string;
  driftCheck?: string;
}
```

### ideas

ThinkOps idea pipeline.

| Column | Type | Notes |
|--------|------|-------|
| id | serial | Primary key |
| userId | text | Foreign key → users |
| title | text | Idea title |
| pitch | text | Short description |
| status | text | draft, reality-checked, promoted, archived |
| category | text | tech, family, faith, income, etc. |
| captureMode | text | quick, deep |
| audience | text | Target audience (nullable) |
| painPoint | text | Problem it solves (nullable) |
| excitementLevel | integer | 1-10 (nullable) |
| feasibilityLevel | integer | 1-10 (nullable) |
| tinyTest | text | Validation test (nullable) |
| realityCheck | jsonb | AI reality check result (nullable) |
| createdAt | timestamp | Auto-generated |
| updatedAt | timestamp | Auto-updated |

### goals

User goals for tracking.

| Column | Type | Notes |
|--------|------|-------|
| id | serial | Primary key |
| userId | text | Foreign key → users |
| title | text | Goal title |
| description | text | Details (nullable) |
| domain | text | health, family, faith, work, etc. |
| frequency | text | daily, weekly, monthly |
| targetCount | integer | Check-ins per period |
| active | boolean | Is goal active |
| createdAt | timestamp | Auto-generated |

### check_ins

Goal check-in records.

| Column | Type | Notes |
|--------|------|-------|
| id | serial | Primary key |
| goalId | integer | Foreign key → goals |
| userId | text | Foreign key → users |
| date | date | Check-in date |
| completed | boolean | Was goal met |
| notes | text | Optional notes |
| createdAt | timestamp | Auto-generated |

### drift_flags

Calculated drift signals.

| Column | Type | Notes |
|--------|------|-------|
| id | serial | Primary key |
| userId | text | Foreign key → users |
| type | text | Type of drift (missed_days, streak_broken, etc.) |
| value | jsonb | Signal details |
| weekStart | date | Week this applies to |
| createdAt | timestamp | Auto-generated |

### teaching_requests

Lesson plan generation requests.

| Column | Type | Notes |
|--------|------|-------|
| id | serial | Primary key |
| userId | text | Foreign key → users |
| subject | text | Subject area |
| grade | text | Grade level |
| topic | text | Lesson topic |
| standards | text[] | Aligned standards |
| duration | integer | Minutes |
| result | jsonb | Generated lesson plan |
| createdAt | timestamp | Auto-generated |

### harris_content

HarrisWildlands brand content.

| Column | Type | Notes |
|--------|------|-------|
| id | serial | Primary key |
| userId | text | Foreign key → users |
| type | text | Content type |
| content | jsonb | Content data |
| createdAt | timestamp | Auto-generated |

## Zod schemas

Each table has corresponding Zod schemas:

```typescript
// Insert schema (for validation)
export const insertLogSchema = createInsertSchema(logs).omit({ id: true, userId: true });

// Types
export type InsertLog = z.infer<typeof insertLogSchema>;
export type Log = typeof logs.$inferSelect;
```

## Migrations

Drizzle handles schema migrations automatically:

```bash
npx drizzle-kit push
```

This syncs the TypeScript schema to the database.

## Indexes

Currently no custom indexes. Consider adding for:
- `logs.userId + logs.date` (common query pattern)
- `check_ins.goalId + check_ins.date`

## References

- Schema source: `shared/schema.ts`
- Storage layer: `server/storage.ts`
- API routes: `32-api-routes-reference.md`
