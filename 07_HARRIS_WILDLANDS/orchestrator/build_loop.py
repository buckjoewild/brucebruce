"""
Build Loop - The Spec -> Patch -> Test -> Log orchestrator.

This is the core loop that:
1. Validates mode gate (must be armed + consented)
2. Creates a BuildEvent id, logs durable: False
3. Gathers repo context
4. Asks Codex for a patch
5. Applies patch to working tree
6. Runs tests / smoke
7. If pass: optionally commit, log result ok
8. If fail: revert changes, log failure + error tail
9. Consumes the build cycle -> snap back to PLAN
"""
import os
import json
import uuid
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, field, asdict

from .mode_state import ModeStateManager, PlayerBuildState, IDLE_MODE
from .codex_adapter import get_patch
from .patch_apply import PatchApplier, PatchResult


@dataclass
class BuildEvent:
    """A single build event for the event log."""
    ts: str
    id: str
    actor: str
    mode: str
    verb: str
    args: dict
    result: str = "pending"
    durable: bool = False
    patch: Optional[dict] = None
    tests: Optional[dict] = None
    ohp: Optional[dict] = None  # Operator handoff protocol
    error: Optional[str] = None

    def to_json(self) -> str:
        return json.dumps(asdict(self), ensure_ascii=False)


class BuildOrchestrator:
    """
    The main build loop orchestrator.

    Owns the "Spec -> Patch -> Test -> Log" cycle and tool permissions.
    """

    def __init__(self, repo_root: str, evidence_dir: str, mode_manager: ModeStateManager = None):
        self.repo_root = Path(repo_root)
        self.evidence_dir = Path(evidence_dir)
        self.event_log_path = self.evidence_dir / "event_log.jsonl"
        self.mode_manager = mode_manager or ModeStateManager()
        self.patch_applier = PatchApplier(repo_root, evidence_dir)

        # Ensure evidence dir exists
        self.evidence_dir.mkdir(parents=True, exist_ok=True)

    def execute_build(
        self,
        player_id: str,
        verb: str,
        args: dict,
        intent: Optional[str] = None,
    ) -> str:
        """
        Execute a build operation.

        Args:
            player_id: The player requesting the build
            verb: The build verb (e.g., "build room")
            args: Parsed arguments from the command
            intent: The plan text / goal

        Returns:
            Result message to send back to the player
        """
        if IDLE_MODE:
            event = BuildEvent(
                ts=datetime.now(timezone.utc).isoformat(),
                id=f"evt_{uuid.uuid4().hex[:12]}",
                actor=player_id,
                mode="IDLE",
                verb=verb,
                args=args,
                result="blocked",
                durable=False,
            )
            self._log_event(event)
            return "IDLE_MODE: builds disabled"

        state = self.mode_manager.get_state(player_id)

        # 1) Validate mode gate
        if not state.can_build():
            return f"BUILD BLOCKED: {state.status()}\nUse /build on -> /consent yes first."

        # 2) Create BuildEvent
        event = BuildEvent(
            ts=datetime.now(timezone.utc).isoformat(),
            id=f"evt_{uuid.uuid4().hex[:12]}",
            actor=player_id,
            mode="BUILD",
            verb=verb,
            args=args,
            durable=False,
        )
        self._log_event(event)

        try:
            # 3) Gather repo context
            context = self._gather_context()

            # 4) Ask Codex for a patch
            task = {
                "verb": verb,
                "intent": intent or state.last_plan_text or "",
                "args": args,
            }
            patch_proposal = get_patch(task, context, event_id=event.id)

            if not patch_proposal.get("diff"):
                event.result = "error"
                event.error = patch_proposal.get("notes", "No diff generated")
                self._log_event(event)
                state.consume_build_cycle()
                return f"BUILD FAILED: {event.error}"

            # 4.5) Security validations before applying
            diff = patch_proposal["diff"]
            validation_error = self._validate_diff(diff)
            if validation_error:
                event.result = "rejected"
                event.error = validation_error
                self._log_event(event)
                state.consume_build_cycle()
                return f"BUILD REJECTED: {validation_error}"

            # 5) Apply patch
            apply_result = self.patch_applier.apply(
                diff=diff,
                event_id=event.id,
            )

            event.patch = {
                "path": apply_result.backup_path,
                "sha256": apply_result.sha256,
                "files": apply_result.files_modified,
            }

            if not apply_result.success:
                event.result = "error"
                event.error = apply_result.message
                self._log_event(event)
                state.consume_build_cycle()
                return f"BUILD FAILED (patch apply): {apply_result.message}"

            # 6) Run tests
            test_cmds = patch_proposal.get("tests", ["python -m pytest -v"])
            test_result = self._run_tests(test_cmds)

            event.tests = {
                "ran": True,
                "cmd": test_cmds[0] if test_cmds else "none",
                "ok": test_result.success,
                "output_tail": test_result.output[-500:] if test_result.output else "",
            }

            # 7/8) Handle result
            if test_result.success:
                event.result = "ok"
                event.durable = False  # Still false until commit
                self._log_event(event)
                state.consume_build_cycle()

                return (
                    f"BUILD OK: {verb}\n"
                    f"Files modified: {', '.join(apply_result.files_modified)}\n"
                    f"Notes: {patch_proposal.get('notes', '')}\n"
                    f"Event: {event.id}"
                )
            else:
                # Revert on failure
                if apply_result.backup_path:
                    self.patch_applier.revert(apply_result.backup_path)

                event.result = "failed"
                event.error = f"Tests failed: {test_result.output[-200:]}"
                self._log_event(event)
                state.consume_build_cycle()

                return (
                    f"BUILD FAILED (tests): Reverted changes.\n"
                    f"Test output: {test_result.output[-300:]}\n"
                    f"Event: {event.id}"
                )

        except Exception as e:
            event.result = "error"
            event.error = str(e)
            self._log_event(event)
            state.consume_build_cycle()
            return f"BUILD ERROR: {e}"

    CONTEXT_KEY_FILES = [
        "server.py",
        "07_HARRIS_WILDLANDS/orchestrator/bot_security.py",
        "07_HARRIS_WILDLANDS/orchestrator/mode_state.py",
        "07_HARRIS_WILDLANDS/orchestrator/build_loop.py",
        "07_HARRIS_WILDLANDS/orchestrator/heartbeat.py",
        "replit.md",
    ]
    CONTEXT_MAX_LINES_PER_FILE = 80
    CONTEXT_SECRET_PATTERNS = ["BOT_AUTH_TOKEN", "SECRET", "PASSWORD", "API_KEY"]

    def _gather_context(self) -> dict:
        """Gather repository context for Codex, including file snippets."""
        file_tree = []
        for root, dirs, files in os.walk(self.repo_root):
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '__pycache__', 'venv', '.pythonlibs']]
            for f in files:
                if not f.startswith('.'):
                    rel_path = os.path.relpath(os.path.join(root, f), self.repo_root)
                    file_tree.append(rel_path)
                    if len(file_tree) > 100:
                        break
            if len(file_tree) > 100:
                break

        snippets = {}
        for rel_path in self.CONTEXT_KEY_FILES:
            full_path = self.repo_root / rel_path
            if full_path.exists():
                try:
                    lines = full_path.read_text(encoding="utf-8").split("\n")[:self.CONTEXT_MAX_LINES_PER_FILE]
                    content = "\n".join(lines)
                    for pattern in self.CONTEXT_SECRET_PATTERNS:
                        if pattern in content:
                            content = content.replace(pattern, "[REDACTED]")
                    snippets[rel_path] = content
                except Exception:
                    snippets[rel_path] = "(read error)"

        return {
            "repo_root": str(self.repo_root),
            "file_tree": file_tree[:50],
            "snippets": snippets,
            "failing_tests": [],
            "invariants": [
                "Mode must be BUILD with armed + consented",
                "Build arming expires after 300 seconds",
                "No shell=True for AI test commands",
                "Bots cannot escalate to human role",
            ],
        }

    def _validate_diff(self, diff: str) -> Optional[str]:
        """
        Validate diff before applying. Returns error message or None if valid.

        Security checks:
        - Reject diffs touching files outside repo_root
        - Reject diffs larger than size cap (200KB)
        """
        MAX_DIFF_SIZE = 200 * 1024  # 200KB

        # Check size cap
        diff_size = len(diff.encode('utf-8'))
        if diff_size > MAX_DIFF_SIZE:
            return f"Diff too large: {diff_size} bytes (max: {MAX_DIFF_SIZE})"

        # Parse file paths from diff
        import re
        file_paths = []
        for match in re.finditer(r'^(?:---|\+\+\+)\s+[ab]/(.+)$', diff, re.MULTILINE):
            path = match.group(1)
            if path != "/dev/null":
                file_paths.append(path)

        # Check each file path is within repo_root
        for rel_path in file_paths:
            # Normalize and resolve the path
            try:
                # Check for path traversal attempts
                if '..' in rel_path or rel_path.startswith('/') or rel_path.startswith('\\'):
                    return f"Path traversal rejected: {rel_path}"

                # Resolve full path and check it's under repo_root
                full_path = (self.repo_root / rel_path).resolve()
                repo_resolved = self.repo_root.resolve()

                if not str(full_path).startswith(str(repo_resolved)):
                    return f"File outside repo_root rejected: {rel_path}"

            except Exception as e:
                return f"Invalid path in diff: {rel_path} ({e})"

        return None  # Valid

    def _get_venv_python(self) -> Optional[str]:
        """Get venv Python path if it exists."""
        # Check Windows venv path
        venv_python = self.repo_root / ".venv" / "Scripts" / "python.exe"
        if venv_python.exists():
            return str(venv_python)
        # Check Unix venv path
        venv_python = self.repo_root / ".venv" / "bin" / "python"
        if venv_python.exists():
            return str(venv_python)
        return None

    ALLOWED_TEST_COMMANDS = [
        "python -m pytest",
        "python -m pytest -q",
        "python -m pytest -v",
        "python -m pytest -x",
        "python -m pytest --tb=short",
    ]

    def _is_safe_test_cmd(self, cmd: str) -> bool:
        """Check if test command matches the whitelist (prefix match)."""
        for allowed in self.ALLOWED_TEST_COMMANDS:
            if cmd == allowed or cmd.startswith(allowed + " "):
                return True
        return False

    def _run_tests(self, cmds: list[str]) -> "TestResult":
        """Run test commands safely without shell=True. Uses venv Python if available."""
        venv_python = self._get_venv_python()
        default_cmd = "python -m pytest -v"

        for cmd in cmds:
            if not self._is_safe_test_cmd(cmd):
                self._log_audit_event("test_cmd_rejected", {"rejected": cmd, "fallback": default_cmd})
                cmd = default_cmd

            try:
                cmd_parts = cmd.split()
                if venv_python and cmd_parts[0] == "python":
                    cmd_parts[0] = venv_python

                result = subprocess.run(
                    cmd_parts,
                    shell=False,
                    capture_output=True,
                    text=True,
                    timeout=60,
                    cwd=self.repo_root,
                    errors='replace',
                )
                stdout = result.stdout or ""
                stderr = result.stderr or ""
                return TestResult(
                    success=result.returncode == 0,
                    output=stdout + stderr,
                )
            except subprocess.TimeoutExpired:
                return TestResult(success=False, output="Test timeout (60s)")
            except Exception as e:
                return TestResult(success=False, output=str(e))

        return TestResult(success=True, output="No tests specified")

    def _log_audit_event(self, event_type: str, detail: dict) -> None:
        """Log a security audit event to the event log."""
        import uuid as _uuid
        event = BuildEvent(
            ts=datetime.now(timezone.utc).isoformat(),
            id=f"audit_{_uuid.uuid4().hex[:12]}",
            actor="system",
            mode="AUDIT",
            verb=event_type,
            args=detail,
            result="logged",
            durable=False,
        )
        self._log_event(event)

    def _log_event(self, event: BuildEvent) -> None:
        """Append event to the JSONL log."""
        with open(self.event_log_path, "a", encoding="utf-8") as f:
            f.write(event.to_json() + "\n")

    def get_event_log_tail(self, n: int = 20) -> list[dict]:
        """Read last n events from the log."""
        if not self.event_log_path.exists():
            return []
        lines = self.event_log_path.read_text(encoding="utf-8").strip().split("\n")
        return [json.loads(line) for line in lines[-n:] if line.strip()]


@dataclass
class TestResult:
    """Result from running tests."""
    success: bool
    output: str


# --- Convenience function for MUD integration ---
def create_orchestrator(repo_root: str = None, evidence_dir: str = None) -> BuildOrchestrator:
    """Create a BuildOrchestrator with default paths."""
    if repo_root is None:
        repo_root = str(Path(__file__).parent.parent)  # Go up from orchestrator/
    if evidence_dir is None:
        evidence_dir = str(Path(repo_root) / "evidence")

    return BuildOrchestrator(repo_root, evidence_dir)
