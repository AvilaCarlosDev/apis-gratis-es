import test from "node:test";
import assert from "node:assert/strict";
import { carritoVacio, agregar, quitar, cambiarCantidad, totalUsd, cantidadTotal, MAX_POR_PRODUCTO } from "../lib/carrito.js";

const camisa = { id: "fakestore-1", titulo: "Camisa", precioUsd: 10, imagen: null, categoria: "ropa" };
const gorra = { id: "fakestore-2", titulo: "Gorra", precioUsd: 4.5, imagen: null, categoria: "ropa" };

test("un carrito vacío no tiene líneas ni total", () => {
  assert.deepEqual(carritoVacio(), []);
  assert.equal(totalUsd([]), 0);
  assert.equal(cantidadTotal([]), 0);
});

test("agregar crea una línea y agregar de nuevo suma la cantidad", () => {
  let c = agregar(carritoVacio(), camisa);
  c = agregar(c, camisa);
  c = agregar(c, gorra);
  assert.equal(c.length, 2);
  assert.equal(c.find((l) => l.producto.id === camisa.id).cantidad, 2);
  assert.equal(cantidadTotal(c), 3);
});

test("las operaciones no modifican el carrito original", () => {
  const original = agregar(carritoVacio(), camisa);
  const copia = JSON.stringify(original);
  agregar(original, gorra);
  quitar(original, camisa.id);
  cambiarCantidad(original, camisa.id, 5);
  assert.equal(JSON.stringify(original), copia);
});

test("el total suma precio por cantidad sin errores de coma flotante", () => {
  assert.equal(totalUsd(agregar(agregar(agregar(carritoVacio(), { ...gorra, precioUsd: 0.1 }), { ...gorra, precioUsd: 0.1 }), { ...gorra, precioUsd: 0.1 })), 0.3);
  assert.equal(totalUsd(agregar(agregar(agregar(carritoVacio(), gorra), gorra), gorra)), 13.5);
});

test("quitar elimina la línea completa y tolera un id que no existe", () => {
  const c = agregar(agregar(carritoVacio(), camisa), gorra);
  assert.deepEqual(quitar(c, camisa.id).map((l) => l.producto.id), [gorra.id]);
  assert.equal(quitar(c, "no-existe").length, 2);
});

test("cambiarCantidad fija la cantidad y con cero elimina la línea", () => {
  const c = agregar(carritoVacio(), camisa);
  assert.equal(cambiarCantidad(c, camisa.id, 4)[0].cantidad, 4);
  assert.equal(cambiarCantidad(c, camisa.id, 0).length, 0);
});

test("la cantidad no puede ser negativa, fraccionaria ni exceder el máximo", () => {
  const c = agregar(carritoVacio(), camisa);
  assert.equal(cambiarCantidad(c, camisa.id, -3).length, 0);
  assert.equal(cambiarCantidad(c, camisa.id, 2.7)[0].cantidad, 2);
  assert.equal(cambiarCantidad(c, camisa.id, 999)[0].cantidad, MAX_POR_PRODUCTO);
  assert.equal(cambiarCantidad(c, camisa.id, NaN)[0].cantidad, 1);
});

test("agregar respeta el máximo por producto", () => {
  let c = carritoVacio();
  for (let i = 0; i < MAX_POR_PRODUCTO + 5; i++) c = agregar(c, camisa);
  assert.equal(c[0].cantidad, MAX_POR_PRODUCTO);
});

test("un precio cuyo valor en centavos no es exacto en coma flotante suma sin error", () => {
  const p = { ...gorra, precioUsd: 1.15 };
  assert.equal(totalUsd(agregar(agregar(agregar(carritoVacio(), p), p), p)), 3.45);
});
