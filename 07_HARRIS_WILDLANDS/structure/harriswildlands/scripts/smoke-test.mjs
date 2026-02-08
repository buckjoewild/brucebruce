#!/usr/bin/env node

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:5000";
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 5000);

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function run() {
  const checks = [
    { name: "health", url: `${BASE_URL}/api/health` },
    { name: "health-detailed", url: `${BASE_URL}/api/health/detailed` },
    { name: "status", url: `${BASE_URL}/api/status` },
  ];

  let failures = 0;

  for (const check of checks) {
    try {
      const res = await fetchWithTimeout(check.url);
      if (!res.ok) {
        failures += 1;
        console.error(`❌ ${check.name} failed: HTTP ${res.status}`);
        continue;
      }
      const body = await res.json();
      console.log(`✅ ${check.name} ok`, body.status || "ok");
    } catch (error) {
      failures += 1;
      console.error(`❌ ${check.name} failed:`, error.message || error);
    }
  }

  if (failures > 0) {
    console.error(`Smoke test failed: ${failures} checks failed.`);
    process.exit(1);
  }

  console.log("✅ Smoke test passed.");
}

run();
