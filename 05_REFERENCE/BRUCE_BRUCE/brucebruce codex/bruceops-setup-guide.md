# 🚀 BruceOps Bulletproof Setup Guide

Follow these steps EXACTLY to get your bulletproof AI Command Center running.

---

## Step 1: Install Dependencies

```bash
cd harriswildlands.com
npm install express-rate-limit
```

---

## Step 2: Add Server Code

### 2a. Add Rate Limiting & CORS

Open `server/routes.ts` and add this import at the TOP:

```typescript
import rateLimit from 'express-rate-limit';
```

Then, find the `registerRoutes` function and add the CORS + rate limiting code RIGHT AFTER `await setupAuth(app);`

**Copy the entire CORS/rate limiting block from Artifact #2**

### 2b. Add AI Endpoints

At the END of `server/routes.ts`, BEFORE the final `return httpServer;`, add ALL the AI endpoints from Artifact #1:

- AI Cache setup
- Quota tracking
- `/api/ai/search`
- `/api/ai/squad`
- `/api/ai/weekly-synthesis`
- `/api/ai/correlations`
- `/api/ai/quota`
- `/api/ai/cache/clear`

---

## Step 3: Start Server in Standalone Mode

```bash
# Make sure you're in project root
cd harriswildlands.com

# Set environment variable for standalone mode
export STANDALONE_MODE=true

# Start the server
npm run dev
```

You should see:
```
===========================================
STANDALONE MODE ACTIVE
Auto-login enabled - no authentication required
===========================================
✅ CORS enabled for: [...]
✅ Rate limiting enabled:
   - General: 100 req/15min
   - AI: 10 req/min per user
serving on port 5000
```

---

## Step 4: Test Endpoints

Open a new terminal and test each endpoint:

### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
```

**Expected:** JSON with `status: "ok"`

### Test 2: AI Quota
```bash
curl http://localhost:5000/api/ai/quota
```

**Expected:** 
```json
{
  "used": 0,
  "limit": 100,
  "remaining": 100,
  "resetsAt": "..."
}
```

### Test 3: Smart Search
```bash
curl -X POST http://localhost:5000/api/ai/search \
  -H "Content-Type: application/json" \
  -d '{"query": "energy", "limit": 5}'
```

**Expected:** JSON with `count`, `samples`, `insight`, `cached`

---

## Step 5: Use the Command Center Artifact

1. **Open the Command Center artifact** (the rebuilt one - Artifact #3)
2. It should show a green dot next to "localhost:5000"
3. Click **Smart Search** tab
4. Type: `high energy`
5. Click **Search**
6. **Watch the magic happen!** ✨

---

## Step 6: Verify Cost Protection

### Check Quota Status
Look at the top-right of the Command Center - you'll see:
```
AI Quota
95/100 remaining
```

### Test Cache Hit
1. Search for `energy` (first time - calls AI)
2. Search for `energy` again immediately
3. Second search should show **(Cached - Free!)**

### Test Rate Limiting
1. Click search 11 times rapidly
2. 11th request should fail with: "AI rate limit exceeded"
3. Wait 1 minute, try again - should work

---

## Step 7: Monitor Costs

### Check Daily Usage
```bash
curl http://localhost:5000/api/ai/quota
```

**Look for:**
- `used`: Number of API calls today
- `remaining`: How many left before quota
- `cacheSize`: How many responses cached

### Calculate Cost
```
If you used 50 API calls today:
50 calls × $0.0045/call = $0.225 (22 cents)

With 70% cache hit rate:
50 calls × 30% × $0.0045 = $0.068 (7 cents)
```

---

## Verification Checklist

- [ ] Server starts with "STANDALONE MODE ACTIVE"
- [ ] CORS enabled message appears
- [ ] Rate limiting enabled message appears
- [ ] Health endpoint returns 200 OK
- [ ] AI quota endpoint returns JSON
- [ ] Command Center shows green dot (online)
- [ ] Smart Search returns results
- [ ] Second identical search shows (CACHED)
- [ ] Quota counter decreases after each call
- [ ] Weekly Synthesis generates report
- [ ] AI Squad returns Claude response

---

## Troubleshooting

### "Server Offline" in Command Center
```bash
# Check if server is running
curl http://localhost:5000/api/health

# If fails, restart server
npm run dev
```

### "CORS Error" in Browser Console
```
Access to fetch at 'http://localhost:5000/...' from origin 'https://claude.ai' 
has been blocked by CORS policy
```

**Fix:** Make sure you added the CORS middleware EXACTLY as shown in Artifact #2

### "Rate Limit Exceeded" Too Quickly
```json
{ "error": "AI rate limit exceeded. Maximum 10 requests per minute." }
```

**This is GOOD** - it means cost protection is working!
**Wait 60 seconds** and try again.

### "Daily Quota Exceeded"
```json
{ "error": "Daily AI quota exceeded (100 calls/day). Resets at midnight." }
```

**Options:**
1. Wait until midnight (quota resets)
2. Increase limit in code: `const DAILY_QUOTA_LIMIT = 200;`
3. Clear cache to see if repeated queries: `POST /api/ai/cache/clear`

---

## Cost Dashboard (Manual Check)

Run this to see your stats:

```bash
# Get quota
curl http://localhost:5000/api/ai/quota

# Example output:
# {
#   "used": 23,
#   "limit": 100,
#   "remaining": 77,
#   "cacheSize": 15
# }
#
# Translation:
# - Made 23 API calls today = ~$0.10
# - 15 cached responses saved = ~$0.07 saved
# - Net cost today: ~$0.03
```

---

## What's Protected

✅ **Daily Quota:** 100 AI calls/day per user
✅ **Rate Limiting:** 10 AI calls/minute
✅ **Response Caching:** 24-hour TTL (repeats are free)
✅ **Cost Tracking:** Every call logged
✅ **CORS Security:** Only claude.ai can call
✅ **Standalone Auth:** No login friction

---

## What to Monitor

📊 **Daily Usage:** Check `/api/ai/quota` each evening
💰 **Monthly Cost:** `used × $0.0045 × 30 days`
🔥 **Cache Hit Rate:** Higher = lower cost
⚠️ **Quota Alerts:** If you hit 100/day often, increase limit

---

## Next Steps

### Week 1: Validate
- Use it daily
- Check costs weekly
- Verify cache is working

### Week 2: Optimize
- Increase quota if needed
- Add more endpoints
- Tune cache TTL

### Week 3: Extend
- Add Grok API integration
- Add ChatGPT integration
- Deploy to cloud (optional)

---

## Success Metrics

After 1 week, you should see:

✅ **Cost:** <$1 total
✅ **Cache Hit Rate:** >50%
✅ **Daily Usage:** Consistent pattern
✅ **Zero Errors:** No quota exceeded, no rate limits hit
✅ **Value:** Insights you couldn't get manually

---

**YOU'RE BULLETPROOF, BRUCE!** 🛡️

Questions? Issues? Let me know and we'll debug together! 🚀
