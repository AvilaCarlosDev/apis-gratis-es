import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { descripcionClima, urlPronostico, resumenPronostico, urlGeocodificacion, lugaresDe, nombreDia, formatearGrados, etiquetaLugar, ErrorDePronostico, ErrorDeGeocodificacion } from "../lib/clima.js";

const leer = (n) => JSON.parse(readFileSync(new URL(`./fixtures/${n}`, import.meta.url), "utf8"));
const lugar = { id: 1, nombre: "Caracas", region: "Distrito Federal", pais: "Venezuela", latitud: 10.48801, longitud: -66.87919, zona: "America/Caracas" };

test("traduce los códigos WMO al español y tolera los desconocidos", () => {
  assert.equal(descripcionClima(0), "Despejado");
  assert.equal(descripcionClima(2), "Parcialmente nublado");
  assert.equal(descripcionClima(53), "Llovizna");
  assert.equal(descripcionClima(61), "Lluvia ligera");
  assert.equal(descripcionClima(95), "Tormenta eléctrica");
  assert.equal(descripcionClima(12345), "Condición desconocida");
  assert.equal(descripcionClima(undefined), "Condición desconocida");
});

test("la URL del pronóstico lleva coordenadas, zona automática y siete días", () => {
  const u = new URL(urlPronostico(lugar, "celsius"));
  assert.equal(u.origin, "https://api.open-meteo.com");
  assert.equal(u.pathname, "/v1/forecast");
  assert.equal(u.searchParams.get("latitude"), "10.48801");
  assert.equal(u.searchParams.get("longitude"), "-66.87919");
  assert.equal(u.searchParams.get("timezone"), "auto");
  assert.equal(u.searchParams.get("forecast_days"), "7");
  assert.match(u.searchParams.get("current"), /temperature_2m/);
  assert.match(u.searchParams.get("daily"), /temperature_2m_max/);
  assert.equal(u.searchParams.get("temperature_unit"), null);
});

test("Fahrenheit se pide con temperature_unit y una unidad rara se trata como Celsius", () => {
  assert.equal(new URL(urlPronostico(lugar, "fahrenheit")).searchParams.get("temperature_unit"), "fahrenheit");
  assert.equal(new URL(urlPronostico(lugar, "kelvin")).searchParams.get("temperature_unit"), null);
});

test("las coordenadas fuera de rango se rechazan antes de llamar a la API", () => {
  assert.throws(() => urlPronostico({ ...lugar, latitud: 91 }, "celsius"), RangeError);
  assert.throws(() => urlPronostico({ ...lugar, longitud: -181 }, "celsius"), RangeError);
  assert.throws(() => urlPronostico({ ...lugar, latitud: "10" }, "celsius"), RangeError);
});

test("resume la respuesta real: condiciones actuales y siete días", () => {
  const real = leer("pronostico.json");
  const r = resumenPronostico(real);
  assert.equal(r.actual.temperatura, real.current.temperature_2m);
  assert.equal(r.actual.sensacion, real.current.apparent_temperature);
  assert.equal(r.actual.humedad, real.current.relative_humidity_2m);
  assert.equal(r.actual.viento, real.current.wind_speed_10m);
  assert.equal(r.actual.unidad, "°C");
  assert.equal(r.actual.descripcion, descripcionClima(real.current.weather_code));
  assert.equal(r.dias.length, 7);
  assert.deepEqual(Object.keys(r.dias[0]).sort(), ["descripcion", "fecha", "lluvia", "max", "min"]);
  assert.equal(r.dias[0].fecha, real.daily.time[0]);
  assert.equal(r.dias[3].max, real.daily.temperature_2m_max[3]);
});

test("una respuesta sin datos actuales o con series de distinto largo lanza un error explícito", () => {
  const real = leer("pronostico.json");
  assert.throws(() => resumenPronostico({}), ErrorDePronostico);
  assert.throws(() => resumenPronostico(null), ErrorDePronostico);
  assert.throws(() => resumenPronostico({ ...real, current: { ...real.current, temperature_2m: "calor" } }), ErrorDePronostico);
  assert.throws(() => resumenPronostico({ ...real, daily: { ...real.daily, temperature_2m_max: [1] } }), ErrorDePronostico);
  assert.throws(() => resumenPronostico({ error: true, reason: "Latitude must be in range" }), ErrorDePronostico);
});

test("un valor faltante dentro de un día (null) no rompe: se muestra como dato ausente", () => {
  const real = leer("pronostico.json");
  const daily = { ...real.daily, precipitation_probability_max: real.daily.precipitation_probability_max.map((v, i) => (i === 2 ? null : v)) };
  assert.equal(resumenPronostico({ ...real, daily }).dias[2].lluvia, null);
});

test("la URL de geocodificación codifica el texto y pide español", () => {
  const u = new URL(urlGeocodificacion("  San Cristóbal & co  "));
  assert.equal(u.origin, "https://geocoding-api.open-meteo.com");
  assert.equal(u.searchParams.get("name"), "San Cristóbal & co");
  assert.equal(u.searchParams.get("language"), "es");
  assert.equal(u.searchParams.get("count"), "5");
});

test("un texto de búsqueda muy corto o que no es texto se rechaza", () => {
  for (const v of ["", " ", "a", " b ", null, undefined, 42]) assert.throws(() => urlGeocodificacion(v), RangeError, String(v));
});

test("lugaresDe convierte la respuesta real y conserva el orden", () => {
  const ls = lugaresDe(leer("geocodificacion.json"));
  assert.equal(ls.length, 5);
  assert.deepEqual(ls[0], { id: 3646738, nombre: "Caracas", region: "Distrito Federal", pais: "Venezuela", latitud: 10.48801, longitud: -66.87919, zona: "America/Caracas" });
  assert.equal(ls[1].pais, "Indonesia");
});

test("sin resultados la API omite 'results': es una lista vacía, no un error", () => {
  assert.deepEqual(lugaresDe(leer("geocodificacion-vacia.json")), []);
});

test("lugaresDe descarta entradas sin coordenadas y falla ante otra forma", () => {
  assert.equal(lugaresDe({ results: [{ id: 1, name: "X", latitude: 1, longitude: 2 }, { id: 2, name: "Y" }, null] }).length, 1);
  assert.throws(() => lugaresDe(null), ErrorDeGeocodificacion);
  assert.throws(() => lugaresDe({ results: "no" }), ErrorDeGeocodificacion);
});

test("etiquetaLugar une nombre, región y país sin repetir ni dejar comas colgando", () => {
  assert.equal(etiquetaLugar(lugar), "Caracas, Distrito Federal, Venezuela");
  assert.equal(etiquetaLugar({ nombre: "Caracas", region: "", pais: "Venezuela" }), "Caracas, Venezuela");
  assert.equal(etiquetaLugar({ nombre: "Singapur", region: "Singapur", pais: "Singapur" }), "Singapur");
  assert.equal(etiquetaLugar({ nombre: "Lima" }), "Lima");
});

test("nombreDia usa Hoy y Mañana y luego el día de la semana en español", () => {
  assert.equal(nombreDia("2026-09-19", "2026-09-19"), "Hoy");
  assert.equal(nombreDia("2026-09-20", "2026-09-19"), "Mañana");
  assert.equal(nombreDia("2026-09-22", "2026-09-19"), "martes");
  assert.equal(nombreDia("basura", "2026-09-19"), "");
});

test("formatearGrados redondea y pone la unidad; sin dato muestra un guion", () => {
  assert.equal(formatearGrados(26.8, "°C"), "27 °C");
  assert.equal(formatearGrados(-0.4, "°C"), "0 °C");
  assert.equal(formatearGrados(80.06, "°F"), "80 °F");
  assert.equal(formatearGrados(null, "°C"), "—");
  assert.equal(formatearGrados(NaN, "°C"), "—");
});
