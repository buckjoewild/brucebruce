# VOLUME 3: ARCHITECTURE DOCUMENTATION

**HarrisWildlands.com Technical Project Manual**  
**Version:** 1.0.0  
**Generated:** December 28, 2025

---

## 3.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   React     │  │  TanStack   │  │   Wouter    │              │
│  │ Components  │──│   Query     │──│   Router    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Middleware │──│   Routes    │──│   Storage   │              │
│  │    Chain    │  │  (routes.ts)│  │(storage.ts) │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ PostgreSQL  │     │     AI      │     │   Google    │
│  Database   │     │  Providers  │     │    Drive    │
│  (Drizzle)  │     │ Gemini/OR   │     │    API      │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## 3.2 Request Flow Documentation

### Complete Request Lifecycle

```
1. User Action (Browser)
   └── Click button, submit form, navigate

2. React Component Event Handler
   └── onClick, onSubmit, etc.

3. TanStack Query Mutation/Query
   ├── useQuery: GET requests with caching
   └── useMutation: POST/PUT/DELETE with invalidation

4. Fetch to API Endpoint
   └── apiRequest() from queryClient.ts

5. Express Middleware Chain
   ├── Body parsing (express.json)
   ├── Request logging
   ├── Session middleware (express-session)
   └── Authentication (Passport.js)

6. Route Handler (routes.ts)
   ├── isAuthenticated guard
   ├── getUserId() extraction
   └── Input validation (Zod)

7. Storage Layer (storage.ts)
   └── DatabaseStorage methods

8. Database Operation (Drizzle)
   ├── db.select/insert/update/delete
   └── User-scoped queries (userId filter)

9. Response Chain
   └── JSON response → TanStack cache → React re-render
```

### Example: Creating a Log Entry

```typescript
// 1. User clicks "Save" in LifeOps form
<form onSubmit={form.handleSubmit(onSubmit)}>

// 2. Form submission handler
const onSubmit = async (data) => {
  createLogMutation.mutate(data);
};

// 3. TanStack mutation
const createLogMutation = useMutation({
  mutationFn: (data) => apiRequest('/api/logs', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
    toast({ title: "Log saved!" });
  }
});

// 4. Express route handler
app.post(api.logs.create.path, isAuthenticated, async (req, res) => {
  const userId = getUserId(req);
  const input = api.logs.create.input.parse(req.body);
  const log = await storage.createLog(userId, input);
  res.status(201).json(log);
});

// 5. Storage method
async createLog(userId: string, log: InsertLog): Promise<Log> {
  const [newLog] = await db.insert(logs)
    .values({ ...log, userId })
    .returning();
  return newLog;
}

// 6. Database insert
INSERT INTO logs (user_id, date, energy, ...) 
VALUES ($1, $2, $3, ...) 
RETURNING *;
```

---

## 3.3 Data Flow Patterns

### Client-Side State (TanStack Query)

```
┌─────────────────────────────────────┐
│        TanStack Query Cache         │
├─────────────────────────────────────┤
│ queryKey: ['/api/logs']             │
│ data: Log[]                         │
│ staleTime: 0 (default)              │
│ cacheTime: 5 minutes                │
├─────────────────────────────────────┤
│ queryKey: ['/api/goals']            │
│ data: Goal[]                        │
├─────────────────────────────────────┤
│ queryKey: ['/api/ideas']            │
│ data: Idea[]                        │
└─────────────────────────────────────┘
```

### Server-Side State (PostgreSQL)

```
┌─────────────────────────────────────┐
│           PostgreSQL                │
├─────────────────────────────────────┤
│ Table: logs                         │
│   └── Partitioned by userId         │
├─────────────────────────────────────┤
│ Table: ideas                        │
│   └── Partitioned by userId         │
├─────────────────────────────────────┤
│ Table: goals + checkins             │
│   └── Linked by goalId              │
└─────────────────────────────────────┘
```

### Session State

```
┌─────────────────────────────────────┐
│    express-session + pg-simple      │
├─────────────────────────────────────┤
│ sid: Session ID (cookie)            │
│ sess: { passport: { user } }        │
│ expire: TTL timestamp               │
└─────────────────────────────────────┘
```

---

## 3.4 Authentication Flow

### Replit OIDC Flow

```
1. User visits protected route
   └── isAuthenticated middleware checks session

2. No session → Redirect to /login
   └── Initiates OIDC flow with Replit

3. Replit Auth Page
   └── User authenticates with Google/GitHub/etc.

4. Callback to /api/callback
   ├── Validate OIDC tokens
   ├── Extract user claims (sub, email, name)
   └── Create/update user record

5. Session Created
   ├── Store in PostgreSQL (session table)
   └── Set cookie with session ID

6. Redirect to original route
   └── User now authenticated
```

### Standalone Mode Flow

```
1. STANDALONE_MODE=true detected
   └── No REPL_ID or ISSUER_URL

2. Auto-login enabled
   └── Fake user session created

3. User gets default identity
   ├── userId: "standalone-user"
   └── Full access to all features
```

### Demo Mode Flow

```
1. ?demo=true in URL
   └── Client-side demo flag

2. DemoBanner displayed
   └── Data not persisted warning

3. Features work normally
   └── But no server-side persistence
```

---

## 3.5 Error Handling Architecture

### Frontend Error Handling

```typescript
// Query error handling
const { data, error, isError } = useQuery({
  queryKey: ['/api/logs'],
});

if (isError) {
  return <ErrorState message={error.message} />;
}

// Mutation error handling
const mutation = useMutation({
  mutationFn: createLog,
  onError: (error) => {
    toast({ 
      variant: "destructive",
      title: "Error",
      description: error.message 
    });
  }
});
```

### API Error Response Structure

```typescript
// Validation error (400)
{
  "message": "Invalid date format"
}

// Not found (404)
{
  "message": "Log not found"
}

// Server error (500)
{
  "message": "Internal server error"
}
```

### AI Failure Graceful Degradation

```typescript
async function callAI(prompt, lanePrompt) {
  const provider = getActiveAIProvider();
  
  if (provider === "off") {
    return "AI features are currently disabled.";
  }
  
  try {
    // Try primary provider
    return await callPrimaryProvider(prompt);
  } catch (primaryError) {
    try {
      // Try fallback provider
      return await callFallbackProvider(prompt);
    } catch (fallbackError) {
      // All providers failed
      return "AI insights unavailable.";
    }
  }
}
```

---

## 3.6 Module Dependency Graph

```
shared/schema.ts (Types + Tables)
         │
         ├──────────────────────────────────┐
         ▼                                  ▼
  server/storage.ts                 shared/routes.ts
         │                                  │
         ▼                                  ▼
  server/routes.ts ◄────────────────────────┘
         │
         ▼
  server/index.ts (Entry Point)
```

### Frontend Dependencies

```
client/src/App.tsx (Router)
         │
         ├─── client/src/pages/* (12 pages)
         │         │
         │         └─── @/components/ui/* (48 components)
         │
         ├─── client/src/lib/queryClient.ts
         │
         └─── client/src/components/Layout.tsx
                   │
                   └─── ThemeProvider.tsx
```

---

## 3.7 Shared Schema Pattern

### Design Philosophy

The `shared/schema.ts` file serves as the **single source of truth** for:

1. **Database Tables** - Drizzle table definitions
2. **Zod Schemas** - Input validation
3. **TypeScript Types** - Type inference

```typescript
// 1. Table Definition
export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(),
  energy: integer("energy"),
  // ... more fields
});

// 2. Insert Schema (Zod)
export const insertLogSchema = createInsertSchema(logs)
  .omit({ id: true, userId: true, createdAt: true });

// 3. Types
export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;
```

### Benefits

| Benefit | Description |
|---------|-------------|
| **Type Safety** | Frontend and backend share exact types |
| **Validation** | Same Zod schema validates API input |
| **Consistency** | Schema changes propagate everywhere |
| **DRY** | No duplicate type definitions |

---

## 3.8 User-Scoped Data Pattern

### Implementation

Every data entity includes a `userId` field:

```typescript
export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // <-- User scope
  // ... other fields
});
```

### Query Pattern

All storage methods filter by userId:

```typescript
async getLogs(userId: string): Promise<Log[]> {
  return await db.select().from(logs)
    .where(eq(logs.userId, userId))  // <-- Filter
    .orderBy(desc(logs.date));
}
```

### Security

```typescript
// Route handler extracts userId from session
const userId = getUserId(req);

// Pass to storage method (never trust client)
const log = await storage.createLog(userId, input);
```

---

## 3.9 AI Context Construction

### Bruce Context (Global)

```typescript
const BRUCE_CONTEXT = `You are speaking directly to Bruce Harris - 
a dad, 5th/6th grade teacher, creator, and builder.
Bruce is building his personal operating system called BruceOps 
to manage his life, ideas, teaching, and creative work.
Always address him as "Bruce" and speak with the directness 
of a trusted advisor who knows his goals.
Be practical, honest, and help him stay aligned with his values: 
faith, family, building things that matter.`;
```

### Lane-Specific Prompts

| Lane | System Prompt |
|------|---------------|
| LifeOps | "You are a Life Operations Steward. Output factual/pattern-based summaries only." |
| ThinkOps | "You are a ruthless but helpful product manager. JSON output only." |
| Teaching | "You are a strict standards-aligned teaching assistant. JSON output only." |
| Harris | "You are a copywriter for a dad/teacher audience. No hype. JSON output only." |

---

**Next Volume:** [VOL04 - Complete File Structure](./VOL04_FILE_STRUCTURE.md)
