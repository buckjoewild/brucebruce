import type { Server as HttpServer, IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";

type MudProxyOptions = {
  backendUrl?: string;
  path?: string;
};

export function setupMudProxy(
  httpServer: HttpServer,
  options: MudProxyOptions = {},
) {
  const backendUrl = options.backendUrl ?? process.env.MUD_BACKEND_URL ?? "ws://127.0.0.1:4008";
  const path = options.path ?? "/mud/ws";

  console.log(`MUD proxy: path=${path} backend=${backendUrl}`);

  const wss = new WebSocketServer({ server: httpServer, path });

  wss.on("connection", (client: WebSocket, _req: IncomingMessage) => {
    console.log("MUD proxy: client connected");
    const upstream = new WebSocket(backendUrl);

    const closeBoth = () => {
      try { client.close(); } catch {}
      try { upstream.close(); } catch {}
    };

    upstream.on("open", () => {
      // pass-through once connected
    });

    upstream.on("message", (data) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data.toString());
      }
    });

    upstream.on("close", () => closeBoth());
    upstream.on("error", () => closeBoth());

    client.on("message", (data) => {
      if (upstream.readyState === WebSocket.OPEN) {
        upstream.send(data.toString());
      }
    });

    client.on("close", () => closeBoth());
    client.on("error", () => closeBoth());
  });
}
