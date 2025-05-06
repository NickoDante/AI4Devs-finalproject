# Guía de Instalación para TG-TheGuardian

Esta guía proporciona instrucciones detalladas para instalar y configurar TG-TheGuardian en diferentes entornos.

## Requisitos previos

### Software necesario
- **Node.js**: versión 18.x o superior
- **MongoDB**: versión 6.0 o superior
- **Redis**: versión 6.0 o superior
- **Git**: para clonar el repositorio
- **Docker** (opcional): si se desea ejecutar con contenedores

### Credenciales necesarias
- **Slack API**: Bot Token, Signing Secret y App Token
- **Llama**: Modelo local LLM (opcional, se puede instalar automáticamente)
- **Confluence API**: Credenciales para acceso a la documentación (opcional)

## Instalación en entorno local

### 1. Clonar el repositorio
```bash
git clone https://github.com/NickoDante/AI4Devs-finalproject.git
cd AI4Devs-finalproject
```

### 2. Configurar variables de entorno
Copiar el archivo de ejemplo y configurar las variables necesarias:
```bash
cp .env.example .env.local
```

Edita el archivo `.env.local` con tus credenciales y configuración:
- Configuración del servidor: `PORT`, `NODE_ENV`, `LOG_LEVEL`
- Configuración de MongoDB: `MONGODB_URI`
- Configuración de Redis: `REDIS_HOST`, `REDIS_PORT`
- Credenciales de Slack: `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `SLACK_APP_TOKEN`
- Configuración de Llama (opcional): `LLAMA_MODEL_PATH`, `LLAMA_GPU_LAYERS`
- Configuración de Confluence (opcional): `CONFLUENCE_HOST`, `CONFLUENCE_USERNAME`, etc.

### 3. Instalar dependencias y configurar Llama
```bash
# Instalar dependencias y descargar automáticamente el modelo Llama
npm run setup

# O para instalar solo las dependencias sin el modelo
npm install
```

### 4. Instalar modelo Llama (si no lo instalaste con setup)
```bash
# Descargar e instalar modelo Llama automáticamente
npm run download:llama

# Probar que el modelo funciona correctamente
npm run test:llama
```

El script de descarga le preguntará si desea descargar el modelo recomendado (aproximadamente 4GB). Si elige descargarlo, se configurará automáticamente en el archivo `.env.local`.

### 5. Iniciar servicios locales (MongoDB y Redis)

#### Opción 1: Usando script de utilidad (Windows)
```
TG-Guardian_SlackBot_Test(Local-StartServices).bat
```

#### Opción 2: Iniciar manualmente
- Iniciar MongoDB en puerto 27017
- Iniciar Redis en puerto 6379

### 6. Ejecutar la aplicación en modo desarrollo
```bash
npm run dev:local
```

O usando el script de utilidad:
```bash
npm run dev:script
```

## Instalación con Docker

### 1. Clonar el repositorio y configurar variables de entorno
```bash
git clone https://github.com/NickoDante/AI4Devs-finalproject.git
cd AI4Devs-finalproject
cp .env.example .env
```

Edita el archivo `.env` con tu configuración para Docker.

### 2. Iniciar los contenedores
```bash
docker-compose up -d
```

Esto iniciará:
- Aplicación Node.js en el puerto 3001
- MongoDB en el puerto 27017
- Redis en el puerto 6379

### 3. Verificar el funcionamiento
```bash
docker-compose logs -f app
```

## Ejecución de pruebas

### Ejecutar todas las pruebas
```bash
npm run test:script
```

### Ejecutar pruebas específicas
```bash
# Pruebas de integración
npm run test:integration

# Pruebas unitarias
npm run test:unit

# Pruebas específicas de componentes
npm run test:mongodb
npm run test:redis
npm run test:slack

# Generar informe de cobertura
npm run test:coverage

# Probar modelo Llama
npm run test:llama
```

## Solución de problemas comunes

### Problema de conexión a MongoDB
Si no puedes conectar a MongoDB, verifica:
- Que el servicio esté corriendo en el puerto configurado
- La URI de conexión en `.env.local` o `.env`
- Permisos de acceso y credenciales

### Problema de conexión a Redis
Si no puedes conectar a Redis, verifica:
- Que el servicio esté corriendo en el puerto configurado
- Las credenciales y la configuración de conexión

### Problemas con modelo Llama
Si encuentras errores al cargar el modelo Llama:
- Asegúrate de que el modelo se haya descargado correctamente:
  ```bash
  npm run download:llama
  ```
- Verifica que la ruta en `LLAMA_MODEL_PATH` sea correcta
- Si tienes GPU, configura `LLAMA_GPU_LAYERS` con un valor apropiado
- Para diagnóstico del modelo:
  ```bash
  npm run test:llama
  ```

### Errores con Slack API
- Verifica que las credenciales sean correctas
- Asegúrate de que la app de Slack tenga los permisos necesarios
- Verifica que los eventos se estén reenviando correctamente

## Recursos adicionales
- [Documentación de la API de Slack](https://api.slack.com/docs)
- [Documentación de MongoDB](https://docs.mongodb.com/)
- [Documentación de Redis](https://redis.io/docs)
- [Documentación de Llama-cpp](https://github.com/ggerganov/llama.cpp)
- [Modelos Llama en Hugging Face](https://huggingface.co/TheBloke) 