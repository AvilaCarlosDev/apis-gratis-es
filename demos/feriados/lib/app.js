import { pedirJson } from "../../compartido/api.js";
import { pintarMensaje } from "../../compartido/dom.js";
import { ANIO_MAXIMO, ANIO_MINIMO, PAIS_INICIAL } from "./config.js";
import { hoyIso, normalizarFeriados, proximoFeriado, urlFeriados } from "./feriados.js";
import { pintarLista, pintarProximo } from "./render.js";

export function crearApp({ doc, fetch, ahora = () => new Date() }) {
  const $ = (id) => doc.getElementById(id);
  const pedir = (url) => pedirJson(url, { fetch });
  const hoy = hoyIso(ahora());
  const anioActual = Number(hoy.slice(0, 4));
  let pais = PAIS_INICIAL;
  let anio = anioActual;
  let pedidoActual = 0;

  const botones = () => {
    $("anio-ant").disabled = anio <= ANIO_MINIMO;
    $("anio-sig").disabled = anio >= ANIO_MAXIMO;
    $("anio").textContent = String(anio);
  };

  async function cargar() {
    const pedido = ++pedidoActual;
    botones();
    let feriados = null;
    try {
      feriados = normalizarFeriados(await pedir(urlFeriados(pais, anio)));
    } catch {
      feriados = null;
    }
    if (pedido !== pedidoActual) return; // llegó una respuesta más vieja que otra ya pedida
    if (!feriados) {
      pintarProximo(doc, $("proximo"), null, hoy);
      $("lista").replaceChildren();
      pintarMensaje(doc, $("aviso"), "No se pudieron cargar los feriados.", cargar);
      return;
    }
    pintarProximo(doc, $("proximo"), anio === anioActual ? proximoFeriado(feriados, hoy) : null, hoy);
    pintarLista(doc, $("lista"), feriados, hoy);
    pintarMensaje(doc, $("aviso"), "");
  }

  return {
    async iniciar() {
      $("pais").addEventListener("change", () => { pais = $("pais").value; return cargar(); });
      $("anio-ant").addEventListener("click", () => { anio -= 1; return cargar(); });
      $("anio-sig").addEventListener("click", () => { anio += 1; return cargar(); });
      await cargar();
    },
  };
}
