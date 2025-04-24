# Script para ejecutar pruebas del proyecto

# Colores para la salida
$Green = [ConsoleColor]::Green
$Blue = [ConsoleColor]::Cyan
$Yellow = [ConsoleColor]::Yellow
$Red = [ConsoleColor]::Red

Write-Host "=======================================================" -ForegroundColor $Blue
Write-Host "Ejecutando pruebas para TG-TheGuardian..." -ForegroundColor $Green
Write-Host "=======================================================" -ForegroundColor $Blue

# Verificar dependencias instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "Dependencias no encontradas. Instalando..." -ForegroundColor $Yellow
    npm install
}

# Inicializar variables
$testType = "all"
$watchMode = $false
$coverage = $false

# Procesar argumentos
foreach ($arg in $args) {
    switch ($arg) {
        "--integration" { $testType = "integration" }
        "--unit" { $testType = "unit" }
        "--watch" { $watchMode = $true }
        "--coverage" { $coverage = $true }
        "--mongodb" { $testType = "mongodb" }
        "--redis" { $testType = "redis" }
        "--slack" { $testType = "slack" }
        "--help" {
            Write-Host "Opciones disponibles:" -ForegroundColor $Green
            Write-Host "  --integration: Ejecuta solo pruebas de integración" -ForegroundColor $Blue
            Write-Host "  --unit: Ejecuta solo pruebas unitarias" -ForegroundColor $Blue
            Write-Host "  --mongodb: Ejecuta solo pruebas de MongoDB" -ForegroundColor $Blue
            Write-Host "  --redis: Ejecuta solo pruebas de Redis" -ForegroundColor $Blue
            Write-Host "  --slack: Ejecuta solo pruebas de Slack" -ForegroundColor $Blue
            Write-Host "  --watch: Ejecuta las pruebas en modo observador" -ForegroundColor $Blue
            Write-Host "  --coverage: Genera informe de cobertura" -ForegroundColor $Blue
            Write-Host "  --help: Muestra esta ayuda" -ForegroundColor $Blue
            Write-Host "Ejemplo: .\scripts\test.ps1 --integration --coverage" -ForegroundColor $Yellow
            exit 0
        }
    }
}

# Construir comando de prueba
$testCommand = "npm run test"
$extraArgs = ""

if ($watchMode) {
    $extraArgs += " -- --watch"
}

if ($coverage) {
    $extraArgs += " -- --coverage"
}

# Configurar comando según tipo de prueba
switch ($testType) {
    "integration" {
        $testCommand = "npm run test:integration"
        Write-Host "Ejecutando pruebas de integración..." -ForegroundColor $Green
    }
    "unit" {
        $testCommand = "npm test -- --testPathIgnorePatterns=integration"
        Write-Host "Ejecutando pruebas unitarias..." -ForegroundColor $Green
    }
    "mongodb" {
        $testCommand = "npm run test:mongodb"
        Write-Host "Ejecutando pruebas de MongoDB..." -ForegroundColor $Green
    }
    "redis" {
        $testCommand = "npm run test:redis"
        Write-Host "Ejecutando pruebas de Redis..." -ForegroundColor $Green
    }
    "slack" {
        $testCommand = "npm run test:slack"
        Write-Host "Ejecutando pruebas de Slack..." -ForegroundColor $Green
    }
    default {
        Write-Host "Ejecutando todas las pruebas..." -ForegroundColor $Green
    }
}

# Ejecutar comando de prueba completo con argumentos adicionales
Invoke-Expression "$testCommand$extraArgs"
$testResult = $LASTEXITCODE

# Verificar resultado de las pruebas
if ($testResult -eq 0) {
    Write-Host "=======================================================" -ForegroundColor $Blue
    Write-Host "¡Todas las pruebas han pasado correctamente!" -ForegroundColor $Green
    Write-Host "=======================================================" -ForegroundColor $Blue
}
else {
    Write-Host "=======================================================" -ForegroundColor $Blue
    Write-Host "Algunas pruebas han fallado. Por favor, revise los errores." -ForegroundColor $Red
    Write-Host "=======================================================" -ForegroundColor $Blue
    exit $testResult
}

# Si se generó informe de cobertura, mostrar ubicación
if ($coverage) {
    Write-Host "Informe de cobertura generado en:" -ForegroundColor $Green
    Write-Host ".\coverage\lcov-report\index.html" -ForegroundColor $Blue
} 