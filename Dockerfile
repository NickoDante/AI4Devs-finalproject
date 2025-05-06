# Etapa de compilación
FROM node:20-slim AS builder

WORKDIR /app

# Instalar dependencias de sistema necesarias para llama.cpp (solo para compilación)
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    cmake \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copiar solo los archivos necesarios para instalar dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar todas las dependencias, incluyendo las de desarrollo para compilación
RUN npm ci

# Copiar código fuente
COPY . .

# Construir el proyecto
RUN npm run build

# Etapa de producción - imagen final más pequeña
FROM node:20-slim

WORKDIR /app

# Instalar solo las dependencias de sistema requeridas en tiempo de ejecución
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de configuración para instalar solo dependencias de producción
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production --omit=dev

# Copiar archivos compilados y otros recursos necesarios de la etapa de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/models ./models
COPY --from=builder /app/prompts ./prompts

# Copiar módulos nativos compilados
COPY --from=builder /app/node_modules/node-llama-cpp ./node_modules/node-llama-cpp

# Crear archivo vacío para indicar entorno Docker
RUN touch .docker-env

# Exponer puerto
EXPOSE 3001

# Variables de entorno
ENV NODE_ENV=production
ENV NODE_OPTIONS="--experimental-vm-modules --experimental-specifier-resolution=node"

# Comando para iniciar la aplicación
CMD ["node", "dist/index.js"] 