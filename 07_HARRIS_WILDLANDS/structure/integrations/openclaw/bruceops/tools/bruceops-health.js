#!/usr/bin/env node
/**
 * Tool: bruceops-health
 * Check BruceOps API connectivity and status
 */

const { bruceopsRequest, BRUCEOPS_API_BASE } = require("../lib/api-client");

async function main() {
  try {
    console.error("Checking BruceOps API health...");
    
    const health = await bruceopsRequest("/api/health");
    
    const output = {
      status: health.status,
      apiBase: BRUCEOPS_API_BASE,
      version: health.version,
      environment: health.environment,
      database: health.database,
      aiProvider: health.ai_provider,
      aiStatus: health.ai_status,
      summary: `🏥 BruceOps Health Check

Status: ${health.status === "ok" ? "✅ Healthy" : "⚠️ Degraded"}
API Base: ${BRUCEOPS_API_BASE}
Version: ${health.version}
Environment: ${health.environment}
Database: ${health.database}
AI Provider: ${health.ai_provider} (${health.ai_status})`
    };
    
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    console.error("BruceOps health check failed:", error.message);
    console.log(JSON.stringify({
      status: "error",
      error: error.message,
      apiBase: BRUCEOPS_API_BASE,
      summary: `❌ Failed to connect to BruceOps at ${BRUCEOPS_API_BASE}\nError: ${error.message}`
    }, null, 2));
    process.exit(1);
  }
}

main();
