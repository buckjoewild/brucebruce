#!/usr/bin/env node
/**
 * Tool: bruceops-goals
 * Fetch active goals from BruceOps
 */

const { bruceopsRequest, formatGoal } = require("../lib/api-client");

const args = process.argv.slice(2);
const domain = args.find(arg => arg.startsWith("--domain="))?.split("=")[1];

async function main() {
  try {
    console.error("Fetching goals...");
    
    const goals = await bruceopsRequest("/api/goals");
    
    let filteredGoals = goals.filter(g => g.status === "active");
    if (domain) {
      filteredGoals = filteredGoals.filter(g => g.domain === domain);
    }
    
    const formattedGoals = filteredGoals.map(formatGoal);
    
    // Fetch checkins for progress calculation
    const checkins = await bruceopsRequest("/api/checkins");
    
    const goalsWithProgress = formattedGoals.map(goal => {
      const goalCheckins = checkins.filter(c => c.goalId === goal.id);
      const completed = goalCheckins.filter(c => c.done).length;
      const total = goalCheckins.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        ...goal,
        progress: `${completed}/${total} (${rate}%)`
      };
    });
    
    const output = {
      count: goalsWithProgress.length,
      goals: goalsWithProgress,
      summary: goalsWithProgress.map(g => 
        `${g.id}: ${g.domain} ${g.priority} "${g.title}" [${g.progress}]`
      ).join("\n")
    };
    
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    console.error("Failed to fetch goals:", error.message);
    process.exit(1);
  }
}

main();
