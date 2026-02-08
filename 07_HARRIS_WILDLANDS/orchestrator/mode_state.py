"""
Mode state management for MUD build operations.
Implements PLAN vs BUILD mode with explicit arming + consent.
"""
import os
from enum import Enum
from dataclasses import dataclass, field
from typing import Optional
import time

IDLE_MODE = os.environ.get("IDLE_MODE", "0") == "1"


class Mode(Enum):
    PLAN = "PLAN"
    BUILD = "BUILD"


@dataclass
class PlayerBuildState:
    """Per-player build state - avoids state bleed between players."""
    player_id: str
    mode: Mode = Mode.PLAN
    armed: bool = False
    consented: bool = False
    last_plan_text: Optional[str] = None
    armed_at: Optional[float] = None

    ARM_TIMEOUT_SECONDS: float = 300.0

    def can_build(self) -> bool:
        """Returns True only if in BUILD mode with armed + consented and not timed out."""
        if not (self.mode == Mode.BUILD and self.armed and self.consented):
            return False
        if self.armed_at is not None:
            elapsed = time.time() - self.armed_at
            if elapsed > self.ARM_TIMEOUT_SECONDS:
                self.armed = False
                self.consented = False
                self.armed_at = None
                return False
        return True

    def arm(self) -> str:
        """Arms one build operation."""
        if IDLE_MODE:
            return "IDLE_MODE active: builds disabled."
        if self.mode != Mode.BUILD:
            return "Must be in BUILD mode to arm. Use /build on first."
        self.armed = True
        self.armed_at = time.time()
        return "Armed for one build operation. Use /consent yes to confirm."

    def consent(self) -> str:
        """Gives consent for the armed operation."""
        if IDLE_MODE:
            return "IDLE_MODE active: builds disabled."
        if not self.armed:
            return "Nothing armed. Use /build on first."
        self.consented = True
        return "Consent given. Ready to build."

    def consume_build_cycle(self) -> None:
        """After a build operation, snap back to PLAN mode."""
        self.mode = Mode.PLAN
        self.armed = False
        self.consented = False
        self.armed_at = None

    def enter_build_mode(self) -> str:
        """Switch to BUILD mode."""
        if IDLE_MODE:
            return "IDLE_MODE active: builds disabled."
        self.mode = Mode.BUILD
        return "BUILD mode active. Use /build on to arm an operation."

    def enter_plan_mode(self) -> str:
        """Switch to PLAN mode."""
        self.mode = Mode.PLAN
        self.armed = False
        self.consented = False
        return "PLAN mode active."

    def set_plan(self, text: str) -> str:
        """Log intent in PLAN mode."""
        self.last_plan_text = text
        return f"Plan logged: {text}"

    def status(self) -> str:
        """Return current mode/armed/consent status."""
        return f"Mode: {self.mode.value} | Armed: {self.armed} | Consented: {self.consented}"


class ModeStateManager:
    """Manages build state for all players."""

    def __init__(self):
        self._states: dict[str, PlayerBuildState] = {}

    def get_state(self, player_id: str) -> PlayerBuildState:
        """Get or create player build state."""
        if player_id not in self._states:
            self._states[player_id] = PlayerBuildState(player_id=player_id)
        return self._states[player_id]

    def process_command(self, player_id: str, command: str) -> Optional[str]:
        """
        Process mode/consent commands. Returns response string or None if not a mode command.

        Commands:
          /plan <text>    - Logs intent, no mutation
          /build on       - Arms one build operation
          /consent yes    - Final confirmation
          /build off      - Disarms
          dev status      - Shows mode, armed, last build result
        """
        state = self.get_state(player_id)
        parts = command.strip().split(maxsplit=1)
        cmd = parts[0].lower() if parts else ""
        arg = parts[1] if len(parts) > 1 else ""

        if cmd == "/plan":
            return state.set_plan(arg)
        elif cmd == "/build":
            if arg.lower() == "on":
                result = state.enter_build_mode()
                return result + "\n" + state.arm()
            elif arg.lower() == "off":
                state.armed = False
                state.consented = False
                return "Build disarmed."
            else:
                return "Usage: /build on | /build off"
        elif cmd == "/consent":
            if arg.lower() == "yes":
                return state.consent()
            else:
                return "Usage: /consent yes"
        elif cmd == "dev" and arg.lower().startswith("status"):
            return state.status()

        return None  # Not a mode command
