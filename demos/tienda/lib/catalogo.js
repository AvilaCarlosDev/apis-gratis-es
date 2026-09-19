// Nombres en español de las categorías que devuelven FakeStoreAPI y DummyJSON.
const NOMBRES = new Map(Object.entries({
  "men's clothing": "Ropa de hombre", "women's clothing": "Ropa de mujer", jewelery: "Joyería", electronics: "Electrónica",
  beauty: "Belleza", fragrances: "Fragancias", furniture: "Muebles", groceries: "Víveres", "home-decoration": "Decoración del hogar",
  "kitchen-accessories": "Accesorios de cocina", laptops: "Laptops", "mens-shirts": "Camisas de hombre", "mens-shoes": "Zapatos de hombre",
  "mens-watches": "Relojes de hombre", "mobile-accessories": "Accesorios para celular", motorcycle: "Motos", "skin-care": "Cuidado de la piel",
  smartphones: "Celulares", "sports-accessories": "Accesorios deportivos", sunglasses: "Lentes de sol", tablets: "Tabletas", tops: "Blusas",
  vehicle: "Vehículos", "womens-bags": "Bolsos de mujer", "womens-dresses": "Vestidos", "womens-jewellery": "Joyería de mujer",
  "womens-shoes": "Zapatos de mujer", "womens-watches": "Relojes de mujer",
}));

export const nombreCategoria = (clave) => (typeof clave === "string" && clave !== "" ? NOMBRES.get(clave) ?? clave : "Sin categoría");

const normalizar = (texto) => String(texto).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

export function categoriasDe(productos) {
  const cuenta = new Map();
  for (const p of productos) cuenta.set(p.categoria, (cuenta.get(p.categoria) ?? 0) + 1);
  return [...cuenta].map(([clave, cantidad]) => ({ clave, nombre: nombreCategoria(clave), cantidad }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export function filtrar(productos, { categoria = "todas", texto = "" } = {}) {
  const aguja = normalizar(texto);
  return productos.filter((p) => (categoria === "todas" || p.categoria === categoria) && (aguja === "" || normalizar(p.titulo).includes(aguja)));
}

const ORDENES = {
  "precio-asc": (a, b) => a.precioUsd - b.precioUsd,
  "precio-desc": (a, b) => b.precioUsd - a.precioUsd,
  nombre: (a, b) => a.titulo.localeCompare(b.titulo, "es"),
};

// Array.prototype.sort es estable: los empates conservan el orden original.
export const ordenar = (productos, orden) => (ORDENES[orden] ? [...productos].sort(ORDENES[orden]) : [...productos]);
