import { boton, el } from "../../compartido/dom.js";
import { etiquetaLugar, formatearGrados, nombreDia, rangoDia } from "./clima.js";

const porcentaje = (v) => (Number.isFinite(v) ? `${Math.round(v)} %` : "—");
// Ícono dibujado con CSS según el tipo de cielo; es decorativo, el texto ya dice la condición.
const icono = (doc, tipo, extra = "") => el(doc, "span", { clase: `icono icono-${tipo ?? "desconocido"}${extra}`, atributos: { "aria-hidden": "true" } },
  el(doc, "span", { clase: "icono-sol" }), el(doc, "span", { clase: "icono-nube" }), el(doc, "span", { clase: "icono-gotas" }));

export function pintarActual(doc, contenedor, lugar, actual) {
  contenedor.setAttribute("data-cielo", actual?.tipo ?? "desconocido");
  if (!actual) {
    contenedor.replaceChildren(el(doc, "p", { clase: "vacio", texto: "Pronóstico no disponible por ahora." }));
    return;
  }
  const dato = (texto) => el(doc, "li", { texto });
  contenedor.replaceChildren(
    el(doc, "h2", { texto: etiquetaLugar(lugar) }),
    icono(doc, actual.tipo, " grande"),
    el(doc, "p", { clase: "temperatura", texto: formatearGrados(actual.temperatura, actual.unidad) }),
    el(doc, "p", { clase: "condicion", texto: actual.descripcion }),
    el(doc, "ul", { clase: "datos" },
      dato(`Sensación de ${formatearGrados(actual.sensacion, actual.unidad)}`),
      dato(`Humedad ${porcentaje(actual.humedad)}`),
      dato(`Viento ${Number.isFinite(actual.viento) ? Math.round(actual.viento) : "—"} km/h`)));
}

export function pintarDias(doc, contenedor, dias, unidad) {
  const hoy = dias[0]?.fecha ?? "";
  const minimas = dias.map((d) => d.min).filter(Number.isFinite);
  const maximas = dias.map((d) => d.max).filter(Number.isFinite);
  const minSemana = Math.min(...minimas);
  const maxSemana = Math.max(...maximas);
  const fila = (d) => {
    const barra = el(doc, "span", { clase: "rango", atributos: { "aria-hidden": "true" } }, el(doc, "span", { clase: "rango-relleno" }));
    const r = rangoDia(d.min, d.max, minSemana, maxSemana);
    if (r) {
      barra.style?.setProperty("--desde", `${r.desde}%`);
      barra.style?.setProperty("--hasta", `${r.hasta}%`);
    } else barra.classList.add("sin-dato");
    return el(doc, "li", { clase: "dia" },
      el(doc, "span", { clase: "dia-nombre", texto: nombreDia(d.fecha, hoy) }),
      icono(doc, d.tipo),
      el(doc, "span", { clase: "dia-texto" },
        el(doc, "span", { clase: "dia-condicion", texto: d.descripcion }),
        el(doc, "span", { clase: "dia-lluvia", texto: `Lluvia ${porcentaje(d.lluvia)}` })),
      el(doc, "span", { clase: "dia-min", texto: formatearGrados(d.min, unidad) }),
      barra,
      el(doc, "span", { clase: "dia-max", texto: formatearGrados(d.max, unidad) }));
  };
  contenedor.replaceChildren(...(dias.length === 0 ? [] : [el(doc, "ul", { clase: "dias" }, ...dias.map(fila))]));
}

export function pintarLugares(doc, contenedor, lugares, alElegir, idActivo) {
  contenedor.replaceChildren(...lugares.map((l) => {
    const b = boton(doc, etiquetaLugar(l), `Ver el clima de ${etiquetaLugar(l)}`, () => alElegir(l), "chip");
    b.setAttribute("aria-pressed", String(l.id === idActivo));
    return b;
  }));
}
