import test from "node:test";
import assert from "node:assert/strict";
import { aLatLon, aPixel, encuadre, metrosPorPixel, teselasVisibles, urlTesela, TESELA } from "../lib/mapa.js";

const cerca = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) < tol, `${a} ≉ ${b}`);

test("aPixel pone el ecuador y el meridiano de Greenwich en el centro del mundo", () => {
  const p = aPixel(0, 0, 3);
  assert.equal(p.x, TESELA * 8 / 2);
  cerca(p.y, TESELA * 8 / 2);
});

test("aLatLon deshace aPixel en cualquier zoom", () => {
  for (const [lat, lon, z] of [[10.4806, -66.9036, 12], [-34.6037, -58.3816, 5], [64.1466, -21.9426, 17]]) {
    const p = aPixel(lat, lon, z);
    const v = aLatLon(p.x, p.y, z);
    cerca(v.lat, lat);
    cerca(v.lon, lon);
  }
});

test("aPixel acota los polos de Web Mercator en vez de devolver infinito", () => {
  assert.ok(Number.isFinite(aPixel(90, 0, 2).y));
  cerca(aPixel(90, 0, 2).y, 0, 1e-3);
});

test("urlTesela usa las teselas de OpenStreetMap, da la vuelta en x y no pide teselas fuera del mundo", () => {
  assert.equal(urlTesela(1, 2, 3), "https://tile.openstreetmap.org/3/1/2.png");
  assert.equal(urlTesela(-1, 2, 3), "https://tile.openstreetmap.org/3/7/2.png");
  assert.equal(urlTesela(9, 2, 3), "https://tile.openstreetmap.org/3/1/2.png");
  assert.equal(urlTesela(0, 8, 3), null);
  assert.equal(urlTesela(0, -1, 3), null);
  assert.equal(urlTesela(0.5, 0, 3), null);
  assert.equal(urlTesela(0, 0, 25), null);
});

test("metrosPorPixel encoge a la mitad con cada zoom y con la latitud", () => {
  cerca(metrosPorPixel(0, 0), 156543.03392);
  cerca(metrosPorPixel(0, 1), 156543.03392 / 2);
  cerca(metrosPorPixel(60, 0), 156543.03392 / 2, 1e-6);
});

test("encuadre centra un punto solo con el zoom máximo pedido", () => {
  assert.deepEqual(encuadre([{ lat: 10, lon: -66 }], 800, 600, { zoomMax: 15 }), { lat: 10, lon: -66, zoom: 15 });
});

test("encuadre elige el mayor zoom en el que entran todos los puntos con su margen", () => {
  const puntos = [{ lat: 10.5, lon: -66.9 }, { lat: 10.4, lon: -66.8 }];
  const e = encuadre(puntos, 800, 600);
  for (const p of puntos) {
    const a = aPixel(p.lat, p.lon, e.zoom);
    const c = aPixel(e.lat, e.lon, e.zoom);
    assert.ok(Math.abs(a.x - c.x) <= 400 - 48 && Math.abs(a.y - c.y) <= 300 - 48);
  }
  const otro = encuadre(puntos, 800, 600, { zoomMax: 30 });
  const masCerca = e.zoom + 1;
  const a = aPixel(10.5, -66.9, masCerca);
  const b = aPixel(10.4, -66.8, masCerca);
  assert.ok(b.x - a.x > 800 - 96 || b.y - a.y > 600 - 96, "un zoom más ya no entra");
  assert.equal(otro.zoom, e.zoom);
});

test("encuadre ignora puntos inválidos y devuelve null si no queda ninguno", () => {
  assert.equal(encuadre([], 800, 600), null);
  assert.equal(encuadre([{ lat: NaN, lon: 0 }], 800, 600), null);
  assert.equal(encuadre([{ lat: 1, lon: 2 }, { lat: "x", lon: 0 }], 800, 600).lat, 1);
});

test("teselasVisibles cubre toda la vista y no pasa de los bordes verticales del mundo", () => {
  const lista = teselasVisibles(512, 512, 600, 400, 2);
  assert.ok(lista.length >= 6);
  for (const { y } of lista) assert.ok(y >= 0 && y < 4);
  assert.ok(teselasVisibles(512, 10, 600, 400, 2).every(({ y }) => y >= 0));
});
