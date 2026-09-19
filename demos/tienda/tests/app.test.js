import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { crearDocumentoFalso } from "./helpers/dom-falso.js";
import { crearApp } from "../lib/app.js";

const leer = (n) => JSON.parse(readFileSync(new URL(`./fixtures/${n}`, import.meta.url), "utf8"));
const IDS = ["aviso", "tasa", "clima", "selector-ciudad", "productos", "carrito", "contador"];

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
    if (host === "api.open-meteo.com") return respuesta(leer("open-meteo.json"));
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

test("al iniciar muestra productos de ambos proveedores, la tasa y el clima", async () => {
  const { app, doc, texto } = nuevo();
  await app.iniciar();
  const tarjetas = doc.getElementById("productos").porEtiqueta("article");
  assert.equal(tarjetas.length, leer("fakestore.json").length + leer("dummyjson.json").products.length);
  assert.match(texto("tasa"), /Bs\. 848,55/);
  assert.match(texto("clima"), /25,9 °C/);
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

test("si falla el clima, el resto de la tienda funciona", async () => {
  const { app, doc, texto } = nuevo({ fallos: ["api.open-meteo.com"] });
  await app.iniciar();
  assert.match(texto("clima"), /no disponible/i);
  assert.ok(doc.getElementById("productos").porEtiqueta("article").length > 0);
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

test("cambiar de ciudad pide el clima con las coordenadas de esa ciudad", async () => {
  const { app, doc, red } = nuevo();
  await app.iniciar();
  const selector = doc.getElementById("selector-ciudad");
  assert.ok(selector.porEtiqueta("option").length >= 5);
  const otra = selector.porEtiqueta("option").find((o) => o.value !== "caracas");
  selector.value = otra.value;
  await selector.disparar("change");
  const ultima = new URL(red.llamadas.filter((u) => u.includes("open-meteo")).at(-1));
  assert.notEqual(ultima.searchParams.get("latitude"), "10.4806");
});

test("una ciudad desconocida en el selector se ignora sin llamar a la red", async () => {
  const { app, doc, red } = nuevo();
  await app.iniciar();
  const antes = red.llamadas.length;
  const selector = doc.getElementById("selector-ciudad");
  selector.value = "atlantida";
  await selector.disparar("change");
  assert.equal(red.llamadas.length, antes);
});

test("las peticiones solo van a los hosts declarados en el catálogo", async () => {
  const { app, red } = nuevo();
  await app.iniciar();
  const hosts = new Set(red.llamadas.map((u) => new URL(u).host));
  assert.deepEqual([...hosts].sort(), ["api.open-meteo.com", "dummyjson.com", "fakestoreapi.com", "ve.dolarapi.com"]);
});
