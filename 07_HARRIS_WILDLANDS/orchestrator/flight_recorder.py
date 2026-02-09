"""
Flight Recorder — append-only JSONL writer for growth events.

Events:
- growth.offer.created
- growth.offer.rejected
- growth.apply.started
- growth.apply.succeeded
- growth.apply.failed

Each event includes: event_id, ts, actor, mode, window_key, offer_id/apply_id
"""
import hashlib
import hmac as hmac_mod
import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path


EVIDENCE_HMAC_KEY = os.environ.get("EVIDENCE_HMAC_KEY", "")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _make_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def _sha256(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def _hmac_sha256(data: str) -> str:
    return hmac_mod.new(
        EVIDENCE_HMAC_KEY.encode("utf-8"),
        data.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


class FlightRecorder:
    def __init__(self, evidence_dir: str):
        self.evidence_dir = Path(evidence_dir)
        self.evidence_dir.mkdir(parents=True, exist_ok=True)
        self.log_path = self.evidence_dir / "growth_events.jsonl"

    def record(
        self,
        event_type: str,
        actor: str,
        window_key: str,
        offer_id: str = None,
        apply_id: str = None,
        detail: dict = None,
    ) -> dict:
        entry = {
            "event_id": _make_id("ge"),
            "ts": _now_iso(),
            "event_type": event_type,
            "actor": actor,
            "window_key": window_key,
        }
        if offer_id:
            entry["offer_id"] = offer_id
        if apply_id:
            entry["apply_id"] = apply_id
        if detail:
            entry["detail"] = detail

        line = json.dumps(entry, separators=(",", ":"))
        entry["sha256"] = _sha256(line)
        if EVIDENCE_HMAC_KEY:
            entry["hmac"] = _hmac_sha256(line)

        signed_line = json.dumps(entry, separators=(",", ":"))
        try:
            with open(self.log_path, "a", encoding="utf-8") as f:
                f.write(signed_line + "\n")
        except Exception as e:
            print(f"FLIGHT RECORDER WRITE ERROR: {e}")

        return entry

    def tail(self, n: int = 10) -> list:
        if not self.log_path.exists():
            return []
        entries = []
        with open(self.log_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entries.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
        return entries[-n:]
