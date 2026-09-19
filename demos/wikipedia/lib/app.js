import { pedirJson } from "../../compartido/api.js";
import { pintarMensaje } from "../../compartido/dom.js";
import { SUGERENCIAS, URL_AZAR } from "./config.js";
import { pintarCoincidencias, pintarInicio, pintarResumen, pintarSinResultados, pintarSugerencias } from "./render.js";
import { normalizarBusqueda, normalizarResumen, urlBusqueda, urlResumen } from "./wikipedia.js";

export function crearApp({ doc, fetch }) {
  const $ = (id) => doc.getElementById(id);
  const pedir = (url) => pedirJson(url, { fetch });
  const aviso = (texto, reintentar) => pintarMensaje(doc, $("aviso"), texto, reintentar);
  let pedidoBusqueda = 0;
  let pedidoResumen = 0;
  let lista = [];

  const inicio = () => pintarInicio(doc, $("resumen"), SUGERENCIAS, buscarTexto);

  async function mostrarResumen(url, { clave = null, reintentar } = {}) {
    const pedido = ++pedidoResumen;
    let resumen;
    try {
      resumen = normalizarResumen(await pedir(url));
    } catch (e) {
      if (pedido !== pedidoResumen) return;
      if (e.estado === 404) {
        aviso("");
        pintarSinResultados(doc, $("resumen"), $("buscador").value.trim() || "ese tema");
      } else {
        aviso("No se pudo cargar el artículo.", reintentar);
      }
      return;
    }
    if (pedido !== pedidoResumen) return; // llegó una respuesta más vieja que otra ya pedida
    aviso("");
    if (clave) pintarCoincidencias(doc, $("coincidencias"), lista, clave, elegir);
    pintarResumen(doc, $("resumen"), resumen);
  }

  function elegir(coincidencia) {
    return mostrarResumen(urlResumen(coincidencia.clave), { clave: coincidencia.clave, reintentar: () => elegir(coincidencia) });
  }

  async function buscar() {
    let url;
    try {
      url = urlBusqueda($("buscador").value);
    } catch {
      aviso("Escribí al menos 2 letras para buscar.");
      return;
    }
    const pedido = ++pedidoBusqueda;
    let encontradas;
    try {
      encontradas = normalizarBusqueda(await pedir(url));
    } catch {
      if (pedido === pedidoBusqueda) aviso("No se pudo buscar en Wikipedia.", buscar);
      return;
    }
    if (pedido !== pedidoBusqueda) return;
    aviso("");
    lista = encontradas;
    pedidoResumen += 1; // cualquier resumen en camino ya no corresponde a esta búsqueda
    if (lista.length === 0) {
      $("coincidencias").replaceChildren();
      pintarSinResultados(doc, $("resumen"), $("buscador").value.trim());
      return;
    }
    pintarCoincidencias(doc, $("coincidencias"), lista, null, elegir);
    await elegir(lista[0]);
  }

  function buscarTexto(texto) {
    $("buscador").value = texto;
    return buscar();
  }

  async function alAzar() {
    pedidoBusqueda += 1; // una búsqueda en camino ya no debe pisar este artículo
    lista = [];
    $("coincidencias").replaceChildren();
    await mostrarResumen(URL_AZAR, { reintentar: alAzar });
  }

  return {
    iniciar() {
      pintarSugerencias(doc, $("sugerencias"), SUGERENCIAS, buscarTexto);
      inicio();
      $("buscar").addEventListener("click", buscar);
      $("azar").addEventListener("click", alAzar);
      $("buscador").addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault?.();
        return buscar();
      });
    },
  };
}
