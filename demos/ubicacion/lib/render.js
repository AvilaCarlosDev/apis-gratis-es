import { el } from "../../compartido/dom.js";
import { formatearCoordenadas, formatearGrados, horaLocal, urlMapaIncrustado, urlOpenStreetMap } from "./ubicacion.js";

const enlaceMapa = (doc, latitud, longitud, texto) => el(doc, "a", { texto, atributos: { href: urlOpenStreetMap(latitud, longitud), target: "_blank", rel: "noopener noreferrer" } });

export function pintarLugares(doc, contenedor, lugares) {
  if (lugares.length === 0) {
    contenedor.replaceChildren(el(doc, "p", { clase: "vacio", texto: "No se encontró ese lugar. Probá con otro nombre." }));
    return;
  }
  contenedor.replaceChildren(el(doc, "ul", { clase: "lugares-lista" }, ...lugares.map((l) => el(doc, "li", { clase: "lugar" },
    el(doc, "p", { clase: "etiqueta", texto: "Lugar encontrado" }),
    el(doc, "h3", { texto: l.nombre }),
    el(doc, "p", { clase: "lugar-direccion", texto: l.direccion || "Sin dirección" }),
    el(doc, "dl", { clase: "lugar-formatos" },
      el(doc, "div", { clase: "dato" }, el(doc, "dt", { texto: "Coordenadas decimales" }), el(doc, "dd", { clase: "lugar-coordenadas", texto: formatearCoordenadas(l.latitud, l.longitud) })),
      el(doc, "div", { clase: "dato" }, el(doc, "dt", { texto: "Grados, minutos y segundos" }), el(doc, "dd", { clase: "lugar-grados", texto: formatearGrados(l.latitud, l.longitud) }))),
    el(doc, "p", { clase: "lugar-mapa" }, enlaceMapa(doc, l.latitud, l.longitud, "Ver en OpenStreetMap"))))));
}

export function pintarIp(doc, contenedor, datos, ahora = new Date()) {
  const ficha = (etiqueta, valor) => (valor ? [el(doc, "div", { clase: "dato" }, el(doc, "dt", { texto: etiqueta }), el(doc, "dd", { texto: valor }))] : []);
  const lugar = [datos.ciudad, datos.region].filter(Boolean).join(", ") || datos.pais || "Lugar desconocido";
  const hora = horaLocal(datos.zona, ahora);
  const conMapa = datos.latitud !== null && datos.longitud !== null;
  const etiquetaPais = [datos.codigo, datos.pais].filter(Boolean).join(" · ");
  const mapa = conMapa
    ? el(doc, "div", { clase: "mapa" },
      el(doc, "iframe", { atributos: { src: urlMapaIncrustado(datos.latitud, datos.longitud), title: "Mapa de tu ubicación aproximada", loading: "lazy", referrerpolicy: "no-referrer" } }),
      el(doc, "p", { clase: "mapa-pie" },
        el(doc, "span", { texto: `${formatearCoordenadas(datos.latitud, datos.longitud)} · ${formatearGrados(datos.latitud, datos.longitud)} · ` }),
        enlaceMapa(doc, datos.latitud, datos.longitud, "Abrir en OpenStreetMap")))
    : null;
  contenedor.replaceChildren(
    el(doc, "p", { clase: "segun", texto: "Según tu conexión a la red, estás en:" }),
    el(doc, "p", { clase: "lugar-grande" },
      el(doc, "span", { texto: lugar }),
      ...(datos.bandera ? [el(doc, "span", { clase: "bandera", texto: ` ${datos.bandera}`, atributos: { "aria-hidden": "true" } })] : []),
      ...(etiquetaPais ? [el(doc, "span", { clase: "marca pais", texto: etiquetaPais })] : [])),
    el(doc, "div", { clase: mapa ? "telemetria con-mapa" : "telemetria" },
      el(doc, "div", { clase: "registro" },
        el(doc, "p", { clase: "etiqueta", texto: "Registro de telemetría" }),
        el(doc, "dl", { clase: "fichas" },
          ...ficha("IP pública", datos.ip),
          ...ficha("Proveedor", datos.proveedor),
          ...ficha("Zona horaria", [datos.zona, datos.utc && `UTC${datos.utc}`].filter(Boolean).join(" ")),
          ...ficha("Hora local", hora),
          ...ficha("Prefijo del país", datos.prefijo && `+${datos.prefijo}`),
          ...ficha("Código postal", datos.postal)),
        el(doc, "p", { clase: "ip-nota", texto: "Es una estimación a partir de tu conexión: puede caer en otra ciudad, o en otro país si usás una VPN." })),
      ...(mapa ? [mapa] : [])));
}
