import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { crearDocumentoFalso } from "../../compartido/tests/helpers/dom-falso.js";
import { crearApp } from "../lib/app.js";

const leer = (n) => JSON.parse(readFileSync(new URL(`./fixtures/${n}`, import.meta.url), "utf8"));
const IDS = ["aviso", "buscador", "buscar", "azar", "sugerencias", "coincidencias", "resumen"];
const respuesta = (cuerpo, status = 200) => ({ ok: status < 300, status, json: async () => cuerpo });

function nuevo({ fallos = [], vacia = false, sinArticulo = false } = {}) {
  const doc = crearDocumentoFalso(IDS);
  const llamadas = [];
  const fetch = async (url) => {
    const u = new URL(url);
    llamadas.push(u);
    if (fallos.some((f) => (u.pathname + u.search).includes(f))) return respuesta({}, 503);
    if (u.pathname === "/w/rest.php/v1/search/title") return respuesta(vacia ? { pages: [] } : leer("busqueda-arepa.json"));
    if (u.pathname === "/api/rest_v1/page/random/summary") return respuesta(leer("resumen-volcan.json"));
    if (u.pathname.startsWith("/api/rest_v1/page/summary/")) {
      if (sinArticulo) return respuesta({ title: "No existe" }, 404);
      return respuesta(u.pathname.endsWith("Mercurio") ? leer("resumen-mercurio.json") : leer("resumen-volcan.json"));
    }
    throw new Error(`ruta inesperada: ${u.pathname}`);
  };
  const app = crearApp({ doc, fetch });
  app.iniciar();
  return { doc, llamadas, texto: (id) => doc.getElementById(id).textContent };
}
const buscar = async (doc, texto) => { doc.getElementById("buscador").value = texto; await doc.getElementById("buscar").disparar("click"); };

test("al iniciar no llama a ninguna API y muestra el estado vacío con sugerencias", () => {
  const { llamadas, texto, doc } = nuevo();
  assert.equal(llamadas.length, 0);
  assert.match(texto("resumen"), /Todavía no buscaste nada/);
  assert.equal(doc.getElementById("sugerencias").porEtiqueta("button").length, 5);
});

test("buscar lista las coincidencias, elige la primera y muestra su resumen con atribución", async () => {
  const { doc, llamadas, texto } = nuevo();
  await buscar(doc, "arepa");
  assert.equal(llamadas[0].searchParams.get("q"), "arepa");
  assert.equal(llamadas[1].pathname, "/api/rest_v1/page/summary/Arepa");
  assert.match(texto("coincidencias"), /Coincidencias encontradas \(5\)/);
  assert.equal(doc.getElementById("coincidencias").porEtiqueta("li").length, 5);
  assert.equal(doc.getElementById("coincidencias").porEtiqueta("li")[0].className, "coincidencia elegida");
  assert.match(texto("resumen"), /CC BY-SA 4\.0/);
  assert.match(texto("resumen"), /Ver historial y autores/);
  const enlaces = doc.getElementById("resumen").porEtiqueta("a").map((a) => a.getAttribute("href"));
  assert.ok(enlaces.some((h) => h.startsWith("https://es.wikipedia.org/wiki/")));
  assert.ok(enlaces.some((h) => h.includes("action=history")));
  assert.ok(doc.getElementById("resumen").porEtiqueta("a").every((a) => a.getAttribute("rel") === "noopener noreferrer"));
});

test("elegir otra coincidencia cambia el resumen y la marca", async () => {
  const { doc, llamadas } = nuevo();
  await buscar(doc, "arepa");
  const botones = doc.getElementById("coincidencias").porEtiqueta("button");
  await botones[1].disparar("click");
  assert.equal(llamadas.at(-1).pathname, "/api/rest_v1/page/summary/Arepa_de_choclo");
  assert.equal(doc.getElementById("coincidencias").porEtiqueta("li")[1].className, "coincidencia elegida");
  assert.equal(doc.getElementById("coincidencias").porEtiqueta("li")[0].className, "coincidencia");
});

test("una sugerencia rellena el buscador y busca", async () => {
  const { doc, llamadas } = nuevo();
  await doc.getElementById("sugerencias").porEtiqueta("button")[1].disparar("click");
  assert.equal(doc.getElementById("buscador").value, "Volcán");
  assert.equal(llamadas[0].searchParams.get("q"), "Volcán");
});

test("una búsqueda demasiado corta avisa y no llama a la red", async () => {
  const { doc, llamadas, texto } = nuevo();
  await buscar(doc, "a");
  assert.equal(llamadas.length, 0);
  assert.match(texto("aviso"), /al menos 2 letras/);
});

test("sin coincidencias dice que no encontró el tema", async () => {
  const { doc, texto } = nuevo({ vacia: true });
  await buscar(doc, "zzzqxw");
  assert.match(texto("resumen"), /No encontramos ese tema/);
  assert.match(texto("resumen"), /zzzqxw/);
  assert.equal(texto("coincidencias"), "");
});

test("si el artículo elegido no existe (404) muestra el estado sin resultados", async () => {
  const { doc, texto } = nuevo({ sinArticulo: true });
  await buscar(doc, "arepa");
  assert.match(texto("resumen"), /No encontramos ese tema/);
});

test("artículo al azar muestra su resumen y limpia la lista", async () => {
  const { doc, llamadas, texto } = nuevo();
  await buscar(doc, "arepa");
  await doc.getElementById("azar").disparar("click");
  assert.equal(llamadas.at(-1).pathname, "/api/rest_v1/page/random/summary");
  assert.equal(texto("coincidencias"), "");
  assert.match(texto("resumen"), /Volcán/);
});

test("una página de desambiguación se avisa como tal", async () => {
  const doc = crearDocumentoFalso(IDS);
  const fetch = async (url) => respuesta(new URL(url).pathname.includes("search") ? { pages: [{ key: "Mercurio", title: "Mercurio", description: "" }] } : leer("resumen-mercurio.json"));
  crearApp({ doc, fetch }).iniciar();
  await buscar(doc, "mercurio");
  assert.match(doc.getElementById("resumen").textContent, /varios significados/);
  assert.match(doc.getElementById("resumen").textContent, /desambiguación/);
});

test("si falla la búsqueda avisa y permite reintentar", async () => {
  const { doc, llamadas } = nuevo({ fallos: ["search/title"] });
  await buscar(doc, "arepa");
  const aviso = doc.getElementById("aviso");
  assert.equal(aviso.hidden, false);
  await aviso.porEtiqueta("button")[0].disparar("click");
  assert.equal(llamadas.length, 2);
});

test("si falla el resumen avisa, conserva la lista y permite reintentar", async () => {
  const { doc, llamadas, texto } = nuevo({ fallos: ["summary/Arepa"] });
  await buscar(doc, "arepa");
  assert.match(texto("aviso"), /No se pudo cargar el artículo/);
  assert.equal(doc.getElementById("coincidencias").porEtiqueta("li").length, 5);
  const antes = llamadas.length;
  await doc.getElementById("aviso").porEtiqueta("button")[0].disparar("click");
  assert.equal(llamadas.length, antes + 1);
});

test("una respuesta más lenta de una búsqueda vieja no pisa a la nueva", async () => {
  const doc = crearDocumentoFalso(IDS);
  const pendientes = [];
  const fetch = (url) => new Promise((resolver) => pendientes.push({ url: new URL(url), resolver }));
  crearApp({ doc, fetch }).iniciar();
  doc.getElementById("buscador").value = "primera";
  const p1 = doc.getElementById("buscar").disparar("click");
  doc.getElementById("buscador").value = "segunda";
  const p2 = doc.getElementById("buscar").disparar("click");
  pendientes[1].resolver(respuesta({ pages: [{ key: "Segunda", title: "Segunda", description: "" }] }));
  await new Promise((r) => setTimeout(r));
  pendientes[0].resolver(respuesta({ pages: [{ key: "Primera", title: "Primera", description: "" }] }));
  await new Promise((r) => setTimeout(r));
  const resumenes = pendientes.filter((p) => p.url.pathname.includes("/summary/"));
  assert.equal(resumenes.length, 1);
  assert.match(resumenes[0].url.pathname, /Segunda$/);
  resumenes[0].resolver(respuesta(leer("resumen-volcan.json")));
  await Promise.all([p1, p2]);
  assert.match(doc.getElementById("coincidencias").textContent, /Segunda/);
  assert.doesNotMatch(doc.getElementById("coincidencias").textContent, /Primera/);
});
