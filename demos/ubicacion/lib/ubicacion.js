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
    codigo: /^[A-Za-z]{2}$/.test(datos.country_code ?? "") ? datos.country_code.toUpperCase() : "",
    region: texto(datos.region),
    ciudad: texto(datos.city),
    zona: texto(datos.timezone?.id),
    utc: texto(datos.timezone?.utc),
    prefijo: texto(datos.calling_code),
    ip: texto(datos.ip),
    proveedor: texto(datos.connection?.isp) || texto(datos.connection?.org),
    postal: texto(datos.postal),
    latitud: esNumero(datos.latitude) ? datos.latitude : null,
    longitud: esNumero(datos.longitude) ? datos.longitude : null,
  };
}

// Mapa incrustado de OpenStreetMap: recuadro de ~0,02° alrededor del punto y un marcador.
export function urlMapaIncrustado(latitud, longitud) {
  if (!coordenadasValidas(latitud, longitud)) throw new RangeError("Coordenadas fuera de rango");
  const d = 0.02;
  const caja = [longitud - d, latitud - d, longitud + d, latitud + d].map((n) => n.toFixed(5)).join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(caja)}&layer=mapnik&marker=${latitud.toFixed(5)}%2C${longitud.toFixed(5)}`;
}

function grados(valor, positivo, negativo) {
  const abs = Math.abs(valor);
  const g = Math.floor(abs);
  const minutos = (abs - g) * 60;
  const m = Math.floor(minutos);
  const seg = ((minutos - m) * 60).toFixed(1);
  return `${g}° ${m}' ${seg}" ${valor >= 0 ? positivo : negativo}`;
}

export function formatearGrados(lat, lon) {
  if (!coordenadasValidas(lat, lon)) throw new RangeError("Coordenadas fuera de rango");
  return `${grados(lat, "N", "S")}, ${grados(lon, "E", "O")}`;
}

// Hora local en la zona que informa la API; si la zona no es válida, devuelve "".
export function horaLocal(zona, ahora = new Date()) {
  try {
    return new Intl.DateTimeFormat("es-VE", { timeStyle: "medium", hourCycle: "h23", timeZone: zona }).format(ahora);
  } catch {
    return "";
  }
}
