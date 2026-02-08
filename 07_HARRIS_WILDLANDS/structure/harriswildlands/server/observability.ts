import fs from "fs";
import path from "path";
import os from "os";
import type { Request, Response, NextFunction } from "express";

const LOG_DIR = process.env.LOG_DIR || path.resolve(process.cwd(), "logs");
const OBSERVABILITY_TOKEN = process.env.OBSERVABILITY_TOKEN || "";
const ALERT_WEBHOOK_URL = process.env.ALERT_WEBHOOK_URL || "";
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";
const EMAIL_ALERT_WEBHOOK_URL = process.env.EMAIL_ALERT_WEBHOOK_URL || "";
const SLOW_REQUEST_MS = Number(process.env.SLOW_REQUEST_MS || 2000);

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function logFileName(prefix: string) {
  const date = new Date().toISOString().slice(0, 10);
  return path.join(LOG_DIR, `${prefix}-${date}.log`);
}

function writeLog(prefix: string, message: string) {
  try {
    ensureLogDir();
    const line = `${new Date().toISOString()} ${message}${os.EOL}`;
    fs.appendFileSync(logFileName(prefix), line, "utf8");
  } catch (error) {
    console.warn("Failed to write log", error);
  }
}

async function postWebhook(url: string, payload: Record<string, any>) {
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    writeLog("alerts", `Failed to post webhook: ${String(error)}`);
  }
}

async function sendAlert(level: "info" | "warning" | "error", title: string, details: string) {
  const payload = {
    level,
    title,
    details,
    timestamp: new Date().toISOString(),
    host: os.hostname(),
  };

  if (ALERT_WEBHOOK_URL) {
    await postWebhook(ALERT_WEBHOOK_URL, payload);
  }

  if (DISCORD_WEBHOOK_URL) {
    await postWebhook(DISCORD_WEBHOOK_URL, {
      content: `**${level.toUpperCase()}** ${title}\n${details}`,
    });
  }

  if (EMAIL_ALERT_WEBHOOK_URL) {
    await postWebhook(EMAIL_ALERT_WEBHOOK_URL, payload);
  }
}

function percentile(values: number[], p: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, index))];
}

export type ObservabilitySnapshot = {
  startedAt: string;
  uptimeSeconds: number;
  requests: {
    total: number;
    success: number;
    clientError: number;
    serverError: number;
  };
  latencyMs: {
    p50: number;
    p95: number;
    p99: number;
  };
};

export function createObservability() {
  const startedAt = new Date();
  const latencies: number[] = [];
  const MAX_LATENCY_SAMPLES = 1000;
  let total = 0;
  let success = 0;
  let clientError = 0;
  let serverError = 0;

  function observeRequest(status: number, durationMs: number, method: string, url: string) {
    total += 1;
    if (status >= 500) serverError += 1;
    else if (status >= 400) clientError += 1;
    else success += 1;

    latencies.push(durationMs);
    if (latencies.length > MAX_LATENCY_SAMPLES) latencies.shift();

    const message = `${method} ${url} ${status} ${durationMs}ms`;
    writeLog("requests", message);

    if (durationMs >= SLOW_REQUEST_MS) {
      writeLog("slow-requests", message);
      void sendAlert("warning", "Slow request", message);
    }
  }

  function getSnapshot(): ObservabilitySnapshot {
    return {
      startedAt: startedAt.toISOString(),
      uptimeSeconds: Math.floor((Date.now() - startedAt.getTime()) / 1000),
      requests: { total, success, clientError, serverError },
      latencyMs: {
        p50: percentile(latencies, 50),
        p95: percentile(latencies, 95),
        p99: percentile(latencies, 99),
      },
    };
  }

  function requireObservabilityToken(req: Request, res: Response, next: NextFunction) {
    if (!OBSERVABILITY_TOKEN) return next();
    const token = req.headers["x-observability-token"] || req.headers["authorization"];
    if (typeof token === "string" && token.includes(OBSERVABILITY_TOKEN)) {
      return next();
    }
    return res.status(401).json({ error: "Observability token required" });
  }

  function requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      observeRequest(res.statusCode, duration, req.method, req.originalUrl);
    });
    next();
  }

  function statusHandler(req: Request, res: Response) {
    const snapshot = getSnapshot();
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      ...snapshot,
    });
  }

  function metricsHandler(req: Request, res: Response) {
    const snapshot = getSnapshot();
    const lines = [
      `bruceops_uptime_seconds ${snapshot.uptimeSeconds}`,
      `bruceops_requests_total ${snapshot.requests.total}`,
      `bruceops_requests_success ${snapshot.requests.success}`,
      `bruceops_requests_client_error ${snapshot.requests.clientError}`,
      `bruceops_requests_server_error ${snapshot.requests.serverError}`,
      `bruceops_latency_ms_p50 ${snapshot.latencyMs.p50}`,
      `bruceops_latency_ms_p95 ${snapshot.latencyMs.p95}`,
      `bruceops_latency_ms_p99 ${snapshot.latencyMs.p99}`,
    ];
    res.setHeader("Content-Type", "text/plain");
    res.send(lines.join("\n"));
  }

  function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    writeLog("errors", `HTTP ${status} ${message}`);
    void sendAlert("error", "Unhandled server error", `${status} ${message}`);
    res.status(status).json({ message });
  }

  return {
    requestLogger,
    requireObservabilityToken,
    statusHandler,
    metricsHandler,
    errorHandler,
    sendAlert,
    getSnapshot,
  };
}

let singleton: ReturnType<typeof createObservability> | null = null;

export function getObservability() {
  if (!singleton) {
    singleton = createObservability();
  }
  return singleton;
}

export async function reportFatalError(source: string, error: unknown) {
  const details = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  writeLog("fatal", `${source} ${details}`);
  await sendAlert("error", `Fatal error (${source})`, details);
}
