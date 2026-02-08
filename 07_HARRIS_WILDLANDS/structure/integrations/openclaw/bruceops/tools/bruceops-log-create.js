#!/usr/bin/env node
/**
 * Tool: bruceops-log-create
 * Create a new daily log entry
 */

const { bruceopsRequest } = require("../lib/api-client");

// Parse arguments
const args = process.argv.slice(2);
const getArg = (name) => args.find(arg => arg.startsWith(`--${name}=`))?.split("=")[1];

async function main() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const logData = {
      date: getArg("date") || today,
      energy: parseInt(getArg("energy")) || null,
      stress: parseInt(getArg("stress")) || null,
      mood: parseInt(getArg("mood")) || null,
      focus: parseInt(getArg("focus")) || null,
      sleepQuality: parseInt(getArg("sleepQuality")) || null,
      sleepHours: parseInt(getArg("sleepHours")) || null,
      moneyPressure: parseInt(getArg("moneyPressure")) || null,
      connection: parseInt(getArg("connection")) || null,
      exercise: getArg("exercise") === "true",
      vaping: getArg("vaping") === "true",
      alcohol: getArg("alcohol") === "true",
      junkFood: getArg("junkFood") === "true",
      doomScrolling: getArg("doomScrolling") === "true",
      lateScreens: getArg("lateScreens") === "true",
      skippedMeals: getArg("skippedMeals") === "true",
      excessCaffeine: getArg("excessCaffeine") === "true",
      dayType: getArg("dayType") || null,
      primaryEmotion: getArg("primaryEmotion") || null,
      winCategory: getArg("winCategory") || null,
      timeDrain: getArg("timeDrain") || null,
      topWin: getArg("topWin") || null,
      topFriction: getArg("topFriction") || null,
      tomorrowPriority: getArg("tomorrowPriority") || null
    };
    
    // Remove null values
    Object.keys(logData).forEach(key => {
      if (logData[key] === null || logData[key] === false) delete logData[key];
    });
    
    console.error("Creating log entry...", logData);
    
    const result = await bruceopsRequest("/api/logs", {
      method: "POST",
      body: JSON.stringify(logData)
    });
    
    const output = {
      success: true,
      log: result,
      summary: `✅ Log created for ${logData.date}
Energy: ${logData.energy || "?"}/10 | Stress: ${logData.stress || "?"}/10 | Mood: ${logData.mood || "?"}/10
Top Win: ${logData.topWin || "Not recorded"}`
    };
    
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    console.error("Failed to create log:", error.message);
    process.exit(1);
  }
}

main();
