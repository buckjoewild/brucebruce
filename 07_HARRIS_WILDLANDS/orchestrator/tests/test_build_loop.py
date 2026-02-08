"""
Tests for the build loop orchestrator.

Verifies:
- Mode gating works (armed + consent required)
- Build consumes exactly one operation
- Events are logged correctly
"""
import pytest
import tempfile
import os
from pathlib import Path

# Add parent to path for imports
import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from orchestrator.mode_state import ModeStateManager, Mode, IDLE_MODE
from orchestrator.codex_adapter import propose_patch_stub, STUB_DIFFS, get_patch
from orchestrator.patch_apply import PatchApplier
from orchestrator.build_loop import BuildOrchestrator, create_orchestrator
import orchestrator.mode_state as mode_state_mod
import orchestrator.build_loop as build_loop_mod


class TestModeState:
    """Test mode state management."""

    def test_initial_state_is_plan(self):
        manager = ModeStateManager()
        state = manager.get_state("player1")
        assert state.mode == Mode.PLAN
        assert not state.armed
        assert not state.consented

    def test_cannot_build_in_plan_mode(self):
        manager = ModeStateManager()
        state = manager.get_state("player1")
        assert not state.can_build()

    def test_arm_requires_build_mode(self):
        manager = ModeStateManager()
        state = manager.get_state("player1")
        result = state.arm()
        assert "BUILD mode" in result

    def test_full_consent_flow(self):
        manager = ModeStateManager()
        state = manager.get_state("player1")

        # Enter build mode
        state.enter_build_mode()
        assert state.mode == Mode.BUILD

        # Arm
        state.arm()
        assert state.armed

        # Consent
        state.consent()
        assert state.consented
        assert state.can_build()

    def test_consume_snaps_to_plan(self):
        manager = ModeStateManager()
        state = manager.get_state("player1")
        state.enter_build_mode()
        state.arm()
        state.consent()
        assert state.can_build()

        state.consume_build_cycle()
        assert state.mode == Mode.PLAN
        assert not state.armed
        assert not state.consented
        assert not state.can_build()

    def test_per_player_isolation(self):
        manager = ModeStateManager()
        state1 = manager.get_state("player1")
        state2 = manager.get_state("player2")

        state1.enter_build_mode()
        state1.arm()

        assert state1.armed
        assert not state2.armed
        assert state1.mode == Mode.BUILD
        assert state2.mode == Mode.PLAN


class TestCodexAdapter:
    """Test the Codex adapter stub."""

    def test_stub_returns_known_diff(self):
        task = {"verb": "build room", "intent": "Add a cabin", "args": {}}
        context = {"file_tree": [], "snippets": {}, "failing_tests": [], "invariants": []}

        result = propose_patch_stub(task, context)

        assert "diff" in result
        assert "notes" in result
        assert "tests" in result
        assert "STUB" in result["notes"]

    def test_default_diff_for_unknown_verb(self):
        task = {"verb": "unknown", "intent": "", "args": {}}
        context = {"file_tree": [], "snippets": {}, "failing_tests": [], "invariants": []}

        result = propose_patch_stub(task, context)

        assert result["diff"] == STUB_DIFFS["default"]


class TestPatchApply:
    """Test patch application."""

    def test_empty_diff_fails(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            applier = PatchApplier(tmpdir, tmpdir)
            result = applier.apply("", "test_event")
            assert not result.success
            assert "Empty" in result.message

    def test_parse_diff_files(self):
        applier = PatchApplier(".", ".")
        diff = """--- a/foo.txt
+++ b/foo.txt
@@ -1 +1 @@
-old
+new
"""
        files = applier._parse_diff_files(diff)
        assert "foo.txt" in files


class TestBuildOrchestrator:
    """Test the full build loop."""

    def test_build_blocked_without_consent(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            orchestrator = BuildOrchestrator(tmpdir, tmpdir)
            result = orchestrator.execute_build(
                player_id="player1",
                verb="build room",
                args={"name": "Cabin"},
            )
            assert "BLOCKED" in result

    def test_build_with_full_consent(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            # Create a world_data.json for the stub diff to target
            world_dir = Path(tmpdir) / "world"
            world_dir.mkdir()
            (world_dir / "world_data.json").write_text('{\n  "rooms": []\n}')

            orchestrator = BuildOrchestrator(tmpdir, tmpdir)

            # Consent flow
            state = orchestrator.mode_manager.get_state("player1")
            state.enter_build_mode()
            state.arm()
            state.consent()

            result = orchestrator.execute_build(
                player_id="player1",
                verb="build room",
                args={"name": "Cabin"},
                intent="Add a test cabin",
            )

            # Should attempt build (may fail on tests, but won't be BLOCKED)
            assert "BLOCKED" not in result

    def test_build_consumes_one_op(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            orchestrator = BuildOrchestrator(tmpdir, tmpdir)

            # First: consent and build
            state = orchestrator.mode_manager.get_state("player1")
            state.enter_build_mode()
            state.arm()
            state.consent()

            # Execute build (will fail on tests but that's ok)
            orchestrator.execute_build("player1", "test", {})

            # Should be back in PLAN mode
            assert state.mode == Mode.PLAN
            assert not state.can_build()

            # Second build should be blocked
            result = orchestrator.execute_build("player1", "test", {})
            assert "BLOCKED" in result


class TestIdleMode:
    """Test IDLE_MODE blocks builds but allows read-only actions."""

    def test_idle_mode_blocks_build_when_consented(self, monkeypatch):
        monkeypatch.setattr(mode_state_mod, "IDLE_MODE", True)
        monkeypatch.setattr(build_loop_mod, "IDLE_MODE", True)

        with tempfile.TemporaryDirectory() as tmpdir:
            orchestrator = BuildOrchestrator(tmpdir, tmpdir)

            state = orchestrator.mode_manager.get_state("player1")
            state.mode = Mode.BUILD
            state.armed = True
            state.consented = True

            result = orchestrator.execute_build(
                player_id="player1",
                verb="build room",
                args={"name": "Cabin"},
            )
            assert "IDLE_MODE" in result

            events = orchestrator.get_event_log_tail(1)
            assert len(events) == 1
            assert events[0]["result"] == "blocked"
            assert events[0]["mode"] == "IDLE"

    def test_idle_mode_allows_plan_rejects_arm(self, monkeypatch):
        monkeypatch.setattr(mode_state_mod, "IDLE_MODE", True)

        manager = ModeStateManager()
        state = manager.get_state("player1")

        plan_result = state.set_plan("Add a new trail")
        assert "Plan logged" in plan_result

        arm_result = state.arm()
        assert "IDLE_MODE" in arm_result
        assert not state.armed

        consent_result = state.consent()
        assert "IDLE_MODE" in consent_result
        assert not state.consented

        build_result = state.enter_build_mode()
        assert "IDLE_MODE" in build_result
        assert state.mode == Mode.PLAN


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
