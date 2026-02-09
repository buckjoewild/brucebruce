"""
Growth Budget — tracks remaining world-mutation quota within a time window.

The budget resets per-window (default: per-day). Each successful growth apply
consumes one unit. When the budget is exhausted, no more applies are allowed
until the next window.

Persisted as a tiny JSON sidecar file alongside evidence.
"""
import json
import os
from datetime import datetime, timezone
from pathlib import Path


DEFAULT_BUDGET_TOTAL = 2
DEFAULT_WINDOW_KIND = "day"


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def get_window_key(now: datetime = None, window_kind: str = DEFAULT_WINDOW_KIND) -> str:
    now = now or _now_utc()
    if window_kind == "day":
        return now.strftime("%Y-%m-%d")
    elif window_kind == "hour":
        return now.strftime("%Y-%m-%dT%H")
    return now.strftime("%Y-%m-%d")


class GrowthBudget:
    def __init__(self, state_path: str, config_path: str = None):
        self.state_path = Path(state_path)
        self.config = self._load_config(config_path)
        self.window_kind = self.config.get("window_kind", DEFAULT_WINDOW_KIND)
        self.budget_total = self.config.get("budget_total", DEFAULT_BUDGET_TOTAL)
        self.autopilot_can_propose = self.config.get("autopilot_can_propose", True)
        self.autopilot_can_apply = self.config.get("autopilot_can_apply", False)
        self._state = self._load_state()

    def _load_config(self, config_path: str = None) -> dict:
        if config_path and os.path.exists(config_path):
            with open(config_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {
            "window_kind": DEFAULT_WINDOW_KIND,
            "budget_total": DEFAULT_BUDGET_TOTAL,
            "autopilot_can_propose": True,
            "autopilot_can_apply": False,
        }

    def _load_state(self) -> dict:
        if self.state_path.exists():
            try:
                with open(self.state_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                pass
        return self._fresh_state()

    def _fresh_state(self, window_key: str = None) -> dict:
        return {
            "window_kind": self.window_kind,
            "window_key": window_key or get_window_key(window_kind=self.window_kind),
            "budget_total": self.budget_total,
            "budget_used": 0,
            "last_apply_id": None,
        }

    def _save_state(self) -> None:
        self.state_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.state_path, "w", encoding="utf-8") as f:
            json.dump(self._state, f, indent=2)

    def reset_if_new_window(self, now: datetime = None) -> None:
        current_key = get_window_key(now, self.window_kind)
        if self._state.get("window_key") != current_key:
            self._state = self._fresh_state(current_key)
            self._save_state()

    def status(self, now: datetime = None) -> dict:
        self.reset_if_new_window(now)
        return {
            "window_kind": self._state["window_kind"],
            "window_key": self._state["window_key"],
            "budget_total": self._state["budget_total"],
            "budget_used": self._state["budget_used"],
            "budget_remaining": self._state["budget_total"] - self._state["budget_used"],
            "last_apply_id": self._state.get("last_apply_id"),
        }

    def can_consume(self, now: datetime = None) -> bool:
        self.reset_if_new_window(now)
        return self._state["budget_used"] < self._state["budget_total"]

    def consume(self, apply_id: str, now: datetime = None) -> None:
        self.reset_if_new_window(now)
        if not self.can_consume(now):
            raise RuntimeError("Growth budget exhausted for this window")
        self._state["budget_used"] += 1
        self._state["last_apply_id"] = apply_id
        self._save_state()
