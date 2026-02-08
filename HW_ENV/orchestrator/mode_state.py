"""
MUD Mode State Manager
=====================

Governs PLAN vs BUILD mode, arm/consent, and per-player isolation.
This is the transparency layer: every state change is logged.

Principles:
  - PLAN: observation and intention-logging only (no mutations)
  - BUILD: requires armed + consent (explicit agreement)
  - Per-player: state is isolated, no bleed
  - Logged: every state change creates an event (durability + auditability)
"""

import json
from datetime import datetime
from typing import Optional, Dict, Set
from enum import Enum
from pathlib import Path

# Add parent directory to path so we can import hw_env
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from hw_env import log_event, EVENT_LOG, HW_ROOT


class Mode(Enum):
    """Player mode state."""
    PLAN = "PLAN"
    BUILD = "BUILD"


class PlayerState:
    """
    Isolated state for a single player.
    All state changes are logged to the event log.
    """
    
    def __init__(self, player_name: str):
        self.player_name = player_name
        self.mode = Mode.PLAN
        self.armed = False
        self.consent_given = False
        
    def __repr__(self):
        return (
            f"PlayerState({self.player_name}, mode={self.mode.value}, "
            f"armed={self.armed}, consent={self.consent_given})"
        )
    
    def to_dict(self):
        """Serialize state for logging."""
        return {
            "player": self.player_name,
            "mode": self.mode.value,
            "armed": self.armed,
            "consent": self.consent_given,
        }


class ModeStateManager:
    """
    Manages mode state across all players.
    Enforces governance rules and logs all transitions.
    """
    
    def __init__(self):
        # player_name -> PlayerState
        self._players: Dict[str, PlayerState] = {}
        
    def get_or_create_player(self, player_name: str) -> PlayerState:
        """Get a player's state, creating it if needed."""
        if player_name not in self._players:
            state = PlayerState(player_name)
            self._players[player_name] = state
            # Log creation
            log_event({
                "actor": player_name,
                "event_type": "session_start",
                "state": state.to_dict(),
            })
        return self._players[player_name]
    
    def get_player(self, player_name: str) -> Optional[PlayerState]:
        """Get a player's state without creating."""
        return self._players.get(player_name)
    
    def _transition_mode(self, player_name: str, new_mode: Mode) -> Dict:
        """
        Attempt a mode transition.
        Returns dict with success + reason.
        """
        state = self.get_or_create_player(player_name)
        old_mode = state.mode
        
        if old_mode == new_mode:
            return {"ok": False, "reason": f"Already in {new_mode.value} mode"}
        
        # When switching TO BUILD, require arm+consent
        if new_mode == Mode.BUILD and not (state.armed and state.consent_given):
            return {
                "ok": False,
                "reason": "Cannot enter BUILD without armed + consent",
                "armed": state.armed,
                "consent": state.consent_given,
            }
        
        # When switching TO PLAN, reset arm+consent
        if new_mode == Mode.PLAN:
            state.armed = False
            state.consent_given = False
        
        state.mode = new_mode
        log_event({
            "actor": player_name,
            "event_type": "mode_change",
            "old_mode": old_mode.value,
            "new_mode": new_mode.value,
            "state": state.to_dict(),
        })
        
        return {"ok": True, "new_mode": new_mode.value}
    
    def plan_mode(self, player_name: str) -> Dict:
        """Switch to PLAN mode."""
        return self._transition_mode(player_name, Mode.PLAN)
    
    def build_mode(self, player_name: str) -> Dict:
        """Attempt to switch to BUILD mode."""
        return self._transition_mode(player_name, Mode.BUILD)
    
    def arm(self, player_name: str) -> Dict:
        """
        Arm for one BUILD operation.
        Only valid in PLAN mode.
        """
        state = self.get_or_create_player(player_name)
        
        if state.mode != Mode.PLAN:
            return {
                "ok": False,
                "reason": f"Can only arm in PLAN mode (currently {state.mode.value})",
            }
        
        if state.armed:
            return {"ok": False, "reason": "Already armed"}
        
        state.armed = True
        state.consent_given = False  # Reset consent on new arm
        
        log_event({
            "actor": player_name,
            "event_type": "armed",
            "state": state.to_dict(),
        })
        
        return {"ok": True, "message": "Armed. Explicit consent required to build."}
    
    def consent(self, player_name: str, yes: bool = True) -> Dict:
        """
        Give explicit consent for the next BUILD operation.
        Only valid if already armed.
        """
        state = self.get_or_create_player(player_name)
        
        if not state.armed:
            return {
                "ok": False,
                "reason": "Must arm first before giving consent",
            }
        
        if yes:
            state.consent_given = True
            log_event({
                "actor": player_name,
                "event_type": "consent_given",
                "state": state.to_dict(),
            })
            return {"ok": True, "message": "Consent given. Ready to build."}
        else:
            state.armed = False
            state.consent_given = False
            log_event({
                "actor": player_name,
                "event_type": "consent_denied",
                "state": state.to_dict(),
            })
            return {"ok": True, "message": "Consent denied. Disarmed."}
    
    def disarm(self, player_name: str) -> Dict:
        """Manually disarm (cancel pending build)."""
        state = self.get_or_create_player(player_name)
        
        if not state.armed:
            return {"ok": False, "reason": "Not armed"}
        
        state.armed = False
        state.consent_given = False
        
        log_event({
            "actor": player_name,
            "event_type": "disarmed",
            "state": state.to_dict(),
        })
        
        return {"ok": True, "message": "Disarmed."}
    
    def can_build(self, player_name: str) -> bool:
        """Check if player can perform BUILD operations."""
        state = self.get_player(player_name)
        if not state:
            return False
        return state.armed and state.consent_given
    
    def get_state(self, player_name: str) -> Optional[Dict]:
        """Get player's current state for display."""
        state = self.get_player(player_name)
        if not state:
            return None
        return state.to_dict()
    
    def get_all_states(self) -> Dict[str, Dict]:
        """Get all players' states (for debugging)."""
        return {
            name: state.to_dict()
            for name, state in self._players.items()
        }


# Global instance (singleton)
_manager: Optional[ModeStateManager] = None


def get_manager() -> ModeStateManager:
    """Get the global mode state manager."""
    global _manager
    if _manager is None:
        _manager = ModeStateManager()
    return _manager


if __name__ == "__main__":
    # Demo: show the mode-state system working
    mgr = get_manager()
    
    print("=" * 60)
    print("MODE STATE MANAGER DEMO")
    print("=" * 60)
    print()
    
    # Player 1 starts
    print("🎮 Player 'you' joins...")
    state = mgr.get_or_create_player("you")
    print(f"  State: {state}")
    print()
    
    # Try to build without arming (should fail)
    print("❌ Try to build without arming...")
    result = mgr.build_mode("you")
    print(f"  Result: {result}")
    print()
    
    # Arm for build
    print("🔥 Arm for build...")
    result = mgr.arm("you")
    print(f"  Result: {result}")
    print(f"  State: {mgr.get_player('you')}")
    print()
    
    # Give consent
    print("✅ Give explicit consent...")
    result = mgr.consent("you", yes=True)
    print(f"  Result: {result}")
    print(f"  State: {mgr.get_player('you')}")
    print()
    
    # Check if can build
    print("✔️ Can build now?")
    can_build = mgr.can_build("you")
    print(f"  {can_build}")
    print()
    
    # Player 2 (bruce) joins simultaneously
    print("🎮 Player 'bruce' joins (isolation test)...")
    state2 = mgr.get_or_create_player("bruce")
    print(f"  State: {state2}")
    print(f"  You state: {mgr.get_player('you')}")
    print(f"  -> Isolation: bruce's state does not affect you's state ✓")
    print()
    
    # Back to PLAN
    print("🔄 Return to PLAN mode...")
    result = mgr.plan_mode("you")
    print(f"  Result: {result}")
    print(f"  State: {mgr.get_player('you')}")
    print(f"  (note: armed + consent reset to False)")
    print()
    
    # Show all states
    print("📊 All player states:")
    for name, state in mgr.get_all_states().items():
        print(f"  {name}: {state}")
    print()
    
    # Show event log
    print("📋 Event log tail (last 5 lines):")
    if EVENT_LOG.exists():
        with open(EVENT_LOG, "r") as f:
            lines = f.readlines()[-5:]
            for line in lines:
                event = json.loads(line)
                print(f"  {event['actor']}: {event['event_type']}")
    print()
    print("=" * 60)
