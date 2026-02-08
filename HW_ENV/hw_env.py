"""
HW_ENV: Sealed habitat boundary enforcement.
All file operations must resolve within HW_ROOT.
This is the "one line" that makes the container real.
"""

import os
from pathlib import Path
from typing import Union
from datetime import datetime


# ===== THE BOUNDARY =====
HW_ROOT = Path(r"C:\GRAVITY\HW_ENV")

# Standard subdirectories
REPO_ROOT = HW_ROOT / "repo"
EVIDENCE_ROOT = HW_ROOT / "evidence"
RUNS_ROOT = HW_ROOT / "runs"
EVENT_LOG = EVIDENCE_ROOT / "event_log.jsonl"
PATCHES_DIR = EVIDENCE_ROOT / "patches"
TRANSCRIPTS_DIR = EVIDENCE_ROOT / "transcripts"


def validate_path(path: Union[str, Path], allow_outside: bool = False) -> Path:
    """
    Resolve a path and ensure it stays within HW_ROOT.
    
    If the resolved path is outside HW_ROOT, raise an error.
    This is the "hard boundary" enforcement.
    
    Args:
        path: Relative or absolute path
        allow_outside: If True, allow paths outside HW_ROOT (for rare cases)
    
    Returns:
        Validated absolute Path
        
    Raises:
        ValueError: If path resolves outside HW_ROOT (unless allow_outside=True)
    """
    resolved = Path(path).resolve()
    
    # Resolve HW_ROOT too, to handle any symlink weirdness
    hw_resolved = HW_ROOT.resolve()
    
    try:
        # This will raise ValueError if resolved is not relative to hw_resolved
        resolved.relative_to(hw_resolved)
    except ValueError:
        if not allow_outside:
            raise ValueError(
                f"Access denied: {resolved} is outside HW_ROOT ({hw_resolved}). "
                "All operations must stay within the sealed habitat."
            )
    
    return resolved


def ensure_env_ready():
    """Create any missing directories on startup."""
    for directory in [HW_ROOT, REPO_ROOT, EVIDENCE_ROOT, RUNS_ROOT, PATCHES_DIR, TRANSCRIPTS_DIR]:
        directory.mkdir(parents=True, exist_ok=True)


# ===== EVENT LOGGING (append-only) =====
def log_event(event: dict) -> str:
    """
    Append an event to the event log (JSONL format).
    Always include timestamp if not present.
    
    Args:
        event: Dict with event data (actor, verb, result, etc.)
        
    Returns:
        Event ID (for later reference)
    """
    import json
    
    if "ts" not in event:
        event["ts"] = datetime.utcnow().isoformat() + "Z"
    
    if "id" not in event:
        # Generate simple event id
        event["id"] = f"evt_{int(datetime.utcnow().timestamp() * 1000)}"
    
    # Ensure event log exists
    EVENT_LOG.parent.mkdir(parents=True, exist_ok=True)
    
    with open(EVENT_LOG, "a") as f:
        f.write(json.dumps(event) + "\n")
    
    return event["id"]


# ===== PATH HELPERS (always use these, never raw file operations) =====
def get_repo_path(relative: Union[str, Path]) -> Path:
    """Get an absolute path inside repo/, validating boundary."""
    full = REPO_ROOT / relative
    return validate_path(full)


def get_evidence_path(relative: Union[str, Path]) -> Path:
    """Get an absolute path inside evidence/."""
    full = EVIDENCE_ROOT / relative
    return validate_path(full)


def get_runs_path(relative: Union[str, Path]) -> Path:
    """Get an absolute path inside runs/."""
    full = RUNS_ROOT / relative
    return validate_path(full)


if __name__ == "__main__":
    # Test: ensure environment is ready on first run
    ensure_env_ready()
    print(f"✓ HW_ENV ready at {HW_ROOT}")
    print(f"  repo:     {REPO_ROOT}")
    print(f"  evidence: {EVIDENCE_ROOT}")
    print(f"  runs:     {RUNS_ROOT}")
    
    # Test: try a safe path
    try:
        safe = get_repo_path("server.py")
        print(f"✓ Safe path: {safe}")
    except ValueError as e:
        print(f"✗ {e}")
    
    # Test: try an unsafe path (should fail)
    try:
        unsafe = validate_path(r"C:\Users\wilds\Desktop")
        print(f"✗ Should have failed: {unsafe}")
    except ValueError:
        print(f"✓ Unsafe path correctly rejected")
