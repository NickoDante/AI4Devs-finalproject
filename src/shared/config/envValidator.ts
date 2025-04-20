interface EnvVariable {
  name: string;
  required: boolean;
  description: string;
}

const requiredEnvVariables: EnvVariable[] = [
  {
    name: 'PORT',
    required: true,
    description: 'Puerto en el que se ejecutará el servidor'
  },
  {
    name: 'MONGODB_URI',
    required: true,
    description: 'URI de conexión a MongoDB'
  },
  {
    name: 'SLACK_BOT_TOKEN',
    required: true,
    description: 'Token del bot de Slack (xoxb-)'
  },
  {
    name: 'SLACK_SIGNING_SECRET',
    required: true,
    description: 'Signing Secret de la app de Slack'
  },
  {
    name: 'OPENAI_API_KEY',
    required: false,
    description: 'API Key de OpenAI (opcional por ahora)'
  },
  {
    name: 'CONFLUENCE_HOST',
    required: false,
    description: 'Host de Confluence'
  },
  {
    name: 'CONFLUENCE_USERNAME',
    required: false,
    description: 'Usuario de Confluence'
  },
  {
    name: 'CONFLUENCE_API_TOKEN',
    required: false,
    description: 'Token de API de Confluence'
  }
];

export function validateEnv(): void {
  console.log('🔍 Validando variables de entorno...');
  
  const missingVars: string[] = [];
  const presentVars: string[] = [];

  requiredEnvVariables.forEach((variable) => {
    const value = process.env[variable.name];
    
    if (variable.required && !value) {
      missingVars.push(`${variable.name} - ${variable.description}`);
    } else if (value) {
      presentVars.push(variable.name);
    }
  });

  if (missingVars.length > 0) {
    console.error('❌ Error: Faltan las siguientes variables de entorno requeridas:');
    missingVars.forEach((variable) => {
      console.error(`   - ${variable}`);
    });
    throw new Error('Variables de entorno faltantes');
  }

  console.log('✅ Variables de entorno validadas correctamente');
  console.log('📋 Variables configuradas:', presentVars.join(', '));
} 