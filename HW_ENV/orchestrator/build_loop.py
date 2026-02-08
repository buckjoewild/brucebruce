"""
Build Loop Orchestrator
=======================

The engine that runs:
  1. Validate mode gate (armed + consented)
  2. Request patch from Codex (or stub)
  3. Apply patch safely
  4. Run tests/smoke
  5. Log result
  6. Snap back to PLAN

This is where intention becomes reality.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import json
import subprocess
from typing import Dict, Any, Optional
from datetime import datetime
from orchestrator.mode_state import get_manager
from orchestrator.permission_gate import get_gate, PermissionLevel, PermissionRequest
from hw_env import log_event, PATCHES_DIR, get_repo_path, HW_ROOT


class BuildEvent:
    """One build operation."""
    
    def __init__(self, event_id: str, player: str, verb: str, args: str):
        self.id = event_id
        self.player = player
        self.verb = verb
        self.args = args
        self.started_at = datetime.utcnow()
        self.result = None
        self.patch_file = None
        self.test_output = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "player": self.player,
            "verb": self.verb,
            "args": self.args,
            "started_at": self.started_at.isoformat() + "Z",
            "result": self.result,
            "patch_file": str(self.patch_file) if self.patch_file else None,
            "test_output": self.test_output,
        }


class BuildOrchestrator:
    """
    Manages the complete build -> test -> log cycle.
    """
    
    def __init__(self):
        self.mode_mgr = get_manager()
        self.perm_gate = get_gate()
    
    async def execute_build(
        self,
        player: str,
        verb: str,
        args: str,
    ) -> Dict[str, Any]:
        """
        Execute a full build cycle.
        
        Args:
            player: Player name
            verb: Build verb (e.g., "room", "npc", "connect")
            args: Verb arguments
            
        Returns:
            {
                "ok": bool,
                "event_id": str,
                "result": str,
                "error": str (if failed),
                ...
            }
        """
        
        # Step 1: Permission check
        request = PermissionRequest(
            player,
            PermissionLevel.BUILD,
            f"build_{verb}",
            {"args": args}
        )
        perm_result = self.perm_gate.check(request)
        
        if not perm_result["ok"]:
            return {
                "ok": False,
                "error": perm_result["reason"],
            }
        
        # Create build event (for logging)
        event_id = f"build_{int(datetime.utcnow().timestamp() * 1000)}"
        event = BuildEvent(event_id, player, verb, args)
        
        try:
            # Step 2: Request patch (stub for now)
            patch_text = self._stub_patch(verb, args)
            
            # Step 3: Save patch file
            patch_file = PATCHES_DIR / f"{event_id}.diff"
            patch_file.write_text(patch_text)
            event.patch_file = patch_file
            
            # Step 4: Apply patch (stub for now)
            apply_result = await self._apply_patch_safe(patch_text)
            
            if not apply_result["ok"]:
                # Revert on failure
                await self._revert_patch(patch_file)
                event.result = "failed_apply"
                event.test_output = apply_result.get("error", "Unknown error")
                
                log_event({
                    "actor": player,
                    "event_type": "build_result",
                    "event_id": event_id,
                    "verb": verb,
                    "result": "failed",
                    "phase": "apply",
                    "error": event.test_output,
                })
                
                return {
                    "ok": False,
                    "event_id": event_id,
                    "error": apply_result["error"],
                }
            
            # Step 5: Run tests (stub for now)
            test_result = await self._run_tests()
            
            if not test_result["ok"]:
                # Revert on test failure
                await self._revert_patch(patch_file)
                event.result = "failed_tests"
                event.test_output = test_result.get("output", "Test failed")
                
                log_event({
                    "actor": player,
                    "event_type": "build_result",
                    "event_id": event_id,
                    "verb": verb,
                    "result": "failed",
                    "phase": "tests",
                    "error": event.test_output,
                })
                
                return {
                    "ok": False,
                    "event_id": event_id,
                    "error": f"Tests failed: {test_result['output']}",
                }
            
            # Success! Log it
            event.result = "success"
            event.test_output = test_result.get("output", "Tests passed")
            
            log_event({
                "actor": player,
                "event_type": "build_result",
                "event_id": event_id,
                "verb": verb,
                "result": "success",
                "patch_file": str(patch_file),
            })
            
            # Snap back to PLAN
            self.mode_mgr.plan_mode(player)
            
            return {
                "ok": True,
                "event_id": event_id,
                "result": "Build successful",
            }
        
        except Exception as e:
            log_event({
                "actor": player,
                "event_type": "build_error",
                "event_id": event_id,
                "verb": verb,
                "error": str(e),
            })
            return {
                "ok": False,
                "event_id": event_id,
                "error": f"Build error: {str(e)}",
            }
    
    def _stub_patch(self, verb: str, args: str) -> str:
        """Generate a stub diff (placeholder)."""
        return f"""--- a/structure_stub.txt
+++ b/structure_stub.txt
@@ -0,0 +1 @@
+Build: {verb} {args}
"""
    
    async def _apply_patch_safe(self, patch_text: str) -> Dict[str, Any]:
        """
        Apply patch safely (stub for now).
        In real implementation, would use git apply with rollback.
        """
        # For now, just validate the patch format
        if patch_text.startswith("---"):
            return {"ok": True, "message": "Patch applied (stub)"}
        else:
            return {"ok": False, "error": "Invalid patch format"}
    
    async def _revert_patch(self, patch_file: Path) -> None:
        """Revert changes (stub for now)."""
        # In real implementation, would git checkout
        pass
    
    async def _run_tests(self) -> Dict[str, Any]:
        """
        Run tests (stub for now).
        In real implementation, would run pytest or similar.
        """
        return {
            "ok": True,
            "output": "All tests passed (stub)",
        }


def get_orchestrator() -> BuildOrchestrator:
    """Get the global orchestrator."""
    global _orch
    if not hasattr(get_orchestrator, "_instance"):
        get_orchestrator._instance = BuildOrchestrator()
    return get_orchestrator._instance


if __name__ == "__main__":
    import asyncio
    
    async def demo():
        print("=" * 60)
        print("BUILD ORCHESTRATOR DEMO")
        print("=" * 60)
        print()
        
        orch = get_orchestrator()
        
        # Demo: full build cycle
        print("Arm + consent...")
        mgr = get_manager()
        mgr.arm("you")
        mgr.consent("you", yes=True)
        print(f"  State: {mgr.get_player('you')}")
        print()
        
        print("Execute build...")
        result = await orch.execute_build(
            "you",
            "room",
            '"Test Room" :: "A lovely test chamber"'
        )
        print(f"  Result: {result}")
        print()
        
        print("Mode snapped back to PLAN:")
        print(f"  State: {mgr.get_player('you')}")
        print()
        
        print("=" * 60)
    
    asyncio.run(demo())
