# Guía de Despliegue de TG-TheGuardian

Esta guía detalla el proceso de despliegue de TG-TheGuardian en diferentes entornos, desde desarrollo hasta producción.

## Requisitos previos

### Requisitos de hardware
- **Servidor de producción**: 
  - 2 CPU cores mínimo (4 recomendado)
  - 4GB RAM mínimo (8GB recomendado)
  - 20GB de almacenamiento (SSD recomendado)
- **Servicios de base de datos**:
  - MongoDB: 2GB RAM mínimo
  - Redis: 1GB RAM mínimo

### Software necesario
- Docker y Docker Compose (para despliegue con contenedores)
- Node.js 20.x o superior
- Git
- MongoDB (para desarrollo local)
- Redis (para desarrollo local)
- Modelo Llama (ver instrucciones de instalación)

## Desarrollo Local

### 1. Descargar el Modelo Llama

```bash
npm run download:llama
```

Este comando descargará el modelo Mistral 7B Instruct v0.2 (formato GGUF) necesario para el funcionamiento local de LlamaAdapter.

### 2. Configuración del Entorno Local

Puedes configurar automáticamente tu entorno local ejecutando:

```bash
npm run setup:local
```

Este script creará un archivo `.env.local` con la configuración necesaria para desarrollo local. El script copiará las credenciales de Slack y Confluence del archivo `.env` existente si está disponible.

### 3. Iniciar el Entorno de Desarrollo

#### En Windows:

Tenemos dos opciones para iniciar el entorno local:

**Opción 1**: Usando el script todo-en-uno:
```bash
npm run start:local
```
Este comando iniciará MongoDB, Redis y la aplicación de forma automática.

**Opción 2**: Iniciando servicios manualmente:
```bash
# Iniciar MongoDB y Redis
TG-Guardian_SlackBot_Test(Local-StartServices).bat

# En otra terminal, iniciar la aplicación
npm run dev:local
```

#### En Unix/Linux/Mac:

```bash
# Iniciar el entorno completo
npm run start:local:unix
```

O manualmente:
```bash
# Iniciar MongoDB y Redis (instálalos previamente)
mongod --dbpath ./data/db --port 27017
redis-server --port 6380

# En otra terminal, iniciar la aplicación
npm run dev:local
```

## Opciones de despliegue

TG-TheGuardian ofrece varias opciones de despliegue según las necesidades del entorno:

### 1. Despliegue con Docker (recomendado)

El despliegue con Docker es la opción más sencilla y recomendada. Proporciona un entorno aislado y consistente.

#### Pasos para despliegue en entorno local o desarrollo

1. Clonar el repositorio:
```bash
git clone https://github.com/NickoDante/AI4Devs-finalproject.git
cd AI4Devs-finalproject
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```
   Editar el archivo `.env` con la configuración adecuada.

3. Iniciar los contenedores:
```bash
docker-compose up -d
```

4. Verificar el despliegue:
```bash
docker-compose ps
docker-compose logs -f app
```

#### Pasos para despliegue en entorno de producción

1. Clonar el repositorio en el servidor:
```bash
git clone https://github.com/NickoDante/AI4Devs-finalproject.git
cd AI4Devs-finalproject
```

2. Configurar variables de entorno para producción:
```bash
cp .env.example .env.production
```
   Editar el archivo `.env.production` con la configuración adecuada.

3. Construir e iniciar los contenedores:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up -d --build
```

4. Configurar un proxy inverso (Nginx/Apache) para gestionar el tráfico HTTPS.

### 2. Despliegue manual (sin Docker)

El despliegue manual requiere la instalación directa de todas las dependencias en el servidor.

#### Pasos para despliegue manual

1. Clonar el repositorio:
```bash
git clone https://github.com/NickoDante/AI4Devs-finalproject.git
cd AI4Devs-finalproject
```

2. Instalar dependencias:
```bash
npm install --production
```

3. Configurar variables de entorno:
```bash
cp .env.example .env.production
```
   Editar el archivo `.env.production` con la configuración adecuada.

4. Construir la aplicación:
```bash
npm run build:clean
```

5. Iniciar el servicio:
```bash
NODE_ENV=production node dist/index.js
```

## Proceso de CI/CD

Para automatizar el despliegue, se recomienda implementar un pipeline de CI/CD utilizando GitHub Actions, GitLab CI, o Jenkins.

### Ejemplo de pipeline con GitHub Actions

1. Crear un archivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy TG-TheGuardian

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test

  build_and_deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/app
            git pull
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up -d --build
```

## Monitoreo y supervisión

### Logging

TG-TheGuardian utiliza Winston para logging. Los logs se encuentran en:

- Docker: Dentro del contenedor en `/app/logs/`
- Despliegue manual: En la carpeta `logs/` del proyecto

Se recomienda configurar un sistema de agregación de logs como ELK Stack o Graylog en entornos de producción.

### Herramientas de monitoreo

Se sugieren las siguientes herramientas:

1. **Monitoreo de contenedores**: 
   - Portainer para visualización y gestión de contenedores Docker
   - cAdvisor para métricas de rendimiento

2. **Monitoreo de aplicación**:
   - PM2 para supervisión de procesos Node.js
   - Prometheus + Grafana para métricas y alertas

## Plan de respaldo y recuperación

### Respaldo de datos

Configure respaldos periódicos para:

1. Base de datos MongoDB:
```bash
mongodump --uri="mongodb://username:password@host:port/database" --out=/path/to/backup/$(date +%Y-%m-%d)
```

2. Datos Redis (si es necesario):
```bash
redis-cli -h host -p port -a password --rdb /path/to/backup/redis-$(date +%Y-%m-%d).rdb
```

### Recuperación ante desastres

1. Procedimiento de recuperación para MongoDB:
```bash
mongorestore --uri="mongodb://username:password@host:port/database" /path/to/backup/YYYY-MM-DD
```

2. Procedimiento de recuperación para Redis:
```bash
redis-cli -h host -p port -a password config set dir /path/to/redis
redis-cli -h host -p port -a password config set dbfilename redis-YYYY-MM-DD.rdb
redis-cli -h host -p port -a password shutdown save
```

## Migración entre entornos

### Migración de desarrollo a staging

1. Exportar datos de desarrollo (opcional):
```bash
mongodump --uri="mongodb://localhost:27017/tg-guardian-dev" --out=./backup-dev
```

2. Configurar variables de entorno para staging:
```bash
cp .env.example .env.staging
# Editar .env.staging
```

3. Desplegar en entorno de staging:
```bash
docker-compose -f docker-compose.yml -f docker-compose.staging.yml --env-file .env.staging up -d --build
```

4. Importar datos (si es necesario):
```bash
mongorestore --uri="mongodb://username:password@host:port/tg-guardian-staging" ./backup-dev
```

### Migración de staging a producción

Siga el mismo proceso, pero utilizando los archivos de configuración de producción.

## Troubleshooting

### Problemas comunes y soluciones

1. **Error de conexión a MongoDB**:
   - Verificar URI de conexión y credenciales
   - Comprobar reglas de firewall
   - Verificar que el contenedor de MongoDB esté funcionando

2. **Error de conexión a Redis**:
   - Verificar que Redis esté ejecutándose
   - Verificar configuración del host y puerto
   - Comprobar que se esté usando el puerto correcto (6380 en desarrollo local)

3. **Problemas con Slack API**:
   - Validar tokens y permisos de la aplicación
   - Verificar endpoint de eventos y suscripciones 

4. **Modelo Llama no disponible**:
   - Verificar que se haya descargado el modelo con `npm run download:llama`
   - Comprobar que el archivo del modelo exista en `./models/mistral-7b-instruct-v0.2.Q4_K_M.gguf`
   - Verificar que la ruta en el archivo de entorno sea correcta: `LLAMA_MODEL_PATH=./models/mistral-7b-instruct-v0.2.Q4_K_M.gguf` 