#!/usr/bin/env node

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const COOKIE_JAR = new Map();

let passed = 0;
let failed = 0;
let skipped = 0;
let isStandalone = false;

function log(status, step, details = '') {
  const icons = {
    PASS: '\x1b[32m✓\x1b[0m',
    FAIL: '\x1b[31m✗\x1b[0m',
    SKIP: '\x1b[33m○\x1b[0m',
    INFO: '\x1b[36mℹ\x1b[0m',
  };
  console.log(`${icons[status] || '•'} ${step}${details ? ': ' + details : ''}`);
}

function extractCookies(response) {
  const rawCookies = response.headers.getSetCookie?.() || [];
  rawCookies.forEach(cookie => {
    const [nameValue] = cookie.split(';');
    const eqIndex = nameValue.indexOf('=');
    if (eqIndex > 0) {
      const name = nameValue.slice(0, eqIndex).trim();
      const value = nameValue.slice(eqIndex + 1).trim();
      COOKIE_JAR.set(name, value);
    }
  });
}

function getCookieHeader() {
  return Array.from(COOKIE_JAR.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

async function request(method, path, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': getCookieHeader(),
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(`${BASE_URL}${path}`, options);
  extractCookies(response);
  return response;
}

async function step(name, fn, { critical = true } = {}) {
  try {
    await fn();
    log('PASS', name);
    passed++;
    return true;
  } catch (error) {
    if (critical) {
      log('FAIL', name, error.message);
      failed++;
    } else {
      log('SKIP', name, error.message);
      skipped++;
    }
    return false;
  }
}

async function verify() {
  console.log('\n========================================');
  console.log('  HarrisWildlands Golden Path Verification');
  console.log('========================================\n');
  console.log(`Target: ${BASE_URL}\n`);

  let userId = null;
  let testLogId = null;

  await step('1. Health check', async () => {
    const res = await request('GET', '/api/health');
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(`Status: ${data.status}`);
    isStandalone = data.standalone_mode;
    console.log(`   Mode: ${isStandalone ? 'Standalone' : 'Replit'}, DB: ${data.database}, AI: ${data.ai_status}`);
  });

  const authResult = await step('2. Authentication', async () => {
    const res = await request('GET', '/api/auth/user');
    if (!res.ok) {
      if (isStandalone) {
        throw new Error(`Status ${res.status} - Standalone auth failed`);
      } else {
        throw new Error(`Status ${res.status} - Login to Replit first, or run in standalone mode`);
      }
    }
    const data = await res.json();
    userId = data.id;
    if (!userId) throw new Error('No user ID returned');
    console.log(`   User: ${data.firstName || 'Local'} ${data.lastName || 'User'} (${userId})`);
  }, { critical: isStandalone });

  if (!userId) {
    console.log('\n\x1b[33m⚠ Auth not available - skipping data tests\x1b[0m');
    console.log('  To run full verification:');
    console.log('  - Standalone: Set STANDALONE_MODE=true in your environment');
    console.log('  - Replit: Log in via the browser first\n');
  } else {
    await step('3. Create test log entry', async () => {
      const testLog = {
        content: `[VERIFY] Golden path test at ${new Date().toISOString()}`,
        lane: 'lifeops',
        tags: ['verify', 'test'],
      };
      const res = await request('POST', '/api/logs', testLog);
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Status ${res.status}: ${err}`);
      }
      const data = await res.json();
      testLogId = data.id;
      if (!testLogId) throw new Error('No log ID returned');
      console.log(`   Created log #${testLogId}`);
    });

    await step('4. Retrieve log entry', async () => {
      const res = await request('GET', '/api/logs');
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const logs = await res.json();
      if (!Array.isArray(logs)) throw new Error('Expected array of logs');
      const found = logs.find(l => l.id === testLogId);
      if (!found) throw new Error(`Log #${testLogId} not found in response`);
      console.log(`   Retrieved ${logs.length} logs, verified test log exists`);
    });

    await step('5. Data export', async () => {
      const res = await request('GET', '/api/export/data');
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.logs) throw new Error('Export missing logs array');
      if (!data.exportedAt) throw new Error('Export missing timestamp');
      console.log(`   Export contains ${data.logs?.length || 0} logs, ${data.goals?.length || 0} goals`);
    });

    await step('6. Clean up test log', async () => {
      const res = await request('DELETE', `/api/logs/${testLogId}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      console.log(`   Deleted test log #${testLogId}`);
    });
  }

  console.log('\n========================================');
  const total = passed + failed + skipped;
  
  if (failed === 0 && skipped === 0) {
    console.log(`  \x1b[32mPASS\x1b[0m - All ${passed} checks passed`);
    console.log('========================================\n');
    console.log('Golden path verified. Ready to ship.\n');
    process.exit(0);
  } else if (failed === 0) {
    console.log(`  \x1b[33mPARTIAL\x1b[0m - ${passed} passed, ${skipped} skipped`);
    console.log('========================================\n');
    console.log('Core systems healthy. Full verification requires authentication.\n');
    process.exit(0);
  } else {
    console.log(`  \x1b[31mFAIL\x1b[0m - ${failed} failed, ${passed} passed, ${skipped} skipped`);
    console.log('========================================\n');
    console.log('Fix issues before shipping.\n');
    process.exit(1);
  }
}

verify().catch(err => {
  console.error('\n\x1b[31mVerification crashed:\x1b[0m', err.message);
  process.exit(1);
});
