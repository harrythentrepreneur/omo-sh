#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { ROOT, SITE_ORIGIN, exists, productionPages } from "./lib.mjs";

const args = process.argv.slice(2);
const valueAfter = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : "";
};
const dryRun = args.includes("--dry-run");
const waitLive = args.includes("--wait-live");
const all = args.includes("--all");
const changedFrom = valueAfter("--changed-from");
const explicitUrls = valueAfter("--urls");

const excludedPrefixes = ["branding/", "homepage-heroes/", "sidebar-variants/"];
const pages = await productionPages();
const allPageUrls = pages.map((page) => page.expectedCanonical);

async function findKey() {
  const configured = process.env.INDEXNOW_KEY?.trim();
  const candidates = (await readdir(ROOT)).filter((name) => /^[a-f0-9-]{8,128}\.txt$/i.test(name));
  const filename = configured ? `${configured}.txt` : candidates[0];
  if (!filename) throw new Error("No IndexNow key found. Add <key>.txt at the repository root or set INDEXNOW_KEY.");
  const key = configured || filename.replace(/\.txt$/, "");
  if (!/^[a-f0-9-]{8,128}$/i.test(key)) throw new Error("IndexNow key must be 8-128 hexadecimal or hyphen characters.");
  const keyPath = path.join(ROOT, filename);
  if (!(await exists(keyPath)) || (await readFile(keyPath, "utf8")).trim() !== key) {
    throw new Error(`${filename} must exist at the site root and contain only the matching key.`);
  }
  return { key, filename };
}

function changedFiles() {
  if (!changedFrom) return [];
  if (!/^[0-9a-f]{7,40}$/i.test(changedFrom) || /^0+$/.test(changedFrom)) return ["__all__"];
  try {
    return execFileSync("git", ["diff", "--name-only", changedFrom, "HEAD"], { cwd: ROOT, encoding: "utf8" })
      .split("\n")
      .map((file) => file.trim())
      .filter(Boolean);
  } catch {
    return ["__all__"];
  }
}

function routeForIndex(file) {
  if (file === "index.html") return "/";
  if (file.endsWith("/index.html")) return `/${file.slice(0, -"/index.html".length)}`;
  return "";
}

function urlsForChanges(files) {
  if (all || files.includes("__all__")) return allPageUrls;
  const urls = new Set();
  const globalChange = files.some((file) =>
    ["styles.css", "robots.txt", "sitemap.xml", "vercel.json", "site.webmanifest"].includes(file) || file.startsWith("assets/"),
  );
  if (globalChange) allPageUrls.forEach((url) => urls.add(url));
  for (const file of files) {
    if (excludedPrefixes.some((prefix) => file.startsWith(prefix))) continue;
    const route = routeForIndex(file);
    if (route) urls.add(`${SITE_ORIGIN}${route}`);
    if (file === "feed.xml") urls.add(`${SITE_ORIGIN}/feed.xml`);
  }
  return [...urls];
}

function deploymentTargets(files, keyFilename) {
  if (all || files.includes("__all__")) {
    return ["index.html", "sitemap.xml", "feed.xml", keyFilename];
  }
  const candidates = files.filter((file) =>
    file === keyFilename || file === "styles.css" || file === "sitemap.xml" || file === "feed.xml" || routeForIndex(file),
  );
  return candidates
    .filter((file) => !excludedPrefixes.some((prefix) => file.startsWith(prefix)))
    .filter((file) => path.extname(file) && !file.startsWith(".github/") && !file.startsWith("scripts/"))
    .slice(0, 12);
}

async function waitForDeployment(files, keyFilename) {
  const targets = deploymentTargets(files, keyFilename);
  if (!targets.length) return;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    const results = await Promise.all(
      targets.map(async (file) => {
        if (!(await exists(path.join(ROOT, file)))) return true;
        const route = routeForIndex(file);
        const urlPath = route || `/${file}`;
        const expected = await readFile(path.join(ROOT, file), "utf8");
        try {
          const response = await fetch(`${SITE_ORIGIN}${urlPath}?indexnow_deploy=${Date.now()}`, { headers: { "cache-control": "no-cache" } });
          return response.ok && (await response.text()) === expected;
        } catch {
          return false;
        }
      }),
    );
    if (results.every(Boolean)) {
      console.log(`Production matches this commit for ${targets.length} changed file(s).`);
      return;
    }
    if (attempt === 30) throw new Error("Production did not match this commit within 150 seconds; IndexNow submission was not sent.");
    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }
}

const { key, filename: keyFilename } = await findKey();
const files = changedFiles();
const urls = explicitUrls
  ? explicitUrls.split(",").map((url) => url.trim()).filter(Boolean)
  : urlsForChanges(files);
const uniqueUrls = [...new Set(urls)].filter((url) => url.startsWith(`${SITE_ORIGIN}/`));

if (!uniqueUrls.length) {
  console.log("No indexable URL changes detected; nothing to submit.");
  process.exit(0);
}
if (uniqueUrls.length > 10_000) throw new Error("IndexNow accepts at most 10,000 URLs per request.");
if (waitLive && !dryRun) await waitForDeployment(files, keyFilename);

const payload = {
  host: "www.omo.sh",
  key,
  urlList: uniqueUrls,
};
if (dryRun) {
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});
if (![200, 202].includes(response.status)) {
  throw new Error(`IndexNow returned HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`);
}
console.log(`IndexNow accepted ${uniqueUrls.length} URL(s) with HTTP ${response.status}.`);
