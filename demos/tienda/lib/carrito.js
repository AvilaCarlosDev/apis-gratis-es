export const MAX_POR_PRODUCTO = 20;

const limitar = (n) => (Number.isFinite(n) ? Math.min(Math.max(Math.trunc(n), 0), MAX_POR_PRODUCTO) : 1);

export const carritoVacio = () => [];

export function agregar(carrito, producto) {
  const existe = carrito.some((l) => l.producto.id === producto.id);
  if (!existe) return [...carrito, { producto, cantidad: 1 }];
  return carrito.map((l) => (l.producto.id === producto.id ? { ...l, cantidad: limitar(l.cantidad + 1) } : l));
}

export const quitar = (carrito, id) => carrito.filter((l) => l.producto.id !== id);

export function cambiarCantidad(carrito, id, cantidad) {
  const n = limitar(cantidad);
  if (n === 0) return quitar(carrito, id);
  return carrito.map((l) => (l.producto.id === id ? { ...l, cantidad: n } : l));
}

// Se suma en centavos para evitar errores de coma flotante (0,1 + 0,2).
export const totalUsd = (carrito) => carrito.reduce((suma, l) => suma + Math.round(l.producto.precioUsd * 100) * l.cantidad, 0) / 100;

export const cantidadTotal = (carrito) => carrito.reduce((suma, l) => suma + l.cantidad, 0);
