# CREATED DURING DRIFT EVENT 2026-02-08 — not trusted until re-reviewed
# NOTE: This script was created in a read-only verification window (governance violation).
# STATUS: Quarantined. Do not treat outputs as authoritative until reviewed + approved.
#!/usr/bin/env python3
"""
Bruce Proof-of-Life — prints a dashboard from evidence files.
Usage: python scripts/_quarantine/prove_bruce_alive.py
"""
import json
import hashlib
import os
import sys
from pathlib import Path
from datetime import datetime

EVIDENCE_DIR = Path(__file__).resolve().parent.parent.parent / "07_HARRIS_WILDLANDS" / "evidence"

FILES = {
    "heartbeat": EVIDENCE_DIR / "heartbeat.jsonl",
    "bruce_activity": EVIDENCE_DIR / "bruce_activity.jsonl",
    "bruce_memory": EVIDENCE_DIR / "bruce_memory.jsonl",
    "event_log": EVIDENCE_DIR / "event_log.jsonl",
    "bot_audit": EVIDENCE_DIR / "bot_audit.jsonl",
}


def read_jsonl(path, tail_n=None):
    if not path.exists():
        return []
    entries = []
    with open(path, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    if tail_n:
        return entries[-tail_n:]
    return entries


def verify_sha256(entries):
    verified, failed = 0, 0
    for entry in entries:
        entry = dict(entry)
        claimed = entry.pop("sha256", None)
        if claimed is None:
            continue
        unsigned = json.dumps(entry, separators=(",", ":"))
        computed = hashlib.sha256(unsigned.encode("utf-8")).hexdigest()
        if claimed == computed:
            verified += 1
        else:
            failed += 1
    return verified, failed


def main():
    print("=" * 60)
    print("  BRUCE PROOF-OF-LIFE REPORT")
    print(f"  Generated: {datetime.now(tz=__import__('datetime').timezone.utc).isoformat()}")
    print("=" * 60)

    print("\n--- Evidence File Sizes ---")
    for name, path in FILES.items():
        if path.exists():
            size = path.stat().st_size
            lines = sum(1 for _ in open(path))
            print(f"  {name:20s}  {size:>8,} bytes  ({lines} lines)")
        else:
            print(f"  {name:20s}  [NOT FOUND]")

    print("\n--- Last 3 Heartbeats ---")
    hb_entries = read_jsonl(FILES["heartbeat"])
    for entry in hb_entries[-3:]:
        ts = entry.get("ts", "?")
        tick = entry.get("tick_id", "?")
        room = entry.get("room", {}).get("name", "?")
        snap = entry.get("snapshot", {})
        world = entry.get("world_summary", {})
        print(f"  {ts}  {tick}")
        print(f"    Room: {room}  |  NPCs: {snap.get('npcs',0)}  Players: {snap.get('players',0)}  Items: {snap.get('items',0)}")
        print(f"    World: {world.get('total_rooms',0)} rooms, {world.get('total_npcs',0)} NPCs, {world.get('total_players',0)} players")

    print("\n--- Last 5 Bruce Actions ---")
    act_entries = read_jsonl(FILES["bruce_activity"])
    for entry in act_entries[-5:]:
        ts = entry.get("ts", "?")
        action = entry.get("action", "?")
        room = entry.get("room", {}).get("name", "?")
        detail = entry.get("detail", {})
        detail_str = ", ".join(f"{k}={v}" for k, v in detail.items()) if detail else ""
        print(f"  {ts}  [{action:15s}] @ {room}  {detail_str}")

    print("\n--- Action Distribution ---")
    all_acts = read_jsonl(FILES["bruce_activity"])
    counts = {}
    for e in all_acts:
        a = e.get("action", "unknown")
        counts[a] = counts.get(a, 0) + 1
    for action, count in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"  {action:20s}  {count}")

    print("\n--- SHA256 Verification ---")
    for name in ["heartbeat", "bruce_activity"]:
        entries = read_jsonl(FILES[name])
        v, f = verify_sha256(entries)
        status = "ALL PASS" if f == 0 else f"FAILURES: {f}"
        print(f"  {name:20s}  {v}/{v+f} verified  [{status}]")

    print("\n--- Heartbeat Cadence ---")
    if len(hb_entries) >= 2:
        for i in range(1, min(len(hb_entries), 6)):
            t0 = datetime.fromisoformat(hb_entries[i-1]["ts"])
            t1 = datetime.fromisoformat(hb_entries[i]["ts"])
            delta = (t1 - t0).total_seconds()
            print(f"  {hb_entries[i-1]['tick_id']} -> {hb_entries[i]['tick_id']}: {delta:.0f}s ({delta/60:.1f}m)")
    else:
        print("  Not enough heartbeats to measure cadence")

    print("\n" + "=" * 60)
    print("  END OF REPORT")
    print("=" * 60)


if __name__ == "__main__":
    main()
