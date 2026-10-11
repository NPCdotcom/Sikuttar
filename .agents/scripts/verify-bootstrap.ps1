# Verify consumer .agents/ bootstrap contract (learning excluded, global pointer only).
# Usage: .\verify-bootstrap.ps1 -AgentsDir C:\path\to\project\.agents
param(
    [Parameter(Mandatory = $true)]
    [string]$AgentsDir
)

$ErrorActionPreference = "Stop"
$AgentsDir = (Resolve-Path $AgentsDir).Path
$failed = 0

function Ok([string]$msg) { Write-Host "OK  $msg" -ForegroundColor Green }
function Bad([string]$msg) { Write-Host "FAIL $msg" -ForegroundColor Red; $script:failed++ }

if (-not (Test-Path (Join-Path $AgentsDir "skills"))) {
    Bad "skills/ missing under $AgentsDir"
    exit 1
}

# learning: only skeleton allowed
$learningRoot = Join-Path $AgentsDir "learning"
if (Test-Path $learningRoot) {
    $forbidden = Get-ChildItem -LiteralPath $learningRoot -Force | Where-Object {
        $_.Name -notin @("_template", "README.md", "index.yaml.example", "index.yaml")
    }
    if ($forbidden) {
        Bad ("learning/ has non-skeleton entries: " + ($forbidden.Name -join ", "))
    }
    else {
        Ok "learning/ skeleton only"
    }
    $sources = Get-ChildItem -LiteralPath $learningRoot -Recurse -Directory -Filter "sources" -ErrorAction SilentlyContinue
    if ($sources) {
        Bad "learning/**/sources present (must not copy topic sources)"
    }
}
else {
    Ok "learning/ absent (acceptable; template optional)"
}

# global pointer
$globalDir = Join-Path $AgentsDir "memory\global"
$pointer = Join-Path $globalDir "README.md"
if (-not (Test-Path $pointer)) {
    Bad "memory/global/README.md (pointer) missing"
}
else {
    Ok "memory/global/README.md present"
}
$knowledge = Join-Path $globalDir "knowledge"
$gIndex = Join-Path $globalDir "index.yaml"
if (Test-Path $knowledge) {
    $kfiles = Get-ChildItem -LiteralPath $knowledge -Recurse -File -ErrorAction SilentlyContinue
    if ($kfiles) { Bad "memory/global/knowledge/ has files (home canonical only)" }
    else { Ok "memory/global/knowledge/ empty or absent of files" }
}
else {
    Ok "memory/global/knowledge/ absent (expected)"
}
if (Test-Path $gIndex) {
    Bad "memory/global/index.yaml present (should live in home canonical)"
}
else {
    Ok "memory/global/index.yaml absent in consumer"
}

# venv should not be copied as kit residue without setup — warn only if huge unexpected
$venv = Join-Path $AgentsDir "env\python\.venv"
if (Test-Path $venv) {
    Write-Host "WARN env/python/.venv exists (OK if setup.ps1 was run)" -ForegroundColor Yellow
}
else {
    Ok "env/python/.venv absent (run setup.ps1 when ready)"
}

# required kit pieces
foreach ($req in @("hooks.json", "hooks", "docs\BOOTSTRAP_MANIFEST.md", "scripts\copy-kit.ps1")) {
    if (-not (Test-Path (Join-Path $AgentsDir $req))) {
        Bad "missing $req"
    }
    else {
        Ok "has $req"
    }
}

if ($failed -gt 0) {
    Write-Host "`nISSUES=$failed" -ForegroundColor Red
    exit 1
}
Write-Host "`nISSUES=0" -ForegroundColor Green
exit 0
