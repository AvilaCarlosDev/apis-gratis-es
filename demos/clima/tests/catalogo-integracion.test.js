import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HOSTS_API } from "../lib/config.js";

const catalogo = JSON.parse(readFileSync(new URL("../../../data/apis.json", import.meta.url), "utf8"));
const porId = (id) => catalogo.entradas.find((e) => e.id === id);
const USADAS = ["open-meteo-pronostico", "open-meteo-geocodificacion"];

test("las APIs que usa la demo existen en el catálogo, verificadas y con CORS abierto", () => {
  for (const id of USADAS) {
    const e = porId(id);
    assert.ok(e, `falta ${id}`);
    assert.equal(e.verificacion.estado, "ok", id);
    assert.equal(e.verificacion.cors, "abierto", id);
  }
});

test("los hosts de la demo coinciden con los del catálogo", () => {
  assert.deepEqual([...HOSTS_API].sort(), USADAS.map((id) => new URL(porId(id).ejemplo.url).host).sort());
});

test("Open-Meteo exige atribución y uso no comercial, y el README de la demo lo declara", () => {
  for (const id of USADAS) {
    assert.equal(porId(id).terminos.atribucion, "obligatoria", id);
    assert.equal(porId(id).terminos.uso_comercial, "no", id);
  }
  for (const archivo of ["README.md", "README.en.md"]) {
    const t = readFileSync(new URL(`../${archivo}`, import.meta.url), "utf8");
    assert.match(t, /Open-Meteo/);
    assert.match(t, /CC BY 4\.0/);
    for (const id of USADAS) assert.ok(t.includes(porId(id).documentacion), `${archivo} sin enlace a ${id}`);
  }
});

test("el README da crédito a los repositorios de origen", () => {
  const t = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  for (const id of USADAS) for (const c of porId(id).creditos) assert.ok(t.includes(c.url), c.url);
  assert.match(t, /Bricolage Grotesque/);
});
