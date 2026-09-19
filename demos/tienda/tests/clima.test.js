import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resumenClima, descripcionClima, CIUDADES, urlClima, ErrorDeClima } from "../lib/clima.js";

const real = JSON.parse(readFileSync(new URL("./fixtures/open-meteo.json", import.meta.url), "utf8"));

test("resume la respuesta real de Open-Meteo", () => {
  const r = resumenClima(real);
  assert.equal(r.temperatura, real.current.temperature_2m);
  assert.equal(r.unidad, "°C");
  assert.equal(r.descripcion, descripcionClima(real.current.weather_code));
});

test("traduce los códigos WMO más comunes al español", () => {
  assert.equal(descripcionClima(0), "Despejado");
  assert.equal(descripcionClima(2), "Parcialmente nublado");
  assert.equal(descripcionClima(61), "Lluvia ligera");
  assert.equal(descripcionClima(95), "Tormenta eléctrica");
});

test("un código desconocido no rompe: devuelve una descripción neutra", () => {
  assert.equal(descripcionClima(12345), "Condición desconocida");
  assert.equal(descripcionClima(undefined), "Condición desconocida");
});

test("una respuesta sin datos actuales lanza un error explícito", () => {
  assert.throws(() => resumenClima({}), ErrorDeClima);
  assert.throws(() => resumenClima({ current: {} }), ErrorDeClima);
  assert.throws(() => resumenClima({ current: { temperature_2m: "calor" } }), ErrorDeClima);
  assert.throws(() => resumenClima(null), ErrorDeClima);
});

test("las ciudades tienen coordenadas válidas y ninguna repetida", () => {
  assert.ok(CIUDADES.length >= 5);
  for (const c of CIUDADES) {
    assert.ok(c.latitud >= -90 && c.latitud <= 90, c.nombre);
    assert.ok(c.longitud >= -180 && c.longitud <= 180, c.nombre);
  }
  assert.equal(new Set(CIUDADES.map((c) => c.id)).size, CIUDADES.length);
  assert.ok(CIUDADES.some((c) => c.id === "caracas"));
});

test("la URL de Open-Meteo lleva las coordenadas y pide solo lo necesario", () => {
  const u = new URL(urlClima(CIUDADES[0]));
  assert.equal(u.origin, "https://api.open-meteo.com");
  assert.equal(u.searchParams.get("latitude"), String(CIUDADES[0].latitud));
  assert.equal(u.searchParams.get("current"), "temperature_2m,weather_code");
});
