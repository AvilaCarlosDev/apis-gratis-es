import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { crearDocumentoFalso } from "../../compartido/tests/helpers/dom-falso.js";
import { crearApp } from "../lib/app.js";

const crudo = JSON.parse(readFileSync(new URL("./fixtures/ve-2026.json", import.meta.url), "utf8"));
const IDS = ["aviso", "pais", "anio-ant", "anio-sig", "anio", "proximo", "resumen", "lista", "csv"];
const respuesta = (cuerpo, status = 200) => ({ ok: status < 300, status, json: async () => cuerpo });

function nuevo({ fallo = false, hoy = new Date(2026, 4, 10), descargas = [] } = {}) {
  const doc = crearDocumentoFalso(IDS);
  doc.getElementById("pais").value = "VE";
  const llamadas = [];
  const fetch = async (url) => {
    llamadas.push(new URL(url));
    return fallo ? respuesta({}, 503) : respuesta(crudo);
  };
  const app = crearApp({ doc, fetch, ahora: () => hoy, descargar: (nombre, contenido) => descargas.push({ nombre, contenido }) });
  return { doc, app, llamadas, texto: (id) => doc.getElementById(id).textContent };
}

test("al iniciar pide el año en curso de Venezuela y muestra el próximo feriado", async () => {
  const { app, llamadas, texto } = nuevo();
  await app.iniciar();
  assert.equal(llamadas.length, 1);
  assert.equal(llamadas[0].pathname, "/api/v3/PublicHolidays/2026/VE");
  assert.match(texto("proximo"), /Próximo feriado/);
  assert.match(texto("proximo"), /Faltan \d+ días|Es hoy|Es mañana/);
  assert.equal(texto("anio"), "2026");
  assert.ok(texto("lista").length > 0);
});

test("cambiar de país vuelve a pedir con ese código", async () => {
  const { app, doc, llamadas } = nuevo();
  await app.iniciar();
  doc.getElementById("pais").value = "CO";
  await doc.getElementById("pais").disparar("change");
  assert.equal(llamadas.at(-1).pathname, "/api/v3/PublicHolidays/2026/CO");
});

test("otro año muestra la lista pero sin el próximo feriado", async () => {
  const { app, doc, llamadas, texto } = nuevo();
  await app.iniciar();
  await doc.getElementById("anio-sig").disparar("click");
  assert.equal(llamadas.at(-1).pathname, "/api/v3/PublicHolidays/2027/VE");
  assert.equal(texto("anio"), "2027");
  assert.equal(texto("proximo"), "");
  assert.ok(texto("lista").length > 0);
});

test("con todos los feriados ya pasados, no muestra el próximo", async () => {
  const { app, texto } = nuevo({ hoy: new Date(2027, 0, 2) });
  await app.iniciar();
  assert.equal(texto("proximo"), "");
});

test("si falla la API avisa, no muestra datos y se puede reintentar", async () => {
  const { app, doc, llamadas, texto } = nuevo({ fallo: true });
  await app.iniciar();
  const aviso = doc.getElementById("aviso");
  assert.equal(aviso.hidden, false);
  assert.match(texto("aviso"), /No se pudieron cargar los feriados/);
  assert.equal(texto("lista"), "");
  await aviso.porEtiqueta("button")[0].disparar("click");
  assert.equal(llamadas.length, 2);
});

test("un código de país inválido no llega a la red", async () => {
  const { app, doc, llamadas } = nuevo();
  await app.iniciar();
  doc.getElementById("pais").value = "../../etc";
  await doc.getElementById("pais").disparar("change");
  assert.equal(llamadas.length, 1);
  assert.equal(doc.getElementById("aviso").hidden, false);
});

test("los botones de año se desactivan en los límites", async () => {
  const { app, doc } = nuevo({ hoy: new Date(2000, 5, 1) });
  await app.iniciar();
  assert.equal(doc.getElementById("anio-ant").disabled, true);
  assert.equal(doc.getElementById("anio-sig").disabled, false);
});

test("Descargar CSV entrega los feriados cargados con nombre de archivo por país y año", async () => {
  const descargas = [];
  const { app, doc } = nuevo({ descargas });
  await app.iniciar();
  assert.equal(doc.getElementById("csv").disabled, false);
  await doc.getElementById("csv").disparar("click");
  assert.equal(descargas.length, 1);
  assert.equal(descargas[0].nombre, "feriados-VE-2026.csv");
  assert.match(descargas[0].contenido, /^fecha,dia,feriado,fin_de_semana_largo\n"2026-01-01"/);
});

test("si falla la carga el botón CSV queda desactivado y no descarga nada", async () => {
  const descargas = [];
  const { app, doc } = nuevo({ fallo: true, descargas });
  await app.iniciar();
  assert.equal(doc.getElementById("csv").disabled, true);
  await doc.getElementById("csv").disparar("click");
  assert.equal(descargas.length, 0);
});

test("los feriados en lunes o viernes llevan la etiqueta de fin de semana largo", async () => {
  const { app, texto } = nuevo();
  await app.iniciar();
  assert.match(texto("lista"), /Fin de semana largo/);
});

test("muestra el resumen del año con total y fines de semana largos", async () => {
  const { app, texto } = nuevo();
  await app.iniciar();
  assert.match(texto("resumen"), /Total del año/);
  assert.match(texto("resumen"), /\d+ feriados/);
  assert.match(texto("resumen"), /fines de semana largos|fin de semana largo/);
});
