const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

export const demoLogs = [
  {
    id: 1,
    userId: "demo-user",
    date: formatDate(today),
    createdAt: today.toISOString(),
    energy: 7,
    stress: 4,
    mood: 8,
    focus: 7,
    sleepQuality: 8,
    moneyPressure: 3,
    connection: 6,
    vaping: false,
    alcohol: false,
    junkFood: true,
    doomScrolling: false,
    lateScreens: true,
    skippedMeals: false,
    excessCaffeine: true,
    exercise: true,
    dayType: "work",
    primaryEmotion: "focused",
    winCategory: "productivity",
    timeDrain: "meetings",
    topWin: "Completed the feature overhaul for BruceOps",
    topFriction: "Too many context switches between tasks",
    tomorrowPriority: "Deploy to production and test everything",
    familyConnection: "Had dinner together as a family",
    faithAlignment: "Morning prayer and gratitude practice",
    driftCheck: "Staying aligned with priorities",
    aiSummary: "Good productive day with high energy. Maintained focus despite some context switching. Family connection was strong. Minor vices (junk food, late screens, excess caffeine) to watch.",
  },
  {
    id: 2,
    userId: "demo-user",
    date: formatDate(yesterday),
    createdAt: yesterday.toISOString(),
    energy: 5,
    stress: 6,
    mood: 6,
    focus: 5,
    sleepQuality: 6,
    moneyPressure: 5,
    connection: 7,
    vaping: false,
    alcohol: true,
    junkFood: false,
    doomScrolling: true,
    lateScreens: false,
    skippedMeals: false,
    excessCaffeine: false,
    exercise: false,
    dayType: "weekend",
    primaryEmotion: "peaceful",
    winCategory: "family",
    timeDrain: "social-media",
    topWin: "Quality time with kids at the park",
    topFriction: "Spent too much time on phone in the morning",
    tomorrowPriority: "Start the week strong with morning routine",
    familyConnection: "Park adventure with the whole family",
    faithAlignment: "Church service was meaningful",
    driftCheck: "Need to be more present, less phone",
  }
];

export const demoIdeas = [
  {
    id: 1,
    userId: "demo-user",
    title: "AI-Powered Daily Journaling",
    pitch: "Build a journaling app that uses AI to identify patterns and provide insights on emotional trends over time.",
    category: "tech",
    captureMode: "deep",
    status: "promoted",
    audience: "Busy professionals who want self-improvement",
    painPoint: "Hard to maintain consistent journaling habits",
    excitement: 9,
    feasibility: 7,
    tinyTest: "Create a simple prompt-based journal for one week",
    realityCheck: { decision: "Strong potential. Personal development market is growing. Start with MVP." },
    milestones: ["Design UI", "Build backend", "Add AI analysis"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    userId: "demo-user",
    title: "Family Adventure Tracker",
    pitch: "An app to plan, track, and remember family adventures and outdoor activities.",
    category: "family",
    captureMode: "quick",
    status: "draft",
    tinyTest: "Track next 3 family outings manually",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    userId: "demo-user",
    title: "Scripture Memory System",
    pitch: "Spaced repetition system specifically designed for memorizing Bible verses with context.",
    category: "faith",
    captureMode: "quick",
    status: "reality-checked",
    realityCheck: { decision: "Good personal project. Could help others in faith community." },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const demoContent = [
  {
    id: 1,
    userId: "demo-user",
    contentType: "social",
    tone: "inspirational",
    template: "adventure-call",
    topic: "Weekend hiking adventures",
    generatedContent: "The trail calls to those who listen. This weekend, we ventured into the wild and found more than just beautiful views - we found ourselves. Nature has a way of stripping away the noise and revealing what truly matters. #HarrisWildlands #FamilyAdventure #NatureHeals",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const demoGoals = [
  {
    id: 1,
    userId: "demo-user",
    title: "Morning Routine",
    description: "Complete full morning routine before work: prayer, exercise, planning",
    domain: "health",
    status: "active",
    priority: 1,
    weeklyMinimum: 5,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    userId: "demo-user",
    title: "Family Dinner",
    description: "Eat dinner together as a family with no screens",
    domain: "family",
    status: "active",
    priority: 2,
    weeklyMinimum: 5,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    userId: "demo-user",
    title: "Daily Scripture",
    description: "Read and reflect on scripture each morning",
    domain: "faith",
    status: "active",
    priority: 1,
    weeklyMinimum: 7,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    userId: "demo-user",
    title: "Exercise",
    description: "At least 30 minutes of intentional movement",
    domain: "health",
    status: "active",
    priority: 2,
    weeklyMinimum: 4,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const demoCheckins = [
  { id: 1, userId: "demo-user", goalId: 1, date: formatDate(today), done: true, score: 8, note: "Great morning!" },
  { id: 2, userId: "demo-user", goalId: 2, date: formatDate(today), done: true, score: 9, note: "Pizza night together" },
  { id: 3, userId: "demo-user", goalId: 3, date: formatDate(today), done: true, score: 7, note: "Psalm 23" },
  { id: 4, userId: "demo-user", goalId: 4, date: formatDate(today), done: true, score: 8, note: "30 min run" },
  { id: 5, userId: "demo-user", goalId: 1, date: formatDate(yesterday), done: false, note: "Overslept" },
  { id: 6, userId: "demo-user", goalId: 2, date: formatDate(yesterday), done: true, score: 8 },
  { id: 7, userId: "demo-user", goalId: 3, date: formatDate(yesterday), done: true, score: 9, note: "Great study session" },
];

export const demoTeachingRequests = [
  {
    id: 1,
    userId: "demo-user",
    gradeLevel: "6th Grade",
    subject: "Mathematics",
    topic: "Introduction to Fractions",
    standards: "CCSS.MATH.CONTENT.6.NS.A.1",
    duration: 45,
    objectives: "Students will understand equivalent fractions and simplify fractions to lowest terms",
    generatedPlan: {
      warmup: "Quick review of multiplication facts - 5 minutes",
      instruction: "Visual introduction using fraction bars and pizza diagrams - 15 minutes",
      guidedPractice: "Work through 5 example problems as a class - 10 minutes",
      independentPractice: "Individual worksheet with 10 problems - 10 minutes",
      closure: "Exit ticket with 2 problems and self-assessment - 5 minutes"
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const demoSettings = {
  theme: "field",
  aiModel: "gpt-4o-mini",
  bruceContext: "Faith-centered father of three, high school teacher, aspiring creator. Values family time, personal growth, and building meaningful projects. Currently focused on launching BruceOps as a personal operating system."
};
