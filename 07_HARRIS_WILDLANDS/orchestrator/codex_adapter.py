"""
Codex 5.2 Adapter - Patch generator interface.

This module wraps Codex (CLI or API) and returns proposed code edits.

Environment variables:
  USE_CODEX=1      - Enable real Codex integration (default: stub mode)
  CODEX_CLI=<path> - Path to Codex CLI (default: 'codex' on PATH)
  CODEX_DRYRUN=1   - Log transcript but return no diff

Required interface:
  propose_patch(task: dict, repo_context: dict) -> dict

Returns:
  - diff: unified diff (preferred) OR edits: list of file edits
  - notes: short rationale
  - tests: suggested tests to run
  - transcript_path: path to saved transcript (if Codex used)
  - transcript_sha256: sha256 of transcript
"""
import os
import re
import subprocess
import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, field


@dataclass
class PatchProposal:
    """Result from Codex patch proposal."""
    diff: str
    notes: str
    tests: list[str]
    edits: Optional[list[dict]] = None
    transcript_path: Optional[str] = None
    transcript_sha256: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "diff": self.diff,
            "notes": self.notes,
            "tests": self.tests,
            "edits": self.edits,
            "transcript_path": self.transcript_path,
            "transcript_sha256": self.transcript_sha256,
        }


# --- STUB DIFFS FOR TESTING ---
STUB_DIFFS = {
    "build_room": '''--- a/world/world_data.json
+++ b/world/world_data.json
@@ -1,4 +1,12 @@
 {
-  "rooms": []
+  "rooms": [
+    {
+      "id": "test_cabin",
+      "name": "Cabin",
+      "description": "A simple cabin in the woods.",
+      "exits": {},
+      "items": []
+    }
+  ]
 }
''',
    "default": '''--- a/test_file.txt
+++ b/test_file.txt
@@ -0,0 +1 @@
+# Stub edit from Codex adapter
''',
}

# Default test command
DEFAULT_TEST_CMD = "python -m pytest orchestrator/tests/test_build_loop.py -v"


def propose_patch_stub(task: dict, repo_context: dict) -> dict:
    """
    STUB MODE: Return known diffs for testing.
    """
    verb = task.get("verb", "").lower()
    intent = task.get("intent", "")

    if verb.startswith("build room"):
        diff = STUB_DIFFS["build_room"]
        notes = f"[STUB] Adding room from intent: {intent}"
    else:
        diff = STUB_DIFFS["default"]
        notes = f"[STUB] Default stub patch for verb: {verb}"

    return PatchProposal(
        diff=diff,
        notes=notes,
        tests=[DEFAULT_TEST_CMD],
    ).to_dict()


def _build_codex_prompt(task: dict, repo_context: dict, max_context_lines: int = 200) -> str:
    """Build a structured prompt for Codex."""
    verb = task.get("verb", "unknown")
    intent = task.get("intent", "")
    args = task.get("args", {})
    repo_root = repo_context.get("repo_root", ".")
    file_tree = repo_context.get("file_tree", [])[:30]  # Limit file list
    snippets = repo_context.get("snippets", {})
    failing_tests = repo_context.get("failing_tests", [])

    # Build context section with file excerpts
    context_lines = []
    total_lines = 0
    for filepath, content in snippets.items():
        if total_lines >= max_context_lines:
            break
        lines = content.split('\n')[:50]  # Max 50 lines per file
        context_lines.append(f"=== {filepath} ===")
        context_lines.extend(lines)
        total_lines += len(lines) + 1

    context_section = '\n'.join(context_lines) if context_lines else "(no file excerpts provided)"

    prompt = f"""You are a code generation assistant. Generate ONLY a unified diff to accomplish the task below.

TASK: {verb}
INTENT: {intent}
ARGS: {json.dumps(args)}

REPOSITORY ROOT: {repo_root}

FILES IN REPO:
{json.dumps(file_tree, indent=2)}

RELEVANT FILE EXCERPTS:
{context_section}

FAILING TESTS (if any):
{json.dumps(failing_tests)}

INSTRUCTIONS:
1. Output ONLY a valid unified diff (starting with --- and +++)
2. Do not include explanations, markdown, or code blocks
3. The diff must be applicable with 'git apply'
4. Keep changes minimal and focused on the task

OUTPUT (unified diff only):
"""
    return prompt


def _extract_unified_diff(output: str) -> Optional[str]:
    """Extract unified diff from Codex output. Returns None if no valid diff found."""
    # Look for diff starting with --- or diff --git
    patterns = [
        r'(---\s+a/.+?\n\+\+\+\s+b/.+?\n(?:@@.+?@@.*?\n(?:[+ -].*?\n)*)+)',
        r'(diff --git.+?\n(?:---\s+.+?\n\+\+\+\s+.+?\n)?(?:@@.+?@@.*?\n(?:[+ -].*?\n)*)+)',
    ]

    for pattern in patterns:
        match = re.search(pattern, output, re.MULTILINE | re.DOTALL)
        if match:
            return match.group(1).strip()

    # Check if the entire output looks like a diff
    if output.strip().startswith('---') or output.strip().startswith('diff --git'):
        return output.strip()

    return None


def _save_transcript(
    repo_root: str,
    event_id: str,
    prompt: str,
    stdout: str,
    stderr: str,
) -> tuple[str, str]:
    """Save Codex transcript to evidence/transcripts/. Returns (path, sha256)."""
    transcripts_dir = Path(repo_root) / "evidence" / "transcripts"
    transcripts_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"codex_{timestamp}_{event_id}.txt"
    filepath = transcripts_dir / filename

    content = f"""=== CODEX TRANSCRIPT ===
Timestamp: {datetime.now().isoformat()}
Event ID: {event_id}

=== PROMPT ===
{prompt}

=== STDOUT ===
{stdout}

=== STDERR ===
{stderr}
"""
    filepath.write_text(content, encoding="utf-8")
    sha256 = hashlib.sha256(content.encode()).hexdigest()

    return str(filepath), sha256


def propose_patch_codex(task: dict, repo_context: dict, event_id: str = "unknown") -> dict:
    """
    Call Codex 5.2 CLI for real AI-generated patches.

    Env vars:
      CODEX_CLI - path to codex binary (default: 'codex')
      CODEX_DRYRUN - if '1', log transcript but return empty diff
    """
    codex_path = os.environ.get("CODEX_CLI", "codex")
    dryrun = os.environ.get("CODEX_DRYRUN", "0") == "1"
    repo_root = repo_context.get("repo_root", ".")

    # Build structured prompt
    prompt = _build_codex_prompt(task, repo_context)

    try:
        # Call Codex CLI
        result = subprocess.run(
            [codex_path],
            input=prompt,
            capture_output=True,
            text=True,
            timeout=120,
            cwd=repo_root,
        )

        stdout = result.stdout or ""
        stderr = result.stderr or ""

        # Save transcript
        transcript_path, transcript_sha256 = _save_transcript(
            repo_root, event_id, prompt, stdout, stderr
        )

        # Dry-run mode: log but don't return diff
        if dryrun:
            return PatchProposal(
                diff="",
                notes=f"[DRYRUN] Transcript saved: {transcript_path}",
                tests=[DEFAULT_TEST_CMD],
                transcript_path=transcript_path,
                transcript_sha256=transcript_sha256,
            ).to_dict()

        # Extract unified diff from output
        diff = _extract_unified_diff(stdout)

        if diff is None:
            return PatchProposal(
                diff="",
                notes=f"[ERROR] No valid unified diff in Codex output. See transcript: {transcript_path}",
                tests=[DEFAULT_TEST_CMD],
                transcript_path=transcript_path,
                transcript_sha256=transcript_sha256,
            ).to_dict()

        return PatchProposal(
            diff=diff,
            notes=f"[CODEX] Generated diff for: {task.get('verb', 'unknown')}",
            tests=[DEFAULT_TEST_CMD],
            transcript_path=transcript_path,
            transcript_sha256=transcript_sha256,
        ).to_dict()

    except subprocess.TimeoutExpired:
        return PatchProposal(
            diff="",
            notes="[ERROR] Codex CLI timeout (120s)",
            tests=[DEFAULT_TEST_CMD],
        ).to_dict()
    except FileNotFoundError:
        return PatchProposal(
            diff="",
            notes=f"[ERROR] Codex CLI not found at: {codex_path}",
            tests=[DEFAULT_TEST_CMD],
        ).to_dict()
    except Exception as e:
        return PatchProposal(
            diff="",
            notes=f"[ERROR] Codex exception: {e}",
            tests=[DEFAULT_TEST_CMD],
        ).to_dict()


def get_patch(task: dict, repo_context: dict, event_id: str = "unknown") -> dict:
    """
    Main entry point - routes to stub or real Codex based on USE_CODEX env var.

    Args:
        task: {verb, intent, args}
        repo_context: {repo_root, file_tree, snippets, failing_tests, invariants}
        event_id: Build event ID for transcript naming

    Returns:
        dict with: diff, notes, tests, transcript_path, transcript_sha256
    """
    use_codex = os.environ.get("USE_CODEX", "0") == "1"

    if use_codex:
        return propose_patch_codex(task, repo_context, event_id)
    else:
        return propose_patch_stub(task, repo_context)
