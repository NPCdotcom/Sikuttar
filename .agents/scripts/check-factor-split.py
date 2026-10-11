#!/usr/bin/env python3
"""CI-equivalent checks for the two kit split prohibitions.

A. prop.kit.factors_do_not_carry_rationale — registry why / banned keys
B. prop.kit.docs_do_not_restate_factors — docs must not paste factor text

Usage:
  python scripts/check-factor-split.py
  python env/bin/agents-run.py maintain-adhoc check-factor-split
"""
from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:  # pragma: no cover
    print("PyYAML required", file=sys.stderr)
    sys.exit(1)

KIT_ROOT = Path(__file__).resolve().parents[1]
MIN_TEXT_LEN = 40
WHY_RE = re.compile(r"^docs/[A-Za-z0-9_./#\-]+$")
BANNED_KEYS = frozenset({"rationale", "reason", "because"})
ID_ONLY_LINE = re.compile(
    r"^[\s\-|*`]*"
    r"(?:prop|act|cap|path|template)\.[a-z0-9_.]+"
    r"(?:[\s`|,;:./\-]*(?:prop|act|cap|path|template)\.[a-z0-9_.]+)*"
    r"[\s`|*]*$",
    re.I,
)
FACTOR_ID_TOKEN = re.compile(r"`(?:prop|act|cap|path|template)\.[a-z0-9_.]+`")


def find_kit_root(hint: Path | None = None) -> Path:
    if hint and (hint / "registry").is_dir():
        return hint
    here = Path(__file__).resolve().parents[1]
    if (here / "registry").is_dir():
        return here
    cwd = Path.cwd()
    for p in (cwd, cwd / ".agents"):
        if (p / "registry").is_dir():
            return p.resolve()
    raise SystemExit("kit root not found (registry/ missing)")


def normalize_ws(s: str) -> str:
    return " ".join(s.split())


def iter_factor_files(kit: Path) -> list[Path]:
    reg = kit / "registry"
    return sorted(p for p in reg.rglob("*.yaml") if p.is_file())


def load_factors(path: Path) -> list[tuple[str, dict[str, Any]]]:
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    if not isinstance(data, dict):
        return []
    factors = data.get("factors") or []
    out: list[tuple[str, dict[str, Any]]] = []
    for fac in factors:
        if not isinstance(fac, dict):
            continue
        fid = str(fac.get("id") or "?")
        out.append((fid, fac))
    return out


def check_rationale(kit: Path) -> list[str]:
    violations: list[str] = []
    for path in iter_factor_files(kit):
        rel = path.relative_to(kit).as_posix()
        for fid, fac in load_factors(path):
            for key in BANNED_KEYS:
                if key in fac:
                    violations.append(
                        f"A banned key `{key}` on {fid} in {rel} "
                        f"（prop.kit.factors_do_not_carry_rationale）"
                    )
            if "why" not in fac or fac.get("why") is None:
                continue
            why = fac.get("why")
            if not isinstance(why, str):
                violations.append(
                    f"A why not a string on {fid} in {rel} "
                    f"（prop.kit.factors_do_not_carry_rationale）"
                )
                continue
            why_s = why.strip()
            if not WHY_RE.match(why_s):
                violations.append(
                    f"A why must be docs/ path only on {fid} in {rel}: {why_s!r} "
                    f"（prop.kit.factors_do_not_carry_rationale）"
                )
    return violations


def collect_long_texts(kit: Path) -> list[tuple[str, str]]:
    """Return list of (factor_id, normalized_text) with len >= MIN_TEXT_LEN."""
    out: list[tuple[str, str]] = []
    seen: set[str] = set()
    for path in iter_factor_files(kit):
        for fid, fac in load_factors(path):
            text = fac.get("text")
            if not isinstance(text, str):
                continue
            norm = normalize_ws(text)
            if len(norm) < MIN_TEXT_LEN:
                continue
            if norm in seen:
                continue
            seen.add(norm)
            out.append((fid, norm))
    return out


def line_is_id_or_registry_pointer(line: str) -> bool:
    s = line.strip()
    if not s:
        return True
    if "registry/" in s and FACTOR_ID_TOKEN.search(s) is None:
        # link-only to registry without pasting factor prose
        if normalize_ws(re.sub(r"\[.*?\]\(.*?\)", "", s)) == "" or "registry/" in s:
            # still might contain restated text — only skip pure short pointer lines
            stripped = FACTOR_ID_TOKEN.sub("", s)
            stripped = re.sub(r"\[.*?\]\(.*?\)", "", stripped)
            stripped = re.sub(r"`[^`]+`", "", stripped)
            if len(normalize_ws(stripped)) < 24:
                return True
    if ID_ONLY_LINE.match(s):
        return True
    # line whose substantive tokens are only factor ids
    without_ids = FACTOR_ID_TOKEN.sub("", s)
    without_ids = re.sub(r"`[^`]+`", "", without_ids)
    without_ids = re.sub(r"\[.*?\]\(.*?\)", "", without_ids)
    if len(normalize_ws(without_ids)) < 16 and FACTOR_ID_TOKEN.search(s):
        return True
    return False


def check_docs_restatement(kit: Path) -> list[str]:
    violations: list[str] = []
    long_texts = collect_long_texts(kit)
    if not long_texts:
        return violations

    docs_root = kit / "docs"
    if not docs_root.is_dir():
        return violations

    for md in sorted(docs_root.rglob("*.md")):
        if not md.is_file():
            continue
        rel = md.relative_to(kit).as_posix()
        try:
            body = md.read_text(encoding="utf-8")
        except OSError as e:
            violations.append(f"B cannot read {rel}: {e}")
            continue
        # Per-line exclusion for id-only / registry pointers; file-level substring on rest
        kept_lines: list[str] = []
        for line in body.splitlines():
            if line_is_id_or_registry_pointer(line):
                continue
            kept_lines.append(line)
        hay = normalize_ws("\n".join(kept_lines))
        if not hay:
            continue
        for fid, needle in long_texts:
            if needle in hay:
                violations.append(
                    f"B docs restates factor text of `{fid}` in {rel} "
                    f"（prop.kit.docs_do_not_restate_factors）"
                )
    return violations


def run_checks(kit: Path | None = None) -> int:
    root = find_kit_root(kit)
    violations = check_rationale(root) + check_docs_restatement(root)
    if violations:
        print("check-factor-split: FAIL", file=sys.stderr)
        for v in violations:
            print(f"  {v}", file=sys.stderr)
        print(
            "Fix: see skills/maintain-adhoc/references/factor-split-checks.md",
            file=sys.stderr,
        )
        return 1
    print(
        "check-factor-split: OK "
        "(prop.kit.factors_do_not_carry_rationale, "
        "prop.kit.docs_do_not_restate_factors)"
    )
    return 0


def main(argv: list[str] | None = None) -> int:
    _ = argv
    return run_checks(KIT_ROOT)


if __name__ == "__main__":
    raise SystemExit(main())
