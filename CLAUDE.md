# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`omo.sh` is the static marketing/research site for Omo Research ("Voice, Space, Presence"). It is plain hand-authored HTML/CSS/JS with **no build step, no framework, and no package manager** — files are served as-is. The only tooling is a Node script for generating PDFs of the research papers.

## Commands

Local preview — serve the repo root over HTTP (relative asset paths like `./styles.css` need a server, not `file://`):

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Regenerate the paper PDFs (run from `papers/`; requires `playwright` and `mime-types`, no package.json so install ad hoc):

```bash
cd papers && node generate-pdfs.mjs
```

This boots a tiny static server on port 8766, loads each `papers/*.html` in headless Chromium with print media emulated, and writes `papers/<name>.pdf`. The paper list is hard-coded in the `PAPERS` array — add new papers there.

## Architecture

**Shared shell.** Every top-level content page links the same two global assets — `./styles.css` and `./script.js` — and reuses the same structural classes. `styles.css` defines all design tokens as CSS custom properties under `:root` (color palette in warm taupe/ink tones, `--font-body` Crimson Text serif + `--font-mono` IBM Plex Mono, `--sidebar-w`, `--content-max`). Match these tokens rather than introducing new colors/fonts. `index.html` is the exception: it is fully self-contained with inline `<style>` and no sidebar.

**`script.js` is convention-driven, not page-specific.** It runs `init()` on load and wires up behavior by querying for known class/data attributes, so pages opt in purely through markup:
- `.reveal` elements fade in via an `IntersectionObserver` (`.is-visible` added on scroll).
- `.sidebar-link` anchors with `#section` hrefs get active-state tracking against the matching section IDs.
- `.demo-tab` buttons (with `data-tab="key"`) toggle panels by the convention `id="{key}Samples"`.
- If a page sets `window.PAGE_DEMOS` (an object of `category -> demo[]`), `renderDemos` builds demo cards into the matching `#{category}Samples` containers. Define `PAGE_DEMOS` in an inline `<script>` at the bottom of the page (see `momo.html`, `spoken-english.html`).

**Navigation.** Content pages share a left `.sidebar` nav (brand mark + links to the product/paper pages). Links are plain relative `.html` hrefs — there is no router. A small inline IIFE in each page marks the current page's sidebar link active.

**Papers.** `papers/*.html` are long-form standalone documents with their own print stylesheet (`@page` A4 geometry). Because `.reveal` sections start at `opacity:0` and only un-hide on scroll, the PDF generator force-adds `.is-visible` to every `.reveal` before printing — keep that in mind if you change the reveal mechanism, or off-screen content will be blank in PDFs.

**Design exploration directories.** `branding/`, `sidebar-variants/`, and `homepage-heroes/` hold standalone design-variant prototypes (not part of the live site). Treat them as a scratchpad of alternatives, not production pages.

## Conventions

- Keep pages dependency-free: no bundlers, no npm install for the site itself, fonts loaded from Google Fonts via `<link>`.
- New product/paper pages should reuse the sidebar shell, `styles.css` tokens, and the `script.js` conventions above rather than adding bespoke scripts.
- When adding a research paper, create `papers/<name>.html` and register it in the `PAPERS` array in `generate-pdfs.mjs`.
