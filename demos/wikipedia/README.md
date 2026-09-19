# Enciclopedia al paso

[English](README.en.md)

Escribes un tema (un personaje, un lugar, una comida, un concepto) y obtienes hasta cinco coincidencias de Wikipedia en español. Al elegir una, ves su síntesis con la imagen principal, un enlace al artículo completo y la atribución de la licencia. También hay un botón de artículo al azar. Es una demo de cómo usar una API gratuita del [catálogo](../../README.md) sin backend ni claves.

No guarda nada: ni lo que buscas ni lo que lees.

## Cómo probarla

En línea: https://avilacarlosdev.github.io/apis-gratis-es/demos/wikipedia/

En local, desde la carpeta `demos`:

```bash
cd demos
npm test          # pruebas de todas las demos, con el ejecutor de Node y sin dependencias
npm run servir    # http://localhost:8080/demos/wikipedia/
```

Hace falta Node 22 o superior y Python 3 (solo para servir los archivos).

## API que usa

| Para qué | Ruta | Documentación |
|---|---|---|
| Buscar artículos por título | `/w/rest.php/v1/search/title` | https://es.wikipedia.org/api/rest_v1/ |
| Resumen de un artículo | `/api/rest_v1/page/summary/{título}` | https://es.wikipedia.org/api/rest_v1/ |
| Resumen de un artículo al azar | `/api/rest_v1/page/random/summary` | https://es.wikipedia.org/api/rest_v1/ |

Las tres rutas son del mismo host (`es.wikipedia.org`) y figuran en [`data/apis.json`](../../data/apis.json) como `wikipedia-resumen`, con su última verificación. Una prueba comprueba que la entrada existe, que respondió bien, que tiene CORS abierto y que su host coincide con el que la página tiene permitido.

Desde un navegador sin sesión iniciada, Wikimedia documenta un límite de 200 peticiones por minuto, de sobra para esta demo.

## Qué pasa cuando algo falla

- Búsqueda demasiado corta: pide al menos dos letras y no llama a la red.
- Tema que no existe, o búsqueda sin resultados: lo dice con un mensaje en vez de dejar la pantalla vacía.
- Página de desambiguación (por ejemplo «Mercurio»): la marca como tema con varios significados.
- Si falla la búsqueda o el resumen, el aviso ofrece reintentar y la lista de coincidencias se conserva.
- Si llega una respuesta más lenta que otra ya pedida, se descarta.

## Seguridad

- Todo lo que llega de la API se trata como no confiable y se escribe con `textContent`, nunca como HTML. Se usa `title` y no `displaytitle`, porque este último trae HTML.
- Las imágenes solo se aceptan si vienen de `thumb.wikimedia.org`, y el enlace al artículo solo si es de `es.wikipedia.org`; cualquier otro se descarta.
- El texto de la búsqueda se limpia, se recorta a 80 caracteres y se codifica antes de construir la URL; el título del artículo se codifica antes de entrar en la ruta.
- Los enlaces externos se abren con `rel="noopener noreferrer"`.
- `index.html` declara una política de seguridad de contenido: scripts solo propios, conexiones solo a `es.wikipedia.org` e imágenes solo de `thumb.wikimedia.org`.
- Las peticiones no envían cookies ni referrer.

## Créditos y licencias

- Textos y datos de [Wikipedia en español](https://es.wikipedia.org/), de la [Fundación Wikimedia](https://wikimediafoundation.org/), bajo licencia [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Por eso cada resumen lleva esa atribución y un enlace al historial del artículo, donde figuran sus autores. Cada imagen puede tener su propia licencia, indicada en la página del artículo.
- El catálogo la conoció gracias a [public-apis/public-apis](https://github.com/public-apis/public-apis) (MIT).
- Tipografías **Bricolage Grotesque**, **Newsreader** y **Space Mono**, con licencia SIL Open Font License 1.1 (ver [`compartido/fuentes/OFL.txt`](../compartido/fuentes/OFL.txt)).
- El diseño de la pantalla se generó con Stitch a partir de una descripción propia de la idea (buscar un tema y leer su síntesis); no copia el código, los textos ni el diseño de ninguna página existente.
- Código de la demo: MIT, como el resto del repositorio.
