#!/usr/bin/env bash
# Copy Agent PDCA kit into a consumer project ./.agents/ using include/exclude manifests.
# Never copies learning topic data or home global knowledge.
#
# Usage:
#   ./copy-kit.sh /path/to/project/.agents
#   ./copy-kit.sh --dry-run /path/to/project/.agents
#   SOURCE=~/.agents ./copy-kit.sh /path/to/project/.agents
set -euo pipefail

DRY_RUN=0
DEST=""
SOURCE="${SOURCE:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run|-n) DRY_RUN=1; shift ;;
    --source) SOURCE="$2"; shift 2 ;;
    -*) echo "Unknown option: $1" >&2; exit 1 ;;
    *) DEST="$1"; shift ;;
  esac
done

if [[ -z "$DEST" ]]; then
  echo "Usage: $0 [--dry-run] [--source KIT] DEST_AGENTS_DIR" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
resolve_kit() {
  local hint="$1"
  if [[ -n "$hint" && -d "$hint/skills" ]]; then
    (cd "$hint" && pwd)
    return
  fi
  local from_script
  from_script="$(cd "$SCRIPT_DIR/.." && pwd)"
  if [[ -d "$from_script/skills" ]]; then
    echo "$from_script"
    return
  fi
  local home_kit="${HOME}/.agents"
  if [[ -d "$home_kit/skills" ]]; then
    echo "$home_kit"
    return
  fi
  echo "Cannot locate kit root (skills/ missing)." >&2
  exit 1
}

SOURCE="$(resolve_kit "$SOURCE")"
mkdir -p "$(dirname "$DEST")"
DEST="$(mkdir -p "$DEST" && cd "$DEST" && pwd)"

INCLUDE_FILE="$SOURCE/scripts/templates/copy-kit.include"
EXCLUDE_FILE="$SOURCE/scripts/templates/copy-kit.exclude"
POINTER_SRC="$SOURCE/skills/memory-reference/assets/global/CONSUMER_POINTER.md"

[[ -f "$INCLUDE_FILE" ]] || { echo "Missing $INCLUDE_FILE" >&2; exit 1; }
[[ -f "$EXCLUDE_FILE" ]] || { echo "Missing $EXCLUDE_FILE" >&2; exit 1; }

mapfile -t INCLUDES < <(grep -v '^\s*#' "$INCLUDE_FILE" | grep -v '^\s*$' | sed 's|\\|/|g')
mapfile -t EXCLUDES < <(grep -v '^\s*#' "$EXCLUDE_FILE" | grep -v '^\s*$' | sed 's|\\|/|g')

is_excluded() {
  local rel="$1"
  local e prefix
  for e in "${EXCLUDES[@]}"; do
    e="${e%/}"
    if [[ "$rel" == "$e" || "$rel" == "$e"/* ]]; then
      return 0
    fi
    if [[ "$e" == *"/**/"* ]]; then
      prefix="${e%%/\*\*/*}"
      mid="${e#*/**/}"
      mid="${mid%/}"
      if [[ "$rel" == "$prefix"/* && "$rel" == *"/$mid"* ]]; then
        return 0
      fi
    fi
  done
  return 1
}

FILES=()
BYTES=0
EXCLUDE_HITS=0

while IFS= read -r entry; do
  entry="${entry%/}"
  src="$SOURCE/$entry"
  if [[ ! -e "$src" ]]; then
    echo "WARN: include missing (skip): $entry" >&2
    continue
  fi
  if [[ -d "$src" ]]; then
    while IFS= read -r -d '' f; do
      rel="${f#"$SOURCE"/}"
      if is_excluded "$rel"; then
        EXCLUDE_HITS=$((EXCLUDE_HITS + 1))
        continue
      fi
      FILES+=("$rel")
      sz=$(wc -c <"$f" | tr -d ' ')
      BYTES=$((BYTES + sz))
    done < <(find "$src" -type f -print0)
  else
    rel="$entry"
    if is_excluded "$rel"; then
      EXCLUDE_HITS=$((EXCLUDE_HITS + 1))
      continue
    fi
    FILES+=("$rel")
    sz=$(wc -c <"$src" | tr -d ' ')
    BYTES=$((BYTES + sz))
  fi
done < <(printf '%s\n' "${INCLUDES[@]}")

bad_learning=0
bad_global=0
for rel in "${FILES[@]}"; do
  case "$rel" in
    learning/_template/*|learning/README.md|learning/index.yaml.example) ;;
    learning/*) bad_learning=$((bad_learning + 1)) ;;
  esac
  case "$rel" in
    memory/global/README.md) ;;
    memory/global/*) bad_global=$((bad_global + 1)) ;;
  esac
done

echo "Source: $SOURCE"
echo "Dest:   $DEST"
awk -v b="$BYTES" -v n="${#FILES[@]}" 'BEGIN{printf "Files:  %d  (~%.2f MB)\n", n, b/1024/1024}'
echo "Exclude hits during scan: $EXCLUDE_HITS"

if [[ "$bad_learning" -gt 0 ]]; then
  echo "Refusing copy: learning topic files in plan ($bad_learning)" >&2
  exit 1
fi
if [[ "$bad_global" -gt 0 ]]; then
  echo "Refusing copy: global knowledge in plan ($bad_global)" >&2
  exit 1
fi

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo
  echo "[dry-run] Sample paths (up to 40):"
  i=0
  for rel in "${FILES[@]}"; do
    echo "  $rel"
    i=$((i + 1))
    [[ $i -ge 40 ]] && break
  done
  [[ ${#FILES[@]} -gt 40 ]] && echo "  ... +$(((${#FILES[@]} - 40)) more"
  echo
  echo "[dry-run] Would write memory/global/README.md (CONSUMER_POINTER)"
  exit 0
fi

for rel in "${FILES[@]}"; do
  mkdir -p "$DEST/$(dirname "$rel")"
  cp -f "$SOURCE/$rel" "$DEST/$rel"
done

for d in \
  memory/episodes memory/traces memory/evaluations memory/history memory/state \
  memory/knowledge/alignment memory/knowledge/lessons memory/rewards memory/audit memory/global
do
  mkdir -p "$DEST/$d"
done

if [[ -f "$POINTER_SRC" ]]; then
  cp -f "$POINTER_SRC" "$DEST/memory/global/README.md"
else
  cat >"$DEST/memory/global/README.md" <<'EOF'
# Global memory — use home canonical path
Windows: %USERPROFILE%\.agents\memory\global\
Unix: ~/.agents/memory/global/
See docs/BOOTSTRAP_MANIFEST.md
EOF
fi

echo
echo "Done. Copied ${#FILES[@]} files."
echo "Pointer: $DEST/memory/global/README.md"
echo
echo "Next: link-cursor → env setup → maintain-bootstrap → verify-bootstrap"
