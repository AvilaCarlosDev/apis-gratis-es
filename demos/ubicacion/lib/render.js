import { el } from "../../compartido/dom.js";
import { formatearCoordenadas, formatearGrados, horaLocal, urlMapaIncrustado, urlOpenStreetMap } from "./ubicacion.js";

export function pintarLugares(doc, contenedor, lugares) {
  if (lugares.length === 0) {
    contenedor.replaceChildren(el(doc, "p", { clase: "vacio", texto: "No se encontró ese lugar. Prueba con otro nombre." }));
    return;
  }
  contenedor.replaceChildren(el(doc, "ul", { clase: "lugares-lista" }, ...lugares.map((l) => el(doc, "li", { clase: "lugar" },
    el(doc, "h3", { texto: l.nombre }),
    el(doc, "p", { clase: "lugar-direccion", texto: l.direccion || "Sin dirección" }),
    el(doc, "p", { clase: "lugar-coordenadas", texto: formatearCoordenadas(l.latitud, l.longitud) }),
    el(doc, "p", { clase: "lugar-coordenadas lugar-grados", texto: formatearGrados(l.latitud, l.longitud) }),
    el(doc, "a", { clase: "lugar-mapa", texto: "Ver en OpenStreetMap", atributos: { href: urlOpenStreetMap(l.latitud, l.longitud), target: "_blank", rel: "noopener noreferrer" } })))));
}

export function pintarIp(doc, contenedor, datos, ahora = new Date()) {
  const ficha = (etiqueta, valor) => (valor ? [el(doc, "div", { clase: "ficha" }, el(doc, "dt", { texto: etiqueta }), el(doc, "dd", { texto: valor }))] : []);
  const lugar = [datos.ciudad, datos.region, datos.pais].filter(Boolean).join(", ");
  const hora = horaLocal(datos.zona, ahora);
  const conMapa = datos.latitud !== null && datos.longitud !== null;
  const mapa = conMapa
    ? el(doc, "div", { clase: "mapa" },
      el(doc, "iframe", { atributos: { src: urlMapaIncrustado(datos.latitud, datos.longitud), title: "Mapa de tu ubicación aproximada", loading: "lazy", referrerpolicy: "no-referrer" } }),
      el(doc, "p", { clase: "mapa-pie" },
        el(doc, "span", { texto: `${formatearCoordenadas(datos.latitud, datos.longitud)} · ${formatearGrados(datos.latitud, datos.longitud)} · ` }),
        el(doc, "a", { texto: "Abrir en OpenStreetMap", atributos: { href: urlOpenStreetMap(datos.latitud, datos.longitud), target: "_blank", rel: "noopener noreferrer" } })))
    : null;
  contenedor.replaceChildren(
    el(doc, "div", { clase: mapa ? "ip-resultado con-mapa" : "ip-resultado" },
      el(doc, "div", { clase: "ip-texto" },
        el(doc, "p", { clase: "ip-pais", texto: `${datos.bandera} ${lugar}`.trim() || "Lugar desconocido" }),
        el(doc, "dl", { clase: "fichas" },
          ...ficha("IP pública", datos.ip),
          ...ficha("Zona horaria", [datos.zona, datos.utc && `UTC${datos.utc}`].filter(Boolean).join(" ")),
          ...ficha("Hora local", hora),
          ...ficha("Prefijo telefónico", datos.prefijo && `+${datos.prefijo}`),
          ...ficha("Proveedor", datos.proveedor),
          ...ficha("Código postal", datos.postal)),
        el(doc, "p", { clase: "ip-nota", texto: "Es una estimación a partir de tu conexión, a nivel de ciudad o de la central de tu proveedor: puede diferir decenas de kilómetros de tu puerta, o caer en otro país si usas una VPN." })),
      ...(mapa ? [mapa] : [])));
}
