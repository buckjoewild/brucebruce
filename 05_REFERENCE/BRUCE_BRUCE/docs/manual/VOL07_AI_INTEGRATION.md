# VOLUME 7: AI INTEGRATION GUIDE

**HarrisWildlands.com Technical Project Manual**  
**Version:** 1.0.0  
**Generated:** December 28, 2025

---

## 7.1 AI Provider Ladder

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    callAI(prompt, lanePrompt)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ getActiveProvider│
                    └─────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
   ┌──────────┐         ┌──────────┐         ┌──────────┐
   │  Gemini  │ ──fail──▶│OpenRouter│ ──fail──▶│   Off    │
   │ (Primary)│         │(Fallback)│         │(Graceful)│
   └──────────┘         └──────────┘         └──────────┘
```

### Provider Selection Logic

```typescript
function getActiveAIProvider(): "gemini" | "openrouter" | "off" {
  // Explicit off
  if (AI_PROVIDER === "off") return "off";
  
  // Explicit selection with key
  if (AI_PROVIDER === "gemini" && GOOGLE_GEMINI_API_KEY) return "gemini";
  if (AI_PROVIDER === "openrouter" && OPENROUTER_API_KEY) return "openrouter";
  
  // Auto-detect based on available keys
  if (GOOGLE_GEMINI_API_KEY) return "gemini";
  if (OPENROUTER_API_KEY) return "openrouter";
  
  return "off";
}
```

---

## 7.2 Gemini Integration

### Configuration

| Setting | Value |
|---------|-------|
| **Model** | gemini-1.5-flash |
| **API** | Google Generative Language API v1beta |
| **Temperature** | 0.7 |
| **Max Tokens** | 2048 |
| **Env Variable** | `GOOGLE_GEMINI_API_KEY` |

### API Endpoint

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}
```

### Request Format

```typescript
{
  contents: [{
    parts: [{
      text: `${systemPrompt}\n\n${userPrompt}`
    }]
  }],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048
  }
}
```

### Response Parsing

```typescript
const data = await response.json();
const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
```

### Cost Analysis

| Tier | Input Cost | Output Cost | Daily Limit |
|------|------------|-------------|-------------|
| Free | $0 | $0 | 60 requests/min |
| Paid | $0.00001875/1K | $0.000075/1K | Unlimited |

---

## 7.3 OpenRouter Integration

### Configuration

| Setting | Value |
|---------|-------|
| **Model** | openai/gpt-4o-mini |
| **API** | OpenRouter Chat Completions |
| **Env Variable** | `OPENROUTER_API_KEY` |

### API Endpoint

```
POST https://openrouter.ai/api/v1/chat/completions
```

### Request Format

```typescript
{
  model: "openai/gpt-4o-mini",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ]
}
```

### Response Parsing

```typescript
const data = await response.json();
const text = data.choices[0].message.content;
```

### Cost Analysis

| Model | Input Cost | Output Cost |
|-------|------------|-------------|
| gpt-4o-mini | $0.15/1M tokens | $0.60/1M tokens |
| gpt-4o | $2.50/1M tokens | $10.00/1M tokens |

---

## 7.4 Unified callAI Function

### Implementation

```typescript
async function callAI(prompt: string, lanePrompt: string = ""): Promise<string> {
  const systemPrompt = `${BRUCE_CONTEXT}\n\n${lanePrompt}`.trim();
  const provider = getActiveAIProvider();
  
  // Off mode - graceful degradation
  if (provider === "off") {
    return "AI features are currently disabled. Daily logging works normally.";
  }
  
  // Try primary provider
  try {
    if (provider === "gemini") {
      return await callGemini(prompt, systemPrompt);
    } else if (provider === "openrouter") {
      return await callOpenRouterAPI(prompt, systemPrompt);
    }
  } catch (primaryError) {
    console.error(`Primary AI provider (${provider}) failed:`, primaryError);
    
    // Try fallback
    try {
      if (provider === "gemini" && OPENROUTER_API_KEY) {
        console.log("Falling back to OpenRouter...");
        return await callOpenRouterAPI(prompt, systemPrompt);
      } else if (provider === "openrouter" && GOOGLE_GEMINI_API_KEY) {
        console.log("Falling back to Gemini...");
        return await callGemini(prompt, systemPrompt);
      }
    } catch (fallbackError) {
      console.error("Fallback AI provider also failed:", fallbackError);
    }
  }
  
  // Complete failure
  return "AI insights unavailable. Daily logging completed successfully.";
}
```

---

## 7.5 Bruce Context (Global Prompt)

### Definition

```typescript
const BRUCE_CONTEXT = `You are speaking directly to Bruce Harris - a dad, 5th/6th grade teacher, creator, and builder.
Bruce is building his personal operating system called BruceOps to manage his life, ideas, teaching, and creative work.
Always address him as "Bruce" and speak with the directness of a trusted advisor who knows his goals.
Be practical, honest, and help him stay aligned with his values: faith, family, building things that matter.`;
```

### Purpose

1. Personalize all AI responses
2. Establish trusted advisor relationship
3. Align with user's values
4. Provide consistent voice

---

## 7.6 Lane-Specific Prompts

### Lane 1: LifeOps

```typescript
const LIFEOPS_PROMPT = "You are a Life Operations Steward. Output factual/pattern-based summaries only.";
```

**Usage:** Log summary generation

### Lane 2: ThinkOps

```typescript
const THINKOPS_PROMPT = "You are a ruthless but helpful product manager. JSON output only. No markdown.";
```

**Usage:** Reality check analysis

### Lane 3: Teaching

```typescript
const TEACHING_PROMPT = "You are a strict standards-aligned teaching assistant. JSON output only.";
```

**Usage:** Lesson plan generation

### Lane 4: Harris

```typescript
const HARRIS_PROMPT = "You are a copywriter for a dad/teacher audience. No hype. JSON output only.";
```

**Usage:** Website copy generation

### Chat

```typescript
const CHAT_PROMPT = `You are Bruce Steward, a personal operations assistant for the BruceOps system.
You help Bruce with:
- LifeOps: Daily logging, routine tracking, energy management
- ThinkOps: Idea capture, brainstorming analysis, project planning
- Goals: Weekly reviews, habit tracking, accountability
- Teaching: 5th-6th grade lesson planning and classroom prep`;
```

---

## 7.7 AI Feature Implementations

### Reality Check

**Endpoint:** POST /api/ideas/:id/reality-check

**Prompt Structure:**
```
Perform a Reality Check on this idea.

IDEA:
Title: {title}
Pitch: {pitch}
Who It Helps: {whoItHelps}
Pain It Solves: {painItSolves}
Excitement: {excitement}/10
Feasibility: {feasibility}/10
Time Estimate: {timeEstimate}

MARKET RESEARCH:
{searchContext}

INSTRUCTIONS:
1. Separate claims into Known, Likely, Speculation
2. Flag self-deception patterns
3. Suggest ONE decision bin
4. Provide specific reasoning

Return ONLY pure JSON format:
{
  "known": [...],
  "likely": [...],
  "speculation": [...],
  "flags": [...],
  "decision": "Park|Promote|Salvage|Discard",
  "reasoning": "..."
}
```

### Weekly Insight

**Endpoint:** POST /api/review/weekly/insight

**Prompt Structure:**
```
Bruce, here's your week at a glance:

Completion Rate: {completionRate}%
Total Check-ins: {totalCheckins}
Completed: {completedCheckins}
Missed Days: {missedDays}
Drift Flags: {driftFlags}

Domain Performance:
{domainStats}

Goals:
{goals}

Give me ONE specific action to adjust this week. Be direct. No fluff.
Format: "This week, [action]." Then one sentence explaining why.
```

### Log Summary

**Endpoint:** POST /api/logs/summary

**Prompt Structure:**
```
Generate a factual summary for this daily log. Avoid advice. Identify pattern signals.
Log Data: {logData}
```

### Lesson Plan Generation

**Endpoint:** POST /api/teaching

**Prompt Structure:**
```
You are Bruce, a 5th-6th grade teaching assistant.
Input: {teachingInput}
Build:
(1) lesson outline
(2) hands-on activity
(3) exit ticket + key
(4) differentiation
(5) 10-min prep list
Return JSON format.
```

---

## 7.8 JSON Parsing Pattern

### Safe Extraction

```typescript
const response = await callAI(prompt, lanePrompt);

// Extract JSON from response
const jsonMatch = response.match(/\{[\s\S]*\}/);
const parsed = jsonMatch 
  ? JSON.parse(jsonMatch[0]) 
  : { 
      error: "Failed to parse AI response", 
      raw: response 
    };
```

### Error Recovery

```typescript
try {
  const parsed = JSON.parse(jsonMatch[0]);
  return parsed;
} catch (parseError) {
  return {
    error: "JSON parse failed",
    raw: response,
    // Provide fallback structure
    known: [],
    likely: [],
    speculation: [],
    flags: ["Parse error - manual review needed"],
    decision: "Park",
    reasoning: "AI response couldn't be parsed. Try again."
  };
}
```

---

## 7.9 Caching Strategy

### Weekly Insight Cache

```typescript
// Check cache (daily limit)
const today = new Date().toISOString().split('T')[0];
const cacheKey = `weekly-insight-${userId}-${today}`;

const cachedInsight = allSettings.find(s => s.key === cacheKey);

if (cachedInsight) {
  return { insight: cachedInsight.value, cached: true };
}

// Generate and cache
const insight = await callAI(prompt);
await storage.updateSetting(cacheKey, insight);

return { insight, cached: false };
```

---

## 7.10 Cost Optimization

### Strategies

| Strategy | Implementation |
|----------|----------------|
| **Daily caching** | Weekly insights cached per user per day |
| **Gemini first** | Free tier before paid OpenRouter |
| **Token limits** | maxOutputTokens: 2048 |
| **Concise prompts** | Minimal necessary context |
| **JSON-only output** | Reduce response size |

### Estimated Monthly Costs

| Usage Level | Gemini (Free) | OpenRouter |
|-------------|---------------|------------|
| Light (10 calls/day) | $0 | ~$0.50 |
| Medium (50 calls/day) | $0 | ~$2.50 |
| Heavy (100 calls/day) | $0* | ~$5.00 |

*Within free tier limits

---

## 7.11 Error Handling

### Graceful Degradation

```typescript
// Primary fails
catch (primaryError) {
  console.error(`Primary AI provider (${provider}) failed:`, primaryError);
  
  // Try fallback
  try {
    return await callFallbackProvider(prompt);
  } catch (fallbackError) {
    console.error("Fallback AI provider also failed:", fallbackError);
  }
}

// Complete failure - still functional
return "AI insights unavailable. Daily logging completed successfully.";
```

### User-Facing Messages

| Scenario | Message |
|----------|---------|
| AI disabled | "AI features are currently disabled." |
| Temporary failure | "AI insights unavailable." |
| Parse error | Fallback JSON with "manual review" flag |

---

## 7.12 Configuration Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_PROVIDER` | No | `off` | `gemini`, `openrouter`, or `off` |
| `GOOGLE_GEMINI_API_KEY` | No | - | Google AI Studio key |
| `OPENROUTER_API_KEY` | No | - | OpenRouter API key |

### Status Endpoint

```json
GET /api/health

{
  "ai_provider": "gemini",
  "ai_status": "active"
}
```

### Status Values

| ai_status | Meaning |
|-----------|---------|
| `active` | Provider configured and key present |
| `degraded` | Provider configured but key missing |
| `offline` | AI explicitly disabled |

---

**Next Volume:** [VOL08 - User Workflows](./VOL08_USER_WORKFLOWS.md)
