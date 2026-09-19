# Esquema del catálogo / Catalog schema

[Español](#español) · [English](#english)

## Español

El catálogo vive en [`data/apis.json`](../data/apis.json). **Es la única fuente de verdad**: las tablas de `README.md` y `README.en.md` se generan de él (`python3 scripts/generar_readme.py`), así que el español y el inglés no pueden divergir.

### Campos de cada entrada

| Campo | Obligatorio | Descripción |
|---|---|---|
| `id` | Sí | Identificador único en minúsculas y con guiones (`open-meteo-pronostico`) |
| `nombre` | Sí | Nombre visible |
| `categoria` | Sí | `divisas-economia`, `gobierno-datos-abiertos`, `clima-geolocalizacion`, `cultura-datos`, `tienda-demo` o `ia` |
| `descripcion` / `descripcion_en` | Sí | Qué hace la API, en español y en inglés (mínimo 20 caracteres) |
| `ambito` | Sí | Lista de países o `global` |
| `documentacion` | Sí | URL https de la documentación oficial |
| `autenticacion` | Sí | `ninguna`, `clave-gratuita`, `clave-opcional` u `oauth` |
| `ejemplo.url` | Sí | Llamada de ejemplo (`GET`, https). **Nunca lleva claves ni tokens**: el validador lo rechaza |
| `ejemplo.espera` | Sí | `tipo` (`objeto` o `lista`) y `claves` que debe traer la respuesta (en una lista, las del primer elemento) |
| `terminos.fuente` | Sí | URL de los términos o de la documentación donde se leyeron |
| `terminos.uso_comercial` | Sí | `si`, `no` o `no-especificado` |
| `terminos.atribucion` | Sí | `obligatoria`, `recomendada` o `no-especificada` |
| `terminos.limites` / `limites_en` | Sí (`null` si no hay) | Límites publicados; si hay texto, también su versión en inglés |
| `terminos.licencia` | Sí (`null` si no hay) | Licencia de los datos, por ejemplo `CC-BY-4.0` u `ODbL` |
| `creditos` | No | Repositorios que sirvieron para descubrir la API o de los que depende: `fuente`, `url` y `licencia` |
| `notas` / `notas_en` | No | Rarezas útiles para quien la use |
| `verificacion` | Lo escribe el verificador | `fecha`, `estado`, `cors`, `ms`, `metodo` y, si falló, `motivo` |

### Qué comprueba el verificador

`python3 scripts/catalogo.py verificar` llama al `ejemplo` de cada API y exige: estado `200`, JSON válido, el tipo esperado y las claves esperadas. No basta un `200`: hay APIs que responden `200` con un error en el cuerpo (por ejemplo, una versión deprecada).

El **CORS** se mide en una segunda petición con la cabecera `Origin`, como haría un navegador: `abierto`, `restringido`, `cerrado` o `desconocido` (si esa petición no fue concluyente). Un CORS `desconocido` no invalida la entrada.

### Cómo agregar una API

1. Lee sus términos de uso y anota atribución, uso comercial y límites; si no los encuentras, usa `no-especificado` en vez de suponerlo.
2. Agrega la entrada a `data/apis.json` con sus textos en español e inglés.
3. `python3 scripts/catalogo.py validar` para comprobar el esquema.
4. `python3 scripts/catalogo.py verificar --actualizar --id TU-ID` para llamarla y guardar el resultado real.
5. `python3 scripts/generar_readme.py` para regenerar las tablas.
6. Si descartas una candidata, anótala con su motivo en [`verificaciones.md`](verificaciones.md).

## English

The catalog lives in [`data/apis.json`](../data/apis.json). **It is the single source of truth**: the tables in `README.md` and `README.en.md` are generated from it (`python3 scripts/generar_readme.py`), so Spanish and English cannot diverge.

### Fields of each entry

| Field | Required | Description |
|---|---|---|
| `id` | Yes | Unique lowercase, hyphenated identifier (`open-meteo-pronostico`) |
| `nombre` | Yes | Display name |
| `categoria` | Yes | `divisas-economia`, `gobierno-datos-abiertos`, `clima-geolocalizacion`, `cultura-datos`, `tienda-demo` or `ia` |
| `descripcion` / `descripcion_en` | Yes | What the API does, in Spanish and English (minimum 20 characters) |
| `ambito` | Yes | List of countries or `global` |
| `documentacion` | Yes | https URL of the official documentation |
| `autenticacion` | Yes | `ninguna` (none), `clave-gratuita`, `clave-opcional` or `oauth` |
| `ejemplo.url` | Yes | Example call (`GET`, https). **Never carries keys or tokens**: the validator rejects it |
| `ejemplo.espera` | Yes | `tipo` (`objeto` or `lista`) and the `claves` the response must have (for a list, those of the first element) |
| `terminos.fuente` | Yes | URL of the terms or documentation where they were read |
| `terminos.uso_comercial` | Yes | `si` (yes), `no` or `no-especificado` (not specified) |
| `terminos.atribucion` | Yes | `obligatoria` (required), `recomendada` or `no-especificada` |
| `terminos.limites` / `limites_en` | Yes (`null` if none) | Published limits; if there is text, its English version too |
| `terminos.licencia` | Yes (`null` if none) | License of the data, for example `CC-BY-4.0` or `ODbL` |
| `creditos` | No | Repositories that helped discover the API or that it depends on: `fuente`, `url` and `licencia` |
| `notas` / `notas_en` | No | Quirks useful to whoever uses it |
| `verificacion` | Written by the verifier | `fecha`, `estado`, `cors`, `ms`, `metodo` and, if it failed, `motivo` |

### What the verifier checks

`python3 scripts/catalogo.py verificar` calls each API's `ejemplo` and requires: status `200`, valid JSON, the expected type and the expected keys. A `200` is not enough: some APIs answer `200` with an error in the body (for example, a deprecated version).

**CORS** is measured in a second request with the `Origin` header, as a browser would: `abierto` (open), `restringido` (restricted), `cerrado` (closed) or `desconocido` (unknown, if that request was inconclusive). An unknown CORS does not invalidate the entry.

### How to add an API

1. Read its terms of use and note attribution, commercial use and limits; if you cannot find them, use `no-especificado` instead of assuming.
2. Add the entry to `data/apis.json` with its Spanish and English texts.
3. `python3 scripts/catalogo.py validar` to check the schema.
4. `python3 scripts/catalogo.py verificar --actualizar --id YOUR-ID` to call it and store the real result.
5. `python3 scripts/generar_readme.py` to regenerate the tables.
6. If you reject a candidate, record it with its reason in [`verificaciones.md`](verificaciones.md).
