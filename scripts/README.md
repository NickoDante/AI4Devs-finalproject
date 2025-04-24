# Scripts de Utilidad para TG-TheGuardian

Esta carpeta contiene scripts de utilidad para facilitar el desarrollo, construcción y pruebas del proyecto TG-TheGuardian.

## Scripts Disponibles

### Scripts PowerShell (Windows)

#### `dev.ps1`
Script para iniciar la aplicación en modo desarrollo.

**Uso:**
```powershell
.\scripts\dev.ps1
```

**Características:**
- Verifica y crea el archivo `.env.local` si no existe
- Instala dependencias automáticamente si no están presentes
- Inicia la aplicación en modo desarrollo local

#### `build.ps1`
Script para construir la aplicación para producción.

**Uso:**
```powershell
.\scripts\build.ps1
```

**Características:**
- Limpia la carpeta `dist` previa
- Verifica dependencias y las instala con `npm ci` si es necesario
- Ejecuta linting antes de construir
- Construye la aplicación para producción
- Opción para crear una imagen Docker

#### `test.ps1`
Script para ejecutar pruebas del proyecto.

**Uso:**
```powershell
.\scripts\test.ps1 [opciones]
```

**Opciones:**
- `--integration`: Ejecuta solo pruebas de integración
- `--unit`: Ejecuta solo pruebas unitarias
- `--mongodb`: Ejecuta solo pruebas de MongoDB
- `--redis`: Ejecuta solo pruebas de Redis
- `--slack`: Ejecuta solo pruebas de Slack
- `--watch`: Ejecuta las pruebas en modo observador
- `--coverage`: Genera informe de cobertura
- `--help`: Muestra la ayuda

**Ejemplos:**
```powershell
# Ejecutar todas las pruebas
.\scripts\test.ps1

# Ejecutar solo pruebas de integración con cobertura
.\scripts\test.ps1 --integration --coverage

# Ejecutar pruebas de MongoDB en modo observador
.\scripts\test.ps1 --mongodb --watch
```

### Scripts Bash (Linux/macOS)

#### `dev.sh`
Script para iniciar la aplicación en modo desarrollo en entornos Unix.

**Uso:**
```bash
./scripts/dev.sh
```

#### `build.sh`
Script para construir la aplicación para producción en entornos Unix.

**Uso:**
```bash
./scripts/build.sh
```

#### `test.sh`
Script para ejecutar pruebas del proyecto en entornos Unix.

**Uso:**
```bash
./scripts/test.sh [opciones]
```

**Mismas opciones que la versión PowerShell.**

## Notas

- En sistemas Linux/macOS, asegúrate de que los scripts tienen permisos de ejecución: `chmod +x scripts/*.sh`
- En Windows, es posible que necesites configurar la política de ejecución para PowerShell: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` 