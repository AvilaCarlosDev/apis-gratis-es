# Registro de verificaciones / Verification log

[Español](#español) · [English](#english)

## Español

Revisión del **2026-09-19**. Método: se consultó la fuente oficial de cada dato; cuando no se pudo, se dejó marcado (⚠️) en el README en vez de darlo por bueno.

### Datos corregidos

| Dato | Antes | Ahora | Fuente y método |
|---|---|---|---|
| Modelos gratuitos de OpenRouter | 7 modelos (Gemma 3, Llama 3.3 70B…) | Ninguno de los 7 sigue siendo gratuito; hay 22 modelos de texto `:free` | API pública `openrouter.ai/api/v1/models` (sin clave) |
| Ejemplo de OpenRouter | `meta-llama/llama-3.3-70b-instruct:free` | `google/gemma-4-31b-it:free` | Misma API; el modelo anterior daba error |
| Groq, plan gratuito | Llama 3.1 8B, Llama 3.3 70B, Llama 4 Scout | `gpt-oss-120b` y `gpt-oss-20b` (30 RPM, 1.000 RPD) | `console.groq.com/docs/rate-limits` y `/docs/deprecations` |
| Ejemplo de Groq | `llama-3.3-70b-versatile` | `openai/gpt-oss-20b` | Retirado el 16-ago-2026 según Groq |
| Ollama | `llama2-es`, `gemma:7b-es` | `llama3.2`, `gemma3`, `qwen3` | Registro `registry.ollama.ai` (los anteriores dan 404) |
| Cloudflare, valor de las 10.000 neuronas | ~$0,50 | ~$0,11 | 10.000 × $0,011 / 1.000, según su página de precios |
| GitHub Models | Tabla "200 solicitudes/mes…" | Retirada | No se pudo confirmar; probablemente era incorrecta |
| Ejemplo de Python | Usaba `os` sin importarlo | Corregido | Revisión del código |

### Datos confirmados

| Dato | Fuente |
|---|---|
| Cloudflare: 10.000 neuronas/día sin cargo | `developers.cloudflare.com/workers-ai/platform/pricing/` |
| Cohere: claves de prueba con 1.000 llamadas/mes; 20 solicitudes/min en los modelos de chat | `docs.cohere.com/docs/rate-limits` |
| Hugging Face: $0,10 al mes para usuarios gratuitos ("sujeto a cambios") | `huggingface.co/docs/inference-providers/pricing` |
| Google AI Studio: límites por proyecto, reinicio diario a medianoche (hora del Pacífico) | `ai.google.dev/gemini-api/docs/rate-limits` |
| FreeLLMAPI: licencia MIT, 27.287 estrellas, cambios el 2026-09-17 | API de GitHub |

### No se pudo comprobar (marcado ⚠️)

| Dato | Motivo |
|---|---|
| Cifras por modelo de Google AI Studio | Se cargan dinámicamente; no aparecen en la página estática |
| Límites de OpenRouter (20/min, 50/día) | La página oficial no publica cifras en su HTML (reconfirmadas el 2026-09-17 en una revisión anterior) |
| NVIDIA NIM | La documentación devuelve 403 a clientes automáticos |
| Mistral | La página de niveles que se usaba devuelve 404 |
| Créditos de prueba (Fireworks, Baseten, Nebius, Novita, AI21, Upstage, Alibaba) | Bloqueo a clientes automáticos o contenido con JavaScript |

### Enlaces retirados

| Enlace | Motivo |
|---|---|
| `github.com/cheahjs/free-llm-api-resources` | Devuelve 404: el repositorio ya no existe |
| `github.com/awesome-ai/awesome-ai-apis` | Devuelve 404 |
| `ai-models.info` | El dominio ya no resuelve |

### Fuente citada: FreeLLMAPI

Los proveedores que dejaron de ser gratuitos (SambaNova, Reka, OpenCode Zen, Chutes) y las condiciones de los servicios sin registro (Kilo, OVHcloud, AI Horde, LLM7) salen de `docs/en/providers/01-supported-platforms.md` del repositorio [tashfeenahmed/freellmapi](https://github.com/tashfeenahmed/freellmapi) (MIT). Se marcan 📎: **no se comprobaron de forma independiente**. Los enlaces de esos servicios sí responden.

## English

Review of **2026-09-19**. Method: each fact was checked at its official source; when that was not possible, it was flagged (⚠️) in the README instead of being taken as good.

### Corrected facts

| Fact | Before | Now | Source and method |
|---|---|---|---|
| OpenRouter free models | 7 models (Gemma 3, Llama 3.3 70B…) | None of the 7 is still free; there are 22 text `:free` models | Public API `openrouter.ai/api/v1/models` (no key) |
| OpenRouter example | `meta-llama/llama-3.3-70b-instruct:free` | `google/gemma-4-31b-it:free` | Same API; the previous model returned an error |
| Groq, free plan | Llama 3.1 8B, Llama 3.3 70B, Llama 4 Scout | `gpt-oss-120b` and `gpt-oss-20b` (30 RPM, 1,000 RPD) | `console.groq.com/docs/rate-limits` and `/docs/deprecations` |
| Groq example | `llama-3.3-70b-versatile` | `openai/gpt-oss-20b` | Removed on 2026-08-16 per Groq |
| Ollama | `llama2-es`, `gemma:7b-es` | `llama3.2`, `gemma3`, `qwen3` | Registry `registry.ollama.ai` (the previous ones return 404) |
| Cloudflare, value of the 10,000 neurons | ~$0.50 | ~$0.11 | 10,000 × $0.011 / 1,000, per its pricing page |
| GitHub Models | "200 requests/month…" table | Removed | Could not be confirmed; probably wrong |
| Python example | Used `os` without importing it | Fixed | Code review |

### Confirmed facts

| Fact | Source |
|---|---|
| Cloudflare: 10,000 neurons/day at no charge | `developers.cloudflare.com/workers-ai/platform/pricing/` |
| Cohere: trial keys with 1,000 calls/month; 20 requests/min on chat models | `docs.cohere.com/docs/rate-limits` |
| Hugging Face: $0.10 per month for free users ("subject to change") | `huggingface.co/docs/inference-providers/pricing` |
| Google AI Studio: per-project limits, daily reset at midnight (Pacific time) | `ai.google.dev/gemini-api/docs/rate-limits` |
| FreeLLMAPI: MIT license, 27,287 stars, changes on 2026-09-17 | GitHub API |

### Could not be checked (flagged ⚠️)

| Fact | Reason |
|---|---|
| Google AI Studio per-model figures | Loaded dynamically; not in the static page |
| OpenRouter limits (20/min, 50/day) | The official page does not publish figures in its HTML (reconfirmed on 2026-09-17 in an earlier review) |
| NVIDIA NIM | The documentation returns 403 to automated clients |
| Mistral | The tiers page that was used returns 404 |
| Trial credits (Fireworks, Baseten, Nebius, Novita, AI21, Upstage, Alibaba) | Automated-client blocking or JavaScript content |

### Removed links

| Link | Reason |
|---|---|
| `github.com/cheahjs/free-llm-api-resources` | Returns 404: the repository no longer exists |
| `github.com/awesome-ai/awesome-ai-apis` | Returns 404 |
| `ai-models.info` | The domain no longer resolves |

### Cited source: FreeLLMAPI

The providers that stopped being free (SambaNova, Reka, OpenCode Zen, Chutes) and the conditions of the no-sign-up services (Kilo, OVHcloud, AI Horde, LLM7) come from `docs/en/providers/01-supported-platforms.md` in the [tashfeenahmed/freellmapi](https://github.com/tashfeenahmed/freellmapi) repository (MIT). They are marked 📎: **they were not independently checked**. The links to those services do respond.
