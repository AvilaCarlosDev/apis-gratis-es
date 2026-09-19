import test from "node:test";
import assert from "node:assert/strict";
import { categoriasDe, filtrar, nombreCategoria, ordenar } from "../lib/catalogo.js";

const p = (id, titulo, precioUsd, categoria) => ({ id, titulo, precioUsd, imagen: null, categoria });
const lista = [
  p("a", "Camisa azul", 20, "men's clothing"),
  p("b", "Anillo de plata", 150, "jewelery"),
  p("c", "Cámara réflex", 300, "electronics"),
  p("d", "Camisa roja", 15, "men's clothing"),
  p("e", "Perfume", 15, "fragrances"),
];

test("traduce las categorías conocidas al español y deja las desconocidas como llegan", () => {
  assert.equal(nombreCategoria("men's clothing"), "Ropa de hombre");
  assert.equal(nombreCategoria("jewelery"), "Joyería");
  assert.equal(nombreCategoria("skin-care"), "Cuidado de la piel");
  assert.equal(nombreCategoria("categoria-nueva"), "categoria-nueva");
  assert.equal(nombreCategoria(""), "Sin categoría");
  assert.equal(nombreCategoria(undefined), "Sin categoría");
});

test("categoriasDe cuenta productos por categoría y ordena por nombre en español", () => {
  const cs = categoriasDe(lista);
  assert.deepEqual(cs.map((c) => c.clave), ["electronics", "fragrances", "jewelery", "men's clothing"].sort((a, b) => nombreCategoria(a).localeCompare(nombreCategoria(b), "es")));
  assert.equal(cs.find((c) => c.clave === "men's clothing").cantidad, 2);
  assert.equal(cs.find((c) => c.clave === "men's clothing").nombre, "Ropa de hombre");
  assert.deepEqual(categoriasDe([]), []);
});

test("filtrar por categoría devuelve solo esa categoría; 'todas' devuelve todo", () => {
  assert.deepEqual(filtrar(lista, { categoria: "men's clothing" }).map((x) => x.id), ["a", "d"]);
  assert.equal(filtrar(lista, { categoria: "todas" }).length, 5);
  assert.equal(filtrar(lista, {}).length, 5);
  assert.equal(filtrar(lista, { categoria: "no-existe" }).length, 0);
});

test("filtrar por texto ignora mayúsculas, tildes y espacios sobrantes", () => {
  assert.deepEqual(filtrar(lista, { texto: "  CAMARA " }).map((x) => x.id), ["c"]);
  assert.deepEqual(filtrar(lista, { texto: "camisa" }).map((x) => x.id), ["a", "d"]);
  assert.equal(filtrar(lista, { texto: "" }).length, 5);
});

test("filtrar combina categoría y texto", () => {
  assert.deepEqual(filtrar(lista, { categoria: "men's clothing", texto: "roja" }).map((x) => x.id), ["d"]);
});

test("el texto de búsqueda se toma literal: los caracteres de expresión regular no rompen nada", () => {
  assert.deepEqual(filtrar(lista, { texto: ".*" }), []);
  assert.deepEqual(filtrar(lista, { texto: "(" }), []);
});

test("ordenar por precio, nombre y relevancia sin modificar la lista original", () => {
  const copia = JSON.stringify(lista);
  assert.deepEqual(ordenar(lista, "precio-asc").map((x) => x.id), ["d", "e", "a", "b", "c"]);
  assert.deepEqual(ordenar(lista, "precio-desc").map((x) => x.id), ["c", "b", "a", "d", "e"]);
  assert.deepEqual(ordenar(lista, "nombre").map((x) => x.id), ["b", "c", "a", "d", "e"]);
  assert.deepEqual(ordenar(lista, "relevancia").map((x) => x.id), ["a", "b", "c", "d", "e"]);
  assert.deepEqual(ordenar(lista, "algo-raro").map((x) => x.id), ["a", "b", "c", "d", "e"]);
  assert.equal(JSON.stringify(lista), copia);
});
