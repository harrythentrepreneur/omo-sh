#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ROOT, articleDate, exists, productionPages, sitemapLocations, xmlEscape } from "./lib.mjs";

const write = process.argv.includes("--write");
const sitemapPath = path.join(ROOT, "sitemap.xml");
const pages = await productionPages();
const existingXml = (await exists(sitemapPath)) ? await readFile(sitemapPath, "utf8") : "";
const existingDates = new Map(
  [...existingXml.matchAll(/<url>\s*<loc>\s*([^<]+)\s*<\/loc>\s*(?:<lastmod>\s*([^<]+)\s*<\/lastmod>)?[\s\S]*?<\/url>/g)].map(
    (match) => [match[1], match[2] ?? ""],
  ),
);
const today = new Date().toISOString().slice(0, 10);
function gitDate(page) {
  try {
    const dirty = execFileSync("git", ["status", "--porcelain", "--", page.relative], { cwd: ROOT, encoding: "utf8" }).trim();
    if (dirty) return today;
    return execFileSync("git", ["log", "-1", "--format=%cs", "--", page.relative], { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}
const entries = pages.map((page) => ({
  url: page.expectedCanonical,
  lastmod: articleDate(page).modified || gitDate(page) || existingDates.get(page.expectedCanonical) || today,
}));
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(({ url, lastmod }) => `  <url>\n    <loc>${xmlEscape(url)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`).join("\n")}
</urlset>
`;

if (write) {
  await writeFile(sitemapPath, xml);
  console.log(`Wrote ${path.relative(ROOT, sitemapPath)} with ${entries.length} URLs.`);
} else {
  if (existingXml !== xml) {
    console.error("sitemap.xml is stale, including URL coverage, ordering, or lastmod values. Run: node scripts/seo/generate-sitemap.mjs --write");
    process.exit(1);
  }
  console.log(`Sitemap check passed: ${entries.length} production URLs and lastmod values.`);
}
