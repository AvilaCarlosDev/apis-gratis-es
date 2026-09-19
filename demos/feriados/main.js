import { crearApp } from "./lib/app.js";

function descargar(nombre, contenido) {
  const url = URL.createObjectURL(new Blob([contenido], { type: "text/csv;charset=utf-8" }));
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}

crearApp({ doc: document, fetch: (...args) => fetch(...args), descargar }).iniciar();
