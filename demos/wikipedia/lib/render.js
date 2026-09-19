import { boton, el } from "../../compartido/dom.js";
import { urlHistorial } from "./wikipedia.js";

const imagen = (doc, url, clase, alt = "") => el(doc, "img", { clase, atributos: { src: url, alt, loading: "lazy", referrerpolicy: "no-referrer" } });

export function pintarSugerencias(doc, contenedor, sugerencias, alElegir) {
  contenedor.replaceChildren(...sugerencias.map((s) => boton(doc, s, `Buscar ${s}`, () => alElegir(s), "chip")));
}

export function pintarCoincidencias(doc, contenedor, lista, claveElegida, alElegir) {
  contenedor.replaceChildren(
    el(doc, "p", { clase: "etiqueta", texto: `Coincidencias encontradas (${lista.length})` }),
    el(doc, "ul", { clase: "coincidencias-lista" }, ...lista.map((c) => {
      const boton_ = el(doc, "button", { clase: "coincidencia-boton", atributos: { type: "button", "aria-pressed": String(c.clave === claveElegida) } },
        c.miniatura ? imagen(doc, c.miniatura, "coincidencia-foto") : el(doc, "span", { clase: "coincidencia-foto sin-foto", atributos: { "aria-hidden": "true" } }),
        el(doc, "span", { clase: "coincidencia-texto" },
          el(doc, "span", { clase: "coincidencia-titulo", texto: c.titulo }),
          el(doc, "span", { clase: "coincidencia-descripcion", texto: c.descripcion || "Sin descripción" })));
      boton_.addEventListener("click", () => alElegir(c));
      return el(doc, "li", { clase: c.clave === claveElegida ? "coincidencia elegida" : "coincidencia" }, boton_);
    })));
}

export function pintarResumen(doc, contenedor, r) {
  const historial = urlHistorial(r.canonico);
  const enlace = (texto, href, clase) => el(doc, "a", { clase, texto, atributos: { href, target: "_blank", rel: "noopener noreferrer" } });
  contenedor.replaceChildren(el(doc, "article", { clase: "resumen-tarjeta" },
    el(doc, "p", { clase: "etiqueta acento", texto: r.ambiguo ? "Tema con varios significados" : "Síntesis de Wikipedia" }),
    el(doc, "h2", { texto: r.titulo }),
    ...(r.descripcion ? [el(doc, "p", { clase: "resumen-descripcion", texto: r.descripcion })] : []),
    el(doc, "div", { clase: r.imagen ? "resumen-cuerpo con-imagen" : "resumen-cuerpo" },
      el(doc, "p", { clase: "resumen-texto", texto: r.extracto || "Este artículo todavía no tiene resumen." }),
      ...(r.imagen ? [imagen(doc, r.imagen, "resumen-imagen", `Imagen principal de ${r.titulo}`)] : [])),
    ...(r.ambiguo ? [el(doc, "p", { clase: "resumen-ambiguo", texto: "Es una página de desambiguación: abrí el artículo para elegir el significado que buscás." })] : []),
    el(doc, "div", { clase: "resumen-acciones" }, ...(r.articulo ? [enlace("Leer el artículo completo", r.articulo, "boton-enlace")] : [])),
    el(doc, "p", { clase: "atribucion" },
      el(doc, "span", { texto: "Texto de Wikipedia, bajo licencia " }),
      enlace("CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/deed.es"),
      el(doc, "span", { texto: ". " }),
      enlace("Ver historial y autores", historial),
      el(doc, "span", { texto: "." }))));
}

export function pintarInicio(doc, contenedor, sugerencias, alElegir) {
  const chips = el(doc, "div", { clase: "chips" });
  pintarSugerencias(doc, chips, sugerencias.slice(0, 3), alElegir);
  contenedor.replaceChildren(el(doc, "div", { clase: "estado" },
    el(doc, "p", { clase: "etiqueta acento", texto: "Todavía no buscaste nada" }),
    el(doc, "h2", { texto: "Probá con estos temas" }),
    el(doc, "p", { clase: "panel-ayuda", texto: "Un personaje, un lugar, una comida o cualquier concepto: te mostramos la síntesis y el enlace al artículo completo." }),
    chips));
}

export function pintarSinResultados(doc, contenedor, texto) {
  contenedor.replaceChildren(el(doc, "div", { clase: "estado sin-resultados" },
    el(doc, "p", { clase: "etiqueta rojo", texto: "Sin coincidencias" }),
    el(doc, "h2", { texto: "No encontramos ese tema" }),
    el(doc, "p", { clase: "panel-ayuda", texto: `No hay resultados para «${texto}». Revisá la ortografía o probá con términos más generales.` })));
}
