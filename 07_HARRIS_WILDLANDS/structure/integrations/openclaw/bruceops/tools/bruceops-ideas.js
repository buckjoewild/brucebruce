#!/usr/bin/env node
/**
 * Tool: bruceops-ideas
 * Fetch ideas from ThinkOps pipeline
 */

const { bruceopsRequest, formatIdea } = require("../lib/api-client");

const args = process.argv.slice(2);
const status = args.find(arg => arg.startsWith("--status="))?.split("=")[1];
const limit = parseInt(args.find(arg => arg.startsWith("--limit"))?.split("=")[1]) || 10;

async function main() {
  try {
    console.error("Fetching ideas...");
    
    const ideas = await bruceopsRequest("/api/ideas");
    
    let filteredIdeas = ideas;
    if (status) {
      filteredIdeas = ideas.filter(idea => idea.status === status);
    }
    
    const recentIdeas = filteredIdeas.slice(0, limit);
    const formattedIdeas = recentIdeas.map(formatIdea);
    
    const output = {
      count: formattedIdeas.length,
      total: ideas.length,
      ideas: formattedIdeas,
      summary: formattedIdeas.map(idea =>
        `${idea.id}: ${idea.title} ${idea.status} ${idea.priority}`
      ).join("\n")
    };
    
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    console.error("Failed to fetch ideas:", error.message);
    process.exit(1);
  }
}

main();
