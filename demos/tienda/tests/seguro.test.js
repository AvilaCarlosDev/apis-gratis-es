import test from "node:test";
import assert from "node:assert/strict";
import { esUrlPermitida, limitarTexto } from "../lib/seguro.js";

const HOSTS = ["fakestoreapi.com", "cdn.dummyjson.com"];

test("acepta una URL https de un host permitido", () => {
  assert.equal(esUrlPermitida("https://fakestoreapi.com/img/a.png", HOSTS), true);
  assert.equal(esUrlPermitida("https://cdn.dummyjson.com/product-images/x.webp", HOSTS), true);
});

test("rechaza http, aunque el host sea permitido", () => {
  assert.equal(esUrlPermitida("http://fakestoreapi.com/img/a.png", HOSTS), false);
});

test("rechaza esquemas peligrosos", () => {
  for (const u of ["javascript:alert(1)", "data:image/svg+xml;base64,PHN2Zz4=", "file:///etc/passwd", "blob:https://fakestoreapi.com/x"]) {
    assert.equal(esUrlPermitida(u, HOSTS), false, u);
  }
});

test("rechaza hosts que solo se parecen al permitido", () => {
  for (const u of ["https://fakestoreapi.com.evil.example/a.png", "https://evilfakestoreapi.com/a.png", "https://fakestoreapi.com@evil.example/a.png",
                   "https://evil.example/fakestoreapi.com/a.png", "https://sub.fakestoreapi.com/a.png"]) {
    assert.equal(esUrlPermitida(u, HOSTS), false, u);
  }
});

test("rechaza valores que no son una URL", () => {
  for (const v of [null, undefined, 42, {}, "", "no es una url", "//fakestoreapi.com/a.png"]) {
    assert.equal(esUrlPermitida(v, HOSTS), false, String(v));
  }
});

test("limitarTexto recorta, quita espacios y tolera valores que no son texto", () => {
  assert.equal(limitarTexto("  hola  ", 10), "hola");
  assert.equal(limitarTexto("x".repeat(200), 120).length, 120);
  assert.match(limitarTexto("x".repeat(200), 120), /…$/);
  assert.equal(limitarTexto(undefined, 10), "");
  assert.equal(limitarTexto(123, 10), "");
});
