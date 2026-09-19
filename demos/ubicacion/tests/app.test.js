import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { crearDocumentoFalso } from "../../compartido/tests/helpers/dom-falso.js";
import { crearApp } from "../lib/app.js";

const leer = (n) => JSON.parse(readFileSync(new URL(`./fixtures/${n}`, import.meta.url), "utf8"));
const IDS = ["aviso", "buscador", "buscar", "lugares", "ubicar", "ip"];
const respuesta = (cuerpo, status = 200) => ({ ok: status < 300, status, json: async () => cuerpo });

function nuevo({ fallos = [], ip = leer("ipwho-8-8-8-8.json") } = {}) {
  const doc = crearDocumentoFalso(IDS);
  const llamadas = [];
  const fetch = async (url) => {
    const u = new URL(url);
    llamadas.push(u);
    if (fallos.includes(u.host)) return respuesta({}, 503);
    if (u.host === "photon.komoot.io") return respuesta(leer("photon-caracas.json"));
    if (u.host === "ipwho.is") return respuesta(ip);
    throw new Error(`host inesperado: ${u.host}`);
  };
  const app = crearApp({ doc, fetch });
  app.iniciar();
  return { doc, llamadas, texto: (id) => doc.getElementById(id).textContent };
}
const buscar = async (doc, texto) => { doc.getElementById("buscador").value = texto; await doc.getElementById("buscar").disparar("click"); };

test("al iniciar no llama a ninguna API: la ubicación solo se pide al pulsar el botón", () => {
  const { llamadas } = nuevo();
  assert.equal(llamadas.length, 0);
});

test("buscar un lugar lista los resultados con su enlace al mapa", async () => {
  const { doc, llamadas, texto } = nuevo();
  await buscar(doc, "Caracas");
  assert.equal(llamadas.length, 1);
  assert.equal(llamadas[0].searchParams.get("q"), "Caracas");
  assert.equal(doc.getElementById("lugares").porEtiqueta("li").length, 5);
  const enlace = doc.getElementById("lugares").porEtiqueta("a")[0];
  assert.match(enlace.getAttribute("href"), /^https:\/\/www\.openstreetmap\.org\/\?mlat=/);
  assert.equal(enlace.getAttribute("rel"), "noopener noreferrer");
  assert.equal(doc.getElementById("aviso").hidden, true);
  assert.match(texto("lugares"), /Caracas/);
});

test("Enter en el buscador también busca", async () => {
  const { doc, llamadas } = nuevo();
  doc.getElementById("buscador").value = "Maracaibo";
  await doc.getElementById("buscador").disparar("keydown", { key: "Enter" });
  assert.equal(llamadas.length, 1);
});

test("un texto corto pide más letras sin llamar a la red", async () => {
  const { doc, llamadas, texto } = nuevo();
  await buscar(doc, "a");
  assert.match(texto("aviso"), /al menos 2 letras/);
  assert.equal(llamadas.length, 0);
});

test("si falla Photon avisa y permite reintentar", async () => {
  const { doc, llamadas } = nuevo({ fallos: ["photon.komoot.io"] });
  await buscar(doc, "Caracas");
  const aviso = doc.getElementById("aviso");
  assert.equal(aviso.hidden, false);
  await aviso.porEtiqueta("button")[0].disparar("click");
  assert.equal(llamadas.length, 2);
});

test("pulsar el botón estima la ubicación y muestra país, zona horaria y la advertencia", async () => {
  const { doc, llamadas, texto } = nuevo();
  await doc.getElementById("ubicar").disparar("click");
  assert.equal(llamadas.length, 1);
  assert.equal(llamadas[0].host, "ipwho.is");
  assert.match(texto("ip"), /United States/);
  assert.match(texto("ip"), /America\/Los_Angeles/);
  assert.match(texto("ip"), /estimación/);
  assert.equal(doc.getElementById("ubicar").disabled, false);
});

test("si falla ipwho.is avisa, reactiva el botón y no muestra datos", async () => {
  const { doc, texto } = nuevo({ fallos: ["ipwho.is"] });
  await doc.getElementById("ubicar").disparar("click");
  assert.match(texto("aviso"), /No se pudo estimar/);
  assert.equal(doc.getElementById("ubicar").disabled, false);
  assert.equal(texto("ip"), "");
});

test("una respuesta con success false se trata como error", async () => {
  const { doc, texto } = nuevo({ ip: { success: false, message: "rate limited" } });
  await doc.getElementById("ubicar").disparar("click");
  assert.match(texto("aviso"), /No se pudo estimar/);
  assert.equal(texto("ip"), "");
});
