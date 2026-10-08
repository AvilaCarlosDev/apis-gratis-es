# Ubicación

[English](README.en.md)

Un mapa a pantalla completa, al estilo de las apps de mapas: buscá cualquier lugar del mundo (un barrio, una plaza, una ciudad, una dirección) y sus hasta cinco coincidencias aparecen como alfileres numerados y como fichas con su dirección y sus coordenadas. Tocá cualquier punto del mapa para saber qué hay ahí. Para ubicarte tenés dos caminos: el **GPS** del dispositivo (tu punto exacto, con el permiso del navegador) o una **estimación por IP** (país, ciudad, IP pública, zona horaria, hora local, prefijo, proveedor), que se dibuja como un punto azul con un círculo de precisión. Las coordenadas se muestran en decimales y en grados, minutos y segundos. Es una demo de cómo usar dos APIs gratuitas del [catálogo](../../README.md) sin backend ni claves.

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
| Buscar lugares, sus coordenadas y qué hay en un punto (búsqueda inversa) | Photon (Komoot) | https://photon.komoot.io/ |
| Estimar el país y la ciudad de tu conexión | ipwho.is | https://ipwho.is/ |

Ambas figuran en [`data/apis.json`](../../data/apis.json) con su última verificación. Una prueba comprueba que siguen ahí, que respondieron bien, que tienen CORS abierto y que sus hosts coinciden con los que la página tiene permitidos.

## El mapa

No usa bibliotecas: [`lib/mapa.js`](lib/mapa.js) dibuja las teselas estándar de [OpenStreetMap](https://www.openstreetmap.org/) con la proyección Web Mercator, y se mueve arrastrando (con inercia), con la rueda, con dos dedos, con doble clic, con los botones + y − o con el teclado (flechas, `+` y `-`). Las cuentas (proyección, encuadre de varios puntos, teselas visibles, metros por píxel) son funciones puras con pruebas en [`tests/mapa.test.js`](tests/mapa.test.js). Al encuadrar resultados tiene en cuenta el panel flotante, para que ningún alfiler quede tapado.

Las teselas se piden según la [política de uso de teselas de OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/): llevan la atribución visible y mandan como Referer solo el origen del sitio. Es una demo de poco tráfico; para un uso intensivo hay que usar un proveedor propio de teselas.

## Privacidad

Nada se pide al abrir la página: ni el GPS ni la IP.

- **GPS**: solo al pulsar «Usar mi GPS». El navegador pide permiso y la posición queda en tu pantalla; para mostrar la dirección más cercana, las coordenadas (redondeadas a cinco decimales) se mandan a Photon.
- **IP**: solo al pulsar «Estimar por IP». Tu navegador consulta a ipwho.is, que ve tu dirección IP: es el mismo dato que cualquier sitio recibe cuando lo visitás. El resultado puede caer en otra ciudad, o en otro país si usás una VPN.
- **Tocar el mapa**: manda a Photon las coordenadas del punto tocado.

Nada se guarda: ni lo que buscás ni tu ubicación.

## Qué pasa cuando algo falla

- Búsqueda demasiado corta: pide al menos dos letras y no llama a la red.
- Lugar que no existe: lo dice en vez de dejar la lista vacía.
- Si falla Photon o ipwho.is, el aviso ofrece reintentar y nunca deja datos viejos como si fueran nuevos.
- Si llega una respuesta más lenta que otra ya pedida, se descarta.
- Los resultados con coordenadas fuera de rango se descartan.
- Si negás el permiso del GPS, lo explica y propone la estimación por IP; si el GPS tarda o no puede calcular la posición, ofrece reintentar.

## Seguridad

- Los nombres y las direcciones llegan de las APIs y se tratan como no confiables: se escriben con `textContent`, nunca como HTML.
- El texto de la búsqueda se limpia, se recorta a 80 caracteres y se codifica antes de construir la URL; las coordenadas se validan antes de armar el enlace al mapa.
- La bandera se calcula desde el código de país de dos letras, no se toma de la API.
- Los enlaces al mapa se abren con `rel="noopener noreferrer"`.
- `index.html` declara una política de seguridad de contenido: scripts solo propios, conexiones solo a `photon.komoot.io` e `ipwho.is`, imágenes solo de `tile.openstreetmap.org` (las teselas) y ningún marco.
- Las peticiones a las APIs no envían cookies ni referrer; las teselas mandan solo el origen del sitio, como pide la política de OpenStreetMap.

## Créditos y licencias

- Lugares de [Photon](https://photon.komoot.io/) ([komoot/photon](https://github.com/komoot/photon), Apache-2.0), con datos de © colaboradores de [OpenStreetMap](https://www.openstreetmap.org/copyright), bajo la licencia ODbL. Por eso la página lleva esa atribución.
- Ubicación aproximada de [ipwho.is](https://ipwho.is/).
- Teselas del mapa de [OpenStreetMap](https://www.openstreetmap.org/copyright) (datos ODbL), dibujadas con un visor propio.
- El diseño de la pantalla se generó con Stitch a partir de una descripción propia de la idea (mostrar dónde estás y buscar lugares); no copia el código, los textos ni el diseño de ninguna página existente.
- Tipografías **Bricolage Grotesque** y **Space Mono**, con licencia SIL Open Font License 1.1 (ver [`compartido/fuentes/OFL.txt`](../compartido/fuentes/OFL.txt)).
- Código de la demo: MIT, como el resto del repositorio.
