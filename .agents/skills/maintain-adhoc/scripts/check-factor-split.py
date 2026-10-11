#!/usr/bin/env python3
"""agents-run wrapper → scripts/check-factor-split.py (canonical)."""
from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


def main() -> int:
    kit = Path(__file__).resolve().parents[3]
    target = kit / "scripts" / "check-factor-split.py"
    if not target.is_file():
        print(f"missing canonical checker: {target}", file=sys.stderr)
        return 1
    spec = importlib.util.spec_from_file_location("check_factor_split", target)
    if spec is None or spec.loader is None:
        print(f"cannot load {target}", file=sys.stderr)
        return 1
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return int(mod.run_checks(kit))


if __name__ == "__main__":
    raise SystemExit(main())
