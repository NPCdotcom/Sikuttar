#!/usr/bin/env bash
# Initialize local Git for a kit consumer project (docs/GIT_WORKFLOW.md §9).
# Usage: ./.agents/scripts/git-init.sh [--remote github.com/<owner>/<repo>] [--branch main] [--no-commit]
set -euo pipefail

ROOT="$(pwd)"
REMOTE=""
BRANCH="main"
NO_COMMIT=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --remote) REMOTE="$2"; shift 2;;
    --branch) BRANCH="$2"; shift 2;;
    --no-commit) NO_COMMIT=1; shift;;
    *) ROOT="$1"; shift;;
  esac
done
cd "$ROOT"

if [[ -d .agents/skills ]]; then KIT=".agents"; elif [[ -d skills ]]; then KIT="."; else
  echo "Kit not found (.agents/skills). Run from project root." >&2; exit 1; fi
TPL="$KIT/scripts/templates"

command -v git >/dev/null || { echo "git not installed" >&2; exit 1; }

if [[ "$(git rev-parse --is-inside-work-tree 2>/dev/null || true)" != "true" ]]; then
  git init -b "$BRANCH" >/dev/null && echo "git init ($BRANCH)"
else
  echo "Exists: git repo"
fi

ensure() { if [[ -e "$1" ]]; then echo "Exists: $1"; else cp "$2" "$1"; echo "Created: $1"; fi; }
ensure .gitignore     "$TPL/gitignore.consumer"
ensure .gitattributes "$TPL/gitattributes.consumer"
ensure .gitmessage    "$TPL/gitmessage.consumer"

git config commit.template .gitmessage
git config core.autocrlf false

if [[ $NO_COMMIT -eq 0 ]]; then
  if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
    git add .gitignore .gitattributes .gitmessage
    [[ -f AGENTS.md ]] && git add AGENTS.md
    [[ -d docs ]] && git add docs
    [[ -d .agents ]] && git add .agents
    git commit -q -m "chore(kit): bootstrap agent kit" -m "Initial commit created by .agents/scripts/git-init.sh" -m "Gate: bootstrap"
    echo "Initial commit created"
  else
    echo "Exists: commits"
  fi
fi

if [[ -n "$REMOTE" ]]; then
  if ! command -v gh >/dev/null; then echo "gh not installed — skip remote" >&2
  elif git remote get-url origin >/dev/null 2>&1; then echo "Exists: origin=$(git remote get-url origin)"
  else
    read -r -p "Create private GitHub repo '$REMOTE' and push? (y/N) " ans
    if [[ "$ans" == "y" ]]; then gh repo create "$REMOTE" --private --source . --remote origin --push; else echo "Skipped remote creation"; fi
  fi
fi

echo; echo "Verify:"; git branch --show-current; git log --oneline -3
