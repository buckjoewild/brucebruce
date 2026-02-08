import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import swaggerUi from "swagger-ui-express";
import { generateWorkingOpenAPISpec } from "./working-openapi";
import { getObservability, reportFatalError } from "./observability";
import { setupMudProxy } from "./mud-proxy";

const app = express();
const httpServer = createServer(app);
const observability = getObservability();

httpServer.on("upgrade", (req) => {
  console.log(`HTTP upgrade: ${req.url ?? "unknown"}`);
});

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

app.use(observability.requestLogger);
app.get("/api/status", observability.requireObservabilityToken, observability.statusHandler);
app.get("/api/metrics", observability.requireObservabilityToken, observability.metricsHandler);
app.get("/mud/ping", (_req, res) => {
  res.status(200).send("ok");
});

// ============================================
// SWAGGER UI - API DOCUMENTATION
// ============================================
try {
  const openApiSpec = generateWorkingOpenAPISpec();
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'BruceOps API Documentation',
    swaggerOptions: {
      persistAuthorization: false, // Public access - no auth persistence needed
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      docExpansion: 'none', // Start with all endpoints collapsed
      defaultModelsExpandDepth: 2, // Show schemas by default
    },
  }));
  
  // Also serve the raw OpenAPI specification
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(openApiSpec);
  });
  
  console.log('📚 API Documentation available at /api-docs');
  console.log('📄 OpenAPI specification available at /api-docs.json');
} catch (error) {
  console.warn('⚠️  Failed to initialize API documentation:', error);
  console.log('   Server will continue without API docs');
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const routedServer = await registerRoutes(httpServer, app);
  const serverToUse = routedServer ?? httpServer;
  setupMudProxy(serverToUse);
  console.log(`HTTP upgrade listeners: ${serverToUse.listenerCount("upgrade")}`);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    observability.errorHandler(err, _req, res, _next);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else if (process.env.SKIP_VITE === "true") {
    console.log("Skipping Vite setup (SKIP_VITE=true).");
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(serverToUse, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "127.0.0.1";
  serverToUse.listen(port, host, () => {
    log(`serving on http://${host}:${port}`);
  });
})();

process.on("unhandledRejection", (reason) => {
  void reportFatalError("unhandledRejection", reason);
});

process.on("uncaughtException", (error) => {
  void reportFatalError("uncaughtException", error);
  process.exit(1);
});
