#!/usr/bin/env python3
"""Generate design expression surfaces from registry/ (SKILL.md + mdc).

Canonical entry: python scripts/generate-expressions.py
Also: python env/bin/agents-run.py maintain-adhoc generate-expressions

Preserves existing frontmatter keys used for Cursor selection
(name/description for skills; description/alwaysApply for rules).
"""
from __future__ import annotations

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
REGISTRY = KIT_ROOT / "registry"
CLUSTER = REGISTRY / "clusters" / "design.yaml"
EXPRESSIONS = REGISTRY / "expressions" / "design.yaml"
SKILLS = KIT_ROOT / "skills"

BANNER = "<!-- GENERATED from registry/ — do not edit; run generate-expressions.py -->"

KIND_ORDER = ("prop", "act", "path", "template", "cap")
KIND_LABEL = {
    "prop": "Properties (prop)",
    "act": "Actions (act)",
    "path": "Paths (path)",
    "template": "Templates (template)",
    "cap": "Capabilities (cap)",
}

# Fixed map for stewardship Skills table (id → Cursor skill name)
SKILL_PURPOSE = [
    ("Terminology", "`cap.research.terminology` → **`terminology-research`**"),
    ("Deliberate", "`design-deliberate`"),
    ("Reference", "`design-reference`"),
    ("Record design", "`design-record`"),
    ("Record ADR/glossary", "`doc-record`"),
    ("Role", "**`spec_designer`**"),
]


def load_yaml(path: Path) -> dict:
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise SystemExit(f"expected mapping in {path}")
    return data


def factor_map(cluster: dict) -> dict[str, dict]:
    out: dict[str, dict] = {}
    for fac in cluster.get("factors") or []:
        fid = fac.get("id")
        if not fid:
            raise SystemExit(f"factor missing id in {CLUSTER}")
        out[fid] = fac
    return out


def parse_frontmatter(text: str) -> dict[str, Any]:
    m = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n", text, re.DOTALL)
    if not m:
        return {}
    fm = yaml.safe_load(m.group(1)) or {}
    return fm if isinstance(fm, dict) else {}


def read_frontmatter(path: Path) -> dict[str, Any]:
    if not path.is_file():
        return {}
    return parse_frontmatter(path.read_text(encoding="utf-8"))


def owner_link_from(owner: str | None, *, from_skills: bool) -> str | None:
    if not owner:
        return None
    if from_skills:
        if owner.startswith("skills/"):
            return (Path("..") / Path(owner).relative_to("skills")).as_posix()
        return f"../../{owner}"
    # rules/*.mdc
    if owner.startswith("skills/"):
        return f"../{owner}"
    if owner.startswith("docs/"):
        return f"../{owner}"
    return f"../{owner}"


def group_by_kind(factors: list[dict]) -> dict[str, list[dict]]:
    by_kind: dict[str, list[dict]] = {k: [] for k in KIND_ORDER}
    for fac in factors:
        k = fac.get("kind") or "act"
        by_kind.setdefault(k, []).append(fac)
    return by_kind


def phase_label(phase: list) -> str:
    return "–".join(str(p) for p in phase) if phase else "P0–P3"


def render_factor_sections(
    factors: list[dict], *, from_skills: bool
) -> list[str]:
    by_kind = group_by_kind(factors)
    lines: list[str] = []
    for kind in KIND_ORDER:
        group = by_kind.get(kind) or []
        if not group:
            continue
        lines.append(f"## {KIND_LABEL.get(kind, kind)}")
        lines.append("")
        for fac in group:
            fid = fac["id"]
            text = (fac.get("text") or "").strip()
            lines.append(f"- `{fid}` — {text}")
            link = owner_link_from(fac.get("owner"), from_skills=from_skills)
            if link and fac.get("owner"):
                lines.append(f"  - Detail: [`{fac['owner']}`]({link})")
        lines.append("")
    return lines


def render_skill(
    *,
    name: str,
    description: str,
    recognition: str,
    phase: list,
    factors: list[dict],
) -> str:
    phase_s = phase_label(phase)
    lines: list[str] = [
        "---",
        f"name: {name}",
        f"description: {description}",
        "---",
        "",
        BANNER,
        "",
        f"# {name}",
        "",
        f"**Role**: `{recognition}` · **Phase**: {phase_s}",
        "",
        "Expression surface generated from `registry/`. Factor bodies live in the registry; "
        "procedure detail lives at each factor's `owner` path.",
        "",
    ]
    lines.extend(render_factor_sections(factors, from_skills=True))

    prop_ids = [f["id"] for f in group_by_kind(factors).get("prop") or []]
    if prop_ids:
        lines.append("## Do-not (prop ids)")
        lines.append("")
        for pid in prop_ids:
            lines.append(f"- `{pid}`")
        lines.append("")

    lines.append("## Owners")
    lines.append("")
    lines.append("Do not restate factor text in references. Follow owner paths for steps.")
    lines.append("")
    return "\n".join(lines)


def render_rule(
    *,
    description: str,
    always_apply: bool,
    recognition: str,
    phase: list,
    factors: list[dict],
) -> str:
    phase_s = phase_label(phase)
    aa = "true" if always_apply else "false"
    lines: list[str] = [
        "---",
        f"description: {description}",
        f"alwaysApply: {aa}",
        "---",
        "",
        BANNER,
        "",
        f"# Design stewardship（`{recognition}`）",
        "",
        f"**Role**: `{recognition}` · **Phase**: {phase_s}",
        "",
        "**Requirements**: `docs/requirements/<slug>/`（P1–P2）  ",
        "**Specs**: `docs/design/`（H0–H5）  ",
        "**ADR & glossary**: `docs/adr/`, `docs/glossary/`  ",
        "**Plans**: `.agents/plans/` → **`plan_slicer`**  ",
        "**Factors**: `registry/clusters/design.yaml`（正本 · 発現は GENERATED）",
        "",
        "## Factors",
        "",
    ]
    lines.extend(render_factor_sections(factors, from_skills=False))

    lines.append("## Design semantics")
    lines.append("")
    lines.append("1. Read [`docs/DESIGN_SEMANTICS.md`](../docs/DESIGN_SEMANTICS.md)")
    lines.append("2. Prefer factor registration — `prop.design.no_forced_class_hierarchy`")
    lines.append("3. Keep “object” as recognition/spec language unless consumer `AGENTS.md` defines otherwise")
    lines.append("")
    lines.append("Rule: `design-semantics-guard.mdc`")
    lines.append("")
    lines.append("## Skills（expressions）")
    lines.append("")
    lines.append("| Purpose | Use |")
    lines.append("|---------|-----|")
    for purpose, use in SKILL_PURPOSE:
        lines.append(f"| {purpose} | {use} |")
    lines.append("")
    lines.append("## Do-not (prop ids)")
    lines.append("")
    for fac in group_by_kind(factors).get("prop") or []:
        lines.append(f"- `{fac['id']}`")
    lines.append("")
    lines.append("## vs plan_slicer")
    lines.append("")
    lines.append("| Phase | Role | Artifact |")
    lines.append("|-------|------|----------|")
    lines.append(f"| Deliberation & design | `{recognition}` | `docs/design/` |")
    lines.append("| Implementation plan | `plan_slicer` | `.agents/plans/` |")
    lines.append("")
    lines.append("Do not store deliberation in `.agents/plans/`.")
    lines.append("")
    return "\n".join(lines)


def resolve_factors(expr: dict, fmap: dict[str, dict]) -> list[dict]:
    name = expr.get("name") or "?"
    facs: list[dict] = []
    for fid in expr.get("factors") or []:
        if fid not in fmap:
            raise SystemExit(f"{name}: unknown factor id {fid}")
        facs.append(fmap[fid])
    return facs


def build_expressions(
    kit_root: Path | None = None,
) -> list[tuple[Path, str]]:
    """Return list of (absolute path, full file text) without writing."""
    root = kit_root or KIT_ROOT
    cluster_path = root / "registry" / "clusters" / "design.yaml"
    expr_path = root / "registry" / "expressions" / "design.yaml"
    cluster = load_yaml(cluster_path)
    expr_doc = load_yaml(expr_path)
    fmap = factor_map(cluster)
    # merge shared factors if missing from cluster (shared ids live in both)
    shared_path = root / "registry" / "shared.yaml"
    if shared_path.is_file():
        for fac in (load_yaml(shared_path).get("factors") or []):
            fid = fac.get("id")
            if fid and fid not in fmap:
                fmap[fid] = fac
    meta = cluster.get("meta") or {}
    recognition = meta.get("recognition") or "spec_designer"
    phase = meta.get("phase") or ["P0", "P1", "P2", "P3"]

    out: list[tuple[Path, str]] = []
    for expr in expr_doc.get("expressions") or []:
        name = expr["name"]
        kind = expr.get("kind") or "skill"
        facs = resolve_factors(expr, fmap)

        if kind == "skill":
            path = root / "skills" / name / "SKILL.md"
            fm = read_frontmatter(path)
            description = (
                str(fm["description"])
                if fm.get("description") is not None
                else (expr.get("description") or name)
            )
            out_name = str(fm["name"]) if fm.get("name") is not None else name
            body = render_skill(
                name=out_name,
                description=description,
                recognition=recognition,
                phase=phase,
                factors=facs,
            )
            out.append((path, body))
        elif kind == "rule":
            rel = expr.get("path")
            if not rel:
                raise SystemExit(f"{name}: kind=rule requires path")
            path = root / rel
            fm = read_frontmatter(path)
            description = (
                str(fm["description"])
                if fm.get("description") is not None
                else (expr.get("description") or name)
            )
            always_apply = bool(fm.get("alwaysApply", False))
            body = render_rule(
                description=description,
                always_apply=always_apply,
                recognition=recognition,
                phase=phase,
                factors=facs,
            )
            out.append((path, body))
        else:
            raise SystemExit(f"{name}: unknown expression kind {kind!r}")
    return out


def write_expressions(kit_root: Path | None = None) -> int:
    root = kit_root or KIT_ROOT
    written = 0
    for path, body in build_expressions(root):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(body, encoding="utf-8", newline="\n")
        written += 1
        try:
            rel = path.relative_to(root)
        except ValueError:
            rel = path
        print(f"wrote {rel}")
    print(f"ok: {written} expression(s)")
    return written


def main() -> int:
    write_expressions(KIT_ROOT)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
