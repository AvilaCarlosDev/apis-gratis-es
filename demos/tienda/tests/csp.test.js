import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../estilos.css", import.meta.url), "utf8");
const csp = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/)?.[1] ?? "";
const directiva = (nombre) => csp.split(";").map((d) => d.trim()).find((d) => d.startsWith(`${nombre} `)) ?? "";

test("la página declara una política de seguridad de contenido", () => {
  assert.ok(csp.length > 0);
});

test("solo ejecuta scripts propios: sin inline, sin eval, sin hosts externos", () => {
  assert.equal(directiva("script-src"), "script-src 'self'");
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/);
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/i, "no debe haber scripts en línea");
  assert.doesNotMatch(html, /\son[a-z]+\s*=/i, "no debe haber manejadores on* en línea");
});

test("connect-src permite únicamente las cuatro APIs", () => {
  const hosts = directiva("connect-src").split(/\s+/).slice(1).sort();
  assert.deepEqual(hosts, ["'self'", "https://api.open-meteo.com", "https://dummyjson.com", "https://fakestoreapi.com", "https://ve.dolarapi.com"].sort());
});

test("img-src permite solo los hosts de imágenes de los productos", () => {
  const hosts = directiva("img-src").split(/\s+/).slice(1).sort();
  assert.deepEqual(hosts, ["'self'", "https://cdn.dummyjson.com", "https://fakestoreapi.com"].sort());
});

test("no permite plugins, marcos ni cambiar la base de la página", () => {
  assert.equal(directiva("object-src"), "object-src 'none'");
  assert.equal(directiva("base-uri"), "base-uri 'none'");
  assert.equal(directiva("frame-ancestors") === "" || directiva("frame-ancestors") === "frame-ancestors 'none'", true);
  assert.equal(directiva("form-action"), "form-action 'none'");
});

test("la fuente y los estilos son locales", () => {
  assert.equal(directiva("font-src"), "font-src 'self'");
  assert.equal(directiva("style-src"), "style-src 'self'");
  assert.doesNotMatch(css, /url\((?!["']?\.\/fuentes\/)/);
  assert.doesNotMatch(html + css, /fonts\.googleapis|fonts\.gstatic/);
});

test("declara idioma, viewport y respeta preferencias de movimiento y color", () => {
  assert.match(html, /<html lang="es"/);
  assert.match(html, /name="viewport"/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /prefers-color-scheme:\s*dark/);
  assert.match(css, /:focus-visible/);
});
