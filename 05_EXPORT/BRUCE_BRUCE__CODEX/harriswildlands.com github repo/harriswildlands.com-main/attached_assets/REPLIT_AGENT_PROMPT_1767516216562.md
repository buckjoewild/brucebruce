# 🚀 Replit Agent: BruceOps Dual-Access Implementation Prompt

**Date**: January 4, 2026  
**Project**: BruceOps / HarrisWildlands Personal Operating System  
**Task**: Implement dual-access architecture (Web UI + Claude Desktop MCP)  
**Estimated Effort**: 3-4 hours of coding  
**Critical Constraint**: COST OPTIMIZATION (we're budget-conscious)

---

## 📋 CONTEXT: Where We Are

### Current State
- ✅ **Live Production**: harriswildlands.com (Replit deployment)
- ✅ **Database**: PostgreSQL with 10 tables (logs, ideas, goals, checkins, etc.)
- ✅ **Auth**: Replit OIDC (session-based) working for web UI
- ✅ **AI Integration**: Gemini (primary) + OpenRouter (fallback) for cost savings
- ✅ **MCP Server**: `bruceops_mcp_server.py` exists locally, connects to production

### What's New (This Sprint)
We're adding **dual-access architecture**:
1. **Web UI** (existing): Browser-based, session auth
2. **Claude Desktop** (new): MCP protocol, API token auth
3. **Both access same database simultaneously**

### Why This Matters
Bruce wants to:
- Login to web UI for visual dashboards/logging
- Use Claude Desktop for conversational queries ("What's my energy trend?")
- Have Claude Desktop reference AI collaboration logs (custom "Bruce™" personality)
- **Never pay for both web UI API calls AND Claude Desktop API calls on same data**

---

## 💰 CRITICAL: COST CONSTRAINTS

### Current AI Provider Setup
```typescript
// server/routes.ts - EXISTING
const AI_PROVIDER_LADDER = {
  primary: 'gemini',      // Google Gemini (cheaper for most tasks)
  fallback: 'openrouter', // OpenRouter (cheaper than Anthropic direct)
  offline: 'disabled'     // Graceful degradation
};
```

### Cost Comparison (Per 1M Tokens)
| Provider | Input | Output | Use Case |
|----------|-------|--------|----------|
| **Google Gemini** | $0.075 | $0.30 | ✅ Primary (cheapest) |
| **OpenRouter** | ~$0.50 | ~$2.00 | ✅ Fallback (still cheap) |
| **Anthropic Direct** | $3.00 | $15.00 | ❌ Too expensive for high volume |

### ⚠️ CRITICAL CONCERN: Claude Desktop Conflict

**Bruce's Question**: "Won't Claude Desktop using Anthropic API shut down our usage since we're already 90% Claude data?"

**Answer**: YES, this is a real concern. Here's the issue:

```
Current Setup (Web UI):
- AI calls go through OUR server
- WE control provider ladder (Gemini → OpenRouter)
- WE pay minimal costs (~$0.10/month)

If We Naively Use Claude Desktop:
- Claude Desktop calls Anthropic API directly
- ANTHROPIC controls the AI (Sonnet 4.5)
- We pay Anthropic's premium rates ($3-15 per 1M tokens)
- Could easily hit $20-50/month
```

### ✅ SOLUTION: Hybrid Architecture

**Strategy**: Make Claude Desktop call OUR API endpoints, not Anthropic directly.

```
┌─────────────────────┐
│  Claude Desktop     │
│  (MCP Client)       │
└──────────┬──────────┘
           │
           │ MCP Protocol
           │
           ▼
┌─────────────────────────────────┐
│  bruceops_mcp_server.py         │
│  (Calls OUR API, not Anthropic) │
└──────────┬──────────────────────┘
           │
           │ HTTPS (Token Auth)
           │
           ▼
┌─────────────────────────────────────┐
│  harriswildlands.com/api/*          │
│  (Our existing AI ladder)           │
│  Gemini → OpenRouter → Offline      │
└──────────┬──────────────────────────┘
           │
           │ (We choose provider)
           │
           ▼
┌──────────────────────┐
│  Gemini API          │ ← Cheapest option!
│  (Not Anthropic)     │
└──────────────────────┘
```

**Why This Works**:
- Claude Desktop acts as **interface only** (no AI calls)
- MCP server calls **our API endpoints**
- Our API uses **Gemini/OpenRouter** (cheap)
- We maintain **same cost structure** (~$0.10/month)
- Claude Desktop just formats/displays responses

**Important**: The "Bruce™" personality lives in the MCP server's prompts, NOT in Claude Desktop's AI model. Claude Desktop is just the chat interface.

---

## 🎯 YOUR TASKS (Replit Agent)

### Task 1: API Token Management System (60 min)

**Goal**: Allow users to generate API tokens for MCP server authentication

#### 1.1 Database Schema
**File**: `shared/schema.ts`

Add new table:
```typescript
export const apiTokens = pgTable('api_tokens', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  token: text('token').notNull().unique(),
  name: text('name'), // e.g., "Claude Desktop - Main Computer"
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastUsed: timestamp('last_used'),
  expiresAt: timestamp('expires_at'), // null = never expires
});
```

**Action**: Add this to schema file, then run `npm run db:push`

---

#### 1.2 Storage Functions
**File**: `server/storage.ts`

Add these functions:
```typescript
import crypto from 'crypto';

export async function createApiToken(userId: string, name?: string) {
  const token = crypto.randomBytes(32).toString('hex');
  
  await db.insert(apiTokens).values({
    userId,
    token,
    name: name || 'Unnamed Token',
    createdAt: new Date(),
    lastUsed: null,
    expiresAt: null
  });
  
  return token; // Return plain token ONLY on creation
}

export async function getApiTokens(userId: string) {
  return await db.select()
    .from(apiTokens)
    .where(eq(apiTokens.userId, userId))
    .orderBy(desc(apiTokens.createdAt));
}

export async function validateApiToken(token: string): Promise<string | null> {
  const results = await db.select()
    .from(apiTokens)
    .where(eq(apiTokens.token, token))
    .limit(1);
  
  if (results.length === 0) return null;
  
  const tokenData = results[0];
  
  // Check expiration
  if (tokenData.expiresAt && new Date() > tokenData.expiresAt) {
    return null;
  }
  
  // Update last used
  await db.update(apiTokens)
    .set({ lastUsed: new Date() })
    .where(eq(apiTokens.id, tokenData.id));
  
  return tokenData.userId;
}

export async function revokeApiToken(userId: string, tokenId: number) {
  return await db.delete(apiTokens)
    .where(
      and(
        eq(apiTokens.id, tokenId),
        eq(apiTokens.userId, userId)
      )
    );
}
```

---

#### 1.3 API Endpoints
**File**: `server/routes.ts`

Add these endpoints BEFORE the `return httpServer;` line:

```typescript
// ============================================================================
// API TOKEN MANAGEMENT (for MCP / Claude Desktop)
// ============================================================================

// Generate new token
app.post('/api/settings/tokens', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { name } = req.body;
    
    const token = await storage.createApiToken(userId, name);
    
    res.json({
      token,
      message: 'Token generated. Copy now - you will not see it again!',
      warning: 'Store this token securely. It grants full access to your data.'
    });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List user's tokens (without revealing actual token values)
app.get('/api/settings/tokens', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const tokens = await storage.getApiTokens(userId);
    
    // Don't return actual token values
    const safetokens = tokens.map(t => ({
      id: t.id,
      name: t.name,
      createdAt: t.createdAt,
      lastUsed: t.lastUsed,
      expiresAt: t.expiresAt,
      preview: t.token.substring(0, 8) + '...' // First 8 chars only
    }));
    
    res.json(safetokens);
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Revoke token
app.delete('/api/settings/tokens/:tokenId', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const tokenId = parseInt(req.params.tokenId);
    
    await storage.revokeApiToken(userId, tokenId);
    
    res.json({ message: 'Token revoked successfully' });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Token authentication middleware (alternative to session auth)
async function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const userId = await storage.validateApiToken(token);
  
  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  // Attach userId to request (same as isAuthenticated does)
  req.userId = userId;
  next();
}

// Dual-auth middleware (accepts EITHER session OR token)
function authenticateDual(req: any, res: any, next: any) {
  // Check for session first (web UI)
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  // Fall back to token auth (MCP server)
  return authenticateToken(req, res, next);
}
```

---

#### 1.4 Update Existing Endpoints to Support Token Auth

**CRITICAL**: Change all existing endpoints from `isAuthenticated` to `authenticateDual`

**Find and replace**:
```typescript
// OLD (only session auth)
app.get('/api/logs', isAuthenticated, async (req, res) => {

// NEW (session OR token auth)
app.get('/api/logs', authenticateDual, async (req, res) => {
```

**Apply to ALL protected endpoints**:
- `/api/logs*`
- `/api/ideas*`
- `/api/goals*`
- `/api/checkins*`
- `/api/review/*`
- `/api/export/*`
- `/api/teaching*`
- `/api/harris*`
- `/api/dashboard`
- `/api/me`

**Exception**: Keep `isAuthenticated` ONLY on:
- `/api/settings/tokens*` (token management itself should require session)

---

### Task 2: Settings UI for Token Management (45 min)

**File**: `client/src/pages/Settings.tsx`

Add this section to the Settings page:

```tsx
const TokenManagement = () => {
  const [tokens, setTokens] = useState<any[]>([]);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState('');
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  
  useEffect(() => {
    loadTokens();
  }, []);
  
  const loadTokens = async () => {
    const res = await fetch('/api/settings/tokens');
    const data = await res.json();
    setTokens(data);
  };
  
  const generateToken = async () => {
    const res = await fetch('/api/settings/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tokenName || 'Unnamed Token' })
    });
    
    const data = await res.json();
    setNewToken(data.token);
    setShowTokenDialog(true);
    setTokenName('');
    
    await loadTokens();
  };
  
  const revokeToken = async (tokenId: number) => {
    if (!confirm('Revoke this token? Claude Desktop will lose access.')) return;
    
    await fetch(`/api/settings/tokens/${tokenId}`, {
      method: 'DELETE'
    });
    
    await loadTokens();
  };
  
  const copyToken = () => {
    navigator.clipboard.writeText(newToken!);
    alert('Token copied to clipboard!');
  };
  
  return (
    <div className="token-management-section">
      <h2 className="text-xl font-bold mb-2">🔑 API Tokens (Claude Desktop)</h2>
      <p className="text-sm text-slate-400 mb-4">
        Generate tokens to allow Claude Desktop to access your BruceOps data via MCP.
      </p>
      
      <div className="generate-token mb-6">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Token name (e.g., 'Main Computer')"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded"
          />
          <button
            onClick={generateToken}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
          >
            Generate Token
          </button>
        </div>
      </div>
      
      {showTokenDialog && newToken && (
        <div className="token-dialog mb-6 p-4 bg-yellow-900/20 border-2 border-yellow-500 rounded">
          <h3 className="font-bold text-yellow-300 mb-2">⚠️ Save This Token Now!</h3>
          <p className="text-sm mb-3">You will not be able to see this token again.</p>
          
          <div className="bg-slate-900 p-3 rounded font-mono text-sm break-all mb-3 border border-slate-700">
            {newToken}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={copyToken}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-semibold"
            >
              📋 Copy Token
            </button>
            <button
              onClick={() => setShowTokenDialog(false)}
              className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-semibold"
            >
              Done
            </button>
          </div>
          
          <div className="mt-3 p-3 bg-slate-800 rounded text-sm">
            <p className="font-bold mb-1">Next Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>Copy the token above</li>
              <li>Set environment variable: <code className="bg-slate-900 px-1">BRUCEOPS_API_TOKEN</code></li>
              <li>Start MCP server: <code className="bg-slate-900 px-1">python bruceops_mcp_server.py</code></li>
              <li>Open Claude Desktop</li>
            </ol>
          </div>
        </div>
      )}
      
      <div className="tokens-list">
        <h3 className="font-bold mb-2">Active Tokens</h3>
        {tokens.length === 0 ? (
          <p className="text-sm text-slate-500">No active tokens</p>
        ) : (
          <div className="space-y-2">
            {tokens.map(token => (
              <div key={token.id} className="flex items-center justify-between bg-slate-800 p-3 rounded border border-slate-700">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{token.name}</span>
                    <span className="font-mono text-xs bg-slate-900 px-2 py-0.5 rounded">
                      {token.preview}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Created: {new Date(token.createdAt).toLocaleDateString()}
                    {token.lastUsed && (
                      <span className="ml-3">
                        Last used: {new Date(token.lastUsed).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => revokeToken(token.id)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-semibold"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded text-sm">
        <p className="font-bold text-blue-300 mb-1">💡 How This Works</p>
        <ul className="list-disc list-inside space-y-1 text-slate-300">
          <li>Tokens allow Claude Desktop to access your data</li>
          <li>Same data as web UI, different authentication method</li>
          <li>You can use both simultaneously (web + desktop)</li>
          <li>Revoke tokens anytime if security is compromised</li>
        </ul>
      </div>
    </div>
  );
};

// Add <TokenManagement /> to your Settings page render
```

---

### Task 3: Cost-Optimized AI Endpoints (Already Exist - Verify)

**DO NOT CHANGE** the existing AI provider ladder. Just verify it's working:

**File**: `server/routes.ts`

Confirm this function exists and uses **Gemini first**, NOT Anthropic:

```typescript
async function callAI(prompt: string, provider?: string): Promise<string> {
  const aiProvider = provider || process.env.AI_PROVIDER || 'gemini';
  
  try {
    if (aiProvider === 'gemini' && process.env.GOOGLE_GEMINI_API_KEY) {
      // Gemini implementation (KEEP THIS - cheapest option)
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );
      
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
      
    } else if (process.env.OPENROUTER_API_KEY) {
      // OpenRouter fallback (KEEP THIS - still cheaper than Anthropic direct)
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-thinking-exp:free', // Free model!
          messages: [{ role: 'user', content: prompt }]
        })
      });
      
      const data = await response.json();
      return data.choices[0].message.content;
      
    } else {
      // Graceful degradation
      throw new Error('AI disabled: No API keys configured');
    }
    
  } catch (error: any) {
    console.error('AI Error:', error);
    throw error;
  }
}
```

**CRITICAL**: This function should NEVER call Anthropic API directly. Our costs stay low because we use Gemini/OpenRouter.

---

### Task 4: Update Health Endpoint (10 min)

**File**: `server/routes.ts`

Update `/api/health` to show token auth status:

```typescript
app.get('/api/health', async (req, res) => {
  try {
    // Test DB connection
    const dbResult = await db.select().from(logs).limit(1);
    
    // Check AI provider
    const aiProvider = process.env.AI_PROVIDER || 'gemini';
    const aiConfigured = !!(
      process.env.GOOGLE_GEMINI_API_KEY || 
      process.env.OPENROUTER_API_KEY
    );
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      ai: {
        provider: aiProvider,
        configured: aiConfigured,
        fallback: process.env.OPENROUTER_API_KEY ? 'openrouter' : 'none'
      },
      auth: {
        session: 'replit-oidc',
        token: 'enabled' // New: indicates token auth is available
      },
      environment: process.env.NODE_ENV || 'development'
    });
    
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});
```

---

## 🧪 TESTING REQUIREMENTS

After implementation, verify:

### Test 1: Token Generation
```bash
# In browser (logged in)
1. Go to Settings
2. Enter token name: "Test Token"
3. Click "Generate Token"
4. Verify token appears (long hex string)
5. Copy token
6. Verify token shows in "Active Tokens" list
```

### Test 2: Token Authentication
```bash
# In terminal
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  https://harriswildlands.com/api/logs

# Expected: JSON array of logs (not 401 error)
```

### Test 3: Session Auth Still Works
```bash
# In browser (logged in)
1. Navigate to LifeOps
2. Create a log entry
3. Verify it saves
4. Check Dashboard
5. Verify data displays

# Session auth should NOT be broken
```

### Test 4: Dual Access
```bash
# Browser: Keep logged in
# Terminal: 
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://harriswildlands.com/api/logs

# Both should return same data
```

### Test 5: Token Revocation
```bash
# Browser:
1. Settings → Active Tokens
2. Click "Revoke" on test token
3. Confirm

# Terminal:
curl -H "Authorization: Bearer REVOKED_TOKEN" \
  https://harriswildlands.com/api/logs

# Expected: 401 Unauthorized
```

### Test 6: Cost Verification
```bash
# Check that AI calls still use Gemini
# NOT Anthropic

curl https://harriswildlands.com/api/health

# Verify response shows:
# "ai": { "provider": "gemini", ... }
```

---

## 📊 SUCCESS CRITERIA

Implementation is complete when:

✅ **Database**:
- [ ] `api_tokens` table exists
- [ ] Schema pushed successfully

✅ **Backend**:
- [ ] Token generation endpoint works
- [ ] Token validation middleware works
- [ ] All endpoints support BOTH session AND token auth
- [ ] AI provider ladder unchanged (Gemini → OpenRouter)

✅ **Frontend**:
- [ ] Settings page has token management UI
- [ ] Can generate tokens with custom names
- [ ] Can view active tokens
- [ ] Can revoke tokens

✅ **Security**:
- [ ] Tokens are hashed/secure
- [ ] Token values only shown ONCE on creation
- [ ] Revoked tokens immediately stop working

✅ **Testing**:
- [ ] Can login via browser (session auth)
- [ ] Can call API with token (token auth)
- [ ] Both work simultaneously
- [ ] Health endpoint confirms setup

---

## 🚨 CRITICAL WARNINGS

### DO NOT:
❌ **Change the AI provider ladder** (we specifically use Gemini/OpenRouter for cost)
❌ **Add Anthropic API calls** (too expensive)
❌ **Break existing session authentication** (web UI must still work)
❌ **Expose token values in GET requests** (security risk)
❌ **Remove rate limiting** (cost protection)

### DO:
✅ **Test both auth methods** (session + token)
✅ **Verify AI costs stay low** (check health endpoint)
✅ **Add token name/description** (helps users manage multiple tokens)
✅ **Update last_used timestamp** (track token activity)
✅ **Keep existing CORS settings** (don't break web UI)

---

## 💡 CONTEXT FOR YOUR UNDERSTANDING

### Why Dual Auth?
- **Web UI** = Humans need visual interface (session cookies work great)
- **Claude Desktop** = MCP protocol doesn't support cookies (needs tokens)
- **Same database** = No sync issues, real-time access from both

### Why Not Just Use Anthropic API?
- **Cost**: $3-15 per 1M tokens (vs $0.075-0.30 for Gemini)
- **Volume**: We expect high usage (daily logging, idea capture)
- **Budget**: Bruce is cost-conscious (~$0.10/month target)

### How This Avoids Claude Desktop Cost Trap
```
❌ BAD (Expensive):
Claude Desktop → Anthropic API directly → $$$

✅ GOOD (Cheap):
Claude Desktop → Our API → Gemini → $
```

Claude Desktop is just the **interface**. The actual AI calls go through OUR server, where WE control the provider.

---

## 📝 IMPLEMENTATION CHECKLIST

Copy this checklist to track progress:

```
Phase 1: Backend Infrastructure
[ ] Add api_tokens table to schema
[ ] Run npm run db:push
[ ] Add storage functions (create/get/validate/revoke)
[ ] Add token generation endpoint
[ ] Add token list endpoint  
[ ] Add token revoke endpoint
[ ] Add authenticateToken middleware
[ ] Add authenticateDual middleware
[ ] Update all protected endpoints to use authenticateDual
[ ] Update health endpoint
[ ] Test: Generate token via Postman/curl

Phase 2: Frontend UI
[ ] Add TokenManagement component to Settings
[ ] Add token generation form
[ ] Add token display dialog (one-time show)
[ ] Add active tokens list
[ ] Add revoke button
[ ] Add usage instructions
[ ] Test: Generate token via UI
[ ] Test: Copy token to clipboard
[ ] Test: Revoke token via UI

Phase 3: Verification
[ ] Test session auth still works (login via browser)
[ ] Test token auth works (curl with Bearer token)
[ ] Test dual access (both simultaneously)
[ ] Test token revocation
[ ] Verify AI provider is still Gemini (check /api/health)
[ ] Verify no Anthropic API calls being made
[ ] Check logs for errors
[ ] Confirm costs are still low (~$0.10/month)

Phase 4: Documentation
[ ] Update README with token setup instructions
[ ] Add environment variable docs
[ ] Note cost implications in docs
```

---

## 🔗 REFERENCE MATERIALS

Attached separately:
- **DUAL_ACCESS_SETUP.md** - Complete user-facing guide
- **AI_COLLABORATION_LOG.md** - Context on AI insights
- **UPGRADE_ROADMAP_v1.0.md** - Future feature plans

---

## 🎯 FINAL NOTES FOR REPLIT AGENT

**Your Goal**: Enable Bruce to use both Web UI AND Claude Desktop without:
1. Breaking existing functionality
2. Increasing costs
3. Creating security vulnerabilities

**Your Constraint**: Keep costs at ~$0.10/month by maintaining Gemini/OpenRouter provider ladder.

**Your Success Metric**: Bruce can ask Claude Desktop "What's my energy trend?" and get a response using Gemini AI (not Anthropic), while simultaneously being logged into harriswildlands.com in his browser.

**Time Estimate**: 3-4 hours total coding + testing

**Questions?**: If anything is unclear about the architecture or requirements, ask before implementing. Bruce is cost-conscious and security-aware - both matter equally.

---

**Ready to build? Let's ship this! 🚀**
