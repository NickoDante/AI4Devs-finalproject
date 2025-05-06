#!/usr/bin/env node

/**
 * Este script ayuda a resolver problemas de compatibilidad entre ESM y CommonJS
 * Crea un archivo .mjs que envuelve a node-llama-cpp para usarlo en un entorno CommonJS
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Creando wrapper para node-llama-cpp...');

// Directorio para el wrapper
const wrapperDir = path.join(__dirname, '..', 'src', 'adapters', 'llm', 'wrapper');

// Crear directorio si no existe
if (!fs.existsSync(wrapperDir)) {
  fs.mkdirSync(wrapperDir, { recursive: true });
  console.log(`✅ Directorio creado: ${wrapperDir}`);
}

// Contenido del wrapper
const wrapperContent = `
// llama-wrapper.mjs - Wrapper ESM para node-llama-cpp
import { getLlama, LlamaChatSession } from 'node-llama-cpp';

// Exportar funciones para usar desde CommonJS
export { getLlama, LlamaChatSession };

// Mock de Llama para casos de error
export class MockLlama {
  async loadModel() {
    return {
      async createContext() {
        return {
          getSequence() {
            return {};
          }
        };
      }
    };
  }
}

// Wrapper seguro para getLlama
export async function getLlamaWrapper() {
  try {
    return await getLlama();
  } catch (error) {
    console.error('Error al inicializar Llama, usando mock:', error);
    return new MockLlama();
  }
}
`;

// Crear archivo wrapper
const wrapperFile = path.join(wrapperDir, 'llama-wrapper.mjs');
fs.writeFileSync(wrapperFile, wrapperContent);
console.log(`✅ Wrapper creado: ${wrapperFile}`);

// Contenido del adaptador
const adapterContent = `
// llama-adapter-wrapper.js - Adaptador CommonJS para el wrapper ESM
// Este archivo contiene una implementación dinámica para cargar el módulo ESM

const wrapperPath = require('path').join(__dirname, 'llama-wrapper.mjs');

// Variables para almacenar módulos importados dinámicamente
let llamaModule;
let initialized = false;
let initPromise = null;

// Función para inicializar el módulo
async function initialize() {
  if (initialized) return llamaModule;
  
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      // Importar el módulo ESM dinámicamente
      llamaModule = await import(wrapperPath);
      initialized = true;
      return llamaModule;
    } catch (error) {
      console.error('Error al cargar el módulo Llama:', error);
      throw error;
    }
  })();
  
  return initPromise;
}

// Funciones exportadas como promesas
module.exports = {
  // Obtener getLlama de forma segura
  getLlama: async () => {
    const module = await initialize();
    return module.getLlama;
  },
  
  // Obtener LlamaChatSession de forma segura
  getLlamaChatSession: async () => {
    const module = await initialize();
    return module.LlamaChatSession;
  },
  
  // Wrapper seguro
  getLlamaWrapper: async () => {
    const module = await initialize();
    return module.getLlamaWrapper();
  }
};
`;

// Crear archivo adaptador
const adapterFile = path.join(wrapperDir, 'llama-adapter-wrapper.js');
fs.writeFileSync(adapterFile, adapterContent);
console.log(`✅ Adaptador creado: ${adapterFile}`);

console.log('🎉 Wrapper y adaptador creados correctamente. Ya puedes usar node-llama-cpp desde CommonJS.');
console.log('Ahora edita LlamaAdapter.ts para importar desde el wrapper.');

// Contenido de ejemplo para LlamaAdapter
const llamaAdapterExample = `
// Ejemplo de cómo modificar LlamaAdapter.ts para usar el wrapper
import { Message } from '../../domain/models/Message';
import { BotResponse } from '../../domain/models/BotResponse';
import { AIAdapter } from '../../domain/ports/AIAdapter';
import path from 'path';
import fs from 'fs';
import { Logger } from 'winston';
import logger from '../../infrastructure/logging/Logger';

// Importar el wrapper CommonJS para usar node-llama-cpp
const { getLlamaWrapper } = require('./wrapper/llama-adapter-wrapper');

export class LlamaAdapter implements AIAdapter {
  // ... resto del código
  
  private async initialize() {
    try {
      // ... código existente
      
      // Usar el wrapper en lugar de importar directamente
      this.llama = await getLlamaWrapper();
      
      // ... resto del código
    } catch (error) {
      // ... código existente
    }
  }
  
  // ... resto del código
}
`;

console.log('\nEjemplo de código para LlamaAdapter.ts:');
console.log('------------------------------------------');
console.log(llamaAdapterExample);
console.log('------------------------------------------'); 