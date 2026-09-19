import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HOSTS_API, HOSTS_IMAGENES, SUGERENCIAS } from "../lib/config.js";

const catalogo = JSON.parse(readFileSync(new URL("../../../data/apis.json", import.meta.url), "utf8"));
const entrada = catalogo.entradas.find((e) => e.id === "wikipedia-resumen");
const leer = (ruta) => readFileSync(new URL(ruta, import.meta.url), "utf8");

test("la API que usa la demo existe en el catálogo, verificada y con CORS abierto", () => {
  assert.ok(entrada, "falta wikipedia-resumen");
  assert.equal(entrada.verificacion.estado, "ok");
  assert.equal(entrada.verificacion.cors, "abierto");
  assert.equal(entrada.autenticacion, "ninguna");
});

test("el host de la demo coincide con el del catálogo", () => {
  assert.deepEqual(HOSTS_API, [new URL(entrada.ejemplo.url).host]);
});

test("el catálogo declara la licencia y la atribución obligatoria que la demo cumple", () => {
  assert.equal(entrada.terminos.licencia, "CC-BY-SA-4.0");
  assert.equal(entrada.terminos.atribucion, "obligatoria");
  const html = leer("../index.html");
  assert.match(html, /CC BY-SA 4\.0/);
  assert.match(leer("../lib/render.js"), /Ver historial y autores/);
});

test("los README enlazan la documentación y dan crédito al repositorio de origen", () => {
  for (const archivo of ["README.md", "README.en.md"]) {
    const t = leer(`../${archivo}`);
    assert.ok(t.includes(entrada.documentacion), `${archivo} sin enlace a la documentación`);
    for (const c of entrada.creditos) assert.ok(t.includes(c.url), `${archivo}: ${c.url}`);
    assert.match(t, /CC BY-SA 4\.0/);
    assert.match(t, /Bricolage Grotesque/);
  }
});

test("las imágenes solo pueden venir del host permitido y la CSP lo refleja", () => {
  const csp = leer("../index.html").match(/img-src ([^;]+)/)[1].split(/\s+/);
  assert.deepEqual(csp.sort(), ["'self'", ...HOSTS_IMAGENES.map((h) => `https://${h}`)].sort());
});

test("las sugerencias son textos buscables", () => {
  assert.ok(SUGERENCIAS.length >= 3);
  assert.ok(SUGERENCIAS.every((s) => s.trim().length >= 2 && s.length <= 80));
});
