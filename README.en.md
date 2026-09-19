# Free LLM APIs (Spanish-speaking community)

**English** · [Español](README.md)

**A list of LLM APIs with a free tier, for the Spanish-speaking community. Every fact says how and when it was checked; whatever could not be checked is flagged.**

[![CI](https://github.com/AvilaCarlosDev/free-apis-ia-espanol/actions/workflows/quality.yml/badge.svg)](https://github.com/AvilaCarlosDev/free-apis-ia-espanol/actions/workflows/quality.yml)
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
- This list was inspired by `free-llm-api-resources`, by cheahjs; that repository is no longer available on GitHub, so it is not linked.
- Maintained by [Carlos Avila](https://github.com/AvilaCarlosDev). Developed with the support of Claude (Anthropic) as a review and source-verification assistant; the selection and the final review are the author's.

## License

MIT — see [LICENSE](LICENSE).
