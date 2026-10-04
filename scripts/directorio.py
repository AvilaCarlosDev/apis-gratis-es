#!/usr/bin/env python3
"""Directorio ampliado: APIs importadas de listas con licencia abierta, SIN verificar.

El catálogo verificado vive en data/apis.json. Este directorio es otro nivel: entradas
tomadas tal cual de listas públicas, con crédito a su fuente, que todavía nadie de este
proyecto comprobó. Sirve para descubrir; no para confiar a ciegas.

Uso:
    directorio.py importar LISTA.md --commit SHA --fecha AAAA-MM-DD   # reescribe data/directorio.json
    directorio.py generar                                             # reescribe docs/directorio*.md
    directorio.py generar --comprobar                                 # falla si no están al día (CI)
"""
import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit

RAIZ = Path(__file__).resolve().parents[1]
DATOS = RAIZ / "data" / "directorio.json"
CATALOGO = RAIZ / "data" / "apis.json"
SALIDAS = {"es": RAIZ / "docs" / "directorio.md", "en": RAIZ / "docs" / "directorio.en.md"}

FUENTE = {
    "fuente": "public-apis/public-apis",
    "url": "https://github.com/public-apis/public-apis",
    "licencia": "MIT",
}

# Secciones de la lista de origen que no se importan (publicidad del patrocinador).
SECCIONES_EXCLUIDAS = {"APIs Covered Under APILayer Suite!"}

CATEGORIAS = {
    "Animals": "Animales", "Anime": "Anime", "Anti-Malware": "Antimalware", "Art & Design": "Arte y diseño",
    "Authentication & Authorization": "Autenticación y autorización", "Blockchain": "Blockchain", "Books": "Libros",
    "Business": "Negocios", "Calendar": "Calendario", "Cloud Storage & File Sharing": "Almacenamiento en la nube y archivos",
    "Continuous Integration": "Integración continua", "Cryptocurrency": "Criptomonedas", "Currency Exchange": "Cambio de divisas",
    "Data Validation": "Validación de datos", "Development": "Desarrollo", "Dictionaries": "Diccionarios",
    "Documents & Productivity": "Documentos y productividad", "Email": "Correo electrónico", "Entertainment": "Entretenimiento",
    "Environment": "Medio ambiente", "Events": "Eventos", "Finance": "Finanzas", "Food & Drink": "Comida y bebida",
    "Games & Comics": "Juegos y cómics", "Geocoding": "Geocodificación", "Government": "Gobierno", "Health": "Salud",
    "Jobs": "Empleo", "Machine Learning": "Aprendizaje automático", "Music": "Música", "News": "Noticias",
    "Open Data": "Datos abiertos", "Open Source Projects": "Proyectos de código abierto", "Patent": "Patentes",
    "Personality": "Personalidad", "Phone": "Telefonía", "Photography": "Fotografía", "Programming": "Programación",
    "Science & Math": "Ciencia y matemáticas", "Security": "Seguridad", "Shopping": "Compras", "Social": "Redes sociales",
    "Sports & Fitness": "Deportes y fitness", "Test Data": "Datos de prueba", "Text Analysis": "Análisis de texto",
    "Tracking": "Seguimiento de envíos", "Transportation": "Transporte", "URL Shorteners": "Acortadores de URL",
    "Vehicle": "Vehículos", "Video": "Video", "Weather": "Clima",
}

AUTENTICACION = {"No": "ninguna", "apiKey": "clave", "OAuth": "oauth", "X-Mashape-Key": "clave", "User-Agent": "user-agent"}
CORS = {"Yes": "si", "No": "no", "Unknown": "desconocido"}

TEXTOS = {
    "es": {
        "titulo": "Directorio ampliado (sin verificar)",
        "idiomas": "[English](directorio.en.md) · **Español**",
        "aviso": (
            "> ⚠️ **Estas {n} APIs NO fueron verificadas por este proyecto.** Se importaron tal cual de "
            "[{fuente}]({url}) (licencia {licencia}, commit [`{corto}`]({url}/tree/{commit}), leído el {fecha}). "
            "Puede haber enlaces caídos, servicios que dejaron de ser gratuitos o datos de autenticación y CORS "
            "desactualizados. Las que sí están comprobadas con una llamada real están en el "
            "[catálogo verificado](../README.md#catálogo-de-apis-sin-clave)."
        ),
        "notas": (
            "- Solo se importaron las entradas que la fuente marca con HTTPS; se omitió su sección de patrocinadores.\n"
            "- Las descripciones se dejan **en su idioma original (inglés)** para no alterar lo que dice la fuente.\n"
            "- «Autenticación» y «CORS» son los que declara la fuente, no una medición nuestra.\n"
            "- ¿Probaste una y funciona? [Propónla](../CONTRIBUTING.md) para pasarla al catálogo verificado."
        ),
        "resumen": "**{n} APIs en {c} categorías** · {sin} no piden clave según la fuente.",
        "contenido": "## Categorías",
        "cab": "| API | Descripción (original) | Autenticación | CORS |",
        "auth": {"ninguna": "Ninguna", "clave": "Clave", "oauth": "OAuth", "user-agent": "User-Agent"},
        "cors": {"si": "Sí", "no": "No", "desconocido": "Desconocido"},
        "creditos": "## Créditos",
        "creditos_txt": (
            "Todas las entradas de esta página provienen de [{fuente}]({url}), publicada bajo licencia {licencia} "
            "por sus colaboradores. El mérito de reunirlas es suyo; este proyecto solo las reordena y traduce las categorías. "
            "Su aviso de copyright y su licencia completos están en [LICENCIAS-DE-TERCEROS.md](../LICENCIAS-DE-TERCEROS.md)."
        ),
    },
    "en": {
        "titulo": "Extended directory (not verified)",
        "idiomas": "**English** · [Español](directorio.md)",
        "aviso": (
            "> ⚠️ **These {n} APIs were NOT verified by this project.** They were imported as-is from "
            "[{fuente}]({url}) ({licencia} license, commit [`{corto}`]({url}/tree/{commit}), read on {fecha}). "
            "Expect some dead links, services that are no longer free, and outdated authentication or CORS data. "
            "The ones checked with a real call live in the "
            "[verified catalog](../README.en.md#keyless-api-catalog)."
        ),
        "notas": (
            "- Only entries the source marks as HTTPS were imported; its sponsor section was skipped.\n"
            "- Descriptions are kept **in their original language (English)**, as written by the source.\n"
            "- \"Authentication\" and \"CORS\" are what the source declares, not our own measurement.\n"
            "- Tried one and it works? [Propose it](../CONTRIBUTING.md) to move it into the verified catalog."
        ),
        "resumen": "**{n} APIs in {c} categories** · {sin} need no key according to the source.",
        "contenido": "## Categories",
        "cab": "| API | Description | Authentication | CORS |",
        "auth": {"ninguna": "None", "clave": "Key", "oauth": "OAuth", "user-agent": "User-Agent"},
        "cors": {"si": "Yes", "no": "No", "desconocido": "Unknown"},
        "creditos": "## Credits",
        "creditos_txt": (
            "Every entry on this page comes from [{fuente}]({url}), published under the {licencia} license by its "
            "contributors. The credit for gathering them is theirs; this project only rearranges them and translates the categories. "
            "Its full copyright notice and license are in [LICENCIAS-DE-TERCEROS.md](../LICENCIAS-DE-TERCEROS.md)."
        ),
    },
}

_FILA = re.compile(r"^\[(.+?)\]\((https://[^)\s]+)\)$")


def _clave_url(url):
    """Normaliza una URL para detectar duplicados (sin esquema, sin www, sin barra final)."""
    partes = urlsplit(url)
    return (partes.netloc.lower().removeprefix("www.") + partes.path.rstrip("/")).lower()


def _es_promocion(url):
    """Enlaces de campaña del patrocinador de la lista de origen, repartidos por sus categorías."""
    partes = urlsplit(url)
    return "utm_" in partes.query or partes.netloc.lower().removeprefix("www.") == "apilayer.com"


def analizar(texto, ya_verificadas=()):
    """Extrae las entradas de la lista de origen. Devuelve una lista ordenada y sin duplicados."""
    vistas = {_clave_url(u) for u in ya_verificadas}
    entradas, categoria = [], None
    for linea in texto.splitlines():
        titulo = re.match(r"^###\s+(.+?)\s*$", linea)
        if titulo:
            categoria = titulo.group(1)
            continue
        if categoria not in CATEGORIAS or categoria in SECCIONES_EXCLUIDAS:
            continue
        celdas = [c.strip().replace("\\|", "|") for c in re.split(r"(?<!\\)\|", linea.strip().strip("|"))]
        if len(celdas) != 5:
            continue
        enlace = _FILA.match(celdas[0])
        auth, https, cors = celdas[2].strip("` "), celdas[3], celdas[4]
        if not enlace or https != "Yes" or auth not in AUTENTICACION or cors not in CORS:
            continue
        nombre, url = enlace.group(1).strip(), enlace.group(2)
        clave = _clave_url(url)
        if clave in vistas or not celdas[1] or _es_promocion(url):
            continue
        vistas.add(clave)
        entradas.append({
            "nombre": nombre,
            "url": url,
            "descripcion_en": celdas[1],
            "categoria": categoria,
            "autenticacion": AUTENTICACION[auth],
            "cors": CORS[cors],
        })
    entradas.sort(key=lambda e: (e["categoria"].lower(), e["nombre"].lower(), e["url"]))
    return entradas


def importar(ruta, commit, fecha):
    catalogo = json.loads(CATALOGO.read_text(encoding="utf-8"))
    verificadas = [e["documentacion"] for e in catalogo["entradas"]]
    entradas = analizar(Path(ruta).read_text(encoding="utf-8"), verificadas)
    datos = {"version": 1, "fuentes": [dict(FUENTE, commit=commit, fecha=fecha)], "entradas": entradas}
    DATOS.write_text(json.dumps(datos, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return len(entradas)


def _ancla(titulo):
    return re.sub(r"[^\w\- ]", "", titulo.lower()).replace(" ", "-")


def _celda(texto):
    return texto.replace("|", "\\|").replace("\n", " ").strip()


def generar(datos, idioma):
    t = TEXTOS[idioma]
    fuente = datos["fuentes"][0]
    entradas = datos["entradas"]
    grupos = {}
    for e in entradas:
        grupos.setdefault(e["categoria"], []).append(e)
    nombre = (lambda c: CATEGORIAS[c]) if idioma == "es" else (lambda c: c)
    orden = sorted(grupos, key=lambda c: nombre(c).lower())
    sin_clave = sum(1 for e in entradas if e["autenticacion"] == "ninguna")
    datos_fuente = dict(fuente, corto=fuente["commit"][:7], n=len(entradas))

    lineas = [f"# {t['titulo']}", "", t["idiomas"], "", t["aviso"].format(**datos_fuente), "",
              t["resumen"].format(n=len(entradas), c=len(orden), sin=sin_clave), "", t["notas"], "", t["contenido"], ""]
    lineas += [f"- [{nombre(c)}](#{_ancla(nombre(c))}) ({len(grupos[c])})" for c in orden]
    for c in orden:
        lineas += ["", f"### {nombre(c)}", "", t["cab"], "|---|---|---|---|"]
        lineas += [
            f"| [{_celda(e['nombre'])}]({e['url']}) | {_celda(e['descripcion_en'])} | {t['auth'][e['autenticacion']]} | {t['cors'][e['cors']]} |"
            for e in grupos[c]
        ]
    lineas += ["", t["creditos"], "", t["creditos_txt"].format(**datos_fuente), ""]
    return "\n".join(lineas)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="orden", required=True)
    p_imp = sub.add_parser("importar")
    p_imp.add_argument("lista")
    p_imp.add_argument("--commit", required=True)
    p_imp.add_argument("--fecha", required=True)
    p_gen = sub.add_parser("generar")
    p_gen.add_argument("--comprobar", action="store_true")
    args = parser.parse_args(argv)

    if args.orden == "importar":
        print(f"{importar(args.lista, args.commit, args.fecha)} entradas importadas en {DATOS.relative_to(RAIZ)}")
        return 0

    datos = json.loads(DATOS.read_text(encoding="utf-8"))
    desfasados = []
    for idioma, salida in SALIDAS.items():
        nuevo = generar(datos, idioma)
        if args.comprobar:
            if not salida.exists() or salida.read_text(encoding="utf-8") != nuevo:
                desfasados.append(salida.name)
        else:
            salida.write_text(nuevo, encoding="utf-8")
    if desfasados:
        print("No están al día con data/directorio.json: " + ", ".join(desfasados), file=sys.stderr)
        return 1
    print(f"{len(datos['entradas'])} entradas; docs/directorio.md y docs/directorio.en.md " + ("al día" if args.comprobar else "generados"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
