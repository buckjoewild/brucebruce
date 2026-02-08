"""
Patch application module - applies unified diffs safely with rollback.

Supports:
  - Unified diff format (git style)
  - Backup before apply
  - Revert on failure
  - Git integration (optional)
"""
import os
import re
import shutil
import subprocess
import hashlib
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass
from typing import Optional


@dataclass
class PatchResult:
    """Result of a patch application."""
    success: bool
    message: str
    files_modified: list[str]
    backup_path: Optional[str] = None
    sha256: Optional[str] = None


class PatchApplier:
    """Applies unified diffs to a repository."""

    def __init__(self, repo_root: str, evidence_dir: str):
        self.repo_root = Path(repo_root)
        self.evidence_dir = Path(evidence_dir)
        self.patches_dir = self.evidence_dir / "patches"
        self.patches_dir.mkdir(parents=True, exist_ok=True)

    def apply(self, diff: str, event_id: str) -> PatchResult:
        """
        Apply a unified diff to the repo.

        Args:
            diff: Unified diff string
            event_id: Build event ID for tracking

        Returns:
            PatchResult with success status and details
        """
        if not diff.strip():
            return PatchResult(
                success=False,
                message="Empty diff provided",
                files_modified=[],
            )

        # Save patch to evidence
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        patch_file = self.patches_dir / f"{timestamp}_{event_id}.patch"
        patch_file.write_text(diff, encoding="utf-8")
        sha256 = hashlib.sha256(diff.encode()).hexdigest()

        # Parse files from diff
        files = self._parse_diff_files(diff)
        if not files:
            return PatchResult(
                success=False,
                message="Could not parse files from diff",
                files_modified=[],
                sha256=sha256,
            )

        # Create backups
        backup_dir = self.patches_dir / f"{timestamp}_{event_id}_backup"
        backup_dir.mkdir(exist_ok=True)
        for file_path in files:
            full_path = self.repo_root / file_path
            if full_path.exists():
                backup_path = backup_dir / file_path
                backup_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(full_path, backup_path)

        # Try git apply first (preferred)
        result = self._apply_via_git(diff)
        if result.success:
            result.backup_path = str(backup_dir)
            result.sha256 = sha256
            return result

        # Fall back to manual patch parsing
        result = self._apply_manually(diff)
        result.backup_path = str(backup_dir)
        result.sha256 = sha256
        return result

    def revert(self, backup_path: str) -> PatchResult:
        """
        Revert changes using a backup directory.

        Args:
            backup_path: Path to backup directory

        Returns:
            PatchResult indicating revert status
        """
        backup_dir = Path(backup_path)
        if not backup_dir.exists():
            return PatchResult(
                success=False,
                message=f"Backup not found: {backup_path}",
                files_modified=[],
            )

        reverted = []
        for backup_file in backup_dir.rglob("*"):
            if backup_file.is_file():
                rel_path = backup_file.relative_to(backup_dir)
                target = self.repo_root / rel_path
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(backup_file, target)
                reverted.append(str(rel_path))

        return PatchResult(
            success=True,
            message=f"Reverted {len(reverted)} files",
            files_modified=reverted,
        )

    def _parse_diff_files(self, diff: str) -> list[str]:
        """Extract file paths from unified diff."""
        files = []
        # Match --- a/path or +++ b/path lines
        for match in re.finditer(r'^(?:---|\+\+\+)\s+[ab]/(.+)$', diff, re.MULTILINE):
            path = match.group(1)
            if path not in files and path != "/dev/null":
                files.append(path)
        return files

    def _apply_via_git(self, diff: str) -> PatchResult:
        """Apply diff using git apply."""
        try:
            result = subprocess.run(
                ["git", "apply", "--check", "-"],
                input=diff,
                capture_output=True,
                text=True,
                cwd=self.repo_root,
            )
            if result.returncode != 0:
                return PatchResult(
                    success=False,
                    message=f"git apply --check failed: {result.stderr}",
                    files_modified=[],
                )

            # Actually apply
            result = subprocess.run(
                ["git", "apply", "-"],
                input=diff,
                capture_output=True,
                text=True,
                cwd=self.repo_root,
            )
            if result.returncode == 0:
                return PatchResult(
                    success=True,
                    message="Applied via git apply",
                    files_modified=self._parse_diff_files(diff),
                )
            else:
                return PatchResult(
                    success=False,
                    message=f"git apply failed: {result.stderr}",
                    files_modified=[],
                )
        except FileNotFoundError:
            return PatchResult(
                success=False,
                message="git not found, falling back to manual apply",
                files_modified=[],
            )

    def _apply_manually(self, diff: str) -> PatchResult:
        """
        Apply diff manually by parsing hunks with context verification.
        Rejects patches where context lines don't match the target file.
        """
        files_modified = []
        current_file = None
        hunks = []

        lines = diff.split('\n')
        i = 0
        while i < len(lines):
            line = lines[i]

            if line.startswith('+++ b/'):
                if current_file and hunks:
                    success = self._apply_hunks(current_file, hunks)
                    if not success:
                        return PatchResult(
                            success=False,
                            message=f"Manual apply failed on {current_file}: context mismatch or hunk error",
                            files_modified=files_modified,
                        )
                    files_modified.append(current_file)
                    hunks = []
                current_file = line[6:]
                i += 1
                continue

            if line.startswith('@@'):
                hunk_lines = [line]
                i += 1
                while i < len(lines) and not lines[i].startswith('@@') and not lines[i].startswith('---'):
                    hunk_lines.append(lines[i])
                    i += 1
                hunks.append(hunk_lines)
                continue

            i += 1

        if current_file and hunks:
            success = self._apply_hunks(current_file, hunks)
            if not success:
                return PatchResult(
                    success=False,
                    message=f"Manual apply failed on {current_file}: context mismatch or hunk error",
                    files_modified=files_modified,
                )
            files_modified.append(current_file)

        if files_modified:
            return PatchResult(
                success=True,
                message=f"Applied manually to {len(files_modified)} files",
                files_modified=files_modified,
            )
        else:
            return PatchResult(
                success=False,
                message="Manual apply failed - no files modified",
                files_modified=[],
            )

    def _apply_hunks(self, file_path: str, hunks: list) -> bool:
        """Apply hunks to a single file with context line verification."""
        full_path = self.repo_root / file_path

        if not full_path.exists():
            full_path.parent.mkdir(parents=True, exist_ok=True)
            new_content = []
            for hunk in hunks:
                for line in hunk[1:]:
                    if line.startswith('+') and not line.startswith('+++'):
                        new_content.append(line[1:])
                    elif not line.startswith('-'):
                        new_content.append(line[1:] if line.startswith(' ') else line)
            full_path.write_text('\n'.join(new_content), encoding='utf-8')
            return True

        try:
            content = full_path.read_text(encoding='utf-8').split('\n')
            for hunk in hunks:
                header = hunk[0]
                match = re.match(r'@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@', header)
                if not match:
                    return False

                old_start = int(match.group(1)) - 1

                context_lines = [
                    line[1:] for line in hunk[1:]
                    if line.startswith(' ')
                ]
                old_lines_in_hunk = [
                    line[1:] for line in hunk[1:]
                    if line.startswith('-') or line.startswith(' ')
                ]

                if old_start + len(old_lines_in_hunk) > len(content):
                    return False

                for i, expected in enumerate(old_lines_in_hunk):
                    if old_start + i < len(content) and content[old_start + i] != expected:
                        return False

                new_lines = []
                for line in hunk[1:]:
                    if line.startswith('+'):
                        new_lines.append(line[1:])
                    elif line.startswith('-'):
                        continue
                    elif line.startswith(' '):
                        new_lines.append(line[1:])
                    else:
                        new_lines.append(line)

                old_count = len(old_lines_in_hunk)
                content[old_start:old_start + old_count] = new_lines

            full_path.write_text('\n'.join(content), encoding='utf-8')
            return True
        except Exception:
            return False
