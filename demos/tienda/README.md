# Tienda demo

[English](README.en.md)

Una tienda de ejemplo que muestra cada precio en dólares y en bolívares a la tasa oficial del día. Sirve para ver, con código real, cómo se combinan cuatro APIs gratuitas del [catálogo](../../README.md) sin backend ni claves.

No vende nada: el carrito vive solo en la página y se pierde al recargar.

## Cómo probarla

```bash
cd demos/tienda
npm test          # pruebas con el ejecutor de Node, sin dependencias
npm run servir    # http://localhost:8080/demos/tienda/
```

Hace falta Node 20 o superior y Python 3 (solo para servir los archivos). No hay `npm install`: no tiene dependencias.

## APIs que usa

| Para qué | API | Documentación |
|---|---|---|
| Tasa oficial del dólar | DolarAPI (Venezuela) | https://dolarapi.com/docs/venezuela/ |
| Productos | FakeStoreAPI | https://fakestoreapi.com/docs |
| Productos | DummyJSON | https://dummyjson.com/docs |
| Clima | Open-Meteo | https://open-meteo.com/en/docs |

Las cuatro figuran en [`data/apis.json`](../../data/apis.json) con su última verificación. Una prueba comprueba que siguen ahí, que respondieron bien y que sus hosts coinciden con los que la página tiene permitidos.

## Qué pasa cuando algo falla

- Sin tasa: los productos siguen visibles solo en dólares y se avisa.
- Sin un proveedor de productos: se muestra el otro y el aviso dice cuál falló.
- Sin clima: solo ese recuadro dice que no está disponible.
- El aviso ofrece reintentar.

## Seguridad

- Los textos y las URL que llegan de las APIs se tratan como no confiables: se escriben con `textContent`, nunca como HTML. Las pruebas usan un DOM falso que lanza un error si algo asigna `innerHTML`.
- Las imágenes solo se aceptan por `https` y desde `fakestoreapi.com` y `cdn.dummyjson.com`.
- `index.html` declara una política de seguridad de contenido: scripts solo propios, conexiones solo a las cuatro APIs.
- Las peticiones no envían cookies ni referrer.

## Créditos y licencias

- **Open-Meteo**: datos meteorológicos de [Open-Meteo.com](https://open-meteo.com/), bajo [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.es). Su nivel gratuito es solo para uso no comercial y admite menos de 10.000 llamadas al día; esta demo no es comercial.
- **DolarAPI**: proyecto [enzonotario/dolarapi.com](https://github.com/enzonotario/dolarapi.com).
- **FakeStoreAPI**: proyecto [keikaavousi/fake-store-api](https://github.com/keikaavousi/fake-store-api).
- **DummyJSON**: proyecto [Ovi/DummyJSON](https://github.com/Ovi/DummyJSON).
- Las cuatro se conocieron a través de [public-apis/public-apis](https://github.com/public-apis/public-apis) (MIT).
- Tipografía **Bricolage Grotesque**, con licencia SIL Open Font License 1.1 (ver [`fuentes/OFL.txt`](fuentes/OFL.txt)).
- Código de la demo: MIT, como el resto del repositorio.
