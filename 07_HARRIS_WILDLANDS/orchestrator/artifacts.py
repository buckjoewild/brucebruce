"""
Artifact intake — schema, validation, storage, and append-only JSONL logging.

Artifacts are external objects (text, JSON, diffs, notes, analyses) that are
submitted to Bruce for witnessing.  Bruce hashes, validates, and archives them.
He never interprets; he only receives and records.

All evidence is append-only JSONL in evidence/artifacts/intake.jsonl.
Accepted artifacts are stored in evidence/artifacts/archive/.
Quarantined artifacts are stored in evidence/artifacts/quarantine/.
Refused artifacts are not stored (only logged).

stdlib-only.  No DB.  No network calls.
"""

import hashlib
import hmac
import json
import os
import re
import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Optional


class ArtifactType(str, Enum):
    TEXT = "TEXT"
    JSON = "JSON"
    MARKDOWN = "MARKDOWN"
    LOG = "LOG"
    DIFF = "DIFF"
    NOTE = "NOTE"
    ANALYSIS = "ANALYSIS"


class ArtifactStatus(str, Enum):
    ACCEPTED = "ACCEPTED"
    REFUSED = "REFUSED"
    QUARANTINED = "QUARANTINED"
    FLAGGED_SCOPE = "FLAGGED_SCOPE"


ALLOWED_TYPES = {t.value for t in ArtifactType}
ALLOWED_SOURCES = {"human", "codex", "openclaw", "script", "unknown"}
DEFAULT_MAX_BYTES = 1_000_000
SAFE_ID_RE = re.compile(r'^[a-zA-Z0-9._-]{1,80}$')
EVIDENCE_HMAC_KEY = os.environ.get("EVIDENCE_HMAC_KEY", "")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def ensure_dirs(base: str) -> dict:
    paths = {
        "root": base,
        "archive": os.path.join(base, "archive"),
        "quarantine": os.path.join(base, "quarantine"),
    }
    for p in paths.values():
        os.makedirs(p, exist_ok=True)
    return paths


def validate_artifact(
    artifact_type: str,
    source: str,
    content_bytes: bytes,
    max_bytes: int = DEFAULT_MAX_BYTES,
) -> tuple:
    if len(content_bytes) > max_bytes:
        return (False, f"content too large: {len(content_bytes)} > {max_bytes} bytes")
    if artifact_type not in ALLOWED_TYPES:
        return (False, f"unknown artifact type: {artifact_type}")
    if not source or source not in ALLOWED_SOURCES:
        return (False, f"invalid source: {source!r}")
    return (True, "ok")


def _write_jsonl(filepath: str, entry: dict) -> None:
    line = json.dumps(entry, separators=(",", ":"))
    with open(filepath, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def append_intake_event(event_dict: dict, base_dir: str) -> None:
    paths = ensure_dirs(base_dir)
    intake_path = os.path.join(paths["root"], "intake.jsonl")
    event_with_hash = dict(event_dict)
    unsigned = json.dumps(event_dict, separators=(",", ":"))
    event_with_hash["sha256"] = hashlib.sha256(unsigned.encode("utf-8")).hexdigest()
    if EVIDENCE_HMAC_KEY:
        event_with_hash["hmac"] = hmac.new(EVIDENCE_HMAC_KEY.encode(), unsigned.encode(), hashlib.sha256).hexdigest()
    _write_jsonl(intake_path, event_with_hash)


def store_artifact(
    artifact_id: str,
    artifact_type: str,
    source: str,
    content_bytes: bytes,
    content_hash: str,
    status: str,
    base_dir: str,
    claimed_purpose: Optional[str] = None,
    related_artifacts: Optional[list] = None,
) -> str:
    paths = ensure_dirs(base_dir)
    if not SAFE_ID_RE.match(artifact_id):
        raise ValueError(f"unsafe artifact_id: {artifact_id!r}")
    if status == ArtifactStatus.QUARANTINED:
        dest_dir = paths["quarantine"]
    else:
        dest_dir = paths["archive"]

    archive_path = os.path.join(dest_dir, f"{artifact_id}.json")
    record = {
        "artifact_id": artifact_id,
        "artifact_type": artifact_type,
        "source": source,
        "timestamp_stored": now_iso(),
        "content_hash": content_hash,
        "content_text": content_bytes.decode("utf-8", errors="replace"),
        "bytes": len(content_bytes),
        "status": status,
    }
    if claimed_purpose:
        record["claimed_purpose"] = claimed_purpose
    if related_artifacts:
        record["related_artifacts"] = related_artifacts
    with open(archive_path, "w", encoding="utf-8") as f:
        json.dump(record, f, indent=2)

    return archive_path


def intake(
    artifact_type: str,
    source: str,
    content: str,
    base_dir: str,
    artifact_id: Optional[str] = None,
    claimed_purpose: Optional[str] = None,
    related_artifacts: Optional[list] = None,
    max_bytes: int = DEFAULT_MAX_BYTES,
) -> tuple:
    user_label = artifact_id
    artifact_id = uuid.uuid4().hex

    content_bytes = content.encode("utf-8") if isinstance(content, str) else content
    content_hash = sha256_bytes(content_bytes)

    ok, reason = validate_artifact(artifact_type, source, content_bytes, max_bytes)

    if not ok:
        if "unknown artifact type" in reason or "too large" in reason:
            status = ArtifactStatus.QUARANTINED
            archive_path = store_artifact(
                artifact_id, artifact_type, source, content_bytes,
                content_hash, status, base_dir, claimed_purpose, related_artifacts,
            )
        else:
            status = ArtifactStatus.REFUSED
            archive_path = None

        event = {
            "event_type": "INTAKE",
            "timestamp": now_iso(),
            "actor": "bruce",
            "artifact_id": artifact_id,
            "status": status,
            "artifact_type": artifact_type,
            "source": source,
            "content_hash": content_hash,
            "bytes": len(content_bytes),
            "reason": reason,
        }
        if user_label:
            event["user_label"] = user_label
        if archive_path:
            event["archive_path"] = archive_path
        if related_artifacts:
            event["related_artifacts"] = related_artifacts
        append_intake_event(event, base_dir)
        return (status, artifact_id, reason)

    status = ArtifactStatus.ACCEPTED
    archive_path = store_artifact(
        artifact_id, artifact_type, source, content_bytes,
        content_hash, status, base_dir, claimed_purpose, related_artifacts,
    )

    event = {
        "event_type": "INTAKE",
        "timestamp": now_iso(),
        "actor": "bruce",
        "artifact_id": artifact_id,
        "status": status,
        "artifact_type": artifact_type,
        "source": source,
        "content_hash": content_hash,
        "bytes": len(content_bytes),
        "reason": "ok",
        "archive_path": archive_path,
    }
    if user_label:
        event["user_label"] = user_label
    if related_artifacts:
        event["related_artifacts"] = related_artifacts
    append_intake_event(event, base_dir)
    return (status, artifact_id, "ok")


def link_artifacts(
    artifact_id_a: str,
    artifact_id_b: str,
    base_dir: str,
    note: Optional[str] = None,
) -> None:
    event = {
        "event_type": "LINK",
        "timestamp": now_iso(),
        "actor": "bruce",
        "artifact_id_a": artifact_id_a,
        "artifact_id_b": artifact_id_b,
    }
    if note:
        event["note"] = note
    append_intake_event(event, base_dir)


def annotate_artifact(
    artifact_id: str,
    text: str,
    base_dir: str,
) -> None:
    event = {
        "event_type": "ANNOTATE",
        "timestamp": now_iso(),
        "actor": "bruce",
        "artifact_id": artifact_id,
        "text": text,
    }
    append_intake_event(event, base_dir)


def load_artifact(artifact_id: str, base_dir: str) -> Optional[dict]:
    if not SAFE_ID_RE.match(artifact_id):
        return None
    paths = ensure_dirs(base_dir)
    for subdir in [paths["archive"], paths["quarantine"]]:
        filepath = os.path.join(subdir, f"{artifact_id}.json")
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
    return None
