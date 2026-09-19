import { pedirJson } from "./api.js";
import { tasaOficial } from "./cambio.js";
import { agregar, cambiarCantidad, cantidadTotal, carritoVacio, quitar } from "./carrito.js";
import { CIUDADES, resumenClima, urlClima } from "./clima.js";
import { URL_DUMMYJSON, URL_FAKESTORE, URL_TASA } from "./config.js";
import { normalizarDummyJson, normalizarFakeStore } from "./productos.js";
import { pintarCarrito, pintarClima, pintarMensaje, pintarTasa, tarjetaProducto } from "./render.js";

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
  let pedidoClima = 0;

  const pintarProductos = () => $("productos").replaceChildren(...productos.map((p) => tarjetaProducto(doc, p, tasa, alAgregar)));
  const pintarTodoElCarrito = () => {
    pintarCarrito(doc, $("carrito"), carrito, tasa, { quitar: alQuitar, cambiar: alCambiar, vaciar: alVaciar });
    $("contador").textContent = String(cantidadTotal(carrito));
  };
  const actualizarCarrito = (nuevo) => { carrito = nuevo; pintarTodoElCarrito(); };
  const alAgregar = (producto) => actualizarCarrito(agregar(carrito, producto));
  const alQuitar = (id) => actualizarCarrito(quitar(carrito, id));
  const alCambiar = (id, cantidad) => actualizarCarrito(cambiarCantidad(carrito, id, cantidad));
  const alVaciar = () => actualizarCarrito(carritoVacio());

  async function cargarClima(ciudad) {
    const pedido = ++pedidoClima;
    let clima = null;
    try {
      clima = resumenClima(await pedir(urlClima(ciudad)));
    } catch {
      clima = null;
    }
    if (pedido === pedidoClima) pintarClima(doc, $("clima"), clima);
  }

  async function cargarTiendaYTasa() {
    const [resTasa, ...resProductos] = await Promise.allSettled([
      pedir(URL_TASA).then(tasaOficial),
      ...PROVEEDORES.map((p) => pedir(p.url).then(p.normalizar)),
    ]);
    tasa = resTasa.status === "fulfilled" ? resTasa.value : null;
    productos = resProductos.flatMap((r) => (r.status === "fulfilled" ? r.value.productos : []));
    const fallidos = PROVEEDORES.filter((_, i) => resProductos[i].status === "rejected").map((p) => p.nombre);

    const avisos = [];
    if (fallidos.length === PROVEEDORES.length) avisos.push("No se pudieron cargar los productos.");
    else if (fallidos.length) avisos.push(`No se pudieron cargar los productos de ${fallidos.join(" y ")}.`);
    if (!tasa) avisos.push("No se pudo cargar la tasa oficial; los precios se muestran solo en dólares.");

    pintarTasa(doc, $("tasa"), tasa);
    pintarProductos();
    pintarTodoElCarrito();
    pintarMensaje(doc, $("aviso"), avisos.join(" "), avisos.length ? cargarTiendaYTasa : null);
  }

  return {
    async iniciar() {
      const selector = $("selector-ciudad");
      selector.replaceChildren(...CIUDADES.map((c) => {
        const opcion = doc.createElement("option");
        opcion.value = c.id;
        opcion.textContent = c.nombre;
        return opcion;
      }));
      selector.value = CIUDADES[0].id;
      selector.addEventListener("change", () => {
        const ciudad = CIUDADES.find((c) => c.id === selector.value);
        if (ciudad) return cargarClima(ciudad);
      });
      await Promise.all([cargarTiendaYTasa(), cargarClima(CIUDADES[0])]);
    },
  };
}
