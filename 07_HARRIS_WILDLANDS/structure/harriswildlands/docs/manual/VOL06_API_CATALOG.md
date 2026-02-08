# VOLUME 6: API ENDPOINT CATALOG

**HarrisWildlands.com Technical Project Manual**  
**Version:** 1.0.0  
**Generated:** December 28, 2025

---

## 6.1 API Design Patterns

### RESTful Conventions

| Verb | Usage | Success Code |
|------|-------|--------------|
| GET | Read resource(s) | 200 |
| POST | Create resource | 201 |
| PUT | Update resource | 200 |
| DELETE | Delete resource | 204 |

### Authentication

All endpoints except `/api/health` require authentication via:
- Replit OIDC session (production)
- Standalone mode session (Docker)

### Request/Response Format

```typescript
// Request: JSON body
Content-Type: application/json

// Response: JSON
{
  "id": 1,
  "field": "value"
}

// Error Response
{
  "message": "Error description"
}
```

### Zod Validation

All inputs validated using Zod schemas from `shared/schema.ts`:

```typescript
const input = api.logs.create.input.parse(req.body);
```

---

## 6.2 Health & System Endpoints

### GET /api/health

**Auth Required:** No

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-12-28T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "standalone_mode": false,
  "database": "connected",
  "ai_provider": "gemini",
  "ai_status": "active"
}
```

**Status Values:**
- `status`: "ok" | "degraded"
- `database`: "connected" | "error"
- `ai_provider`: "gemini" | "openrouter" | "off"
- `ai_status`: "active" | "degraded" | "offline"

### GET /api/me

**Auth Required:** Yes

**Response (200):**
```json
{
  "id": "user-123",
  "claims": {
    "sub": "user-123",
    "email": "bruce@example.com",
    "name": "Bruce Harris"
  }
}
```

---

## 6.3 Dashboard Endpoint

### GET /api/dashboard

**Auth Required:** Yes

**Response (200):**
```json
{
  "logsToday": 1,
  "openLoops": 5,
  "driftFlags": [
    "Sleep consistency < 70%",
    "High stress pattern detected"
  ]
}
```

---

## 6.4 Logs Endpoints (LifeOps)

### GET /api/logs

**Auth Required:** Yes

**Response (200):**
```json
[
  {
    "id": 1,
    "userId": "user-123",
    "date": "2025-12-28",
    "energy": 7,
    "stress": 4,
    "mood": 8,
    "focus": 6,
    "exercise": true,
    "vaping": false,
    "dayType": "work",
    "topWin": "Finished lesson plan",
    "createdAt": "2025-12-28T08:00:00.000Z"
  }
]
```

### GET /api/logs/:date

**Auth Required:** Yes

**Path Parameters:**
- `date`: YYYY-MM-DD format

**Response (200):**
```json
{
  "id": 1,
  "date": "2025-12-28",
  "energy": 7,
  ...
}
```

**Response (404):**
```json
{
  "message": "No log found for this date"
}
```

### POST /api/logs

**Auth Required:** Yes

**Request Body:**
```json
{
  "date": "2025-12-28",
  "energy": 7,
  "stress": 4,
  "mood": 8,
  "focus": 6,
  "sleepQuality": 7,
  "sleepHours": 7,
  "vaping": false,
  "alcohol": false,
  "junkFood": false,
  "doomScrolling": false,
  "lateScreens": false,
  "skippedMeals": false,
  "excessCaffeine": false,
  "exercise": true,
  "dayType": "work",
  "primaryEmotion": "grateful",
  "winCategory": "work",
  "timeDrain": "meetings",
  "topWin": "Finished lesson plan",
  "topFriction": "Too many interruptions",
  "tomorrowPriority": "Grade papers"
}
```

**Response (201):** Created log object

**Response (400):**
```json
{
  "message": "Invalid date format"
}
```

### PUT /api/logs/:id

**Auth Required:** Yes

**Path Parameters:**
- `id`: Log ID (integer)

**Request Body:** Same as POST

**Response (200):** Updated log object

**Response (404):**
```json
{
  "message": "Log not found"
}
```

### POST /api/logs/summary

**Auth Required:** Yes

**Request Body:**
```json
{
  "date": "2025-12-28"
}
```

**Response (200):**
```json
{
  "summary": "AI-generated summary of the day's log..."
}
```

---

## 6.5 Ideas Endpoints (ThinkOps)

### GET /api/ideas

**Auth Required:** Yes

**Response (200):**
```json
[
  {
    "id": 1,
    "userId": "user-123",
    "title": "Subscription model for teaching resources",
    "pitch": "Monthly access to printable materials",
    "category": "business",
    "status": "draft",
    "priority": 3,
    "excitement": 8,
    "feasibility": 6,
    "realityCheck": null,
    "createdAt": "2025-12-28T10:00:00.000Z"
  }
]
```

### POST /api/ideas

**Auth Required:** Yes

**Request Body:**
```json
{
  "title": "New idea title",
  "pitch": "One-line description",
  "category": "tech",
  "captureMode": "quick"
}
```

**Deep Capture Mode:**
```json
{
  "title": "New idea title",
  "pitch": "One-line description",
  "category": "business",
  "captureMode": "deep",
  "whoItHelps": "5th grade teachers",
  "painItSolves": "Lesson prep takes too long",
  "whyICare": "I experience this daily",
  "tinyTest": "Create one template and share",
  "resourcesNeeded": "Design tool, hosting",
  "timeEstimate": "weeks",
  "excitement": 8,
  "feasibility": 7
}
```

**Response (201):** Created idea object

### PUT /api/ideas/:id

**Auth Required:** Yes

**Path Parameters:**
- `id`: Idea ID (integer)

**Request Body:**
```json
{
  "status": "promoted",
  "priority": 5,
  "nextAction": "Create prototype"
}
```

**Response (200):** Updated idea object

### POST /api/ideas/:id/reality-check

**Auth Required:** Yes

**Path Parameters:**
- `id`: Idea ID (integer)

**Response (200):**
```json
{
  "id": 1,
  "title": "...",
  "realityCheck": {
    "known": ["Teachers need materials", "Bruce has teaching experience"],
    "likely": ["Market exists for premium templates"],
    "speculation": ["Could scale to 1000 users"],
    "flags": ["Time Optimism"],
    "decision": "Promote",
    "reasoning": "Strong pain point with clear solution path"
  },
  "status": "reality_checked"
}
```

---

## 6.6 Goals Endpoints

### GET /api/goals

**Auth Required:** Yes

**Response (200):**
```json
[
  {
    "id": 1,
    "userId": "user-123",
    "domain": "health",
    "title": "Exercise 4x per week",
    "description": "Cardio or strength training",
    "targetType": "count",
    "weeklyMinimum": 4,
    "status": "active",
    "priority": 1,
    "createdAt": "2025-12-01T00:00:00.000Z"
  }
]
```

### POST /api/goals

**Auth Required:** Yes

**Request Body:**
```json
{
  "domain": "health",
  "title": "Exercise 4x per week",
  "description": "Cardio or strength training",
  "targetType": "count",
  "weeklyMinimum": 4,
  "priority": 1
}
```

**Response (201):** Created goal object

### PUT /api/goals/:id

**Auth Required:** Yes

**Request Body:**
```json
{
  "status": "paused",
  "priority": 2
}
```

**Response (200):** Updated goal object

---

## 6.7 Check-ins Endpoints

### GET /api/checkins

**Auth Required:** Yes

**Query Parameters:**
- `startDate`: YYYY-MM-DD (optional)
- `endDate`: YYYY-MM-DD (optional)

**Response (200):**
```json
[
  {
    "id": 1,
    "goalId": 1,
    "userId": "user-123",
    "date": "2025-12-28",
    "done": true,
    "score": 8,
    "note": "30 min run",
    "createdAt": "2025-12-28T18:00:00.000Z"
  }
]
```

### POST /api/checkins

**Auth Required:** Yes

**Request Body:**
```json
{
  "goalId": 1,
  "date": "2025-12-28",
  "done": true,
  "score": 8,
  "note": "30 min run"
}
```

**Response (200):** Upserted check-in object

### POST /api/checkins/batch

**Auth Required:** Yes

**Request Body:**
```json
[
  { "goalId": 1, "date": "2025-12-28", "done": true },
  { "goalId": 2, "date": "2025-12-28", "done": false },
  { "goalId": 3, "date": "2025-12-28", "done": true }
]
```

**Response (200):** Array of upserted check-ins

---

## 6.8 Weekly Review Endpoints

### GET /api/review/weekly

**Auth Required:** Yes

**Response (200):**
```json
{
  "goals": [...],
  "checkins": [...],
  "stats": {
    "completionRate": 75,
    "totalCheckins": 21,
    "completedCheckins": 16,
    "missedDays": 2,
    "domainStats": {
      "health": { "goals": 2, "checkins": 6 },
      "faith": { "goals": 1, "checkins": 5 }
    },
    "startDate": "2025-12-21",
    "endDate": "2025-12-28"
  },
  "driftFlags": [
    "Goal check-ins were missed on 2 days over the past week."
  ]
}
```

### POST /api/review/weekly/insight

**Auth Required:** Yes

**Response (200):**
```json
{
  "insight": "This week, focus on morning exercise before the day gets busy. Your highest energy logs correlate with early workout days.",
  "cached": false
}
```

**Note:** Insights are cached daily to reduce API costs.

### GET /api/export/weekly.pdf

**Auth Required:** Yes

**Response:** Text file download (PDF not yet implemented)

---

## 6.9 Teaching Endpoints

### GET /api/teaching

**Auth Required:** Yes

**Response (200):**
```json
[
  {
    "id": 1,
    "userId": "user-123",
    "grade": "5th",
    "standard": "CCSS.MATH.5.NBT.1",
    "topic": "Place Value",
    "output": {...},
    "createdAt": "2025-12-28T14:00:00.000Z"
  }
]
```

### POST /api/teaching

**Auth Required:** Yes

**Request Body:**
```json
{
  "grade": "5th",
  "standard": "CCSS.MATH.5.NBT.1",
  "topic": "Understanding place value",
  "timeBlock": "45 minutes",
  "materials": "Base-10 blocks, whiteboards",
  "studentProfile": "Mixed ability levels",
  "constraints": "No technology available",
  "assessmentType": "exit ticket",
  "format": "structured"
}
```

**Response (201):**
```json
{
  "id": 1,
  "output": {
    "lessonOutline": "...",
    "handsOnActivity": "...",
    "exitTicket": "...",
    "answerKey": "...",
    "differentiation": "...",
    "prepList": ["Item 1", "Item 2"]
  }
}
```

---

## 6.10 Harris Content Endpoints

### POST /api/harris

**Auth Required:** Yes

**Request Body:**
```json
{
  "contentType": "website",
  "tone": "inspirational",
  "coreMessage": {
    "definition": "Help fathers lead their families with intention",
    "audience": "Dads who want to be more present",
    "pain": "Feeling disconnected from family life",
    "promise": "Practical tools for intentional fatherhood"
  },
  "siteMap": {
    "homeGoal": "Capture email",
    "startHereGoal": "Build trust",
    "resourcesGoal": "Provide value",
    "cta": "Download free guide"
  },
  "leadMagnet": {
    "title": "The 5-Minute Morning Routine for Dads",
    "problem": "No time for personal development",
    "timeToValue": "5 minutes",
    "delivery": "PDF download"
  }
}
```

**Response (201):**
```json
{
  "id": 1,
  "generatedCopy": {
    "home": "...",
    "startHere": "...",
    "resources": "..."
  }
}
```

---

## 6.11 Chat Endpoint

### POST /api/chat

**Auth Required:** Yes

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "What should I focus on today?" }
  ],
  "context": "weekly_review"
}
```

**Response (200):**
```json
{
  "role": "assistant",
  "content": "Based on your logs, Bruce, I'd suggest..."
}
```

---

## 6.12 Export Endpoint

### GET /api/export/data

**Auth Required:** Yes

**Response (200):**
```json
{
  "exportedAt": "2025-12-28T12:00:00.000Z",
  "user": {...},
  "logs": [...],
  "ideas": [...],
  "goals": [...],
  "checkins": [...],
  "teachingRequests": [...],
  "harrisContent": [...],
  "transcripts": [...]
}
```

---

## 6.13 Settings Endpoints

### GET /api/settings

**Auth Required:** Yes

**Response (200):**
```json
[
  { "id": 1, "key": "ai_model", "value": "gpt-4o-mini" }
]
```

### PUT /api/settings/:key

**Auth Required:** Yes

**Request Body:**
```json
{
  "value": "gemini-1.5-flash"
}
```

**Response (200):** Updated setting object

---

## 6.14 Error Response Reference

| Code | Message | Cause |
|------|---------|-------|
| 400 | "Invalid {field}" | Zod validation failure |
| 401 | "Unauthorized" | Missing/invalid session |
| 404 | "{Resource} not found" | Resource doesn't exist or wrong user |
| 500 | "Internal server error" | Unhandled exception |

---

**Next Volume:** [VOL07 - AI Integration Guide](./VOL07_AI_INTEGRATION.md)
