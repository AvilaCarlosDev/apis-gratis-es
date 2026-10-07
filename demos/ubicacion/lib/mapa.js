// Mapa de teselas propio, sin bibliotecas: proyección Web Mercator, arrastre con inercia,
// zoom con rueda, pellizco y botones, marcadores y círculo de precisión.
// Las funciones de cálculo son puras y tienen pruebas; crearMapa solo mueve el DOM.

export const TESELA = 256;
export const ZOOM_MIN = 2;
export const ZOOM_MAX = 19;
export const HOST_TESELAS = "tile.openstreetmap.org";
const LAT_MAX = 85.05112878;

const acotar = (v, min, max) => Math.min(max, Math.max(min, v));
const tamMundo = (zoom) => TESELA * 2 ** zoom;

// De latitud y longitud a píxeles del mundo en un zoom dado (origen arriba a la izquierda).
export function aPixel(lat, lon, zoom) {
  const seno = Math.sin((acotar(lat, -LAT_MAX, LAT_MAX) * Math.PI) / 180);
  const t = tamMundo(zoom);
  return { x: ((lon + 180) / 360) * t, y: (0.5 - Math.log((1 + seno) / (1 - seno)) / (4 * Math.PI)) * t };
}

export function aLatLon(x, y, zoom) {
  const t = tamMundo(zoom);
  const n = Math.PI - (2 * Math.PI * y) / t;
  const lon = (x / t) * 360 - 180;
  return { lat: (180 / Math.PI) * Math.atan(Math.sinh(n)), lon: ((((lon + 180) % 360) + 360) % 360) - 180 };
}

// Teselas estándar de OpenStreetMap. La x da la vuelta al mundo; fuera del rango vertical no hay tesela.
export function urlTesela(x, y, zoom) {
  const n = 2 ** zoom;
  if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(zoom) || y < 0 || y >= n || zoom < 0 || zoom > ZOOM_MAX) return null;
  const xx = ((x % n) + n) % n;
  return `https://${HOST_TESELAS}/${zoom}/${xx}/${y}.png`;
}

// Metros que mide un píxel en pantalla a esa latitud y zoom (para dibujar la precisión).
export const metrosPorPixel = (lat, zoom) => (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;

// Centro y zoom que muestran todos los puntos dentro de un recuadro de ancho × alto, con margen.
export function encuadre(puntos, ancho, alto, { margen = 48, zoomMax = 16 } = {}) {
  const validos = puntos.filter((p) => Number.isFinite(p?.lat) && Number.isFinite(p?.lon));
  if (!validos.length) return null;
  const lats = validos.map((p) => p.lat);
  const lons = validos.map((p) => p.lon);
  const centro = { lat: (Math.min(...lats) + Math.max(...lats)) / 2, lon: (Math.min(...lons) + Math.max(...lons)) / 2 };
  if (validos.length === 1) return { ...centro, zoom: zoomMax };
  const utilAncho = Math.max(1, ancho - margen * 2);
  const utilAlto = Math.max(1, alto - margen * 2);
  for (let z = zoomMax; z > ZOOM_MIN; z--) {
    const a = aPixel(Math.max(...lats), Math.min(...lons), z);
    const b = aPixel(Math.min(...lats), Math.max(...lons), z);
    if (b.x - a.x <= utilAncho && b.y - a.y <= utilAlto) {
      const medio = aLatLon((a.x + b.x) / 2, (a.y + b.y) / 2, z);
      return { lat: medio.lat, lon: medio.lon, zoom: z };
    }
  }
  return { ...centro, zoom: ZOOM_MIN };
}

// Teselas que cubren una vista de ancho × alto centrada en (cx, cy) píxeles del mundo.
export function teselasVisibles(cx, cy, ancho, alto, zoom) {
  const x0 = Math.floor((cx - ancho / 2) / TESELA);
  const x1 = Math.floor((cx + ancho / 2) / TESELA);
  const y0 = Math.max(0, Math.floor((cy - alto / 2) / TESELA));
  const y1 = Math.min(2 ** zoom - 1, Math.floor((cy + alto / 2) / TESELA));
  const lista = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) lista.push({ x, y });
  return lista;
}

const reducido = () => globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// `tapado` dice cuántos píxeles tapa un panel flotante a la izquierda y arriba, para centrar en la parte visible.
export function crearMapa(doc, vista, { lat = 10.4806, lon = -66.9036, zoom = 12, tapado = () => ({ izquierda: 0, arriba: 0 }) } = {}) {
  const ventana = doc.defaultView;
  const capaTeselas = doc.createElement("div");
  capaTeselas.className = "mapa-teselas";
  const capaMarcas = doc.createElement("div");
  capaMarcas.className = "mapa-marcas";
  vista.append(capaTeselas, capaMarcas);

  let z = zoom;
  let centro = aPixel(lat, lon, z); // en píxeles del mundo, en el zoom z
  let marcas = [];
  let alPulsar = null;
  let animacion = 0;
  const cache = new Map();

  const medidas = () => ({ ancho: vista.clientWidth, alto: vista.clientHeight });
  const acotarCentro = () => {
    const t = tamMundo(z);
    const { alto } = medidas();
    centro.y = t <= alto ? t / 2 : acotar(centro.y, alto / 2, t - alto / 2);
  };

  function pintar() {
    acotarCentro();
    const { ancho, alto } = medidas();
    const vistas = new Set();
    for (const { x, y } of teselasVisibles(centro.x, centro.y, ancho, alto, z)) {
      const clave = `${z}/${x}/${y}`;
      vistas.add(clave);
      let img = cache.get(clave);
      if (!img) {
        const url = urlTesela(x, y, z);
        if (!url) continue;
        img = doc.createElement("img");
        img.alt = "";
        img.draggable = false;
        img.decoding = "async";
        img.className = "tesela";
        // La política de teselas de OpenStreetMap pide un Referer: se manda solo el origen del sitio.
        img.referrerPolicy = "strict-origin-when-cross-origin";
        img.addEventListener("load", () => img.classList.add("lista"));
        img.src = url;
        cache.set(clave, img);
        capaTeselas.append(img);
      }
      img.style.transform = `translate3d(${Math.round(x * TESELA - centro.x + ancho / 2)}px, ${Math.round(y * TESELA - centro.y + alto / 2)}px, 0)`;
    }
    for (const [clave, img] of cache) {
      if (!vistas.has(clave)) { img.remove(); cache.delete(clave); }
    }
    for (const m of marcas) {
      const p = aPixel(m.lat, m.lon, z);
      let dx = p.x - centro.x;
      const t = tamMundo(z);
      dx -= Math.round(dx / t) * t; // el marcador más cercano si el mapa da la vuelta
      m.nodo.style.transform = `translate3d(${dx + ancho / 2}px, ${p.y - centro.y + alto / 2}px, 0)`;
      if (m.radioM) {
        const d = Math.max(16, (2 * m.radioM) / metrosPorPixel(m.lat, z));
        m.halo.style.width = m.halo.style.height = `${Math.min(d, 4000)}px`;
      }
    }
  }

  function cambiarZoom(nuevo, ancla) {
    nuevo = acotar(Math.round(nuevo), ZOOM_MIN, ZOOM_MAX);
    if (nuevo === z) return;
    const { ancho, alto } = medidas();
    const a = ancla ?? { x: ancho / 2, y: alto / 2 };
    const mundo = { x: centro.x + a.x - ancho / 2, y: centro.y + a.y - alto / 2 };
    const f = 2 ** (nuevo - z);
    centro = { x: mundo.x * f - (a.x - ancho / 2), y: mundo.y * f - (a.y - alto / 2) };
    // Las teselas del zoom anterior se escalan un instante para que el cambio no quede en blanco.
    if (!reducido()) {
      const viejas = capaTeselas.cloneNode(true);
      viejas.classList.add("mapa-teselas-previas");
      viejas.style.transformOrigin = `${a.x}px ${a.y}px`;
      vista.insertBefore(viejas, capaTeselas);
      ventana.requestAnimationFrame(() => { viejas.style.transform = `scale(${f})`; viejas.style.opacity = "0"; });
      ventana.setTimeout(() => viejas.remove(), 450);
    }
    for (const img of cache.values()) img.remove();
    cache.clear();
    z = nuevo;
    pintar();
  }

  // Centro del mundo que deja el punto en el medio de la parte del mapa que no tapa el panel.
  function centroVisible(latD, lonD, zoomD) {
    const p = aPixel(latD, lonD, zoomD);
    const { izquierda, arriba } = tapado();
    return { x: p.x - izquierda / 2, y: p.y - arriba / 2 };
  }

  function irA(latD, lonD, zoomD = z) {
    ventana.cancelAnimationFrame(animacion);
    const destinoZoom = acotar(Math.round(zoomD), ZOOM_MIN, ZOOM_MAX);
    if (destinoZoom !== z || reducido()) {
      z = destinoZoom;
      for (const img of cache.values()) img.remove();
      cache.clear();
      centro = centroVisible(latD, lonD, z);
      pintar();
      return;
    }
    const desde = { ...centro };
    const hasta = centroVisible(latD, lonD, z);
    const inicio = ventana.performance.now();
    const paso = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / 450);
      const e = 1 - (1 - t) ** 3;
      centro = { x: desde.x + (hasta.x - desde.x) * e, y: desde.y + (hasta.y - desde.y) * e };
      pintar();
      if (t < 1) animacion = ventana.requestAnimationFrame(paso);
    };
    animacion = ventana.requestAnimationFrame(paso);
  }

  // Arrastre con puntero (ratón, dedo o lápiz) y pellizco con dos dedos.
  const punteros = new Map();
  let arrastre = null;
  let pellizco = null;
  vista.addEventListener("pointerdown", (e) => {
    if (e.target.closest?.(".marca-mapa button")) return;
    ventana.cancelAnimationFrame(animacion);
    vista.setPointerCapture?.(e.pointerId);
    punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (punteros.size === 1) arrastre = { x: e.clientX, y: e.clientY, t: e.timeStamp, vx: 0, vy: 0, movido: 0 };
    if (punteros.size === 2) {
      const [p1, p2] = [...punteros.values()];
      pellizco = { d: Math.hypot(p1.x - p2.x, p1.y - p2.y), z };
      arrastre = null;
    }
  });
  vista.addEventListener("pointermove", (e) => {
    if (!punteros.has(e.pointerId)) return;
    punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pellizco && punteros.size === 2) {
      const [p1, p2] = [...punteros.values()];
      const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const r = vista.getBoundingClientRect();
      const objetivo = pellizco.z + Math.log2(d / pellizco.d);
      if (Math.abs(objetivo - z) >= 0.6) cambiarZoom(objetivo, { x: (p1.x + p2.x) / 2 - r.left, y: (p1.y + p2.y) / 2 - r.top });
      return;
    }
    if (!arrastre) return;
    const dx = e.clientX - arrastre.x;
    const dy = e.clientY - arrastre.y;
    const dt = Math.max(1, e.timeStamp - arrastre.t);
    arrastre = { x: e.clientX, y: e.clientY, t: e.timeStamp, vx: dx / dt, vy: dy / dt, movido: arrastre.movido + Math.abs(dx) + Math.abs(dy) };
    if (arrastre.movido > 4) vista.classList.add("arrastrando");
    centro = { x: centro.x - dx, y: centro.y - dy };
    pintar();
  });
  const soltar = (e) => {
    if (!punteros.has(e.pointerId)) return;
    punteros.delete(e.pointerId);
    if (punteros.size < 2) pellizco = null;
    if (!arrastre || punteros.size) return;
    const a = arrastre;
    arrastre = null;
    vista.classList.remove("arrastrando");
    if (a.movido <= 4 && e.type === "pointerup" && alPulsar) {
      const r = vista.getBoundingClientRect();
      const { ancho, alto } = medidas();
      const p = aLatLon(centro.x + e.clientX - r.left - ancho / 2, centro.y + e.clientY - r.top - alto / 2, z);
      alPulsar(p.lat, p.lon);
      return;
    }
    if (reducido() || e.timeStamp - a.t > 80) return;
    let vx = a.vx * 16;
    let vy = a.vy * 16;
    const inercia = () => {
      vx *= 0.92; vy *= 0.92;
      if (Math.abs(vx) + Math.abs(vy) < 0.5) return;
      centro = { x: centro.x - vx, y: centro.y - vy };
      pintar();
      animacion = ventana.requestAnimationFrame(inercia);
    };
    animacion = ventana.requestAnimationFrame(inercia);
  };
  vista.addEventListener("pointerup", soltar);
  vista.addEventListener("pointercancel", soltar);

  let acumulado = 0;
  vista.addEventListener("wheel", (e) => {
    e.preventDefault();
    acumulado += e.deltaY;
    if (Math.abs(acumulado) < 60) return;
    const r = vista.getBoundingClientRect();
    cambiarZoom(z + (acumulado < 0 ? 1 : -1), { x: e.clientX - r.left, y: e.clientY - r.top });
    acumulado = 0;
  }, { passive: false });
  vista.addEventListener("dblclick", (e) => {
    const r = vista.getBoundingClientRect();
    cambiarZoom(z + (e.shiftKey ? -1 : 1), { x: e.clientX - r.left, y: e.clientY - r.top });
  });
  vista.addEventListener("keydown", (e) => {
    const paso = 80;
    const mover = { ArrowLeft: [-paso, 0], ArrowRight: [paso, 0], ArrowUp: [0, -paso], ArrowDown: [0, paso] }[e.key];
    if (mover) { e.preventDefault(); centro = { x: centro.x + mover[0], y: centro.y + mover[1] }; pintar(); }
    else if (e.key === "+" || e.key === "=") cambiarZoom(z + 1);
    else if (e.key === "-" || e.key === "_") cambiarZoom(z - 1);
  });
  new ventana.ResizeObserver(() => pintar()).observe(vista);

  function crearMarca({ lat: mLat, lon: mLon, tipo = "pin", radioM = 0, etiqueta = "", numero = "", alElegir }) {
    const nodo = doc.createElement("div");
    nodo.className = `marca-mapa marca-${tipo}`;
    let halo = null;
    if (tipo === "yo") {
      halo = doc.createElement("span");
      halo.className = "marca-halo";
      const punto = doc.createElement("span");
      punto.className = "marca-punto";
      nodo.append(halo, punto);
      nodo.setAttribute("role", "img");
      nodo.setAttribute("aria-label", etiqueta);
    } else {
      const b = doc.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", etiqueta);
      b.title = etiqueta;
      const n = doc.createElement("span");
      n.className = "marca-numero";
      n.textContent = numero;
      b.append(n);
      if (alElegir) b.addEventListener("click", alElegir);
      nodo.append(b);
    }
    capaMarcas.append(nodo);
    return { lat: mLat, lon: mLon, radioM, nodo, halo, tipo };
  }

  pintar();

  return {
    irA,
    acercar: () => cambiarZoom(z + 1),
    alejar: () => cambiarZoom(z - 1),
    encuadrar(puntos, opciones) {
      const { ancho, alto } = medidas();
      const { izquierda, arriba } = tapado();
      const e = encuadre(puntos, ancho - izquierda, alto - arriba, opciones);
      if (e) irA(e.lat, e.lon, e.zoom);
    },
    // Reemplaza las marcas de un grupo ("lugares" o "yo") sin tocar las del otro.
    marcar(grupo, lista) {
      marcas = marcas.filter((m) => { if (m.grupo !== grupo) return true; m.nodo.remove(); return false; });
      for (const datos of lista) marcas.push({ ...crearMarca(datos), grupo });
      pintar();
    },
    resaltar(indice) {
      marcas.filter((m) => m.grupo === "lugares").forEach((m, i) => m.nodo.classList.toggle("activa", i === indice));
    },
    alPulsar(fn) { alPulsar = fn; },
    get zoom() { return z; },
  };
}
