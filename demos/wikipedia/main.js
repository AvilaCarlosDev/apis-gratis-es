import { crearApp } from "./lib/app.js";

crearApp({ doc: document, fetch: (...args) => fetch(...args) }).iniciar();
