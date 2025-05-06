#!/usr/bin/env node

/**
 * Este script ayuda a resolver problemas de compatibilidad entre ESM y CommonJS
 * Crea un archivo declare.d.ts para las extensiones .mjs para evitar errores de tipos en TypeScript
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando entorno para compatibilidad ESM/CommonJS...');

// 1. Crear archivo de declaración global para .mjs
const globalDtsPath = path.join(__dirname, '..', 'src', 'types', 'global.d.ts');

// Crear directorio si no existe
const typesDir = path.dirname(globalDtsPath);
if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir, { recursive: true });
  console.log(`✅ Directorio creado: ${typesDir}`);
}

// Contenido del archivo de declaración global
const globalDtsContent = `
// Declaraciones globales para habilitar imports ESM en TypeScript

// Permitir importación de módulos .mjs
declare module "*.mjs" {
  const content: any;
  export default content;
  export * from content;
}

// Permitir importación con require
declare module "*" {
  const content: any;
  export default content;
}
`;

// Escribir archivo de declaración global
fs.writeFileSync(globalDtsPath, globalDtsContent);
console.log(`✅ Archivo de declaración global creado: ${globalDtsPath}`);

// 2. Actualizar tsconfig.json para incluir el directorio types
const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
let tsconfig;

try {
  tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  
  // Asegurarse de que typeRoots incluya nuestro directorio types
  if (!tsconfig.compilerOptions.typeRoots) {
    tsconfig.compilerOptions.typeRoots = ["./node_modules/@types", "./src/types"];
  } else if (!tsconfig.compilerOptions.typeRoots.includes("./src/types")) {
    tsconfig.compilerOptions.typeRoots.push("./src/types");
  }
  
  // Configurar la opción allowJs para permitir archivos .js
  tsconfig.compilerOptions.allowJs = true;
  
  // Escribir el archivo tsconfig actualizado
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  console.log(`✅ tsconfig.json actualizado con typeRoots y allowJs`);
} catch (error) {
  console.error(`❌ Error al actualizar tsconfig.json: ${error.message}`);
}

// 3. Crear un .gitignore específico para asegurar que los archivos wrapper se incluyan en el repositorio
const gitignorePath = path.join(__dirname, '..', '.gitignore');
let gitignoreContent = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';

// Asegurarse de que los wrappers no sean ignorados
if (gitignoreContent.includes('*.mjs')) {
  gitignoreContent = gitignoreContent.replace(/^\s*\*\.mjs\s*$/gm, '# *.mjs # Re-habilitado para los wrappers');
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log(`✅ .gitignore actualizado para permitir archivos .mjs`);
}

console.log('🎉 Configuración completada. Ahora deberías poder compilar el proyecto sin errores de tipos.');
console.log('Ejecuta "npm run build" para verificar que todo funciona correctamente.'); 