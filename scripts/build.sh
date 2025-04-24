#!/bin/bash
# Script para construir la aplicación para producción

# Colores para la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================================${NC}"
echo -e "${GREEN}Construyendo TG-TheGuardian para producción...${NC}"
echo -e "${BLUE}=======================================================${NC}"

# Limpiar la carpeta dist anterior si existe
if [ -d "dist" ]; then
  echo -e "${YELLOW}Limpiando distribución anterior...${NC}"
  rm -rf dist
fi

# Verificar dependencias instaladas
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Dependencias no encontradas. Instalando...${NC}"
  npm ci
else
  echo -e "${GREEN}Dependencias ya instaladas.${NC}"
fi

# Verificar si existe archivo .env para producción
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Advertencia: Archivo .env no encontrado.${NC}"
  echo -e "${YELLOW}Se recomienda configurar variables de entorno para producción.${NC}"
  
  if [ -f ".env.example" ]; then
    echo -e "${YELLOW}¿Desea crear .env desde .env.example? (s/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([sS])$ ]]; then
      cp .env.example .env
      echo -e "${GREEN}¡Archivo .env creado!${NC}"
      echo -e "${YELLOW}Por favor, edite el archivo .env con su configuración de producción.${NC}"
    fi
  fi
fi

# Ejecutar linting
echo -e "${BLUE}Ejecutando linting...${NC}"
npm run lint

# Si el linting falla, preguntar si desea continuar
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Linting ha fallado. ¿Desea continuar con la construcción? (s/n)${NC}"
  read -r response
  if [[ ! "$response" =~ ^([sS])$ ]]; then
    echo -e "${RED}Construcción cancelada.${NC}"
    exit 1
  fi
fi

# Construir la aplicación
echo -e "${BLUE}Construyendo la aplicación...${NC}"
npm run build

# Verificar si la construcción fue exitosa
if [ $? -eq 0 ]; then
  echo -e "${GREEN}¡Construcción completada con éxito!${NC}"
  echo -e "${BLUE}=======================================================${NC}"
  echo -e "${GREEN}La aplicación está lista para ser desplegada.${NC}"
  echo -e "${BLUE}=======================================================${NC}"
else
  echo -e "${RED}Error durante la construcción.${NC}"
  echo -e "${RED}Por favor, revise los errores y vuelva a intentarlo.${NC}"
  exit 1
fi

# Opcional: Crear paquete Docker
echo -e "${YELLOW}¿Desea construir una imagen Docker? (s/n)${NC}"
read -r response
if [[ "$response" =~ ^([sS])$ ]]; then
  echo -e "${BLUE}Construyendo imagen Docker...${NC}"
  docker build -t tg-theguardian:latest .
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}¡Imagen Docker construida con éxito!${NC}"
    echo -e "${GREEN}Puede ejecutarla con: docker run -p 3001:3001 tg-theguardian:latest${NC}"
  else
    echo -e "${RED}Error al construir la imagen Docker.${NC}"
  fi
fi 