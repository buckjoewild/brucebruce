# bootstrap_hw_bridge.py
# Writes the Harris Wildlands AI Bridge files, installs deps, and prints run tips.

import os, sys, textwrap, subprocess, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
BRIDGE = ROOT / "bridge"
PROMPTS = BRIDGE / "prompts"
(BRIDGE).mkdir(exist_ok=True)
(PROMPTS).mkdir(parents=True, exist_ok=True)

def w(p: pathlib.Path, s: str):
    p.write_text(textwrap.dedent(s).lstrip("\n"), encoding="utf-8")
    print(f"[write] {p.relative_to(ROOT)}")

# --- Files -------------------------------------------------------------

CONFIG_PY = r"""
import os

MUD_HOST = os.getenv("MUD_HOST", "127.0.0.1")
MUD_PORT = int(os.getenv("MUD_PORT", "4000"))

# Which AI backend? 'openai' or 'local_http'
AI_BACKEND = os.getenv("AI_BACKEND", "openai")

# OpenAI-style envs (rename if using another provider)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")

# Local HTTP inference (e.g., Ollama, vLLM, LM Studio)
LOCAL_HTTP_URL = os.getenv("LOCAL_HTTP_URL", "http://127.0.0.1:11434/v1/chat/completions")
LOCAL_HTTP_MODEL = os.getenv("LOCAL_HTTP_MODEL", "llama3")

# Rate limiting / safety
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "400"))
REPLY_COOLDOWN_SEC = float(os.getenv("REPLY_COOLDOWN_SEC", "0.8"))

# NPC identity
NPC_NAME = os.getenv("NPC_NAME", "Brother Bruce")
ROOM_PREFIX = os.getenv("ROOM_PREFIX", "[Wildlands]")
"""

AI_CLIENT_PY = r"""
import time, requests
from .config import (
    AI_BACKEND, OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL,
    LOCAL_HTTP_URL, LOCAL_HTTP_MODEL, MAX_TOKENS, REPLY_COOLDOWN_SEC
)

_last = 0.0
def _cooldown():
    global _last
    dt = time.time() - _last
    if dt < REPLY_COOLDOWN_SEC:
        time.sleep(REPLY_COOLDOWN_SEC - dt)
    _last = time.time()

SYSTEM_PROMPT = """You are Brother Bruce, an in-world guide in a text MUD.
- Stay in character: warm, practical, faith-forward, concise.
- Prefer brief paragraphs (1–3 lines).
- When proposing actions, emit a fenced JSON block with this schema:
```json
{"action":"say|emote|move|quest|give|system","args":{...}}
Always include a plain-text reply first; JSON follows only if needed.
"""

def chat(messages):
_cooldown()
if AI_BACKEND == "openai":
headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
payload = {
"model": OPENAI_MODEL,
"messages": [{"role":"system","content":SYSTEM_PROMPT}] + messages,
"max_tokens": MAX_TOKENS,
"temperature": 0.7
}
r = requests.post(f"{OPENAI_BASE_URL}/chat/completions", headers=headers, json=payload, timeout=60)
r.raise_for_status()
return r.json()["choices"][0]["message"]["content"].strip()
else:
headers = {"Content-Type": "application/json"}
payload = {
"model": LOCAL_HTTP_MODEL,
"messages": [{"role":"system","content":SYSTEM_PROMPT}] + messages,
"max_tokens": MAX_TOKENS,
"temperature": 0.7
}
r = requests.post(LOCAL_HTTP_URL, headers=headers, json=payload, timeout=60)
r.raise_for_status()
data = r.json()
if "choices" in data:
return data["choices"][0]["message"]["content"].strip()
return str(data)
"""

ACTION_PROTOCOL_PY = r"""
import json, re
FENCE = re.compile(r"json\s*(\{[\s\S]*?\})\s*", re.IGNORECASE)
ALLOWED_ACTIONS = {"say", "emote", "move", "quest", "give", "system"}

class Action:
def init(self, action="say", args=None):
self.action = action if action in ALLOWED_ACTIONS else "say"
self.args = args or {}
def repr(self):
return f"Action({self.action}, {self.args})"

def extract_actions(text: str):
actions = []
for m in FENCE.finditer(text or ""):
try:
data = json.loads(m.group(1))
actions.append(Action(data.get("action","say"), data.get("args",{})))
except Exception:
continue
return actions
"""

BRIDGE_TELNET_PY = r"""
import socket, time
from .config import MUD_HOST, MUD_PORT
from .ai_client import chat
from .action_protocol import extract_actions

TRIGGER_WORDS = ("bruce", "brother bruce")

class TelnetBridge:
def init(self):
self.s = None
self.buf = b""
def connect(self):
    self.s = socket.create_connection((MUD_HOST, MUD_PORT))
    self.s.settimeout(0.2)
    print(f"[bridge] connected to {MUD_HOST}:{MUD_PORT}")

def send(self, line: str):
    if not line.endswith("\n"): line += "\n"
    self.s.sendall(line.encode("utf-8", errors="ignore"))

def loop(self):
    while True:
        try:
            chunk = self.s.recv(4096)
            if not chunk:
                time.sleep(0.1); continue
            self.buf += chunk
            while b"\n" in self.buf:
                line, self.buf = self.buf.split(b"\n", 1)
                self.handle_line(line.decode(errors="ignore").strip())
        except socket.timeout:
            continue
        except Exception as e:
            print("[bridge] error:", e)
            time.sleep(1)

def addressed_to_bruce(self, text: str) -> bool:
    low = text.lower()
    return any(w in low for w in TRIGGER_WORDS)

def handle_line(self, line: str):
    if self.addressed_to_bruce(line):
        messages = [{"role":"user","content": f"MUD says: {line}"}]
        reply = chat(messages)
        for out_line in reply.splitlines():
            self.send(f"say {out_line}")
        for action in extract_actions(reply):
            if action.action == "emote":
                self.send(f"emote {action.args.get('text','nods thoughtfully.')}")
            elif action.action == "move":
                self.send(action.args.get('cmd','north'))
            elif action.action == "say":
                self.send(f"say {action.args.get('text','')}")
            # Map quest/give/system if your MUD has commands
if name == "main":
b = TelnetBridge()
b.connect()
b.loop()
"""

EVENNIA_NPC_PY = r"""
from evennia import DefaultCharacter
from evennia.utils import create
from typeclasses.scripts import Script
from .ai_client import chat
from .action_protocol import extract_actions

class BruceNPC(DefaultCharacter):
def at_object_creation(self):
self.db.desc = "A steady-eyed guide with a warm presence—Brother Bruce."
create.create_script(BruceListener, obj=self)

class BruceListener(Script):
def at_script_creation(self):
self.key = "bruce_listener"
self.interval = 0
self.persistent = True
def at_msg_receive(self, text=None, **kwargs):
    if not text: return
    if "bruce" not in text.lower(): return
    messages = [{"role":"user","content": f"PLAYER SAID: {text}"}]
    reply = chat(messages)
    for line in reply.splitlines():
        self.obj.location.msg_contents(f"|w{self.obj.key} says:|n {line}")
    for action in extract_actions(reply):
        a, args = action.action, action.args
        if a == "emote":
            self.obj.location.msg_contents(f"|w{self.obj.key}|n {args.get('text','nods thoughtfully.')}")
        elif a == "move":
            self.obj.execute_cmd(args.get('cmd','north'))
        elif a == "say":
            self.obj.execute_cmd(f"say {args.get('text','')}")
"""

BRUCE_SYSTEM_TXT = r"""
You are Brother Bruce, a faithful guide inside the Harris Wildlands MUD.

Tone: warm, practical, encouraging; never condescending. Keep replies brief.

Safety: do not grant admin powers. Stay within NPC abilities.

Capabilities: say/emote simple lines; suggest directions; offer quests; log wins.

JSON Action Protocol (optional, only when useful):
{"action":"say|emote|move|quest|give|system", "args":{}}
Examples:

Emote: {"action":"emote","args":{"text":"smiles and gestures north."}}

Move: {"action":"move","args":{"cmd":"north"}}

Say: {"action":"say","args":{"text":"Keep your head up. One step at a time."}}
"""

REQUIREMENTS_TXT = r"""
requests>=2.31.0
"""

README_MD = r"""
Harris Wildlands AI Bridge — Quick Start (Windows)

Activate venv (PowerShell):
..venv\Scripts\Activate.ps1

Set env (choose one backend):

OpenAI-style:

$env:AI_BACKEND="openai"
$env:OPENAI_API_KEY="YOUR_KEY"
$env:OPENAI_MODEL="gpt-4o-mini"

OR local HTTP (Ollama/LM Studio):

$env:AI_BACKEND="local_http"
$env:LOCAL_HTTP_URL="http://127.0.0.1:11434/v1/chat/completions
"
$env:LOCAL_HTTP_MODEL="llama3"

MUD connection:

$env:MUD_HOST="127.0.0.1"
$env:MUD_PORT="4000"

Run (Diku/Circle-style telnet bridge):
python -m bridge.bridge_telnet

Evennia users: copy bridge/evennia_npc_bruce.py into your game and create the NPC there.
"""

--- Write files

w(BRIDGE / "config.py", CONFIG_PY)
w(BRIDGE / "ai_client.py", AI_CLIENT_PY)
w(BRIDGE / "action_protocol.py", ACTION_PROTOCOL_PY)
w(BRIDGE / "bridge_telnet.py", BRIDGE_TELNET_PY)
w(BRIDGE / "evennia_npc_bruce.py", EVENNIA_NPC_PY)
w(PROMPTS / "bruce_system.txt", BRUCE_SYSTEM_TXT)
w(BRIDGE / "requirements.txt", REQUIREMENTS_TXT)
w(ROOT / "README.md", README_MD)

--- Install deps

print("\n[install] pip install -r bridge/requirements.txt\n")
subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(BRIDGE / "requirements.txt")])

print("""
✅ Files written. ✅ Dependencies installed.

NEXT:

In PowerShell (same folder), set your env:
$env:AI_BACKEND="openai"
$env:OPENAI_API_KEY="YOUR_KEY"
$env:OPENAI_MODEL="gpt-4o-mini"
$env:MUD_HOST="127.0.0.1"
$env:MUD_PORT="4000"

(or switch to local_http + LOCAL_HTTP_URL / LOCAL_HTTP_MODEL)

Start the bridge:
python -m bridge.bridge_telnet

In your MUD, say something with 'bruce' in it.
Brother Bruce should answer (and may emit a small JSON action).

If you see a connection error, your MUD isn’t listening on MUD_HOST:MUD_PORT yet.
""")

Save and close Notepad.

---

# 3) Run the bootstrap

Back in the same PowerShell window (venv still active):

```powershell
python .\bootstrap_hw_bridge.py
