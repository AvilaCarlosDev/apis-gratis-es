import { convertir } from "./cambio.js";
import { totalUsd } from "./carrito.js";
import { boton, el } from "../../compartido/dom.js";
import { formatearBs, formatearFechaLarga, formatearUsd } from "../../compartido/formato.js";

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

export function pintarTasa(doc, contenedor, tasa) {
  if (!tasa) {
    contenedor.replaceChildren(el(doc, "p", { clase: "pizarra-nota", texto: "Tasa oficial no disponible por ahora." }));
    return;
  }
  const fecha = formatearFechaLarga(tasa.actualizadaEl);
  contenedor.replaceChildren(
    el(doc, "p", { clase: "tasa-ecuacion", texto: `US$ 1 = ${formatearBs(tasa.bsPorUsd)}` }),
    el(doc, "p", { clase: "pizarra-nota", texto: fecha ? `Tasa oficial, actualizada el ${fecha}.` : "Tasa oficial." }));
}

export function pintarCategorias(doc, contenedor, categorias, total, activa, alElegir) {
  const chip = (clave, texto, cantidad) => {
    const b = boton(doc, `${texto} (${cantidad})`, `Ver ${texto}`, () => alElegir(clave), "chip");
    b.setAttribute("aria-pressed", String(clave === activa));
    return b;
  };
  contenedor.replaceChildren(chip("todas", "Todas", total), ...categorias.map((c) => chip(c.clave, c.nombre, c.cantidad)));
}

export function pintarResultados(doc, contenedor, cantidad) {
  contenedor.textContent = cantidad === 0
    ? "No hay productos que coincidan. Prueba con otra búsqueda o categoría."
    : `${cantidad} ${cantidad === 1 ? "producto" : "productos"}`;
}
