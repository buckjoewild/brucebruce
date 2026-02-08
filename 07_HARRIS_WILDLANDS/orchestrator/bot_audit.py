"""
Bot audit logger — append-only JSONL for bot command provenance.
"""
import json
import time
from datetime import datetime, timezone
from pathlib import Path
from collections import defaultdict


class RateLimiter:
    """Sliding-window rate limiter per actor."""
    
    def __init__(self, max_commands: int = 5, window_seconds: float = 10.0):
        self.max_commands = max_commands
        self.window_seconds = window_seconds
        self._timestamps: dict[str, list[float]] = defaultdict(list)
    
    def check(self, actor_id: str) -> tuple:
        """Returns (allowed: bool, reason: str)."""
        now = time.monotonic()
        cutoff = now - self.window_seconds
        
        self._timestamps[actor_id] = [
            t for t in self._timestamps[actor_id] if t > cutoff
        ]
        
        if len(self._timestamps[actor_id]) >= self.max_commands:
            return (False, f"rate limited: {self.max_commands} cmds / {self.window_seconds}s")
        
        self._timestamps[actor_id].append(now)
        return (True, "within limits")


class BotAuditLogger:
    """Append-only JSONL logger for bot command audit trail."""
    
    MAX_MESSAGE_SIZE = 2048  # 2KB
    MAX_COMMAND_LENGTH = 500
    
    def __init__(self, evidence_dir: str, bot_rate_limit: int = 5, bot_rate_window: float = 10.0):
        self.evidence_dir = Path(evidence_dir)
        self.evidence_dir.mkdir(parents=True, exist_ok=True)
        self.audit_path = self.evidence_dir / "bot_audit.jsonl"
        self.rate_limiter = RateLimiter(bot_rate_limit, bot_rate_window)
    
    def check_rate_limit(self, actor_id: str) -> tuple:
        """Check if actor is within rate limits."""
        return self.rate_limiter.check(actor_id)
    
    def validate_message(self, raw_message: str) -> tuple:
        """Validate message size and command length."""
        if len(raw_message.encode("utf-8")) > self.MAX_MESSAGE_SIZE:
            return (False, f"message exceeds {self.MAX_MESSAGE_SIZE} bytes")
        return (True, "valid")
    
    def validate_command(self, cmd_text: str) -> tuple:
        """Validate command length."""
        if len(cmd_text) > self.MAX_COMMAND_LENGTH:
            return (False, f"command exceeds {self.MAX_COMMAND_LENGTH} chars")
        return (True, "valid")
    
    def log(self, player, cmd_text: str, result: str, reason: str):
        """
        Append one audit entry.
        
        Args:
            player: Player object with name and role
            cmd_text: The command text attempted
            result: "allowed", "denied", or "rate_limited"
            reason: Why it was allowed/denied
        """
        entry = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "actor_id": player.name,
            "role": player.role,
            "source": "ai_player",
            "cmd_text": cmd_text[:self.MAX_COMMAND_LENGTH],
            "result": result,
            "reason": reason,
        }
        
        with open(self.audit_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")
        
        return entry
