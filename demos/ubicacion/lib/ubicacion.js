import { LIMITE_LUGARES, MAXIMO_TEXTO, MINIMO_TEXTO } from "./config.js";

const esNumero = (v) => typeof v === "number" && Number.isFinite(v);

export class ErrorDeUbicacion extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorDeUbicacion";
  }
}

export function urlBusqueda(texto) {
  const limpio = typeof texto === "string" ? texto.trim().replace(/\s+/g, " ") : "";
  if (limpio.length < MINIMO_TEXTO) throw new RangeError(`Escribe al menos ${MINIMO_TEXTO} letras`);
  return `https://photon.komoot.io/api/?q=${encodeURIComponent(limpio.slice(0, MAXIMO_TEXTO))}&limit=${LIMITE_LUGARES}`;
}

const coordenadasValidas = (lat, lon) => esNumero(lat) && esNumero(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;

// Photon devuelve GeoJSON: las coordenadas van en orden [longitud, latitud].
export function normalizarLugares(geojson) {
  if (!Array.isArray(geojson?.features)) throw new ErrorDeUbicacion("Respuesta de lugares inesperada");
  return geojson.features.flatMap((f) => {
    const [lon, lat] = f?.geometry?.coordinates ?? [];
    const p = f?.properties ?? {};
    if (!coordenadasValidas(lat, lon)) return [];
    const partes = [p.street, p.district, p.city, p.county, p.state, p.country].filter((t) => typeof t === "string" && t.trim());
    const direccion = [...new Set(partes)].join(", ");
    return [{ nombre: String(p.name || p.street || "Lugar sin nombre"), direccion, latitud: lat, longitud: lon }];
  });
}

export function urlOpenStreetMap(latitud, longitud) {
  if (!coordenadasValidas(latitud, longitud)) throw new RangeError("Coordenadas fuera de rango");
  const lat = latitud.toFixed(5);
  const lon = longitud.toFixed(5);
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;
}

export const formatearCoordenadas = (lat, lon) => `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

// La bandera se calcula desde el código de país (dos letras) en vez de confiar en el texto de la API.
export function banderaEmoji(codigo) {
  if (typeof codigo !== "string" || !/^[A-Za-z]{2}$/.test(codigo)) return "";
  return [...codigo.toUpperCase()].map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join("");
}

export function normalizarIp(datos) {
  if (!datos || datos.success !== true) throw new ErrorDeUbicacion("No se pudo ubicar la conexión");
  const texto = (v) => (typeof v === "string" && v.trim() ? v.trim() : "");
  return {
    pais: texto(datos.country),
    bandera: banderaEmoji(datos.country_code),
    region: texto(datos.region),
    ciudad: texto(datos.city),
    zona: texto(datos.timezone?.id),
    utc: texto(datos.timezone?.utc),
    prefijo: texto(datos.calling_code),
  };
}
