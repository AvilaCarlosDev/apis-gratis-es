import { pedirJson } from "../../compartido/api.js";
import { pintarMensaje } from "../../compartido/dom.js";
import { normalizarIp, normalizarLugares, urlBusqueda } from "./ubicacion.js";
import { pintarIp, pintarLugares } from "./render.js";

export function crearApp({ doc, fetch }) {
  const $ = (id) => doc.getElementById(id);
  const pedir = (url) => pedirJson(url, { fetch });
  const aviso = (texto, reintentar) => pintarMensaje(doc, $("aviso"), texto, reintentar);
  let pedidoLugares = 0;
  let pedidoIp = 0;

  async function buscar() {
    let url;
    try {
      url = urlBusqueda($("buscador").value);
    } catch {
      aviso("Escribe al menos 2 letras para buscar un lugar.");
      return;
    }
    const pedido = ++pedidoLugares;
    let lugares;
    try {
      lugares = normalizarLugares(await pedir(url));
    } catch {
      if (pedido === pedidoLugares) aviso("No se pudo buscar el lugar.", buscar);
      return;
    }
    if (pedido !== pedidoLugares) return; // llegó una respuesta más vieja que otra ya pedida
    aviso("");
    pintarLugares(doc, $("lugares"), lugares);
  }

  async function ubicar() {
    const pedido = ++pedidoIp;
    $("ubicar").disabled = true;
    let datos;
    try {
      datos = normalizarIp(await pedir("https://ipwho.is/"));
    } catch {
      if (pedido === pedidoIp) { $("ubicar").disabled = false; aviso("No se pudo estimar tu ubicación.", ubicar); }
      return;
    }
    if (pedido !== pedidoIp) return;
    $("ubicar").disabled = false;
    aviso("");
    pintarIp(doc, $("ip"), datos);
  }

  return {
    iniciar() {
      $("buscar").addEventListener("click", buscar);
      $("buscador").addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault?.();
        return buscar();
      });
      $("ubicar").addEventListener("click", ubicar);
    },
  };
}
