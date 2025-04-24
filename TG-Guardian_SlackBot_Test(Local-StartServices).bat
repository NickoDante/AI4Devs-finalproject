@echo off
echo Iniciando servicios locales...

REM Crear directorio para datos de MongoDB si no existe
if not exist "data\db" mkdir "data\db"

REM Iniciar MongoDB
start "MongoDB" "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath ./data/db

REM Iniciar Redis en el puerto 6380
start "Redis" "C:\Program Files\Redis\redis-server.exe" --port 6380

echo Servicios locales iniciados
echo MongoDB corriendo en puerto 27017
echo Redis corriendo en puerto 6380
echo.
echo Presiona cualquier tecla para detener los servicios...
pause > nul

REM Detener servicios
taskkill /FI "WindowTitle eq MongoDB*" /T /F
taskkill /FI "WindowTitle eq Redis*" /T /F

echo Servicios detenidos 