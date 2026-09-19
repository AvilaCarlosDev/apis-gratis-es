// Todo el DOM se arma con createElement/textContent: los textos de las APIs nunca se interpretan como HTML.
export function el(doc, etiqueta, { clase, texto, atributos } = {}, ...hijos) {
  const nodo = doc.createElement(etiqueta);
  if (clase) nodo.className = clase;
  if (texto !== undefined) nodo.textContent = texto;
  for (const [k, v] of Object.entries(atributos ?? {})) nodo.setAttribute(k, v);
  if (hijos.length) nodo.append(...hijos);
  return nodo;
}

export function boton(doc, texto, etiquetaAria, alPulsar, clase = "") {
  const b = el(doc, "button", { clase, texto, atributos: { type: "button", "aria-label": etiquetaAria } });
  b.addEventListener("click", alPulsar);
  return b;
}

export function pintarMensaje(doc, contenedor, texto, reintentar) {
  if (!texto) {
    contenedor.replaceChildren();
    contenedor.removeAttribute("role");
    contenedor.hidden = true;
    return;
  }
  contenedor.setAttribute("role", "alert");
  contenedor.hidden = false;
  contenedor.replaceChildren(el(doc, "p", { texto }));
  if (reintentar) contenedor.append(boton(doc, "Reintentar", "Reintentar la carga", reintentar, "texto"));
}
