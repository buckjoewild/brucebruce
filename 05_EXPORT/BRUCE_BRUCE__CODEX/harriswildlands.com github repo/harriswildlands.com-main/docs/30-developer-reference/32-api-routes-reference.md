# API routes reference

**Audience:** Developers  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Complete API endpoint reference for developers.

## Base URL

- Development: `http://localhost:5000`
- Production: `https://your-domain.com`

## Authentication

Most endpoints require authentication:
- **Replit OIDC:** Cookie-based session
- **STANDALONE_MODE:** Auto-authenticated

Unauthenticated requests return `401 Unauthorized`.

## Endpoints

### Health & System

#### GET /api/health
Health check endpoint.

**Auth required:** No

**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "ai_provider": "gemini",
  "ai_status": "online"
}
```

### Authentication

#### GET /api/auth/user
Get current user info.

**Auth required:** Yes (returns 401 if not authenticated)

**Response:**
```json
{
  "id": "user-123",
  "username": "bruce",
  "email": "bruce@example.com"
}
```

#### GET /api/login/replit
Initiate Replit OIDC login.

#### GET /api/auth/callback
OIDC callback handler.

#### GET /api/logout
End session.

### Logs (LifeOps)

#### GET /api/logs
List user's logs.

**Query params:**
- `limit` (optional): Max results
- `offset` (optional): Pagination offset

**Response:**
```json
[
  {
    "id": 1,
    "userId": "user-123",
    "date": "2025-12-27",
    "data": { ... }
  }
]
```

#### POST /api/logs
Create a new log entry.

**Body:** Log data (see schema)

#### GET /api/logs/:id
Get a specific log.

#### PATCH /api/logs/:id
Update a log entry.

#### DELETE /api/logs/:id
Delete a log entry.

### Ideas (ThinkOps)

#### GET /api/ideas
List user's ideas.

#### POST /api/ideas
Create a new idea.

#### GET /api/ideas/:id
Get a specific idea.

#### PATCH /api/ideas/:id
Update an idea.

#### DELETE /api/ideas/:id
Delete an idea.

#### POST /api/ideas/:id/reality-check
Run AI reality check on an idea.

**Response:**
```json
{
  "known": ["..."],
  "likely": ["..."],
  "speculation": ["..."],
  "selfDeceptionPatterns": ["..."]
}
```

### Goals

#### GET /api/goals
List user's goals.

#### POST /api/goals
Create a new goal.

#### GET /api/goals/:id
Get a specific goal.

#### PATCH /api/goals/:id
Update a goal.

#### DELETE /api/goals/:id
Delete a goal.

### Check-ins

#### GET /api/check-ins
List check-ins (optionally filtered by goalId).

**Query params:**
- `goalId` (optional): Filter by goal

#### POST /api/check-ins
Create a check-in.

#### PATCH /api/check-ins/:id
Update a check-in.

### Weekly Review

#### GET /api/review/weekly
Get weekly review data.

**Response:**
```json
{
  "stats": {
    "completionRate": 0.85,
    "missedDays": 2,
    "domainStats": { ... }
  },
  "driftFlags": [...]
}
```

#### POST /api/review/weekly/insight
Generate AI weekly insight.

**Response:**
```json
{
  "insight": "Based on your week...",
  "cached": false
}
```

### Export

#### GET /api/export/data
Export all user data as JSON.

**Response:** JSON file download with all entities.

### Chat (AI)

#### POST /api/chat
Send a message to the AI assistant.

**Body:**
```json
{
  "message": "What should I focus on this week?"
}
```

**Response:**
```json
{
  "response": "Based on your recent logs..."
}
```

### Teaching Assistant

#### GET /api/teaching/requests
List teaching requests.

#### POST /api/teaching/requests
Create a lesson plan request.

#### GET /api/teaching/requests/:id
Get a specific request.

### Harris Content

#### GET /api/harris/content
List brand content.

#### POST /api/harris/content
Create brand content.

### Google Drive

#### GET /api/drive/files
List Drive files.

**Query params:**
- `q` (optional): Search query

#### POST /api/drive/upload
Upload a file.

**Body:**
```json
{
  "name": "filename.txt",
  "content": "...",
  "mimeType": "text/plain"
}
```

#### GET /api/drive/download/:fileId
Download a file.

#### POST /api/drive/folder
Create a folder.

## Error responses

All errors follow this format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common codes:
- `401`: Not authenticated
- `403`: Not authorized
- `404`: Not found
- `400`: Bad request (validation error)
- `500`: Server error

## Request validation

All POST/PATCH bodies are validated using Zod schemas from `shared/schema.ts`.

Invalid requests return:
```json
{
  "error": "Validation error",
  "details": [...]
}
```

## References

- Schema: `33-database-schema-reference.md`
- Architecture: `30-architecture-overview.md`
- AI provider: `35-ai-provider-ladder.md`
