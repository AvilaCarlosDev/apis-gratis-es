import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { normalizarFakeStore, normalizarDummyJson, ErrorDeRespuesta } from "../lib/productos.js";

const leer = (n) => JSON.parse(readFileSync(new URL(`./fixtures/${n}`, import.meta.url), "utf8"));

test("normaliza la respuesta real de FakeStoreAPI", () => {
  const { productos, descartados } = normalizarFakeStore(leer("fakestore.json"));
  assert.equal(productos.length, 3);
  assert.equal(descartados, 0);
  const [p] = productos;
  assert.equal(p.id, "fakestore-1");
  assert.equal(typeof p.titulo, "string");
  assert.ok(Number.isFinite(p.precioUsd) && p.precioUsd > 0);
  assert.match(p.imagen, /^https:\/\/fakestoreapi\.com\//);
  assert.equal(typeof p.categoria, "string");
});

test("normaliza la respuesta real de DummyJSON usando la miniatura", () => {
  const { productos } = normalizarDummyJson(leer("dummyjson.json"));
  assert.equal(productos.length, leer("dummyjson.json").products.length);
  assert.match(productos[0].id, /^dummyjson-\d+$/);
  assert.match(productos[0].imagen, /^https:\/\/cdn\.dummyjson\.com\//);
});

test("los identificadores de proveedores distintos no chocan", () => {
  const a = normalizarFakeStore(leer("fakestore.json")).productos.map((p) => p.id);
  const b = normalizarDummyJson(leer("dummyjson.json")).productos.map((p) => p.id);
  assert.equal(new Set([...a, ...b]).size, a.length + b.length);
});

test("descarta productos con precio, título o id inválidos y cuenta cuántos", () => {
  const base = { id: 1, title: "Camisa", price: 10, image: "https://fakestoreapi.com/img/a.png", category: "ropa" };
  const { productos, descartados } = normalizarFakeStore([
    base, { ...base, id: 2, price: 0 }, { ...base, id: 3, price: -5 }, { ...base, id: 4, price: "10" }, { ...base, id: 5, price: NaN },
    { ...base, id: 6, title: "" }, { ...base, id: null }, null, "texto",
  ]);
  assert.deepEqual(productos.map((p) => p.id), ["fakestore-1"]);
  assert.equal(descartados, 8);
});

test("una imagen de un host no permitido se elimina pero el producto se conserva", () => {
  const { productos } = normalizarFakeStore([{ id: 1, title: "Camisa", price: 10, image: "https://evil.example/x.png", category: "ropa" }]);
  assert.equal(productos.length, 1);
  assert.equal(productos[0].imagen, null);
});

test("una imagen con esquema javascript: se elimina", () => {
  const { productos } = normalizarFakeStore([{ id: 1, title: "Camisa", price: 10, image: "javascript:alert(1)", category: "ropa" }]);
  assert.equal(productos[0].imagen, null);
});

test("los títulos largos se recortan", () => {
  const { productos } = normalizarFakeStore([{ id: 1, title: "T".repeat(500), price: 10, image: null, category: "x" }]);
  assert.ok(productos[0].titulo.length <= 120);
});

test("una respuesta con otra forma lanza un error explícito, no un fallo silencioso", () => {
  assert.throws(() => normalizarFakeStore({ success: false, errors: [{ message: "deprecated" }] }), ErrorDeRespuesta);
  assert.throws(() => normalizarFakeStore("html"), ErrorDeRespuesta);
  assert.throws(() => normalizarDummyJson([1, 2]), ErrorDeRespuesta);
  assert.throws(() => normalizarDummyJson({ products: "no" }), ErrorDeRespuesta);
});

test("una lista vacía es un resultado válido con cero productos", () => {
  assert.deepEqual(normalizarFakeStore([]), { productos: [], descartados: 0 });
});
