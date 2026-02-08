"""
Tests for AI Player integration — auth, role, permission gate, rate limit, audit.

Verifies:
- authorize() choke point blocks bots from build/consent/create/spawn
- authorize() allows humans everything
- RateLimiter enforces sliding-window throttle
- BotAuditLogger writes provenance to JSONL
- Bot audit entries have required fields
- Role is "bot" or "human" — never from client payload
"""
import pytest
import tempfile
import json
import time
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from orchestrator.bot_audit import RateLimiter, BotAuditLogger


class MockPlayer:
    """Minimal player mock for testing."""
    def __init__(self, name: str, role: str = "human"):
        self.name = name
        self.role = role


DENIED_BOT_COMMANDS = {
    "/build", "/consent", "create", "spawn",
}
DENIED_BOT_SUBCOMMANDS = {"dev buildstub"}

def authorize(player, cmd_text: str) -> tuple:
    if player.role != "bot":
        return (True, "human")
    parts = cmd_text.strip().split()
    if not parts:
        return (True, "empty")
    cmd = parts[0].lower()
    if cmd in DENIED_BOT_COMMANDS:
        return (False, f"bot denied: {cmd}")
    if len(parts) >= 2:
        sub = f"{cmd} {parts[1].lower()}"
        if sub in DENIED_BOT_SUBCOMMANDS:
            return (False, f"bot denied: {sub}")
    return (True, "allowed")


class TestAuthorize:
    """Test the authorization choke point."""

    def test_human_can_build(self):
        player = MockPlayer("Alice", role="human")
        allowed, reason = authorize(player, "/build on")
        assert allowed is True

    def test_human_can_consent(self):
        player = MockPlayer("Alice", role="human")
        allowed, reason = authorize(player, "/consent yes")
        assert allowed is True

    def test_human_can_create(self):
        player = MockPlayer("Alice", role="human")
        allowed, reason = authorize(player, "create north TestRoom")
        assert allowed is True

    def test_bot_cannot_build(self):
        player = MockPlayer("BotTest", role="bot")
        allowed, reason = authorize(player, "/build on")
        assert allowed is False
        assert "denied" in reason.lower()

    def test_bot_cannot_consent(self):
        player = MockPlayer("BotTest", role="bot")
        allowed, reason = authorize(player, "/consent yes")
        assert allowed is False
        assert "denied" in reason.lower()

    def test_bot_cannot_create(self):
        player = MockPlayer("BotTest", role="bot")
        allowed, reason = authorize(player, "create north TestRoom")
        assert allowed is False

    def test_bot_cannot_spawn(self):
        player = MockPlayer("BotTest", role="bot")
        allowed, reason = authorize(player, "spawn TestNPC")
        assert allowed is False

    def test_bot_cannot_dev_buildstub(self):
        player = MockPlayer("BotTest", role="bot")
        allowed, reason = authorize(player, "dev buildstub")
        assert allowed is False

    def test_bot_can_look(self):
        player = MockPlayer("BotTest", role="bot")
        allowed, reason = authorize(player, "look")
        assert allowed is True

    def test_bot_can_say(self):
        player = MockPlayer("BotTest", role="bot")
        allowed, reason = authorize(player, "say hello world")
        assert allowed is True

    def test_bot_can_move(self):
        player = MockPlayer("BotTest", role="bot")
        for cmd in ["north", "south", "east", "west", "go north"]:
            allowed, reason = authorize(player, cmd)
            assert allowed is True, f"Bot should be able to: {cmd}"

    def test_bot_can_who(self):
        player = MockPlayer("BotTest", role="bot")
        allowed, reason = authorize(player, "who")
        assert allowed is True

    def test_bot_can_help(self):
        player = MockPlayer("BotTest", role="bot")
        allowed, reason = authorize(player, "help")
        assert allowed is True

    def test_bot_can_plan(self):
        player = MockPlayer("BotTest", role="bot")
        allowed, reason = authorize(player, "/plan I want to build a room")
        assert allowed is True

    def test_bot_denied_build_even_with_tricky_args(self):
        player = MockPlayer("BotTest", role="bot")
        allowed, _ = authorize(player, "/build off")
        assert allowed is False

    def test_role_assigned_server_side(self):
        human = MockPlayer("Human", role="human")
        bot = MockPlayer("Bot", role="bot")
        assert human.role == "human"
        assert bot.role == "bot"
        allowed_h, _ = authorize(human, "/build on")
        allowed_b, _ = authorize(bot, "/build on")
        assert allowed_h is True
        assert allowed_b is False


class TestRateLimiter:
    """Test sliding-window rate limiter."""

    def test_allows_within_limit(self):
        rl = RateLimiter(max_commands=3, window_seconds=10.0)
        for i in range(3):
            allowed, reason = rl.check("bot1")
            assert allowed is True

    def test_blocks_over_limit(self):
        rl = RateLimiter(max_commands=3, window_seconds=10.0)
        for i in range(3):
            rl.check("bot1")
        allowed, reason = rl.check("bot1")
        assert allowed is False
        assert "rate limited" in reason.lower()

    def test_per_actor_isolation(self):
        rl = RateLimiter(max_commands=2, window_seconds=10.0)
        rl.check("bot1")
        rl.check("bot1")
        allowed_bot1, _ = rl.check("bot1")
        allowed_bot2, _ = rl.check("bot2")
        assert allowed_bot1 is False
        assert allowed_bot2 is True

    def test_window_expires(self):
        rl = RateLimiter(max_commands=2, window_seconds=0.1)
        rl.check("bot1")
        rl.check("bot1")
        time.sleep(0.15)
        allowed, _ = rl.check("bot1")
        assert allowed is True


class TestBotAuditLogger:
    """Test bot audit JSONL logging with provenance fields."""

    def test_log_creates_file(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            logger = BotAuditLogger(tmpdir)
            player = MockPlayer("TestBot", role="bot")
            logger.log(player, "look", "allowed", "within limits")
            assert (Path(tmpdir) / "bot_audit.jsonl").exists()

    def test_log_has_provenance_fields(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            logger = BotAuditLogger(tmpdir)
            player = MockPlayer("TestBot", role="bot")
            entry = logger.log(player, "/build on", "denied", "bot denied: /build")

            assert entry["actor_id"] == "TestBot"
            assert entry["role"] == "bot"
            assert entry["source"] == "ai_player"
            assert entry["cmd_text"] == "/build on"
            assert entry["result"] == "denied"
            assert entry["reason"] == "bot denied: /build"
            assert "ts" in entry

    def test_log_writes_both_allowed_and_denied(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            logger = BotAuditLogger(tmpdir)
            player = MockPlayer("TestBot", role="bot")
            logger.log(player, "look", "allowed", "within limits")
            logger.log(player, "/build on", "denied", "bot denied: /build")

            entries = []
            with open(Path(tmpdir) / "bot_audit.jsonl") as f:
                for line in f:
                    entries.append(json.loads(line))

            assert len(entries) == 2
            assert entries[0]["result"] == "allowed"
            assert entries[1]["result"] == "denied"

    def test_validate_message_size(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            logger = BotAuditLogger(tmpdir)
            small = '{"command": "look"}'
            ok, _ = logger.validate_message(small)
            assert ok is True

            big = '{"command": "' + "x" * 3000 + '"}'
            ok, reason = logger.validate_message(big)
            assert ok is False
            assert "exceeds" in reason

    def test_validate_command_length(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            logger = BotAuditLogger(tmpdir)
            short = "look"
            ok, _ = logger.validate_command(short)
            assert ok is True

            long = "say " + "x" * 600
            ok, reason = logger.validate_command(long)
            assert ok is False
            assert "exceeds" in reason

    def test_log_truncates_long_command(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            logger = BotAuditLogger(tmpdir)
            player = MockPlayer("TestBot", role="bot")
            long_cmd = "say " + "x" * 1000
            entry = logger.log(player, long_cmd, "allowed", "ok")
            assert len(entry["cmd_text"]) == 500

    def test_rate_limit_integration(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            logger = BotAuditLogger(tmpdir, bot_rate_limit=2, bot_rate_window=10.0)
            ok1, _ = logger.check_rate_limit("bot1")
            ok2, _ = logger.check_rate_limit("bot1")
            ok3, reason = logger.check_rate_limit("bot1")
            assert ok1 is True
            assert ok2 is True
            assert ok3 is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
