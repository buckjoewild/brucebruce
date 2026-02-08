"""
Permission Enforcement Gate
===========================

Decides whether a mutation is allowed based on mode state.
Every denied request is logged (honesty = logged No as well as logged Yes).
"""

from typing import Optional, Dict, Any
from enum import Enum
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from orchestrator.mode_state import get_manager

class PermissionLevel(Enum):
    """Categories of operations."""
    PLAN_ONLY = "PLAN_ONLY"      # Observation, logging
    BUILD = "BUILD"               # Mutation (requires armed + consent)
    ADMIN = "ADMIN"               # System-level (future)


class PermissionRequest:
    """Structured permission request."""
    
    def __init__(
        self,
        player_name: str,
        level: PermissionLevel,
        action: str,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.player_name = player_name
        self.level = level
        self.action = action
        self.details = details or {}


class PermissionGate:
    """
    Evaluates whether an action is permitted.
    Logs all decisions (approved and denied).
    """
    
    def __init__(self):
        self.mgr = get_manager()
    
    def check(self, request: PermissionRequest) -> Dict[str, Any]:
        """
        Evaluate permission.
        
        Returns dict with:
          - ok: bool
          - reason: str (always present)
          - player_state: dict (for debugging)
        """
        from hw_env import log_event
        
        player_state = self.mgr.get_or_create_player(request.player_name)
        
        # PLAN_ONLY operations always allowed in PLAN mode
        if request.level == PermissionLevel.PLAN_ONLY:
            if player_state.mode.value == "PLAN":
                result = {
                    "ok": True,
                    "reason": f"PLAN mode: {request.action} allowed",
                    "player_state": player_state.to_dict(),
                }
                log_event({
                    "actor": request.player_name,
                    "event_type": "permission_check",
                    "action": request.action,
                    "level": request.level.value,
                    "result": "approved",
                    "details": request.details,
                })
                return result
            else:
                result = {
                    "ok": False,
                    "reason": f"PLAN mode required (currently {player_state.mode.value})",
                    "player_state": player_state.to_dict(),
                }
                log_event({
                    "actor": request.player_name,
                    "event_type": "permission_check",
                    "action": request.action,
                    "level": request.level.value,
                    "result": "denied",
                    "reason": result["reason"],
                    "details": request.details,
                })
                return result
        
        # BUILD operations require armed + consent
        if request.level == PermissionLevel.BUILD:
            can_build = self.mgr.can_build(request.player_name)
            if can_build:
                result = {
                    "ok": True,
                    "reason": f"Armed + consented: {request.action} allowed",
                    "player_state": player_state.to_dict(),
                }
                log_event({
                    "actor": request.player_name,
                    "event_type": "permission_check",
                    "action": request.action,
                    "level": request.level.value,
                    "result": "approved",
                    "details": request.details,
                })
                return result
            else:
                reason_parts = []
                if not player_state.armed:
                    reason_parts.append("not armed")
                if not player_state.consent_given:
                    reason_parts.append("no consent")
                reason = f"Cannot build: {', '.join(reason_parts)}"
                
                result = {
                    "ok": False,
                    "reason": reason,
                    "player_state": player_state.to_dict(),
                }
                log_event({
                    "actor": request.player_name,
                    "event_type": "permission_check",
                    "action": request.action,
                    "level": request.level.value,
                    "result": "denied",
                    "reason": reason,
                    "armed": player_state.armed,
                    "consent": player_state.consent_given,
                    "details": request.details,
                })
                return result
        
        # Unknown permission level
        result = {
            "ok": False,
            "reason": f"Unknown permission level: {request.level}",
        }
        return result


# Global instance
_gate: Optional[PermissionGate] = None


def get_gate() -> PermissionGate:
    """Get the global permission gate."""
    global _gate
    if _gate is None:
        _gate = PermissionGate()
    return _gate


def require_permission(
    player_name: str,
    level: PermissionLevel,
    action: str,
    details: Optional[Dict] = None,
) -> bool:
    """
    Convenience function: check permission and raise if denied.
    
    Usage:
        if not require_permission("you", PermissionLevel.BUILD, "create_room", {...}):
            return {"ok": False, "reason": "permission denied"}
    """
    gate = get_gate()
    request = PermissionRequest(player_name, level, action, details)
    result = gate.check(request)
    return result["ok"], result


if __name__ == "__main__":
    # Demo
    gate = get_gate()
    
    print("=" * 60)
    print("PERMISSION GATE DEMO")
    print("=" * 60)
    print()
    
    # Test 1: PLAN_ONLY in PLAN mode (should succeed)
    print("✓ PLAN_ONLY action in PLAN mode...")
    req = PermissionRequest("you", PermissionLevel.PLAN_ONLY, "examine_room")
    result = gate.check(req)
    print(f"  {result['ok']}: {result['reason']}")
    print()
    
    # Test 2: BUILD without arm (should fail)
    print("❌ BUILD action without arm...")
    req = PermissionRequest("you", PermissionLevel.BUILD, "create_room", 
                           {"room_name": "Tavern"})
    result = gate.check(req)
    print(f"  {result['ok']}: {result['reason']}")
    print()
    
    # Test 3: Arm and consent, then BUILD (should succeed)
    print("🔥 Arm + consent + BUILD...")
    mgr = get_manager()
    mgr.arm("you")
    mgr.consent("you", yes=True)
    req = PermissionRequest("you", PermissionLevel.BUILD, "create_room",
                           {"room_name": "Tavern"})
    result = gate.check(req)
    print(f"  {result['ok']}: {result['reason']}")
    print()
    
    print("=" * 60)
