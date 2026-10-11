#!/usr/bin/env bash
# Verify consumer .agents/ bootstrap contract.
# Usage: ./verify-bootstrap.sh /path/to/project/.agents
set -euo pipefail

AGENTS_DIR="${1:-}"
if [[ -z "$AGENTS_DIR" || ! -d "$AGENTS_DIR" ]]; then
  echo "Usage: $0 DEST_AGENTS_DIR" >&2
  exit 1
fi
AGENTS_DIR="$(cd "$AGENTS_DIR" && pwd)"
failed=0

ok() { echo "OK  $1"; }
bad() { echo "FAIL $1"; failed=$((failed + 1)); }

[[ -d "$AGENTS_DIR/skills" ]] || { bad "skills/ missing"; exit 1; }

if [[ -d "$AGENTS_DIR/learning" ]]; then
  while IFS= read -r name; do
    case "$name" in
      _template|README.md|index.yaml.example|index.yaml) ;;
      *) bad "learning/ has non-skeleton entry: $name" ;;
    esac
  done < <(ls -A "$AGENTS_DIR/learning")
  if find "$AGENTS_DIR/learning" -type d -name sources | grep -q .; then
    bad "learning/**/sources present"
  else
    ok "learning/ skeleton only"
  fi
else
  ok "learning/ absent"
fi

if [[ -f "$AGENTS_DIR/memory/global/README.md" ]]; then
  ok "memory/global/README.md present"
else
  bad "memory/global/README.md missing"
fi
if [[ -f "$AGENTS_DIR/memory/global/index.yaml" ]]; then
  bad "memory/global/index.yaml present in consumer"
else
  ok "memory/global/index.yaml absent in consumer"
fi
if [[ -d "$AGENTS_DIR/memory/global/knowledge" ]] && find "$AGENTS_DIR/memory/global/knowledge" -type f | grep -q .; then
  bad "memory/global/knowledge/ has files"
else
  ok "memory/global/knowledge/ empty or absent"
fi

for req in hooks.json hooks docs/BOOTSTRAP_MANIFEST.md scripts/copy-kit.ps1; do
  if [[ -e "$AGENTS_DIR/$req" ]]; then ok "has $req"; else bad "missing $req"; fi
done

echo
echo "ISSUES=$failed"
[[ "$failed" -eq 0 ]]
