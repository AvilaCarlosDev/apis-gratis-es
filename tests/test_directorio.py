"""Pruebas de scripts/directorio.py: el directorio ampliado se importa y se genera sin mezclarse con el catálogo."""
import json
import re
import sys
import unittest
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "scripts"))
import directorio as d  # noqa: E402

LISTA = """
### APIs Covered Under APILayer Suite!
| [Anuncio](https://anuncio.example/api) | Sponsored | `apiKey` | Yes | Unknown |

### Animals
API | Description | Auth | HTTPS | CORS
|:---|:---|:---|:---|:---|
| [Zeta](https://zeta.example/docs) | Last by name | No | Yes | Yes |
| [Alfa](https://alfa.example/docs/) | Pipes \\| inside | `apiKey` | Yes | Unknown |
| [Sin HTTPS](http://inseguro.example) | Plain http link | No | No | No |
| [Declarada sin HTTPS](https://declarada.example) | Source says no HTTPS | No | No | No |
| [Repetida](https://www.alfa.example/docs) | Same URL as Alfa | No | Yes | Yes |
| [Ya verificada](https://verificada.example/docs) | Already in the catalog | No | Yes | Yes |
| [Campaña](https://promo.example/?utm_source=Github) | Sponsor campaign link | `apiKey` | Yes | Unknown |

### Categoria Desconocida
| [Fuera](https://fuera.example) | Unknown section | No | Yes | Yes |

### Weather
| [Clima](https://clima.example) | Forecasts | `OAuth` | Yes | No |
"""


class Analizar(unittest.TestCase):
    def setUp(self):
        self.entradas = d.analizar(LISTA, ["https://verificada.example/docs"])

    def test_solo_importa_filas_validas_y_ordenadas(self):
        self.assertEqual([e["nombre"] for e in self.entradas], ["Alfa", "Zeta", "Clima"])

    def test_traduce_autenticacion_y_cors(self):
        alfa, zeta, clima = self.entradas
        self.assertEqual((alfa["autenticacion"], alfa["cors"]), ("clave", "desconocido"))
        self.assertEqual((zeta["autenticacion"], zeta["cors"]), ("ninguna", "si"))
        self.assertEqual((clima["autenticacion"], clima["cors"]), ("oauth", "no"))


class Generar(unittest.TestCase):
    def setUp(self):
        self.datos = {
            "version": 1,
            "fuentes": [dict(d.FUENTE, commit="a" * 40, fecha="2026-10-04")],
            "entradas": d.analizar(LISTA, ["https://verificada.example/docs"]),
        }

    def test_avisa_que_no_estan_verificadas_y_da_credito(self):
        for idioma, aviso in (("es", "NO fueron verificadas"), ("en", "NOT verified")):
            texto = d.generar(self.datos, idioma)
            self.assertIn(aviso, texto)
            self.assertIn("https://github.com/public-apis/public-apis", texto)
            self.assertIn("MIT", texto)

    def test_categorias_en_cada_idioma_y_celdas_escapadas(self):
        es, en = d.generar(self.datos, "es"), d.generar(self.datos, "en")
        self.assertIn("### Animales", es)
        self.assertIn("- [Clima](#clima) (1)", es)
        self.assertIn("### Animals", en)
        self.assertIn("Pipes \\| inside", es)

    def test_todas_las_categorias_del_indice_tienen_ancla(self):
        texto = d.generar(self.datos, "es")
        titulos = {d._ancla(t) for t in re.findall(r"^### (.+)$", texto, re.M)}
        self.assertEqual(set(re.findall(r"\]\(#([^)]+)\)", texto)), titulos)


class Repositorio(unittest.TestCase):
    def setUp(self):
        self.datos = json.loads(d.DATOS.read_text(encoding="utf-8"))

    def test_paginas_al_dia(self):
        for idioma, salida in d.SALIDAS.items():
            self.assertEqual(salida.read_text(encoding="utf-8"), d.generar(self.datos, idioma), salida.name)

    def test_entradas_bien_formadas_y_sin_duplicados(self):
        entradas = self.datos["entradas"]
        claves = [d._clave_url(e["url"]) for e in entradas]
        self.assertEqual(len(claves), len(set(claves)))
        for e in entradas:
            self.assertTrue(e["url"].startswith("https://"), e["url"])
            self.assertIn(e["categoria"], d.CATEGORIAS)
            self.assertFalse(d._es_promocion(e["url"]), e["url"])

    def test_no_repite_el_catalogo_verificado(self):
        catalogo = json.loads(d.CATALOGO.read_text(encoding="utf-8"))["entradas"]
        verificadas = {d._clave_url(e["documentacion"]) for e in catalogo}
        self.assertFalse(verificadas & {d._clave_url(e["url"]) for e in self.datos["entradas"]})

    def test_los_readme_citan_el_numero_real(self):
        n = str(len(self.datos["entradas"]))
        for nombre in ("README.md", "README.en.md"):
            self.assertIn(f"**{n} ", (RAIZ / nombre).read_text(encoding="utf-8"), nombre)


if __name__ == "__main__":
    unittest.main()
