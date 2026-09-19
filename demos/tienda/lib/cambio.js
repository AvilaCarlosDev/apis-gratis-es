export class ErrorDeTasa extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorDeTasa";
  }
}

export function tasaOficial(json) {
  if (!Array.isArray(json)) throw new ErrorDeTasa("DolarAPI no devolvió una lista");
  const oficial = json.find((x) => x?.moneda === "USD" && x?.fuente === "oficial");
  if (!oficial) throw new ErrorDeTasa("DolarAPI no incluye la tasa oficial del dólar");
  if (typeof oficial.promedio !== "number" || !Number.isFinite(oficial.promedio) || oficial.promedio <= 0) throw new ErrorDeTasa("La tasa oficial no es un número positivo");
  return { bsPorUsd: oficial.promedio, actualizadaEl: String(oficial.fechaActualizacion ?? "") };
}

export function convertir(usd, bsPorUsd) {
  if (!Number.isFinite(usd) || usd < 0) throw new RangeError("El monto debe ser un número no negativo");
  if (!Number.isFinite(bsPorUsd) || bsPorUsd <= 0) throw new RangeError("La tasa debe ser un número positivo");
  return Math.round((usd * bsPorUsd + Number.EPSILON) * 100) / 100;
}
