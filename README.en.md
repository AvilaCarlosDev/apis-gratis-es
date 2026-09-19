# Free APIs in Spanish

**English** · [Español](README.md)

**A catalog of free APIs for the Spanish-speaking community: AI, currencies, open data from Spain and Latin America, weather, geolocation and demo APIs. Every fact says how and when it was checked; whatever could not be checked is flagged.**

[![CI](https://github.com/AvilaCarlosDev/apis-gratis-es/actions/workflows/quality.yml/badge.svg)](https://github.com/AvilaCarlosDev/apis-gratis-es/actions/workflows/quality.yml)
[![License: MIT](https://img.shields.io/badge/licencia-MIT-yellow.svg)](LICENSE)

> **Last review: 2026-09-19.** Free tiers change often (that review found several outdated facts; see [docs/verificaciones.md](docs/verificaciones.md)). Before relying on a limit, confirm it at the linked source.

## Important notice

- **Do not abuse these services.** If we abuse them, we may lose them.
- This list excludes services that are not legitimate (for example, those that reverse-engineer existing chatbots).
- Rotating several accounts or keys to get around the limits may violate some providers' terms. Check each one's.
- For production use paid plans: a free tier is not a guaranteed service.

## How to read this list

Every fact carries a verification mark:

| Mark | Means |
|---|---|
| ✅ | Checked on 2026-09-19 in the provider's official documentation |
| 🔎 | Checked on 2026-09-19 with a public API or the official registry (no key) |
| 📎 | According to the documentation of [FreeLLMAPI](https://github.com/tashfeenahmed/freellmapi) (reviewed on 2026-09-19); not independently checked |
| ⚠️ | **Could not be checked** (the page blocks automated clients, uses JavaScript, or no longer exists); the fact comes from an earlier review and may be outdated |

## Contents

- [Keyless API catalog](#keyless-api-catalog)
- [Artificial intelligence (LLM)](#artificial-intelligence-llm)
- [Providers with a free tier](#providers-with-a-free-tier)
- [No sign-up, with conditions](#no-sign-up-with-conditions)
- [Providers with trial credits](#providers-with-trial-credits)
- [No longer free, or changed](#no-longer-free-or-changed)
- [Self-hosted aggregators](#self-hosted-aggregators)
- [Local models](#local-models)
- [Comparison](#comparison)
- [Code examples](#code-examples)
- [How we verify](#how-we-verify)
- [Additional resources](#additional-resources)

---

## Working demo

Each demo is a separate application, with its own page, README, tests and credits, and uses only APIs from this catalog with no backend and no keys. Home page: https://avilacarlosdev.github.io/apis-gratis-es/

- [Store](demos/tienda/README.en.md): prices in dollars and bolívares at the official rate, with search, categories and a cart.
- [Weather](demos/clima/README.en.md): today's weather and a seven-day forecast for any city.

## Keyless API catalog

APIs you can call **without signing up or getting a key**, each with an example verified by a **real call** and its terms of use (license, attribution, limits), which are often overlooked. The table is generated from [`data/apis.json`](data/apis.json) (schema in [docs/esquema.md](docs/esquema.md)), and every week CI calls each API again.

**How it is verified:** a `200` is not enough. Valid JSON, the expected type and the expected keys are required, because some APIs answer `200` with an error inside the body (for example, a deprecated version). **CORS** is measured in a separate request with the `Origin` header, as a browser would; results that could not be measured are marked "Unknown". Rejected candidates, with the reason, are in [docs/verificaciones.md](docs/verificaciones.md).

<!-- catalogo:inicio -->
### Currencies and economy

| API | What it offers | Commercial use | Attribution | Limits and notes | CORS | Verified |
|---|---|---|---|---|---|---|
| [DolarAPI — Venezuela](https://dolarapi.com/docs/venezuela/) | Dollar exchange rates in Venezuela, including the official BCV rate, as JSON. (Venezuela) | Not specified | Not specified | Third-party service with no availability guarantee; for anything critical, host your own copy of the project (MIT). | Open | ✅ 2026-09-19 · 191 ms |
| [DolarAPI — Argentina](https://dolarapi.com/docs/) | Rates from the different dollar exchange houses in Argentina, as JSON. (Argentina) | Not specified | Not specified | — | Open | ✅ 2026-09-19 · 182 ms |
| [mindicador.cl](https://mindicador.cl/) | Daily economic indicators for Chile (dollar, euro, UF and others) as JSON. (Chile) | Not specified | Not specified | — | Open | ✅ 2026-09-19 · 626 ms |
| [apis.net.pe — tipo de cambio SUNAT](https://apis.net.pe/) | The SUNAT (Peru) dollar exchange rate for the day, as JSON. (Perú) | Not specified | Not specified | Third-party service that queries SUNAT. It applies a strict rate limit: in testing it returned 429 after a few consecutive calls, and its CORS could not be measured. Cache the response and use your own proxy if you call it from a browser. | Unknown | ✅ 2026-09-19 · 1324 ms |
| [Frankfurter — tipos de cambio del BCE](https://frankfurter.dev/) | Reference exchange rates from the European Central Bank and other sources, no key. (Global) | Yes | Not specified | No daily or monthly quotas; there is a rate limit against abuse. | Open | ✅ 2026-09-19 · 172 ms |

### Government and open data

| API | What it offers | Commercial use | Attribution | Limits and notes | CORS | Verified |
|---|---|---|---|---|---|---|
| [Datos abiertos de España (datos.gob.es)](https://datos.gob.es/es/apidata) | Catalog of open datasets from Spain's public administrations. (España) | Not specified | Not specified | — | Open | ✅ 2026-09-19 · 1904 ms |
| [INE — Instituto Nacional de Estadística (España)](https://www.ine.es/dyngs/DAB/index.htm?cid=1099) | Operations and statistical series from Spain's INE, as JSON. (España) | Not specified | Not specified | — | Open | ✅ 2026-09-19 · 2369 ms |
| [Georef — normalización geográfica de Argentina](https://datosgobar.github.io/georef-ar-api/) | Provinces, departments, localities and streets of Argentina, with name normalization. (Argentina) | Not specified | Not specified | — | Open | ✅ 2026-09-19 · 684 ms |
| [Series de tiempo de Argentina](https://datosgobar.github.io/series-tiempo-ar-api/) | Official economic and statistical series from Argentina, queryable by identifier. (Argentina) | Not specified | Not specified | The project's repository has had no changes since June 2024, although the API responded in the latest verification. | Open | ✅ 2026-09-19 · 1293 ms |
| [API Colombia](https://api-colombia.com/) | General data about Colombia: country, departments, cities, regions and attractions. (Colombia) | Not specified | Not specified | — | Open | ✅ 2026-09-19 · 460 ms |

### Weather and geolocation

| API | What it offers | Commercial use | Attribution | Limits and notes | CORS | Verified |
|---|---|---|---|---|---|---|
| [Open-Meteo — pronóstico](https://open-meteo.com/en/docs) | Weather forecast and meteorological data by coordinates, no key. (Global) | No | Required (CC-BY-4.0) | Fewer than 10,000 calls per day, 5,000 per hour and 600 per minute; the free tier is for non-commercial use only. | Open | ✅ 2026-09-19 · 693 ms |
| [Open-Meteo — geocodificación](https://open-meteo.com/en/docs/geocoding-api) | Search places by name and get their coordinates, in the language you ask for. (Global) | No | Required (CC-BY-4.0) | Fewer than 10,000 calls per day, 5,000 per hour and 600 per minute; the free tier is for non-commercial use only. | Open | ✅ 2026-09-19 · 724 ms |
| [Nominatim (OpenStreetMap)](https://nominatim.org/release-docs/latest/api/Search/) | Geocoding with OpenStreetMap data: from an address or place to coordinates, and back. (Global) | Not specified | Required (ODbL) | Absolute maximum of 1 request per second; a User-Agent or Referer identifying your application is mandatory (a library's generic one is blocked). In the 2026-09-19 measurement, with the accept-language parameter in the URL the response arrived without a CORS header; without that parameter it includes it. To ask for a language from a browser, use the Accept-Language header. | Open | ✅ 2026-09-19 · 372 ms |
| [Photon (Komoot)](https://photon.komoot.io/) | Place search and geocoding with OpenStreetMap data, with a GeoJSON response. (Global) | Not specified | Not specified | — | Open | ✅ 2026-09-19 · 768 ms |
| [ipwho.is — geolocalización por IP](https://ipwho.is/) | Country, city, time zone and other approximate data from an IP address. (Global) | Not specified | Not specified | — | Open | ✅ 2026-09-19 · 180 ms |

### Culture and data

| API | What it offers | Commercial use | Attribution | Limits and notes | CORS | Verified |
|---|---|---|---|---|---|---|
| [Wikipedia en español — API REST](https://es.wikipedia.org/api/rest_v1/) | Summaries and content of articles from the Spanish-language Wikipedia. (Global) | Not specified | Required (CC-BY-SA) | Wikimedia's policy requires a User-Agent that identifies your application. | Open | ✅ 2026-09-19 · 275 ms |
| [Nager.Date — feriados públicos](https://date.nager.at/Api) | Public holidays of more than 100 countries, by year, including those in Latin America. (Global) | Not specified | Not specified | No request limit, according to its documentation. | Open | ✅ 2026-09-19 · 219 ms |

### Demo store

| API | What it offers | Commercial use | Attribution | Limits and notes | CORS | Verified |
|---|---|---|---|---|---|---|
| [FakeStoreAPI](https://fakestoreapi.com/docs) | Sample products, carts and users to prototype an online store. (Global) | Not specified | Not specified | — | Open | ✅ 2026-09-19 · 695 ms |
| [DummyJSON](https://dummyjson.com/docs) | Fake data (products, carts, users, recipes) to develop and test applications. (Global) | Not specified | Not specified | — | Open | ✅ 2026-09-19 · 360 ms |
| [Random User Generator](https://randomuser.me/documentation) | Random user profiles; with nat=es it generates names and addresses from Spain. (Global) | Not specified | Not specified | — | Open | ✅ 2026-09-19 · 204 ms |
| [JSONPlaceholder](https://jsonplaceholder.typicode.com/) | Free fake REST API for testing and prototypes: posts, comments and users. (Global) | Not specified | Not specified | — | Open | ✅ 2026-09-19 · 166 ms |

**Discovered from or built on:**

- [datosgobar/georef-ar-api](https://github.com/datosgobar/georef-ar-api) (MIT) — Georef — normalización geográfica de Argentina
- [datosgobar/series-tiempo-ar-api](https://github.com/datosgobar/series-tiempo-ar-api) (MIT) — Series de tiempo de Argentina
- [enzonotario/dolarapi.com](https://github.com/enzonotario/dolarapi.com) (MIT) — DolarAPI — Venezuela, DolarAPI — Argentina
- [keikaavousi/fake-store-api](https://github.com/keikaavousi/fake-store-api) (MIT) — FakeStoreAPI
- [komoot/photon](https://github.com/komoot/photon) (Apache-2.0) — Photon (Komoot)
- [nager/Nager.Date](https://github.com/nager/Nager.Date) (MIT) — Nager.Date — feriados públicos
- [osm-search/Nominatim](https://github.com/osm-search/Nominatim) (GPL-3.0) — Nominatim (OpenStreetMap)
- [Ovi/DummyJSON](https://github.com/Ovi/DummyJSON) — DummyJSON
- [public-apis/public-apis](https://github.com/public-apis/public-apis) (MIT) — Datos abiertos de España (datos.gob.es), Open-Meteo — pronóstico, Open-Meteo — geocodificación, Nominatim (OpenStreetMap), Nager.Date — feriados públicos, FakeStoreAPI, DummyJSON, Random User Generator, JSONPlaceholder
- [RandomAPI/Randomuser.me-Node](https://github.com/RandomAPI/Randomuser.me-Node) (MIT) — Random User Generator
- [typicode/jsonplaceholder](https://github.com/typicode/jsonplaceholder) (MIT) — JSONPlaceholder
<!-- catalogo:fin -->

---

## Artificial intelligence (LLM)

The following sections, up to "How we verify", cover the **AI** category: LLM providers with a free tier. Almost all of them require a key here, so their verification is documentary and is marked with the symbols above.

---

## Providers with a free tier

### [OpenRouter](https://openrouter.ai)

- **Limits:** 20 requests/minute, 50/day, and up to 1,000/day with at least $10 of accumulated credit. ⚠️ Figures reconfirmed on 2026-09-17; on 2026-09-19 the [official limits page](https://openrouter.ai/docs/api-reference/limits) does not publish them in its HTML.
- **Free models:** 🔎 22 text models with the `:free` suffix on 2026-09-19. Some of them:

| Model | Context |
|---|---|
| `google/gemma-4-31b-it:free` | 262 K |
| `google/gemma-4-26b-a4b-it:free` | 262 K |
| `deepseek/deepseek-v4-flash-0731:free` | 1 M |
| `nvidia/nemotron-3-super-120b-a12b:free` | 262 K |
| `nvidia/nemotron-3-ultra-550b-a55b:free` | 1 M |
| `qwen/qwen3.8-27b:free` | 262 K |
| `cohere/north-mini-code:free` | 256 K (code) |
| `liquid/lfm-2.5-2.6b:free` | 65 K |

Full, current list, no key needed:

```bash
curl -s https://openrouter.ai/api/v1/models | jq -r '.data[] | select(.id | endswith(":free")) | .id'
```

> The seven models this list used to show (Gemma 3 27B and 12B, Llama 3.3 70B, Llama 3.2 3B, Qwen 2.5 Coder 32B, Mistral 7B and DeepSeek R1) are **no longer free** on OpenRouter.

### [Google AI Studio](https://aistudio.google.com)

- **Requires:** a Google account.
- **How quotas work:** ✅ limits apply **per project, not per key**, are measured in requests/minute, tokens/minute and requests/day, and the daily quota resets at midnight (Pacific time). Source: [official rate-limits documentation](https://ai.google.dev/gemini-api/docs/rate-limits).
- **Per-model figures:** ⚠️ they are not published on the static page and vary by model; check your active limits in AI Studio. The figures this list used to show were removed because they could not be confirmed.
- **Data:** check in the terms of service whether your data may be used to improve the models in your region.

### [NVIDIA NIM](https://build.nvidia.com/explore/discover)

- ⚠️ From an earlier review: about 40 requests/minute and phone-number verification. It could not be checked on 2026-09-19 (the documentation returned 403 to automated clients).

### [Mistral La Plateforme](https://console.mistral.ai/)

- ⚠️ From an earlier review: free *Experiment* plan with phone verification, 1 request/second, 500,000 tokens/minute and 1 billion tokens/month. It could not be checked on 2026-09-19 (the tiers page that was used no longer exists: 404).

### [Hugging Face — Inference Providers](https://huggingface.co/docs/inference-providers/)

- ✅ Every free user gets **$0.10 per month** in credits for Inference Providers (*subject to change*, per its [pricing page](https://huggingface.co/docs/inference-providers/pricing)); PRO users get $2. It is a very small amount, enough to experiment.

### [Groq](https://console.groq.com)

- ✅ Free plan, per its [limits page](https://console.groq.com/docs/rate-limits):

| Model | RPM | RPD | TPM | TPD |
|---|---|---|---|---|
| `openai/gpt-oss-120b` | 30 | 1,000 | 8,000 | 200,000 |
| `openai/gpt-oss-20b` | 30 | 1,000 | 8,000 | 200,000 |

- ✅ **Removed from free use** (its [deprecation history](https://console.groq.com/docs/deprecations)): `llama-3.1-8b-instant` and `llama-3.3-70b-versatile` (August 16, 2026), and `llama-4-scout-17b-16e-instruct` and `qwen3-32b` (July 17, 2026). Groq recommends migrating to `openai/gpt-oss-20b` and `openai/gpt-oss-120b`.

### [Cohere](https://cohere.com)

- ✅ **Trial keys** are free and limited to **1,000 API calls per month**; chat models (for example Command A+) allow 20 requests/minute on trial. Source: [Cohere limits](https://docs.cohere.com/docs/rate-limits).
- Trial keys are not for commercial use.

### [GitHub Models](https://github.com/marketplace/models)

- ⚠️ Limits depend on your GitHub Copilot plan and are measured per minute and per day. The table this list used to show ("200 requests per month on the free plan", etc.) **could not be confirmed and was probably wrong**, so it was removed. Check the [current limits](https://docs.github.com/en/github-models/use-github-models/prototyping-with-ai-models).

### [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai)

- ✅ **10,000 neurons per day at no charge**; above that you need the paid Workers plan, at $0.011 per 1,000 neurons. Source: [official pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).
- The 10,000 daily neurons are worth about **$0.11** at the paid price (this list used to say ~$0.50, a calculation error).
- See the current [model catalog](https://developers.cloudflare.com/workers-ai/models/).

---

## No sign-up, with conditions

Services that work without a key or with an anonymous one. 📎 The conditions come from FreeLLMAPI's documentation (`docs/en/providers/01-supported-platforms.md`); the links respond (✅) but the conditions were not independently checked.

| Service | Conditions |
|---|---|
| [Kilo Gateway](https://kilo.ai) | Anonymous `:free` routes, 200 requests/hour per IP. **Prompts and outputs are logged for training.** |
| [OVHcloud AI Endpoints](https://endpoints.ai.cloud.ovh.net) | Anonymous tier: 2 requests/minute per IP and per model (stricter in practice). The keyed tier requires a Public Cloud project with a payment method. |
| [AI Horde](https://aihorde.net) | Community volunteer workers with a waiting queue; anonymous key (a registered one raises priority). |
| [LLM7.io](https://llm7.io) | 100 requests/hour on the free tier; basic models work anonymously. |

---

## Providers with trial credits

They give limited credits, not a permanent free tier. ⚠️ These figures come from an earlier review and **could not be checked** on 2026-09-19 (several pages block automated clients or use JavaScript), except Cerebras.

- [Fireworks](https://fireworks.ai/) — $1
- [Baseten](https://app.baseten.co/) — $30 (pay per compute time)
- [Nebius](https://tokenfactory.nebius.com/) — $1
- [Novita](https://novita.ai/) — $0.50 (1 year)
- [AI21](https://studio.ai21.com/) — $10 (3 months), Jamba family
- [Upstage](https://console.upstage.ai/) — $10 (3 months), Solar
- [Alibaba Cloud Model Studio](https://bailian.console.alibabacloud.com/) — 1 million tokens per model (Qwen)
- **[Cerebras](https://cloud.cerebras.ai)** — verified on 2026-09-17: $5 that expire after 30 days and require a verified payment card to activate (no charge until you buy more credits). Its own documentation says it **does not offer a permanent free tier**.

---

## No longer free, or changed

This helps avoid wasting time on options that no longer work.

| What changed | Source |
|---|---|
| Groq: `llama-3.1-8b-instant`, `llama-3.3-70b-versatile`, `llama-4-scout` and `qwen3-32b` are no longer on the free plan (Jul.–Aug. 2026) | ✅ [Groq](https://console.groq.com/docs/deprecations) |
| OpenRouter: the 7 free models of the previous list are no longer free | 🔎 [OpenRouter public API](https://openrouter.ai/api/v1/models) |
| SambaNova: the free tier is permanently gone | 📎 FreeLLMAPI |
| Reka: no free tier for new accounts since September 2026 (prepaid credits required) | 📎 FreeLLMAPI |
| OpenCode Zen: the free models became limited to its own client since September 2026 | 📎 FreeLLMAPI |
| Chutes: every model returned 402 demanding a balance, so it does not meet "no card" | 📎 FreeLLMAPI |

---

## Self-hosted aggregators

Instead of managing a different key and different limits per provider, an aggregator combines them behind a single endpoint.

### [FreeLLMAPI](https://github.com/tashfeenahmed/freellmapi) — by [tashfeenahmed](https://github.com/tashfeenahmed)

A self-hosted (Docker) router that aggregates LLM providers with a free tier behind a single OpenAI-compatible endpoint (`/v1`). It stores keys encrypted, picks the best available model, falls through to the next provider when one rate-limits you, and tracks usage per key.

- **Project:** 🔎 MIT, 27,287 stars and changes on 2026-09-17 (GitHub data from 2026-09-19).
- **Scope:** 📎 its README speaks of 34 providers and 635 free model endpoints; its platform documentation also lists several already retired (hence the section above).
- **Cost:** free and open source. It has a paid option at [freellmapi.co](https://freellmapi.co) (📎 $19 per year or $49 once) that offers an up-to-date model catalog instead of the free catalog with about a 30-day delay.
- **Requires:** your own keys from each provider; the project does not provide them, it only orchestrates them.
- **The project's own warning:** *"This project is for personal experimentation and learning, not production"*; free tiers exist to prototype and are not a stable service.
- **Real use:** it has been running since September 2026 as the LLM backend of this list maintainer's personal homelab.

```yaml
# minimal docker-compose.yml
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

## Local models

No provider limits: they depend on your hardware (RAM and GPU).

### [Ollama](https://ollama.com)

Installation: [official downloads](https://ollama.com/download). There is also the official script (`curl -fsSL https://ollama.com/install.sh | sh`); read it before running it, like any downloaded script.

Popular models, 🔎 checked to exist in Ollama's library on 2026-09-19 (quality in Spanish varies; try them with your use case):

```bash
ollama pull llama3.2
ollama pull gemma3
ollama pull qwen3
ollama pull mistral:7b-instruct-v0.2-q4_K_M
```

### [LM Studio](https://lmstudio.ai/)

A free graphical interface to download models and use them through a local OpenAI-compatible API.

### [LocalAI](https://localai.io/)

A self-hosted alternative to the OpenAI API, with several backends.

---

## Comparison

| Provider | What it gives for free | Verification (2026-09-19) |
|---|---|---|
| OpenRouter | 22 text models with `:free` | 🔎 models · ⚠️ limits |
| Google AI Studio | Free tier per project | ✅ quota mechanics · ⚠️ figures |
| NVIDIA NIM | Free tier with phone verification | ⚠️ not verifiable |
| Mistral | *Experiment* plan | ⚠️ not verifiable |
| Hugging Face | $0.10 per month | ✅ |
| Groq | `gpt-oss-120b` and `gpt-oss-20b`: 30 RPM, 1,000 RPD | ✅ |
| Cohere | 1,000 calls per month (trial key) | ✅ |
| GitHub Models | Depends on your Copilot plan | ⚠️ no figures |
| Cloudflare | 10,000 neurons per day | ✅ |
| FreeLLMAPI | Depends on the keys you give it | 🔎 existence and license |
| Ollama | Local, no provider limits | 🔎 models |

---

## Code examples

The models in these examples are checked automatically by [`scripts/verificar.py`](scripts/verificar.py).

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

### Bash — local Ollama

```bash
ollama pull llama3.2
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Explica qué es una API",
  "stream": false
}'
```

---

## How we verify

- **Automatic** ([`scripts/verificar.py`](scripts/verificar.py), weekly and on every change): it checks that the OpenRouter `:free` models the README cites exist today, that the `ollama pull` tags exist in Ollama's official registry, and that the Groq models in the examples are not in its deprecation history. If something breaks, CI fails.
- **Manual:** each provider's numeric limits are checked against its official documentation when the page allows it. When it does not (automated-client blocking, JavaScript content or a missing page), the fact is flagged ⚠️ instead of being taken as good.
- **Record of the last review**, with each source and its result: [docs/verificaciones.md](docs/verificaciones.md).

If you find an outdated fact, open an issue with the source.

---

## Additional resources

### Related lists

- [open-free-llm-api/awesome-freellm-apis](https://github.com/open-free-llm-api/awesome-freellm-apis) — an English list with more than 40 providers; active, MIT-licensed.

### In Spanish

- [Hugging Face — courses](https://huggingface.co/learn)
- [Ollama model library](https://ollama.com/library)
- [4Geeks Academy — AI courses](https://4geeksacademy.com/)

---

## How to contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for the format and rules. Every new figure must carry its source and the date it was checked.

## Credits

- **This list builds on the work of [FreeLLMAPI](https://github.com/tashfeenahmed/freellmapi) by [tashfeenahmed](https://github.com/tashfeenahmed)** (MIT): the providers that dropped their free tier, the no-sign-up services and their conditions, and the aggregator section come from that project's public documentation, cited in each case. It is not this repository's work: here it is only documented and linked to its original source. Thank you.
- **The keyless API catalog builds on [public-apis/public-apis](https://github.com/public-apis/public-apis)** (MIT): its entries helped discover candidates; each API was verified independently and its descriptions and terms are our own. The credits of each project, with its license, are in the catalog's credits table and in each entry's `creditos` field. Thank you.
- This list was inspired by `free-llm-api-resources`, by cheahjs; that repository is no longer available on GitHub, so it is not linked.
- Maintained by [Carlos Avila](https://github.com/AvilaCarlosDev). Developed with the support of Claude (Anthropic) as a review and source-verification assistant; the selection and the final review are the author's.

## License

MIT — see [LICENSE](LICENSE).
