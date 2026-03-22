# Kauravi website

Single-page site for **Kauravi.com** — Western Uttar Pradesh heritage, Shabdkosh (dictionary), Baithak (community), and long-form Heritage reading. Built with Vite, vanilla JavaScript, and Tailwind CSS v3.

## Run locally

**Requirements:** [Node.js](https://nodejs.org/) 18 or newer (20+ recommended).

```bash
cd kauravi-website
npm install
npm run dev
```

Vite prints a local URL (usually `http://localhost:5173`). Open it in your browser. The app uses hash routes: `#/home`, `#/shabdkosh`, `#/baithak`, `#/heritage`.

**Production build (optional check):**

```bash
npm run build
npm run preview
```

`preview` serves the contents of `dist/` so you can verify the build before deploy.

## Dictionary data (`words_raw.txt`)

The Shabdkosh glossary is generated from `words_raw.txt` (one term per line; lines may start with `. `). Lines with a trailing gloss in parentheses, e.g. `Satba (sacchi mein)`, use the parentheses as the short definition.

After you edit `words_raw.txt`, regenerate the JSON:

```bash
npm run build:words
```

This overwrites `src/data/words.json`. Commit both the text file and the generated JSON when you change the word list.

## Deploy

Point your host (Cloudflare Pages, Netlify, etc.) at this repo with **build command** `npm run build` and **output directory** `dist`. Static assets and `public/_redirects` are copied into `dist/` automatically.
