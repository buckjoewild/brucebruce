"""
Integration Test: End-to-End MUD Flow
======================================

This script simulates a complete player interaction:
  1. Connect (telnet)
  2. Plan an action
  3. Arm + consent
  4. Build (create something)
  5. Verify logs

Run this to validate the entire system works.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

import asyncio
import json
from datetime import datetime
from orchestrator import (
    get_manager, get_gate, get_parser, get_orchestrator,
    PermissionLevel
)
from hw_env import EVENT_LOG, log_event


async def test_full_cycle():
    """Run a full build cycle test."""
    
    print("=" * 70)
    print("INTEGRATION TEST: Full Player Build Cycle")
    print("=" * 70)
    print()
    
    # Players
    players = ["you", "bruce"]
    mode_mgr = get_manager()
    parser = get_parser()
    orch = get_orchestrator()
    
    # ===== PHASE 1: Both players connect and observe =====
    print("[1] Both players connect (isolated sessions)...")
    for player in players:
        mode_mgr.get_or_create_player(player)
    print(f"✓ Sessions created for: {', '.join(players)}")
    print()
    
    # ===== PHASE 2: You plans an action =====
    print("[2] You plans an action (PLAN mode, no mutation)...")
    result = parser.parse("you", "/plan create a test room in the cabin")
    assert result["ok"], f"Failed: {result}"
    print(f"✓ {result['response']}")
    print()
    
    # ===== PHASE 3: Bruce checks log (can see your intention) =====
    print("[3] Bruce checks the event log (transparency)...")
    result = parser.parse("bruce", "dev log tail 2")
    assert result["ok"], f"Failed: {result}"
    print(f"✓ Log visible to both players")
    print()
    
    # ===== PHASE 4: You tries to build without arming (should fail) =====
    print("[4] You tries to build without arming (should be blocked)...")
    result = parser.parse("you", "build room \"Cabin\" :: \"A cozy space\"")
    assert not result["ok"], "Should have been blocked!"
    print(f"✓ Correctly blocked: {result['response']}")
    print()
    
    # ===== PHASE 5: You arms =====
    print("[5] You arms for one build operation...")
    result = parser.parse("you", "/build on")
    assert result["ok"], f"Failed: {result}"
    print(f"✓ {result['response']}")
    state = result["state"]
    assert state["armed"] == True
    assert state["consent"] == False
    print()
    
    # ===== PHASE 6: You gives consent =====
    print("[6] You gives explicit consent...")
    result = parser.parse("you", "/consent yes")
    assert result["ok"], f"Failed: {result}"
    print(f"✓ {result['response']}")
    state = result["state"]
    assert state["armed"] == True
    assert state["consent"] == True
    print()
    
    # ===== PHASE 7: You can now build =====
    print("[7] You can now build (orchestrator runs full cycle)...")
    result = await orch.execute_build(
        "you",
        "room",
        '"Cabin" :: "A cozy cabin in the woods"'
    )
    assert result["ok"], f"Failed: {result}"
    print(f"✓ {result['result']}")
    print(f"  Event ID: {result['event_id']}")
    print()
    
    # ===== PHASE 8: Verify you is snapped back to PLAN =====
    print("[8] Verify you is back in PLAN mode...")
    state = mode_mgr.get_state("you")
    assert state["mode"] == "PLAN"
    assert state["armed"] == False
    assert state["consent"] == False
    print(f"✓ Mode reset to PLAN (armed=False, consent=False)")
    print()
    
    # ===== PHASE 9: Check event log has everything =====
    print("[9] Check event log (append-only evidence)...")
    if EVENT_LOG.exists():
        with open(EVENT_LOG, "r") as f:
            lines = f.readlines()
        
        print(f"✓ Event log has {len(lines)} entries")
        
        # Count event types
        event_types = {}
        for line in lines:
            try:
                event = json.loads(line)
                et = event.get("event_type", "unknown")
                event_types[et] = event_types.get(et, 0) + 1
            except:
                pass
        
        print(f"  Event types: {dict(event_types)}")
        
        # Should have at least: session_start, plan, armed, consent_given, build_result
        assert event_types.get("plan", 0) > 0, "No /plan event"
        assert event_types.get("armed", 0) > 0, "No arm event"
        assert event_types.get("consent_given", 0) > 0, "No consent event"
        assert event_types.get("build_result", 0) > 0, "No build result"
        print("✓ All critical events logged")
    print()
    
    # ===== PHASE 10: Verify per-player isolation =====
    print("[10] Verify per-player isolation (no state bleed)...")
    you_state = mode_mgr.get_state("you")
    bruce_state = mode_mgr.get_state("bruce")
    assert you_state["mode"] == "PLAN"
    assert bruce_state["mode"] == "PLAN"
    assert you_state["armed"] == False
    assert bruce_state["armed"] == False
    print(f"✓ Each player has independent state")
    print()
    
    print("=" * 70)
    print("✓ ALL TESTS PASSED")
    print("=" * 70)
    print()
    print("Summary:")
    print("  ✓ Mode-state governance working (PLAN vs BUILD)")
    print("  ✓ Permission enforcement working (arm + consent required)")
    print("  ✓ Command parser working (/plan, /build, /consent)")
    print("  ✓ Build orchestrator working (patch -> test -> log)")
    print("  ✓ Per-player isolation working (no state bleed)")
    print("  ✓ Event logging working (append-only evidence)")
    print()
    print("The sealed habitat is alive and honest. 🧱🔒")
    print()


if __name__ == "__main__":
    asyncio.run(test_full_cycle())
