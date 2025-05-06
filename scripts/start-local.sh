#!/bin/bash
# Script para iniciar el entorno local de desarrollo en sistemas Unix
# Ejecuta los servicios locales y luego la aplicación

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Verificar que existe .env.local
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️ No se encontró el archivo .env.local. Ejecutando script de configuración...${NC}"
    node scripts/setup-local-dev.js
fi

# Comprobar si MongoDB y Redis están instalados
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠️ MongoDB no está instalado. Por favor, instálalo antes de continuar.${NC}"
    exit 1
fi

if ! command -v redis-server &> /dev/null; then
    echo -e "${YELLOW}⚠️ Redis no está instalado. Por favor, instálalo antes de continuar.${NC}"
    exit 1
fi

# Comprobar si MongoDB y Redis están en ejecución
MONGO_RUNNING=false
REDIS_RUNNING=false

if pgrep -x "mongod" > /dev/null; then
    echo -e "${GREEN}✅ MongoDB ya está en ejecución${NC}"
    MONGO_RUNNING=true
else
    echo -e "${CYAN}🚀 Iniciando MongoDB...${NC}"
    mongod --dbpath ./data/db --port 27017 &
    sleep 2
fi

if pgrep -x "redis-server" > /dev/null; then
    echo -e "${GREEN}✅ Redis ya está en ejecución${NC}"
    REDIS_RUNNING=true
else
    echo -e "${CYAN}🚀 Iniciando Redis...${NC}"
    redis-server --port 6380 &
    sleep 2
fi

# Iniciar la aplicación
echo -e "${CYAN}🚀 Iniciando aplicación...${NC}"
npm run dev:local

# Función para detener servicios al salir
function cleanup {
    echo -e "${YELLOW}⚠️ Deteniendo servicios...${NC}"
    
    if [ "$MONGO_RUNNING" = false ]; then
        pkill -x "mongod"
    fi
    
    if [ "$REDIS_RUNNING" = false ]; then
        pkill -x "redis-server"
    fi
    
    exit 0
}

# Registrar función de limpieza para cuando se cierre el script
trap cleanup EXIT 