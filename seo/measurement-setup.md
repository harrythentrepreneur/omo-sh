# Omo Search Measurement Setup

This is the one-time setup needed to turn the automated crawl checks into real search-performance measurement. It does not require adding tracking scripts to the site.

## 1. Google Search Console

1. Create a **Domain property** for `omo.sh` in [Google Search Console](https://search.google.com/search-console/about).
2. Add the DNS TXT record Google provides at the domain registrar, then verify it.
3. Submit `https://www.omo.sh/sitemap.xml` under **Indexing → Sitemaps**.
4. Inspect the homepage, `/about`, `/products`, `/consulting`, and each published `/notes/...` URL. Request indexing only after the live page is final.
5. Check monthly:
   - **Performance → Search results:** clicks, impressions, click-through rate, and average position by query and page.
   - **Indexing → Pages:** unexpected `Crawled - currently not indexed`, duplicate canonical, soft 404, or server errors.
   - **Experience → Core Web Vitals:** failing URL groups, especially mobile.

Recommended export fields for a monthly snapshot: date, page, query, country, device, clicks, impressions, CTR, and position. Compare 28-day periods only after the site has enough impressions; do not treat daily ranking movement as a product signal.

## 2. Bing Webmaster Tools and IndexNow

1. Import the verified Search Console property into [Bing Webmaster Tools](https://www.bing.com/webmasters/about), or verify `omo.sh` separately.
2. Submit the same sitemap.
3. Confirm that `https://www.omo.sh/10907afa25583a04644aadf685a60114.txt` returns the matching key.
4. The `Notify IndexNow` GitHub workflow follows the [IndexNow protocol](https://www.indexnow.org/documentation) and submits only URLs affected by a push to `main`. It waits until the corresponding files are live before notifying the endpoint.
5. Review Bing's URL Inspection and IndexNow reporting after the first production push. A successful API response means the change was received, not that indexing or ranking is guaranteed.

The root text file lets search engines verify host ownership. This key is not an account credential, but it should be used only for `omo.sh` and rotated if it is abused.

## 3. Search KPI baseline

Record a baseline once both properties have collected data for 28 days:

| Metric | Source | Why it matters |
| --- | --- | --- |
| Indexed canonical pages | Google and Bing indexing reports | Detects crawl or canonical regressions |
| Non-branded impressions | Search performance, query filter excluding `omo` | Measures discovery beyond people already seeking the brand |
| Clicks by topic cluster | Search performance, page regex | Separates Minecraft, spatial AI, voice-first AI, and local AI demand |
| CTR by page and query | Search performance | Finds title/description mismatches after sufficient impressions |
| Mobile good-URL share | Core Web Vitals | Guards usability and page experience |
| Referring domains to Notes | Search Console Links plus a backlink tool if available | Measures whether original work earns citations |

Use the following page regexes when the architecture exists:

- Notes overall: `^https://www\.omo\.sh/notes(?:/|$)`
- Minecraft cluster: `/notes/.*minecraft`
- Spatial AI cluster: `/notes/.*spatial`
- Voice cluster: `/notes/.*voice`

## 4. Optional privacy-first product analytics

Search Console and Bing are sufficient for SEO measurement. If Omo also needs on-site behavior, choose a privacy-first analytics service and define only a few events: outbound GitHub click, contact email click, Notes article view, and internal Notes click. Do not install multiple analytics products or collect data without a clear decision it will inform.

## 5. Automated safeguards in this repository

- `node scripts/seo/audit.mjs` checks production metadata, unique titles/descriptions, canonicals, social tags, JSON-LD validity, one H1, image alt text, internal links/fragments, sitemap coverage, and robots directives.
- `node scripts/seo/generate-sitemap.mjs` checks coverage; add `--write` to regenerate the sitemap after route changes.
- `node scripts/seo/generate-feed.mjs` checks that published article pages and `feed.xml` match; add `--write` to regenerate it.
- `node scripts/seo/submit-indexnow.mjs --all --dry-run` previews the IndexNow payload without network changes.

The regression workflow runs on every pull request and push to `main`. Treat failures as release blockers: the checks are designed to prevent discoverability regressions, not promise rankings.
