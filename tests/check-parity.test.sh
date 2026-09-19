#!/usr/bin/env bash
# Pruebas de scripts/check-parity.sh: las dos versiones del README deben enlazar lo mismo.
set -uo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
script="$repo_dir/scripts/check-parity.sh"
tmp="$(mktemp -d "${TMPDIR:-/tmp}/free-apis-parity-tests.XXXXXX")"
trap 'rm -rf -- "$tmp"' EXIT

pass=0
fail=0

check() {
    local name="$1" expected_code="$2" expected_text="$3"
    shift 3
    local output code
    output="$("$@" 2>&1)"
    code=$?
    if [[ "$code" -eq "$expected_code" && "$output" == *"$expected_text"* ]]; then
        printf 'ok - %s\n' "$name"
        pass=$((pass + 1))
    else
        printf 'not ok - %s (code %s, expected %s)\n%s\n' "$name" "$code" "$expected_code" "$output" >&2
        fail=$((fail + 1))
    fi
}

es="$tmp/es.md"
en="$tmp/en.md"

printf '[a](https://a.example/x) y [b](https://b.example)\n' >"$es"
printf 'see [a](https://a.example/x) and [b](https://b.example)\n' >"$en"
check "the same links in both files pass" 0 "coinciden" bash "$script" "$es" "$en"

printf '[a](https://a.example/x) [b](https://b.example) [c](https://c.example)\n' >"$es"
check "a link only in the Spanish file fails and names it" 1 "https://c.example" bash "$script" "$es" "$en"

printf '[a](https://a.example/x) [b](https://b.example)\n' >"$es"
printf '[a](https://a.example/x) [b](https://b.example) [d](https://d.example)\n' >"$en"
check "a link only in the English file fails and names it" 1 "https://d.example" bash "$script" "$es" "$en"

printf 'ver https://a.example/x.\n' >"$es"
printf 'see (https://a.example/x)\n' >"$en"
check "trailing punctuation does not count as a difference" 0 "coinciden" bash "$script" "$es" "$en"

printf '[i](#indice) [a](https://a.example/x)\n' >"$es"
printf '[a](https://a.example/x)\n' >"$en"
check "internal anchors are not compared" 0 "coinciden" bash "$script" "$es" "$en"

printf 'sin enlaces\n' >"$es"
printf 'no links\n' >"$en"
check "two files without links pass" 0 "coinciden" bash "$script" "$es" "$en"

check "a missing file is a usage error" 2 "no existe" bash "$script" "$es" "$tmp/nope.md"
check "no arguments is a usage error" 2 "Uso:" bash "$script"

printf '\n%d passed, %d failed\n' "$pass" "$fail"
[[ "$fail" -eq 0 ]]
