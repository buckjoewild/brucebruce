import { useEffect, useMemo, useRef, useState } from "react";

type LogLine = {
  id: string;
  text: string;
};

function formatLines(payload: string): string[] {
  try {
    const parsed = JSON.parse(payload);
    if (parsed?.text) return String(parsed.text).split("\n");
  } catch {}
  return String(payload).split("\n");
}

export default function MudTerminal() {
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [name, setName] = useState("Wanderer");
  const [input, setInput] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const viewRef = useRef<HTMLDivElement | null>(null);

  const wsUrl = useMemo(() => {
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    return `${proto}://${window.location.host}/mud/ws`;
  }, []);

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.scrollTop = viewRef.current.scrollHeight;
    }
  }, [logs]);

  const pushLines = (lines: string[]) => {
    setLogs((prev) => [
      ...prev,
      ...lines.filter(Boolean).map((text) => ({ id: crypto.randomUUID(), text })),
    ]);
  };

  const connect = () => {
    if (socketRef.current) return;
    setStatus("connecting");
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      ws.send(JSON.stringify({ command: name }));
      pushLines([`[system] Connected to MUD as ${name}`]);
    };
    ws.onmessage = (ev) => {
      const lines = formatLines(ev.data);
      pushLines(lines);
    };
    ws.onclose = () => {
      socketRef.current = null;
      setStatus("disconnected");
      pushLines(["[system] Disconnected"]);
    };
    ws.onerror = () => {
      pushLines(["[system] Connection error"]);
    };
  };

  const disconnect = () => {
    socketRef.current?.close();
  };

  const send = (command: string) => {
    if (!command.trim()) return;
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      pushLines(["[system] Not connected"]);
      return;
    }
    ws.send(JSON.stringify({ command }));
    pushLines([`> ${command}`]);
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    send(input);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-green-200 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-mono tracking-tight text-green-100">Harris Wildlands MUD</h1>
            <p className="text-sm text-green-400">ASCII terminal connected to the living world</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              className="bg-black border border-green-800 text-green-200 px-3 py-2 font-mono text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Player name"
            />
            {status !== "connected" ? (
              <button className="bg-green-700 text-black px-4 py-2 font-mono text-sm" onClick={connect}>
                Connect
              </button>
            ) : (
              <button className="bg-red-700 text-white px-4 py-2 font-mono text-sm" onClick={disconnect}>
                Disconnect
              </button>
            )}
          </div>
        </div>

        <div
          ref={viewRef}
          className="bg-black border border-green-900 rounded-md p-4 h-[60vh] overflow-y-auto font-mono text-sm leading-relaxed"
        >
          {logs.length === 0 ? (
            <div className="text-green-700">No output yet. Connect to begin.</div>
          ) : (
            logs.map((l) => (
              <div key={l.id} className="whitespace-pre-wrap">
                {l.text}
              </div>
            ))
          )}
        </div>

        <form onSubmit={onSubmit} className="mt-4 flex gap-2">
          <input
            className="flex-1 bg-black border border-green-800 text-green-200 px-3 py-2 font-mono text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command (look, go north, say hello)"
          />
          <button className="bg-green-700 text-black px-4 py-2 font-mono text-sm" type="submit">
            Send
          </button>
        </form>

        <div className="mt-4 text-xs text-green-700 font-mono">
          Status: {status} • Endpoint: /mud/ws
        </div>
      </div>
    </div>
  );
}
