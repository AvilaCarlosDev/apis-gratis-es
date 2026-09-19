export class ErrorDeClima extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorDeClima";
  }
}

export const CIUDADES = [
  { id: "caracas", nombre: "Caracas", latitud: 10.4806, longitud: -66.9036 },
  { id: "maracaibo", nombre: "Maracaibo", latitud: 10.6544, longitud: -71.6406 },
  { id: "bogota", nombre: "Bogotá", latitud: 4.711, longitud: -74.0721 },
  { id: "ciudad-de-mexico", nombre: "Ciudad de México", latitud: 19.4326, longitud: -99.1332 },
  { id: "buenos-aires", nombre: "Buenos Aires", latitud: -34.6037, longitud: -58.3816 },
  { id: "madrid", nombre: "Madrid", latitud: 40.4168, longitud: -3.7038 },
];

// Códigos WMO que usa Open-Meteo: https://open-meteo.com/en/docs#weather_variable_documentation
const DESCRIPCIONES = new Map([
  [0, "Despejado"], [1, "Mayormente despejado"], [2, "Parcialmente nublado"], [3, "Nublado"],
  [45, "Niebla"], [48, "Niebla con escarcha"],
  [51, "Llovizna ligera"], [53, "Llovizna"], [55, "Llovizna intensa"],
  [61, "Lluvia ligera"], [63, "Lluvia"], [65, "Lluvia intensa"],
  [71, "Nevada ligera"], [73, "Nevada"], [75, "Nevada intensa"],
  [80, "Chubascos ligeros"], [81, "Chubascos"], [82, "Chubascos violentos"],
  [95, "Tormenta eléctrica"], [96, "Tormenta con granizo"], [99, "Tormenta con granizo fuerte"],
]);

export const descripcionClima = (codigo) => DESCRIPCIONES.get(codigo) ?? "Condición desconocida";

export const urlClima = (ciudad) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${ciudad.latitud}&longitude=${ciudad.longitud}&current=temperature_2m,weather_code&timezone=auto`;

export function resumenClima(json) {
  const actual = json?.current;
  if (typeof actual?.temperature_2m !== "number" || !Number.isFinite(actual.temperature_2m)) throw new ErrorDeClima("Open-Meteo no devolvió la temperatura actual");
  return { temperatura: actual.temperature_2m, unidad: json.current_units?.temperature_2m ?? "°C", descripcion: descripcionClima(actual.weather_code) };
}
