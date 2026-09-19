// DOM mínimo para probar el renderizado sin dependencias. Lo importante: asignar innerHTML
// (o outerHTML, insertAdjacentHTML) lanza un error, así que cualquier ruta de inyección de HTML
// que use datos de una API se detecta en las pruebas.
class Nodo {
  constructor(etiqueta, doc) {
    this.etiqueta = etiqueta;
    this.doc = doc;
    this.hijos = [];
    this.atributos = new Map();
    this.escuchas = new Map();
    this.clases = new Set();
    this._texto = "";
    this.hidden = false;
    this.disabled = false;
    this.value = "";
  }
  get classList() {
    const clases = this.clases;
    return { add: (...c) => c.forEach((x) => clases.add(x)), remove: (...c) => c.forEach((x) => clases.delete(x)), contains: (c) => clases.has(c),
      toggle: (c, forzar) => { const activa = forzar ?? !clases.has(c); activa ? clases.add(c) : clases.delete(c); return activa; } };
  }
  set className(valor) { this.clases = new Set(String(valor).split(/\s+/).filter(Boolean)); }
  get className() { return [...this.clases].join(" "); }
  set textContent(valor) { this.hijos = []; this._texto = String(valor); }
  get textContent() { return this._texto + this.hijos.map((h) => h.textContent).join(""); }
  set innerHTML(_) { throw new Error("innerHTML está prohibido: usa textContent o createElement"); }
  set outerHTML(_) { throw new Error("outerHTML está prohibido"); }
  insertAdjacentHTML() { throw new Error("insertAdjacentHTML está prohibido"); }
  setAttribute(nombre, valor) { this.atributos.set(nombre, String(valor)); }
  getAttribute(nombre) { return this.atributos.has(nombre) ? this.atributos.get(nombre) : null; }
  removeAttribute(nombre) { this.atributos.delete(nombre); }
  set src(valor) { this.setAttribute("src", valor); }
  get src() { return this.getAttribute("src"); }
  set alt(valor) { this.setAttribute("alt", valor); }
  get alt() { return this.getAttribute("alt"); }
  appendChild(hijo) { this.hijos.push(hijo); return hijo; }
  append(...hijos) { hijos.forEach((h) => this.hijos.push(typeof h === "string" ? this.doc.createTexto(h) : h)); }
  replaceChildren(...hijos) { this._texto = ""; this.hijos = []; this.append(...hijos); }
  addEventListener(tipo, fn) { this.escuchas.set(tipo, [...(this.escuchas.get(tipo) ?? []), fn]); }
  async disparar(tipo, evento = {}) { for (const fn of this.escuchas.get(tipo) ?? []) await fn({ target: this, ...evento }); }
  buscar(predicado, acumulado = []) {
    if (predicado(this)) acumulado.push(this);
    this.hijos.forEach((h) => h.buscar?.(predicado, acumulado));
    return acumulado;
  }
  porEtiqueta(etiqueta) { return this.buscar((n) => n.etiqueta === etiqueta); }
  porTexto(texto) { return this.buscar((n) => n.hijos.length === 0 && n._texto.includes(texto)); }
}

class Texto {
  constructor(texto) { this.etiqueta = "#texto"; this._texto = String(texto); this.hijos = []; }
  get textContent() { return this._texto; }
}

export function crearDocumentoFalso(ids = []) {
  const doc = {
    registro: new Map(),
    createElement(etiqueta) { return new Nodo(etiqueta, doc); },
    createTexto(texto) { return new Texto(texto); },
    createTextNode(texto) { return new Texto(texto); },
    getElementById(id) { return doc.registro.get(id) ?? null; },
  };
  for (const id of ids) doc.registro.set(id, new Nodo("div", doc));
  return doc;
}
