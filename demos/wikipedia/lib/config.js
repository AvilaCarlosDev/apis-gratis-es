// Hosts a los que la demo se conecta; deben coincidir con el catálogo y con la CSP de index.html.
export const HOSTS_API = ["es.wikipedia.org"];
// Las miniaturas y la imagen principal se sirven desde este host; cualquier otro se descarta.
export const HOSTS_IMAGENES = ["thumb.wikimedia.org"];

export const LIMITE_COINCIDENCIAS = 5;
export const MINIMO_TEXTO = 2;
export const MAXIMO_TEXTO = 80;
export const MAXIMO_EXTRACTO = 1500;

export const SUGERENCIAS = ["Simón Bolívar", "Volcán", "Arepa", "Glaciar Perito Moreno", "Tango"];
export const URL_AZAR = "https://es.wikipedia.org/api/rest_v1/page/random/summary";
