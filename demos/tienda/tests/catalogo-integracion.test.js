import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HOSTS_API, HOSTS_IMAGEN } from "../lib/config.js";

const catalogo = JSON.parse(readFileSync(new URL("../../../data/apis.json", import.meta.url), "utf8"));
const porId = (id) => catalogo.entradas.find((e) => e.id === id);
const USADAS = ["fakestoreapi", "dummyjson", "dolarapi-venezuela"];

test("cada API que usa la demo existe en el catálogo y su última verificación fue correcta", () => {
  for (const id of USADAS) {
    const e = porId(id);
    assert.ok(e, `falta ${id} en data/apis.json`);
    assert.equal(e.verificacion.estado, "ok", id);
    assert.equal(e.verificacion.cors, "abierto", `${id} necesita CORS abierto para funcionar desde el navegador`);
  }
});

test("los hosts de la demo coinciden con los del catálogo", () => {
  const delCatalogo = USADAS.map((id) => new URL(porId(id).ejemplo.url).host).sort();
  assert.deepEqual([...HOSTS_API].sort(), delCatalogo);
});

test("los hosts de imágenes pertenecen a las APIs usadas", () => {
  for (const h of HOSTS_IMAGEN) assert.ok(h.endsWith("fakestoreapi.com") || h.endsWith("dummyjson.com"), h);
});

test("el README de la demo da crédito a cada API y a cada repositorio de origen", () => {
  const t = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  for (const id of USADAS) {
    for (const c of porId(id).creditos) assert.ok(t.includes(c.url), `falta el crédito ${c.url} de ${id}`);
    assert.ok(t.includes(porId(id).documentacion), `falta el enlace a ${id}`);
  }
  assert.match(t, /Bricolage Grotesque/);
});
