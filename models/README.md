# Modelos para Llama

En esta carpeta se deben almacenar los modelos de LLM que utilizará el proyecto TG-TheGuardian.

## Modelos recomendados

Para utilizar la integración con Llama, debes descargar un modelo compatible en formato GGUF. Algunas recomendaciones:

1. **Llama-2-7B-Chat-GGUF**: Un modelo equilibrado en tamaño y rendimiento
   - URL: https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf
   - Tamaño: ~4GB
   - Rendimiento: Bueno en respuestas generales

2. **Mistral-7B-Instruct-v0.2-GGUF**: Otra opción equilibrada con buen rendimiento
   - URL: https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf
   - Tamaño: ~4GB
   - Rendimiento: Muy bueno para instrucciones

## Instalación

1. Descarga el modelo que prefieras de Hugging Face u otra fuente confiable
2. Coloca el archivo .gguf en esta carpeta
3. Configura la ruta en el archivo .env:

```
LLAMA_MODEL_PATH=./models/nombre-del-modelo.gguf
```

## Consideraciones de hardware

- Para modelos de 7B parámetros, se recomienda un mínimo de 8GB de RAM
- Para usar GPU, configura LLAMA_GPU_LAYERS en .env (0 para solo CPU) 