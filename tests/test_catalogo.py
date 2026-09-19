"""Pruebas de scripts/catalogo.py: esquema, validación y verificación real del catálogo."""
import copy
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import catalogo  # noqa: E402

BASE = {
    "id": "open-meteo-pronostico",
    "nombre": "Open-Meteo — pronóstico",
    "categoria": "clima-geolocalizacion",
    "descripcion": "Pronóstico del tiempo y datos meteorológicos por coordenadas.",
    "descripcion_en": "Weather forecast and meteorological data by coordinates.",
    "ambito": ["global"],
    "documentacion": "https://open-meteo.com/en/docs",
    "autenticacion": "ninguna",
    "ejemplo": {
        "url": "https://api.open-meteo.com/v1/forecast?latitude=10.49&longitude=-66.88&current=temperature_2m",
        "espera": {"tipo": "objeto", "claves": ["current", "latitude"]},
    },
    "terminos": {
        "fuente": "https://open-meteo.com/en/terms",
        "uso_comercial": "no",
        "atribucion": "obligatoria",
        "limites": "Menos de 10.000 llamadas al día en el nivel gratuito.",
        "limites_en": "Fewer than 10,000 calls per day on the free tier.",
        "licencia": "CC-BY-4.0",
    },
    "creditos": [{"fuente": "public-apis/public-apis", "url": "https://github.com/public-apis/public-apis", "licencia": "MIT"}],
}


def entrada(**cambios):
    e = copy.deepcopy(BASE)
    for clave, valor in cambios.items():
        e[clave] = valor
    return e


def catalogo_de(*entradas):
    return {"version": 1, "entradas": list(entradas)}


def falso(status=200, cuerpo=None, cabeceras=None, ms=120):
    """Devuelve una función fetch que responde siempre lo mismo."""
    datos = json.dumps(cuerpo).encode() if not isinstance(cuerpo, bytes) else cuerpo

    def fetch(url, cabeceras_pedido):
        return status, datos, cabeceras or {}, ms

    return fetch


OK = {"current": {"temperature_2m": 25.0}, "latitude": 10.5}


class Validacion(unittest.TestCase):
    def errores(self, *entradas):
        return catalogo.validar(catalogo_de(*entradas))

    def test_una_entrada_correcta_no_da_errores(self):
        self.assertEqual(self.errores(entrada()), [])

    def test_un_campo_obligatorio_ausente_se_nombra(self):
        e = entrada()
        del e["descripcion"]
        self.assertTrue(any("descripcion" in m and "open-meteo-pronostico" in m for m in self.errores(e)))

    def test_categoria_desconocida(self):
        self.assertTrue(any("categoria" in m for m in self.errores(entrada(categoria="inventada"))))

    def test_autenticacion_desconocida(self):
        self.assertTrue(any("autenticacion" in m for m in self.errores(entrada(autenticacion="quizas"))))

    def test_los_ids_deben_ser_unicos(self):
        self.assertTrue(any("duplicado" in m for m in self.errores(entrada(), entrada())))

    def test_id_con_formato_invalido(self):
        self.assertTrue(any("id" in m for m in self.errores(entrada(id="Con Espacios"))))

    def test_las_urls_deben_ser_https(self):
        e = entrada(documentacion="http://open-meteo.com/en/docs")
        self.assertTrue(any("https" in m for m in self.errores(e)))

    def test_el_ejemplo_no_puede_llevar_claves_en_la_url(self):
        e = entrada()
        e["ejemplo"]["url"] = "https://api.ejemplo.com/v1/datos?apikey=SECRETO123"
        self.assertTrue(any("clave" in m.lower() for m in self.errores(e)))

    def test_la_descripcion_en_ingles_es_obligatoria(self):
        e = entrada()
        del e["descripcion_en"]
        self.assertTrue(any("descripcion_en" in m for m in self.errores(e)))

    def test_si_hay_limites_tambien_se_exige_su_version_en_ingles(self):
        e = entrada()
        del e["terminos"]["limites_en"]
        self.assertTrue(any("limites_en" in m for m in self.errores(e)))

    def test_si_hay_notas_tambien_se_exige_su_version_en_ingles(self):
        e = entrada(notas="Una nota en español.")
        self.assertTrue(any("notas_en" in m for m in self.errores(e)))
        e["notas_en"] = "A note in English."
        self.assertEqual(self.errores(e), [])

    def test_ambito_debe_ser_una_lista_no_vacia(self):
        self.assertTrue(any("ambito" in m for m in self.errores(entrada(ambito=[]))))

    def test_terminos_con_valor_fuera_del_catalogo(self):
        e = entrada()
        e["terminos"]["uso_comercial"] = "tal vez"
        self.assertTrue(any("uso_comercial" in m for m in self.errores(e)))

    def test_espera_con_tipo_invalido(self):
        e = entrada()
        e["ejemplo"]["espera"]["tipo"] = "cadena"
        self.assertTrue(any("espera" in m for m in self.errores(e)))

    def test_verificacion_con_fecha_invalida(self):
        e = entrada(verificacion={"fecha": "ayer", "estado": "ok", "cors": "abierto", "ms": 100})
        self.assertTrue(any("fecha" in m for m in self.errores(e)))

    def test_verificacion_correcta(self):
        e = entrada(verificacion={"fecha": "2026-09-19", "estado": "ok", "cors": "abierto", "ms": 100})
        self.assertEqual(self.errores(e), [])

    def test_cors_desconocido_es_un_valor_valido(self):
        e = entrada(verificacion={"fecha": "2026-09-19", "estado": "ok", "cors": "desconocido", "ms": 100})
        self.assertEqual(self.errores(e), [])

    def test_los_creditos_deben_tener_fuente_y_url_https(self):
        e = entrada(creditos=[{"fuente": "alguien", "url": "http://inseguro.example"}])
        self.assertTrue(any("creditos" in m for m in self.errores(e)))

    def test_catalogo_sin_entradas_es_un_error(self):
        self.assertTrue(catalogo.validar({"version": 1, "entradas": []}))

    def test_se_informan_todos_los_errores_a_la_vez(self):
        e = entrada(categoria="x", autenticacion="y")
        del e["nombre"]
        self.assertGreaterEqual(len(self.errores(e)), 3)


class Verificacion(unittest.TestCase):
    def test_una_respuesta_correcta_es_ok(self):
        r = catalogo.verificar_entrada(entrada(), falso(200, OK, {"Access-Control-Allow-Origin": "*"}))
        self.assertEqual((r.estado, r.cors, r.ms), ("ok", "abierto", 120))

    def test_un_estado_distinto_de_200_es_error(self):
        r = catalogo.verificar_entrada(entrada(), falso(503, {"x": 1}))
        self.assertEqual(r.estado, "error")
        self.assertIn("503", r.motivo)

    def test_una_respuesta_200_que_no_es_json_es_error(self):
        r = catalogo.verificar_entrada(entrada(), falso(200, b"<html>hola</html>"))
        self.assertEqual(r.estado, "error")
        self.assertIn("JSON", r.motivo)

    def test_un_200_con_error_dentro_del_cuerpo_se_detecta(self):
        # Caso real: REST Countries v3.1 respondió 200 con "This API version has been deprecated".
        cuerpo = {"success": False, "data": None, "errors": [{"message": "This API version has been deprecated."}]}
        r = catalogo.verificar_entrada(entrada(), falso(200, cuerpo))
        self.assertEqual(r.estado, "error")
        self.assertIn("deprecated", r.motivo)

    def test_faltan_las_claves_esperadas(self):
        r = catalogo.verificar_entrada(entrada(), falso(200, {"current": {}}))
        self.assertEqual(r.estado, "error")
        self.assertIn("latitude", r.motivo)

    def test_tipo_lista_revisa_las_claves_del_primer_elemento(self):
        e = entrada()
        e["ejemplo"]["espera"] = {"tipo": "lista", "claves": ["moneda", "promedio"]}
        self.assertEqual(catalogo.verificar_entrada(e, falso(200, [{"moneda": "USD", "promedio": 850.5}])).estado, "ok")
        self.assertEqual(catalogo.verificar_entrada(e, falso(200, [{"moneda": "USD"}])).estado, "error")

    def test_una_lista_vacia_es_error_si_se_esperaban_claves(self):
        e = entrada()
        e["ejemplo"]["espera"] = {"tipo": "lista", "claves": ["moneda"]}
        self.assertEqual(catalogo.verificar_entrada(e, falso(200, [])).estado, "error")

    def test_tipo_incorrecto_lista_en_vez_de_objeto(self):
        self.assertEqual(catalogo.verificar_entrada(entrada(), falso(200, [1, 2])).estado, "error")

    def test_la_peticion_principal_no_lleva_origin_y_el_cors_se_mide_aparte_con_origin(self):
        pedidos = []

        def fetch(url, cabeceras):
            pedidos.append(cabeceras)
            reflejo = {"access-control-allow-origin": cabeceras["Origin"]} if "Origin" in cabeceras else {}
            return 200, json.dumps(OK).encode(), reflejo, 50

        r = catalogo.verificar_entrada(entrada(), fetch)
        self.assertEqual(len(pedidos), 2)
        self.assertNotIn("Origin", pedidos[0])
        self.assertIn("Origin", pedidos[1])
        self.assertEqual(r.cors, "abierto")

    def test_si_la_prueba_de_cors_falla_la_entrada_sigue_siendo_ok(self):
        # Caso real: Nager.Date responde 400 cuando se combina un User-Agent propio con Origin.
        def fetch(url, cabeceras):
            if "Origin" in cabeceras:
                return 400, b"", {}, 30
            return 200, json.dumps(OK).encode(), {}, 30

        r = catalogo.verificar_entrada(entrada(), fetch)
        self.assertEqual((r.estado, r.cors), ("ok", "desconocido"))

    def test_si_la_prueba_de_cors_lanza_una_excepcion_no_rompe_la_verificacion(self):
        def fetch(url, cabeceras):
            if "Origin" in cabeceras:
                raise OSError("reset")
            return 200, json.dumps(OK).encode(), {}, 30

        self.assertEqual(catalogo.verificar_entrada(entrada(), fetch).cors, "desconocido")

    def test_una_entrada_con_error_no_gasta_una_segunda_peticion(self):
        pedidos = []

        def fetch(url, cabeceras):
            pedidos.append(cabeceras)
            return 500, b"", {}, 10

        r = catalogo.verificar_entrada(entrada(), fetch)
        self.assertEqual((len(pedidos), r.cors), (1, "desconocido"))

    def test_sin_cabecera_de_cors_es_cerrado(self):
        self.assertEqual(catalogo.verificar_entrada(entrada(), falso(200, OK, {})).cors, "cerrado")

    def test_cors_para_un_origen_concreto_es_restringido(self):
        r = catalogo.verificar_entrada(entrada(), falso(200, OK, {"Access-Control-Allow-Origin": "https://otro.example"}))
        self.assertEqual(r.cors, "restringido")

    def test_un_fallo_de_conexion_es_error_no_excepcion(self):
        def fetch(url, cabeceras):
            raise OSError("sin red")

        r = catalogo.verificar_entrada(entrada(), fetch)
        self.assertEqual(r.estado, "error")
        self.assertIn("sin red", r.motivo)

    def test_la_verificacion_envia_un_user_agent_que_identifica_al_proyecto(self):
        vistos = []

        def fetch(url, cabeceras):
            vistos.append(cabeceras)
            return 200, json.dumps(OK).encode(), {}, 10

        catalogo.verificar_entrada(entrada(), fetch)
        self.assertIn("apis-gratis-es", vistos[0]["User-Agent"])


class Actualizacion(unittest.TestCase):
    def test_actualizar_escribe_el_bloque_de_verificacion(self):
        cat = catalogo_de(entrada())
        resultados = [catalogo.Resultado("open-meteo-pronostico", "ok", "", "abierto", 88)]
        catalogo.actualizar(cat, resultados, "2026-09-19")
        self.assertEqual(cat["entradas"][0]["verificacion"],
                         {"fecha": "2026-09-19", "estado": "ok", "cors": "abierto", "ms": 88, "metodo": "llamada"})

    def test_un_error_conserva_el_motivo(self):
        cat = catalogo_de(entrada())
        catalogo.actualizar(cat, [catalogo.Resultado("open-meteo-pronostico", "error", "HTTP 503", "cerrado", 40)], "2026-09-19")
        self.assertEqual(cat["entradas"][0]["verificacion"]["motivo"], "HTTP 503")

    def test_actualizar_ignora_ids_que_no_existen(self):
        cat = catalogo_de(entrada())
        catalogo.actualizar(cat, [catalogo.Resultado("no-existe", "ok", "", "abierto", 1)], "2026-09-19")
        self.assertNotIn("verificacion", cat["entradas"][0])

    def test_una_entrada_actualizada_sigue_siendo_valida(self):
        cat = catalogo_de(entrada())
        catalogo.actualizar(cat, [catalogo.Resultado("open-meteo-pronostico", "ok", "", "abierto", 88)], "2026-09-19")
        self.assertEqual(catalogo.validar(cat), [])


class Informe(unittest.TestCase):
    def test_codigo_de_salida_es_1_si_alguna_entrada_falla(self):
        ok = catalogo.Resultado("a", "ok", "", "abierto", 1)
        mal = catalogo.Resultado("b", "error", "HTTP 500", "cerrado", 1)
        self.assertEqual(catalogo.codigo_de_salida([ok]), 0)
        self.assertEqual(catalogo.codigo_de_salida([ok, mal]), 1)

    def test_verificar_solo_las_entradas_pedidas(self):
        cat = catalogo_de(entrada(), entrada(id="otra-api"))
        resultados = catalogo.verificar_catalogo(cat, falso(200, OK), solo=["otra-api"])
        self.assertEqual([r.id for r in resultados], ["otra-api"])


if __name__ == "__main__":
    unittest.main()
