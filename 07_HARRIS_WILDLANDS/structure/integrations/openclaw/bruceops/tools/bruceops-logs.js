#!/usr/bin/env node
/**
 * Tool: bruceops-logs
 * Fetch daily logs from BruceOps
 */

const { bruceopsRequest, formatLog } = require("../lib/api-client");

// Parse command line arguments
const args = process.argv.slice(2);
const limit = parseInt(args.find(arg => arg.startsWith("--limit"))?.split("=")[1]) || 5;

async function main() {
  try {
    console.error(`Fetching last ${limit} logs...`);
    
    const logs = await bruceopsRequest("/api/logs");
    const recentLogs = logs.slice(0, limit);
    
    const formattedLogs = recentLogs.map(formatLog);
    
    const output = {
      count: recentLogs.length,
      logs: formattedLogs,
      summary: formattedLogs.map(log => 
        `${log.date}: Energy ${log.energy}, Stress ${log.stress}, Mood ${log.mood} | ${log.virtues} ${log.vices}`
      ).join("\n")
    };
    
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    console.error("Failed to fetch logs:", error.message);
    process.exit(1);
  }
}

main();
