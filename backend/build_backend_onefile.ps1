param(
    [string]$ProjectRoot = (Split-Path -Parent $MyInvocation.MyCommand.Path)
)

$ErrorActionPreference = "Stop"

Set-Location $ProjectRoot

$entryScript = Join-Path $ProjectRoot "app\main.py"
$distDir = Join-Path $ProjectRoot "dist"

if (-not (Test-Path $entryScript)) {
    throw "Entry script not found: $entryScript"
}

uv run --with pyinstaller pyinstaller `
    --noconfirm `
    --clean `
    --onefile `
    --name LabFlowBackend `
    --paths $ProjectRoot `
    --collect-submodules app `
    --collect-all asyncmy `
    --recursive-copy-metadata pydantic-ai `
    --recursive-copy-metadata pydantic-ai-slim `
    --copy-metadata genai-prices `
    --add-data "$ProjectRoot\.env.example;." `
    $entryScript

Copy-Item -Force (Join-Path $ProjectRoot ".env.example") (Join-Path $distDir ".env.example")

if (Test-Path (Join-Path $ProjectRoot ".env")) {
    Copy-Item -Force (Join-Path $ProjectRoot ".env") (Join-Path $distDir ".env")
}

Write-Host "Build completed: $distDir\LabFlowBackend.exe"
