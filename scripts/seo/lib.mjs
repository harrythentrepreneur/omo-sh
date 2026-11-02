import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export const SITE_ORIGIN = "https://www.omo.sh";
export const ROOT = path.resolve(new URL("../../", import.meta.url).pathname);

const EXCLUDED_DIRECTORIES = new Set([
  ".git",
  ".github",
  "assets",
  "branding",
  "homepage-heroes",
  "node_modules",
  "api",
  "scripts",
  "seo",
  "sidebar-variants",
]);

export async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

// Production pages: every indexable .html file. Vercel serves them with cleanUrls (about/index.html -> /about,
// omo-space.html -> /omo-space). Pages marked noindex (legacy redirects, 404) are not production pages.
async function walk(directory, output = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && (EXCLUDED_DIRECTORIES.has(entry.name) || entry.name.startsWith("."))) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(fullPath, output);
    else if (entry.name.endsWith(".html")) output.push(fullPath);
  }
  return output;
}

function isNoindex(html) {
  return /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
}

export function routeFor(relative) {
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"/index.html".length)}`;
  return `/${relative.replace(/\.html$/, "")}`;
}

export async function productionPages() {
  const files = (await walk(ROOT)).sort();
  const pages = await Promise.all(
    files.map(async (file) => {
      const relative = path.relative(ROOT, file).replaceAll(path.sep, "/");
      const route = routeFor(relative);
      return {
        file,
        relative,
        route,
        expectedCanonical: `${SITE_ORIGIN}${route}`,
        html: await readFile(file, "utf8"),
      };
    }),
  );
  return pages.filter((page) => !isNoindex(page.html));
}

export function decodeEntities(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

export function textContent(value = "") {
  return decodeEntities(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

export function title(html) {
  return textContent(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
}

export function meta(html, attribute, key) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const attributes = Object.fromEntries(
      [...tag.matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/gs)].map((match) => [match[1].toLowerCase(), decodeEntities(match[3])]),
    );
    if (attributes[attribute.toLowerCase()]?.toLowerCase() === key.toLowerCase()) return attributes.content ?? "";
  }
  return "";
}

export function link(html, rel) {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const attributes = Object.fromEntries(
      [...tag.matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/gs)].map((match) => [match[1].toLowerCase(), decodeEntities(match[3])]),
    );
    if ((attributes.rel ?? "").split(/\s+/).includes(rel)) return attributes.href ?? "";
  }
  return "";
}

export function jsonLdBlocks(html) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
    (match) => match[1].trim(),
  );
}

export function articleDate(page) {
  const published = meta(page.html, "property", "article:published_time");
  const modified = meta(page.html, "property", "article:modified_time") || published;
  return { published: published.slice(0, 10), modified: modified.slice(0, 10) };
}

export async function sitemapLocations() {
  const file = path.join(ROOT, "sitemap.xml");
  if (!(await exists(file))) return [];
  const xml = await readFile(file, "utf8");
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => decodeEntities(match[1]));
}

export function xmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
