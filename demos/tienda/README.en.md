# Demo store

[Español](README.md)

A sample store that shows every price in US dollars and in Venezuelan bolívares at the day's official rate. It shows, with real code, how four free APIs from the [catalog](../../README.en.md) combine with no backend and no keys.

It sells nothing: the cart lives only on the page and is lost on reload.

## Try it

```bash
cd demos/tienda
npm test          # tests with Node's built-in runner, no dependencies
npm run servir    # http://localhost:8080/demos/tienda/
```

Requires Node 22+ and Python 3 (only to serve the files). There is no `npm install`: it has no dependencies.

## APIs used

| Purpose | API | Documentation |
|---|---|---|
| Official dollar rate | DolarAPI (Venezuela) | https://dolarapi.com/docs/venezuela/ |
| Products | FakeStoreAPI | https://fakestoreapi.com/docs |
| Products | DummyJSON | https://dummyjson.com/docs |
| Weather | Open-Meteo | https://open-meteo.com/en/docs |

All four are listed in [`data/apis.json`](../../data/apis.json) with their latest verification. A test checks that they are still there, that they answered correctly and that their hosts match the ones the page allows.

## When something fails

- No rate: products stay visible in dollars only, with a notice.
- One product provider down: the other is shown and the notice names the one that failed.
- No weather: only that box says it is unavailable.
- The notice offers a retry.

## Security

- Text and URLs coming from the APIs are untrusted: they are written with `textContent`, never as HTML. Tests use a fake DOM that throws if anything assigns `innerHTML`.
- Images are accepted only over `https` and only from `fakestoreapi.com` and `cdn.dummyjson.com`.
- `index.html` declares a Content Security Policy: own scripts only, connections only to the four APIs.
- Requests send no cookies and no referrer.

## Credits and licenses

- **Open-Meteo**: weather data by [Open-Meteo.com](https://open-meteo.com/), under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Its free tier is non-commercial only and allows fewer than 10,000 calls per day; this demo is non-commercial.
- **DolarAPI**: project [enzonotario/dolarapi.com](https://github.com/enzonotario/dolarapi.com).
- **FakeStoreAPI**: project [keikaavousi/fake-store-api](https://github.com/keikaavousi/fake-store-api).
- **DummyJSON**: project [Ovi/DummyJSON](https://github.com/Ovi/DummyJSON).
- All four were found through [public-apis/public-apis](https://github.com/public-apis/public-apis) (MIT).
- **Bricolage Grotesque** typeface, SIL Open Font License 1.1 (see [`fuentes/OFL.txt`](fuentes/OFL.txt)).
- Demo code: MIT, like the rest of the repository.
