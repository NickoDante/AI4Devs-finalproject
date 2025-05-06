# Script para iniciar el entorno local de desarrollo
# Ejecuta los servicios locales y luego la aplicación

# Colores para la salida
function Write-ColorOutput($ForegroundColor, $Message) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

# Verificar que existe .env.local
if (-not (Test-Path -Path ".env.local")) {
    Write-ColorOutput "Yellow" "⚠️ No se encontró el archivo .env.local. Ejecutando script de configuración..."
    node scripts/setup-local-dev.js
}

# Verificar que existen los servicios locales
$mongoRunning = $false
$redisRunning = $false

try {
    # Comprobar si MongoDB está en ejecución
    $mongoStatus = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
    if ($mongoStatus) {
        Write-ColorOutput "Green" "✅ MongoDB ya está en ejecución"
        $mongoRunning = $true
    }
    
    # Comprobar si Redis está en ejecución
    $redisStatus = Get-Process -Name "redis-server" -ErrorAction SilentlyContinue
    if ($redisStatus) {
        Write-ColorOutput "Green" "✅ Redis ya está en ejecución"
        $redisRunning = $true
    }
} catch {
    Write-ColorOutput "Yellow" "⚠️ Error al comprobar servicios: $_"
}

# Si alguno de los servicios no está en ejecución, ejecutar el batch
if (-not ($mongoRunning -and $redisRunning)) {
    Write-ColorOutput "Cyan" "🚀 Iniciando servicios locales (MongoDB y Redis)..."
    
    # Ejecutar el batch en una nueva ventana
    Start-Process -FilePath "TG-Guardian_SlackBot_Test(Local-StartServices).bat" -Wait
    
    # Esperar 5 segundos para que los servicios se inicien
    Write-ColorOutput "Yellow" "⏳ Esperando 5 segundos para que los servicios se inicien..."
    Start-Sleep -Seconds 5
}

# Iniciar la aplicación
Write-ColorOutput "Cyan" "🚀 Iniciando aplicación..."
npm run dev:local 