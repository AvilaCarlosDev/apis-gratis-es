// Todo el DOM se arma con createElement/textContent: los textos de las APIs nunca se interpretan como HTML.
import { convertir } from "./cambio.js";
import { totalUsd } from "./carrito.js";
import { formatearBs, formatearFechaLarga, formatearUsd } from "./formato.js";

const grados = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 1 });

function el(doc, etiqueta, { clase, texto, atributos } = {}, ...hijos) {
  const nodo = doc.createElement(etiqueta);
  if (clase) nodo.className = clase;
  if (texto !== undefined) nodo.textContent = texto;
  for (const [k, v] of Object.entries(atributos ?? {})) nodo.setAttribute(k, v);
  if (hijos.length) nodo.append(...hijos);
  return nodo;
}

const boton = (doc, texto, etiquetaAria, alPulsar, clase = "") => {
  const b = el(doc, "button", { clase, texto, atributos: { type: "button", "aria-label": etiquetaAria } });
  b.addEventListener("click", alPulsar);
  return b;
};

const enBs = (usd, tasa) => (tasa ? formatearBs(convertir(usd, tasa.bsPorUsd)) : "Bs. no disponible");

export function tarjetaProducto(doc, producto, tasa, alAgregar) {
  const etiqueta = el(doc, "div", { clase: "etiqueta" },
    el(doc, "p", { clase: "precio-usd", texto: formatearUsd(producto.precioUsd) }),
    el(doc, "p", { clase: "precio-bs", texto: enBs(producto.precioUsd, tasa) }));
  const tarjeta = el(doc, "article", { clase: "producto" });
  if (producto.imagen) {
    tarjeta.append(el(doc, "div", { clase: "foto" }, el(doc, "img", { atributos: { src: producto.imagen, alt: producto.titulo, loading: "lazy", decoding: "async", referrerpolicy: "no-referrer" } })));
  }
  tarjeta.append(
    el(doc, "h3", { texto: producto.titulo }),
    el(doc, "p", { clase: "categoria", texto: producto.categoria }),
    etiqueta,
    boton(doc, "Agregar", `Agregar ${producto.titulo} al carrito`, () => alAgregar(producto), "primario"));
  return tarjeta;
}

export function pintarCarrito(doc, contenedor, carrito, tasa, { quitar, cambiar, vaciar } = {}) {
  if (carrito.length === 0) {
    contenedor.replaceChildren(el(doc, "p", { clase: "vacio", texto: "El carrito está vacío. Agrega un producto para verlo aquí." }));
    return;
  }
  const lineas = carrito.map(({ producto, cantidad }) => el(doc, "li", { clase: "linea" },
    el(doc, "span", { clase: "linea-titulo", texto: producto.titulo }),
    el(doc, "span", { clase: "linea-cantidad" },
      boton(doc, "−", `Disminuir cantidad de ${producto.titulo}`, () => cambiar?.(producto.id, cantidad - 1)),
      el(doc, "span", { texto: String(cantidad), atributos: { "aria-label": `Cantidad: ${cantidad}` } }),
      boton(doc, "+", `Aumentar cantidad de ${producto.titulo}`, () => cambiar?.(producto.id, cantidad + 1))),
    el(doc, "span", { clase: "linea-precio", texto: formatearUsd(producto.precioUsd * cantidad) }),
    boton(doc, "Quitar", `Quitar ${producto.titulo} del carrito`, () => quitar?.(producto.id), "texto")));
  const total = totalUsd(carrito);
  contenedor.replaceChildren(
    el(doc, "ul", { clase: "lineas" }, ...lineas),
    el(doc, "div", { clase: "total" },
      el(doc, "p", { clase: "precio-usd", texto: formatearUsd(total) }),
      el(doc, "p", { clase: "precio-bs", texto: enBs(total, tasa) })),
    boton(doc, "Vaciar carrito", "Vaciar carrito", () => vaciar?.(), "texto"));
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

export function pintarTasa(doc, contenedor, tasa) {
  if (!tasa) {
    contenedor.replaceChildren(el(doc, "p", { clase: "tasa-nota", texto: "Tasa oficial no disponible por ahora." }));
    return;
  }
  const fecha = formatearFechaLarga(tasa.actualizadaEl);
  contenedor.replaceChildren(
    el(doc, "p", { clase: "tasa-ecuacion", texto: `US$ 1 = ${formatearBs(tasa.bsPorUsd)}` }),
    el(doc, "p", { clase: "tasa-nota", texto: fecha ? `Tasa oficial, actualizada el ${fecha}.` : "Tasa oficial." }));
}

export function pintarClima(doc, contenedor, clima) {
  if (!clima) {
    contenedor.replaceChildren(el(doc, "p", { texto: "Clima no disponible por ahora." }));
    return;
  }
  contenedor.replaceChildren(
    el(doc, "p", { clase: "clima-temp", texto: `${grados.format(clima.temperatura)} ${clima.unidad}` }),
    el(doc, "p", { texto: clima.descripcion }));
}
