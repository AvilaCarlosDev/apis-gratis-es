import { pedirJson } from "../../compartido/api.js";
import { pintarMensaje } from "../../compartido/dom.js";
import { resumenPronostico, lugaresDe, urlGeocodificacion, urlPronostico } from "./clima.js";
import { LUGAR_INICIAL } from "./config.js";
import { pintarActual, pintarDias, pintarLugares } from "./render.js";

const UNIDADES = ["celsius", "fahrenheit"];

export function crearApp({ doc, fetch }) {
  const $ = (id) => doc.getElementById(id);
  const pedir = (url) => pedirJson(url, { fetch });
  let lugar = LUGAR_INICIAL;
  let unidad = "celsius";
  let pedidoActual = 0;
  const aviso = (texto, reintentar) => pintarMensaje(doc, $("aviso"), texto, reintentar);

  async function cargarPronostico() {
    const pedido = ++pedidoActual;
    let resumen = null;
    try {
      resumen = resumenPronostico(await pedir(urlPronostico(lugar, unidad)));
    } catch {
      resumen = null;
    }
    if (pedido !== pedidoActual) return; // llegó una respuesta más vieja que otra ya pedida
    pintarActual(doc, $("actual"), lugar, resumen?.actual ?? null);
    pintarDias(doc, $("dias"), resumen?.dias ?? [], resumen?.actual.unidad ?? "°C");
    if (resumen) aviso("");
    else aviso("No se pudo cargar el pronóstico.", cargarPronostico);
  }

  async function elegir(nuevo, lugares) {
    lugar = nuevo;
    pintarLugares(doc, $("lugares"), lugares, (l) => elegir(l, lugares), nuevo.id);
    await cargarPronostico();
  }

  async function buscar() {
    const texto = $("buscador").value.trim();
    let url;
    try {
      url = urlGeocodificacion(texto);
    } catch {
      aviso("Escribe al menos 2 letras para buscar un lugar.");
      return;
    }
    let lugares;
    try {
      lugares = lugaresDe(await pedir(url));
    } catch {
      aviso("No se pudo buscar el lugar.", buscar);
      return;
    }
    if (lugares.length === 0) {
      aviso(`No se encontró «${texto}». Prueba con otro nombre.`);
      return;
    }
    await elegir(lugares[0], lugares);
  }

  return {
    async iniciar() {
      $("buscar").addEventListener("click", buscar);
      $("buscador").addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault?.();
        return buscar();
      });
      $("unidad").addEventListener("change", () => {
        if (!UNIDADES.includes($("unidad").value)) return;
        unidad = $("unidad").value;
        return cargarPronostico();
      });
      await cargarPronostico();
    },
  };
}
