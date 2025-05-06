
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
