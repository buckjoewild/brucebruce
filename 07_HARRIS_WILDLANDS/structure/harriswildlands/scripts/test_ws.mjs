import WebSocket from "ws";

const url = process.argv[2] || "ws://127.0.0.1:5001/mud/ws";
const ws = new WebSocket(url);

const timeout = setTimeout(() => {
  console.error("timeout");
  ws.terminate();
  process.exit(2);
}, 2000);

ws.on("open", () => {
  console.log("open");
  clearTimeout(timeout);
  ws.close();
});

ws.on("error", (err) => {
  console.error("error", err.message);
  clearTimeout(timeout);
  process.exit(1);
});

ws.on("close", (code, reason) => {
  console.log("close", code, reason.toString());
  clearTimeout(timeout);
  process.exit(0);
});
