# Changelog

All notable changes to this project are documented in this file. / Todos los cambios relevantes del proyecto se documentan en este archivo.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The project is a living catalog rather than versioned software, so entries are grouped by date. / El proyecto es un catálogo vivo y no software con versiones, así que las entradas se agrupan por fecha.

## 2026-09-19

### Added / Añadido

- Machine-readable catalog with schema, validator and a verifier that makes real calls; keyless APIs verified and rejected candidates recorded with evidence. / Catálogo legible por máquinas con esquema, validador y verificador con llamadas reales; APIs sin clave verificadas y candidatas descartadas con evidencia.
- README tables generated from the catalog, in Spanish and English. / Tablas del README generadas desde el catálogo, en español e inglés.
- Live demos: shop with prices in dollars and bolívares, weather, holidays, location and Wikipedia ("Enciclopedia al paso"), with a landing page and shared code. / Demos en vivo: tienda con precios en dólares y bolívares, clima, feriados, ubicación y Wikipedia («Enciclopedia al paso»), con portada y código compartido.
- Loading skeletons in the shop and weather demos. / Esqueletos de carga en las demos de tienda y clima.
- Test that verifies the checkable claims of the README. / Prueba que verifica las afirmaciones comprobables del README.
- CI: tests, secret scanning (gitleaks), AI-watermark check, weekly verification and link checks. / CI: pruebas, escaneo de secretos (gitleaks), verificación de marcas de agua de IA, verificación semanal y de enlaces.

### Changed / Cambiado

- Data re-verified on 2026-09-19; credits to FreeLLMAPI; bilingual README. / Datos reverificados el 2026-09-19; créditos a FreeLLMAPI; README bilingüe.
- Redesign of the landing and the demos. / Rediseño de la portada y de las demos.
- Python bytecode is no longer versioned; `.gitignore` added. / Se deja de versionar el bytecode de Python y se añade `.gitignore`.

### Fixed / Corregido

- Demo tests use a glob so `node --test` works on Node 22. / Las pruebas de las demos usan glob para que `node --test` funcione en Node 22.
- Link check accepts the 307 from consoles that require login. / La revisión de enlaces acepta el 307 de las consolas con inicio de sesión.

## 2026-09-17

### Added / Añadido

- FreeLLMAPI and Cerebras added; limits re-verified. / Se añaden FreeLLMAPI y Cerebras; límites reverificados.

### Fixed / Corregido

- Broken links to CONTRIBUTING and SECURITY. / Enlaces rotos a CONTRIBUTING y SECURITY.

## 2026-09-14

### Added / Añadido

- MIT license. / Licencia MIT.

## 2026-05-12

### Added / Añadido

- Security policy. / Política de seguridad.

## 2026-05-06

### Added / Añadido

- First README with a list of free AI APIs in Spanish, with more than 20 providers, detailed limits and examples. / Primer README con la lista de APIs de IA gratuitas en español, con más de 20 proveedores, límites detallados y ejemplos.
