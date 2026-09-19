"""Pruebas de scripts/generar_readme.py: las tablas de los README salen de data/apis.json."""
import copy
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import generar_readme as gen  # noqa: E402


def api(**cambios):
    e = {
        "id": "open-meteo-pronostico", "nombre": "Open-Meteo — pronóstico", "categoria": "clima-geolocalizacion",
        "descripcion": "Pronóstico del tiempo por coordenadas.", "descripcion_en": "Weather forecast by coordinates.",
        "ambito": ["global"], "documentacion": "https://open-meteo.com/en/docs", "autenticacion": "ninguna",
        "ejemplo": {"url": "https://api.open-meteo.com/v1/forecast", "espera": {"tipo": "objeto", "claves": ["current"]}},
        "terminos": {"fuente": "https://open-meteo.com/en/terms", "uso_comercial": "no", "atribucion": "obligatoria",
                     "limites": "Menos de 10.000 llamadas al día.", "limites_en": "Fewer than 10,000 calls per day.", "licencia": "CC-BY-4.0"},
        "creditos": [{"fuente": "public-apis/public-apis", "url": "https://github.com/public-apis/public-apis", "licencia": "MIT"}],
        "verificacion": {"fecha": "2026-09-19", "estado": "ok", "cors": "abierto", "ms": 438, "metodo": "llamada"},
    }
    e.update(cambios)
    return e


def cat(*entradas):
    return {"version": 1, "entradas": list(entradas)}


class Tablas(unittest.TestCase):
    def test_una_seccion_por_categoria_con_entradas_y_en_orden_fijo(self):
        c = cat(api(), api(id="frankfurter", nombre="Frankfurter", categoria="divisas-economia"))
        md = gen.generar(c, "es")
        self.assertLess(md.index("Divisas y economía"), md.index("Clima y geolocalización"))
        self.assertNotIn("Tienda demo", md)

    def test_el_espanol_usa_la_descripcion_en_espanol_y_el_ingles_la_inglesa(self):
        c = cat(api())
        self.assertIn("Pronóstico del tiempo por coordenadas.", gen.generar(c, "es"))
        self.assertIn("Weather forecast by coordinates.", gen.generar(c, "en"))
        self.assertNotIn("Pronóstico", gen.generar(c, "en"))

    def test_los_titulos_de_categoria_estan_traducidos(self):
        c = cat(api())
        self.assertIn("Clima y geolocalización", gen.generar(c, "es"))
        self.assertIn("Weather and geolocation", gen.generar(c, "en"))

    def test_terminos_y_limites_se_muestran_en_cada_idioma(self):
        c = cat(api())
        es, en = gen.generar(c, "es"), gen.generar(c, "en")
        self.assertIn("Menos de 10.000 llamadas al día.", es)
        self.assertIn("Fewer than 10,000 calls per day.", en)
        self.assertIn("No", es.split("Open-Meteo")[1])
        self.assertIn("Required", en)

    def test_cors_y_verificacion_visibles(self):
        md = gen.generar(cat(api()), "es")
        self.assertIn("Abierto", md)
        self.assertIn("2026-09-19", md)
        self.assertIn("438 ms", md)

    def test_una_entrada_con_error_de_verificacion_lo_muestra(self):
        e = api(verificacion={"fecha": "2026-09-19", "estado": "error", "cors": "desconocido", "ms": 10, "metodo": "llamada", "motivo": "HTTP 503"})
        self.assertIn("HTTP 503", gen.generar(cat(e), "es"))

    def test_una_entrada_sin_verificar_se_marca(self):
        e = api()
        del e["verificacion"]
        self.assertIn("sin verificar", gen.generar(cat(e), "es"))

    def test_las_barras_verticales_no_rompen_la_tabla(self):
        e = api(descripcion="Datos A | B del servicio de pruebas.", descripcion_en="Data A | B of the test service.")
        fila = [l for l in gen.generar(cat(e), "es").splitlines() if "Open-Meteo" in l][0]
        self.assertIn("A \\| B", fila)

    def test_las_notas_aparecen_junto_a_los_limites(self):
        e = api(notas="Una nota importante.", notas_en="An important note.")
        self.assertIn("Una nota importante.", gen.generar(cat(e), "es"))
        self.assertIn("An important note.", gen.generar(cat(e), "en"))


class Creditos(unittest.TestCase):
    def test_los_creditos_se_agrupan_por_fuente_con_licencia_y_entradas(self):
        c = cat(api(), api(id="frankfurter", nombre="Frankfurter", categoria="divisas-economia"))
        md = gen.creditos(c, "es")
        self.assertEqual(sum("[public-apis/public-apis]" in linea for linea in md.splitlines()), 1)
        self.assertIn("MIT", md)
        self.assertIn("Open-Meteo — pronóstico", md)
        self.assertIn("Frankfurter", md)

    def test_creditos_ordenados_por_nombre_de_fuente(self):
        a = api(creditos=[{"fuente": "zeta/proyecto", "url": "https://github.com/zeta/proyecto"}])
        b = api(id="otra", nombre="Otra", creditos=[{"fuente": "alfa/proyecto", "url": "https://github.com/alfa/proyecto", "licencia": "MIT"}])
        md = gen.creditos(cat(a, b), "es")
        self.assertLess(md.index("alfa/proyecto"), md.index("zeta/proyecto"))


class Marcadores(unittest.TestCase):
    TEXTO = "antes\n<!-- catalogo:inicio -->\nviejo\n<!-- catalogo:fin -->\ndespués\n"

    def test_reemplaza_solo_lo_que_hay_entre_marcadores(self):
        r = gen.reemplazar(self.TEXTO, "nuevo")
        self.assertIn("antes\n<!-- catalogo:inicio -->\nnuevo\n<!-- catalogo:fin -->\ndespués", r)
        self.assertNotIn("viejo", r)

    def test_es_idempotente(self):
        una = gen.reemplazar(self.TEXTO, "nuevo")
        self.assertEqual(gen.reemplazar(una, "nuevo"), una)

    def test_sin_marcadores_es_un_error_explicito(self):
        with self.assertRaises(gen.MarcadoresAusentes):
            gen.reemplazar("un texto sin marcadores", "nuevo")

    def test_marcadores_en_orden_incorrecto_es_un_error(self):
        with self.assertRaises(gen.MarcadoresAusentes):
            gen.reemplazar("<!-- catalogo:fin -->\nx\n<!-- catalogo:inicio -->", "nuevo")

    def test_comprobar_detecta_un_readme_desactualizado(self):
        actual = gen.reemplazar(self.TEXTO, "nuevo")
        self.assertTrue(gen.esta_al_dia(actual, "nuevo"))
        self.assertFalse(gen.esta_al_dia(self.TEXTO, "nuevo"))


if __name__ == "__main__":
    unittest.main()
