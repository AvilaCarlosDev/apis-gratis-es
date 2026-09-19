import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";

const raiz = new URL("../../../", import.meta.url);
const portada = readFileSync(new URL("index.html", raiz), "utf8");
const demos = readdirSync(new URL("demos/", raiz), { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(new URL(`demos/${d.name}/index.html`, raiz))).map((d) => d.name);

test("hay al menos dos demos con página propia", () => assert.ok(demos.length >= 2, demos.join(",")));

test("la portada enlaza cada demo, para no olvidar ninguna al agregar una nueva", () => {
  for (const d of demos) assert.match(portada, new RegExp(`href="\\./demos/${d}/"`), `falta ${d}`);
});

test("cada demo tiene README en español e inglés", () => {
  for (const d of demos) {
    assert.ok(existsSync(new URL(`demos/${d}/README.md`, raiz)), `${d}/README.md`);
    assert.ok(existsSync(new URL(`demos/${d}/README.en.md`, raiz)), `${d}/README.en.md`);
  }
});

test("la portada no ejecuta scripts ni se conecta a nada", () => {
  const csp = portada.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/)?.[1] ?? "";
  assert.match(csp, /default-src 'none'/);
  assert.doesNotMatch(csp, /script-src|connect-src/);
  assert.doesNotMatch(portada, /<script/i);
  assert.match(portada, /<html lang="es"/);
});
