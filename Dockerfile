FROM node:20-alpine

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY src/ ./src/

# Exponer puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["npm", "run", "dev"] 