# Weather

[Español](README.md)

Today's weather and a seven-day forecast for any city, with temperature, feels-like, humidity, wind and chance of rain. You can switch between °C and °F. It shows how to use two free APIs from the [catalog](../../README.en.md) with no backend and no keys.

It stores nothing: not your search and not your location. It starts in Caracas.

## Try it

Online: https://avilacarlosdev.github.io/apis-gratis-es/demos/clima/

Locally, from the `demos` folder:

```bash
cd demos
npm test          # tests for every demo, with Node's built-in runner and no dependencies
npm run servir    # http://localhost:8080/demos/clima/
```

Requires Node 22+ and Python 3 (only to serve the files).

## APIs used

| Purpose | API | Documentation |
|---|---|---|
| Find a city and get its coordinates | Open-Meteo, geocoding | https://open-meteo.com/en/docs/geocoding-api |
| Forecast by coordinates | Open-Meteo, forecast | https://open-meteo.com/en/docs |

Both are listed in [`data/apis.json`](../../data/apis.json) with their latest verification. A test checks that they are still there, that they answered correctly and that their hosts match the ones the page allows.

## When something fails

- Search too short: asks for at least two letters and makes no request.
- City that does not exist: says so and keeps the previous forecast. The API does not return an empty list, it omits the `results` field, and the demo treats that as "no results".
- If the search or the forecast fails, the notice offers a retry and never leaves old data looking new.
- A slower response that arrives after a newer request is discarded.

## Security

- Place names come from the API and are untrusted: they are written with `textContent`, never as HTML.
- Coordinates are validated before the URL is built.
- `index.html` declares a Content Security Policy: own scripts only, connections only to the two Open-Meteo hosts, no external images.
- Requests send no cookies and no referrer.

## Credits and licenses

- Weather data by [Open-Meteo.com](https://open-meteo.com/), under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Its free tier is non-commercial only and allows fewer than 10,000 calls per day; this demo is non-commercial.
- Open-Meteo was found through [public-apis/public-apis](https://github.com/public-apis/public-apis) (MIT).
- **Bricolage Grotesque** typeface, SIL Open Font License 1.1 (see [`compartido/fuentes/OFL.txt`](../compartido/fuentes/OFL.txt)).
- Demo code: MIT, like the rest of the repository.
