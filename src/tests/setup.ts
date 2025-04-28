import dotenv from 'dotenv';

// Cargar variables de entorno para pruebas
dotenv.config({ path: '.env.local' });
 
// Configuración global para Jest
jest.setTimeout(30000); // 30 segundos para pruebas de integración 