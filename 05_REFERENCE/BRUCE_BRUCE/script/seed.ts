import { storage } from "../server/storage";

async function seed() {
  console.log("Seeding database...");

  // LifeOps Log
  await storage.createLog({
    date: new Date().toISOString().split('T')[0],
    sleepHours: 7,
    energy: 8,
    stress: 4,
    mood: 8,
    vaping: false,
    exercise: true,
    familyConnection: "Played board games with kids",
    topWin: "Finished the API design",
    topFriction: "Context switching",
    tomorrowPriority: "Frontend integration",
    faithAlignment: "Morning prayer was good",
    moneyPressure: 3,
    driftCheck: "None today",
  });
  console.log("Seeded LifeOps Log");

  // ThinkOps Idea
  await storage.createIdea({
    title: "Family Ops Dashboard",
    pitch: "A digital command center for family logistics and meal planning.",
    whoItHelps: "Parents with 2+ kids",
    painItSolves: "Mental load of remembering schedule and groceries",
    whyICare: "I live this pain every day",
    tinyTest: "Paper prototype on fridge for 3 days",
    status: "parked",
  });
  console.log("Seeded ThinkOps Idea");

  // Teaching Request
  await storage.createTeachingRequest({
    grade: "5th",
    standard: "NGSS 5-LS1-1",
    topic: "Photosynthesis",
    timeBlock: "45 minutes",
    materials: "Beans, paper towels, ziploc bags, water, sunny window",
    studentProfile: "Mixed ability, 3 ELL students",
    constraints: "Low prep, hands-on",
    assessmentType: "Exit ticket",
    format: "Printable",
  }, {
    lessonOutline: "1. Intro (5m), 2. Bean Setup (20m), 3. Diagram (15m), 4. Exit Ticket (5m)",
    handsOnActivity: "Bean Sprout Window Garden",
    exitTicket: ["What do plants need?", "Where do they get energy?"],
    prepList: ["Buy beans", "Get ziploc bags"]
  });
  console.log("Seeded Teaching Request");

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
