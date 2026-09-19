import { boton, el } from "../../compartido/dom.js";
import { etiquetaLugar, formatearGrados, nombreDia } from "./clima.js";

const porcentaje = (v) => (Number.isFinite(v) ? `${Math.round(v)} %` : "—");

export function pintarActual(doc, contenedor, lugar, actual) {
  if (!actual) {
    contenedor.replaceChildren(el(doc, "p", { clase: "vacio", texto: "Pronóstico no disponible por ahora." }));
    return;
  }
  const dato = (texto) => el(doc, "li", { texto });
  contenedor.replaceChildren(
    el(doc, "h2", { texto: etiquetaLugar(lugar) }),
    el(doc, "p", { clase: "temperatura", texto: formatearGrados(actual.temperatura, actual.unidad) }),
    el(doc, "p", { clase: "condicion", texto: actual.descripcion }),
    el(doc, "ul", { clase: "datos" },
      dato(`Sensación de ${formatearGrados(actual.sensacion, actual.unidad)}`),
      dato(`Humedad ${porcentaje(actual.humedad)}`),
      dato(`Viento ${Number.isFinite(actual.viento) ? Math.round(actual.viento) : "—"} km/h`)));
}

export function pintarDias(doc, contenedor, dias, unidad) {
  const hoy = dias[0]?.fecha ?? "";
  contenedor.replaceChildren(...(dias.length === 0 ? [] : [el(doc, "ul", { clase: "dias" }, ...dias.map((d) => el(doc, "li", { clase: "dia" },
    el(doc, "span", { clase: "dia-nombre", texto: nombreDia(d.fecha, hoy) }),
    el(doc, "span", { clase: "dia-condicion", texto: d.descripcion }),
    el(doc, "span", { clase: "dia-lluvia", texto: `Lluvia ${porcentaje(d.lluvia)}` }),
    el(doc, "span", { clase: "dia-max", texto: formatearGrados(d.max, unidad) }),
    el(doc, "span", { clase: "dia-min", texto: formatearGrados(d.min, unidad) }))))]));
}

export function pintarLugares(doc, contenedor, lugares, alElegir, idActivo) {
  contenedor.replaceChildren(...lugares.map((l) => {
    const b = boton(doc, etiquetaLugar(l), `Ver el clima de ${etiquetaLugar(l)}`, () => alElegir(l), "chip");
    b.setAttribute("aria-pressed", String(l.id === idActivo));
    return b;
  }));
}
