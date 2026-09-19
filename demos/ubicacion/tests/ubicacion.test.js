import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { banderaEmoji, formatearCoordenadas, formatearGrados, horaLocal, urlMapaIncrustado, normalizarIp, normalizarLugares, urlBusqueda, urlOpenStreetMap } from "../lib/ubicacion.js";

const leer = (n) => JSON.parse(readFileSync(new URL(`./fixtures/${n}`, import.meta.url), "utf8"));

test("urlBusqueda codifica el texto, limpia espacios y limita la cantidad", () => {
  assert.equal(urlBusqueda("  Plaza   Altamira / Caracas "), "https://photon.komoot.io/api/?q=Plaza%20Altamira%20%2F%20Caracas&limit=5");
});

test("urlBusqueda rechaza textos demasiado cortos o que no son texto", () => {
  assert.throws(() => urlBusqueda("a"), RangeError);
  assert.throws(() => urlBusqueda("   "), RangeError);
  assert.throws(() => urlBusqueda(undefined), RangeError);
});

test("urlBusqueda recorta los textos muy largos", () => {
  const url = new URL(urlBusqueda("x".repeat(500)));
  assert.equal(url.searchParams.get("q").length, 80);
});

test("normalizarLugares lee el GeoJSON real de Photon (longitud primero) y arma la dirección sin repetir", () => {
  const lugares = normalizarLugares(leer("photon-caracas.json"));
  assert.equal(lugares.length, 5);
  for (const l of lugares) {
    assert.ok(Math.abs(l.latitud) <= 90 && Math.abs(l.longitud) <= 180);
    assert.ok(l.nombre.length > 0);
    const partes = l.direccion.split(", ");
    assert.equal(new Set(partes).size, partes.length);
  }
  assert.ok(lugares.some((l) => l.latitud > 9 && l.latitud < 11 && l.longitud < -66 && l.longitud > -68), "Caracas está cerca de 10.5, -66.9");
});

test("normalizarLugares descarta coordenadas inválidas y exige una lista de features", () => {
  const lista = normalizarLugares({ features: [
    { geometry: { coordinates: [-66.9, 10.5] }, properties: { name: "Bueno", city: "Caracas", state: "Caracas" } },
    { geometry: { coordinates: [200, 10.5] }, properties: { name: "Longitud rota" } },
    { geometry: { coordinates: ["x", 1] }, properties: { name: "Texto" } },
    { geometry: null, properties: { name: "Sin geometría" } },
    { properties: {} },
  ] });
  assert.deepEqual(lista, [{ nombre: "Bueno", direccion: "Caracas", latitud: 10.5, longitud: -66.9 }]);
  assert.throws(() => normalizarLugares({ message: "error" }), /inesperada/);
  assert.throws(() => normalizarLugares(null), /inesperada/);
});

test("urlOpenStreetMap redondea, y rechaza coordenadas fuera de rango", () => {
  assert.equal(urlOpenStreetMap(10.504642, -66.851037), "https://www.openstreetmap.org/?mlat=10.50464&mlon=-66.85104#map=16/10.50464/-66.85104");
  assert.throws(() => urlOpenStreetMap(91, 0), RangeError);
  assert.throws(() => urlOpenStreetMap(0, NaN), RangeError);
  assert.throws(() => urlOpenStreetMap("10", "20"), RangeError);
});

test("formatearCoordenadas usa cuatro decimales", () => assert.equal(formatearCoordenadas(10.5046429, -66.8510373), "10.5046, -66.8510"));

test("banderaEmoji se calcula desde el código y no confía en nada más", () => {
  assert.equal(banderaEmoji("VE"), "🇻🇪");
  assert.equal(banderaEmoji("us"), "🇺🇸");
  assert.equal(banderaEmoji("USA"), "");
  assert.equal(banderaEmoji("<s"), "");
  assert.equal(banderaEmoji(undefined), "");
});

test("normalizarIp lee la respuesta real de ipwho.is", () => {
  const d = normalizarIp(leer("ipwho-8-8-8-8.json"));
  assert.equal(d.pais, "United States");
  assert.equal(d.bandera, "🇺🇸");
  assert.equal(d.zona, "America/Los_Angeles");
  assert.match(d.utc, /^[+-]\d\d:\d\d$/);
  assert.equal(d.prefijo, "1");
});

test("normalizarIp rechaza respuestas con success distinto de true", () => {
  assert.throws(() => normalizarIp({ success: false, message: "Invalid IP address" }), /ubicar/);
  assert.throws(() => normalizarIp(null), /ubicar/);
});

test("normalizarIp trae IP, proveedor, código postal y coordenadas", () => {
  const d = normalizarIp(leer("ipwho-8-8-8-8.json"));
  assert.equal(d.ip, "8.8.8.8");
  assert.equal(d.proveedor, "Google LLC");
  assert.equal(d.postal, "95025");
  assert.ok(Math.abs(d.latitud - 37.3394) < 0.001 && Math.abs(d.longitud + 121.8950) < 0.001);
});

test("normalizarIp deja coordenadas nulas si la API no las manda", () => {
  const d = normalizarIp({ success: true, country: "X", latitude: "no", longitude: null });
  assert.equal(d.latitud, null);
  assert.equal(d.longitud, null);
});

test("urlMapaIncrustado arma el mapa de OpenStreetMap con marcador y rechaza coordenadas malas", () => {
  const u = new URL(urlMapaIncrustado(10.5, -66.9));
  assert.equal(u.origin + u.pathname, "https://www.openstreetmap.org/export/embed.html");
  assert.equal(u.searchParams.get("marker"), "10.50000,-66.90000");
  assert.equal(u.searchParams.get("bbox"), "-66.92000,10.48000,-66.88000,10.52000");
  assert.throws(() => urlMapaIncrustado(95, 0), RangeError);
  assert.throws(() => urlMapaIncrustado(NaN, 0), RangeError);
});

test("formatearGrados convierte a grados, minutos y segundos con N/S/E/O", () => {
  assert.equal(formatearGrados(10.5, -66.75), `10° 30' 0.0" N, 66° 45' 0.0" O`);
  assert.equal(formatearGrados(-32.9477, 60.6302), `32° 56' 51.7" S, 60° 37' 48.7" E`);
  assert.throws(() => formatearGrados(0, 181), RangeError);
});

test("horaLocal usa la zona de la API y no rompe con una zona inválida", () => {
  assert.equal(horaLocal("UTC", new Date("2026-01-01T15:04:05Z")), "15:04:05");
  assert.equal(horaLocal("No/Existe"), "");
});
