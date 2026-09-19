import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { agruparPorMes, diasHasta, fechaCompleta, hoyIso, normalizarFeriados, proximoFeriado, textoFaltan, urlFeriados } from "../lib/feriados.js";

const crudo = JSON.parse(readFileSync(new URL("./fixtures/ve-2026.json", import.meta.url), "utf8"));

test("urlFeriados arma la URL del catálogo", () => {
  assert.equal(urlFeriados("VE", 2026), "https://date.nager.at/api/v3/PublicHolidays/2026/VE");
});

test("urlFeriados rechaza países fuera del selector y años fuera de rango", () => {
  assert.throws(() => urlFeriados("XX", 2026), RangeError);
  assert.throws(() => urlFeriados("VE/../x", 2026), RangeError);
  assert.throws(() => urlFeriados("VE", 1999), RangeError);
  assert.throws(() => urlFeriados("VE", 2026.5), RangeError);
  assert.throws(() => urlFeriados("VE", "2026"), RangeError);
});

test("normalizarFeriados usa el nombre local, ordena por fecha y descarta los regionales y los malformados", () => {
  const lista = normalizarFeriados([
    { date: "2026-12-25", localName: "Navidad", name: "Christmas Day", global: true },
    { date: "2026-01-01", localName: "Año Nuevo", name: "New Year's Day", global: true },
    { date: "2026-03-03", localName: "Solo un estado", name: "Regional", global: false },
    { date: "no-es-fecha", localName: "Roto" },
    { date: "2026-01-01", localName: "Año Nuevo", name: "New Year's Day", global: true },
    { date: "2026-05-01", name: "Labour Day" },
  ]);
  assert.deepEqual(lista, [
    { fecha: "2026-01-01", nombre: "Año Nuevo" },
    { fecha: "2026-05-01", nombre: "Labour Day" },
    { fecha: "2026-12-25", nombre: "Navidad" },
  ]);
});

test("normalizarFeriados exige una lista", () => {
  assert.throws(() => normalizarFeriados({ message: "error" }), TypeError);
});

test("con la respuesta real de Venezuela 2026 hay feriados ordenados y con nombre", () => {
  const lista = normalizarFeriados(crudo);
  assert.ok(lista.length >= 10);
  assert.deepEqual(lista.map((f) => f.fecha), lista.map((f) => f.fecha).sort());
  assert.ok(lista.every((f) => f.nombre.length > 0));
});

test("diasHasta cuenta días de calendario sin depender de la hora ni del horario de verano", () => {
  assert.equal(diasHasta("2026-03-09", "2026-03-09"), 0);
  assert.equal(diasHasta("2026-03-10", "2026-03-09"), 1);
  assert.equal(diasHasta("2026-11-02", "2026-11-01"), 1);
  assert.equal(diasHasta("2026-01-01", "2026-12-31"), -364);
});

test("proximoFeriado incluye el de hoy y devuelve null cuando ya pasaron todos", () => {
  const lista = [{ fecha: "2026-01-01", nombre: "A" }, { fecha: "2026-05-01", nombre: "B" }];
  assert.equal(proximoFeriado(lista, "2026-05-01").nombre, "B");
  assert.equal(proximoFeriado(lista, "2026-02-01").nombre, "B");
  assert.equal(proximoFeriado(lista, "2026-05-02"), null);
});

test("hoyIso usa la fecha local con ceros a la izquierda", () => {
  assert.equal(hoyIso(new Date(2026, 0, 5, 23, 59)), "2026-01-05");
});

test("agruparPorMes agrupa por mes en orden y nombra el mes en español", () => {
  const grupos = agruparPorMes([{ fecha: "2026-01-01", nombre: "A" }, { fecha: "2026-01-06", nombre: "B" }, { fecha: "2026-03-19", nombre: "C" }]);
  assert.deepEqual(grupos.map((g) => [g.mes, g.feriados.length]), [["enero", 2], ["marzo", 1]]);
});

test("textoFaltan distingue hoy, mañana y el resto", () => {
  assert.equal(textoFaltan(0), "Es hoy");
  assert.equal(textoFaltan(1), "Es mañana");
  assert.equal(textoFaltan(12), "Faltan 12 días");
});

test("fechaCompleta escribe el día de la semana sin correrse por la zona horaria", () => {
  assert.match(fechaCompleta("2026-01-01"), /jueves.*1.*enero/);
});

test("esFinDeSemanaLargo marca lunes y viernes, no el resto", async () => {
  const { esFinDeSemanaLargo } = await import("../lib/feriados.js");
  assert.equal(esFinDeSemanaLargo("2026-05-01"), true); // viernes
  assert.equal(esFinDeSemanaLargo("2026-06-24"), false); // miércoles
  assert.equal(esFinDeSemanaLargo("2026-04-06"), true); // lunes
  assert.equal(esFinDeSemanaLargo("2026-01-01"), false); // jueves
});

test("generarCsv escapa comillas y neutraliza fórmulas de hoja de cálculo", async () => {
  const { generarCsv } = await import("../lib/feriados.js");
  const csv = generarCsv([{ fecha: "2026-05-01", nombre: '=HYPERLINK("x")' }, { fecha: "2026-06-24", nombre: 'Día "de" San Juan, patrono' }], "VE", 2026);
  const filas = csv.trimEnd().split("\n");
  assert.equal(filas[0], "fecha,dia,feriado,fin_de_semana_largo");
  assert.equal(filas[1], `"2026-05-01","viernes","'=HYPERLINK(""x"")","sí"`);
  assert.equal(filas[2], `"2026-06-24","miércoles","Día ""de"" San Juan, patrono","no"`);
});

test("resumenAnual cuenta feriados y fines de semana largos y halla el próximo puente", async () => {
  const { resumenAnual } = await import("../lib/feriados.js");
  const lista = [{ fecha: "2026-01-01", nombre: "A" }, { fecha: "2026-02-16", nombre: "B" }, { fecha: "2026-05-01", nombre: "C" }];
  const r = resumenAnual(lista, "2026-03-01");
  assert.equal(r.total, 3);
  assert.equal(r.largos, 2);
  assert.equal(r.proximoPuente.nombre, "C");
  assert.equal(resumenAnual(lista, "2026-12-01").proximoPuente, null);
});
