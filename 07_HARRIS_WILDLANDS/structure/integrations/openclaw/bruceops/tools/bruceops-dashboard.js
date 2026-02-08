#!/usr/bin/env node
/**
 * Tool: bruceops-dashboard
 * Get quick dashboard stats from BruceOps
 */

const { bruceopsRequest, formatLog } = require("../lib/api-client");

async function main() {
  try {
    console.error("Fetching BruceOps dashboard...");
    
    // Fetch dashboard stats
    const dashboard = await bruceopsRequest("/api/dashboard");
    
    // Fetch recent logs for context
    const logs = await bruceopsRequest("/api/logs");
    const recentLog = logs[0];
    
    // Format output
    const output = {
      stats: {
        logsToday: dashboard.logsToday,
        openLoops: dashboard.openLoops,
        driftFlags: dashboard.driftFlags || []
      },
      recentActivity: recentLog ? {
        lastLogDate: recentLog.date,
        lastEnergy: recentLog.energy,
        lastStress: recentLog.stress,
        lastMood: recentLog.mood
      } : null,
      summary: `📊 BruceOps Dashboard
• Logs today: ${dashboard.logsToday}
• Open idea loops: ${dashboard.openLoops}
• Drift flags: ${(dashboard.driftFlags || []).length > 0 ? (dashboard.driftFlags || []).join(", ") : "None"}`
    };
    
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    console.error("Failed to fetch dashboard:", error.message);
    process.exit(1);
  }
}

main();
