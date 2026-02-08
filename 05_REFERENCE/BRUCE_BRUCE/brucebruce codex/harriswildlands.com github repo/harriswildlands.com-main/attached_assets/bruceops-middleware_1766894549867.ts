// ==================== RATE LIMITING & CORS SETUP ====================
// Add these imports at the TOP of server/routes.ts

import rateLimit from 'express-rate-limit';

// ==================== CORS CONFIGURATION ====================
// Add this RIGHT AFTER setupAuth(app) in registerRoutes function

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Setup Replit Auth FIRST
  await setupAuth(app);
  registerAuthRoutes(app);

  // ==================== CORS MIDDLEWARE (Add here) ====================
  const allowedOrigins = [
    'https://claude.ai',
    'https://www.claude.ai',
    'http://localhost:3000',
    'http://localhost:5000',
  ];

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Allow requests from allowed origins or no origin (same-origin)
    if (!origin || allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-token');
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    next();
  });

  console.log('✅ CORS enabled for:', allowedOrigins);

  // ==================== RATE LIMITING ====================
  
  // General API rate limit (100 requests per 15 minutes)
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // AI endpoint rate limit (10 requests per minute - stricter)
  const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: { 
      error: 'AI rate limit exceeded. Maximum 10 requests per minute.',
      tip: 'Responses are cached for 24 hours - repeated queries are free!'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Custom key generator to rate limit per user
    keyGenerator: (req) => {
      return getUserId(req) || req.ip;
    }
  });

  // Apply general rate limiter to all API routes
  app.use('/api/', generalLimiter);

  // Apply AI rate limiter to AI endpoints specifically
  app.use('/api/ai/', aiLimiter);

  console.log('✅ Rate limiting enabled:');
  console.log('   - General: 100 req/15min');
  console.log('   - AI: 10 req/min per user');

  // ==================== HEALTH CHECK (NO AUTH, NO RATE LIMIT) ====================
  // Your existing health check code stays here...
  app.get("/api/health", async (_req, res) => {
    // ... existing code
  });

  // Continue with your existing routes...
  // ... rest of your code
}
