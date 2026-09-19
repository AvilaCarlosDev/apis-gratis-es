"""Pruebas de scripts/verificar.py: las afirmaciones comprobables del README se contrastan con fuentes reales."""
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import verificar  # noqa: E402

README = """
curl https://openrouter.ai/api/v1/chat/completions -d '{"model": "google/gemma-4-31b-it:free"}'
Otro modelo: `nvidia/nemotron-3-super-120b-a12b:free` y meta-llama/llama-3.3-70b-instruct:free.

```bash
ollama pull llama3.2
ollama pull mistral:7b-instruct-v0.2-q4_K_M
```

```javascript
import Groq from 'groq-sdk';
const r = await groq.chat.completions.create({ model: 'openai/gpt-oss-20b', messages: [] });
```
"""

API_OPENROUTER = json.dumps({"data": [
    {"id": "google/gemma-4-31b-it:free"},
    {"id": "nvidia/nemotron-3-super-120b-a12b:free"},
    {"id": "openai/gpt-5"},
]})

DEPRECACIONES_GROQ = (
    "Deprecation History August 16, 2026: llama-3.1-8b-instant and llama-3.3-70b-versatile In line with our commitment "
    "July 17, 2026: qwen/qwen3-32b and meta-llama/llama-4-scout-17b-16e-instruct In line with our commitment "
    "March 5, 2026: meta-llama/llama-guard-4-12b Effective immediately"
)


def fetch_falso(respuestas):
    """Devuelve una función fetch que responde según la URL (o 404 si no está definida)."""
    def fetch(url):
        for parte, valor in respuestas.items():
            if parte in url:
                return valor
        return 404, ""
    return fetch


class Extraccion(unittest.TestCase):
    def test_modelos_openrouter_gratuitos_en_texto_y_codigo(self):
        self.assertEqual(
            verificar.extraer_modelos_openrouter(README),
            {"google/gemma-4-31b-it:free", "nvidia/nemotron-3-super-120b-a12b:free", "meta-llama/llama-3.3-70b-instruct:free"},
        )

    def test_no_confunde_modelos_de_pago_ni_urls(self):
        texto = "usa openai/gpt-5 o https://ejemplo.com/a:free-no y mistralai/mistral-small"
        self.assertEqual(verificar.extraer_modelos_openrouter(texto), set())

    def test_tags_de_ollama_con_y_sin_version(self):
        self.assertEqual(verificar.extraer_tags_ollama(README), {"llama3.2", "mistral:7b-instruct-v0.2-q4_K_M"})

    def test_ollama_run_tambien_cuenta(self):
        self.assertEqual(verificar.extraer_tags_ollama("ollama run gemma3:4b"), {"gemma3:4b"})

    def test_solo_los_bloques_de_groq_aportan_modelos_de_groq(self):
        self.assertEqual(verificar.extraer_modelos_groq(README), {"openai/gpt-oss-20b"})

    def test_un_bloque_sin_groq_no_aporta_nada(self):
        self.assertEqual(verificar.extraer_modelos_groq("```js\nconst x = { model: 'gpt-4o' };\n```"), set())


class Fuentes(unittest.TestCase):
    def test_modelos_gratuitos_de_openrouter_desde_su_api(self):
        self.assertEqual(
            verificar.modelos_gratuitos_openrouter(API_OPENROUTER),
            {"google/gemma-4-31b-it:free", "nvidia/nemotron-3-super-120b-a12b:free"},
        )

    def test_respuesta_de_openrouter_ilegible_es_un_error_de_lectura(self):
        with self.assertRaises(verificar.FuenteNoDisponible):
            verificar.modelos_gratuitos_openrouter("<html>no es json</html>")

    def test_modelos_retirados_de_groq(self):
        self.assertEqual(
            verificar.modelos_retirados_groq(DEPRECACIONES_GROQ),
            {"llama-3.1-8b-instant", "llama-3.3-70b-versatile", "qwen/qwen3-32b",
             "meta-llama/llama-4-scout-17b-16e-instruct", "meta-llama/llama-guard-4-12b"},
        )

    def test_las_recomendaciones_de_migracion_no_cuentan_como_modelos_retirados(self):
        # Formato antiguo de la página: nombre comercial y luego prosa larga que recomienda un reemplazo.
        pagina = (
            "Deprecation History August 16, 2026: llama-3.1-8b-instant and llama-3.3-70b-versatile In line with our commitment "
            "we recommend migrating to openai/gpt-oss-20b or openai/gpt-oss-120b. "
            "March 17, 2025: DeepSeek R1 Distill Llama 70B (Speculative Decoding) On March 17, 2025, we emailed all users "
            "and recommend migrating to openai/gpt-oss-20b."
        )
        retirados = verificar.modelos_retirados_groq(pagina)
        self.assertEqual(retirados, {"llama-3.1-8b-instant", "llama-3.3-70b-versatile"})

    def test_una_lista_con_comas_y_and_devuelve_todos_los_modelos(self):
        pagina = "Deprecation History May 1, 2026: modelo-a-1, modelo-b-2 and modelo-c-3 In line with our commitment"
        self.assertEqual(verificar.modelos_retirados_groq(pagina), {"modelo-a-1", "modelo-b-2", "modelo-c-3"})

    def test_una_entrada_solo_con_nombre_comercial_no_aporta_ids(self):
        pagina = "Deprecation History July 30, 2025: Mistral Saba 24B In line with our commitment"
        with self.assertRaises(verificar.FuenteNoDisponible):
            verificar.modelos_retirados_groq(pagina)

    def test_lee_la_pagina_real_en_html_con_etiquetas_y_entidades(self):
        pagina = (
            "<html><script>var x = 'August 16, 2026: falso-1';</script><body><h3>Deprecation History</h3>"
            "<h4>August 16, 2026: <code>llama-3.1-8b-instant</code> and <code>llama-3.3-70b-versatile</code></h4>"
            "<p>In line with our commitment, Meta&#x27;s models. Migrate to <code>openai/gpt-oss-20b</code>.</p>"
            "<h4>July 17, 2026: <code>qwen/qwen3-32b</code></h4><p>We recommend openai/gpt-oss-120b.</p></body></html>"
        )
        self.assertEqual(
            verificar.modelos_retirados_groq(pagina),
            {"llama-3.1-8b-instant", "llama-3.3-70b-versatile", "qwen/qwen3-32b"},
        )

    def test_pagina_de_groq_sin_historial_es_fuente_no_disponible(self):
        with self.assertRaises(verificar.FuenteNoDisponible):
            verificar.modelos_retirados_groq("página cualquiera sin historial")


class Verificacion(unittest.TestCase):
    def setUp(self):
        self.fetch = fetch_falso({
            "openrouter.ai/api/v1/models": (200, API_OPENROUTER),
            "console.groq.com/docs/deprecations": (200, DEPRECACIONES_GROQ),
            "registry.ollama.ai/v2/library/llama3.2/manifests/latest": (200, "{}"),
            "registry.ollama.ai/v2/library/mistral/manifests/7b-instruct-v0.2-q4_K_M": (200, "{}"),
        })

    def niveles(self, hallazgos):
        return [h.nivel for h in hallazgos]

    def test_un_modelo_gratuito_que_ya_no_existe_es_un_error_y_se_nombra(self):
        hallazgos = verificar.verificar(README, self.fetch)
        errores = [h for h in hallazgos if h.nivel == "error"]
        self.assertEqual(len(errores), 1)
        self.assertIn("meta-llama/llama-3.3-70b-instruct:free", errores[0].mensaje)

    def test_todo_correcto_no_produce_errores(self):
        texto = README.replace("y meta-llama/llama-3.3-70b-instruct:free", "")
        self.assertNotIn("error", self.niveles(verificar.verificar(texto, self.fetch)))

    def test_un_tag_de_ollama_inexistente_es_un_error(self):
        texto = README + "\n```bash\nollama pull llama2-es\n```\n"
        errores = [h for h in verificar.verificar(texto, self.fetch) if h.nivel == "error"]
        self.assertTrue(any("llama2-es" in h.mensaje for h in errores))

    def test_un_modelo_de_groq_retirado_es_un_error(self):
        texto = README.replace("openai/gpt-oss-20b", "llama-3.3-70b-versatile")
        errores = [h for h in verificar.verificar(texto, self.fetch) if h.nivel == "error"]
        self.assertTrue(any("llama-3.3-70b-versatile" in h.mensaje for h in errores))

    def test_si_una_fuente_no_responde_es_un_aviso_no_un_error(self):
        fetch = fetch_falso({"openrouter.ai/api/v1/models": (503, ""),
                             "console.groq.com/docs/deprecations": (200, DEPRECACIONES_GROQ)})
        hallazgos = verificar.verificar(README, fetch)
        self.assertIn("aviso", self.niveles(hallazgos))
        self.assertFalse(any(h.nivel == "error" and "openrouter" in h.mensaje.lower() for h in hallazgos))

    def test_un_readme_sin_nada_verificable_avisa_en_vez_de_aprobar_en_silencio(self):
        hallazgos = verificar.verificar("Solo texto.", self.fetch)
        self.assertEqual(self.niveles(hallazgos), ["aviso"])
        self.assertIn("nada que verificar", hallazgos[0].mensaje)

    def test_codigo_de_salida(self):
        self.assertEqual(verificar.codigo_de_salida([verificar.Hallazgo("ok", "x")]), 0)
        self.assertEqual(verificar.codigo_de_salida([verificar.Hallazgo("aviso", "x")]), 0)
        self.assertEqual(verificar.codigo_de_salida([verificar.Hallazgo("error", "x")]), 1)


if __name__ == "__main__":
    unittest.main()
