import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { normalizarBusqueda, normalizarResumen, urlBusqueda, urlHistorial, urlResumen } from "../lib/wikipedia.js";

const leer = (n) => JSON.parse(readFileSync(new URL(`./fixtures/${n}`, import.meta.url), "utf8"));

test("urlBusqueda codifica el texto, limpia espacios y limita la cantidad", () => {
  const u = new URL(urlBusqueda("  Simón   Bolívar  "));
  assert.equal(u.origin + u.pathname, "https://es.wikipedia.org/w/rest.php/v1/search/title");
  assert.equal(u.searchParams.get("q"), "Simón Bolívar");
  assert.equal(u.searchParams.get("limit"), "5");
});

test("urlBusqueda rechaza textos cortos o que no son texto y recorta los largos", () => {
  assert.throws(() => urlBusqueda("a"), RangeError);
  assert.throws(() => urlBusqueda(null), RangeError);
  assert.equal(new URL(urlBusqueda("x".repeat(300))).searchParams.get("q").length, 80);
});

test("urlResumen codifica el título y no deja que se escape de la ruta", () => {
  assert.equal(urlResumen("Simón_Bolívar"), "https://es.wikipedia.org/api/rest_v1/page/summary/Sim%C3%B3n_Bol%C3%ADvar");
  assert.equal(urlResumen("a/b?c#d"), "https://es.wikipedia.org/api/rest_v1/page/summary/a%2Fb%3Fc%23d");
  assert.throws(() => urlResumen(""), RangeError);
  assert.throws(() => urlResumen("x".repeat(201)), RangeError);
});

test("urlHistorial arma el enlace al historial con guiones bajos y codificado", () => {
  assert.equal(urlHistorial("Simón Bolívar"), "https://es.wikipedia.org/w/index.php?title=Sim%C3%B3n_Bol%C3%ADvar&action=history");
  assert.throws(() => urlHistorial(undefined), RangeError);
});

test("normalizarBusqueda lee la respuesta real y completa las miniaturas sin protocolo", () => {
  const lista = normalizarBusqueda(leer("busqueda-arepa.json"));
  assert.equal(lista.length, 5);
  assert.equal(lista[0].titulo, "Arepa");
  assert.equal(lista[0].clave, "Arepa");
  assert.match(lista[0].miniatura, /^https:\/\/thumb\.wikimedia\.org\//);
  assert.equal(lista.at(-1).miniatura, "");
});

test("normalizarBusqueda descarta miniaturas de otros hosts y entradas sin clave o título", () => {
  const lista = normalizarBusqueda({ pages: [
    { key: "A", title: "A", thumbnail: { url: "//evil.example/x.png" } },
    { key: "B", title: "B", thumbnail: { url: "http://thumb.wikimedia.org/x.png" } },
    { title: "sin clave" }, { key: "C" }, null] });
  assert.deepEqual(lista.map((l) => l.clave), ["A", "B"]);
  assert.ok(lista.every((l) => l.miniatura === ""));
  assert.throws(() => normalizarBusqueda({}), /inesperada/);
});

test("normalizarResumen lee la respuesta real de un artículo", () => {
  const r = normalizarResumen(leer("resumen-volcan.json"));
  assert.equal(r.titulo, "Volcán");
  assert.equal(r.canonico, "Volcán");
  assert.match(r.extracto, /volcán/i);
  assert.match(r.imagen, /^https:\/\/thumb\.wikimedia\.org\//);
  assert.equal(r.articulo, "https://es.wikipedia.org/wiki/Volc%C3%A1n");
  assert.equal(r.ambiguo, false);
});

test("normalizarResumen marca las páginas de desambiguación", () => {
  assert.equal(normalizarResumen(leer("resumen-mercurio.json")).ambiguo, true);
});

test("normalizarResumen ignora displaytitle (trae HTML) y descarta enlaces o imágenes ajenos", () => {
  const base = leer("resumen-volcan.json");
  const r = normalizarResumen({ ...base, displaytitle: "<img src=x onerror=alert(1)>", thumbnail: { source: "https://evil.example/a.png" }, content_urls: { desktop: { page: "https://evil.example/" } } });
  assert.doesNotMatch(r.titulo, /</);
  assert.equal(r.imagen, "");
  assert.equal(r.articulo, "");
});

test("normalizarResumen rechaza respuestas sin título o sin extracto y recorta extractos enormes", () => {
  assert.throws(() => normalizarResumen({ extract: "x" }), /inesperada/);
  assert.throws(() => normalizarResumen(null), /inesperada/);
  assert.throws(() => normalizarResumen({ title: "T" }), /inesperada/);
  assert.ok(normalizarResumen({ title: "T", extract: "y".repeat(5000) }).extracto.length <= 1500);
});
