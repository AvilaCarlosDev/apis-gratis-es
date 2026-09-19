export class ErrorDeRed extends Error {
  constructor(mensaje, estado = null) {
    super(mensaje);
    this.name = "ErrorDeRed";
    this.estado = estado;
  }
}

export async function pedirJson(url, { fetch: pedir = globalThis.fetch, tiempoMs = 8000 } = {}) {
  if (typeof url !== "string" || !url.startsWith("https://")) throw new ErrorDeRed("Solo se permiten URL https");
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), tiempoMs);
  try {
    const respuesta = await pedir(url, { signal: control.signal, credentials: "omit", referrerPolicy: "no-referrer", headers: { accept: "application/json" } });
    if (!respuesta.ok) throw new ErrorDeRed(`La API respondió ${respuesta.status}`, respuesta.status);
    try {
      return await respuesta.json();
    } catch {
      throw new ErrorDeRed("La API no devolvió JSON válido", respuesta.status);
    }
  } catch (e) {
    if (e instanceof ErrorDeRed) throw e;
    if (control.signal.aborted) throw new ErrorDeRed("Se superó el tiempo de espera");
    throw new ErrorDeRed("No se pudo conectar con la API");
  } finally {
    clearTimeout(temporizador);
  }
}
