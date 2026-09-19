import { HOSTS_IMAGEN } from "./config.js";
import { esUrlPermitida, limitarTexto } from "../../compartido/seguro.js";

export class ErrorDeRespuesta extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorDeRespuesta";
  }
}

function normalizarUno(proveedor, id, titulo, precio, imagen, categoria) {
  const tituloLimpio = limitarTexto(titulo, 120);
  if (id === null || id === undefined || tituloLimpio === "" || !Number.isFinite(precio) || precio <= 0) return null;
  return {
    id: `${proveedor}-${id}`,
    titulo: tituloLimpio,
    precioUsd: precio,
    imagen: esUrlPermitida(imagen, HOSTS_IMAGEN) ? imagen : null,
    categoria: limitarTexto(categoria, 40),
  };
}

function normalizarLista(lista, convertir) {
  const productos = [];
  let descartados = 0;
  for (const item of lista) {
    const p = item !== null && typeof item === "object" ? convertir(item) : null;
    if (p) productos.push(p);
    else descartados++;
  }
  return { productos, descartados };
}

export function normalizarFakeStore(json) {
  if (!Array.isArray(json)) throw new ErrorDeRespuesta("FakeStoreAPI no devolvió una lista de productos");
  return normalizarLista(json, (i) => normalizarUno("fakestore", i.id, i.title, i.price, i.image, i.category));
}

export function normalizarDummyJson(json) {
  if (json === null || typeof json !== "object" || !Array.isArray(json.products)) throw new ErrorDeRespuesta("DummyJSON no devolvió { products: [...] }");
  return normalizarLista(json.products, (i) => normalizarUno("dummyjson", i.id, i.title, i.price, i.thumbnail, i.category));
}
