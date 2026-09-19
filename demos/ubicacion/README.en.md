# Location

[Español](README.md)

Search any place in the world (a neighbourhood, a square, a city, an address) and get up to five matches with their address, coordinates and a link to see them on the map. It can also estimate your approximate location, with country, city, time zone and calling code. It is a demo of using two free APIs from the [catalog](../../README.en.md) with no backend and no keys.

It stores nothing: not what you search and not your location.

## Try it

Online: https://avilacarlosdev.github.io/apis-gratis-es/demos/ubicacion/

Locally, from the `demos` folder:

```bash
cd demos
npm test          # tests for every demo, with Node's runner and no dependencies
npm run servir    # http://localhost:8080/demos/ubicacion/
```

It needs Node 22 or later and Python 3 (only to serve the files).

## APIs it uses

| What for | API | Documentation |
|---|---|---|
| Search places and get their coordinates | Photon (Komoot) | https://photon.komoot.io/ |
| Estimate the country and city of your connection | ipwho.is | https://ipwho.is/ |

Both are listed in [`data/apis.json`](../../data/apis.json) with their latest verification. A test checks that they are still there, that they answered correctly, that they have open CORS and that their hosts match the ones the page allows.

## Privacy

The location estimate is **only requested when you press the button**, never when the page opens. At that moment your browser asks ipwho.is, which sees your IP address; it is the same data any site receives when you visit it. The demo does not use the browser's geolocation and asks for no permission, and the result is an estimate that can land in another city, or another country if you use a VPN. Your IP address is neither shown nor stored.

## What happens when something fails

- Search text too short: it asks for at least two letters and makes no network call.
- A place that does not exist: it says so instead of leaving the list empty.
- If Photon or ipwho.is fails, the notice offers a retry and never leaves old data on screen as if it were new.
- If a slower response arrives after a newer request, it is discarded.
- Results with out-of-range coordinates are dropped.

## Security

- Names and addresses come from the APIs and are treated as untrusted: they are written with `textContent`, never as HTML.
- The search text is cleaned, cut to 80 characters and encoded before the URL is built; coordinates are validated before the map link is made.
- The flag is computed from the two-letter country code, not taken from the API.
- Map links open with `rel="noopener noreferrer"`.
- `index.html` declares a content security policy: only its own scripts, connections only to `photon.komoot.io` and `ipwho.is`, no external images.
- Requests send no cookies and no referrer.

## Credits and licenses

- Places from [Photon](https://photon.komoot.io/) ([komoot/photon](https://github.com/komoot/photon), Apache-2.0), with data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, under the ODbL license. That is why the page carries this attribution.
- Approximate location from [ipwho.is](https://ipwho.is/). Its free endpoint allows 1,000 requests per day per client IP and permits commercial use; Photon's data requires crediting OpenStreetMap and fair use, because extensive usage is throttled.
- **Bricolage Grotesque** typeface, under the SIL Open Font License 1.1 (see [`compartido/fuentes/OFL.txt`](../compartido/fuentes/OFL.txt)).
- Demo code: MIT, like the rest of the repository.
