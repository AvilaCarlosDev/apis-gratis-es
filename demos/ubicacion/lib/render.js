import { el } from "../../compartido/dom.js";
import { formatearCoordenadas, urlOpenStreetMap } from "./ubicacion.js";

export function pintarLugares(doc, contenedor, lugares) {
  if (lugares.length === 0) {
    contenedor.replaceChildren(el(doc, "p", { clase: "vacio", texto: "No se encontró ese lugar. Prueba con otro nombre." }));
    return;
  }
  contenedor.replaceChildren(el(doc, "ul", { clase: "lugares-lista" }, ...lugares.map((l) => el(doc, "li", { clase: "lugar" },
    el(doc, "h3", { texto: l.nombre }),
    el(doc, "p", { clase: "lugar-direccion", texto: l.direccion || "Sin dirección" }),
    el(doc, "p", { clase: "lugar-coordenadas", texto: formatearCoordenadas(l.latitud, l.longitud) }),
    el(doc, "a", { clase: "lugar-mapa", texto: "Ver en OpenStreetMap", atributos: { href: urlOpenStreetMap(l.latitud, l.longitud), target: "_blank", rel: "noopener noreferrer" } })))));
}

export function pintarIp(doc, contenedor, datos) {
  const fila = (etiqueta, valor) => (valor ? [el(doc, "dt", { texto: etiqueta }), el(doc, "dd", { texto: valor })] : []);
  const lugar = [datos.ciudad, datos.region].filter(Boolean).join(", ");
  contenedor.replaceChildren(
    el(doc, "p", { clase: "ip-pais", texto: `${datos.bandera} ${datos.pais}`.trim() || "País desconocido" }),
    el(doc, "dl", { clase: "ip-datos" },
      ...fila("Ciudad y región", lugar),
      ...fila("Zona horaria", [datos.zona, datos.utc && `UTC${datos.utc}`].filter(Boolean).join(" ")),
      ...fila("Prefijo telefónico", datos.prefijo && `+${datos.prefijo}`)),
    el(doc, "p", { clase: "ip-nota", texto: "Es una estimación a partir de tu conexión: puede caer en otra ciudad, o en otro país si usas una VPN." }));
}
