import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";
import { authStorage } from "./storage";

const isReplitEnvironment = () => {
  return !!process.env.REPL_ID && !!process.env.ISSUER_URL;
};

// Check if running in standalone mode (explicit or inferred)
const isStandaloneMode = () => {
  return process.env.STANDALONE_MODE === "true" || !isReplitEnvironment();
};

// Standalone user for self-hosted deployments
const STANDALONE_USER = {
  claims: {
    sub: "standalone-user",
    email: "user@localhost",
    first_name: "Local",
    last_name: "User",
    profile_image_url: null,
  },
  access_token: "standalone-token",
  expires_at: Math.floor(Date.now() / 1000) + 86400 * 365, // 1 year
};

const getOidcConfig = memoize(
  async () => {
    if (!isReplitEnvironment()) {
      throw new Error("OIDC not available outside Replit environment");
    }
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const secret = process.env.SESSION_SECRET || "development-secret-change-me";
  
  let store;
  if (process.env.DATABASE_URL) {
    try {
      const pgStore = connectPg(session);
      store = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        ttl: sessionTtl,
        tableName: "sessions",
      });
    } catch (error) {
      console.warn("Failed to create PostgreSQL session store, using memory store:", error);
      const MemStore = MemoryStore(session);
      store = new MemStore({ checkPeriod: sessionTtl });
    }
  } else {
    console.warn("DATABASE_URL not set, using memory session store");
    const MemStore = MemoryStore(session);
    store = new MemStore({ checkPeriod: sessionTtl });
  }

  return session({
    secret,
    store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  if (isStandaloneMode()) {
    console.log("===========================================");
    console.log("STANDALONE MODE ACTIVE");
    console.log("Auto-login enabled - no authentication required");
    console.log("All data stored under 'standalone-user'");
    console.log("===========================================");
    
    // Upsert the standalone user into the database
    try {
      await authStorage.upsertUser({
        id: STANDALONE_USER.claims.sub,
        email: STANDALONE_USER.claims.email,
        firstName: STANDALONE_USER.claims.first_name,
        lastName: STANDALONE_USER.claims.last_name,
        profileImageUrl: STANDALONE_USER.claims.profile_image_url,
      });
    } catch (e) {
      console.log("Note: Could not upsert standalone user (database may not be ready)");
    }

    // Auto-login middleware: inject standalone user into every request
    app.use((req, _res, next) => {
      if (!req.user) {
        req.user = STANDALONE_USER;
        // @ts-ignore - standalone mode doesn't need proper type predicate
        req.isAuthenticated = () => true;
      }
      next();
    });

    app.get("/api/login", (_req, res) => {
      res.redirect("/");
    });

    app.get("/api/callback", (_req, res) => {
      res.redirect("/");
    });

    app.get("/api/logout", (_req, res) => {
      res.redirect("/");
    });

    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));
    
    return;
  }

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  const registeredStrategies = new Set<string>();

  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // In standalone mode, user is always authenticated
  if (isStandaloneMode()) {
    if (!req.user) {
      req.user = STANDALONE_USER;
    }
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
