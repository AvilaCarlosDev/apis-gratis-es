import test from "node:test";
import assert from "node:assert/strict";
import { crearDocumentoFalso } from "../../compartido/tests/helpers/dom-falso.js";
import { tarjetaProducto, pintarCarrito, pintarTasa, pintarCategorias, pintarResultados } from "../lib/render.js";

const HOSTIL = `<img src=x onerror="alert(1)">`;
const producto = (extra = {}) => ({ id: "fakestore-1", titulo: "Camisa", precioUsd: 10, imagen: "https://fakestoreapi.com/img/a.png", categoria: "ropa", ...extra });
const tasa = { bsPorUsd: 800, actualizadaEl: "2026-09-18T00:00:00-04:00" };

test("la tarjeta muestra título, precio en dólares y en bolívares", () => {
  const doc = crearDocumentoFalso();
  const t = tarjetaProducto(doc, producto(), tasa, () => {});
  assert.match(t.textContent, /Camisa/);
  assert.match(t.textContent, /US\$ 10,00/);
  assert.match(t.textContent, /Bs\. 8\.000,00/);
});

test("sin tasa muestra solo dólares y avisa que los bolívares no están disponibles", () => {
  const doc = crearDocumentoFalso();
  const t = tarjetaProducto(doc, producto(), null, () => {});
  assert.match(t.textContent, /US\$ 10,00/);
  assert.doesNotMatch(t.textContent, /Bs\. 8/);
  assert.match(t.textContent, /Bs\. no disponible/);
});

test("un título hostil se muestra como texto y nunca como HTML", () => {
  const doc = crearDocumentoFalso();
  const t = tarjetaProducto(doc, producto({ titulo: HOSTIL }), tasa, () => {});
  assert.ok(t.textContent.includes(HOSTIL));
  assert.equal(t.porEtiqueta("img").filter((i) => (i.getAttribute("src") ?? "").includes("onerror")).length, 0);
});

test("la imagen lleva texto alternativo y la ruta solo se asigna a src", () => {
  const doc = crearDocumentoFalso();
  const [img] = tarjetaProducto(doc, producto(), tasa, () => {}).porEtiqueta("img");
  assert.equal(img.getAttribute("src"), "https://fakestoreapi.com/img/a.png");
  assert.equal(img.getAttribute("alt"), "Camisa");
  assert.equal(img.getAttribute("loading"), "lazy");
});

test("sin imagen no se crea la etiqueta img", () => {
  const doc = crearDocumentoFalso();
  assert.equal(tarjetaProducto(doc, producto({ imagen: null }), tasa, () => {}).porEtiqueta("img").length, 0);
});

test("el botón agrega el producto y es accesible por su nombre", async () => {
  const doc = crearDocumentoFalso();
  const agregados = [];
  const t = tarjetaProducto(doc, producto(), tasa, (p) => agregados.push(p));
  const [boton] = t.porEtiqueta("button");
  assert.equal(boton.getAttribute("aria-label"), "Agregar Camisa al carrito");
  await boton.disparar("click");
  assert.equal(agregados.length, 1);
  assert.equal(agregados[0].id, "fakestore-1");
});

test("el carrito vacío invita a agregar un producto", () => {
  const doc = crearDocumentoFalso(["carrito"]);
  pintarCarrito(doc, doc.getElementById("carrito"), [], tasa, {});
  assert.match(doc.getElementById("carrito").textContent, /carrito está vacío/i);
});

test("el carrito lista líneas, cantidad y totales en ambas monedas", () => {
  const doc = crearDocumentoFalso(["carrito"]);
  const carrito = [{ producto: producto(), cantidad: 2 }, { producto: producto({ id: "fakestore-2", titulo: "Gorra", precioUsd: 4.5 }), cantidad: 1 }];
  pintarCarrito(doc, doc.getElementById("carrito"), carrito, tasa, {});
  const texto = doc.getElementById("carrito").textContent;
  assert.match(texto, /Camisa/);
  assert.match(texto, /Gorra/);
  assert.match(texto, /US\$ 24,50/);
  assert.match(texto, /Bs\. 19\.600,00/);
});

test("los controles del carrito llaman a los manejadores con el id correcto", async () => {
  const doc = crearDocumentoFalso(["carrito"]);
  const llamadas = [];
  const manejadores = { quitar: (id) => llamadas.push(["quitar", id]), cambiar: (id, n) => llamadas.push(["cambiar", id, n]), vaciar: () => llamadas.push(["vaciar"]) };
  pintarCarrito(doc, doc.getElementById("carrito"), [{ producto: producto(), cantidad: 2 }], tasa, manejadores);
  const c = doc.getElementById("carrito");
  const boton = (nombre) => c.porEtiqueta("button").find((b) => b.getAttribute("aria-label")?.startsWith(nombre));
  await boton("Quitar").disparar("click");
  await boton("Aumentar").disparar("click");
  await boton("Disminuir").disparar("click");
  await boton("Vaciar").disparar("click");
  assert.deepEqual(llamadas, [["quitar", "fakestore-1"], ["cambiar", "fakestore-1", 3], ["cambiar", "fakestore-1", 1], ["vaciar"]]);
});

test("un título hostil en el carrito tampoco se interpreta como HTML", () => {
  const doc = crearDocumentoFalso(["carrito"]);
  pintarCarrito(doc, doc.getElementById("carrito"), [{ producto: producto({ titulo: HOSTIL }), cantidad: 1 }], tasa, {});
  assert.ok(doc.getElementById("carrito").textContent.includes(HOSTIL));
});

test("pintarTasa muestra la ecuación y la fecha; sin tasa lo dice", () => {
  const doc = crearDocumentoFalso(["tasa"]);
  pintarTasa(doc, doc.getElementById("tasa"), tasa);
  assert.match(doc.getElementById("tasa").textContent, /US\$ 1/);
  assert.match(doc.getElementById("tasa").textContent, /Bs\. 800,00/);
  assert.match(doc.getElementById("tasa").textContent, /18 de septiembre/);
  pintarTasa(doc, doc.getElementById("tasa"), null);
  assert.match(doc.getElementById("tasa").textContent, /no disponible/i);
});

test("pintarCategorias muestra 'Todas' y una opción por categoría, marcando la activa", () => {
  const doc = crearDocumentoFalso(["cats"]);
  const cats = [{ clave: "jewelery", nombre: "Joyería", cantidad: 3 }, { clave: "electronics", nombre: "Electrónica", cantidad: 2 }];
  pintarCategorias(doc, doc.getElementById("cats"), cats, 5, "jewelery", () => {});
  const botones = doc.getElementById("cats").porEtiqueta("button");
  assert.deepEqual(botones.map((b) => b.getAttribute("aria-pressed")), ["false", "true", "false"]);
  assert.match(botones[0].textContent, /Todas \(5\)/);
  assert.match(botones[1].textContent, /Joyería \(3\)/);
});

test("pintarCategorias avisa con la clave elegida al pulsar", async () => {
  const doc = crearDocumentoFalso(["cats"]);
  const elegidas = [];
  pintarCategorias(doc, doc.getElementById("cats"), [{ clave: "jewelery", nombre: "Joyería", cantidad: 3 }], 3, "todas", (c) => elegidas.push(c));
  const [todas, joyeria] = doc.getElementById("cats").porEtiqueta("button");
  await joyeria.disparar("click");
  await todas.disparar("click");
  assert.deepEqual(elegidas, ["jewelery", "todas"]);
});

test("un nombre de categoría hostil se muestra como texto", () => {
  const doc = crearDocumentoFalso(["cats"]);
  pintarCategorias(doc, doc.getElementById("cats"), [{ clave: "x", nombre: HOSTIL, cantidad: 1 }], 1, "todas", () => {});
  assert.ok(doc.getElementById("cats").textContent.includes(HOSTIL));
});

test("pintarResultados singular, plural y vacío", () => {
  const doc = crearDocumentoFalso(["r"]);
  const r = doc.getElementById("r");
  pintarResultados(doc, r, 1); assert.equal(r.textContent, "1 producto");
  pintarResultados(doc, r, 24); assert.equal(r.textContent, "24 productos");
  pintarResultados(doc, r, 0); assert.match(r.textContent, /No hay productos/);
});
