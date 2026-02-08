#!/usr/bin/env node
/**
 * Tool: bruceops-ai-search
 * Smart AI-powered search across BruceOps data
 */

const { bruceopsRequest } = require("../lib/api-client");

const args = process.argv.slice(2);
const query = args.find(arg => arg.startsWith("--query="))?.split("=")[1];
const limit = parseInt(args.find(arg => arg.startsWith("--limit="))?.split("=")[1]) || 10;

async function main() {
  try {
    if (!query) {
      console.error("Usage: bruceops-ai-search --query=\"search terms\" [--limit=10]");
      process.exit(1);
    }
    
    console.error(`Searching for: ${query}`);
    
    const result = await bruceopsRequest("/api/ai/search", {
      method: "POST",
      body: JSON.stringify({ query, limit })
    });
    
    const output = {
      query,
      matches: result.count,
      cached: result.cached,
      quotaRemaining: result.quotaRemaining,
      insight: result.insight,
      samples: result.samples,
      summary: `🔍 AI Search Results for "${query}"

Found ${result.count} matches${result.cached ? " (cached)" : ""}
AI Insight: ${result.insight}
Quota remaining: ${result.quotaRemaining} calls` + 
      (result.samples.length > 0 ? "\n\nRecent matches:\n" + result.samples.slice(0, 3).map(s => 
        `• ${s.date}: Energy ${s.energy}, Mood ${s.mood} - ${s.topWin?.substring(0, 50)}...`
      ).join("\n") : "")
    };
    
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    console.error("AI search failed:", error.message);
    process.exit(1);
  }
}

main();
