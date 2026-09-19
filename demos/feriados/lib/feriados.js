import { ANIO_MAXIMO, ANIO_MINIMO, PAISES } from "./config.js";

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const mes = new Intl.DateTimeFormat("es-VE", { month: "long", timeZone: "UTC" });
const diaSemana = new Intl.DateTimeFormat("es-VE", { weekday: "long", timeZone: "UTC" });
const fechaLarga = new Intl.DateTimeFormat("es-VE", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

const aUtc = (iso) => new Date(`${iso}T00:00:00Z`);

export function urlFeriados(pais, anio) {
  if (!PAISES.some(([codigo]) => codigo === pais)) throw new RangeError("País no admitido");
  if (!Number.isInteger(anio) || anio < ANIO_MINIMO || anio > ANIO_MAXIMO) throw new RangeError("Año fuera de rango");
  return `https://date.nager.at/api/v3/PublicHolidays/${anio}/${pais}`;
}

// Deja solo feriados de todo el país (los regionales traen `global: false`), sin duplicados y en orden de fecha.
export function normalizarFeriados(lista) {
  if (!Array.isArray(lista)) throw new TypeError("Se esperaba una lista de feriados");
  const vistos = new Set();
  return lista
    .filter((f) => f && typeof f.date === "string" && FORMATO_FECHA.test(f.date) && f.global !== false)
    .map((f) => ({ fecha: f.date, nombre: String(f.localName || f.name || "Feriado") }))
    .filter((f) => { const clave = `${f.fecha}|${f.nombre}`; if (vistos.has(clave)) return false; vistos.add(clave); return true; })
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function hoyIso(fecha = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}`;
}

export const diasHasta = (fecha, hoy) => Math.round((aUtc(fecha) - aUtc(hoy)) / 86_400_000);

export const proximoFeriado = (feriados, hoy) => feriados.find((f) => f.fecha >= hoy) ?? null;

export const nombreMes = (fecha) => mes.format(aUtc(fecha));
export const nombreDiaSemana = (fecha) => diaSemana.format(aUtc(fecha));
export const fechaCompleta = (fecha) => fechaLarga.format(aUtc(fecha));

export function agruparPorMes(feriados) {
  const grupos = [];
  for (const f of feriados) {
    const clave = f.fecha.slice(0, 7);
    if (grupos.at(-1)?.clave !== clave) grupos.push({ clave, mes: nombreMes(f.fecha), feriados: [] });
    grupos.at(-1).feriados.push(f);
  }
  return grupos;
}

export function textoFaltan(dias) {
  if (dias === 0) return "Es hoy";
  if (dias === 1) return "Es mañana";
  return `Faltan ${dias} días`;
}

// Un feriado en lunes o viernes arma un fin de semana de tres días; los demás no se marcan.
export const esFinDeSemanaLargo = (fecha) => [1, 5].includes(aUtc(fecha).getUTCDay());

// Evita que Excel o Calc interpreten un texto de la API como fórmula (=, +, -, @) y escapa comillas.
const celda = (v) => {
  const t = String(v).replace(/[\r\n]+/g, " ");
  const seguro = /^[=+\-@\t]/.test(t) ? `'${t}` : t;
  return `"${seguro.replaceAll('"', '""')}"`;
};

export function generarCsv(feriados, pais, anio) {
  const filas = feriados.map((f) => [f.fecha, nombreDiaSemana(f.fecha), f.nombre, esFinDeSemanaLargo(f.fecha) ? "sí" : "no"].map(celda).join(","));
  return ["fecha,dia,feriado,fin_de_semana_largo", ...filas].join("\n") + "\n";
}

export const nombreArchivoCsv = (pais, anio) => `feriados-${pais}-${anio}.csv`;

export function resumenAnual(feriados, hoy) {
  const largos = feriados.filter((f) => esFinDeSemanaLargo(f.fecha));
  return { total: feriados.length, largos: largos.length, proximoPuente: largos.find((f) => f.fecha >= hoy) ?? null };
}

export const diaYMes = (fecha) => `${Number(fecha.slice(8))} de ${nombreMes(fecha)}`;
export const abreviaturaDia = (fecha) => nombreDiaSemana(fecha).slice(0, 3);
export const abreviaturaMes = (fecha) => nombreMes(fecha).slice(0, 3);
