#!/usr/bin/env python3
"""Fail if GENERATED expression / codename surfaces drift from registry regeneration.

Usage:
  python env/bin/agents-run.py maintain-adhoc check-expression-freshness
"""
from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


BANNER_EXPR = "<!-- GENERATED from registry/ — do not edit; run generate-expressions.py -->"
BANNER_CODE_YAML = "# GENERATED from registry/packages/*.yaml — do not edit; run generate-codenames.py"
BANNER_CODE_HTML = "<!-- GENERATED from registry/packages/*.yaml — do not edit; run generate-codenames.py -->"


def load_mod(kit: Path, script_name: str, mod_name: str):
    path = kit / "scripts" / script_name
    spec = importlib.util.spec_from_file_location(mod_name, path)
    if spec is None or spec.loader is None:
        raise SystemExit(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def normalize(text: str) -> str:
    return text.replace("\r\n", "\n").replace("\r", "\n")


def main() -> int:
    kit = Path(__file__).resolve().parents[3]
    dirty: list[str] = []
    total = 0

    # --- design expressions ---
    expr_mod = load_mod(kit, "generate-expressions.py", "generate_expressions")
    expected_expr = expr_mod.build_expressions(kit)
    if not expected_expr:
        print("check-expression-freshness: no expressions built", file=sys.stderr)
        return 1
    for path, body in expected_expr:
        total += 1
        rel = path.relative_to(kit).as_posix()
        if not path.is_file():
            dirty.append(f"missing: {rel}")
            continue
        current = normalize(path.read_text(encoding="utf-8"))
        want = normalize(body)
        if BANNER_EXPR not in current:
            dirty.append(f"no GENERATED banner: {rel}")
            continue
        if current != want:
            dirty.append(f"stale or hand-edited: {rel}")

    # --- codename artifacts ---
    code_mod = load_mod(kit, "generate-codenames.py", "generate_codenames")
    try:
        expected_code = code_mod.build_artifacts(kit)
    except SystemExit:
        print("check-expression-freshness: generate-codenames validation failed", file=sys.stderr)
        return 1
    for path, body in expected_code:
        total += 1
        rel = path.relative_to(kit).as_posix()
        if not path.is_file():
            dirty.append(f"missing: {rel}")
            continue
        current = normalize(path.read_text(encoding="utf-8"))
        want = normalize(body)
        banner = BANNER_CODE_HTML if path.suffix == ".html" else BANNER_CODE_YAML
        if banner not in current:
            dirty.append(f"no GENERATED banner: {rel}")
            continue
        if current != want:
            dirty.append(f"stale or hand-edited: {rel}")

    if dirty:
        print("check-expression-freshness: FAIL", file=sys.stderr)
        for line in dirty:
            print(f"  {line}", file=sys.stderr)
        print(
            "Fix: generate-expressions and/or generate-codenames",
            file=sys.stderr,
        )
        return 1

    print(f"check-expression-freshness: OK ({total} artifact(s))")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
