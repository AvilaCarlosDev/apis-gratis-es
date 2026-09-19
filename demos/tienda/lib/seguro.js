export function esUrlPermitida(valor, hosts) {
  if (typeof valor !== "string") return false;
  let url;
  try {
    url = new URL(valor);
  } catch {
    return false;
  }
  return url.protocol === "https:" && url.username === "" && url.password === "" && hosts.includes(url.hostname);
}

export function limitarTexto(valor, max) {
  if (typeof valor !== "string") return "";
  const texto = valor.trim();
  return texto.length > max ? `${texto.slice(0, max - 1)}…` : texto;
}
