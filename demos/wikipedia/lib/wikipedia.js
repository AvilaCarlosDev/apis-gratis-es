import { esUrlPermitida, limitarTexto } from "../../compartido/seguro.js";
import { HOSTS_API, HOSTS_IMAGENES, LIMITE_COINCIDENCIAS, MAXIMO_EXTRACTO, MAXIMO_TEXTO, MINIMO_TEXTO } from "./config.js";

export class ErrorDeWikipedia extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorDeWikipedia";
  }
}

const esTexto = (v) => typeof v === "string" && v.trim() !== "";

export function urlBusqueda(texto) {
  const limpio = typeof texto === "string" ? texto.trim().replace(/\s+/g, " ") : "";
  if (limpio.length < MINIMO_TEXTO) throw new RangeError(`Escribe al menos ${MINIMO_TEXTO} letras`);
  return `https://es.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(limpio.slice(0, MAXIMO_TEXTO))}&limit=${LIMITE_COINCIDENCIAS}`;
}

export function urlResumen(clave) {
  if (!esTexto(clave) || clave.length > 200) throw new RangeError("Título inválido");
  return `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(clave)}`;
}

// El historial de un artículo: sirve para acreditar a sus autores, como pide la licencia CC BY-SA.
export function urlHistorial(titulo) {
  if (!esTexto(titulo) || titulo.length > 200) throw new RangeError("Título inválido");
  return `https://es.wikipedia.org/w/index.php?title=${encodeURIComponent(titulo.replaceAll(" ", "_"))}&action=history`;
}

// La búsqueda devuelve las miniaturas sin protocolo ("//thumb.wikimedia.org/..."): se completa y se valida el host.
function urlImagen(valor) {
  if (typeof valor !== "string") return "";
  const completa = valor.startsWith("//") ? `https:${valor}` : valor;
  return esUrlPermitida(completa, HOSTS_IMAGENES) ? completa : "";
}

export function normalizarBusqueda(datos) {
  if (!Array.isArray(datos?.pages)) throw new ErrorDeWikipedia("Respuesta de búsqueda inesperada");
  return datos.pages.flatMap((p) => {
    if (!esTexto(p?.key) || !esTexto(p?.title)) return [];
    return [{ clave: p.key, titulo: limitarTexto(p.title, 120), descripcion: limitarTexto(p.description ?? "", 160), miniatura: urlImagen(p.thumbnail?.url) }];
  });
}

// Se usa `title` y nunca `displaytitle`: este último trae HTML.
export function normalizarResumen(datos) {
  if (!datos || !esTexto(datos.title) || typeof datos.extract !== "string") throw new ErrorDeWikipedia("Respuesta de resumen inesperada");
  const articulo = datos.content_urls?.desktop?.page;
  return {
    titulo: limitarTexto(datos.title, 120),
    canonico: esTexto(datos.titles?.canonical) ? datos.titles.canonical : datos.title,
    descripcion: limitarTexto(datos.description ?? "", 200),
    extracto: limitarTexto(datos.extract, MAXIMO_EXTRACTO),
    imagen: urlImagen(datos.thumbnail?.source),
    articulo: esUrlPermitida(articulo, HOSTS_API) ? articulo : "",
    ambiguo: datos.type === "disambiguation",
  };
}
