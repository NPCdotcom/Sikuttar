#!/usr/bin/env python3
"""Apply prop.memory.next_decay to nav.yaml next_actions (deterministic).

Usage:
  python env/bin/agents-run.py memory-record apply-nav-decay -- \\
    --nav .agents/memory/state/nav.yaml \\
    --proposed proposed-next.yaml \\
    --turn 12 --phase P3 --gate passed

  --dry-run   print resulting next_actions YAML; do not write
  --proposed -  read proposed next from stdin
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:  # pragma: no cover
    print("PyYAML required", file=sys.stderr)
    sys.exit(1)

MAX_ACTIONS = 3
DECAY_TURNS = 3
PHASE_RE = re.compile(r"^P(\d+)$", re.I)


def find_kit_root() -> Path:
    here = Path(__file__).resolve()
    for p in [here.parents[3], Path.cwd(), Path.cwd() / ".agents"]:
        if (p / "skills").is_dir():
            return p
    raise SystemExit("kit root not found")


def load_yaml(path: Path | None, text: str | None = None) -> Any:
    if text is not None:
        return yaml.safe_load(text) or {}
    if path is None:
        return {}
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}


def norm_text(s: str) -> str:
    return " ".join(s.strip().split())


def coerce_item(raw: Any, default_turn: int) -> dict[str, Any] | None:
    if raw is None:
        return None
    if isinstance(raw, str):
        t = norm_text(raw)
        if not t:
            return None
        return {
            "text": t,
            "asserted_at_turn": int(default_turn),
            "phase_bound": False,
        }
    if isinstance(raw, dict):
        text = raw.get("text")
        if text is None and "action" in raw:
            text = raw.get("action")
        if text is None:
            return None
        t = norm_text(str(text))
        if not t:
            return None
        asserted = raw.get("asserted_at_turn", default_turn)
        try:
            asserted_i = int(asserted)
        except (TypeError, ValueError):
            asserted_i = int(default_turn)
        return {
            "text": t,
            "asserted_at_turn": asserted_i,
            "phase_bound": bool(raw.get("phase_bound", False)),
        }
    return None


def extract_proposed_list(doc: Any) -> list[Any]:
    if doc is None:
        return []
    if isinstance(doc, list):
        return doc
    if isinstance(doc, dict):
        if "next_actions" in doc:
            return doc.get("next_actions") or []
        nav = doc.get("navigation") or {}
        if isinstance(nav, dict) and "next_actions" in nav:
            return nav.get("next_actions") or []
    return []


def phase_rank(phase: str | None) -> int | None:
    if not phase:
        return None
    m = PHASE_RE.match(str(phase).strip())
    if not m:
        return None
    return int(m.group(1))


def gate_advanced(prev: str | None, cur: str | None) -> bool:
    if not cur:
        return False
    cur_n = str(cur).strip().lower()
    prev_n = str(prev or "").strip().lower()
    if cur_n == prev_n:
        return False
    # forward: anything → passed, or pending → conditional/passed
    if cur_n == "passed" and prev_n != "passed":
        return True
    if cur_n == "conditional" and prev_n in ("", "pending"):
        return True
    return False


def phase_advanced(prev: str | None, cur: str | None) -> bool:
    pr, cr = phase_rank(prev), phase_rank(cur)
    if pr is None or cr is None:
        return False
    return cr > pr


def apply_decay(
    *,
    existing: list[Any],
    proposed: list[Any],
    turn: int,
    prev_phase: str | None,
    prev_gate: str | None,
    cur_phase: str | None,
    cur_gate: str | None,
) -> list[dict[str, Any]]:
    existing_items: list[dict[str, Any]] = []
    for raw in existing:
        item = coerce_item(raw, turn)
        if item:
            existing_items.append(item)

    proposed_items: list[dict[str, Any]] = []
    for raw in proposed:
        item = coerce_item(raw, turn)
        if item:
            proposed_items.append(item)

    proposed_by_text = {p["text"]: p for p in proposed_items}
    reasserted = set(proposed_by_text.keys())

    # Merge: start from existing order, refresh or keep age; append new proposed
    out: list[dict[str, Any]] = []
    seen: set[str] = set()

    for item in existing_items:
        text = item["text"]
        if text in proposed_by_text:
            prop = proposed_by_text[text]
            out.append(
                {
                    "text": text,
                    "asserted_at_turn": turn,
                    "phase_bound": bool(prop.get("phase_bound", item.get("phase_bound", False))),
                }
            )
            seen.add(text)
        else:
            age = turn - int(item["asserted_at_turn"])
            if age >= DECAY_TURNS:
                continue
            out.append(
                {
                    "text": text,
                    "asserted_at_turn": int(item["asserted_at_turn"]),
                    "phase_bound": bool(item.get("phase_bound", False)),
                }
            )
            seen.add(text)

    for text, prop in proposed_by_text.items():
        if text in seen:
            continue
        out.append(
            {
                "text": text,
                "asserted_at_turn": turn,
                "phase_bound": bool(prop.get("phase_bound", False)),
            }
        )
        seen.add(text)

    if phase_advanced(prev_phase, cur_phase) or gate_advanced(prev_gate, cur_gate):
        out = [x for x in out if not x.get("phase_bound")]

    return out[:MAX_ACTIONS]


def main(argv: list[str] | None = None) -> int:
    kit = find_kit_root()
    default_nav = kit / "memory" / "state" / "nav.yaml"
    # consumer layout: cwd/.agents/memory/...
    cwd_nav = Path.cwd() / ".agents" / "memory" / "state" / "nav.yaml"
    if not default_nav.is_file() and cwd_nav.is_file():
        default_nav = cwd_nav

    ap = argparse.ArgumentParser(description="Apply prop.memory.next_decay to nav.yaml")
    ap.add_argument("--nav", type=Path, default=default_nav, help="path to nav.yaml")
    ap.add_argument(
        "--proposed",
        type=str,
        default="",
        help="path to proposed next YAML/JSON, or '-' for stdin",
    )
    ap.add_argument("--turn", type=int, required=True, help="session.turn_estimate after +1")
    ap.add_argument("--phase", type=str, default="", help="alignment.phase for this write")
    ap.add_argument("--gate", type=str, default="", help="alignment.gate_status for this write")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument(
        "--sync-alignment",
        action="store_true",
        help="also write phase/gate from --phase/--gate into nav.alignment",
    )
    args = ap.parse_args(argv)

    nav_path: Path = args.nav
    if not nav_path.is_file():
        print(f"nav missing: {nav_path}（prop.memory.nav_missing_is_error）", file=sys.stderr)
        return 1

    nav = load_yaml(nav_path)
    if not isinstance(nav, dict):
        print("nav.yaml must be a mapping", file=sys.stderr)
        return 1

    navigation = nav.setdefault("navigation", {})
    if not isinstance(navigation, dict):
        print("navigation must be a mapping", file=sys.stderr)
        return 1
    alignment = nav.get("alignment") or {}
    if not isinstance(alignment, dict):
        alignment = {}

    prev_phase = alignment.get("phase")
    prev_gate = alignment.get("gate_status")
    cur_phase = args.phase or prev_phase
    cur_gate = args.gate or prev_gate

    proposed_raw: Any = {}
    if args.proposed == "-":
        proposed_raw = load_yaml(None, sys.stdin.read())
    elif args.proposed:
        proposed_raw = load_yaml(Path(args.proposed))
    else:
        proposed_raw = {"next_actions": []}

    result = apply_decay(
        existing=list(navigation.get("next_actions") or []),
        proposed=extract_proposed_list(proposed_raw),
        turn=args.turn,
        prev_phase=str(prev_phase) if prev_phase is not None else None,
        prev_gate=str(prev_gate) if prev_gate is not None else None,
        cur_phase=str(cur_phase) if cur_phase is not None else None,
        cur_gate=str(cur_gate) if cur_gate is not None else None,
    )

    out_doc = {"next_actions": result}
    rendered = yaml.safe_dump(out_doc, allow_unicode=True, sort_keys=False)

    if args.dry_run:
        sys.stdout.write(rendered)
        return 0

    navigation["next_actions"] = result
    session = nav.setdefault("session", {})
    if isinstance(session, dict):
        session["turn_estimate"] = args.turn
    if args.sync_alignment:
        al = nav.setdefault("alignment", {})
        if isinstance(al, dict):
            if args.phase:
                al["phase"] = args.phase
            if args.gate:
                al["gate_status"] = args.gate

    nav_path.write_text(
        yaml.safe_dump(nav, allow_unicode=True, sort_keys=False),
        encoding="utf-8",
        newline="\n",
    )
    print(f"wrote {nav_path} next_actions={len(result)}", file=sys.stderr)
    sys.stdout.write(rendered)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
