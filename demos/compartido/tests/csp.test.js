import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const leer = (ruta) => readFileSync(new URL(`../../${ruta}`, import.meta.url), "utf8");
const base = leer("compartido/base.css");

const DEMOS = {
  tienda: { conexiones: ["https://dummyjson.com", "https://fakestoreapi.com", "https://ve.dolarapi.com"], imagenes: ["https://cdn.dummyjson.com", "https://fakestoreapi.com"] },
  clima: { conexiones: ["https://api.open-meteo.com", "https://geocoding-api.open-meteo.com"], imagenes: [] },
  ubicacion: { conexiones: ["https://ipwho.is", "https://photon.komoot.io"], imagenes: [], marcos: ["https://www.openstreetmap.org"] },
  feriados: { conexiones: ["https://date.nager.at"], imagenes: [] },
};

for (const [demo, permitido] of Object.entries(DEMOS)) {
  const html = leer(`${demo}/index.html`);
  const css = leer(`${demo}/estilos.css`);
  const csp = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/)?.[1] ?? "";
  const directiva = (nombre) => csp.split(";").map((d) => d.trim()).find((d) => d.startsWith(`${nombre} `)) ?? "";
  const hosts = (nombre) => directiva(nombre).split(/\s+/).slice(1).sort();

  test(`${demo}: declara una política de seguridad de contenido`, () => assert.ok(csp.length > 0));

  test(`${demo}: solo ejecuta scripts propios, sin inline ni eval`, () => {
    assert.equal(directiva("script-src"), "script-src 'self'");
    assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/);
    assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/i);
    assert.doesNotMatch(html, /\son[a-z]+\s*=/i);
  });

  test(`${demo}: connect-src permite únicamente sus APIs`, () => {
    assert.deepEqual(hosts("connect-src"), ["'self'", ...permitido.conexiones].sort());
  });

  test(`${demo}: img-src permite solo los hosts de imágenes que necesita`, () => {
    assert.deepEqual(hosts("img-src"), ["'self'", ...permitido.imagenes].sort());
  });

  test(`${demo}: frame-src permite solo los marcos que necesita`, () => {
    const esperado = permitido.marcos ?? [];
    assert.deepEqual(hosts("frame-src"), esperado.slice().sort());
    if (!esperado.length) assert.doesNotMatch(csp, /frame-src/);
  });

  test(`${demo}: sin plugins, sin base ni formularios externos`, () => {
    assert.equal(directiva("object-src"), "object-src 'none'");
    assert.equal(directiva("base-uri"), "base-uri 'none'");
    assert.equal(directiva("form-action"), "form-action 'none'");
  });

  test(`${demo}: fuentes y estilos son locales y usa el estilo compartido`, () => {
    assert.equal(directiva("font-src"), "font-src 'self'");
    assert.equal(directiva("style-src"), "style-src 'self'");
    assert.match(html, /href="\.\.\/compartido\/base\.css"/);
    assert.doesNotMatch(html + css + base, /fonts\.googleapis|fonts\.gstatic/);
    assert.doesNotMatch(css, /url\(/, "las rutas de fuentes viven en base.css");
  });

  test(`${demo}: declara idioma y viewport`, () => {
    assert.match(html, /<html lang="es"/);
    assert.match(html, /name="viewport"/);
  });
}

test("el estilo compartido respeta movimiento reducido, modo oscuro y foco visible, y su fuente es local", () => {
  assert.match(base, /prefers-reduced-motion/);
  assert.match(base, /prefers-color-scheme:\s*dark/);
  assert.match(base, /:focus-visible/);
  assert.doesNotMatch(base, /url\((?!["']?\.\/fuentes\/)/);
});
