export interface ConfluenceSpace {
  key: string;
  name: string;
  description: string;
}

export const CONFLUENCE_SPACES: ConfluenceSpace[] = [
  {
    key: 'TKA',
    name: 'TKA Knowledge Archive',
    description: 'Documentación general y convenciones de código'
  },
  {
    key: 'NVP',
    name: 'NVP Documentation',
    description: 'Documentación específica del proyecto NVP'
  }
];

export function isValidSpaceKey(key: string): boolean {
  return CONFLUENCE_SPACES.some(space => space.key === key);
}

export function getSpaceByKey(key: string): ConfluenceSpace | undefined {
  return CONFLUENCE_SPACES.find(space => space.key === key);
}

export function getDefaultSpace(): ConfluenceSpace {
  return CONFLUENCE_SPACES[0]; // TKA es el espacio por defecto
} 