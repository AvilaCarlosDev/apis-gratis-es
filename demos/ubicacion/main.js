import { crearApp } from "./lib/app.js";
import { crearMapa } from "./lib/mapa.js";

// Arranca sobre Caracas; el mapa nunca pide la ubicación por su cuenta.
const panel = document.getElementById("panel");
// En pantallas anchas el panel tapa la izquierda del mapa; en el teléfono, la parte de arriba.
const tapado = () => {
  const r = panel.getBoundingClientRect();
  return innerWidth > 640 ? { izquierda: r.right, arriba: 0 } : { izquierda: 0, arriba: r.bottom };
};
const mapa = crearMapa(document, document.getElementById("mapa"), { lat: 10.4880, lon: -66.8792, zoom: 12, tapado });
crearApp({ doc: document, fetch: (...args) => fetch(...args), mapa, geolocalizacion: navigator.geolocation }).iniciar();
