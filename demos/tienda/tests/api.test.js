import test from "node:test";
import assert from "node:assert/strict";
import { pedirJson, ErrorDeRed } from "../lib/api.js";

const respuesta = (cuerpo, { status = 200 } = {}) => ({ ok: status >= 200 && status < 300, status, json: async () => (typeof cuerpo === "function" ? cuerpo() : cuerpo) });

test("devuelve el JSON de una respuesta correcta y pasa una señal de cancelación", async () => {
  let señal;
  const fetch = async (url, opciones) => { señal = opciones.signal; return respuesta({ a: 1 }); };
  assert.deepEqual(await pedirJson("https://api.open-meteo.com/v1/forecast", { fetch }), { a: 1 });
  assert.ok(señal instanceof AbortSignal);
});

test("un estado HTTP de error lanza ErrorDeRed con el estado", async () => {
  const fetch = async () => respuesta({}, { status: 503 });
  await assert.rejects(pedirJson("https://fakestoreapi.com/products", { fetch }), (e) => e instanceof ErrorDeRed && e.estado === 503);
});

test("un JSON inválido lanza ErrorDeRed", async () => {
  const fetch = async () => respuesta(() => { throw new SyntaxError("Unexpected token <"); });
  await assert.rejects(pedirJson("https://fakestoreapi.com/products", { fetch }), (e) => e instanceof ErrorDeRed && /JSON/.test(e.message));
});

test("un fallo de conexión se convierte en ErrorDeRed", async () => {
  const fetch = async () => { throw new TypeError("Failed to fetch"); };
  await assert.rejects(pedirJson("https://fakestoreapi.com/products", { fetch }), ErrorDeRed);
});

test("cancela la petición y lanza ErrorDeRed cuando se supera el tiempo límite", async () => {
  const fetch = (url, { signal }) => new Promise((_, rechazar) => {
    signal.addEventListener("abort", () => rechazar(new DOMException("aborted", "AbortError")));
  });
  await assert.rejects(pedirJson("https://fakestoreapi.com/products", { fetch, tiempoMs: 20 }), (e) => e instanceof ErrorDeRed && /tiempo/i.test(e.message));
});

test("rechaza URL que no son https sin llamar a fetch", async () => {
  let llamadas = 0;
  const fetch = async () => { llamadas++; return respuesta({}); };
  for (const u of ["http://fakestoreapi.com/products", "javascript:alert(1)", "//fakestoreapi.com/x", "no-es-url"]) {
    await assert.rejects(pedirJson(u, { fetch }), ErrorDeRed, u);
  }
  assert.equal(llamadas, 0);
});

test("no envía cookies ni credenciales", async () => {
  let opciones;
  const fetch = async (u, o) => { opciones = o; return respuesta({}); };
  await pedirJson("https://fakestoreapi.com/products", { fetch });
  assert.equal(opciones.credentials, "omit");
  assert.equal(opciones.referrerPolicy, "no-referrer");
});
