import test from "node:test";
import assert from "node:assert/strict";
import { crearDocumentoFalso } from "../../compartido/tests/helpers/dom-falso.js";
import { pintarActual, pintarDias, pintarLugares } from "../lib/render.js";

const HOSTIL = `<img src=x onerror="alert(1)">`;
const lugar = { id: 1, nombre: "Caracas", region: "Distrito Federal", pais: "Venezuela", latitud: 10.5, longitud: -66.9, zona: "America/Caracas" };
const actual = { temperatura: 26.8, sensacion: 30, humedad: 67, viento: 10.7, unidad: "°C", descripcion: "Mayormente despejado" };
const dias = [
  { fecha: "2026-09-19", max: 27.8, min: 19.9, lluvia: 100, descripcion: "Llovizna" },
  { fecha: "2026-09-20", max: 28.5, min: 20.8, lluvia: null, descripcion: "Lluvia ligera" },
  { fecha: "2026-09-22", max: 29, min: 21, lluvia: 10, descripcion: "Despejado" },
];

test("pintarActual muestra lugar, temperatura, descripción, sensación, humedad y viento", () => {
  const doc = crearDocumentoFalso(["a"]);
  pintarActual(doc, doc.getElementById("a"), lugar, actual);
  const t = doc.getElementById("a").textContent;
  for (const esperado of [/Caracas, Distrito Federal, Venezuela/, /27 °C/, /Mayormente despejado/, /Sensación de 30 °C/, /Humedad 67 %/, /Viento 11 km\/h/]) assert.match(t, esperado);
});

test("pintarActual sin datos no deja el recuadro en blanco", () => {
  const doc = crearDocumentoFalso(["a"]);
  pintarActual(doc, doc.getElementById("a"), lugar, null);
  assert.match(doc.getElementById("a").textContent, /no disponible/i);
});

test("un nombre de lugar hostil se muestra como texto", () => {
  const doc = crearDocumentoFalso(["a", "l"]);
  pintarActual(doc, doc.getElementById("a"), { ...lugar, nombre: HOSTIL }, actual);
  pintarLugares(doc, doc.getElementById("l"), [{ ...lugar, nombre: HOSTIL }], () => {});
  assert.ok(doc.getElementById("a").textContent.includes(HOSTIL));
  assert.ok(doc.getElementById("l").textContent.includes(HOSTIL));
});

test("pintarDias lista un día por fila con nombre, máxima, mínima y lluvia", () => {
  const doc = crearDocumentoFalso(["d"]);
  pintarDias(doc, doc.getElementById("d"), dias, "°C");
  const filas = doc.getElementById("d").porEtiqueta("li");
  assert.equal(filas.length, 3);
  assert.match(filas[0].textContent, /Hoy/);
  assert.match(filas[0].textContent, /28 °C/);
  assert.match(filas[0].textContent, /20 °C/);
  assert.match(filas[0].textContent, /100 %/);
  assert.match(filas[1].textContent, /Mañana/);
  assert.match(filas[2].textContent, /martes/);
});

test("un dato de lluvia ausente se muestra como guion, no como 'null'", () => {
  const doc = crearDocumentoFalso(["d"]);
  pintarDias(doc, doc.getElementById("d"), dias, "°C");
  const t = doc.getElementById("d").porEtiqueta("li")[1].textContent;
  assert.doesNotMatch(t, /null|NaN|undefined/);
  assert.match(t, /—/);
});

test("pintarLugares ofrece un botón por lugar y avisa cuál se eligió", async () => {
  const doc = crearDocumentoFalso(["l"]);
  const otros = [lugar, { ...lugar, id: 2, pais: "Colombia", region: "Sucre" }];
  const elegidos = [];
  pintarLugares(doc, doc.getElementById("l"), otros, (x) => elegidos.push(x.id), 1);
  const botones = doc.getElementById("l").porEtiqueta("button");
  assert.equal(botones.length, 2);
  assert.equal(botones[0].getAttribute("aria-pressed"), "true");
  await botones[1].disparar("click");
  assert.deepEqual(elegidos, [2]);
});

test("pintarLugares con lista vacía limpia el contenedor", () => {
  const doc = crearDocumentoFalso(["l"]);
  pintarLugares(doc, doc.getElementById("l"), [lugar], () => {});
  pintarLugares(doc, doc.getElementById("l"), [], () => {});
  assert.equal(doc.getElementById("l").textContent, "");
});
