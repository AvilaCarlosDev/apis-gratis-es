import test from "node:test";
import assert from "node:assert/strict";
import { crearDocumentoFalso } from "./helpers/dom-falso.js";
import { pintarMensaje } from "../dom.js";

test("pintarMensaje muestra el texto, marca el rol y ofrece reintentar", async () => {
  const doc = crearDocumentoFalso(["msg"]);
  let reintentos = 0;
  pintarMensaje(doc, doc.getElementById("msg"), "No se pudieron cargar los productos.", () => reintentos++);
  const m = doc.getElementById("msg");
  assert.equal(m.getAttribute("role"), "alert");
  assert.match(m.textContent, /No se pudieron cargar/);
  await m.porEtiqueta("button")[0].disparar("click");
  assert.equal(reintentos, 1);
});

test("pintarMensaje sin texto limpia y oculta el aviso", () => {
  const doc = crearDocumentoFalso(["msg"]);
  pintarMensaje(doc, doc.getElementById("msg"), "algo", null);
  pintarMensaje(doc, doc.getElementById("msg"), "", null);
  assert.equal(doc.getElementById("msg").textContent, "");
  assert.equal(doc.getElementById("msg").hidden, true);
});
