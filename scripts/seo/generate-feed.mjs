#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ROOT, articleDate, exists, meta, productionPages, title, xmlEscape } from "./lib.mjs";

const write = process.argv.includes("--write");
const feedPath = path.join(ROOT, "feed.xml");
const pages = await productionPages();
const articles = pages
  .filter((page) => meta(page.html, "property", "og:type") === "article" || meta(page.html, "property", "article:published_time"))
  .map((page) => ({
    title: title(page.html),
    description: meta(page.html, "name", "description"),
    url: page.expectedCanonical,
    ...articleDate(page),
  }))
  .sort((a, b) => b.published.localeCompare(a.published));

for (const article of articles) {
  if (!article.published.match(/^\d{4}-\d{2}-\d{2}$/)) {
    console.error(`${article.url} needs <meta property="article:published_time" content="YYYY-MM-DD">.`);
    process.exit(1);
  }
}

const latest = articles[0]?.modified || articles[0]?.published || new Date().toISOString().slice(0, 10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Omo Research Notes</title>
    <link>https://www.omo.sh/notes</link>
    <description>Notes on voice-first AI, spatial agents, local intelligence, and human-agent interaction.</description>
    <language>en</language>
    <lastBuildDate>${new Date(`${latest}T00:00:00Z`).toUTCString()}</lastBuildDate>
    <atom:link href="https://www.omo.sh/feed.xml" rel="self" type="application/rss+xml" />
${articles.map((article) => `    <item>
      <title>${xmlEscape(article.title)}</title>
      <link>${xmlEscape(article.url)}</link>
      <guid isPermaLink="true">${xmlEscape(article.url)}</guid>
      <pubDate>${new Date(`${article.published}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${xmlEscape(article.description)}</description>
    </item>`).join("\n")}
  </channel>
</rss>
`;

if (write) {
  if (!articles.length) {
    console.error("No article pages found; refusing to publish an empty feed.");
    process.exit(1);
  }
  await writeFile(feedPath, xml);
  console.log(`Wrote feed.xml with ${articles.length} article(s).`);
} else if (!articles.length && !(await exists(feedPath))) {
  console.log("Feed check skipped: no published article pages yet.");
} else if (!(await exists(feedPath))) {
  console.error("Article pages exist but feed.xml is missing. Run: node scripts/seo/generate-feed.mjs --write");
  process.exit(1);
} else {
  const current = await readFile(feedPath, "utf8");
  if (current !== xml) {
    console.error("feed.xml is stale. Run: node scripts/seo/generate-feed.mjs --write");
    process.exit(1);
  }
  console.log(`Feed check passed: ${articles.length} article(s).`);
}
