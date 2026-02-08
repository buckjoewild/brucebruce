/**
 * BruceOps API Client
 * Shared HTTP client for BruceOps integration
 */

const BRUCEOPS_API_BASE = process.env.BRUCEOPS_API_BASE || "http://localhost:5000";
const BRUCEOPS_TOKEN = process.env.BRUCEOPS_API_TOKEN;

/**
 * Make authenticated request to BruceOps API
 */
async function bruceopsRequest(endpoint, options = {}) {
  if (!BRUCEOPS_TOKEN) {
    throw new Error("BRUCEOPS_API_TOKEN environment variable is not set. Please configure it in ~/.openclaw/.env");
  }
  
  const url = `${BRUCEOPS_API_BASE}${endpoint}`;
  const headers = {
    "Authorization": `Bearer ${BRUCEOPS_TOKEN}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...options.headers
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`BruceOps API error ${response.status}: ${errorText}`);
    }
    
    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    
    return { success: true, status: response.status };
  } catch (error) {
    console.error(`BruceOps API request failed: ${error.message}`);
    throw error;
  }
}

/**
 * Format log entry for display
 */
function formatLog(log) {
  const vices = [];
  if (log.vaping) vices.push("🚬");
  if (log.alcohol) vices.push("🍺");
  if (log.junkFood) vices.push("🍔");
  if (log.doomScrolling) vices.push("📱");
  if (log.lateScreens) vices.push("💻");
  if (log.skippedMeals) vices.push("🍽️");
  if (log.excessCaffeine) vices.push("☕");
  
  const virtues = [];
  if (log.exercise) virtues.push("💪");
  
  return {
    date: log.date,
    energy: log.energy ? `${log.energy}/10` : "?",
    stress: log.stress ? `${log.stress}/10` : "?",
    mood: log.mood ? `${log.mood}/10` : "?",
    sleep: log.sleepQuality ? `${log.sleepQuality}/10` : "?",
    vices: vices.length > 0 ? vices.join(" ") : "None",
    virtues: virtues.length > 0 ? virtues.join(" ") : "None",
    topWin: log.topWin || "Not recorded",
    topFriction: log.topFriction || "Not recorded"
  };
}

/**
 * Format idea for display
 */
function formatIdea(idea) {
  const statusEmoji = {
    draft: "📝",
    reality_checked: "🔍",
    parked: "🅿️",
    promoted: "🚀",
    shipped: "✅",
    discarded: "🗑️"
  };
  
  return {
    id: idea.id,
    title: idea.title,
    status: `${statusEmoji[idea.status] || "❓"} ${idea.status}`,
    category: idea.category,
    excitement: idea.excitement ? `${idea.excitement}/10` : "?",
    feasibility: idea.feasibility ? `${idea.feasibility}/10` : "?",
    priority: "⭐".repeat(idea.priority || 0)
  };
}

/**
 * Format goal for display
 */
function formatGoal(goal) {
  const domainEmoji = {
    faith: "✝️",
    family: "👨‍👩‍👧‍👦",
    work: "💼",
    health: "❤️",
    logistics: "📋",
    property: "🏠",
    ideas: "💡",
    discipline: "🎯"
  };
  
  return {
    id: goal.id,
    title: goal.title,
    domain: `${domainEmoji[goal.domain] || "📌"} ${goal.domain}`,
    priority: goal.priority === 1 ? "🔴 High" : goal.priority === 2 ? "🟡 Medium" : "🟢 Low",
    weeklyMinimum: goal.weeklyMinimum,
    status: goal.status
  };
}

module.exports = {
  bruceopsRequest,
  formatLog,
  formatIdea,
  formatGoal,
  BRUCEOPS_API_BASE,
  BRUCEOPS_TOKEN
};
