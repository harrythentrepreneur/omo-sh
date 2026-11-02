# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`omo.sh` is the static marketing/research site for Omo Research ("Voice, Space, Presence"). It is plain hand-authored HTML/CSS with **no build step, no framework, and no package manager** — files are served as-is.

## Commands

Local preview — serve the repo root over HTTP (relative asset paths like `./styles.css` need a server, not `file://`):

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Architecture

**Shared shell.** The Research, Products, and Contact pages link `/styles.css` and reuse the same structural classes. `styles.css` defines all design tokens as CSS custom properties under `:root` (color palette in warm taupe/ink tones, `--font-body` Crimson Text serif + `--font-mono` IBM Plex Mono, `--sidebar-w`, `--content-max`). Match these tokens rather than introducing new colors/fonts. `index.html` is the exception: it is fully self-contained with inline `<style>` and no sidebar.

**Navigation.** Vercel serves directory-index clean routes: `/about`, `/products`, and `/consulting`. Production links should use those extensionless absolute paths. Legacy product-detail files only redirect to `/products` and are marked `noindex`.

**Research status.** Papers live under `/papers` (added at the owner's request, Oct 2026): `papers/index.html` lists them; `papers/worlds-not-windows/` holds the research paper (index.html), the whitepaper and their PDFs. They are findings from own use, not controlled studies. Add new papers only when the site owner asks.

**SEO foundation.** Canonical production URLs use `https://www.omo.sh`. Keep each production page's title, description, canonical, Open Graph/Twitter metadata, and JSON-LD accurate and unique. When adding or removing a production route, update `sitemap.xml`. Design-exploration folders are excluded from indexing through `X-Robots-Tag` rules in `vercel.json`.

**AI search.** `robots.txt` explicitly allows search and AI-assistant crawlers; `llms.txt` (llmstxt.org format) and `llms-full.txt` give language models a plain-text map and the text of the main pages. After adding or editing pages run, in order: `python3 scripts/seo/ai-search.py .` (adds missing JSON-LD, Open Graph/Twitter tags and article dates, rebuilds robots/llms files; idempotent, never touches page bodies), `node scripts/seo/generate-sitemap.mjs --write`, `python3 scripts/seo/ai-search.py .` again (llms.txt follows the sitemap), `node scripts/seo/generate-feed.mjs --write`, then `node scripts/seo/audit.mjs` (CI runs it on every push). Production pages are all indexable `.html` files, served with clean URLs (`omo-space.html` -> `/omo-space`, `papers/index.html` -> `/papers`); folder pages have no trailing slash.

**Design exploration directories.** `branding/`, `sidebar-variants/`, and `homepage-heroes/` hold standalone design-variant prototypes (not part of the live site). Treat them as a scratchpad of alternatives, not production pages.

## Conventions

- Keep pages dependency-free: no bundlers, no npm install for the site itself, fonts loaded from Google Fonts via `<link>`.
- New production pages should reuse the sidebar shell and `styles.css` tokens rather than adding bespoke scripts.
- When adding a research paper, create `papers/<name>.html` and register it in the `PAPERS` array in `generate-pdfs.mjs`.
