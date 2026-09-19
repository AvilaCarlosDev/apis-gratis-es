import test from "node:test";
import assert from "node:assert/strict";
import { formatearUsd, formatearBs, formatearFechaLarga } from "../formato.js";

test("formatea dólares con prefijo propio, coma decimal y dos decimales", () => {
  assert.equal(formatearUsd(109.95), "US$ 109,95");
  assert.equal(formatearUsd(7), "US$ 7,00");
  assert.equal(formatearUsd(0), "US$ 0,00");
});

test("formatea bolívares con separador de miles", () => {
  assert.equal(formatearBs(93298.7), "Bs. 93.298,70");
  assert.equal(formatearBs(848.5458), "Bs. 848,55");
});

test("un monto inválido se muestra como guiones en vez de NaN", () => {
  for (const v of [NaN, undefined, null, Infinity]) {
    assert.equal(formatearUsd(v), "US$ —");
    assert.equal(formatearBs(v), "Bs. —");
  }
});

test("formatea una fecha larga en español", () => {
  assert.equal(formatearFechaLarga("2026-09-18T00:00:00-04:00"), "18 de septiembre");
  assert.equal(formatearFechaLarga("no es fecha"), "");
});
