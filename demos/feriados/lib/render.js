import { el } from "../../compartido/dom.js";
import { abreviaturaDia, abreviaturaMes, agruparPorMes, diaYMes, diasHasta, esFinDeSemanaLargo, fechaCompleta, nombreDiaSemana, nombreMes, resumenAnual, textoFaltan } from "./feriados.js";

const sinNumero = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

export function pintarProximo(doc, contenedor, proximo, hoy) {
  if (!proximo) {
    contenedor.replaceChildren();
    return;
  }
  const dias = diasHasta(proximo.fecha, hoy);
  contenedor.replaceChildren(el(doc, "div", { clase: "proximo-caja" },
    el(doc, "div", { clase: "proximo-cuerpo" },
      el(doc, "p", { clase: "proximo-marcas" },
        el(doc, "span", { clase: "marca", texto: "Próximo feriado nacional" }),
        ...(esFinDeSemanaLargo(proximo.fecha) ? [el(doc, "span", { clase: "marca oro", texto: "Fin de semana largo" })] : [])),
      el(doc, "div", { clase: "proximo-titular" },
        el(doc, "p", { clase: "proximo-dia", texto: String(Number(proximo.fecha.slice(8))), atributos: { "aria-hidden": "true" } }),
        el(doc, "div", {},
          el(doc, "p", { clase: "proximo-fecha", texto: fechaCompleta(proximo.fecha) }),
          el(doc, "h2", { clase: "proximo-nombre", texto: proximo.nombre })))),
    el(doc, "div", { clase: "proximo-cuenta" },
      el(doc, "p", { clase: "etiqueta", texto: "Tiempo restante" }),
      el(doc, "p", { clase: "proximo-numero", texto: String(dias) }),
      el(doc, "p", { clase: "proximo-faltan", texto: textoFaltan(dias) }))));
}

export function pintarResumen(doc, contenedor, feriados, hoy) {
  if (feriados.length === 0) {
    contenedor.replaceChildren();
    return;
  }
  const r = resumenAnual(feriados, hoy);
  const tarjeta = (etiqueta, grande, pie) => el(doc, "div", { clase: "tarjeta" },
    el(doc, "p", { clase: "etiqueta", texto: etiqueta }),
    el(doc, "p", { clase: "tarjeta-grande", texto: grande }),
    el(doc, "p", { clase: "tarjeta-pie", texto: pie }));
  contenedor.replaceChildren(
    tarjeta("Total del año", sinNumero(r.total, "feriado", "feriados"), "Solo los de todo el país, no los regionales."),
    tarjeta("Oportunidades de descanso", sinNumero(r.largos, "fin de semana largo", "fines de semana largos"), "Feriados que caen en lunes o viernes."),
    tarjeta("Próximo puente", r.proximoPuente ? diaYMes(r.proximoPuente.fecha) : "—", r.proximoPuente ? r.proximoPuente.nombre : "No quedan más este año."));
}

export function pintarLista(doc, contenedor, feriados, hoy) {
  if (feriados.length === 0) {
    contenedor.replaceChildren(el(doc, "p", { clase: "vacio", texto: "No hay feriados publicados para este año." }));
    return;
  }
  const estado = (fecha) => {
    const d = diasHasta(fecha, hoy);
    return d < 0 ? "Finalizado" : textoFaltan(d);
  };
  contenedor.replaceChildren(...agruparPorMes(feriados).map((g) => el(doc, "section", { clase: "mes" },
    el(doc, "h3", { clase: "mes-titulo" },
      el(doc, "span", { texto: g.mes }),
      el(doc, "span", { clase: "etiqueta", texto: sinNumero(g.feriados.length, "feriado", "feriados") })),
    el(doc, "ul", { clase: "feriados" }, ...g.feriados.map((f) => el(doc, "li", { clase: `feriado${f.fecha < hoy ? " pasado" : ""}${esFinDeSemanaLargo(f.fecha) ? " largo" : ""}` },
      el(doc, "span", { clase: "feriado-ficha", atributos: { title: nombreDiaSemana(f.fecha) } },
        el(doc, "span", { clase: "feriado-dia", texto: String(Number(f.fecha.slice(8))).padStart(2, "0") }),
        el(doc, "span", { clase: "feriado-semana", texto: `${abreviaturaDia(f.fecha)} · ${abreviaturaMes(f.fecha)}` })),
      el(doc, "span", { clase: "feriado-cuerpo" },
        el(doc, "span", { clase: "feriado-nombre", texto: f.nombre }),
        el(doc, "span", { clase: "feriado-dia-largo", texto: nombreDiaSemana(f.fecha) }),
        ...(esFinDeSemanaLargo(f.fecha) ? [el(doc, "span", { clase: "marca oro", texto: "Fin de semana largo" })] : [])),
      el(doc, "span", { clase: "feriado-estado", texto: estado(f.fecha) })))))));
}
