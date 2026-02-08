#!/usr/bin/env node
/**
 * Tool: bruceops-weekly-review
 * Generate weekly goal review with drift flags
 */

const { bruceopsRequest } = require("../lib/api-client");

async function main() {
  try {
    console.error("Generating weekly review...");
    
    const review = await bruceopsRequest("/api/review/weekly");
    
    const output = {
      period: `${review.stats.startDate} to ${review.stats.endDate}`,
      completionRate: `${review.stats.completionRate}%`,
      checkins: {
        total: review.stats.totalCheckins,
        completed: review.stats.completedCheckins,
        missedDays: review.stats.missedDays
      },
      goals: review.goals.map(g => ({
        id: g.id,
        title: g.title,
        domain: g.domain,
        priority: g.priority
      })),
      driftFlags: review.driftFlags || [],
      summary: `📊 Weekly Review (${review.stats.startDate} to ${review.stats.endDate})

Completion Rate: ${review.stats.completionRate}%
Check-ins: ${review.stats.completedCheckins}/${review.stats.totalCheckins} (${review.stats.missedDays} days missed)

Active Goals: ${review.goals.length}
${review.goals.map(g => `• [${g.domain}] ${g.title}`).join("\n")}

${review.driftFlags.length > 0 ? `⚠️ Drift Flags:\n${review.driftFlags.map(f => `• ${f}`).join("\n")}` : "✅ No drift flags this week"}`
    };
    
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    console.error("Failed to generate weekly review:", error.message);
    process.exit(1);
  }
}

main();
