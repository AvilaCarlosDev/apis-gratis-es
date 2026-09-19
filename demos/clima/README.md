# Clima

[English](README.en.md)

El clima de hoy y el pronóstico de siete días de cualquier ciudad, con temperatura, sensación térmica, humedad, viento y probabilidad de lluvia. Se puede cambiar entre °C y °F. Es una demo de cómo usar dos APIs gratuitas del [catálogo](../../README.md) sin backend ni claves.

No guarda nada: ni la búsqueda ni la ubicación. Arranca en Caracas.

## Cómo probarla

En línea: https://avilacarlosdev.github.io/apis-gratis-es/demos/clima/

En local, desde la carpeta `demos`:

```bash
cd demos
npm test          # pruebas de todas las demos, con el ejecutor de Node y sin dependencias
npm run servir    # http://localhost:8080/demos/clima/
```

Hace falta Node 22 o superior y Python 3 (solo para servir los archivos).

## APIs que usa

| Para qué | API | Documentación |
|---|---|---|
| Buscar una ciudad y obtener sus coordenadas | Open-Meteo, geocodificación | https://open-meteo.com/en/docs/geocoding-api |
| Pronóstico por coordenadas | Open-Meteo, pronóstico | https://open-meteo.com/en/docs |

Ambas figuran en [`data/apis.json`](../../data/apis.json) con su última verificación. Una prueba comprueba que siguen ahí, que respondieron bien y que sus hosts coinciden con los que la página tiene permitidos.

## Qué pasa cuando algo falla

- Búsqueda demasiado corta: pide al menos dos letras y no llama a la red.
- Ciudad que no existe: lo dice y conserva el pronóstico anterior. La API no devuelve una lista vacía sino que omite el campo `results`, y la demo lo trata como "sin resultados".
- Si falla la búsqueda o el pronóstico, el aviso ofrece reintentar y nunca deja datos viejos como si fueran nuevos.
- Si llega una respuesta más lenta que otra ya pedida, se descarta.

## Seguridad

- Los nombres de lugares llegan de la API y se tratan como no confiables: se escriben con `textContent`, nunca como HTML.
- Las coordenadas se validan antes de construir la URL.
- `index.html` declara una política de seguridad de contenido: scripts solo propios, conexiones solo a los dos hosts de Open-Meteo, sin imágenes externas.
- Las peticiones no envían cookies ni referrer.

## Créditos y licencias

- Datos meteorológicos de [Open-Meteo.com](https://open-meteo.com/), bajo [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.es). Su nivel gratuito es solo para uso no comercial y admite menos de 10.000 llamadas al día; esta demo no es comercial.
- Open-Meteo se conoció a través de [public-apis/public-apis](https://github.com/public-apis/public-apis) (MIT).
- Tipografía **Bricolage Grotesque**, con licencia SIL Open Font License 1.1 (ver [`compartido/fuentes/OFL.txt`](../compartido/fuentes/OFL.txt)).
- Código de la demo: MIT, como el resto del repositorio.
