#!/usr/bin/env python3
"""Comprueba las afirmaciones verificables del README contra fuentes públicas.

Solo comprueba lo que se puede comprobar sin clave de API:
  - los modelos `:free` de OpenRouter que cita el README existen hoy (API pública de modelos);
  - los tags de `ollama pull` / `ollama run` existen en el registro de Ollama;
  - los modelos de Groq de los ejemplos no figuran en su historial de retiradas.

Los límites numéricos de cada proveedor no se pueden comprobar así (páginas con JS o
bloqueo de clientes automáticos) y se marcan a mano como "no verificado" en el README.

Uso: verificar.py README.md      (código de salida 1 si alguna afirmación es falsa)
"""
import html
import json
import re
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass

OPENROUTER_MODELOS = "https://openrouter.ai/api/v1/models"
GROQ_RETIRADAS = "https://console.groq.com/docs/deprecations"
OLLAMA_REGISTRO = "https://registry.ollama.ai/v2/library/{nombre}/manifests/{etiqueta}"


class FuenteNoDisponible(Exception):
    """La fuente no respondió o no tenía el formato esperado: no se puede juzgar la afirmación."""


@dataclass(frozen=True)
class Hallazgo:
    nivel: str  # "ok", "aviso" o "error"
    mensaje: str


def extraer_modelos_openrouter(texto):
    # Un ID de OpenRouter es "autor/modelo:free"; no debe pegarse a una URL (://) ni a otro texto.
    return set(re.findall(r"(?<![\w/:.\-])([a-z0-9][\w.\-]*/[\w.\-]+:free)(?![\w\-])", texto))


def extraer_tags_ollama(texto):
    return set(re.findall(r"ollama (?:pull|run)\s+([\w./\-]+(?::[\w.\-]+)?)", texto))


def extraer_modelos_groq(texto):
    modelos = set()
    for bloque in re.findall(r"```.*?\n(.*?)```", texto, flags=re.S):
        if re.search(r"groq", bloque, flags=re.I):
            modelos.update(re.findall(r"""["']?model["']?\s*:\s*["']([^"']+)["']""", bloque))
    return modelos


def modelos_gratuitos_openrouter(cuerpo):
    try:
        datos = json.loads(cuerpo)["data"]
        return {m["id"] for m in datos if m["id"].endswith(":free")}
    except (ValueError, KeyError, TypeError) as error:
        raise FuenteNoDisponible(f"la API de OpenRouter devolvió algo ilegible ({error})") from error


_ID_DE_MODELO = re.compile(r"^\w[\w.\-]*(?:/[\w.\-]+)?$")


def _ids_iniciales(entrada):
    """Identificadores de modelo al principio de una entrada, hasta el primer texto que no lo sea.

    Las entradas antiguas de la página siguen con prosa que recomienda otros modelos como reemplazo;
    esos no están retirados y no deben contarse.
    """
    ids = []
    for token in entrada.split():
        limpio = token.rstrip(",")
        if limpio in {"and", "&"}:
            continue
        if _ID_DE_MODELO.match(limpio) and re.search(r"[\d\-/]", limpio):
            ids.append(limpio)
        else:
            break
    return ids


def _a_texto(pagina):
    """Texto plano de una página HTML: sin scripts, sin etiquetas y con las entidades resueltas."""
    sin_codigo = re.sub(r"(?is)<(script|style|noscript).*?</\1>", " ", pagina)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", sin_codigo)))


def modelos_retirados_groq(pagina):
    pagina = _a_texto(pagina)
    fechas = r"(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, 20\d\d"
    entradas = re.findall(rf"{fechas}: (.+?)(?= In line| Effective| We |\s{fechas}: |$)", pagina)
    modelos = {modelo for entrada in entradas for modelo in _ids_iniciales(entrada)}
    if not modelos:
        raise FuenteNoDisponible("la página de retiradas de Groq no tiene el historial esperado")
    return modelos


def descargar(url):
    peticion = urllib.request.Request(url, headers={"User-Agent": "apis-gratis-es verificador"})
    try:
        with urllib.request.urlopen(peticion, timeout=30) as respuesta:
            return respuesta.status, respuesta.read(4_000_000).decode("utf8", "ignore")
    except urllib.error.HTTPError as error:
        return error.code, ""
    except (urllib.error.URLError, TimeoutError, OSError):
        return 0, ""


def _leer(fetch, url, lector):
    estado, cuerpo = fetch(url)
    if estado != 200:
        raise FuenteNoDisponible(f"{url} respondió {estado or 'sin conexión'}")
    return lector(cuerpo)


def verificar(readme, fetch=descargar):
    hallazgos = []
    openrouter = extraer_modelos_openrouter(readme)
    ollama = extraer_tags_ollama(readme)
    groq = extraer_modelos_groq(readme)

    if openrouter:
        try:
            vigentes = _leer(fetch, OPENROUTER_MODELOS, modelos_gratuitos_openrouter)
            for modelo in sorted(openrouter):
                if modelo in vigentes:
                    hallazgos.append(Hallazgo("ok", f"OpenRouter: {modelo} sigue siendo gratuito"))
                else:
                    hallazgos.append(Hallazgo("error", f"OpenRouter: {modelo} ya no figura como modelo gratuito"))
        except FuenteNoDisponible as error:
            hallazgos.append(Hallazgo("aviso", f"OpenRouter no se pudo comprobar: {error}"))

    for etiqueta_completa in sorted(ollama):
        nombre, _, etiqueta = etiqueta_completa.partition(":")
        url = OLLAMA_REGISTRO.format(nombre=nombre, etiqueta=etiqueta or "latest")
        estado, _ = fetch(url)
        if estado == 200:
            hallazgos.append(Hallazgo("ok", f"Ollama: {etiqueta_completa} existe"))
        elif estado == 404:
            hallazgos.append(Hallazgo("error", f"Ollama: {etiqueta_completa} no existe en el registro"))
        else:
            hallazgos.append(Hallazgo("aviso", f"Ollama: {etiqueta_completa} no se pudo comprobar ({estado or 'sin conexión'})"))

    if groq:
        try:
            retirados = _leer(fetch, GROQ_RETIRADAS, modelos_retirados_groq)
            for modelo in sorted(groq):
                if modelo in retirados:
                    hallazgos.append(Hallazgo("error", f"Groq: {modelo} figura en su historial de modelos retirados"))
                else:
                    hallazgos.append(Hallazgo("ok", f"Groq: {modelo} no figura entre los retirados"))
        except FuenteNoDisponible as error:
            hallazgos.append(Hallazgo("aviso", f"Groq no se pudo comprobar: {error}"))

    if not (openrouter or ollama or groq):
        hallazgos.append(Hallazgo("aviso", "no hay nada que verificar: el README no cita modelos `:free`, tags de Ollama ni modelos de Groq"))
    return hallazgos


def codigo_de_salida(hallazgos):
    return 1 if any(h.nivel == "error" for h in hallazgos) else 0


def main(argv):
    if len(argv) != 2:
        print("Uso: verificar.py README.md", file=sys.stderr)
        return 2
    try:
        with open(argv[1], encoding="utf-8") as archivo:
            readme = archivo.read()
    except OSError as error:
        print(f"No se pudo leer {argv[1]}: {error}", file=sys.stderr)
        return 2
    hallazgos = verificar(readme)
    marcas = {"ok": "ok   ", "aviso": "AVISO", "error": "ERROR"}
    for h in hallazgos:
        print(f"{marcas[h.nivel]} {h.mensaje}")
    return codigo_de_salida(hallazgos)


if __name__ == "__main__":
    sys.exit(main(sys.argv))
