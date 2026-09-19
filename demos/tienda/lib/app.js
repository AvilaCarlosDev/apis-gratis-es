import { pedirJson } from "../../compartido/api.js";
import { pintarMensaje } from "../../compartido/dom.js";
import { tasaOficial } from "./cambio.js";
import { agregar, cambiarCantidad, cantidadTotal, carritoVacio, quitar } from "./carrito.js";
import { categoriasDe, filtrar, ordenar } from "./catalogo.js";
import { URL_DUMMYJSON, URL_FAKESTORE, URL_TASA } from "./config.js";
import { normalizarDummyJson, normalizarFakeStore } from "./productos.js";
import { pintarCarrito, pintarCategorias, pintarResultados, pintarTasa, tarjetaProducto } from "./render.js";

const PROVEEDORES = [
  { nombre: "FakeStoreAPI", url: URL_FAKESTORE, normalizar: normalizarFakeStore },
  { nombre: "DummyJSON", url: URL_DUMMYJSON, normalizar: normalizarDummyJson },
];

export function crearApp({ doc, fetch }) {
  const $ = (id) => doc.getElementById(id);
  const pedir = (url) => pedirJson(url, { fetch });
  let productos = [];
  let tasa = null;
  let carrito = carritoVacio();
  let categoria = "todas";
  let orden = "relevancia";

  const pintarProductos = () => {
    const visibles = ordenar(filtrar(productos, { categoria, texto: $("buscador").value }), orden);
    $("productos").replaceChildren(...visibles.map((p) => tarjetaProducto(doc, p, tasa, alAgregar)));
    pintarResultados(doc, $("resultados"), visibles.length);
    pintarCategorias(doc, $("categorias"), categoriasDe(productos), productos.length, categoria, (clave) => { categoria = clave; pintarProductos(); });
  };
  const pintarTodoElCarrito = () => {
    pintarCarrito(doc, $("carrito"), carrito, tasa, { quitar: alQuitar, cambiar: alCambiar, vaciar: alVaciar });
    $("contador").textContent = String(cantidadTotal(carrito));
  };
  const actualizarCarrito = (nuevo) => { carrito = nuevo; pintarTodoElCarrito(); };
  const alAgregar = (producto) => actualizarCarrito(agregar(carrito, producto));
  const alQuitar = (id) => actualizarCarrito(quitar(carrito, id));
  const alCambiar = (id, cantidad) => actualizarCarrito(cambiarCantidad(carrito, id, cantidad));
  const alVaciar = () => actualizarCarrito(carritoVacio());

  async function cargar() {
    const [resTasa, ...resProductos] = await Promise.allSettled([
      pedir(URL_TASA).then(tasaOficial),
      ...PROVEEDORES.map((p) => pedir(p.url).then(p.normalizar)),
    ]);
    tasa = resTasa.status === "fulfilled" ? resTasa.value : null;
    productos = resProductos.flatMap((r) => (r.status === "fulfilled" ? r.value.productos : []));
    if (!productos.some((p) => p.categoria === categoria)) categoria = "todas";
    const fallidos = PROVEEDORES.filter((_, i) => resProductos[i].status === "rejected").map((p) => p.nombre);

    const avisos = [];
    if (fallidos.length === PROVEEDORES.length) avisos.push("No se pudieron cargar los productos.");
    else if (fallidos.length) avisos.push(`No se pudieron cargar los productos de ${fallidos.join(" y ")}.`);
    if (!tasa) avisos.push("No se pudo cargar la tasa oficial; los precios se muestran solo en dólares.");

    pintarTasa(doc, $("tasa"), tasa);
    pintarProductos();
    pintarTodoElCarrito();
    pintarMensaje(doc, $("aviso"), avisos.join(" "), avisos.length ? cargar : null);
  }

  return {
    async iniciar() {
      $("buscador").addEventListener("input", pintarProductos);
      $("orden").addEventListener("change", () => { orden = $("orden").value; pintarProductos(); });
      await cargar();
    },
  };
}
