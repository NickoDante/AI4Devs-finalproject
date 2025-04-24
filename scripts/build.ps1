# Script para construir la aplicación para producción

# Colores para la salida
$Green = [ConsoleColor]::Green
$Blue = [ConsoleColor]::Cyan
$Yellow = [ConsoleColor]::Yellow
$Red = [ConsoleColor]::Red

Write-Host "=======================================================" -ForegroundColor $Blue
Write-Host "Construyendo TG-TheGuardian para producción..." -ForegroundColor $Green
Write-Host "=======================================================" -ForegroundColor $Blue

# Limpiar la carpeta dist anterior si existe
if (Test-Path "dist") {
    Write-Host "Limpiando distribución anterior..." -ForegroundColor $Yellow
    Remove-Item -Path "dist" -Recurse -Force
}

# Verificar dependencias instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "Dependencias no encontradas. Instalando..." -ForegroundColor $Yellow
    npm ci
}
else {
    Write-Host "Dependencias ya instaladas." -ForegroundColor $Green
}

# Verificar si existe archivo .env para producción
if (-not (Test-Path ".env")) {
    Write-Host "Advertencia: Archivo .env no encontrado." -ForegroundColor $Yellow
    Write-Host "Se recomienda configurar variables de entorno para producción." -ForegroundColor $Yellow
    
    if (Test-Path ".env.example") {
        $response = Read-Host "¿Desea crear .env desde .env.example? (s/n)"
        if ($response -eq "s") {
            Copy-Item ".env.example" -Destination ".env"
            Write-Host "¡Archivo .env creado!" -ForegroundColor $Green
            Write-Host "Por favor, edite el archivo .env con su configuración de producción." -ForegroundColor $Yellow
        }
    }
}

# Ejecutar linting
Write-Host "Ejecutando linting..." -ForegroundColor $Blue
npm run lint
$lintResult = $LASTEXITCODE

# Si el linting falla, preguntar si desea continuar
if ($lintResult -ne 0) {
    $response = Read-Host "Linting ha fallado. ¿Desea continuar con la construcción? (s/n)"
    if ($response -ne "s") {
        Write-Host "Construcción cancelada." -ForegroundColor $Red
        exit 1
    }
}

# Construir la aplicación
Write-Host "Construyendo la aplicación..." -ForegroundColor $Blue
npm run build
$buildResult = $LASTEXITCODE

# Verificar si la construcción fue exitosa
if ($buildResult -eq 0) {
    Write-Host "¡Construcción completada con éxito!" -ForegroundColor $Green
    Write-Host "=======================================================" -ForegroundColor $Blue
    Write-Host "La aplicación está lista para ser desplegada." -ForegroundColor $Green
    Write-Host "=======================================================" -ForegroundColor $Blue
}
else {
    Write-Host "Error durante la construcción." -ForegroundColor $Red
    Write-Host "Por favor, revise los errores y vuelva a intentarlo." -ForegroundColor $Red
    exit 1
}

# Opcional: Crear paquete Docker
$response = Read-Host "¿Desea construir una imagen Docker? (s/n)"
if ($response -eq "s") {
    Write-Host "Construyendo imagen Docker..." -ForegroundColor $Blue
    docker build -t tg-theguardian:latest .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "¡Imagen Docker construida con éxito!" -ForegroundColor $Green
        Write-Host "Puede ejecutarla con: docker run -p 3001:3001 tg-theguardian:latest" -ForegroundColor $Green
    }
    else {
        Write-Host "Error al construir la imagen Docker." -ForegroundColor $Red
    }
} 