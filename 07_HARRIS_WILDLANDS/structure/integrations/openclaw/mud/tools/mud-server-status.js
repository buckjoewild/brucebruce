#!/usr/bin/env node
/**
 * Tool: mud-server-status
 * Check Harris Wilderness MUD server status
 */
const fs = require('fs');

const pidFile = 'C:\\Users\\wilds\\.openclaw\\workspace\\tmp\\mud-server.pid';

function isRunning(pid){
  try { process.kill(pid, 0); return true; } catch { return false; }
}

function main(){
  if (!fs.existsSync(pidFile)) {
    console.log(JSON.stringify({status:'stopped', message:'No PID file found.'}, null, 2));
    return;
  }

  const pid = parseInt(fs.readFileSync(pidFile,'utf-8'),10);
  if (!pid) {
    console.log(JSON.stringify({status:'unknown', message:'Invalid PID file.'}, null, 2));
    return;
  }

  const running = isRunning(pid);
  console.log(JSON.stringify({status: running ? 'running' : 'stopped', pid, message: running ? 'MUD server is running.' : 'PID not running.'}, null, 2));
}

main();
