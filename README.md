# via brendel

A dusk-lit Soviet-era apartment block, drawn entirely in hand-rasterized
pixel art (ordered dithering, manual curve/circle plotting, no anti-aliased
edges anywhere) — lit and dark windows, spinning AC units, loose cable
bundles, all animating live in the browser (Canvas 2D, no engine). A small
music player is drawn straight into the scene itself, sitting as a row in
the sky: cover art, a hand-authored pixel font, and pixel-art transport
icons, collapsible down to a single note glyph.

**Live demo:** https://theosphere.github.io/via-brendel/

## What this is

Built as a frontal, mobile-first portrait piece, referencing a real photo
of a Bucharest apartment block at dusk. See the window/AC/wire rendering
in [src/main.ts](./src/main.ts).

The player is wired to two Alfred Brendel Mozart recordings — those mp3s
are a personal purchase, kept out of this public repo (see `.gitignore`);
the live demo's transport UI is fully functional but silent without them.

## Running locally

```bash
npm install
npm run dev
```

Drop your own `01-sonata-k310.mp3` / `02-fantasy-k396.mp3` into
`public/audio/` to hear it play.
