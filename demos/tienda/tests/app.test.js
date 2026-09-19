import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { crearDocumentoFalso } from "../../compartido/tests/helpers/dom-falso.js";
import { crearApp } from "../lib/app.js";

const leer = (n) => JSON.parse(readFileSync(new URL(`./fixtures/${n}`, import.meta.url), "utf8"));
const IDS = ["aviso", "tasa", "productos", "carrito", "contador", "categorias", "buscador", "orden", "resultados"];

const respuesta = (cuerpo, status = 200) => ({ ok: status < 300, status, json: async () => cuerpo });

// Enruta por host, como haría la red; `fallos` lista los hosts que responden 503.
function redFalsa({ fallos = [] } = {}) {
  const llamadas = [];
  const fetch = async (url) => {
    const { host } = new URL(url);
    llamadas.push(url);
    if (fallos.includes(host)) return respuesta({}, 503);
    if (host === "ve.dolarapi.com") return respuesta(leer("dolarapi-ve.json"));
    if (host === "fakestoreapi.com") return respuesta(leer("fakestore.json"));
    if (host === "dummyjson.com") return respuesta(leer("dummyjson.json"));
    throw new Error(`host inesperado: ${host}`);
  };
  return { fetch, llamadas };
}

const nuevo = (opciones) => {
  const doc = crearDocumentoFalso(IDS);
  const red = redFalsa(opciones);
  const app = crearApp({ doc, fetch: red.fetch });
  return { doc, red, app, texto: (id) => doc.getElementById(id).textContent };
};

test("al iniciar muestra productos de ambos proveedores y la tasa", async () => {
  const { app, doc, texto } = nuevo();
  await app.iniciar();
  const tarjetas = doc.getElementById("productos").porEtiqueta("article");
  assert.equal(tarjetas.length, leer("fakestore.json").length + leer("dummyjson.json").products.length);
  assert.match(texto("tasa"), /Bs\. 848,55/);
  assert.match(texto("resultados"), /\d+ productos/);
  assert.equal(doc.getElementById("aviso").hidden, true);
});

test("si falla la tasa, los productos siguen visibles solo en dólares y se avisa", async () => {
  const { app, doc, texto } = nuevo({ fallos: ["ve.dolarapi.com"] });
  await app.iniciar();
  assert.ok(doc.getElementById("productos").porEtiqueta("article").length > 0);
  assert.match(texto("tasa"), /no disponible/i);
  assert.match(texto("productos"), /Bs\. no disponible/);
  assert.match(texto("aviso"), /tasa/i);
});

test("si falla un proveedor de productos, muestra el otro y avisa cuál falló", async () => {
  const { app, doc, texto } = nuevo({ fallos: ["dummyjson.com"] });
  await app.iniciar();
  assert.equal(doc.getElementById("productos").porEtiqueta("article").length, leer("fakestore.json").length);
  assert.match(texto("aviso"), /DummyJSON/);
});

test("si fallan ambos proveedores, no hay tarjetas y el aviso permite reintentar", async () => {
  const { app, doc, red } = nuevo({ fallos: ["dummyjson.com", "fakestoreapi.com"] });
  await app.iniciar();
  assert.equal(doc.getElementById("productos").porEtiqueta("article").length, 0);
  const aviso = doc.getElementById("aviso");
  assert.equal(aviso.hidden, false);
  const antes = red.llamadas.length;
  await aviso.porEtiqueta("button")[0].disparar("click");
  assert.ok(red.llamadas.length > antes, "reintentar vuelve a llamar a la red");
});

test("agregar al carrito actualiza líneas, contador y total", async () => {
  const { app, doc, texto } = nuevo();
  await app.iniciar();
  const [boton] = doc.getElementById("productos").porEtiqueta("article")[0].porEtiqueta("button");
  await boton.disparar("click");
  await boton.disparar("click");
  assert.equal(texto("contador"), "2");
  assert.match(texto("carrito"), /US\$ /);
  assert.doesNotMatch(texto("carrito"), /carrito está vacío/i);
});

test("quitar y vaciar dejan el carrito vacío", async () => {
  const { app, doc, texto } = nuevo();
  await app.iniciar();
  await doc.getElementById("productos").porEtiqueta("article")[0].porEtiqueta("button")[0].disparar("click");
  const c = doc.getElementById("carrito");
  await c.porEtiqueta("button").find((b) => b.getAttribute("aria-label")?.startsWith("Vaciar")).disparar("click");
  assert.equal(texto("contador"), "0");
  assert.match(texto("carrito"), /carrito está vacío/i);
});

test("las peticiones solo van a los hosts declarados en el catálogo", async () => {
  const { app, red } = nuevo();
  await app.iniciar();
  const hosts = new Set(red.llamadas.map((u) => new URL(u).host));
  assert.deepEqual([...hosts].sort(), ["dummyjson.com", "fakestoreapi.com", "ve.dolarapi.com"]);
});

const todos = () => [...leer("fakestore.json").map((x) => ({ titulo: x.title, precio: x.price, cat: x.category })), ...leer("dummyjson.json").products.map((x) => ({ titulo: x.title, precio: x.price, cat: x.category }))];

test("las categorías se listan en español y filtran los productos", async () => {
  const { app, doc, texto } = nuevo();
  await app.iniciar();
  const botones = doc.getElementById("categorias").porEtiqueta("button");
  assert.match(botones[0].textContent, /^Todas/);
  const alguna = todos()[0].cat;
  const esperados = todos().filter((x) => x.cat === alguna).length;
  const boton = botones.find((b) => new RegExp(`\\(${esperados}\\)$`).test(b.textContent) && b !== botones[0]);
  assert.ok(boton, "hay un botón para la categoría con su cantidad");
  await boton.disparar("click");
  assert.equal(doc.getElementById("productos").porEtiqueta("article").length, esperados);
  assert.match(texto("resultados"), new RegExp(`^${esperados} producto`));
});

test("buscar por texto filtra, y sin coincidencias avisa con un estado vacío", async () => {
  const { app, doc, texto } = nuevo();
  await app.iniciar();
  const buscador = doc.getElementById("buscador");
  buscador.value = "zzzz-no-existe";
  await buscador.disparar("input");
  assert.equal(doc.getElementById("productos").porEtiqueta("article").length, 0);
  assert.match(texto("resultados"), /No hay productos/);
  buscador.value = todos()[0].titulo.slice(0, 6).toUpperCase();
  await buscador.disparar("input");
  assert.ok(doc.getElementById("productos").porEtiqueta("article").length >= 1);
});

test("ordenar por precio ascendente pone primero el más barato", async () => {
  const { app, doc } = nuevo();
  await app.iniciar();
  const orden = doc.getElementById("orden");
  orden.value = "precio-asc";
  await orden.disparar("change");
  const masBarato = Math.min(...todos().map((x) => x.precio));
  const primero = doc.getElementById("productos").porEtiqueta("article")[0].textContent;
  assert.ok(primero.includes(`US$ ${masBarato.toFixed(2).replace(".", ",")}`), primero);
});

test("cambiar el filtro no borra el carrito", async () => {
  const { app, doc, texto } = nuevo();
  await app.iniciar();
  await doc.getElementById("productos").porEtiqueta("article")[0].porEtiqueta("button")[0].disparar("click");
  const buscador = doc.getElementById("buscador");
  buscador.value = "zzzz";
  await buscador.disparar("input");
  assert.equal(texto("contador"), "1");
});
