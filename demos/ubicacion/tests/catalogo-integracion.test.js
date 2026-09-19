import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HOSTS_API } from "../lib/config.js";

const catalogo = JSON.parse(readFileSync(new URL("../../../data/apis.json", import.meta.url), "utf8"));
const porId = (id) => catalogo.entradas.find((e) => e.id === id);
const USADAS = ["photon", "ipwho-is"];

test("las APIs que usa la demo existen en el catálogo, verificadas, sin clave y con CORS abierto", () => {
  for (const id of USADAS) {
    const e = porId(id);
    assert.ok(e, `falta ${id}`);
    assert.equal(e.verificacion.estado, "ok", id);
    assert.equal(e.verificacion.cors, "abierto", id);
    assert.equal(e.autenticacion, "ninguna", id);
  }
});

test("los hosts de la demo coinciden con los del catálogo", () => {
  assert.deepEqual([...HOSTS_API].sort(), USADAS.map((id) => new URL(porId(id).ejemplo.url).host).sort());
});

test("los README enlazan la documentación, dan crédito y atribuyen a OpenStreetMap", () => {
  for (const archivo of ["README.md", "README.en.md"]) {
    const t = readFileSync(new URL(`../${archivo}`, import.meta.url), "utf8");
    for (const id of USADAS) assert.ok(t.includes(porId(id).documentacion), `${archivo} sin enlace a ${id}`);
    for (const c of porId("photon").creditos) assert.ok(t.includes(c.url), `${archivo}: ${c.url}`);
    assert.match(t, /OpenStreetMap/);
    assert.match(t, /ODbL/);
    assert.match(t, /Bricolage Grotesque/);
  }
});
