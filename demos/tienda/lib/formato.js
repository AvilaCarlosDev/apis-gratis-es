const numero = new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fechaLarga = new Intl.DateTimeFormat("es-VE", { day: "numeric", month: "long", timeZone: "America/Caracas" });

const monto = (prefijo, v) => (typeof v === "number" && Number.isFinite(v) ? `${prefijo} ${numero.format(v)}` : `${prefijo} —`);

export const formatearUsd = (v) => monto("US$", v);
export const formatearBs = (v) => monto("Bs.", v);

export function formatearFechaLarga(iso) {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? "" : fechaLarga.format(fecha);
}
