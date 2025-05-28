# 🚀 Pruebas de Rendimiento - TG-TheGuardian

Este directorio contiene todas las pruebas de rendimiento para el chatbot TG-TheGuardian.

## 📁 Estructura de Archivos

```
src/tests/performance/
├── README.md                    # Esta documentación
├── performance.config.ts        # Configuración de umbrales y métricas
├── performance.utils.ts         # Utilidades para medición de rendimiento
├── commands.performance.test.ts # Pruebas unitarias de rendimiento
└── run-performance-tests.ts     # Script ejecutable para pruebas rápidas
```

## 🎯 Objetivos de las Pruebas

### 1. **Validación de Umbrales**
- Verificar que todos los comandos respondan dentro de tiempos aceptables
- Garantizar uso eficiente de memoria
- Validar throughput mínimo para operaciones críticas

### 2. **Identificación de Cuellos de Botella**
- Detectar componentes lentos en el sistema
- Medir impacto de operaciones concurrentes
- Analizar degradación bajo carga

### 3. **Benchmarking Continuo**
- Establecer métricas base para futuras optimizaciones
- Comparar con estándares de la industria
- Monitorear regresiones de rendimiento

## ⚡ Ejecución Rápida

### Pruebas Básicas (15 segundos)
```bash
npm run test:performance
```

### Pruebas Unitarias Detalladas
```bash
npm run test:performance:unit
```

### Comando Manual
```bash
npx ts-node src/tests/performance/run-performance-tests.ts
```

## 📊 Métricas Evaluadas

### Por Comando Individual
| Comando | Tiempo Max | Throughput Min | Memoria Max |
|---------|------------|----------------|-------------|
| `/tg-search` | 3000ms | 10 ops/sec | 100MB |
| `/tg-question` | 8000ms | 5 ops/sec | 200MB |
| `/tg-summary` | 15000ms | 2 ops/sec | 300MB |
| `/tg-feedback` | 1000ms | 50 ops/sec | 50MB |

### Métricas de Concurrencia
- **20 operaciones simultáneas:** 90% de éxito mínimo
- **Tiempo promedio:** Debe mantenerse cercano al individual
- **Rate de errores:** < 10% bajo carga moderada

## 🎨 Interpretación de Resultados

### Categorías de Performance
- 🟢 **EXCELLENT:** ≤ 50% del umbral
- 🟡 **GOOD:** 50-80% del umbral  
- 🟠 **WARNING:** 80-100% del umbral
- 🔴 **CRITICAL:** > 100% del umbral

### Estados del Sistema
- **🟢 EXCELENTE:** 100% pruebas pasadas
- **🟡 BUENO:** 80-99% pruebas pasadas
- **🟠 ADVERTENCIA:** 60-79% pruebas pasadas  
- **🔴 CRÍTICO:** < 60% pruebas pasadas

## 🔧 Configuración Personalizada

### Modificar Umbrales
Edita `performance.config.ts`:

```typescript
export const PERFORMANCE_THRESHOLDS = {
  commands: {
    search: {
      maxResponseTime: 3000,  // Cambiar aquí
      maxMemoryUsage: 100,
      minThroughput: 10
    }
    // ...
  }
};
```

### Ajustar Simulaciones
Edita `run-performance-tests.ts`:

```typescript
const simulateSearch = async (): Promise<void> => {
  const delay = Math.random() * 100 + 50; // Modificar latencia
  await new Promise(resolve => setTimeout(resolve, delay));
};
```

## 📈 Análisis de Resultados

### Ejemplo de Salida
```
🚀 **Iniciando Pruebas de Rendimiento TG-TheGuardian**

📍 **Prueba 1: Comando /tg-search**
⏱️  Tiempo de respuesta: 79.87ms
🧠 Uso de memoria: -21.85MB  
📏 Umbral: 3000ms
🏷️  Categoría: EXCELLENT
✅ Pasa umbral: SÍ
```

### Interpretación
- **Tiempo de respuesta:** 79.87ms es excelente (97% mejor que 3000ms)
- **Uso de memoria:** Negativo indica optimización eficiente
- **Categoría EXCELLENT:** Sistema funciona óptimamente
- **Pasa umbral: SÍ:** Cumple con los requisitos

## 🚨 Troubleshooting

### Pruebas Fallan Constantemente
1. **Verificar mocks:** Los servicios externos deben estar mockeados
2. **Ajustar umbrales:** Pueden ser muy estrictos para el hardware actual
3. **Revisar dependencias:** Asegurar que todas las dependencias están instaladas

### Throughput Bajo
1. **Hardware limitado:** Ejecutar en máquina más potente
2. **Simulaciones lentas:** Reducir delays en funciones mock
3. **Configuración Jest:** Aumentar timeout si es necesario

### Errores de Memoria
```typescript
// En tests que fallan por memoria:
beforeEach(() => {
  if (global.gc) global.gc(); // Forzar garbage collection
});
```

## 🔄 Integración Continua

### GitHub Actions
```yaml
- name: Run Performance Tests
  run: npm run test:performance:unit
  
- name: Performance Report
  run: npm run test:performance > performance-report.txt
```

### Alertas Automáticas
```typescript
// En CI/CD pipeline
if (performanceScore < 80) {
  throw new Error('Performance degradation detected!');
}
```

## 📚 Referencias

### Benchmarks de la Industria
- **Chatbots:** 500-2000ms tiempo de respuesta
- **APIs de búsqueda:** 200-800ms  
- **Feedback sistemas:** 50-200ms
- **Document processing:** 2-10s

### Herramientas Relacionadas
- [Artillery](https://artillery.io/) - Load testing
- [k6](https://k6.io/) - Performance testing
- [JMeter](https://jmeter.apache.org/) - Stress testing

## 🎯 Próximos Pasos

1. **Pruebas de carga real** con servicios externos
2. **Monitoreo continuo** en producción  
3. **Optimizaciones** basadas en datos reales
4. **Escalabilidad** horizontal y vertical

---

**📝 Nota:** Estas pruebas usan simulaciones para desarrollo. Para pruebas de producción, conectar con servicios reales y usar herramientas de load testing más robustas.

**🔗 Enlaces:**
- [Reporte Completo](../../../docs/performance-report.md)
- [Configuración del Sistema](../../../README.md)
- [Documentación de APIs](../../../docs/api-documentation.md) 