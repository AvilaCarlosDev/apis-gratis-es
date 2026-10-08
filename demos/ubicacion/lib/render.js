import { el } from "../../compartido/dom.js";
import { formatearCoordenadas, formatearGrados, formatearPrecision, horaLocal, urlOpenStreetMap } from "./ubicacion.js";

const enlaceMapa = (doc, latitud, longitud, texto) => el(doc, "a", { texto, atributos: { href: urlOpenStreetMap(latitud, longitud), target: "_blank", rel: "noopener noreferrer" } });
const ficha = (doc, etiqueta, valor, clase = "") => (valor ? [el(doc, "div", { clase: "dato" }, el(doc, "dt", { texto: etiqueta }), el(doc, "dd", { clase, texto: valor }))] : []);

function botonCopiar(doc, texto) {
  const b = el(doc, "button", { clase: "copiar", texto: "Copiar coordenadas", atributos: { type: "button" } });
  b.addEventListener("click", async () => {
    try {
      await globalThis.navigator.clipboard.writeText(texto);
      b.textContent = "Copiadas";
    } catch {
      b.textContent = "No se pudo copiar";
    }
  });
  return b;
}

// Cada resultado es una ficha numerada como su marcador; el nombre es un botón que lleva el mapa hasta el lugar.
// Devuelve las fichas para que la app pueda resaltar la elegida.
export function pintarLugares(doc, contenedor, lugares, { alElegir, etiqueta = "Lugar encontrado" } = {}) {
  if (lugares.length === 0) {
    contenedor.replaceChildren(el(doc, "p", { clase: "vacio", texto: "No se encontró ese lugar. Probá con otro nombre." }));
    return [];
  }
  const fichas = lugares.map((l, i) => {
    const coordenadas = formatearCoordenadas(l.latitud, l.longitud);
    const nombre = el(doc, "button", { clase: "lugar-elegir", texto: l.nombre, atributos: { type: "button" } });
    if (alElegir) nombre.addEventListener("click", () => alElegir(i));
    return el(doc, "li", { clase: "lugar" },
      el(doc, "span", { clase: "lugar-numero", texto: String(i + 1), atributos: { "aria-hidden": "true" } }),
      el(doc, "div", { clase: "lugar-cuerpo" },
        el(doc, "p", { clase: "etiqueta", texto: etiqueta }),
        el(doc, "h3", {}, nombre),
        el(doc, "p", { clase: "lugar-direccion", texto: l.direccion || "Sin dirección" }),
        el(doc, "dl", { clase: "lugar-formatos" },
          ...ficha(doc, "Decimales", coordenadas, "lugar-coordenadas"),
          ...ficha(doc, "Grados, minutos y segundos", formatearGrados(l.latitud, l.longitud), "lugar-grados")),
        el(doc, "p", { clase: "lugar-acciones" }, enlaceMapa(doc, l.latitud, l.longitud, "Ver en OpenStreetMap"), botonCopiar(doc, coordenadas))));
  });
  contenedor.replaceChildren(el(doc, "ul", { clase: "lugares-lista" }, ...fichas));
  return fichas;
}

export function pintarIp(doc, contenedor, datos, ahora = new Date()) {
  const lugar = [datos.ciudad, datos.region].filter(Boolean).join(", ") || datos.pais || "Lugar desconocido";
  const conMapa = datos.latitud !== null && datos.longitud !== null;
  const etiquetaPais = [datos.codigo, datos.pais].filter(Boolean).join(" · ");
  contenedor.replaceChildren(el(doc, "article", { clase: "tarjeta-yo" },
    el(doc, "p", { clase: "etiqueta", texto: "Según tu conexión a la red, estás en" }),
    el(doc, "p", { clase: "lugar-grande" },
      el(doc, "span", { texto: lugar }),
      ...(datos.bandera ? [el(doc, "span", { clase: "bandera", texto: ` ${datos.bandera}`, atributos: { "aria-hidden": "true" } })] : [])),
    ...(etiquetaPais ? [el(doc, "p", { clase: "marca pais", texto: etiquetaPais })] : []),
    el(doc, "dl", { clase: "fichas" },
      ...ficha(doc, "Coordenadas", conMapa ? formatearCoordenadas(datos.latitud, datos.longitud) : ""),
      ...ficha(doc, "IP pública", datos.ip),
      ...ficha(doc, "Proveedor", datos.proveedor),
      ...ficha(doc, "Zona horaria", [datos.zona, datos.utc && `UTC${datos.utc}`].filter(Boolean).join(" ")),
      ...ficha(doc, "Hora local", horaLocal(datos.zona, ahora)),
      ...ficha(doc, "Prefijo del país", datos.prefijo && `+${datos.prefijo}`),
      ...ficha(doc, "Código postal", datos.postal)),
    el(doc, "p", { clase: "ip-nota", texto: "Es una estimación a partir de tu conexión: puede caer en otra ciudad, o en otro país si usás una VPN. Para tu punto exacto, usá el GPS." }),
    ...(conMapa ? [el(doc, "p", { clase: "lugar-acciones" }, enlaceMapa(doc, datos.latitud, datos.longitud, "Abrir en OpenStreetMap"))] : [])));
}

// Posición del GPS del dispositivo; `cercano` es undefined mientras se busca la dirección y null si no hay ninguna.
export function pintarGps(doc, contenedor, { latitud, longitud, precision }, cercano) {
  const coordenadas = formatearCoordenadas(latitud, longitud);
  const direccion = cercano === undefined
    ? "Buscando la dirección más cercana…"
    : cercano ? [cercano.nombre, cercano.direccion].filter(Boolean).join(" · ") : "No hay una dirección conocida en este punto.";
  contenedor.replaceChildren(el(doc, "article", { clase: "tarjeta-yo gps" },
    el(doc, "p", { clase: "etiqueta", texto: "Tu posición por GPS" }),
    el(doc, "p", { clase: "lugar-grande", texto: coordenadas }),
    el(doc, "p", { clase: "gps-cerca", texto: direccion }),
    el(doc, "dl", { clase: "fichas" },
      ...ficha(doc, "Grados, minutos y segundos", formatearGrados(latitud, longitud)),
      ...ficha(doc, "Precisión", formatearPrecision(precision))),
    el(doc, "p", { clase: "lugar-acciones" }, enlaceMapa(doc, latitud, longitud, "Abrir en OpenStreetMap"), botonCopiar(doc, coordenadas))));
}
