#!/usr/bin/env python3
"""Genera las tablas del catálogo en README.md (español) y README.en.md (inglés) desde data/apis.json.

Uso:
    generar_readme.py             # reescribe la zona entre <!-- catalogo:inicio --> y <!-- catalogo:fin -->
    generar_readme.py --comprobar # no escribe; falla si algún README no está al día (para el CI)

Los datos se editan solo en data/apis.json; así el español y el inglés no pueden divergir.
"""
import argparse
import sys
from pathlib import Path

import catalogo

RAIZ = Path(__file__).resolve().parents[1]
INICIO = "<!-- catalogo:inicio -->"
FIN = "<!-- catalogo:fin -->"

ORDEN = ["divisas-economia", "gobierno-datos-abiertos", "clima-geolocalizacion", "cultura-datos", "tienda-demo"]
TITULOS = {
    "es": {"divisas-economia": "Divisas y economía", "gobierno-datos-abiertos": "Gobierno y datos abiertos",
           "clima-geolocalizacion": "Clima y geolocalización", "cultura-datos": "Cultura y datos", "tienda-demo": "Tienda demo"},
    "en": {"divisas-economia": "Currencies and economy", "gobierno-datos-abiertos": "Government and open data",
           "clima-geolocalizacion": "Weather and geolocation", "cultura-datos": "Culture and data", "tienda-demo": "Demo store"},
}
TEXTOS = {
    "es": {"api": "API", "que": "Qué ofrece", "comercial": "Uso comercial", "atrib": "Atribución", "limites": "Límites y notas", "cors": "CORS",
           "verif": "Verificada", "ambito": "Ámbito", "si": "Sí", "no": "No", "nd": "No especificado", "obligatoria": "Obligatoria",
           "recomendada": "Recomendada", "nespec": "No especificada", "abierto": "Abierto", "cerrado": "Cerrado", "restringido": "Restringido",
           "desconocido": "Desconocido", "sinverificar": "⚠️ sin verificar", "fallo": "❌ falló", "creditos": "Descubierta o basada en",
           "en": "en", "global": "Global", "licencia": "licencia"},
    "en": {"api": "API", "que": "What it offers", "comercial": "Commercial use", "atrib": "Attribution", "limites": "Limits and notes", "cors": "CORS",
           "verif": "Verified", "ambito": "Scope", "si": "Yes", "no": "No", "nd": "Not specified", "obligatoria": "Required",
           "recomendada": "Recommended", "nespec": "Not specified", "abierto": "Open", "cerrado": "Closed", "restringido": "Restricted",
           "desconocido": "Unknown", "sinverificar": "⚠️ not verified", "fallo": "❌ failed", "creditos": "Discovered from or built on",
           "en": "in", "global": "Global", "licencia": "license"},
}


class MarcadoresAusentes(Exception):
    """El README no tiene los marcadores <!-- catalogo:inicio --> y <!-- catalogo:fin --> en ese orden."""


def _celda(texto):
    return str(texto).replace("|", "\\|").replace("\n", " ")


def _fila(e, idioma):
    tx = TEXTOS[idioma]
    en = idioma == "en"
    terminos = e["terminos"]
    descripcion = e["descripcion_en"] if en else e["descripcion"]
    ambito = ", ".join(tx["global"] if a == "global" else a for a in e["ambito"])
    comercial = {"si": tx["si"], "no": tx["no"], "no-especificado": tx["nd"]}[terminos["uso_comercial"]]
    atrib = {"obligatoria": tx["obligatoria"], "recomendada": tx["recomendada"], "no-especificada": tx["nespec"]}[terminos["atribucion"]]
    if terminos.get("licencia"):
        atrib += f" ({terminos['licencia']})"
    partes = []
    limites = terminos.get("limites_en" if en else "limites")
    notas = e.get("notas_en" if en else "notas")
    if limites:
        partes.append(limites)
    if notas:
        partes.append(notas)
    v = e.get("verificacion")
    if not v:
        verificada, cors = tx["sinverificar"], tx["desconocido"]
    else:
        cors = tx[v["cors"]]
        if v["estado"] == "ok":
            verificada = f"✅ {v['fecha']} · {v['ms']} ms"
        else:
            verificada = f"{tx['fallo']} {v['fecha']}: {v.get('motivo', '')}"
    api = f"[{e['nombre']}]({e['documentacion']})"
    celdas = [api, f"{descripcion} ({ambito})", comercial, atrib, " ".join(partes) or "—", cors, verificada]
    return "| " + " | ".join(_celda(c) for c in celdas) + " |"


def generar(cat, idioma):
    tx = TEXTOS[idioma]
    bloques = []
    for categoria in ORDEN:
        entradas = [e for e in cat["entradas"] if e["categoria"] == categoria]
        if not entradas:
            continue
        bloques.append(f"### {TITULOS[idioma][categoria]}\n")
        bloques.append(f"| {tx['api']} | {tx['que']} | {tx['comercial']} | {tx['atrib']} | {tx['limites']} | {tx['cors']} | {tx['verif']} |")
        bloques.append("|---|---|---|---|---|---|---|")
        bloques.extend(_fila(e, idioma) for e in entradas)
        bloques.append("")
    return "\n".join(bloques).rstrip("\n") + "\n"


def creditos(cat, idioma):
    tx = TEXTOS[idioma]
    por_fuente = {}
    for e in cat["entradas"]:
        for c in e.get("creditos", []):
            info = por_fuente.setdefault(c["fuente"], {"url": c["url"], "licencia": c.get("licencia"), "entradas": []})
            info["entradas"].append(e["nombre"])
    lineas = []
    for fuente in sorted(por_fuente, key=str.lower):
        info = por_fuente[fuente]
        lic = f" ({info['licencia']})" if info["licencia"] else ""
        lineas.append(f"- [{fuente}]({info['url']}){lic} — {', '.join(info['entradas'])}")
    return "\n".join(lineas) + "\n"


def reemplazar(texto, contenido):
    try:
        i = texto.index(INICIO)
        f = texto.index(FIN)
    except ValueError as error:
        raise MarcadoresAusentes(f"faltan los marcadores {INICIO} y {FIN}") from error
    if f < i:
        raise MarcadoresAusentes("los marcadores están en orden incorrecto")
    return texto[: i + len(INICIO)] + "\n" + contenido.rstrip("\n") + "\n" + texto[f:]


def esta_al_dia(texto, contenido):
    return reemplazar(texto, contenido) == texto


def _contenido(cat, idioma):
    return generar(cat, idioma) + "\n" + f"**{TEXTOS[idioma]['creditos']}:**\n\n" + creditos(cat, idioma)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--comprobar", action="store_true", help="no escribe; falla si algún README está desactualizado")
    args = parser.parse_args(argv)
    cat = catalogo.cargar()
    errores = catalogo.validar(cat)
    if errores:
        print("El catálogo no es válido; corrígelo antes de generar los README:", *errores, sep="\n  ", file=sys.stderr)
        return 1
    desactualizados = []
    for nombre, idioma in (("README.md", "es"), ("README.en.md", "en")):
        ruta = RAIZ / nombre
        texto = ruta.read_text(encoding="utf-8")
        contenido = _contenido(cat, idioma)
        try:
            if args.comprobar:
                if not esta_al_dia(texto, contenido):
                    desactualizados.append(nombre)
            else:
                ruta.write_text(reemplazar(texto, contenido), encoding="utf-8")
                print(f"{nombre} actualizado")
        except MarcadoresAusentes as error:
            print(f"{nombre}: {error}", file=sys.stderr)
            return 2
    if desactualizados:
        print(f"Desactualizados: {', '.join(desactualizados)}. Ejecuta: python3 scripts/generar_readme.py", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
