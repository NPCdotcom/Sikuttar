#!/usr/bin/env python3
"""Generate codename package index + HTML list from registry/packages/*.yaml.

Canonical entry: python scripts/generate-codenames.py
Also: python env/bin/agents-run.py maintain-adhoc generate-codenames
"""
from __future__ import annotations

import html
import re
import sys
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:  # pragma: no cover
    print("PyYAML required: pip install -r env/python/requirements.txt", file=sys.stderr)
    sys.exit(1)

KIT_ROOT = Path(__file__).resolve().parents[1]
PACKAGES_DIR = KIT_ROOT / "registry" / "packages"
FACTOR_INDEX = KIT_ROOT / "registry" / "index.yaml"
OUT_INDEX = PACKAGES_DIR / "index.yaml"
OUT_HTML = KIT_ROOT / "docs" / "codenames.html"

CODENAME_RE = re.compile(r"^(手順|プロトコル|オペレーション)-[^\s\-]{2,8}-\d{1,2}$")
ID_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
RESERVED_WARN = ("Hermes", "Subagent", "Task")

BANNER_YAML = "# GENERATED from registry/packages/*.yaml — do not edit; run generate-codenames.py\n"
BANNER_HTML = "<!-- GENERATED from registry/packages/*.yaml — do not edit; run generate-codenames.py -->\n"

SCAN_ROOTS = ("docs", "skills", "rules")
SCAN_SKIP_PARTS = {
    "packages",
    "learning",
    "codenames.html",
    "__pycache__",
    ".venv",
}


def load_yaml(path: Path) -> Any:
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    return data


def package_files(kit: Path) -> list[Path]:
    root = kit / "registry" / "packages"
    if not root.is_dir():
        return []
    return sorted(
        p
        for p in root.glob("*.yaml")
        if p.name != "index.yaml" and not p.name.startswith(".")
    )


def factor_ids(kit: Path) -> set[str]:
    idx = load_yaml(kit / "registry" / "index.yaml") or {}
    out: set[str] = set()
    for entry in idx.get("entries") or []:
        fid = entry.get("id")
        if fid:
            out.add(str(fid))
    return out


def package_ids(files: list[Path]) -> set[str]:
    ids: set[str] = set()
    for path in files:
        data = load_yaml(path) or {}
        pid = data.get("id")
        if pid:
            ids.add(str(pid))
    return ids


def scan_collisions(kit: Path, codenames: list[str]) -> list[str]:
    """Return paths where full-form codename appears outside packages/generated."""
    hits: list[str] = []
    for root_name in SCAN_ROOTS:
        root = kit / root_name
        if not root.is_dir():
            continue
        for path in root.rglob("*"):
            if not path.is_file():
                continue
            if path.suffix.lower() not in {".md", ".mdc", ".yaml", ".yml", ".py", ".ps1", ".sh", ".txt"}:
                continue
            rel = path.relative_to(kit).as_posix()
            if any(part in rel.replace("\\", "/") for part in ("registry/packages/",)):
                continue
            if path.name == "codenames.html":
                continue
            # Recognition / prompt surfaces may cite full-form names on purpose
            if rel in {"docs/CODENAMES.md", "docs/BOOTSTRAP_PROMPT.md"}:
                continue
            if "learning/" in rel.replace("\\", "/"):
                continue
            try:
                text = path.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            for cn in codenames:
                if cn in text:
                    hits.append(f"{rel}: {cn}")
    return hits


def validate_package(
    data: dict[str, Any],
    path: Path,
    factors: set[str],
    known_packages: set[str],
) -> tuple[list[str], list[str]]:
    """Return (errors, warnings)."""
    errors: list[str] = []
    warnings: list[str] = []
    rel = path.name

    codename = data.get("codename")
    if not codename or not isinstance(codename, str):
        errors.append(f"{rel}: missing codename")
    elif not CODENAME_RE.match(codename):
        errors.append(f"{rel}: codename {codename!r} fails regex")

    pid = data.get("id")
    if not pid or not isinstance(pid, str):
        errors.append(f"{rel}: missing id")
    elif not ID_RE.match(pid):
        errors.append(f"{rel}: id {pid!r} must be ASCII kebab a-z0-9-")
    elif path.stem != pid:
        errors.append(f"{rel}: filename stem must match id {pid!r}")

    kind = data.get("kind")
    if kind not in {"procedure", "protocol", "operation"}:
        errors.append(f"{rel}: kind must be procedure|protocol|operation")

    if not (data.get("definition") or "").strip():
        errors.append(f"{rel}: definition required")

    brief = data.get("brief") or {}
    if not isinstance(brief, dict) or not brief.get("factors"):
        errors.append(f"{rel}: brief.factors required")
    else:
        for fid in brief.get("factors") or []:
            if fid not in factors:
                errors.append(f"{rel}: unknown factor in brief.factors: {fid}")

    for fid in data.get("caveats") or []:
        if fid not in factors:
            errors.append(f"{rel}: unknown factor in caveats: {fid}")

    for edge in data.get("then") or []:
        to = (edge or {}).get("to")
        if not to:
            continue
        if to in factors or to in known_packages:
            continue
        # Forward package refs allowed with warning (e.g. proc-polaris not yet registered)
        if str(to).startswith("proc-") or str(to).startswith("act.") or str(to).startswith("prop."):
            warnings.append(f"{rel}: then.to {to!r} not in registry yet (forward ref)")
        else:
            errors.append(f"{rel}: then.to {to!r} unknown")

    blob = yaml.dump(data, allow_unicode=True)
    for word in RESERVED_WARN:
        if word in blob and word not in (codename or ""):
            # warn if reserved concept appears outside the formal codename string itself
            if word.lower() in (codename or "").lower():
                warnings.append(f"{rel}: reserved concept {word!r} in package (warn only)")
            elif re.search(rf"\b{re.escape(word)}\b", blob):
                warnings.append(f"{rel}: reserved concept {word!r} mentioned (warn only)")

    return errors, warnings


def build_index_doc(packages: list[dict[str, Any]]) -> str:
    entries = []
    for p in packages:
        variants = p.get("variants") or {}
        var_keys = sorted(variants.keys(), key=lambda x: int(x) if str(x).isdigit() else str(x))
        then_tos = [e.get("to") for e in (p.get("then") or []) if e.get("to")]
        inputs = p.get("inputs") or {}
        entries.append(
            {
                "codename": p["codename"],
                "id": p["id"],
                "kind": p["kind"],
                "category": p.get("category") or "",
                "definition": p.get("definition") or "",
                "variants": var_keys,
                "inputs_required": list(inputs.get("required") or []),
                "then": then_tos,
                "file": f"packages/{p['id']}.yaml",
            }
        )
    doc = {
        "version": 1,
        "codename_regex": CODENAME_RE.pattern,
        "reserved_concepts_warn": list(RESERVED_WARN),
        "packages": entries,
    }
    body = yaml.dump(doc, allow_unicode=True, sort_keys=False, default_flow_style=False)
    return BANNER_YAML + body


def build_html(packages: list[dict[str, Any]]) -> str:
    # Sort: kind order then category then codename
    kind_order = {"procedure": 0, "protocol": 1, "operation": 2}
    packs = sorted(
        packages,
        key=lambda p: (
            kind_order.get(p.get("kind"), 9),
            p.get("category") or "",
            p.get("codename") or "",
        ),
    )
    rows: list[str] = []
    for p in packs:
        variants = p.get("variants") or {}
        var_s = ", ".join(
            f"{k}: {html.escape(str((v or {}).get('definition') or ''))}"
            for k, v in sorted(
                variants.items(),
                key=lambda kv: int(kv[0]) if str(kv[0]).isdigit() else str(kv[0]),
            )
        )
        inputs = p.get("inputs") or {}
        req = ", ".join(html.escape(str(x)) for x in (inputs.get("required") or []))
        then_s = ", ".join(
            html.escape(str(e.get("to")))
            for e in (p.get("then") or [])
            if e.get("to")
        )
        kind = html.escape(str(p.get("kind") or ""))
        rows.append(
            "<tr>"
            f"<td class='kind-{kind}'>{html.escape(str(p.get('codename') or ''))}</td>"
            f"<td><code>{html.escape(str(p.get('id') or ''))}</code></td>"
            f"<td class='kind-{kind}'>{kind}</td>"
            f"<td>{html.escape(str(p.get('category') or ''))}</td>"
            f"<td>{html.escape(str(p.get('definition') or ''))}</td>"
            f"<td>{var_s}</td>"
            f"<td>{req}</td>"
            f"<td>{then_s}</td>"
            "</tr>"
        )
    table_body = "\n".join(rows)
    return f"""{BANNER_HTML}<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8"/>
<title>Codenames — Agent PDCA Kit</title>
<style>
  :root {{ --bg:#0f1419; --fg:#e7ecf1; --muted:#9aa7b5; --line:#2a3441; --accent:#6cb6ff; }}
  body {{ font-family: "Segoe UI", "Hiragino Sans", Meiryo, sans-serif; margin: 1.5rem; background: var(--bg); color: var(--fg); }}
  h1 {{ font-size: 1.25rem; font-weight: 600; }}
  p {{ color: var(--muted); max-width: 52rem; }}
  input {{ width: min(28rem, 100%); padding: .5rem .75rem; border: 1px solid var(--line); border-radius: 6px; background: #151c24; color: var(--fg); }}
  table {{ width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: .9rem; }}
  th, td {{ border-bottom: 1px solid var(--line); padding: .55rem .4rem; text-align: left; vertical-align: top; }}
  th {{ color: var(--muted); font-weight: 600; }}
  code {{ color: var(--accent); }}
  .kind-procedure {{ color: #8fd19e; }}
  .kind-protocol {{ color: #f0b37a; }}
  .kind-operation {{ color: #d0a8ff; }}
  .hidden {{ display: none; }}
</style>
</head>
<body>
<h1>Codenames</h1>
<p>Human lookup for full-form triggers (<code>区分-固有名-番号</code>). Definitions live in <code>registry/packages/</code>. This page is generated — do not edit.</p>
<p><input id="q" type="search" placeholder="Filter codename / id / definition…" autocomplete="off"/></p>
<table>
<thead>
<tr><th>Codename</th><th>id</th><th>kind</th><th>category</th><th>definition</th><th>variants</th><th>inputs.required</th><th>then</th></tr>
</thead>
<tbody id="rows">
{table_body}
</tbody>
</table>
<script>
const q = document.getElementById('q');
const rows = [...document.querySelectorAll('#rows tr')];
q.addEventListener('input', () => {{
  const needle = q.value.trim().toLowerCase();
  for (const tr of rows) {{
    tr.classList.toggle('hidden', needle && !tr.textContent.toLowerCase().includes(needle));
  }}
}});
</script>
</body>
</html>
"""


def load_packages(kit: Path) -> tuple[list[dict[str, Any]], list[str], list[str]]:
    files = package_files(kit)
    factors = factor_ids(kit)
    known = package_ids(files)
    errors: list[str] = []
    warnings: list[str] = []
    packages: list[dict[str, Any]] = []
    for path in files:
        data = load_yaml(path)
        if not isinstance(data, dict):
            errors.append(f"{path.name}: expected mapping")
            continue
        e, w = validate_package(data, path, factors, known)
        errors.extend(e)
        warnings.extend(w)
        packages.append(data)
    codenames = [p["codename"] for p in packages if p.get("codename")]
    errors.extend(scan_collisions(kit, codenames))
    # duplicate codename / id
    seen_cn: set[str] = set()
    seen_id: set[str] = set()
    for p in packages:
        cn, pid = p.get("codename"), p.get("id")
        if cn in seen_cn:
            errors.append(f"duplicate codename: {cn}")
        if pid in seen_id:
            errors.append(f"duplicate id: {pid}")
        if cn:
            seen_cn.add(str(cn))
        if pid:
            seen_id.add(str(pid))
    return packages, errors, warnings


def build_artifacts(kit: Path | None = None) -> list[tuple[Path, str]]:
    root = kit or KIT_ROOT
    packages, errors, warnings = load_packages(root)
    for w in warnings:
        print(f"warn: {w}", file=sys.stderr)
    if errors:
        for e in errors:
            print(f"error: {e}", file=sys.stderr)
        raise SystemExit(1)
    return [
        (root / "registry" / "packages" / "index.yaml", build_index_doc(packages)),
        (root / "docs" / "codenames.html", build_html(packages)),
    ]


def write_codenames(kit: Path | None = None) -> int:
    root = kit or KIT_ROOT
    written = 0
    for path, body in build_artifacts(root):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(body, encoding="utf-8", newline="\n")
        written += 1
        print(f"wrote {path.relative_to(root)}")
    print(f"ok: {written} codename artifact(s)")
    return written


def main() -> int:
    write_codenames(KIT_ROOT)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
