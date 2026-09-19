import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { tasaOficial, convertir, ErrorDeTasa } from "../lib/cambio.js";

const real = JSON.parse(readFileSync(new URL("./fixtures/dolarapi-ve.json", import.meta.url), "utf8"));

test("toma la tasa oficial de la respuesta real y no la paralela", () => {
  const { bsPorUsd, actualizadaEl } = tasaOficial(real);
  assert.equal(bsPorUsd, real.find((x) => x.fuente === "oficial").promedio);
  assert.notEqual(bsPorUsd, real.find((x) => x.fuente === "paralelo").promedio);
  assert.match(actualizadaEl, /^\d{4}-\d{2}-\d{2}T/);
});

test("falla con un error claro si no hay tasa oficial", () => {
  assert.throws(() => tasaOficial([{ moneda: "USD", fuente: "paralelo", promedio: 900 }]), ErrorDeTasa);
  assert.throws(() => tasaOficial([]), ErrorDeTasa);
});

test("falla si la tasa no es un número positivo", () => {
  for (const promedio of [0, -1, null, "848,5", NaN, Infinity]) {
    assert.throws(() => tasaOficial([{ moneda: "USD", fuente: "oficial", promedio }]), ErrorDeTasa, String(promedio));
  }
});

test("falla si la respuesta no es una lista", () => {
  assert.throws(() => tasaOficial({ error: "x" }), ErrorDeTasa);
  assert.throws(() => tasaOficial(null), ErrorDeTasa);
});

test("ignora entradas de otras monedas", () => {
  assert.throws(() => tasaOficial([{ moneda: "EUR", fuente: "oficial", promedio: 990 }]), ErrorDeTasa);
});

test("convierte dólares a bolívares con dos decimales", () => {
  assert.equal(convertir(10, 848.5458), 8485.46);
  assert.equal(convertir(0, 848.5458), 0);
  assert.equal(convertir(109.95, 848.5458), 93297.61);
});

test("convertir rechaza montos o tasas inválidos", () => {
  assert.throws(() => convertir(-1, 800), RangeError);
  assert.throws(() => convertir(NaN, 800), RangeError);
  assert.throws(() => convertir(10, 0), RangeError);
});
