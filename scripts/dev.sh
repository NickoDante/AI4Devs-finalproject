#!/bin/bash
# Script para iniciar la aplicación en modo desarrollo

# Colores para la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================================${NC}"
echo -e "${GREEN}Iniciando TG-TheGuardian en modo desarrollo...${NC}"
echo -e "${BLUE}=======================================================${NC}"

# Comprobar si .env.local existe
if [ ! -f ".env.local" ]; then
  echo -e "${YELLOW}Advertencia: Archivo .env.local no encontrado.${NC}"
  echo -e "${YELLOW}Creando .env.local desde .env.example...${NC}"
  
  if [ -f ".env.example" ]; then
    cp .env.example .env.local
    echo -e "${GREEN}¡Archivo .env.local creado!${NC}"
    echo -e "${YELLOW}Por favor, edite el archivo .env.local con su configuración local.${NC}"
  else
    echo -e "${RED}Error: No se encontró .env.example. No se pudo crear .env.local.${NC}"
    echo -e "${RED}Por favor, cree manualmente el archivo .env.local antes de continuar.${NC}"
    exit 1
  fi
fi

# Verificar dependencias instaladas
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Dependencias no encontradas. Instalando...${NC}"
  npm install
fi

# Comprobar conexión con servicios externos
echo -e "${BLUE}Verificando servicios externos...${NC}"

# Iniciar aplicación en modo desarrollo
echo -e "${GREEN}Iniciando aplicación...${NC}"
echo -e "${BLUE}=======================================================${NC}"

# Ejecutar con variables de entorno locales
npm run dev:local 