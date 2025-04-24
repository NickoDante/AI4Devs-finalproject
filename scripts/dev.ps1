# Script para iniciar la aplicación en modo desarrollo

# Colores para la salida
$Green = [ConsoleColor]::Green
$Blue = [ConsoleColor]::Cyan
$Yellow = [ConsoleColor]::Yellow
$Red = [ConsoleColor]::Red

Write-Host "=======================================================" -ForegroundColor $Blue
Write-Host "Iniciando TG-TheGuardian en modo desarrollo..." -ForegroundColor $Green
Write-Host "=======================================================" -ForegroundColor $Blue

# Comprobar si .env.local existe
if (-not (Test-Path ".env.local")) {
    Write-Host "Advertencia: Archivo .env.local no encontrado." -ForegroundColor $Yellow
    Write-Host "Creando .env.local desde .env.example..." -ForegroundColor $Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" -Destination ".env.local"
        Write-Host "¡Archivo .env.local creado!" -ForegroundColor $Green
        Write-Host "Por favor, edite el archivo .env.local con su configuración local." -ForegroundColor $Yellow
    }
    else {
        Write-Host "Error: No se encontró .env.example. No se pudo crear .env.local." -ForegroundColor $Red
        Write-Host "Por favor, cree manualmente el archivo .env.local antes de continuar." -ForegroundColor $Red
        exit 1
    }
}

# Verificar dependencias instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "Dependencias no encontradas. Instalando..." -ForegroundColor $Yellow
    npm install
}

# Comprobar conexión con servicios externos
Write-Host "Verificando servicios externos..." -ForegroundColor $Blue

# Iniciar aplicación en modo desarrollo
Write-Host "Iniciando aplicación..." -ForegroundColor $Green
Write-Host "=======================================================" -ForegroundColor $Blue

# Ejecutar con variables de entorno locales
npm run dev:local 