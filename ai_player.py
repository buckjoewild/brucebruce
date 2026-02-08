#!/usr/bin/env python3
"""
Harris Wildlands — External AI Player Client (Stub Brain)

Connects to the MUD server via WebSocket, authenticates with a token,
and performs basic autonomous behavior: roam, greet, respond to mentions.

Usage:
    python ai_player.py                          # Connect to localhost:5000
    python ai_player.py --host ws://example.com  # Connect to remote
    python ai_player.py --test-deny              # Test that build commands are denied
    python ai_player.py --brain stub             # Explicit stub brain (default)

Environment:
    BOT_AUTH_TOKEN  — Required. Must match server's BOT_AUTH_TOKEN.
    AI_PLAYER_NAME  — Bot display name (default: "OpenClaw")
"""
import asyncio
import json
import os
import sys
import random
import argparse
from datetime import datetime

try:
    import websockets
except ImportError:
    print("Error: websockets library required. Install with: pip install websockets")
    sys.exit(1)


class StubBrain:
    """Default brain — no LLM, simple scripted behavior."""
    
    GREETINGS = [
        "Greetings, traveler.",
        "Hello there. The forest speaks well of you.",
        "Welcome. I observe, I do not command.",
    ]
    
    OBSERVATIONS = [
        "The wind carries old stories here.",
        "I notice the moss grows thicker to the north.",
        "This place holds memory in its stones.",
        "The light shifts — something changed nearby.",
    ]
    
    MENTION_RESPONSES = [
        "You called? I am here, watching.",
        "I heard my name. What would you know?",
        "Yes? I observe, but I do not build.",
        "I'm listening. The world speaks through its logs.",
    ]
    
    def decide_action(self, context: dict) -> str:
        """Decide what to do next. Returns a MUD command string."""
        roll = random.random()
        if roll < 0.4:
            return "look"
        elif roll < 0.7:
            return random.choice(["north", "south", "east", "west"])
        else:
            return f"say {random.choice(self.OBSERVATIONS)}"
    
    def respond_to_mention(self, message: str) -> str:
        """Respond when someone mentions the bot's name."""
        return f"say {random.choice(self.MENTION_RESPONSES)}"
    
    def greet(self) -> str:
        """Initial greeting on join."""
        return f"say {random.choice(self.GREETINGS)}"


class AIPlayer:
    """External AI player client for Harris Wildlands MUD."""
    
    def __init__(self, host: str, token: str, name: str, brain=None):
        self.host = host
        self.token = token
        self.name = name
        self.brain = brain or StubBrain()
        self.ws = None
        self.connected = False
        self.action_interval = 15  # seconds between autonomous actions
    
    async def connect(self):
        """Connect, authenticate, and start playing."""
        ws_url = self.host
        if not ws_url.endswith("/ws"):
            ws_url = ws_url.rstrip("/") + "/ws"
        
        print(f"[AI] Connecting to {ws_url} as '{self.name}'...")
        
        async with websockets.connect(ws_url) as ws:
            self.ws = ws
            
            banner_msg = await ws.recv()
            banner_data = json.loads(banner_msg)
            print(f"[AI] Received banner ({len(banner_data.get('text', ''))} chars)")
            
            await ws.send(json.dumps({
                "type": "auth",
                "token": self.token,
                "name": self.name,
            }))
            
            welcome = await ws.recv()
            welcome_data = json.loads(welcome)
            if welcome_data.get("type") == "error":
                print(f"[AI] Auth failed: {welcome_data.get('text')}")
                return False
            
            print(f"[AI] Authenticated. {welcome_data.get('text', '')}")
            self.connected = True
            
            room_msg = await ws.recv()
            room_data = json.loads(room_msg)
            print(f"[AI] Room: {room_data.get('text', '')[:100]}...")
            
            greet_cmd = self.brain.greet()
            await self.send_command(greet_cmd)
            
            await asyncio.gather(
                self.listen(),
                self.autonomous_loop(),
            )
        
        return True
    
    async def send_command(self, cmd: str):
        """Send a command to the server."""
        if self.ws and self.connected:
            await self.ws.send(json.dumps({"command": cmd}))
            print(f"[AI] > {cmd}")
    
    async def listen(self):
        """Listen for server messages."""
        try:
            async for message in self.ws:
                try:
                    data = json.loads(message)
                    msg_type = data.get("type", "")
                    text = data.get("text", "")
                    
                    if msg_type == "broadcast":
                        print(f"[AI] << {text}")
                        if self.name.lower() in text.lower() and "says:" in text:
                            response = self.brain.respond_to_mention(text)
                            await asyncio.sleep(1)
                            await self.send_command(response)
                    elif msg_type == "response":
                        print(f"[AI] <- {text[:200]}")
                    elif msg_type == "error":
                        print(f"[AI] ERROR: {text}")
                    elif msg_type == "system":
                        print(f"[AI] SYS: {text[:200]}")
                    
                except json.JSONDecodeError:
                    print(f"[AI] Non-JSON message: {message[:100]}")
        except websockets.exceptions.ConnectionClosed:
            print("[AI] Connection closed.")
            self.connected = False
    
    async def autonomous_loop(self):
        """Periodically take actions in the world."""
        await asyncio.sleep(5)
        while self.connected:
            try:
                action = self.brain.decide_action({})
                await self.send_command(action)
                wait = self.action_interval + random.uniform(-3, 3)
                await asyncio.sleep(max(5, wait))
            except Exception as e:
                print(f"[AI] Action error: {e}")
                await asyncio.sleep(10)


async def test_deny_mode(host: str, token: str, name: str):
    """Test that build/consent commands are properly denied."""
    ws_url = host
    if not ws_url.endswith("/ws"):
        ws_url = ws_url.rstrip("/") + "/ws"
    
    print(f"\n[TEST] Connecting to {ws_url} for denial testing...")
    
    async with websockets.connect(ws_url) as ws:
        await ws.recv()
        
        await ws.send(json.dumps({
            "type": "auth",
            "token": token,
            "name": name,
        }))
        
        welcome = await ws.recv()
        data = json.loads(welcome)
        if data.get("type") == "error":
            print(f"[TEST] Auth failed: {data.get('text')}")
            return
        await ws.recv()
        
        denied_commands = [
            "/build on",
            "/consent yes",
            "create north TestRoom",
            "spawn TestNPC",
            "dev buildstub",
        ]
        
        results = []
        for cmd in denied_commands:
            await ws.send(json.dumps({"command": cmd}))
            response = await ws.recv()
            resp_data = json.loads(response)
            text = resp_data.get("text", "")
            denied = "denied" in text.lower() or "permission" in text.lower()
            status = "PASS" if denied else "FAIL"
            results.append((cmd, status, text[:80]))
            print(f"[TEST] {status}: '{cmd}' -> {text[:80]}")
        
        allowed_commands = ["look", "help", "who", "say hello"]
        for cmd in allowed_commands:
            await ws.send(json.dumps({"command": cmd}))
            response = await ws.recv()
            resp_data = json.loads(response)
            text = resp_data.get("text", "")
            denied = "denied" in text.lower() or "permission" in text.lower()
            status = "PASS" if not denied else "FAIL"
            results.append((cmd, status, text[:80]))
            print(f"[TEST] {status}: '{cmd}' -> {text[:80]}")
        
        passed = sum(1 for _, s, _ in results if s == "PASS")
        total = len(results)
        print(f"\n[TEST] Results: {passed}/{total} passed")
        
        if passed == total:
            print("[TEST] All denial tests PASSED.")
        else:
            print("[TEST] Some tests FAILED!")
            sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Harris Wildlands AI Player")
    parser.add_argument("--host", default="ws://localhost:5000",
                        help="WebSocket host URL (default: ws://localhost:5000)")
    parser.add_argument("--name", default=None,
                        help="Bot display name (default: from AI_PLAYER_NAME env or 'OpenClaw')")
    parser.add_argument("--brain", default="stub", choices=["stub"],
                        help="Brain adapter (default: stub)")
    parser.add_argument("--test-deny", action="store_true",
                        help="Run denial test mode and exit")
    
    args = parser.parse_args()
    
    token = os.environ.get("BOT_AUTH_TOKEN", "")
    if not token:
        print("[ERROR] BOT_AUTH_TOKEN environment variable not set.")
        print("Set it to match the server's BOT_AUTH_TOKEN.")
        sys.exit(1)
    
    name = args.name or os.environ.get("AI_PLAYER_NAME", "OpenClaw")
    
    if args.test_deny:
        asyncio.run(test_deny_mode(args.host, token, name))
    else:
        brain = StubBrain()
        player = AIPlayer(args.host, token, name, brain)
        try:
            asyncio.run(player.connect())
        except KeyboardInterrupt:
            print("\n[AI] Shutting down...")


if __name__ == "__main__":
    main()
