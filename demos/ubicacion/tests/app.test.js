import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { crearDocumentoFalso } from "../../compartido/tests/helpers/dom-falso.js";
import { crearApp } from "../lib/app.js";

const leer = (n) => JSON.parse(readFileSync(new URL(`./fixtures/${n}`, import.meta.url), "utf8"));
const IDS = ["aviso", "buscador", "buscar", "lugares", "ubicar", "gps", "ip", "bienvenida"];
const respuesta = (cuerpo, status = 200) => ({ ok: status < 300, status, json: async () => cuerpo });

// Mapa falso: anota lo que la app le pide para comprobarlo sin dibujar nada.
function mapaFalso() {
  const pedidos = [];
  const m = { pedidos, pulsar: null };
  for (const metodo of ["marcar", "encuadrar", "irA", "resaltar", "acercar", "alejar"]) m[metodo] = (...args) => pedidos.push([metodo, ...args]);
  m.alPulsar = (fn) => { m.pulsar = fn; };
  m.ultimo = (metodo) => pedidos.filter((p) => p[0] === metodo).at(-1);
  return m;
}

function nuevo({ fallos = [], ip = leer("ipwho-8-8-8-8.json"), geolocalizacion = null, reversa = leer("photon-caracas.json") } = {}) {
  const doc = crearDocumentoFalso(IDS);
  const llamadas = [];
  const fetch = async (url) => {
    const u = new URL(url);
    llamadas.push(u);
    if (fallos.includes(u.host)) return respuesta({}, 503);
    if (u.host === "photon.komoot.io") return respuesta(u.pathname === "/reverse" ? reversa : leer("photon-caracas.json"));
    if (u.host === "ipwho.is") return respuesta(ip);
    throw new Error(`host inesperado: ${u.host}`);
  };
  const mapa = mapaFalso();
  const app = crearApp({ doc, fetch, mapa, geolocalizacion });
  app.iniciar();
  return { doc, llamadas, mapa, texto: (id) => doc.getElementById(id).textContent };
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

test("la ubicación estimada muestra IP y proveedor, y pone el punto azul con un círculo amplio en el mapa", async () => {
  const { doc, mapa, texto } = nuevo();
  await doc.getElementById("ubicar").disparar("click");
  assert.match(texto("ip"), /8\.8\.8\.8/);
  assert.match(texto("ip"), /Google LLC/);
  const [, grupo, [marca]] = mapa.ultimo("marcar");
  assert.equal(grupo, "yo");
  assert.equal(marca.tipo, "yo");
  assert.deepEqual([marca.lat, marca.lon], [37.3393939, -121.8949553]);
  assert.ok(marca.radioM >= 1000, "la IP no es precisa: el círculo es grande");
  assert.equal(mapa.ultimo("irA")[1], 37.3393939);
  assert.equal(doc.getElementById("bienvenida").hidden, true);
});

test("sin coordenadas en la respuesta no se marca el mapa", async () => {
  const { doc, mapa, texto } = nuevo({ ip: { success: true, country: "Chile", country_code: "CL", ip: "1.2.3.4" } });
  await doc.getElementById("ubicar").disparar("click");
  assert.match(texto("ip"), /Chile/);
  assert.equal(mapa.ultimo("marcar"), undefined);
});

test("la búsqueda pone un marcador numerado por resultado y encuadra el mapa", async () => {
  const { doc, mapa } = nuevo();
  await buscar(doc, "Caracas");
  const [, grupo, marcas] = mapa.ultimo("marcar");
  assert.equal(grupo, "lugares");
  assert.deepEqual(marcas.map((m) => m.numero), ["1", "2", "3", "4", "5"]);
  assert.equal(mapa.ultimo("encuadrar")[1].length, 5);
});

test("elegir un resultado lo resalta en la lista y lleva el mapa hasta él", async () => {
  const { doc, mapa } = nuevo();
  await buscar(doc, "Caracas");
  const lis = doc.getElementById("lugares").porEtiqueta("li");
  await lis[2].porEtiqueta("button")[0].disparar("click");
  assert.ok(lis[2].classList.contains("activa"));
  assert.ok(!lis[0].classList.contains("activa"));
  assert.deepEqual(mapa.ultimo("resaltar"), ["resaltar", 2]);
  assert.equal(mapa.ultimo("irA")[3], 16);
});

test("tocar el mapa consulta la búsqueda inversa y deja el marcador donde se tocó", async () => {
  const { mapa, llamadas, texto } = nuevo();
  await mapa.pulsar(10.49, -66.85);
  assert.equal(llamadas[0].pathname, "/reverse");
  assert.equal(llamadas[0].searchParams.get("lat"), "10.49000");
  assert.match(texto("lugares"), /Punto elegido en el mapa/);
  assert.match(texto("lugares"), /10\.4900, -66\.8500/);
  const [, , [marca]] = mapa.ultimo("marcar");
  assert.deepEqual([marca.lat, marca.lon], [10.49, -66.85]);
});

test("si la búsqueda inversa falla, avisa y no pinta datos viejos", async () => {
  const { mapa, texto } = nuevo({ fallos: ["photon.komoot.io"] });
  await mapa.pulsar(10.49, -66.85);
  assert.match(texto("aviso"), /No se pudo consultar ese punto/);
  assert.equal(texto("lugares"), "");
});

const gpsCon = (resultado) => ({
  pedidos: 0,
  getCurrentPosition(ok, mal, opciones) { this.pedidos++; this.opciones = opciones; return resultado.coords ? ok(resultado) : mal(resultado); },
});

test("el GPS solo se pide al pulsar, centra el mapa con su precisión y busca la dirección más cercana", async () => {
  const geo = gpsCon({ coords: { latitude: 10.4966, longitude: -66.8537, accuracy: 14 } });
  const { doc, mapa, llamadas, texto } = nuevo({ geolocalizacion: geo });
  assert.equal(geo.pedidos, 0);
  await doc.getElementById("gps").disparar("click");
  assert.equal(geo.pedidos, 1);
  assert.equal(geo.opciones.enableHighAccuracy, true);
  assert.match(texto("ip"), /10\.4966, -66\.8537/);
  assert.match(texto("ip"), /±14 m/);
  assert.equal(llamadas[0].pathname, "/reverse");
  assert.doesNotMatch(texto("ip"), /Buscando/);
  const [, grupo, [marca]] = mapa.ultimo("marcar");
  assert.equal(grupo, "yo");
  assert.equal(marca.radioM, 14);
  assert.equal(mapa.ultimo("irA")[3], 17);
  assert.equal(doc.getElementById("gps").disabled, false);
});

test("si se niega el permiso del GPS lo explica sin ofrecer reintentar ni llamar a la red", async () => {
  const { doc, llamadas, texto } = nuevo({ geolocalizacion: gpsCon({ code: 1 }) });
  await doc.getElementById("gps").disparar("click");
  assert.match(texto("aviso"), /No diste permiso/);
  assert.equal(doc.getElementById("aviso").porEtiqueta("button").length, 0);
  assert.equal(llamadas.length, 0);
  assert.equal(doc.getElementById("gps").disabled, false);
});

test("si el GPS tarda demasiado ofrece reintentar", async () => {
  const { doc, texto } = nuevo({ geolocalizacion: gpsCon({ code: 3 }) });
  await doc.getElementById("gps").disparar("click");
  assert.match(texto("aviso"), /tardó demasiado/);
  assert.equal(doc.getElementById("aviso").porEtiqueta("button").length, 1);
});

test("sin API de geolocalización avisa que use la IP", async () => {
  const { doc, texto } = nuevo();
  await doc.getElementById("gps").disparar("click");
  assert.match(texto("aviso"), /estimación por IP/);
});
