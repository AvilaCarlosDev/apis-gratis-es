#!/usr/bin/env bash
# Comprueba que dos versiones de un documento (español e inglés) enlacen a lo mismo.
# Uso: check-parity.sh README.md README.en.md
set -euo pipefail

if [[ "$#" -ne 2 ]]; then
    printf 'Uso: %s ARCHIVO_ES ARCHIVO_EN\n' "$0" >&2
    exit 2
fi

for file in "$1" "$2"; do
    if [[ ! -f "$file" ]]; then
        printf 'Error: el archivo no existe: %s\n' "$file" >&2
        exit 2
    fi
done

# Solo enlaces http(s); los anclajes internos (#seccion) cambian con el idioma.
urls() {
    { grep -oE 'https?://[^) >"]+' "$1" || true; } | sed -E 's/[.,;:]+$//' | sort -u
}

only_es="$(comm -23 <(urls "$1") <(urls "$2"))"
only_en="$(comm -13 <(urls "$1") <(urls "$2"))"

if [[ -z "$only_es" && -z "$only_en" ]]; then
    printf 'Los enlaces de %s y %s coinciden.\n' "$1" "$2"
    exit 0
fi

if [[ -n "$only_es" ]]; then
    printf 'Solo en %s:\n%s\n' "$1" "$only_es" >&2
fi
if [[ -n "$only_en" ]]; then
    printf 'Solo en %s:\n%s\n' "$2" "$only_en" >&2
fi
exit 1
