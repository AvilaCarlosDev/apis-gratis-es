# Location

[Español](README.md)

A full-screen map in the style of map apps: search any place in the world (a neighbourhood, a square, a city, an address) and up to five matches appear as numbered pins and as cards with their address and coordinates. Tap any point on the map to find out what is there. To locate yourself there are two ways: the device **GPS** (your exact spot, with the browser's permission) or an **IP estimate** (country, city, public IP, time zone, local time, calling code, provider), drawn as a blue dot with an accuracy circle. Coordinates are shown in decimal degrees and in degrees, minutes and seconds. It is a demo of using two free APIs from the [catalog](../../README.en.md) with no backend and no keys.

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

## The map

It uses no libraries: [`lib/mapa.js`](lib/mapa.js) draws the standard [OpenStreetMap](https://www.openstreetmap.org/) tiles with the Web Mercator projection, and moves by dragging (with inertia), with the wheel, with two fingers, with double click, with the + and − buttons or with the keyboard (arrows, `+` and `-`). The maths (projection, fitting several points, visible tiles, metres per pixel) are pure functions tested in [`tests/mapa.test.js`](tests/mapa.test.js). When fitting results it accounts for the floating panel, so no pin is hidden.

Tiles are requested following the [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/): they carry visible attribution and send only the site origin as Referer. This is a low-traffic demo; heavy use needs its own tile provider.

## Privacy

Nothing is requested when the page opens: neither GPS nor IP.

- **GPS**: only when you press "Usar mi GPS". The browser asks for permission and the position stays on your screen; to show the nearest address, the coordinates (rounded to five decimals) are sent to Photon.
- **IP**: only when you press "Estimar por IP". Your browser asks ipwho.is, which sees your IP address: the same data any site receives when you visit it. The result can land in another city, or another country if you use a VPN.
- **Tapping the map**: sends the tapped point's coordinates to Photon.

Nothing is stored: not what you search and not your location.

## What happens when something fails

- Search text too short: it asks for at least two letters and makes no network call.
- A place that does not exist: it says so instead of leaving the list empty.
- If Photon or ipwho.is fails, the notice offers a retry and never leaves old data on screen as if it were new.
- If a slower response arrives after a newer request, it is discarded.
- Results with out-of-range coordinates are dropped.
- If you deny GPS permission, it explains it and suggests the IP estimate; if GPS times out or cannot compute a position, it offers a retry.

## Security

- Names and addresses come from the APIs and are treated as untrusted: they are written with `textContent`, never as HTML.
- The search text is cleaned, cut to 80 characters and encoded before the URL is built; coordinates are validated before the map link is made.
- The flag is computed from the two-letter country code, not taken from the API.
- Map links open with `rel="noopener noreferrer"`.
- `index.html` declares a content security policy: only its own scripts, connections only to `photon.komoot.io` and `ipwho.is`, images only from `tile.openstreetmap.org` (the tiles) and no frames.
- API requests send no cookies and no referrer; tiles send only the site origin, as the OpenStreetMap policy asks.

## Credits and licenses

- Places from [Photon](https://photon.komoot.io/) ([komoot/photon](https://github.com/komoot/photon), Apache-2.0), with data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, under the ODbL license. That is why the page carries this attribution.
- Approximate location from [ipwho.is](https://ipwho.is/).
- Map tiles from [OpenStreetMap](https://www.openstreetmap.org/copyright) (ODbL data), drawn with our own viewer.
- The screen design was generated with Stitch from our own description of the idea (show where you are and search places); it does not copy the code, texts or design of any existing page.
- **Bricolage Grotesque** and **Space Mono** typefaces, under the SIL Open Font License 1.1 (see [`compartido/fuentes/OFL.txt`](../compartido/fuentes/OFL.txt)).
- Demo code: MIT, like the rest of the repository.
