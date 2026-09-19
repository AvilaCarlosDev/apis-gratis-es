# Holidays

[Español](README.md)

The public holidays of each year in 20 Spanish- and Portuguese-speaking countries, with the next holiday, the days left and a month-by-month list. You can switch country and year. It is a demo of using one free API from the [catalog](../../README.en.md) with no backend and no keys.

It stores nothing: not the country and not the year. It starts on Venezuela, with the current year.

## Try it

Online: https://avilacarlosdev.github.io/apis-gratis-es/demos/feriados/

Locally, from the `demos` folder:

```bash
cd demos
npm test          # tests for every demo, with Node's runner and no dependencies
npm run servir    # http://localhost:8080/demos/feriados/
```

It needs Node 22 or later and Python 3 (only to serve the files).

## API it uses

| What for | API | Documentation |
|---|---|---|
| Public holidays for a country and a year | Nager.Date | https://date.nager.at/Api |

It is listed in [`data/apis.json`](../../data/apis.json) with its latest verification. A test checks that it is still there, that it answered correctly, that it has open CORS and that its host matches the one the page allows.

## What happens when something fails

- If the API does not answer, the notice offers a retry and never leaves the previous list on screen as if it belonged to the chosen country or year.
- If a slower response arrives after a newer request, it is discarded.
- Only nationwide holidays are shown; the ones the API marks as regional are left out.
- The next holiday is computed only for the current year.

## Security

- Holiday names come from the API and are treated as untrusted: they are written with `textContent`, never as HTML.
- The country can only be one from the selector's list and the year a number between 2000 and 2100; both are validated before the URL is built.
- `index.html` declares a content security policy: only its own scripts, connections only to `date.nager.at`, no external images.
- Requests send no cookies and no referrer.

## Credits and licenses

- Holidays from [Nager.Date](https://date.nager.at/), an open-source project under the MIT license ([nager/Nager.Date](https://github.com/nager/Nager.Date)).
- **Bricolage Grotesque** typeface, under the SIL Open Font License 1.1 (see [`compartido/fuentes/OFL.txt`](../compartido/fuentes/OFL.txt)).
- Demo code: MIT, like the rest of the repository.
