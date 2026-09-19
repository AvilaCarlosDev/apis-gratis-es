# Ubicación

[English](README.en.md)

Busca cualquier lugar del mundo (un barrio, una plaza, una ciudad, una dirección) y obtén hasta cinco coincidencias con su dirección, sus coordenadas y un enlace para verlo en el mapa. También estima tu ubicación aproximada, con país, ciudad, IP pública, zona horaria, hora local, prefijo telefónico, proveedor y un mapa incrustado de OpenStreetMap con su marcador. Las coordenadas se muestran en decimales y en grados, minutos y segundos. Es una demo de cómo usar dos APIs gratuitas del [catálogo](../../README.md) sin backend ni claves.

No guarda nada: ni lo que buscas ni tu ubicación.

## Cómo probarla

En línea: https://avilacarlosdev.github.io/apis-gratis-es/demos/ubicacion/

En local, desde la carpeta `demos`:

```bash
cd demos
npm test          # pruebas de todas las demos, con el ejecutor de Node y sin dependencias
npm run servir    # http://localhost:8080/demos/ubicacion/
```

Hace falta Node 22 o superior y Python 3 (solo para servir los archivos).

## APIs que usa

| Para qué | API | Documentación |
|---|---|---|
| Buscar lugares y obtener sus coordenadas | Photon (Komoot) | https://photon.komoot.io/ |
| Estimar el país y la ciudad de tu conexión | ipwho.is | https://ipwho.is/ |

Ambas figuran en [`data/apis.json`](../../data/apis.json) con su última verificación. Una prueba comprueba que siguen ahí, que respondieron bien, que tienen CORS abierto y que sus hosts coinciden con los que la página tiene permitidos.

## Privacidad

La estimación de ubicación **solo se pide cuando pulsas el botón**, nunca al abrir la página. En ese momento tu navegador consulta a ipwho.is, que ve tu dirección IP; es el mismo dato que cualquier sitio recibe cuando lo visitas. La demo no usa la ubicación del navegador ni pide permiso, y el resultado es una estimación que puede caer en otra ciudad, o en otro país si usas una VPN. La dirección IP se muestra solo en tu pantalla y no se guarda.

## Qué pasa cuando algo falla

- Búsqueda demasiado corta: pide al menos dos letras y no llama a la red.
- Lugar que no existe: lo dice en vez de dejar la lista vacía.
- Si falla Photon o ipwho.is, el aviso ofrece reintentar y nunca deja datos viejos como si fueran nuevos.
- Si llega una respuesta más lenta que otra ya pedida, se descarta.
- Los resultados con coordenadas fuera de rango se descartan.

## Seguridad

- Los nombres y las direcciones llegan de las APIs y se tratan como no confiables: se escriben con `textContent`, nunca como HTML.
- El texto de la búsqueda se limpia, se recorta a 80 caracteres y se codifica antes de construir la URL; las coordenadas se validan antes de armar el enlace al mapa.
- La bandera se calcula desde el código de país de dos letras, no se toma de la API.
- Los enlaces al mapa se abren con `rel="noopener noreferrer"`.
- `index.html` declara una política de seguridad de contenido: scripts solo propios, conexiones solo a `photon.komoot.io` e `ipwho.is`, sin imágenes externas y un único marco permitido, el mapa de `www.openstreetmap.org` (se incrusta con `referrerpolicy="no-referrer"`).
- Las peticiones no envían cookies ni referrer.

## Créditos y licencias

- Lugares de [Photon](https://photon.komoot.io/) ([komoot/photon](https://github.com/komoot/photon), Apache-2.0), con datos de © colaboradores de [OpenStreetMap](https://www.openstreetmap.org/copyright), bajo la licencia ODbL. Por eso la página lleva esa atribución.
- Ubicación aproximada de [ipwho.is](https://ipwho.is/).
- Mapa incrustado de [OpenStreetMap](https://www.openstreetmap.org/copyright) (ODbL).
- El diseño de la pantalla se generó con Stitch a partir de una descripción propia de la idea (mostrar dónde estás y buscar lugares); no copia el código, los textos ni el diseño de ninguna página existente.
- Tipografía **Bricolage Grotesque**, con licencia SIL Open Font License 1.1 (ver [`compartido/fuentes/OFL.txt`](../compartido/fuentes/OFL.txt)).
- Código de la demo: MIT, como el resto del repositorio.
