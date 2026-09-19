import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HOSTS_API, PAISES } from "../lib/config.js";

const catalogo = JSON.parse(readFileSync(new URL("../../../data/apis.json", import.meta.url), "utf8"));
const entrada = catalogo.entradas.find((e) => e.id === "nager-feriados");

test("la API que usa la demo existe en el catálogo, verificada y con CORS abierto", () => {
  assert.ok(entrada, "falta nager-feriados");
  assert.equal(entrada.verificacion.estado, "ok");
  assert.equal(entrada.verificacion.cors, "abierto");
  assert.equal(entrada.autenticacion, "ninguna");
});

test("el host de la demo coincide con el del catálogo", () => {
  assert.deepEqual(HOSTS_API, [new URL(entrada.ejemplo.url).host]);
});

test("los README enlazan la documentación y dan crédito al repositorio de origen", () => {
  for (const archivo of ["README.md", "README.en.md"]) {
    const t = readFileSync(new URL(`../${archivo}`, import.meta.url), "utf8");
    assert.ok(t.includes(entrada.documentacion), `${archivo} sin enlace a la documentación`);
    for (const c of entrada.creditos) assert.ok(t.includes(c.url), `${archivo}: ${c.url}`);
    assert.match(t, /Bricolage Grotesque/);
  }
});

test("los países del selector son códigos de dos letras sin repetir y el HTML ofrece exactamente esos", () => {
  const codigos = PAISES.map(([c]) => c);
  assert.equal(new Set(codigos).size, codigos.length);
  assert.ok(codigos.every((c) => /^[A-Z]{2}$/.test(c)));
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const opciones = [...html.matchAll(/<option value="([A-Z]{2})">/g)].map((m) => m[1]);
  assert.deepEqual(opciones, codigos);
});
