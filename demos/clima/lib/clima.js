export class ErrorDePronostico extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorDePronostico";
  }
}

export class ErrorDeGeocodificacion extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorDeGeocodificacion";
  }
}

// Códigos WMO que usa Open-Meteo: https://open-meteo.com/en/docs#weather_variable_documentation
const DESCRIPCIONES = new Map([
  [0, "Despejado"], [1, "Mayormente despejado"], [2, "Parcialmente nublado"], [3, "Nublado"],
  [45, "Niebla"], [48, "Niebla con escarcha"],
  [51, "Llovizna ligera"], [53, "Llovizna"], [55, "Llovizna intensa"],
  [61, "Lluvia ligera"], [63, "Lluvia"], [65, "Lluvia intensa"],
  [71, "Nevada ligera"], [73, "Nevada"], [75, "Nevada intensa"],
  [80, "Chubascos ligeros"], [81, "Chubascos"], [82, "Chubascos violentos"],
  [95, "Tormenta eléctrica"], [96, "Tormenta con granizo"], [99, "Tormenta con granizo fuerte"],
]);

export const descripcionClima = (codigo) => DESCRIPCIONES.get(codigo) ?? "Condición desconocida";

const esNumero = (v) => typeof v === "number" && Number.isFinite(v);
const numeroONulo = (v) => (esNumero(v) ? v : null);

export function urlPronostico(lugar, unidad) {
  if (!esNumero(lugar?.latitud) || Math.abs(lugar.latitud) > 90) throw new RangeError("Latitud fuera de rango");
  if (!esNumero(lugar.longitud) || Math.abs(lugar.longitud) > 180) throw new RangeError("Longitud fuera de rango");
  const fahrenheit = unidad === "fahrenheit" ? "&temperature_unit=fahrenheit" : "";
  return "https://api.open-meteo.com/v1/forecast"
    + `?latitude=${lugar.latitud}&longitude=${lugar.longitud}`
    + "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m"
    + "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
    + `&timezone=auto&forecast_days=7${fahrenheit}`;
}

export function resumenPronostico(json) {
  const actual = json?.current;
  if (!esNumero(actual?.temperature_2m)) throw new ErrorDePronostico("Open-Meteo no devolvió la temperatura actual");
  const diario = json.daily;
  const fechas = diario?.time;
  const series = ["weather_code", "temperature_2m_max", "temperature_2m_min", "precipitation_probability_max"].map((k) => diario?.[k]);
  if (!Array.isArray(fechas) || series.some((s) => !Array.isArray(s) || s.length !== fechas.length)) throw new ErrorDePronostico("Open-Meteo no devolvió el pronóstico diario completo");
  const [codigos, maximas, minimas, lluvias] = series;
  return {
    actual: {
      temperatura: actual.temperature_2m,
      sensacion: numeroONulo(actual.apparent_temperature),
      humedad: numeroONulo(actual.relative_humidity_2m),
      viento: numeroONulo(actual.wind_speed_10m),
      unidad: json.current_units?.temperature_2m ?? "°C",
      descripcion: descripcionClima(actual.weather_code),
    },
    dias: fechas.map((fecha, i) => ({ fecha, max: numeroONulo(maximas[i]), min: numeroONulo(minimas[i]), lluvia: numeroONulo(lluvias[i]), descripcion: descripcionClima(codigos[i]) })),
  };
}

export function urlGeocodificacion(texto) {
  const nombre = typeof texto === "string" ? texto.trim() : "";
  if (nombre.length < 2) throw new RangeError("Se necesitan al menos 2 letras");
  return `https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({ name: nombre, count: "5", language: "es", format: "json" })}`;
}

export function lugaresDe(json) {
  if (json === null || typeof json !== "object") throw new ErrorDeGeocodificacion("Open-Meteo no devolvió un objeto");
  // Sin coincidencias la API omite "results" en vez de devolver una lista vacía.
  if (json.results === undefined) return [];
  if (!Array.isArray(json.results)) throw new ErrorDeGeocodificacion("Open-Meteo devolvió resultados con otra forma");
  return json.results
    .filter((r) => r !== null && typeof r === "object" && typeof r.name === "string" && esNumero(r.latitude) && esNumero(r.longitude))
    .map((r) => ({ id: r.id, nombre: r.name, region: r.admin1 ?? "", pais: r.country ?? "", latitud: r.latitude, longitud: r.longitude, zona: r.timezone ?? "" }));
}

export const etiquetaLugar = (lugar) => [...new Set([lugar.nombre, lugar.region, lugar.pais].filter((x) => typeof x === "string" && x !== ""))].join(", ");

const dia = new Intl.DateTimeFormat("es-VE", { weekday: "long", timeZone: "UTC" });
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

export function nombreDia(fecha, hoy) {
  if (!FECHA.test(fecha) || !FECHA.test(hoy)) return "";
  if (fecha === hoy) return "Hoy";
  const manana = new Date(`${hoy}T12:00:00Z`);
  manana.setUTCDate(manana.getUTCDate() + 1);
  if (fecha === manana.toISOString().slice(0, 10)) return "Mañana";
  return dia.format(new Date(`${fecha}T12:00:00Z`));
}

export const formatearGrados = (valor, unidad) => (esNumero(valor) ? `${Math.round(valor)} ${unidad}` : "—");
