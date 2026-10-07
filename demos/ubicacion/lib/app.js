import { pedirJson } from "../../compartido/api.js";
import { pintarMensaje } from "../../compartido/dom.js";
import { normalizarIp, normalizarLugares, urlBusqueda, urlReversa } from "./ubicacion.js";
import { pintarGps, pintarIp, pintarLugares } from "./render.js";

// Sin mapa (en las pruebas, o si el navegador no puede dibujarlo) la app sigue funcionando con las fichas.
const SIN_MAPA = { marcar() {}, encuadrar() {}, irA() {}, resaltar() {}, alPulsar() {}, acercar() {}, alejar() {} };
const RADIO_IP_M = 8000; // la IP ubica a nivel de ciudad: se dibuja un círculo amplio, no un punto exacto

const MOTIVOS_GPS = {
  1: "No diste permiso para usar tu ubicación. Podés activarlo en los ajustes del sitio o usar la estimación por IP.",
  2: "Tu dispositivo no pudo calcular la posición. Probá al aire libre o con el wifi encendido.",
  3: "El GPS tardó demasiado en responder. Probá de nuevo.",
};

export function crearApp({ doc, fetch, mapa = SIN_MAPA, geolocalizacion = null }) {
  const $ = (id) => doc.getElementById(id);
  const pedir = (url) => pedirJson(url, { fetch });
  const aviso = (texto, reintentar) => pintarMensaje(doc, $("aviso"), texto, reintentar);
  const enUso = () => { if ($("bienvenida")) $("bienvenida").hidden = true; };
  let pedidoLugares = 0;
  let pedidoIp = 0;
  let fichas = [];
  let lugaresVisibles = [];
  let yo = null;

  function elegir(i) {
    const l = lugaresVisibles[i];
    if (!l) return;
    fichas.forEach((f, j) => f.classList.toggle("activa", j === i));
    mapa.resaltar(i);
    mapa.irA(l.latitud, l.longitud, Math.max(mapa.zoom ?? 0, 16));
  }

  function mostrarLugares(lugares, opciones = {}) {
    lugaresVisibles = lugares;
    fichas = pintarLugares(doc, $("lugares"), lugares, { alElegir: elegir, ...opciones });
    mapa.marcar("lugares", lugares.map((l, i) => ({ lat: l.latitud, lon: l.longitud, numero: String(i + 1), etiqueta: `${i + 1}. ${l.nombre}`, alElegir: () => elegir(i) })));
  }

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
    enUso();
    mostrarLugares(lugares);
    if (lugares.length) mapa.encuadrar(lugares.map((l) => ({ lat: l.latitud, lon: l.longitud })), { zoomMax: 16 });
  }

  // Un toque en el mapa pregunta qué hay ahí: el marcador queda donde tocaste y la ficha dice lo más cercano.
  async function queHayAqui(latitud, longitud) {
    const pedido = ++pedidoLugares;
    let cercano;
    try {
      cercano = normalizarLugares(await pedir(urlReversa(latitud, longitud)))[0] ?? null;
    } catch {
      if (pedido === pedidoLugares) aviso("No se pudo consultar ese punto del mapa.", () => queHayAqui(latitud, longitud));
      return;
    }
    if (pedido !== pedidoLugares) return;
    aviso("");
    enUso();
    const direccion = cercano ? `Cerca de ${cercano.direccion || cercano.nombre}` : "";
    mostrarLugares([{ nombre: cercano?.nombre ?? "Punto sin nombre", direccion, latitud, longitud }], { etiqueta: "Punto elegido en el mapa" });
  }

  function mostrarYo(posicion, zoom) {
    yo = { ...posicion, zoom };
    mapa.marcar("yo", [{ lat: posicion.latitud, lon: posicion.longitud, tipo: "yo", radioM: posicion.radioM, etiqueta: posicion.etiqueta }]);
    mapa.irA(posicion.latitud, posicion.longitud, zoom);
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
    enUso();
    pintarIp(doc, $("ip"), datos);
    if (datos.latitud !== null && datos.longitud !== null) {
      mostrarYo({ latitud: datos.latitud, longitud: datos.longitud, radioM: RADIO_IP_M, etiqueta: "Tu ubicación aproximada por IP" }, 11);
    }
  }

  // El GPS solo se pide al pulsar el botón; el navegador muestra su propio permiso.
  async function gps() {
    if (!geolocalizacion?.getCurrentPosition) {
      aviso("Este navegador no ofrece ubicación por GPS. Probá con la estimación por IP.");
      return;
    }
    const pedido = ++pedidoIp;
    $("gps").disabled = true;
    let coords;
    try {
      coords = (await new Promise((ok, mal) => geolocalizacion.getCurrentPosition(ok, mal, { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }))).coords;
    } catch (e) {
      if (pedido === pedidoIp) { $("gps").disabled = false; aviso(MOTIVOS_GPS[e?.code] ?? MOTIVOS_GPS[2], e?.code === 1 ? undefined : gps); }
      return;
    }
    if (pedido !== pedidoIp) return;
    $("gps").disabled = false;
    aviso("");
    enUso();
    const pos = { latitud: coords.latitude, longitud: coords.longitude, precision: coords.accuracy };
    pintarGps(doc, $("ip"), pos);
    mostrarYo({ ...pos, radioM: coords.accuracy, etiqueta: "Tu posición por GPS" }, coords.accuracy < 300 ? 17 : 14);
    let cercano = null;
    try {
      cercano = normalizarLugares(await pedir(urlReversa(pos.latitud, pos.longitud)))[0] ?? null;
    } catch { /* sin dirección: la ficha lo dice */ }
    if (pedido === pedidoIp) pintarGps(doc, $("ip"), pos, cercano);
  }

  const alPulsar = (id, fn) => $(id)?.addEventListener("click", fn);

  return {
    iniciar() {
      alPulsar("buscar", buscar);
      $("buscador").addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault?.();
        return buscar();
      });
      alPulsar("ubicar", ubicar);
      alPulsar("gps", gps);
      alPulsar("acercar", () => mapa.acercar());
      alPulsar("alejar", () => mapa.alejar());
      alPulsar("mi-posicion", () => (yo ? mapa.irA(yo.latitud, yo.longitud, yo.zoom) : gps()));
      alPulsar("plegar", () => {
        const plegado = $("panel").classList.toggle("plegado");
        $("plegar").setAttribute("aria-expanded", String(!plegado));
      });
      mapa.alPulsar(queHayAqui);
    },
  };
}
