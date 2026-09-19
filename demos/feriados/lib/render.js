import { el } from "../../compartido/dom.js";
import { agruparPorMes, diasHasta, fechaCompleta, nombreDiaSemana, textoFaltan } from "./feriados.js";

export function pintarProximo(doc, contenedor, proximo, hoy) {
  if (!proximo) {
    contenedor.replaceChildren();
    return;
  }
  contenedor.replaceChildren(
    el(doc, "h2", { texto: "Próximo feriado" }),
    el(doc, "p", { clase: "proximo-nombre", texto: proximo.nombre }),
    el(doc, "p", { clase: "proximo-fecha", texto: fechaCompleta(proximo.fecha) }),
    el(doc, "p", { clase: "proximo-faltan", texto: textoFaltan(diasHasta(proximo.fecha, hoy)) }));
}

export function pintarLista(doc, contenedor, feriados, hoy) {
  if (feriados.length === 0) {
    contenedor.replaceChildren(el(doc, "p", { clase: "vacio", texto: "No hay feriados publicados para este año." }));
    return;
  }
  contenedor.replaceChildren(...agruparPorMes(feriados).map((g) => el(doc, "section", { clase: "mes" },
    el(doc, "h3", { texto: g.mes }),
    el(doc, "ul", { clase: "feriados" }, ...g.feriados.map((f) => el(doc, "li", { clase: f.fecha < hoy ? "feriado pasado" : "feriado" },
      el(doc, "span", { clase: "feriado-dia", texto: String(Number(f.fecha.slice(8))) }),
      el(doc, "span", { clase: "feriado-semana", texto: nombreDiaSemana(f.fecha) }),
      el(doc, "span", { clase: "feriado-nombre", texto: f.nombre })))))));
}
