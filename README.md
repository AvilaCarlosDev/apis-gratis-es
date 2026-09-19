# APIs gratis en español

[English](README.en.md) · **Español**

**Catálogo de APIs gratuitas para la comunidad hispanohablante: IA, divisas, datos abiertos de España y Latinoamérica, clima, geolocalización y APIs de demo. Cada dato dice cómo y cuándo se comprobó; lo que no se pudo comprobar, se marca.**

[![CI](https://github.com/AvilaCarlosDev/apis-gratis-es/actions/workflows/quality.yml/badge.svg)](https://github.com/AvilaCarlosDev/apis-gratis-es/actions/workflows/quality.yml)
[![Licencia: MIT](https://img.shields.io/badge/licencia-MIT-yellow.svg)](LICENSE)

> **Última revisión: 2026-09-19.** Los niveles gratuitos cambian a menudo (esa revisión encontró varios datos desactualizados; ver [docs/verificaciones.md](docs/verificaciones.md)). Antes de depender de un límite, confírmalo en la fuente enlazada.

## Aviso importante

- **No abuses de estos servicios.** Si abusamos, podemos perderlos.
- Esta lista excluye servicios que no son legítimos (por ejemplo, los que hacen ingeniería inversa de chatbots existentes).
- Rotar varias cuentas o claves para esquivar los límites puede violar los términos de algunos proveedores. Revisa los de cada uno.
- Para producción usa planes de pago: un nivel gratuito no es un servicio garantizado.

## Cómo leer esta lista

Cada dato lleva una marca de verificación:

| Marca | Significa |
|---|---|
| ✅ | Comprobado el 2026-09-19 en la documentación oficial del proveedor |
| 🔎 | Comprobado el 2026-09-19 con una API pública o con el registro oficial (sin clave) |
| 📎 | Según la documentación de [FreeLLMAPI](https://github.com/tashfeenahmed/freellmapi) (revisada el 2026-09-19); no comprobado de forma independiente |
| ⚠️ | **No se pudo comprobar** (la página bloquea clientes automáticos, usa JavaScript o ya no existe); el dato viene de una revisión anterior y puede estar desactualizado |

## Contenido

- [Catálogo de APIs sin clave](#catálogo-de-apis-sin-clave)
- [Inteligencia artificial (LLM)](#inteligencia-artificial-llm)
- [Proveedores con nivel gratuito](#proveedores-con-nivel-gratuito)
- [Sin registro y con condiciones](#sin-registro-y-con-condiciones)
- [Proveedores con créditos de prueba](#proveedores-con-créditos-de-prueba)
- [Dejaron de ser gratuitos o cambiaron](#dejaron-de-ser-gratuitos-o-cambiaron)
- [Agregadores self-hosted](#agregadores-self-hosted)
- [Modelos locales](#modelos-locales)
- [Comparativa](#comparativa)
- [Ejemplos de código](#ejemplos-de-código)
- [Cómo verificamos](#cómo-verificamos)
- [Recursos adicionales](#recursos-adicionales)

---

## Demo en funcionamiento

Cada demo es una aplicación distinta, con su propia página, README, pruebas y créditos, y usa solo APIs de este catálogo sin backend ni claves. Portada: https://avilacarlosdev.github.io/apis-gratis-es/

- [Tienda](demos/tienda/README.md): precios en dólares y bolívares a la tasa oficial, con búsqueda, categorías y carrito.
- [Clima](demos/clima/README.md): el clima de hoy y el pronóstico de siete días de cualquier ciudad.

## Catálogo de APIs sin clave

APIs que se pueden llamar **sin registrarse ni pedir una clave**, con su ejemplo verificado con una **llamada real** y sus condiciones de uso (licencia, atribución, límites), que muchas veces se pasan por alto. La tabla se genera desde [`data/apis.json`](data/apis.json) (esquema en [docs/esquema.md](docs/esquema.md)), y cada semana el CI vuelve a llamar a cada API.

**Cómo se verifica:** no basta un `200`. Se exige JSON válido, el tipo esperado y las claves esperadas, porque hay APIs que responden `200` con un error dentro del cuerpo (por ejemplo, una versión deprecada). El **CORS** se mide en una petición aparte con la cabecera `Origin`, como haría un navegador; los resultados que no se pudieron medir se marcan «Desconocido». Los candidatos descartados, con su motivo, están en [docs/verificaciones.md](docs/verificaciones.md).

<!-- catalogo:inicio -->
### Divisas y economía

| API | Qué ofrece | Uso comercial | Atribución | Límites y notas | CORS | Verificada |
|---|---|---|---|---|---|---|
| [DolarAPI — Venezuela](https://dolarapi.com/docs/venezuela/) | Cotizaciones del dólar en Venezuela, incluida la oficial del BCV, en JSON. (Venezuela) | No especificado | No especificada | Servicio de terceros sin garantía de disponibilidad; para algo crítico, aloja tu propia copia del proyecto (MIT). | Abierto | ✅ 2026-09-19 · 191 ms |
| [DolarAPI — Argentina](https://dolarapi.com/docs/) | Cotizaciones de las distintas casas del dólar en Argentina, en JSON. (Argentina) | No especificado | No especificada | — | Abierto | ✅ 2026-09-19 · 182 ms |
| [mindicador.cl](https://mindicador.cl/) | Indicadores económicos de Chile (dólar, euro, UF y otros) del día, en JSON. (Chile) | No especificado | No especificada | — | Abierto | ✅ 2026-09-19 · 626 ms |
| [apis.net.pe — tipo de cambio SUNAT](https://apis.net.pe/) | Tipo de cambio del dólar de la SUNAT (Perú) del día, en JSON. (Perú) | No especificado | No especificada | Servicio de terceros que consulta a la SUNAT. Aplica un límite de peticiones estricto: en las pruebas devolvió 429 tras pocas llamadas seguidas, y no se pudo medir su CORS. Cachea la respuesta y usa un proxy propio si la llamas desde un navegador. | Desconocido | ✅ 2026-09-19 · 1324 ms |
| [Frankfurter — tipos de cambio del BCE](https://frankfurter.dev/) | Tipos de cambio de referencia del Banco Central Europeo y otras fuentes, sin clave. (Global) | Sí | No especificada | Sin cuotas diarias ni mensuales; hay un límite de tasa contra el abuso. | Abierto | ✅ 2026-09-19 · 172 ms |

### Gobierno y datos abiertos

| API | Qué ofrece | Uso comercial | Atribución | Límites y notas | CORS | Verificada |
|---|---|---|---|---|---|---|
| [Datos abiertos de España (datos.gob.es)](https://datos.gob.es/es/apidata) | Catálogo de conjuntos de datos abiertos de las administraciones públicas de España. (España) | No especificado | No especificada | — | Abierto | ✅ 2026-09-19 · 1904 ms |
| [INE — Instituto Nacional de Estadística (España)](https://www.ine.es/dyngs/DAB/index.htm?cid=1099) | Operaciones y series estadísticas del INE de España en JSON. (España) | No especificado | No especificada | — | Abierto | ✅ 2026-09-19 · 2369 ms |
| [Georef — normalización geográfica de Argentina](https://datosgobar.github.io/georef-ar-api/) | Provincias, departamentos, localidades y calles de Argentina, con normalización de nombres. (Argentina) | No especificado | No especificada | — | Abierto | ✅ 2026-09-19 · 684 ms |
| [Series de tiempo de Argentina](https://datosgobar.github.io/series-tiempo-ar-api/) | Series económicas y estadísticas oficiales de Argentina, consultables por identificador. (Argentina) | No especificado | No especificada | El repositorio del proyecto no tiene cambios desde junio de 2024, aunque la API respondió en la última verificación. | Abierto | ✅ 2026-09-19 · 1293 ms |
| [API Colombia](https://api-colombia.com/) | Datos generales de Colombia: país, departamentos, ciudades, regiones y atractivos. (Colombia) | No especificado | No especificada | — | Abierto | ✅ 2026-09-19 · 460 ms |

### Clima y geolocalización

| API | Qué ofrece | Uso comercial | Atribución | Límites y notas | CORS | Verificada |
|---|---|---|---|---|---|---|
| [Open-Meteo — pronóstico](https://open-meteo.com/en/docs) | Pronóstico del tiempo y datos meteorológicos por coordenadas, sin clave. (Global) | No | Obligatoria (CC-BY-4.0) | Menos de 10.000 llamadas al día, 5.000 por hora y 600 por minuto; el nivel gratuito es solo para uso no comercial. | Abierto | ✅ 2026-09-19 · 693 ms |
| [Open-Meteo — geocodificación](https://open-meteo.com/en/docs/geocoding-api) | Busca lugares por nombre y devuelve sus coordenadas, en el idioma que pidas. (Global) | No | Obligatoria (CC-BY-4.0) | Menos de 10.000 llamadas al día, 5.000 por hora y 600 por minuto; el nivel gratuito es solo para uso no comercial. | Abierto | ✅ 2026-09-19 · 724 ms |
| [Nominatim (OpenStreetMap)](https://nominatim.org/release-docs/latest/api/Search/) | Geocodificación con datos de OpenStreetMap: de una dirección o lugar a coordenadas, y al revés. (Global) | No especificado | Obligatoria (ODbL) | Máximo absoluto de 1 petición por segundo; obligatorio un User-Agent o Referer que identifique tu aplicación (el genérico de una librería se bloquea). En la medición del 2026-09-19, con el parámetro accept-language en la URL la respuesta llegó sin cabecera CORS; sin ese parámetro sí la incluye. Para pedir el idioma desde un navegador, usa la cabecera Accept-Language. | Abierto | ✅ 2026-09-19 · 372 ms |
| [Photon (Komoot)](https://photon.komoot.io/) | Búsqueda de lugares y geocodificación con datos de OpenStreetMap, con respuesta en GeoJSON. (Global) | No especificado | No especificada | — | Abierto | ✅ 2026-09-19 · 768 ms |
| [ipwho.is — geolocalización por IP](https://ipwho.is/) | País, ciudad, zona horaria y otros datos aproximados a partir de una dirección IP. (Global) | No especificado | No especificada | — | Abierto | ✅ 2026-09-19 · 180 ms |

### Cultura y datos

| API | Qué ofrece | Uso comercial | Atribución | Límites y notas | CORS | Verificada |
|---|---|---|---|---|---|---|
| [Wikipedia en español — API REST](https://es.wikipedia.org/api/rest_v1/) | Resúmenes y contenido de artículos de la Wikipedia en español. (Global) | No especificado | Obligatoria (CC-BY-SA) | La política de Wikimedia exige un User-Agent que identifique tu aplicación. | Abierto | ✅ 2026-09-19 · 275 ms |
| [Nager.Date — feriados públicos](https://date.nager.at/Api) | Feriados públicos de más de 100 países, por año, incluidos los de Latinoamérica. (Global) | No especificado | No especificada | Sin límite de peticiones, según su documentación. | Abierto | ✅ 2026-09-19 · 219 ms |
| [Nager.Date — Feriados](https://date.nager.at/Api) | Feriados públicos de más de 100 países por año, sin clave y con CORS abierto. (Global) | No especificado | No especificada (MIT) | Servicio de terceros sin garantía de disponibilidad; el proyecto es de código abierto (MIT) y se puede alojar por cuenta propia. | Abierto | ✅ 2026-09-19 · 251 ms |

### Tienda demo

| API | Qué ofrece | Uso comercial | Atribución | Límites y notas | CORS | Verificada |
|---|---|---|---|---|---|---|
| [FakeStoreAPI](https://fakestoreapi.com/docs) | Productos, carritos y usuarios de ejemplo para prototipar una tienda en línea. (Global) | No especificado | No especificada | — | Abierto | ✅ 2026-09-19 · 695 ms |
| [DummyJSON](https://dummyjson.com/docs) | Datos ficticios (productos, carritos, usuarios, recetas) para desarrollar y probar aplicaciones. (Global) | No especificado | No especificada | — | Abierto | ✅ 2026-09-19 · 360 ms |
| [Random User Generator](https://randomuser.me/documentation) | Perfiles de usuarios aleatorios; con nat=es genera nombres y direcciones de España. (Global) | No especificado | No especificada | — | Abierto | ✅ 2026-09-19 · 204 ms |
| [JSONPlaceholder](https://jsonplaceholder.typicode.com/) | API REST falsa y gratuita para pruebas y prototipos: publicaciones, comentarios y usuarios. (Global) | No especificado | No especificada | — | Abierto | ✅ 2026-09-19 · 166 ms |

**Descubierta o basada en:**

- [datosgobar/georef-ar-api](https://github.com/datosgobar/georef-ar-api) (MIT) — Georef — normalización geográfica de Argentina
- [datosgobar/series-tiempo-ar-api](https://github.com/datosgobar/series-tiempo-ar-api) (MIT) — Series de tiempo de Argentina
- [enzonotario/dolarapi.com](https://github.com/enzonotario/dolarapi.com) (MIT) — DolarAPI — Venezuela, DolarAPI — Argentina
- [keikaavousi/fake-store-api](https://github.com/keikaavousi/fake-store-api) (MIT) — FakeStoreAPI
- [komoot/photon](https://github.com/komoot/photon) (Apache-2.0) — Photon (Komoot)
- [nager/Nager.Date](https://github.com/nager/Nager.Date) (MIT) — Nager.Date — feriados públicos, Nager.Date — Feriados
- [osm-search/Nominatim](https://github.com/osm-search/Nominatim) (GPL-3.0) — Nominatim (OpenStreetMap)
- [Ovi/DummyJSON](https://github.com/Ovi/DummyJSON) — DummyJSON
- [public-apis/public-apis](https://github.com/public-apis/public-apis) (MIT) — Datos abiertos de España (datos.gob.es), Open-Meteo — pronóstico, Open-Meteo — geocodificación, Nominatim (OpenStreetMap), Nager.Date — feriados públicos, FakeStoreAPI, DummyJSON, Random User Generator, JSONPlaceholder
- [RandomAPI/Randomuser.me-Node](https://github.com/RandomAPI/Randomuser.me-Node) (MIT) — Random User Generator
- [typicode/jsonplaceholder](https://github.com/typicode/jsonplaceholder) (MIT) — JSONPlaceholder
<!-- catalogo:fin -->

---

## Inteligencia artificial (LLM)

Las secciones siguientes, hasta «Cómo verificamos», cubren la categoría **IA**: proveedores de LLM con nivel gratuito. Aquí casi todos exigen una clave, así que su verificación es documental y se marca con los símbolos de arriba.

---

## Proveedores con nivel gratuito

### [OpenRouter](https://openrouter.ai)

- **Límites:** 20 solicitudes/minuto, 50/día, y hasta 1.000/día con al menos $10 de crédito acumulado. ⚠️ Cifras reconfirmadas el 2026-09-17; el 2026-09-19 la [página oficial de límites](https://openrouter.ai/docs/api-reference/limits) no las publica en su HTML.
- **Modelos gratuitos:** 🔎 22 modelos de texto con sufijo `:free` el 2026-09-19. Algunos de ellos:

| Modelo | Contexto |
|---|---|
| `google/gemma-4-31b-it:free` | 262 K |
| `google/gemma-4-26b-a4b-it:free` | 262 K |
| `deepseek/deepseek-v4-flash-0731:free` | 1 M |
| `nvidia/nemotron-3-super-120b-a12b:free` | 262 K |
| `nvidia/nemotron-3-ultra-550b-a55b:free` | 1 M |
| `qwen/qwen3.8-27b:free` | 262 K |
| `cohere/north-mini-code:free` | 256 K (código) |
| `liquid/lfm-2.5-2.6b:free` | 65 K |

Lista completa y vigente, sin clave:

```bash
curl -s https://openrouter.ai/api/v1/models | jq -r '.data[] | select(.id | endswith(":free")) | .id'
```

> Los siete modelos que esta lista mostraba antes (Gemma 3 27B y 12B, Llama 3.3 70B, Llama 3.2 3B, Qwen 2.5 Coder 32B, Mistral 7B y DeepSeek R1) **ya no son gratuitos** en OpenRouter.

### [Google AI Studio](https://aistudio.google.com)

- **Requiere:** cuenta de Google.
- **Cómo funcionan las cuotas:** ✅ los límites se aplican **por proyecto, no por clave**, se miden en solicitudes/minuto, tokens/minuto y solicitudes/día, y la cuota diaria se reinicia a medianoche (hora del Pacífico). Fuente: [documentación oficial de límites](https://ai.google.dev/gemini-api/docs/rate-limits).
- **Cifras por modelo:** ⚠️ no se publican en la página estática y varían por modelo; consulta tus límites activos en AI Studio. Las cifras que esta lista mostraba antes se retiraron por no poder confirmarse.
- **Datos:** revisa en los términos del servicio si tus datos pueden usarse para mejorar los modelos en tu región.

### [NVIDIA NIM](https://build.nvidia.com/explore/discover)

- ⚠️ Según una revisión anterior: unas 40 solicitudes/minuto y verificación por número de teléfono. No se pudo comprobar el 2026-09-19 (la documentación devolvió 403 a clientes automáticos).

### [Mistral La Plateforme](https://console.mistral.ai/)

- ⚠️ Según una revisión anterior: plan *Experiment* gratuito con verificación por teléfono, 1 solicitud/segundo, 500.000 tokens/minuto y 1.000 millones de tokens/mes. No se pudo comprobar el 2026-09-19 (la página de niveles que se usaba ya no existe: 404).

### [Hugging Face — Inference Providers](https://huggingface.co/docs/inference-providers/)

- ✅ Cada usuario gratuito recibe **$0,10 al mes** en créditos para Inference Providers (*sujeto a cambios*, según su [página de precios](https://huggingface.co/docs/inference-providers/pricing)); los usuarios PRO reciben $2. Es una cantidad muy pequeña, suficiente para experimentar.

### [Groq](https://console.groq.com)

- ✅ Plan gratuito, según su [página de límites](https://console.groq.com/docs/rate-limits):

| Modelo | RPM | RPD | TPM | TPD |
|---|---|---|---|---|
| `openai/gpt-oss-120b` | 30 | 1.000 | 8.000 | 200.000 |
| `openai/gpt-oss-20b` | 30 | 1.000 | 8.000 | 200.000 |

- ✅ **Retirados del uso gratuito** (su [historial de retiradas](https://console.groq.com/docs/deprecations)): `llama-3.1-8b-instant` y `llama-3.3-70b-versatile` (16 de agosto de 2026), y `llama-4-scout-17b-16e-instruct` y `qwen3-32b` (17 de julio de 2026). Groq recomienda migrar a `openai/gpt-oss-20b` y `openai/gpt-oss-120b`.

### [Cohere](https://cohere.com)

- ✅ Las **claves de prueba** son gratuitas y están limitadas a **1.000 llamadas a la API al mes**; los modelos de chat (por ejemplo Command A+) permiten 20 solicitudes/minuto en prueba. Fuente: [límites de Cohere](https://docs.cohere.com/docs/rate-limits).
- Las claves de prueba no son para uso comercial.

### [GitHub Models](https://github.com/marketplace/models)

- ⚠️ Los límites dependen de tu plan de GitHub Copilot y se miden por minuto y por día. La tabla que esta lista mostraba antes ("200 solicitudes al mes en el plan gratuito", etc.) **no se pudo confirmar y probablemente era incorrecta**, así que se retiró. Consulta los [límites vigentes](https://docs.github.com/en/github-models/use-github-models/prototyping-with-ai-models).

### [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai)

- ✅ **10.000 neuronas al día sin cargo**; por encima de eso hace falta el plan de pago de Workers, a $0,011 por cada 1.000 neuronas. Fuente: [precios oficiales](https://developers.cloudflare.com/workers-ai/platform/pricing/).
- Las 10.000 neuronas diarias equivalen a unos **$0,11** al precio de pago (esta lista decía ~$0,50, un error de cálculo).
- Consulta el [catálogo de modelos](https://developers.cloudflare.com/workers-ai/models/) vigente.

---

## Sin registro y con condiciones

Servicios que funcionan sin clave o con una anónima. 📎 Las condiciones vienen de la documentación de FreeLLMAPI (`docs/en/providers/01-supported-platforms.md`); los enlaces responden (✅) pero las condiciones no se comprobaron de forma independiente.

| Servicio | Condiciones |
|---|---|
| [Kilo Gateway](https://kilo.ai) | Rutas anónimas `:free`, 200 solicitudes/hora por IP. **Los prompts y las respuestas se registran para entrenamiento.** |
| [OVHcloud AI Endpoints](https://endpoints.ai.cloud.ovh.net) | Nivel anónimo: 2 solicitudes/minuto por IP y por modelo (en la práctica, más estricto). El nivel con clave exige un proyecto Public Cloud con método de pago. |
| [AI Horde](https://aihorde.net) | Trabajadores voluntarios de la comunidad, con cola de espera; clave anónima (una registrada sube la prioridad). |
| [LLM7.io](https://llm7.io) | 100 solicitudes/hora en el nivel gratuito; los modelos básicos funcionan de forma anónima. |

---

## Proveedores con créditos de prueba

Dan créditos limitados, no un nivel gratuito permanente. ⚠️ Estas cifras vienen de una revisión anterior y **no se pudieron comprobar** el 2026-09-19 (varias páginas bloquean clientes automáticos o usan JavaScript), salvo Cerebras.

- [Fireworks](https://fireworks.ai/) — $1
- [Baseten](https://app.baseten.co/) — $30 (pago por tiempo de cómputo)
- [Nebius](https://tokenfactory.nebius.com/) — $1
- [Novita](https://novita.ai/) — $0,50 (1 año)
- [AI21](https://studio.ai21.com/) — $10 (3 meses), familia Jamba
- [Upstage](https://console.upstage.ai/) — $10 (3 meses), Solar
- [Alibaba Cloud Model Studio](https://bailian.console.alibabacloud.com/) — 1 millón de tokens por modelo (Qwen)
- **[Cerebras](https://cloud.cerebras.ai)** — verificado el 2026-09-17: $5 que expiran a los 30 días y exigen tarjeta de pago verificada para activarse (sin cargo hasta comprar más créditos). Su propia documentación dice que **no ofrece un nivel gratuito permanente**.

---

## Dejaron de ser gratuitos o cambiaron

Esto ayuda a no perder tiempo con opciones que ya no funcionan.

| Qué cambió | Fuente |
|---|---|
| Groq: `llama-3.1-8b-instant`, `llama-3.3-70b-versatile`, `llama-4-scout` y `qwen3-32b` ya no están en el plan gratuito (jul.–ago. de 2026) | ✅ [Groq](https://console.groq.com/docs/deprecations) |
| OpenRouter: los 7 modelos gratuitos de la lista anterior ya no lo son | 🔎 [API pública de OpenRouter](https://openrouter.ai/api/v1/models) |
| SambaNova: el nivel gratuito desapareció de forma permanente | 📎 FreeLLMAPI |
| Reka: sin nivel gratuito para cuentas nuevas desde septiembre de 2026 (exige créditos prepago) | 📎 FreeLLMAPI |
| OpenCode Zen: los modelos gratuitos quedaron limitados a su propio cliente desde septiembre de 2026 | 📎 FreeLLMAPI |
| Chutes: todos los modelos devolvieron 402 exigiendo saldo, así que no cumple "sin tarjeta" | 📎 FreeLLMAPI |

---

## Agregadores self-hosted

En vez de gestionar una clave y unos límites distintos por proveedor, un agregador los combina detrás de un solo endpoint.

### [FreeLLMAPI](https://github.com/tashfeenahmed/freellmapi) — por [tashfeenahmed](https://github.com/tashfeenahmed)

Router self-hosted (Docker) que agrega proveedores de LLM con nivel gratuito detrás de un único endpoint compatible con la API de OpenAI (`/v1`). Guarda las claves cifradas, elige el mejor modelo disponible, pasa al siguiente proveedor cuando uno te limita y lleva la cuenta de uso por clave.

- **Proyecto:** 🔎 MIT, 27.287 estrellas y cambios el 2026-09-17 (datos de GitHub del 2026-09-19).
- **Alcance:** 📎 su README habla de 34 proveedores y 635 endpoints de modelos gratuitos; su documentación de plataformas enumera además varios ya retirados (por eso la sección anterior).
- **Costo:** gratis y de código abierto. Tiene una opción de pago en [freellmapi.co](https://freellmapi.co) (📎 $19 al año o $49 por única vez) que ofrece un catálogo de modelos al día, en lugar del catálogo gratuito con unos 30 días de retraso.
- **Requiere:** tus propias claves de cada proveedor; el proyecto no las provee, solo las orquesta.
- **Advertencia del propio proyecto:** *"Este proyecto es para experimentación personal y aprendizaje, no para producción"*; los niveles gratuitos existen para prototipar y no son un servicio estable.
- **Uso real:** funciona desde septiembre de 2026 como backend de LLM de un homelab personal del mantenedor de esta lista.

```yaml
# docker-compose.yml mínimo
services:
  freellmapi:
    image: ghcr.io/tashfeenahmed/freellmapi:latest
    ports:
      - "127.0.0.1:3001:3001"
    volumes:
      - freellmapi-data:/app/server/data
    restart: unless-stopped
volumes:
  freellmapi-data:
```

---

## Modelos locales

Sin límites de proveedor: dependen de tu hardware (RAM y GPU).

### [Ollama](https://ollama.com)

Instalación: [descargas oficiales](https://ollama.com/download). Existe también el script oficial (`curl -fsSL https://ollama.com/install.sh | sh`); léelo antes de ejecutarlo, como cualquier script descargado.

Modelos populares, 🔎 comprobado que existen en la biblioteca de Ollama el 2026-09-19 (la calidad en español varía; pruébalos con tu caso de uso):

```bash
ollama pull llama3.2
ollama pull gemma3
ollama pull qwen3
ollama pull mistral:7b-instruct-v0.2-q4_K_M
```

### [LM Studio](https://lmstudio.ai/)

Interfaz gráfica gratuita para descargar modelos y usarlos con una API local compatible con OpenAI.

### [LocalAI](https://localai.io/)

Alternativa self-hosted a la API de OpenAI, con varios backends.

---

## Comparativa

| Proveedor | Qué da gratis | Verificación (2026-09-19) |
|---|---|---|
| OpenRouter | 22 modelos de texto `:free` | 🔎 modelos · ⚠️ límites |
| Google AI Studio | Nivel gratuito por proyecto | ✅ mecánica de cuotas · ⚠️ cifras |
| NVIDIA NIM | Nivel gratuito con verificación de teléfono | ⚠️ no verificable |
| Mistral | Plan *Experiment* | ⚠️ no verificable |
| Hugging Face | $0,10 al mes | ✅ |
| Groq | `gpt-oss-120b` y `gpt-oss-20b`: 30 RPM, 1.000 RPD | ✅ |
| Cohere | 1.000 llamadas al mes (clave de prueba) | ✅ |
| GitHub Models | Según tu plan de Copilot | ⚠️ sin cifras |
| Cloudflare | 10.000 neuronas al día | ✅ |
| FreeLLMAPI | Depende de las claves que le des | 🔎 existencia y licencia |
| Ollama | Local, sin límites de proveedor | 🔎 modelos |

---

## Ejemplos de código

Los modelos de estos ejemplos los comprueba automáticamente [`scripts/verificar.py`](scripts/verificar.py).

### Bash — OpenRouter

```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "google/gemma-4-31b-it:free",
    "messages": [{"role": "user", "content": "Hola, ¿cómo estás?"}]
  }'
```

### Python — OpenRouter

```python
import os
import requests

response = requests.post(
    "https://openrouter.ai/api/v1/chat/completions",
    headers={"Authorization": f"Bearer {os.environ['OPENROUTER_KEY']}"},
    json={
        "model": "google/gemma-4-31b-it:free",
        "messages": [{"role": "user", "content": "Hola, ¿cómo estás?"}],
    },
    timeout=60,
)
response.raise_for_status()
print(response.json()["choices"][0]["message"]["content"])
```

### JavaScript (Node) — Groq

```javascript
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const response = await groq.chat.completions.create({
  model: 'openai/gpt-oss-20b',
  messages: [{ role: 'user', content: 'Hola, ¿cómo estás?' }]
});

console.log(response.choices[0].message.content);
```

### Bash — Ollama local

```bash
ollama pull llama3.2
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Explica qué es una API",
  "stream": false
}'
```

---

## Cómo verificamos

- **Automático** ([`scripts/verificar.py`](scripts/verificar.py), semanal y en cada cambio): comprueba que los modelos `:free` de OpenRouter que cita el README existen hoy, que los tags de `ollama pull` existen en el registro oficial de Ollama y que los modelos de los ejemplos de Groq no están en su historial de retiradas. Si algo se rompe, el CI falla.
- **Manual:** los límites numéricos de cada proveedor se contrastan con su documentación oficial cuando la página lo permite. Cuando no (bloqueo de clientes automáticos, contenido con JavaScript o página inexistente), el dato se marca ⚠️ en vez de darlo por bueno.
- **Registro de la última revisión**, con cada fuente y su resultado: [docs/verificaciones.md](docs/verificaciones.md).

Si encuentras un dato desactualizado, abre un issue con la fuente.

---

## Recursos adicionales

### Listas relacionadas

- [open-free-llm-api/awesome-freellm-apis](https://github.com/open-free-llm-api/awesome-freellm-apis) — lista en inglés con más de 40 proveedores; activa, con licencia MIT.

### En español

- [Hugging Face — cursos](https://huggingface.co/learn)
- [Biblioteca de modelos de Ollama](https://ollama.com/library)
- [4Geeks Academy — cursos de IA](https://4geeksacademy.com/)

---

## Cómo contribuir

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para el formato y las reglas. Toda cifra nueva debe llevar su fuente y la fecha en que se comprobó.

## Créditos

- **Esta lista se apoya en el trabajo de [FreeLLMAPI](https://github.com/tashfeenahmed/freellmapi), de [tashfeenahmed](https://github.com/tashfeenahmed)** (MIT): los proveedores que dejaron de ser gratuitos, los servicios sin registro y sus condiciones, y la sección de agregadores salen de la documentación pública de ese proyecto, citada en cada caso. No es obra de este repositorio: aquí solo se documenta y se enlaza a su fuente original. Gracias.
- **El catálogo de APIs sin clave se apoya en [public-apis/public-apis](https://github.com/public-apis/public-apis)** (MIT): sus entradas sirvieron para descubrir candidatos; cada API se verificó de forma independiente y sus descripciones y condiciones son propias. Los créditos de cada proyecto, con su licencia, están en la tabla de créditos del catálogo y en el campo `creditos` de cada entrada. Gracias.
- Esta lista se inspiró en `free-llm-api-resources`, de cheahjs; ese repositorio ya no está disponible en GitHub, por eso no se enlaza.
- Mantenida por [Carlos Avila](https://github.com/AvilaCarlosDev). Desarrollada con el apoyo de Claude (Anthropic) como asistente de revisión y de verificación de fuentes; la selección y la revisión final son del autor.

## Licencia

MIT — ver [LICENSE](LICENSE).
