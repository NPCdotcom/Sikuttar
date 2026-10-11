# Copy Agent PDCA kit into a consumer project ./.agents/ using include/exclude manifests.
# Never copies learning topic data or home global knowledge.
#
# Usage:
#   .\copy-kit.ps1 -Dest C:\path\to\project\.agents
#   .\copy-kit.ps1 -Dest C:\path\to\project\.agents -WhatIf
#   .\copy-kit.ps1 -Source $env:USERPROFILE\.agents -Dest .\myproj\.agents
param(
    [string]$Source = "",
    [Parameter(Mandatory = $true)]
    [string]$Dest,
    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"
$ScriptRoot = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }

function Resolve-KitRoot {
    param([string]$Hint)
    if ($Hint -and (Test-Path (Join-Path $Hint "skills"))) {
        return (Resolve-Path $Hint).Path
    }
    $fromScript = Split-Path -Parent $ScriptRoot
    if (Test-Path (Join-Path $fromScript "skills")) {
        return (Resolve-Path $fromScript).Path
    }
    $homeKit = Join-Path $env:USERPROFILE ".agents"
    if (Test-Path (Join-Path $homeKit "skills")) {
        return (Resolve-Path $homeKit).Path
    }
    throw "Cannot locate kit root (skills/ missing). Pass -Source."
}

$Source = Resolve-KitRoot -Hint $Source
$Dest = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Dest)

$includeFile = Join-Path $Source "scripts\templates\copy-kit.include"
$excludeFile = Join-Path $Source "scripts\templates\copy-kit.exclude"
$pointerSrc = Join-Path $Source "skills\memory-reference\assets\global\CONSUMER_POINTER.md"

if (-not (Test-Path $includeFile)) { throw "Missing include list: $includeFile" }
if (-not (Test-Path $excludeFile)) { throw "Missing exclude list: $excludeFile" }

function Read-ManifestLines {
    param([string]$Path)
    Get-Content -LiteralPath $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) { return }
        $line -replace "/", "\"
    }
}

$includes = @(Read-ManifestLines $includeFile)
$excludes = @(Read-ManifestLines $excludeFile)

function Test-Excluded {
    param([string]$RelPath)
    $norm = $RelPath -replace "/", "\"
    foreach ($ex in $excludes) {
        $e = $ex.TrimEnd("\")
        if ($norm -eq $e) { return $true }
        if ($norm.StartsWith($e + "\", [StringComparison]::OrdinalIgnoreCase)) { return $true }
        if ($e -match "\\\*\*\\") {
            $parts = $e -split "\\\*\*\\"
            if ($parts.Count -eq 2) {
                $mid = $parts[1].TrimEnd("\")
                if ($norm.StartsWith($parts[0] + "\", [StringComparison]::OrdinalIgnoreCase) -and
                    $norm.IndexOf("\" + $mid, [StringComparison]::OrdinalIgnoreCase) -ge 0) {
                    return $true
                }
            }
        }
    }
    return $false
}

$toCopy = New-Object System.Collections.Generic.List[object]
$excludedHits = New-Object System.Collections.Generic.List[string]
$bytes = [int64]0

foreach ($entry in $includes) {
    $srcPath = Join-Path $Source $entry.TrimEnd("\")
    if (-not (Test-Path -LiteralPath $srcPath)) {
        Write-Warning "Include missing (skip): $entry"
        continue
    }
    $item = Get-Item -LiteralPath $srcPath
    if ($item.PSIsContainer) {
        foreach ($file in Get-ChildItem -LiteralPath $srcPath -Recurse -File -Force) {
            $rel = $file.FullName.Substring($Source.Length).TrimStart("\", "/")
            $rel = $rel -replace "/", "\"
            if (Test-Excluded $rel) {
                [void]$excludedHits.Add($rel)
                continue
            }
            [void]$toCopy.Add([pscustomobject]@{ Rel = $rel; Full = $file.FullName; Size = $file.Length })
            $bytes += $file.Length
        }
    }
    else {
        $rel = $entry -replace "/", "\"
        if (Test-Excluded $rel) {
            [void]$excludedHits.Add($rel)
            continue
        }
        [void]$toCopy.Add([pscustomobject]@{ Rel = $rel; Full = $item.FullName; Size = $item.Length })
        $bytes += $item.Length
    }
}

$badLearning = @($toCopy | Where-Object {
        $_.Rel -match '^learning\\' -and
        $_.Rel -notmatch '^learning\\_template\\' -and
        $_.Rel -ne 'learning\README.md' -and
        $_.Rel -ne 'learning\index.yaml.example'
    })
$badGlobal = @($toCopy | Where-Object {
        $_.Rel -match '^memory\\global\\' -and
        $_.Rel -ne 'memory\global\README.md'
    })

Write-Host "Source: $Source"
Write-Host "Dest:   $Dest"
Write-Host ("Files:  {0}  (~{1:N2} MB)" -f $toCopy.Count, ($bytes / 1MB))
Write-Host ("Exclude hits during scan: {0}" -f $excludedHits.Count)
if ($badLearning.Count -gt 0) {
    throw "Refusing copy: learning topic files in plan ($($badLearning.Count)). Check include/exclude."
}
if ($badGlobal.Count -gt 0) {
    throw "Refusing copy: global knowledge in plan ($($badGlobal.Count)). Check include/exclude."
}

if ($WhatIf) {
    Write-Host "`n[WhatIf] Sample paths (up to 40):"
    $toCopy | Select-Object -First 40 | ForEach-Object { Write-Host "  $($_.Rel)" }
    if ($toCopy.Count -gt 40) { Write-Host ("  ... +{0} more" -f ($toCopy.Count - 40)) }
    Write-Host "`n[WhatIf] Would also write memory\global\README.md (CONSUMER_POINTER)"
    Write-Host "[WhatIf] Empty dirs: memory\episodes, traces, evaluations, history, state, knowledge\*, global"
    exit 0
}

New-Item -ItemType Directory -Force -Path $Dest | Out-Null

foreach ($f in $toCopy) {
    $target = Join-Path $Dest $f.Rel
    $parent = Split-Path -Parent $target
    if (-not (Test-Path $parent)) {
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
    }
    Copy-Item -LiteralPath $f.Full -Destination $target -Force
}

$emptyDirs = @(
    "memory\episodes",
    "memory\traces",
    "memory\evaluations",
    "memory\history",
    "memory\state",
    "memory\knowledge\alignment",
    "memory\knowledge\lessons",
    "memory\rewards",
    "memory\audit",
    "memory\global"
)
foreach ($d in $emptyDirs) {
    New-Item -ItemType Directory -Force -Path (Join-Path $Dest $d) | Out-Null
}

$pointerDest = Join-Path $Dest "memory\global\README.md"
if (Test-Path $pointerSrc) {
    Copy-Item -LiteralPath $pointerSrc -Destination $pointerDest -Force
}
else {
    Write-Warning "CONSUMER_POINTER.md missing; writing minimal pointer"
    @"
# Global memory — use home canonical path
Windows: %USERPROFILE%\.agents\memory\global\
Unix: ~/.agents/memory/global/
See docs/BOOTSTRAP_MANIFEST.md
"@ | Set-Content -LiteralPath $pointerDest -Encoding UTF8
}

Write-Host "`nDone."
Write-Host ("Copied {0} files (~{1:N2} MB)" -f $toCopy.Count, ($bytes / 1MB))
Write-Host "Pointer: $pointerDest"
Write-Host @"

Next:
  1. .\scripts\git-init.ps1   (optional, from project root)
  2. .\scripts\link-cursor.ps1
  3. .\env\bin\setup.ps1
  4. kit_maintainer + maintain-bootstrap
  5. .\scripts\verify-bootstrap.ps1 -AgentsDir `"$Dest`"
"@
