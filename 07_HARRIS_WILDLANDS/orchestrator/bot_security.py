"""
Bot security — single source of truth for authorization, rate limiting, and audit.

This module is imported by BOTH server.py and tests, ensuring
the authorization logic exercised in tests is the exact same code
that runs in production.
"""
import os

from orchestrator.bot_audit import RateLimiter, BotAuditLogger

DENIED_BOT_COMMANDS = {
    "/build", "/consent", "create", "spawn", "bruce",
}
DENIED_BOT_SUBCOMMANDS = {"dev buildstub"}

MAX_MESSAGE_BYTES = 2048
MAX_CMD_LENGTH = 500
BOT_RATE_LIMIT = 5
BOT_RATE_WINDOW = 10.0


def authorize(player, cmd_text: str) -> tuple:
    """
    Authorization choke point. Returns (allowed: bool, reason: str).
    Runs BEFORE any command parsing/execution.
    Humans and NPCs always pass. Bots are denied privileged commands.
    """
    if player.role in ("human", "npc"):
        return (True, player.role)

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


def check_bot_interlock() -> tuple:
    """
    Safety interlock: when IDLE_MODE=0 (builds allowed), bot connections
    are refused unless MUD_BOT_ALLOW_WHEN_ACTIVE=1 is explicitly set.

    Returns (allowed: bool, reason: str).
    """
    idle_mode = os.environ.get("IDLE_MODE", "0")

    if idle_mode == "1":
        return (True, "idle mode active, interlock passes")

    allow_override = os.environ.get("MUD_BOT_ALLOW_WHEN_ACTIVE", "0")
    if allow_override == "1":
        return (True, "active mode, explicit override set")

    return (False, "builds active (IDLE_MODE=0), bot connections refused — set MUD_BOT_ALLOW_WHEN_ACTIVE=1 to override")
