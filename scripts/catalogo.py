#!/usr/bin/env python3
"""Catálogo de APIs gratuitas: validación del esquema y verificación con llamadas reales.

Uso:
    catalogo.py validar                      # comprueba data/apis.json contra el esquema
    catalogo.py verificar [--actualizar] [--id ID ...]
                                             # llama al ejemplo de cada API y comprueba la respuesta

La verificación no se conforma con un 200: exige JSON, el tipo esperado y las claves esperadas, porque
hay APIs que responden 200 con un error dentro del cuerpo (por ejemplo, una versión deprecada).
El CORS se mide en una segunda petición con la cabecera Origin, como haría un navegador; si esa
prueba falla, el CORS queda 'desconocido' pero la verificación principal no se ve afectada (algunas
APIs rechazan la combinación de un User-Agent propio con Origin).
"""
import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import date
from pathlib import Path

RUTA_DATOS = Path(__file__).resolve().parents[1] / "data" / "apis.json"
USER_AGENT = "apis-gratis-es/0.1 (verificador del catálogo; +https://github.com/AvilaCarlosDev/apis-gratis-es)"
ORIGEN_DE_PRUEBA = "https://demo.apis-gratis-es.example"

CATEGORIAS = {"ia", "divisas-economia", "gobierno-datos-abiertos", "clima-geolocalizacion", "tienda-demo", "cultura-datos"}
AUTENTICACION = {"ninguna", "clave-gratuita", "clave-opcional", "oauth"}
USO_COMERCIAL = {"si", "no", "no-especificado"}
ATRIBUCION = {"obligatoria", "recomendada", "no-especificada"}
ESTADOS = {"ok", "error"}
CORS = {"abierto", "restringido", "cerrado", "desconocido"}
TIPOS_DE_RESPUESTA = {"objeto", "lista"}
CAMPOS_OBLIGATORIOS = ("id", "nombre", "categoria", "descripcion", "descripcion_en", "ambito", "documentacion", "autenticacion", "ejemplo", "terminos")
CAMPOS_DE_TERMINOS = ("fuente", "uso_comercial", "atribucion", "limites", "licencia")
PARAMETROS_DE_CLAVE = re.compile(r"[?&](api[_-]?key|apikey|key|token|access[_-]?token|secret)=", re.I)
FORMATO_ID = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
FORMATO_FECHA = re.compile(r"^\d{4}-\d{2}-\d{2}$")


@dataclass(frozen=True)
class Resultado:
    id: str
    estado: str  # "ok" o "error"
    motivo: str
    cors: str
    ms: int


# ------------------------------------------------------------------ validación
def _es_https(valor):
    return isinstance(valor, str) and valor.startswith("https://")


def _validar_entrada(e, errores):
    ident = e.get("id", "(sin id)")

    def error(mensaje):
        errores.append(f"{ident}: {mensaje}")

    for campo in CAMPOS_OBLIGATORIOS:
        if campo not in e:
            error(f"falta el campo obligatorio '{campo}'")
    if "id" in e and not FORMATO_ID.match(str(e["id"])):
        error("id inválido: usa minúsculas, dígitos y guiones (kebab-case)")
    if e.get("categoria") is not None and e["categoria"] not in CATEGORIAS:
        error(f"categoria desconocida '{e['categoria']}'")
    if e.get("autenticacion") is not None and e["autenticacion"] not in AUTENTICACION:
        error(f"autenticacion desconocida '{e['autenticacion']}'")
    if "ambito" in e and (not isinstance(e["ambito"], list) or not e["ambito"] or not all(isinstance(a, str) for a in e["ambito"])):
        error("ambito debe ser una lista no vacía de textos")
    if "descripcion" in e and (not isinstance(e["descripcion"], str) or len(e["descripcion"]) < 20):
        error("descripcion demasiado corta (mínimo 20 caracteres)")
    if "descripcion_en" in e and (not isinstance(e["descripcion_en"], str) or len(e["descripcion_en"]) < 20):
        error("descripcion_en demasiado corta (mínimo 20 caracteres)")
    if e.get("notas") and not e.get("notas_en"):
        error("hay 'notas' pero falta 'notas_en': el catálogo se publica en español e inglés")
    if "documentacion" in e and not _es_https(e["documentacion"]):
        error("documentacion debe ser una URL https")

    ejemplo = e.get("ejemplo")
    if isinstance(ejemplo, dict):
        if not _es_https(ejemplo.get("url")):
            error("ejemplo.url debe ser una URL https")
        elif PARAMETROS_DE_CLAVE.search(ejemplo["url"]):
            error("ejemplo.url lleva una clave o token en la URL; nunca publiques credenciales")
        espera = ejemplo.get("espera")
        if not isinstance(espera, dict) or espera.get("tipo") not in TIPOS_DE_RESPUESTA or not isinstance(espera.get("claves"), list):
            error("ejemplo.espera debe tener tipo ('objeto' o 'lista') y una lista de claves")
    elif "ejemplo" in e:
        error("ejemplo debe ser un objeto")

    terminos = e.get("terminos")
    if isinstance(terminos, dict):
        for campo in CAMPOS_DE_TERMINOS:
            if campo not in terminos:
                error(f"terminos.{campo} es obligatorio (usa null o 'no-especificado' si no hay dato)")
        if not _es_https(terminos.get("fuente")):
            error("terminos.fuente debe ser una URL https")
        if terminos.get("limites") and not terminos.get("limites_en"):
            error("hay terminos.limites pero falta terminos.limites_en: el catálogo se publica en español e inglés")
        if terminos.get("uso_comercial") not in USO_COMERCIAL:
            error("terminos.uso_comercial inválido (si, no o no-especificado)")
        if terminos.get("atribucion") not in ATRIBUCION:
            error("terminos.atribucion inválida (obligatoria, recomendada o no-especificada)")
    elif "terminos" in e:
        error("terminos debe ser un objeto")

    for credito in e.get("creditos", []):
        if not isinstance(credito, dict) or not credito.get("fuente") or not _es_https(credito.get("url")):
            error("creditos: cada elemento necesita 'fuente' y una 'url' https")

    verificacion = e.get("verificacion")
    if verificacion is not None:
        if not isinstance(verificacion, dict):
            error("verificacion debe ser un objeto")
        else:
            if not FORMATO_FECHA.match(str(verificacion.get("fecha", ""))):
                error("verificacion.fecha debe tener el formato AAAA-MM-DD")
            if verificacion.get("estado") not in ESTADOS:
                error("verificacion.estado debe ser 'ok' o 'error'")
            if verificacion.get("cors") not in CORS:
                error("verificacion.cors debe ser abierto, restringido, cerrado o desconocido")
            if not isinstance(verificacion.get("ms"), int) or verificacion["ms"] < 0:
                error("verificacion.ms debe ser un entero no negativo")


def validar(catalogo):
    """Devuelve la lista de errores del esquema (vacía si el catálogo es válido)."""
    errores = []
    entradas = catalogo.get("entradas") if isinstance(catalogo, dict) else None
    if not isinstance(entradas, list) or not entradas:
        return ["el catálogo no tiene entradas"]
    vistos = set()
    for e in entradas:
        _validar_entrada(e, errores)
        if e.get("id") in vistos:
            errores.append(f"{e['id']}: id duplicado")
        vistos.add(e.get("id"))
    return errores


# ---------------------------------------------------------------- verificación
def _leer_cors(cabeceras, origen):
    valor = {k.lower(): v for k, v in cabeceras.items()}.get("access-control-allow-origin")
    if valor is None:
        return "cerrado"
    return "abierto" if valor in ("*", origen) else "restringido"


def _mensaje_de_error_del_cuerpo(cuerpo):
    """Texto de error que una API haya puesto dentro de un 200, o cadena vacía."""
    if isinstance(cuerpo, dict):
        if cuerpo.get("success") is False or cuerpo.get("errors") or cuerpo.get("error"):
            detalle = cuerpo.get("errors") or cuerpo.get("error") or ""
            if isinstance(detalle, list) and detalle and isinstance(detalle[0], dict):
                detalle = detalle[0].get("message", "")
            return str(detalle)[:160]
    return ""


def _medir_cors(url, fetch):
    """CORS medido como un navegador (con Origin) en una petición aparte y sin consecuencias si falla."""
    cabeceras = {"User-Agent": USER_AGENT, "Accept": "application/json", "Origin": ORIGEN_DE_PRUEBA}
    try:
        estado, _, cabeceras_respuesta, _ = fetch(url, cabeceras)
    except (OSError, ValueError):
        return "desconocido"
    if estado != 200:
        return "desconocido"
    return _leer_cors(cabeceras_respuesta, ORIGEN_DE_PRUEBA)


def _evaluar_respuesta(ejemplo, estado, cuerpo):
    """Devuelve el motivo del error, o cadena vacía si la respuesta es la esperada."""
    if estado != 200:
        return f"HTTP {estado}"
    try:
        datos = json.loads(cuerpo)
    except (ValueError, TypeError):
        return "la respuesta no es JSON"

    espera = ejemplo["espera"]
    tipo_python = dict if espera["tipo"] == "objeto" else list
    if not isinstance(datos, tipo_python):
        return _mensaje_de_error_del_cuerpo(datos) or f"se esperaba {espera['tipo']} y llegó {type(datos).__name__}"

    muestra = datos if espera["tipo"] == "objeto" else (datos[0] if datos else None)
    if not isinstance(muestra, dict):
        return "la lista está vacía o sus elementos no son objetos" if espera["claves"] else ""
    faltan = [c for c in espera["claves"] if c not in muestra]
    if faltan:
        return _mensaje_de_error_del_cuerpo(muestra) or f"faltan las claves esperadas: {', '.join(faltan)}"
    return ""


def verificar_entrada(entrada, fetch):
    """Llama al ejemplo de la entrada y comprueba estado, JSON, tipo y claves esperadas."""
    ident = entrada["id"]
    url = entrada["ejemplo"]["url"]
    cabeceras = {"User-Agent": USER_AGENT, "Accept": "application/json"}
    try:
        estado, cuerpo, _, ms = fetch(url, cabeceras)
    except (OSError, ValueError) as error:
        return Resultado(ident, "error", f"sin respuesta: {error}", "desconocido", 0)

    motivo = _evaluar_respuesta(entrada["ejemplo"], estado, cuerpo)
    if motivo:
        return Resultado(ident, "error", motivo, "desconocido", ms)
    return Resultado(ident, "ok", "", _medir_cors(url, fetch), ms)


def verificar_catalogo(catalogo, fetch, solo=None):
    return [verificar_entrada(e, fetch) for e in catalogo["entradas"] if not solo or e["id"] in solo]


def actualizar(catalogo, resultados, fecha):
    """Escribe en cada entrada el bloque de verificación con el resultado de la última comprobación."""
    por_id = {e["id"]: e for e in catalogo["entradas"]}
    for r in resultados:
        if r.id not in por_id:
            continue
        bloque = {"fecha": fecha, "estado": r.estado, "cors": r.cors, "ms": r.ms, "metodo": "llamada"}
        if r.estado == "error":
            bloque["motivo"] = r.motivo
        por_id[r.id]["verificacion"] = bloque


def codigo_de_salida(resultados):
    return 1 if any(r.estado == "error" for r in resultados) else 0


# ------------------------------------------------------------------ red y CLI
def descargar(url, cabeceras):
    """fetch real: devuelve (estado, cuerpo, cabeceras, milisegundos)."""
    import time

    peticion = urllib.request.Request(url, headers=cabeceras)
    inicio = time.monotonic()
    try:
        with urllib.request.urlopen(peticion, timeout=30) as respuesta:
            cuerpo = respuesta.read(2_000_000)
            return respuesta.status, cuerpo, dict(respuesta.headers), int((time.monotonic() - inicio) * 1000)
    except urllib.error.HTTPError as error:
        return error.code, b"", dict(error.headers), int((time.monotonic() - inicio) * 1000)


def cargar(ruta=RUTA_DATOS):
    with open(ruta, encoding="utf-8") as archivo:
        return json.load(archivo)


def guardar(catalogo, ruta=RUTA_DATOS):
    with open(ruta, "w", encoding="utf-8") as archivo:
        json.dump(catalogo, archivo, ensure_ascii=False, indent=2)
        archivo.write("\n")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="orden", required=True)
    sub.add_parser("validar", help="valida el esquema de data/apis.json")
    p = sub.add_parser("verificar", help="llama al ejemplo de cada API")
    p.add_argument("--actualizar", action="store_true", help="escribe el resultado en data/apis.json")
    p.add_argument("--id", action="append", help="verifica solo esta entrada (repetible)")
    args = parser.parse_args(argv)

    try:
        catalogo = cargar()
    except (OSError, ValueError) as error:
        print(f"No se pudo leer {RUTA_DATOS}: {error}", file=sys.stderr)
        return 2

    if args.orden == "validar":
        errores = validar(catalogo)
        for mensaje in errores:
            print(f"ERROR {mensaje}")
        print(f"{len(catalogo.get('entradas', []))} entradas, {len(errores)} errores")
        return 1 if errores else 0

    resultados = verificar_catalogo(catalogo, descargar, solo=args.id)
    for r in resultados:
        print(f"{'ok   ' if r.estado == 'ok' else 'ERROR'} {r.id:32} {r.ms:5d} ms  cors:{r.cors:11} {r.motivo}")
    if args.actualizar:
        actualizar(catalogo, resultados, date.today().isoformat())
        guardar(catalogo)
        print(f"data/apis.json actualizado con {len(resultados)} verificaciones")
    return codigo_de_salida(resultados)


if __name__ == "__main__":
    sys.exit(main())
