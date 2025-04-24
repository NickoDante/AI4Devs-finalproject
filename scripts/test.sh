#!/bin/bash
# Script para ejecutar pruebas del proyecto

# Colores para la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================================${NC}"
echo -e "${GREEN}Ejecutando pruebas para TG-TheGuardian...${NC}"
echo -e "${BLUE}=======================================================${NC}"

# Verificar dependencias instaladas
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Dependencias no encontradas. Instalando...${NC}"
  npm install
fi

# Evaluar argumentos
TEST_TYPE="all"
WATCH_MODE=false
COVERAGE=false

for arg in "$@"
do
  case $arg in
    --integration)
      TEST_TYPE="integration"
      ;;
    --unit)
      TEST_TYPE="unit"
      ;;
    --watch)
      WATCH_MODE=true
      ;;
    --coverage)
      COVERAGE=true
      ;;
    --mongodb)
      TEST_TYPE="mongodb"
      ;;
    --redis)
      TEST_TYPE="redis"
      ;;
    --slack)
      TEST_TYPE="slack"
      ;;
    --help)
      echo -e "${GREEN}Opciones disponibles:${NC}"
      echo -e "  ${BLUE}--integration${NC}: Ejecuta solo pruebas de integración"
      echo -e "  ${BLUE}--unit${NC}: Ejecuta solo pruebas unitarias"
      echo -e "  ${BLUE}--mongodb${NC}: Ejecuta solo pruebas de MongoDB"
      echo -e "  ${BLUE}--redis${NC}: Ejecuta solo pruebas de Redis"
      echo -e "  ${BLUE}--slack${NC}: Ejecuta solo pruebas de Slack"
      echo -e "  ${BLUE}--watch${NC}: Ejecuta las pruebas en modo observador"
      echo -e "  ${BLUE}--coverage${NC}: Genera informe de cobertura"
      echo -e "  ${BLUE}--help${NC}: Muestra esta ayuda"
      echo -e "${YELLOW}Ejemplo: ./scripts/test.sh --integration --coverage${NC}"
      exit 0
      ;;
  esac
done

# Construir comando de prueba
TEST_COMMAND="npm run test"
EXTRA_ARGS=""

if [ "$WATCH_MODE" = true ]; then
  EXTRA_ARGS="$EXTRA_ARGS -- --watch"
fi

if [ "$COVERAGE" = true ]; then
  EXTRA_ARGS="$EXTRA_ARGS -- --coverage"
fi

# Configurar comando según tipo de prueba
case $TEST_TYPE in
  "integration")
    TEST_COMMAND="npm run test:integration"
    echo -e "${GREEN}Ejecutando pruebas de integración...${NC}"
    ;;
  "unit")
    TEST_COMMAND="npm test -- --testPathIgnorePatterns=integration"
    echo -e "${GREEN}Ejecutando pruebas unitarias...${NC}"
    ;;
  "mongodb")
    TEST_COMMAND="npm run test:mongodb"
    echo -e "${GREEN}Ejecutando pruebas de MongoDB...${NC}"
    ;;
  "redis")
    TEST_COMMAND="npm run test:redis"
    echo -e "${GREEN}Ejecutando pruebas de Redis...${NC}"
    ;;
  "slack")
    TEST_COMMAND="npm run test:slack"
    echo -e "${GREEN}Ejecutando pruebas de Slack...${NC}"
    ;;
  *)
    echo -e "${GREEN}Ejecutando todas las pruebas...${NC}"
    ;;
esac

# Ejecutar comando de prueba completo con argumentos adicionales
eval "$TEST_COMMAND$EXTRA_ARGS"

# Verificar resultado de las pruebas
TEST_RESULT=$?
if [ $TEST_RESULT -eq 0 ]; then
  echo -e "${BLUE}=======================================================${NC}"
  echo -e "${GREEN}¡Todas las pruebas han pasado correctamente!${NC}"
  echo -e "${BLUE}=======================================================${NC}"
else
  echo -e "${BLUE}=======================================================${NC}"
  echo -e "${RED}Algunas pruebas han fallado. Por favor, revise los errores.${NC}"
  echo -e "${BLUE}=======================================================${NC}"
  exit $TEST_RESULT
fi

# Si se generó informe de cobertura, mostrar ubicación
if [ "$COVERAGE" = true ]; then
  echo -e "${GREEN}Informe de cobertura generado en:${NC}"
  echo -e "${BLUE}./coverage/lcov-report/index.html${NC}"
fi 