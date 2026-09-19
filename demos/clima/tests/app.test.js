import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { crearDocumentoFalso } from "../../compartido/tests/helpers/dom-falso.js";
import { crearApp } from "../lib/app.js";

const leer = (n) => JSON.parse(readFileSync(new URL(`./fixtures/${n}`, import.meta.url), "utf8"));
const IDS = ["aviso", "buscador", "buscar", "lugares", "actual", "dias", "unidad"];
const respuesta = (cuerpo, status = 200) => ({ ok: status < 300, status, json: async () => cuerpo });

function red({ fallos = [], geocodificacion = "geocodificacion.json" } = {}) {
  const llamadas = [];
  const fetch = async (url) => {
    const u = new URL(url);
    llamadas.push(u);
    if (fallos.includes(u.host)) return respuesta({}, 503);
    if (u.host === "geocoding-api.open-meteo.com") return respuesta(leer(geocodificacion));
    if (u.host === "api.open-meteo.com") return respuesta(leer("pronostico.json"));
    throw new Error(`host inesperado: ${u.host}`);
  };
  return { fetch, llamadas };
}

const nuevo = (opciones) => {
  const doc = crearDocumentoFalso(IDS);
  const r = red(opciones);
  const app = crearApp({ doc, fetch: r.fetch });
  return { doc, r, app, texto: (id) => doc.getElementById(id).textContent };
};
const buscar = async (doc, texto) => { doc.getElementById("buscador").value = texto; await doc.getElementById("buscar").disparar("click"); };
const pronosticos = (r) => r.llamadas.filter((u) => u.host === "api.open-meteo.com");

test("al iniciar muestra el pronóstico de Caracas sin pedir geocodificación", async () => {
  const { app, doc, r, texto } = nuevo();
  await app.iniciar();
  assert.equal(r.llamadas.filter((u) => u.host.startsWith("geocoding")).length, 0);
  assert.match(texto("actual"), /Caracas/);
  assert.match(texto("actual"), /27 °C/);
  assert.equal(doc.getElementById("dias").porEtiqueta("li").length, 7);
  assert.equal(doc.getElementById("aviso").hidden, true);
});

test("buscar un lugar lista coincidencias y carga la primera", async () => {
  const { app, doc, r, texto } = nuevo();
  await app.iniciar();
  await buscar(doc, "Caracas");
  assert.equal(doc.getElementById("lugares").porEtiqueta("button").length, 5);
  const ultimo = pronosticos(r).at(-1);
  assert.equal(ultimo.searchParams.get("latitude"), "10.48801");
  assert.match(texto("actual"), /Distrito Federal/);
});

test("elegir otra coincidencia carga el pronóstico de ese lugar", async () => {
  const { app, doc, r } = nuevo();
  await app.iniciar();
  await buscar(doc, "Caracas");
  await doc.getElementById("lugares").porEtiqueta("button")[1].disparar("click");
  assert.equal(pronosticos(r).at(-1).searchParams.get("longitude"), String(leer("geocodificacion.json").results[1].longitude));
});

test("una búsqueda sin resultados lo dice y conserva el pronóstico anterior", async () => {
  const { app, doc, texto } = nuevo({ geocodificacion: "geocodificacion-vacia.json" });
  await app.iniciar();
  await buscar(doc, "zzzzqqqxx");
  assert.match(texto("aviso"), /No se encontró/);
  assert.match(texto("actual"), /Caracas/);
});

test("un texto demasiado corto pide más letras sin llamar a la red", async () => {
  const { app, doc, r, texto } = nuevo();
  await app.iniciar();
  const antes = r.llamadas.length;
  await buscar(doc, "a");
  assert.match(texto("aviso"), /al menos 2 letras/);
  assert.equal(r.llamadas.length, antes);
});

test("si falla la geocodificación se avisa y se puede reintentar", async () => {
  const { app, doc, r } = nuevo({ fallos: ["geocoding-api.open-meteo.com"] });
  await app.iniciar();
  await buscar(doc, "Caracas");
  const aviso = doc.getElementById("aviso");
  assert.equal(aviso.hidden, false);
  const antes = r.llamadas.length;
  await aviso.porEtiqueta("button")[0].disparar("click");
  assert.ok(r.llamadas.length > antes);
});

test("si falla el pronóstico se avisa y no se muestran datos viejos como nuevos", async () => {
  const { app, doc, texto } = nuevo({ fallos: ["api.open-meteo.com"] });
  await app.iniciar();
  assert.equal(doc.getElementById("aviso").hidden, false);
  assert.match(texto("actual"), /no disponible/i);
  assert.equal(doc.getElementById("dias").porEtiqueta("li").length, 0);
});

test("cambiar a Fahrenheit vuelve a pedir el pronóstico del mismo lugar con esa unidad", async () => {
  const { app, doc, r } = nuevo();
  await app.iniciar();
  const unidad = doc.getElementById("unidad");
  unidad.value = "fahrenheit";
  await unidad.disparar("change");
  const u = pronosticos(r).at(-1);
  assert.equal(u.searchParams.get("temperature_unit"), "fahrenheit");
  assert.equal(u.searchParams.get("latitude"), pronosticos(r)[0].searchParams.get("latitude"));
});

test("una unidad inválida en el selector se ignora", async () => {
  const { app, doc, r } = nuevo();
  await app.iniciar();
  const antes = r.llamadas.length;
  const unidad = doc.getElementById("unidad");
  unidad.value = "kelvin";
  await unidad.disparar("change");
  assert.equal(r.llamadas.length, antes);
});

test("Enter en el buscador equivale a pulsar Buscar", async () => {
  const { app, doc, r } = nuevo();
  await app.iniciar();
  doc.getElementById("buscador").value = "Caracas";
  await doc.getElementById("buscador").disparar("keydown", { key: "Enter", preventDefault() {} });
  assert.ok(r.llamadas.some((u) => u.host.startsWith("geocoding")));
});

test("solo se llama a los dos hosts de Open-Meteo", async () => {
  const { app, doc, r } = nuevo();
  await app.iniciar();
  await buscar(doc, "Caracas");
  assert.deepEqual([...new Set(r.llamadas.map((u) => u.host))].sort(), ["api.open-meteo.com", "geocoding-api.open-meteo.com"]);
});

test("una respuesta lenta que llega después de otra más nueva no la pisa", async () => {
  const doc = crearDocumentoFalso(IDS);
  const base = leer("pronostico.json");
  const lenta = { ...base, current: { ...base.current, temperature_2m: 10 } };
  const rapida = { ...base, current: { ...base.current, temperature_2m: 80 }, current_units: { ...base.current_units, temperature_2m: "°F" } };
  let soltarLenta;
  let llamada = 0;
  const fetch = () => {
    llamada++;
    if (llamada === 1) return new Promise((resolver) => { soltarLenta = () => resolver(respuesta(lenta)); });
    return Promise.resolve(respuesta(rapida));
  };
  const app = crearApp({ doc, fetch });
  const inicio = app.iniciar();
  const unidad = doc.getElementById("unidad");
  unidad.value = "fahrenheit";
  await unidad.disparar("change");
  soltarLenta();
  await inicio;
  assert.match(doc.getElementById("actual").textContent, /80 °F/);
  assert.doesNotMatch(doc.getElementById("actual").textContent, /10 °C/);
});
