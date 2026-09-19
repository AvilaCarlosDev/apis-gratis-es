# Feriados

[English](README.en.md)

Los feriados de cada año en 20 países de habla hispana y portuguesa, con el próximo feriado, los días que faltan la lista por mes con los fines de semana largos marcados (feriado en lunes o viernes) y un botón para descargar el año en CSV. Se puede cambiar de país y de año. Es una demo de cómo usar una API gratuita del [catálogo](../../README.md) sin backend ni claves.

No guarda nada: ni el país ni el año. Arranca en Venezuela, con el año en curso.

## Cómo probarla

En línea: https://avilacarlosdev.github.io/apis-gratis-es/demos/feriados/

En local, desde la carpeta `demos`:

```bash
cd demos
npm test          # pruebas de todas las demos, con el ejecutor de Node y sin dependencias
npm run servir    # http://localhost:8080/demos/feriados/
```

Hace falta Node 22 o superior y Python 3 (solo para servir los archivos).

## API que usa

| Para qué | API | Documentación |
|---|---|---|
| Feriados públicos de un país y un año | Nager.Date | https://date.nager.at/Api |

Figura en [`data/apis.json`](../../data/apis.json) con su última verificación. Una prueba comprueba que sigue ahí, que respondió bien, que tiene CORS abierto y que su host coincide con el que la página tiene permitido.

## Qué pasa cuando algo falla

- Si la API no responde, el aviso ofrece reintentar y no deja la lista anterior como si fuera la del país o el año elegidos.
- Si llega una respuesta más lenta que otra ya pedida, se descarta.
- Solo se muestran los feriados de todo el país; los que la API marca como regionales se omiten.
- El próximo feriado se calcula solo para el año en curso.

## Seguridad

- Los nombres de los feriados llegan de la API y se tratan como no confiables: se escriben con `textContent`, nunca como HTML.
- El CSV neutraliza los textos que empiezan por `=`, `+`, `-` o `@` para que una hoja de cálculo no los ejecute como fórmula.
- El país solo puede ser uno de la lista del selector y el año un número entre 2000 y 2100; se validan antes de construir la URL.
- `index.html` declara una política de seguridad de contenido: scripts solo propios, conexiones solo a `date.nager.at`, sin imágenes externas.
- Las peticiones no envían cookies ni referrer.

## Créditos y licencias

- Feriados de [Nager.Date](https://date.nager.at/), proyecto de código abierto bajo licencia MIT ([nager/Nager.Date](https://github.com/nager/Nager.Date)).
- Tipografía **Bricolage Grotesque**, con licencia SIL Open Font License 1.1 (ver [`compartido/fuentes/OFL.txt`](../compartido/fuentes/OFL.txt)).
- El diseño de la pantalla se generó con Stitch a partir de una descripción propia de la idea (elegir país y año, ver el próximo feriado y la lista); no copia el código, los textos ni el diseño de ninguna página existente.
- Código de la demo: MIT, como el resto del repositorio.
