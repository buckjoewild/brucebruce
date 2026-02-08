#!/usr/bin/env node
/**
 * Tool: mud-server-stop
 * Stop Harris Wilderness MUD server
 */
const fs = require('fs');

const pidFile = 'C:\\Users\\wilds\\.openclaw\\workspace\\tmp\\mud-server.pid';

function main(){
  if (!fs.existsSync(pidFile)) {
    console.log(JSON.stringify({status:'stopped', message:'No PID file found.'}, null, 2));
    return;
  }

  const pid = parseInt(fs.readFileSync(pidFile,'utf-8'),10);
  if (!pid) {
    console.log(JSON.stringify({status:'stopped', message:'Invalid PID file.'}, null, 2));
    return;
  }

  try {
    process.kill(pid);
    fs.unlinkSync(pidFile);
    console.log(JSON.stringify({status:'stopped', pid, message:'MUD server stopped.'}, null, 2));
  } catch (err) {
    console.log(JSON.stringify({status:'error', pid, message: err.message}, null, 2));
  }
}

main();
