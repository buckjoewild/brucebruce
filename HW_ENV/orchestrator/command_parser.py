"""
MUD Command Parser
==================

Parses and handles player commands in the sealed habitat.

Command grammar:
  /plan <text>         - Log intention (PLAN mode only)
  /build on            - Arm for one build operation
  /consent yes         - Give explicit consent
  /consent no          - Deny and disarm
  /build off           - Disarm
  build <verb>         - Execute a build operation (if armed + consented)
  dev status           - Show current mode/state
  dev log tail <n>     - Show last n events
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from typing import Dict, Any, Optional, Tuple
from orchestrator.mode_state import get_manager
from orchestrator.permission_gate import get_gate, PermissionLevel, PermissionRequest
from hw_env import log_event, EVENT_LOG
import json


class CommandParser:
    """Parse and execute MUD commands."""
    
    def __init__(self):
        self.mode_mgr = get_manager()
        self.perm_gate = get_gate()
    
    def parse(self, player_name: str, command_line: str) -> Dict[str, Any]:
        """
        Parse a command line and return response.
        
        Args:
            player_name: Player issuing the command
            command_line: Raw command text
            
        Returns:
            {
                "ok": bool,
                "response": str (displayed to player),
                "state": dict (current mode state),
                ...
            }
        """
        command_line = command_line.strip()
        
        if not command_line:
            return {"ok": False, "response": ""}
        
        # Parse command
        parts = command_line.split(None, 1)  # Split on first whitespace
        cmd = parts[0].lower()
        rest = parts[1] if len(parts) > 1 else ""
        
        # Route to handler
        if cmd == "/plan":
            return self._handle_plan(player_name, rest)
        elif cmd == "/build":
            return self._handle_build(player_name, rest)
        elif cmd == "/consent":
            return self._handle_consent(player_name, rest)
        elif cmd == "dev":
            return self._handle_dev(player_name, rest)
        elif cmd == "build":
            return self._handle_build_verb(player_name, rest)
        else:
            return self._handle_unknown(player_name, cmd)
    
    def _handle_plan(self, player_name: str, text: str) -> Dict[str, Any]:
        """
        /plan <text>
        Log an intention in PLAN mode.
        """
        # Check permission
        request = PermissionRequest(
            player_name,
            PermissionLevel.PLAN_ONLY,
            "plan",
            {"intent": text}
        )
        result = self.perm_gate.check(request)
        
        if not result["ok"]:
            return {
                "ok": False,
                "response": f"❌ {result['reason']}",
                "state": self.mode_mgr.get_state(player_name),
            }
        
        # Log the intention
        log_event({
            "actor": player_name,
            "event_type": "plan",
            "intent": text,
        })
        
        return {
            "ok": True,
            "response": f"✓ Logged: {text}",
            "state": self.mode_mgr.get_state(player_name),
        }
    
    def _handle_build(self, player_name: str, args: str) -> Dict[str, Any]:
        """
        /build on      - Arm for one build operation
        /build off     - Disarm
        """
        args = args.strip().lower()
        state = self.mode_mgr.get_state(player_name)
        
        if args == "on":
            result = self.mode_mgr.arm(player_name)
            response = result["message"] if result["ok"] else f"❌ {result['reason']}"
        elif args == "off":
            result = self.mode_mgr.disarm(player_name)
            response = result["message"] if result["ok"] else f"❌ {result['reason']}"
        else:
            return {
                "ok": False,
                "response": "Usage: /build on | /build off",
                "state": state,
            }
        
        return {
            "ok": result["ok"],
            "response": response,
            "state": self.mode_mgr.get_state(player_name),
        }
    
    def _handle_consent(self, player_name: str, args: str) -> Dict[str, Any]:
        """
        /consent yes   - Give explicit consent
        /consent no    - Deny and disarm
        """
        args = args.strip().lower()
        
        if args == "yes":
            result = self.mode_mgr.consent(player_name, yes=True)
        elif args == "no":
            result = self.mode_mgr.consent(player_name, yes=False)
        else:
            state = self.mode_mgr.get_state(player_name)
            return {
                "ok": False,
                "response": "Usage: /consent yes | /consent no",
                "state": state,
            }
        
        response = result["message"] if result["ok"] else f"❌ {result['reason']}"
        return {
            "ok": result["ok"],
            "response": response,
            "state": self.mode_mgr.get_state(player_name),
        }
    
    def _handle_dev(self, player_name: str, args: str) -> Dict[str, Any]:
        """
        dev status     - Show current state
        dev log tail <n> - Show last n events
        """
        args = args.strip().lower()
        parts = args.split()
        
        if not parts or parts[0] == "status":
            state = self.mode_mgr.get_state(player_name)
            if not state:
                return {"ok": False, "response": "❌ No session"}
            
            response = (
                f"Mode: {state['mode']}\n"
                f"Armed: {state['armed']}\n"
                f"Consent: {state['consent']}"
            )
            return {"ok": True, "response": response, "state": state}
        
        elif parts[0] == "log" and len(parts) >= 2 and parts[1] == "tail":
            n = int(parts[2]) if len(parts) > 2 else 5
            return self._show_log_tail(n)
        
        else:
            return {
                "ok": False,
                "response": "Usage: dev status | dev log tail [n]",
                "state": self.mode_mgr.get_state(player_name),
            }
    
    def _show_log_tail(self, n: int = 5) -> Dict[str, Any]:
        """Show last n lines of event log."""
        if not EVENT_LOG.exists():
            return {
                "ok": False,
                "response": "No events logged yet.",
            }
        
        try:
            with open(EVENT_LOG, "r") as f:
                lines = f.readlines()[-n:]
            
            if not lines:
                return {"ok": True, "response": "Event log is empty."}
            
            response = "Recent events:\n"
            for line in lines:
                try:
                    event = json.loads(line)
                    ts = event.get("ts", "?")
                    actor = event.get("actor", "?")
                    event_type = event.get("event_type", "?")
                    response += f"  {ts} {actor}: {event_type}\n"
                except:
                    response += f"  (unparseable line)\n"
            
            return {"ok": True, "response": response}
        except Exception as e:
            return {"ok": False, "response": f"Error reading log: {e}"}
    
    def _handle_build_verb(self, player_name: str, args: str) -> Dict[str, Any]:
        """
        build <verb> ...
        Execute a build operation (requires armed + consented).
        """
        # Check permission
        request = PermissionRequest(
            player_name,
            PermissionLevel.BUILD,
            "build_verb",
            {"verb_args": args}
        )
        result = self.perm_gate.check(request)
        
        if not result["ok"]:
            return {
                "ok": False,
                "response": f"❌ {result['reason']}",
                "state": self.mode_mgr.get_state(player_name),
            }
        
        # TODO: Actually execute the build verb
        # For now, stub response
        log_event({
            "actor": player_name,
            "event_type": "build_verb",
            "verb": args,
            "result": "stub",
        })
        
        return {
            "ok": True,
            "response": f"✓ Build stub: {args}",
            "state": self.mode_mgr.get_state(player_name),
        }
    
    def _handle_unknown(self, player_name: str, cmd: str) -> Dict[str, Any]:
        """Unknown command."""
        return {
            "ok": False,
            "response": f"Unknown command: {cmd}",
            "state": self.mode_mgr.get_state(player_name),
        }


def get_parser() -> CommandParser:
    """Get the global command parser."""
    global _parser
    if not hasattr(get_parser, "_instance"):
        get_parser._instance = CommandParser()
    return get_parser._instance


if __name__ == "__main__":
    # Demo
    parser = get_parser()
    
    print("=" * 60)
    print("COMMAND PARSER DEMO")
    print("=" * 60)
    print()
    
    def demo_cmd(player: str, cmd: str):
        print(f"→ {player}: {cmd}")
        result = parser.parse(player, cmd)
        print(f"  {result['response']}")
        if "state" in result:
            state = result["state"]
            if state:
                print(f"  State: {state['mode']}, armed={state['armed']}, consent={state['consent']}")
        print()
    
    # Sequence of commands
    demo_cmd("you", "/plan create a test room")
    demo_cmd("you", "/build on")
    demo_cmd("you", "/consent yes")
    demo_cmd("you", "build room \"Test Room\" :: \"A test\"")
    demo_cmd("you", "dev status")
    demo_cmd("you", "/build off")
    demo_cmd("bruce", "dev log tail 3")
    
    print("=" * 60)
