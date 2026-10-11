# Initialize local Git for a kit consumer project (docs/GIT_WORKFLOW.md §9).
# Run from project root. Idempotent: skips steps already done.
param(
    [string]$Root = (Get-Location).Path,
    [string]$Remote = "",          # e.g. github.com/<owner>/<repo>  (uses gh; asks before creating)
    [string]$DefaultBranch = "main",
    [switch]$NoCommit
)

# Native git writes probes to stderr; keep Continue and check $LASTEXITCODE instead of Stop.
$ErrorActionPreference = "Continue"
function Git-Probe { param([string[]]$GitArgs)  # returns stdout or $null when git exits non-zero
    $out = & git @GitArgs 2>$null
    if ($LASTEXITCODE -ne 0) { return $null }
    return ($out | Out-String).Trim()
}
$Root = (Resolve-Path $Root).Path
$kit = if (Test-Path (Join-Path $Root ".agents\skills")) { Join-Path $Root ".agents" } elseif (Test-Path (Join-Path $Root "skills")) { $Root } else { $null }
if (-not $kit) { Write-Error "Kit not found (.agents/skills). Run from project root after copying the kit."; exit 1 }
$tpl = Join-Path $kit "scripts\templates"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Write-Error "git not installed"; exit 1 }

Push-Location $Root
try {
    $inside = Git-Probe @("rev-parse","--is-inside-work-tree")
    if ($inside -ne "true") {
        git init -b $DefaultBranch | Out-Null
        Write-Host "git init ($DefaultBranch)"
    } else {
        Write-Host "Exists: git repo"
    }

    function Ensure-File([string]$Name, [string]$Src) {
        $dst = Join-Path $Root $Name
        if (Test-Path $dst) { Write-Host "Exists: $Name"; return }
        Copy-Item $Src $dst
        Write-Host "Created: $Name"
    }
    Ensure-File ".gitignore"     (Join-Path $tpl "gitignore.consumer")
    Ensure-File ".gitattributes" (Join-Path $tpl "gitattributes.consumer")
    Ensure-File ".gitmessage"    (Join-Path $tpl "gitmessage.consumer")

    git config commit.template .gitmessage
    git config core.autocrlf false          # .gitattributes governs EOL
    Write-Host "git config: commit.template, core.autocrlf=false (local)"

    if (-not $NoCommit) {
        $hasCommit = Git-Probe @("rev-parse","--verify","HEAD")
        if (-not $hasCommit) {
            git add .gitignore .gitattributes .gitmessage
            if (Test-Path "AGENTS.md") { git add AGENTS.md }
            if (Test-Path "docs")      { git add docs }
            if (Test-Path ".agents")   { git add .agents }   # memory/ excluded by .gitignore
            $msg = Join-Path $env:TEMP "agents-git-init-msg.txt"
            [System.IO.File]::WriteAllText($msg, "chore(kit): bootstrap agent kit`n`nInitial commit created by .agents/scripts/git-init.ps1`n`nGate: bootstrap`n", (New-Object System.Text.UTF8Encoding($false)))
            git commit -q -F $msg
            Remove-Item $msg -ErrorAction SilentlyContinue
            Write-Host "Initial commit created"
        } else {
            Write-Host "Exists: commits"
        }
    }

    if ($Remote) {
        if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { Write-Warning "gh not installed — skip remote"; }
        else {
            $existing = Git-Probe @("remote","get-url","origin")
            if ($existing) { Write-Host "Exists: origin=$existing" }
            else {
                $name = ($Remote -split '/')[-1]
                $ans = Read-Host "Create private GitHub repo '$Remote' and push? (y/N)"
                if ($ans -eq 'y') {
                    gh repo create $Remote --private --source . --remote origin --push
                } else { Write-Host "Skipped remote creation" }
            }
        }
    }

    Write-Host ""
    Write-Host "Verify:"
    git branch --show-current
    git log --oneline -3
}
finally { Pop-Location }
