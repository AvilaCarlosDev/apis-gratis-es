# Enciclopedia al paso (Encyclopedia on the go)

[Español](README.md)

Type a topic (a person, a place, a dish, a concept) and get up to five matches from Spanish Wikipedia. Pick one to see its summary with the main image, a link to the full article and the license attribution. There is also a random-article button. It is a demo of using one free API from the [catalog](../../README.en.md) with no backend and no keys.

It stores nothing: neither what you search nor what you read.

## Try it

Online: https://avilacarlosdev.github.io/apis-gratis-es/demos/wikipedia/

Locally, from the `demos` folder:

```bash
cd demos
npm test          # tests for all demos, using Node's built-in runner and no dependencies
npm run servir    # http://localhost:8080/demos/wikipedia/
```

You need Node 22 or newer and Python 3 (only to serve the files).

## API it uses

| Purpose | Route | Documentation |
|---|---|---|
| Search articles by title | `/w/rest.php/v1/search/title` | https://es.wikipedia.org/api/rest_v1/ |
| Summary of an article | `/api/rest_v1/page/summary/{title}` | https://es.wikipedia.org/api/rest_v1/ |
| Summary of a random article | `/api/rest_v1/page/random/summary` | https://es.wikipedia.org/api/rest_v1/ |

All three routes are on the same host (`es.wikipedia.org`) and appear in [`data/apis.json`](../../data/apis.json) as `wikipedia-resumen`, with their latest verification. A test checks that the entry exists, that it answered correctly, that it has open CORS and that its host matches the one the page allows.

For a browser with no logged-in user, Wikimedia documents a limit of 200 requests per minute, plenty for this demo.

## What happens when something fails

- Search too short: it asks for at least two letters and makes no network call.
- A topic that does not exist, or a search with no results: it says so with a message instead of leaving the screen empty.
- A disambiguation page (for example "Mercurio"): it is flagged as a topic with several meanings.
- If the search or the summary fails, the notice offers to retry and the list of matches is kept.
- A response slower than a newer request is discarded.

## Security

- Everything that comes from the API is treated as untrusted and written with `textContent`, never as HTML. `title` is used instead of `displaytitle`, because the latter contains HTML.
- Images are accepted only from `thumb.wikimedia.org`, and the article link only if it is on `es.wikipedia.org`; anything else is dropped.
- The search text is cleaned, trimmed to 80 characters and encoded before building the URL; the article title is encoded before entering the path.
- External links open with `rel="noopener noreferrer"`.
- `index.html` declares a content security policy: own scripts only, connections only to `es.wikipedia.org` and images only from `thumb.wikimedia.org`.
- Requests send no cookies or referrer.

## Credits and licenses

- Text and data from [Spanish Wikipedia](https://es.wikipedia.org/), by the [Wikimedia Foundation](https://wikimediafoundation.org/), under the [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) license. That is why each summary carries this attribution and a link to the article history, where its authors are listed. Each image may have its own license, shown on the article page.
- The catalog learned about it thanks to [public-apis/public-apis](https://github.com/public-apis/public-apis) (MIT).
- **Bricolage Grotesque**, **Newsreader** and **Space Mono** typefaces, under the SIL Open Font License 1.1 (see [`compartido/fuentes/OFL.txt`](../compartido/fuentes/OFL.txt)).
- The screen design was generated with Stitch from our own description of the idea (look up a topic and read its summary); it does not copy the code, texts or design of any existing page.
- Demo code: MIT, like the rest of the repository.
