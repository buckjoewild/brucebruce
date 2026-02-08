# AI provider ladder

**Audience:** Developers  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Document the AI provider strategy and implementation.

## Provider ladder concept

AI providers are tried in order with automatic fallback:

```
1. Gemini (Google AI Studio free tier)
      ↓ (if unavailable or error)
2. OpenRouter (paid, multiple models)
      ↓ (if unavailable or error)
3. OFF (app works without AI)
```

## Configuration

### Environment variable

```bash
AI_PROVIDER=gemini     # Use Gemini first
AI_PROVIDER=openrouter # Use OpenRouter first
AI_PROVIDER=off        # Disable AI completely
```

### API keys

```bash
GOOGLE_GEMINI_API_KEY=AIzaSy...      # For Gemini
OPENROUTER_API_KEY=sk-or-v1-...      # For OpenRouter
```

## Implementation

### callAI() function

Located in `server/routes.ts`:

```typescript
async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  const provider = process.env.AI_PROVIDER || 'off';

  if (provider === 'off') {
    throw new Error('AI is disabled');
  }

  if (provider === 'gemini' && process.env.GOOGLE_GEMINI_API_KEY) {
    try {
      return await callGemini(prompt, systemPrompt);
    } catch (error) {
      console.log('Gemini failed, trying OpenRouter...');
      if (process.env.OPENROUTER_API_KEY) {
        return await callOpenRouter(prompt, systemPrompt);
      }
      throw error;
    }
  }

  if (provider === 'openrouter' && process.env.OPENROUTER_API_KEY) {
    return await callOpenRouter(prompt, systemPrompt);
  }

  throw new Error('No AI provider configured');
}
```

### Gemini implementation

```typescript
async function callGemini(prompt: string, systemPrompt?: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined
      })
    }
  );

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
```

### OpenRouter implementation

```typescript
async function callOpenRouter(prompt: string, systemPrompt?: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

## Bruce context

All AI calls include personalization via "Bruce context":

```typescript
const BRUCE_CONTEXT = `
You are an assistant for a faith-centered father, teacher, and creator.
Key values:
- Faith over fear
- Systems over skills
- Truth-first logging
- Ideas separate from operations

Respond in a supportive, direct manner. Avoid generic advice.
`;
```

## AI-powered features

| Feature | Endpoint | Purpose |
|---------|----------|---------|
| Reality Check | `POST /api/ideas/:id/reality-check` | Classify Known/Likely/Speculation |
| Weekly Insight | `POST /api/review/weekly/insight` | Generate weekly action recommendation |
| Chat | `POST /api/chat` | Conversational AI interface |

## Error handling

When AI fails:

```typescript
try {
  const response = await callAI(prompt);
  res.json({ response });
} catch (error) {
  res.json({
    response: null,
    error: 'AI unavailable',
    fallback: true
  });
}
```

The app continues to work; AI features just return fallback responses.

## Cost considerations

| Provider | Pricing model |
|----------|---------------|
| Gemini | Free tier (rate limited) |
| OpenRouter | Pay per token |

### Rate limiting

Gemini free tier has rate limits. Consider:
- Caching responses (weekly insight cached daily)
- Debouncing user input
- Fallback to OpenRouter on rate limit

## Health check

The `/api/health` endpoint reports AI status:

```json
{
  "ai_provider": "gemini",
  "ai_status": "online"
}
```

## Adding a new provider

1. Add API call function in `server/routes.ts`
2. Add to provider ladder in `callAI()`
3. Add environment variable
4. Update health check
5. Document in this file

## References

- Configuration: `20-operator-guide/21-configuration-env.md`
- API routes: `32-api-routes-reference.md`
- Reality Check page: `client/src/pages/RealityCheck.tsx`
