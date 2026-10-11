#!/usr/bin/env python3
"""agents-run wrapper → scripts/generate-expressions.py (canonical)."""
from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


def main() -> int:
    kit = Path(__file__).resolve().parents[3]
    target = kit / "scripts" / "generate-expressions.py"
    if not target.is_file():
        print(f"missing canonical generator: {target}", file=sys.stderr)
        return 1
    spec = importlib.util.spec_from_file_location("generate_expressions", target)
    if spec is None or spec.loader is None:
        print(f"cannot load {target}", file=sys.stderr)
        return 1
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.write_expressions(kit)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
