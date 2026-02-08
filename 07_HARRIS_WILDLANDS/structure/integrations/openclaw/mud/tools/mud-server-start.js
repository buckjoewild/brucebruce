#!/usr/bin/env node
/**
 * Tool: mud-server-start
 * Start Harris Wilderness MUD server
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const serverPath = 'C:\\Users\\wilds\\harriswildlands.com\\structure\\mud-server\\src\\server.py';
const pidFile = 'C:\\Users\\wilds\\.openclaw\\workspace\\tmp\\mud-server.pid';

function isRunning(pid){
  try { process.kill(pid, 0); return true; } catch { return false; }
}

function main(){
  if (fs.existsSync(pidFile)) {
    const pid = parseInt(fs.readFileSync(pidFile,'utf-8'),10);
    if (pid && isRunning(pid)) {
      console.log(JSON.stringify({status:'running', pid, message:'MUD server already running.'}, null, 2));
      return;
    }
  }

  const child = spawn('python', [serverPath], {
    detached: true,
    stdio: 'ignore'
  });

  child.unref();
  fs.mkdirSync(path.dirname(pidFile), { recursive: true });
  fs.writeFileSync(pidFile, String(child.pid));

  console.log(JSON.stringify({status:'started', pid: child.pid, message:'MUD server started.'}, null, 2));
}

main();
