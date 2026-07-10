#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  ROOT,
  SITE_ORIGIN,
  exists,
  jsonLdBlocks,
  link,
  meta,
  productionPages,
  sitemapLocations,
  title,
} from "./lib.mjs";

const errors = [];
const warnings = [];
const fail = (page, message) => errors.push(`${page}: ${message}`);
const warn = (page, message) => warnings.push(`${page}: ${message}`);

const pages = await productionPages();
const pageByRoute = new Map(pages.map((page) => [page.route, page]));
const seenTitles = new Map();
const seenDescriptions = new Map();

function schemaTypes(value, output = []) {
  if (Array.isArray(value)) value.forEach((item) => schemaTypes(item, output));
  else if (value && typeof value === "object") {
    const type = value["@type"];
    if (Array.isArray(type)) output.push(...type);
    else if (type) output.push(type);
    Object.values(value).forEach((item) => schemaTypes(item, output));
  }
  return output;
}

function hasRssDiscovery(html) {
  return (html.match(/<link\b[^>]*>/gi) ?? []).some((tag) => {
    const attributes = Object.fromEntries(
      [...tag.matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/gs)].map((match) => [match[1].toLowerCase(), match[3]]),
    );
    return (attributes.rel ?? "").split(/\s+/).includes("alternate")
      && attributes.type === "application/rss+xml"
      && attributes.href === "/feed.xml";
  });
}

async function localAssetExists(value) {
  try {
    const url = new URL(value, SITE_ORIGIN);
    if (url.origin !== SITE_ORIGIN) return true;
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    return Boolean(relative) && await exists(path.join(ROOT, relative));
  } catch {
    return false;
  }
}

for (const page of pages) {
  const label = page.relative;
  const pageTitle = title(page.html);
  const description = meta(page.html, "name", "description");
  const canonical = link(page.html, "canonical");
  const robots = meta(page.html, "name", "robots").toLowerCase();

  if (!/<html\b[^>]*\blang=["']en(?:-[A-Za-z-]+)?["']/i.test(page.html)) fail(label, "missing an English html lang attribute");
  if (!/<meta\b[^>]*charset=["']?utf-8/i.test(page.html)) fail(label, "missing UTF-8 charset");
  if (!/<meta\b[^>]*name=["']viewport["']/i.test(page.html)) fail(label, "missing viewport metadata");
  if (!pageTitle) fail(label, "missing title");
  else {
    if (pageTitle.length < 20 || pageTitle.length > 65) warn(label, `title is ${pageTitle.length} characters (target 20-65)`);
    if (seenTitles.has(pageTitle)) fail(label, `duplicates title from ${seenTitles.get(pageTitle)}`);
    seenTitles.set(pageTitle, label);
  }
  if (!description) fail(label, "missing meta description");
  else {
    if (description.length < 70 || description.length > 170) warn(label, `description is ${description.length} characters (target 70-170)`);
    if (seenDescriptions.has(description)) fail(label, `duplicates description from ${seenDescriptions.get(description)}`);
    seenDescriptions.set(description, label);
  }
  if (canonical !== page.expectedCanonical) fail(label, `canonical must be ${page.expectedCanonical}, found ${canonical || "nothing"}`);
  if (robots.includes("noindex")) fail(label, "production directory-index page is noindex");

  const h1Count = (page.html.match(/<h1\b/gi) ?? []).length;
  if (h1Count !== 1) fail(label, `expected exactly one h1, found ${h1Count}`);

  const requiredMeta = [
    ["property", "og:type"],
    ["property", "og:site_name"],
    ["property", "og:title"],
    ["property", "og:description"],
    ["property", "og:url"],
    ["property", "og:image"],
    ["name", "twitter:card"],
    ["name", "twitter:title"],
    ["name", "twitter:description"],
    ["name", "twitter:image"],
  ];
  for (const [attribute, key] of requiredMeta) {
    if (!meta(page.html, attribute, key)) fail(label, `missing ${key}`);
  }
  if (meta(page.html, "property", "og:url") !== canonical) fail(label, "og:url does not match canonical");
  if (!hasRssDiscovery(page.html)) fail(label, 'missing RSS discovery link for /feed.xml with type="application/rss+xml"');

  for (const match of page.html.matchAll(/<link\b([^>]*)>/gi)) {
    const attributes = Object.fromEntries(
      [...match[1].matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/gs)].map((item) => [item[1].toLowerCase(), item[3]]),
    );
    const href = attributes.href;
    const rels = (attributes.rel ?? "").split(/\s+/);
    if (!href || rels.includes("canonical") || !href.startsWith("/") && !href.startsWith(SITE_ORIGIN)) continue;
    if (!(await localAssetExists(href))) fail(label, `linked local asset does not exist: ${href}`);
  }

  for (const [attribute, key] of [["property", "og:image"], ["name", "twitter:image"]]) {
    const value = meta(page.html, attribute, key);
    if (value && value.startsWith(SITE_ORIGIN) && !(await localAssetExists(value))) fail(label, `${key} local asset does not exist: ${value}`);
  }

  const schemaBlocks = jsonLdBlocks(page.html);
  if (!schemaBlocks.length) fail(label, "missing JSON-LD");
  const schemas = [];
  for (const block of schemaBlocks) {
    try {
      const schema = JSON.parse(block);
      schemas.push(schema);
      if (schema["@context"] !== "https://schema.org") fail(label, "JSON-LD @context must be https://schema.org");
    } catch (error) {
      fail(label, `invalid JSON-LD: ${error.message}`);
    }
  }
  const types = schemaTypes(schemas);
  if (!types.some((type) => ["WebPage", "AboutPage", "ContactPage", "CollectionPage"].includes(type))) {
    fail(label, "JSON-LD needs a page-level schema type");
  }
  if (!JSON.stringify(schemas).includes(canonical)) fail(label, "JSON-LD does not reference the canonical URL");
  if (meta(page.html, "property", "og:type") === "article") {
    if (!types.some((type) => ["Article", "BlogPosting", "TechArticle"].includes(type))) fail(label, "article page needs Article JSON-LD");
    for (const property of ["article:published_time", "article:modified_time"]) {
      if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(meta(page.html, "property", property))) fail(label, `missing or invalid ${property}`);
    }
  }

  for (const match of page.html.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt\s*=\s*(["']).*?\1/is.test(match[1])) fail(label, "image missing alt attribute");
    const src = match[1].match(/\bsrc\s*=\s*(["'])(.*?)\1/is)?.[2];
    if (src && (src.startsWith("/") || src.startsWith(SITE_ORIGIN)) && !(await localAssetExists(src))) {
      fail(label, `image source does not exist: ${src}`);
    }
  }

  for (const match of page.html.matchAll(/<a\b[^>]*href\s*=\s*(["'])(.*?)\1/gi)) {
    const href = match[2];
    if (!href || /^(?:https?:|mailto:|tel:|javascript:)/i.test(href)) continue;
    const url = new URL(href, `${SITE_ORIGIN}${page.route}`);
    const route = url.pathname !== "/" ? url.pathname.replace(/\/$/, "") : "/";
    const target = pageByRoute.get(route);
    if (!target && !/\.[a-z0-9]+$/i.test(route)) fail(label, `internal link has no production page: ${href}`);
    if (target && url.hash) {
      const id = decodeURIComponent(url.hash.slice(1)).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (!new RegExp(`\\bid=["']${id}["']`, "i").test(target.html)) fail(label, `fragment target not found: ${href}`);
    }
    if (/\.[a-z0-9]+$/i.test(route) && !(await exists(path.join(ROOT, route.slice(1))))) fail(label, `linked file does not exist: ${href}`);
  }
}

const expectedUrls = pages.map((page) => page.expectedCanonical).sort();
const sitemapUrls = (await sitemapLocations()).sort();
for (const url of expectedUrls) if (!sitemapUrls.includes(url)) fail("sitemap.xml", `missing ${url}`);
for (const url of sitemapUrls) if (!expectedUrls.includes(url)) fail("sitemap.xml", `contains a non-production or stale URL: ${url}`);
if (new Set(sitemapUrls).size !== sitemapUrls.length) fail("sitemap.xml", "contains duplicate URLs");

const robotsPath = path.join(ROOT, "robots.txt");
if (!(await exists(robotsPath))) fail("robots.txt", "file is missing");
else {
  const robots = await readFile(robotsPath, "utf8");
  if (!/^User-agent:\s*\*/im.test(robots)) fail("robots.txt", "missing default user-agent group");
  if (!/^Sitemap:\s*https:\/\/www\.omo\.sh\/sitemap\.xml\s*$/im.test(robots)) fail("robots.txt", "missing canonical sitemap directive");
}

for (const message of warnings) console.warn(`WARN  ${message}`);
if (errors.length) {
  for (const message of errors) console.error(`ERROR ${message}`);
  console.error(`\nSEO audit failed with ${errors.length} error(s) and ${warnings.length} warning(s).`);
  process.exit(1);
}
console.log(`SEO audit passed: ${pages.length} production pages, ${sitemapUrls.length} sitemap URLs, ${warnings.length} warning(s).`);
