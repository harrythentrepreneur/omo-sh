#!/usr/bin/env python3
"""AI-search (GEO) + SEO pass for an omo.sh site tree. Idempotent: run it again any time.

Usage: python3 geo_apply.py SITE_DIR [--dry-run]

What it does (head-only HTML changes, nothing visible on the page moves):
  1. JSON-LD on every indexable page that has none: Organization + WebSite + WebPage/Article/
     BlogPosting/ScholarlyArticle/SoftwareApplication/VideoObject + BreadcrumbList, all tied to
     one Organization @id. Our block is <script type="application/ld+json" id="omo-geo-ld">,
     replaced in place on re-runs. Pages that already carry their own JSON-LD are left alone,
     except the homepage, whose old block is folded into ours (a superset).
  2. robots.txt: explicit allow for search + AI crawlers, /api/ disallowed, sitemap.
  3. llms.txt (llmstxt.org format) and llms-full.txt (clean text of the core pages), built only
     from URLs listed in this tree's sitemap.xml, so every link resolves on the site it ships with.
Facts used are all visible on the site or in github.com/omoresearch/omo-space (checked 2026-11-01).
"""
import html
import json
import os
import re
import sys
from html.parser import HTMLParser

BASE = "https://www.omo.sh"
ORG_ID = BASE + "/#organization"
SITE_ID = BASE + "/#website"
SOFT_ID = BASE + "/omo-space#software"
LOGO = BASE + "/assets/icon-512.png"
OG = BASE + "/assets/og-card.png"
MARK = 'id="omo-geo-ld"'

ORG = {
    "@type": "Organization", "@id": ORG_ID, "name": "Omo Research", "alternateName": "Omo",
    "url": BASE + "/",
    "logo": {"@type": "ImageObject", "url": LOGO, "width": 512, "height": 512},
    "image": OG,
    "description": ("Omo Research builds and studies spatial interfaces for AI agents. Its main system, "
                    "Omo Space, gives every long-running AI agent a desk in a shared Minecraft world, "
                    "with real Hermes Agent, Claude Code, Codex or shell terminals on the walls."),
    "email": "harrythentrepreneur@gmail.com",
    "contactPoint": {"@type": "ContactPoint", "contactType": "customer support",
                     "email": "harrythentrepreneur@gmail.com", "url": BASE + "/contact"},
    "knowsAbout": ["AI agents", "agentic interfaces", "spatial computing", "voice-first AI",
                   "Minecraft mods", "human-agent interaction", "MuJoCo robot simulation"],
    "sameAs": ["https://github.com/omoresearch", "https://github.com/omoresearch/omo-space",
               "https://www.twitch.tv/yiifannn"],
}
WEBSITE = {"@type": "WebSite", "@id": SITE_ID, "url": BASE + "/", "name": "Omo Research",
           "alternateName": "Omo", "publisher": {"@id": ORG_ID}, "inLanguage": "en"}
SOFTWARE = {
    "@type": "SoftwareApplication", "@id": SOFT_ID, "name": "Omo Space",
    "description": ("Omo Space puts real AI agents at desks inside Minecraft. Placing a computer block starts "
                    "a named workspace on your own PC (a Hermes Agent conversation, a Claude Code or Codex "
                    "session, or a plain shell); its terminal is on the wall, real web pages run on monitors, "
                    "and the sessions keep running after you quit the game. A Minecraft mod plus a small "
                    "local service."),
    "url": BASE + "/omo-space",
    "applicationCategory": "DeveloperApplication",
    "applicationSubCategory": "Minecraft Java mod",
    "operatingSystem": "Linux, macOS, Windows (WSL2)",
    "softwareVersion": "1.2.0",
    "dateModified": "2026-10-28",
    "softwareRequirements": "Minecraft: Java Edition 26.2 account, Python 3.11+, about 2 GB free disk",
    "license": "https://opensource.org/licenses/MIT",
    "isAccessibleForFree": True,
    "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
    "downloadUrl": "https://github.com/omoresearch/omo-space/releases/latest",
    "releaseNotes": "https://github.com/omoresearch/omo-space/releases/tag/v1.2.0",
    "image": OG,
    "author": {"@id": ORG_ID}, "publisher": {"@id": ORG_ID},
    "sameAs": ["https://github.com/omoresearch/omo-space"],
}
SOURCE = {"@type": "SoftwareSourceCode", "@id": BASE + "/omo-space#code", "name": "omo-space",
          "codeRepository": "https://github.com/omoresearch/omo-space", "license": "https://opensource.org/licenses/MIT",
          "programmingLanguage": ["Java", "Python"], "targetProduct": {"@id": SOFT_ID}, "author": {"@id": ORG_ID}}

# dates shown on the site's own research log index (about.html) / page metadata
PAPER_DATES = {
    "/research/rooms-not-windows": "2026-10-29", "/research/robots": "2026-10-30",
    "/research/worlds-not-windows": "2026-10-30", "/papers/worlds-not-windows": "2026-10-30",
    "/research/whitepaper": "2026-10-31", "/papers/worlds-not-windows/whitepaper": "2026-10-31",
    "/research/omo-r1": "2026-10-28",
}
GIT_ROOT = None
NOT_ARTICLES = {"/contact", "/enterprise", "/papers", "/about", "/omo-space", "/demo", "/hermes", "/", "/products",
                "/consulting", "/notes"}


def git_dates(rel):
    """(first published, last modified) from git history: the real dates the page went up and last changed."""
    if not GIT_ROOT:
        return None, None
    import subprocess
    try:
        out = subprocess.run(["git", "log", "--follow", "--format=%cs", "--", rel], cwd=GIT_ROOT,
                             capture_output=True, text=True, timeout=30).stdout.split()
    except Exception:
        return None, None
    return (out[-1], out[0]) if out else (None, None)


MONTHS = {m: i + 1 for i, m in enumerate("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split())}


def url_of(rel):
    u = "/" + rel[:-5]
    if u == "/index":
        return "/"
    if u.endswith("/index"):
        return u[:-6]  # folder page: served without the trailing slash
    return u


def meta(s, attr, name):
    m = re.search(r'<meta\s+%s="%s"\s+content="([^"]*)"' % (attr, re.escape(name)), s)
    return html.unescape(m.group(1)) if m else None


def head_info(s):
    t = re.search(r"<title>(.*?)</title>", s, re.S)
    c = re.search(r'<link rel="canonical" href="([^"]*)"', s)
    return {
        "title": html.unescape(t.group(1).strip()) if t else "",
        "name": html.unescape((t.group(1) if t else "").split(" | ")[0].strip()),
        "desc": meta(s, "name", "description") or "",
        "canonical": c.group(1) if c else None,
        "published": meta(s, "property", "article:published_time"),
        "modified": meta(s, "property", "article:modified_time"),
    }


def first_image(s, page_url):
    for m in re.finditer(r'<img\b[^>]*\bsrc="([^"]+)"', s):
        src = m.group(1)
        if src.startswith("data:") or src.endswith(".svg"):
            continue
        if src.startswith("http"):
            return src
        if src.startswith("/"):
            return BASE + src
        base = page_url if page_url.endswith("/") else page_url.rsplit("/", 1)[0] + "/"
        return base + src
    return OG


def log_date(s):
    m = re.search(r'meta-label">When</p><p class="meta-value">([^<]+)<', s)
    if not m:
        return None
    v = html.unescape(m.group(1))
    d = re.findall(r"(\d{1,2})?\s*([A-Z][a-z]{2})\s+(\d{4})", v)
    if not d:
        return None
    days = re.findall(r"\b(\d{1,2})\b", v.split(d[-1][1])[0]) if d else []
    day, mon, yr = (d[-1][0] or (days[-1] if days else None)), d[-1][1], d[-1][2]
    if mon not in MONTHS or not day:  # month-only ("Oct 2026"): no exact date, so claim none
        return None
    return "%s-%02d-%02d" % (yr, MONTHS[mon], int(day))


def crumbs(items):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": BASE + u} for i, (n, u) in enumerate(items)]}


def graph_for(rel, s):
    u = url_of(rel)
    h = head_info(s)
    page_url = h["canonical"] or BASE + u
    pid = page_url + "#webpage"
    img = first_image(s, page_url)
    page = {"@type": "WebPage", "@id": pid, "url": page_url, "name": h["title"], "description": h["desc"],
            "isPartOf": {"@id": SITE_ID}, "publisher": {"@id": ORG_ID}, "inLanguage": "en",
            "primaryImageOfPage": {"@type": "ImageObject", "url": img}}
    nodes = [dict(ORG), dict(WEBSITE), page]
    trail = [("Home", "/")]

    first, last = git_dates(rel)

    def article(kind, date=None, section=None):
        date = date or first or h["published"]
        a = {"@type": kind, "@id": page_url + "#article", "headline": h["name"][:110], "description": h["desc"],
             "url": page_url, "mainEntityOfPage": {"@id": pid}, "image": img, "inLanguage": "en",
             "author": {"@id": ORG_ID}, "publisher": {"@id": ORG_ID}, "isPartOf": {"@id": SITE_ID}}
        by = re.search(r"\bBy ([A-Z][a-z]+(?: [A-Z][a-z]+)+), Omo Research", h["desc"] + " " + s[:200000])
        if by:  # the page names its author: credit the person, affiliated with the org
            a["author"] = {"@type": "Person", "name": by.group(1), "affiliation": {"@id": ORG_ID}}
        if date:
            a["datePublished"] = date
            a["dateModified"] = max(x for x in (h["modified"], last, date) if x)
        if section:
            a["articleSection"] = section
        nodes.append(a)
        return a

    if u == "/":
        page["about"] = {"@id": ORG_ID}
        page["mainEntity"] = {"@id": ORG_ID}
        nodes.append(dict(SOFTWARE))
    elif u == "/omo-space":
        page["mainEntity"] = {"@id": SOFT_ID}
        page["about"] = {"@id": SOFT_ID}
        nodes += [dict(SOFTWARE), dict(SOURCE)]
        trail.append(("Omo Space", u))
    elif u == "/demo":
        page["mainEntity"] = {"@id": page_url + "#video"}
        nodes.append({
            "@type": "VideoObject", "@id": page_url + "#video", "name": h["name"], "description": h["desc"],
            "thumbnailUrl": BASE + "/assets/demo/poster.jpg", "uploadDate": "2026-10-27T15:45:00+11:00",
            "duration": "PT15M45S", "embedUrl": page_url,
            "contentUrl": "https://github.com/omoresearch/omo-space/releases/download/demo-2026-10-27/omo-space-demo-2026-10-27.mp4",
            "about": {"@id": SOFT_ID}, "publisher": {"@id": ORG_ID}, "inLanguage": "en"})
        trail.append(("Demo", u))
    elif u == "/contact":
        page["@type"] = "ContactPage"
        page["about"] = {"@id": ORG_ID}
        trail.append(("Contact", u))
    elif u in ("/about", "/papers"):
        page["@type"] = "CollectionPage"
        trail.append(("Research log" if u == "/about" else "Papers", u))
    elif u == "/enterprise":
        page["about"] = {"@id": ORG_ID}
        trail.append(("Enterprise", u))
    elif u.startswith("/research/log/"):
        article("BlogPosting", first or log_date(s), "Research log")
        trail += [("Research log", "/about"), (h["name"].split(" | ")[0], u)]
    elif u in PAPER_DATES:
        kind = "ScholarlyArticle" if ("paper" in u or "windows" in u or u == "/research/robots") else "TechArticle"
        a = article(kind, PAPER_DATES[u])
        if "omo-r1" in u:
            a["about"] = {"@type": "SoftwareApplication", "name": "Omo R1", "applicationCategory": "GameApplication"}
        else:
            a["about"] = {"@id": SOFT_ID}
        trail += [("Papers" if u.startswith("/papers") else "Research log", "/papers" if u.startswith("/papers") else "/about"),
                  (h["name"], u)]
    elif u.startswith("/research/"):
        a = article("TechArticle", None, "Research")
        a["about"] = {"@id": SOFT_ID} if "omo-space" in u else None
        trail += [("Research log", "/about"), (h["name"], u)]
    else:
        trail.append((h["name"], u))
    if u != "/":
        page["breadcrumb"] = {"@id": page_url + "#breadcrumb"}
        bc = crumbs(trail)
        bc["@id"] = page_url + "#breadcrumb"
        nodes.append(bc)
    if u == "/hermes":
        page["about"] = {"@id": SOFT_ID}
    for n in nodes:
        for k in [k for k, v in n.items() if v in ("", None)]:
            del n[k]
    return {"@context": "https://schema.org", "@graph": nodes}


def fill_social(rel, u, s):
    """Add only the missing Open Graph / Twitter / RSS head tags, derived from the page's own title,
    description, canonical and image. Existing tags are never changed."""
    h = head_info(s)
    canon = h["canonical"] or BASE + u
    img = meta(s, "property", "og:image") or meta(s, "name", "twitter:image") or first_image(s, canon)
    want = [
        ("property", "og:type", "website" if u in NOT_ARTICLES else "article"),
        ("property", "og:site_name", "Omo Research"),
        ("property", "og:title", meta(s, "name", "twitter:title") or h["title"]),
        ("property", "og:description", meta(s, "name", "twitter:description") or h["desc"]),
        ("property", "og:url", canon),
        ("property", "og:image", img),
        ("name", "twitter:card", "summary_large_image"),
        ("name", "twitter:title", meta(s, "property", "og:title") or h["title"]),
        ("name", "twitter:description", meta(s, "property", "og:description") or h["desc"]),
        ("name", "twitter:image", img),
    ]
    add = []
    for attr, key, val in want:
        if meta(s, attr, key) is None and val:
            add.append('  <meta %s="%s" content="%s" />' % (attr, key, html.escape(val, quote=True)))
    # an og:url that disagrees with the canonical is a bug: point it at the canonical
    ogu = re.search(r'<meta property="og:url" content="([^"]*)"', s)
    if ogu and h["canonical"] and ogu.group(1) != h["canonical"]:
        s = s.replace(ogu.group(0), '<meta property="og:url" content="%s"' % h["canonical"])
    if 'type="application/rss+xml"' not in s:
        add.append('  <link rel="alternate" type="application/rss+xml" title="Omo Research" href="/feed.xml" />')
    if add:
        i = s.lower().find("</head>")
        s = s[:i].rstrip() + "\n" + "\n".join(add) + "\n" + s[i:]
    return s


def fix_og(rel, u, s):
    """og:type=article only on real articles; articles carry article:published_time/modified_time."""
    ogt = re.search(r'<meta property="og:type" content="([^"]*)"\s*/?>', s)
    if not ogt:
        return s
    if ogt.group(1) == "article" and u in NOT_ARTICLES:
        return s.replace(ogt.group(0), ogt.group(0).replace('content="article"', 'content="website"'))
    if ogt.group(1) == "article" and "article:published_time" not in s:
        g = graph_for(rel, s)
        art = next((n for n in g["@graph"] if "datePublished" in n), None)
        if art:
            tags = '\n  <meta property="article:published_time" content="%s" />\n  <meta property="article:modified_time" content="%s" />' % (
                art["datePublished"], art["dateModified"])
            s = s.replace(ogt.group(0), ogt.group(0) + tags, 1)
    return s


LD_RE = re.compile(r'\s*<script type="application/ld\+json"[^>]*>.*?</script>', re.S)
OUR_RE = re.compile(r'\s*<script type="application/ld\+json" id="omo-geo-ld">.*?</script>', re.S)


def patch_html(rel, s):
    if re.search(r'<meta name="robots" content="[^"]*noindex', s):
        return s, "skip (noindex)"
    has_ours = MARK in s
    others = [m for m in LD_RE.finditer(s) if MARK not in m.group(0)]
    u = url_of(rel)
    s = fill_social(rel, u, s)
    s = fix_og(rel, u, s)
    if others and u != "/":
        return s, "kept existing JSON-LD"
    if u == "/":
        s = LD_RE.sub("", s)  # fold the old homepage block into ours
    elif has_ours:
        s = OUR_RE.sub("", s)
    block = json.dumps(graph_for(rel, s), ensure_ascii=False, indent=1)
    block = block.replace("</", "<\\/")
    tag = '\n  <script type="application/ld+json" id="omo-geo-ld">\n%s\n  </script>\n' % block
    i = s.lower().find("</head>")
    if i < 0:
        return s, "no </head>!"
    s = s[:i].rstrip() + tag + s[i:]
    return s, "JSON-LD " + ("updated" if has_ours else "added")


ROBOTS = """# omo.sh robots.txt - every search engine and AI assistant is welcome to read and cite this site.
# Plain-text guide for language models: https://www.omo.sh/llms.txt

User-agent: *
Allow: /
Disallow: /api/

# AI search and answer engines (listed explicitly so intent is unambiguous)
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: anthropic-ai
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Google-Extended
User-agent: GoogleOther
User-agent: Applebot
User-agent: Applebot-Extended
User-agent: Bingbot
User-agent: DuckAssistBot
User-agent: MistralAI-User
User-agent: meta-externalagent
User-agent: Amazonbot
User-agent: cohere-ai
User-agent: YouBot
User-agent: CCBot
Allow: /
Disallow: /api/

Sitemap: https://www.omo.sh/sitemap.xml
"""


class Text(HTMLParser):
    SKIP = {"script", "style", "svg", "nav", "header", "noscript", "form", "button", "template", "footer"}
    BLOCK = {"p", "li", "h1", "h2", "h3", "h4", "tr", "blockquote", "figcaption", "dt", "dd", "br", "div", "section"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.skip, self.cur = [], 0, []

    def flush(self, prefix=""):
        t = re.sub(r"\s+", " ", "".join(self.cur)).strip()
        if t:
            self.out.append(prefix + t)
        self.cur = []

    def handle_starttag(self, tag, a):
        if tag in self.SKIP:
            self.skip += 1
        elif not self.skip and tag in self.BLOCK:
            self.flush()

    def handle_endtag(self, tag):
        if tag in self.SKIP:
            self.skip = max(0, self.skip - 1)
        elif not self.skip and tag in self.BLOCK:
            pre = {"h1": "# ", "h2": "## ", "h3": "### ", "h4": "#### ", "li": "- "}.get(tag, "")
            self.flush(pre)

    def handle_data(self, d):
        if not self.skip:
            self.cur.append(d)


def page_text(s):
    m = re.search(r"<(main|article)\b.*?</\1>", s, re.S)
    body = m.group(0) if m else s
    p = Text()
    p.feed(body)
    p.flush()
    lines, seen = [], set()
    for ln in p.out:
        if ln in seen and len(ln) < 60:
            continue
        seen.add(ln)
        lines.append(ln)
    return "\n\n".join(lines)


def file_for(root, path):
    for c in ([path.strip("/") + ".html", path.strip("/") + "/index.html"] if path != "/" else ["index.html"]):
        f = os.path.join(root, c)
        if os.path.isfile(f):
            return f
    return None


def build_llms(root):
    urls = re.findall(r"<loc>https://www\.omo\.sh(.*?)</loc>", open(os.path.join(root, "sitemap.xml")).read())
    info = {}
    for u in urls:
        f = file_for(root, u)
        if f:
            info[u] = (head_info(open(f, encoding="utf-8").read()), f)

    def line(u):
        h = info[u][0]
        return "- [%s](%s%s): %s" % (h["name"], BASE, u, h["desc"])

    groups = [
        ("Omo Space (the product)", ["/omo-space", "/demo", "/research/omo-space"]),
        ("Papers", [u for u in urls if u.startswith("/papers")] +
         ["/research/worlds-not-windows", "/research/whitepaper", "/research/rooms-not-windows",
          "/research/robots", "/research/omo-r1"]),
        ("Notes (explainers)", ["/notes"] + [u for u in urls if u.startswith("/notes/")]),
        ("Research log and prototypes", ["/about"] + [u for u in urls if u.startswith("/research/") and
                                                     not u.startswith("/research/log/") and u.endswith(("/",)) is False]),
        ("Company", ["/enterprise", "/consulting", "/products", "/contact"]),
    ]
    used, out = set(), []
    out.append("# Omo Research\n")
    out.append("> Omo Research (omo.sh) builds spatial interfaces for AI agents. Its open-source system, Omo Space "
               "(MIT, v1.2.0, 28 Oct 2026), puts real AI agents at desks inside Minecraft: placing a computer block "
               "starts a Hermes Agent, Claude Code, Codex or shell session on your own PC, its terminal is painted on "
               "a wall, real web pages run on in-world monitors, and the sessions keep running after you quit the game.\n")
    out.append("Key facts:\n"
               "- Omo Space is a Minecraft Java Edition 26.2 mod plus a small local service; it runs on Linux, macOS "
               "and Windows (WSL2) and needs a Minecraft Java account, Python 3.11+ and about 2 GB free.\n"
               "- Code and releases: https://github.com/omoresearch/omo-space (MIT licence).\n"
               "- Idea in one line: people remember rooms better than tabs, so every long-running agent gets a place; "
               "finding becomes walking, resuming becomes coming back, monitoring becomes a glance down the hallway.\n"
               "- Built and used live on stream (https://www.twitch.tv/yiifannn). Results on this site come from the "
               "team's own use, not controlled studies.\n"
               "- Omo Space is not an official Minecraft product and is not approved by or associated with Mojang or Microsoft.\n"
               "- Contact: harrythentrepreneur@gmail.com\n")
    for title, cands in groups:
        items = []
        for u in cands:
            if u in info and u not in used:
                used.add(u)
                items.append(line(u))
        if items:
            out.append("## %s\n\n%s\n" % (title, "\n".join(items)))
    logs = [u for u in urls if u.startswith("/research/log/") and u in info and u not in used]
    if logs:
        out.append("## Optional\n\nResearch log entries, one per experiment:\n\n%s\n" % "\n".join(line(u) for u in logs))
    out.append("Full text of the main pages for language models: %s/llms-full.txt\n" % BASE)
    llms = "\n".join(out)

    core = [u for u in ["/", "/omo-space", "/demo"] + [u for u in urls if u.startswith("/papers")] +
            ["/research/whitepaper", "/research/robots", "/research/omo-r1", "/notes/what-is-a-spatial-ai-agent",
             "/notes/minecraft-as-an-agent-interface", "/notes/voice-first-ai-presence", "/notes/interfaces-we-tried",
             "/enterprise", "/contact"] if u in info]
    full = ["# Omo Research - full text of the main pages\n",
            "Source: %s. Generated from the published HTML; each section starts with its canonical URL.\n" % BASE]
    for u in dict.fromkeys(core):
        h, f = info[u]
        full.append("\n---\n\n# %s\n\nURL: %s%s\n\n%s\n\n%s\n" % (h["name"], BASE, u, h["desc"],
                                                               page_text(open(f, encoding="utf-8").read())))
    return llms, "".join(full)


def dir_pages(root):
    """Folder pages (research/robots/index.html). Vercel serves them at /research/robots and 308s the
    trailing-slash form there, so the slash form must not be the canonical, og:url or sitemap URL."""
    out = []
    for dp, dn, fn in os.walk(root):
        dn[:] = [d for d in dn if not d.startswith(".") and d not in SKIP_DIRS]
        if "index.html" in fn and os.path.abspath(dp) != root:
            out.append("/" + os.path.relpath(dp, root).replace(os.sep, "/"))
    return out


def fix_slashes(s, dirs):
    for d in dirs:
        s = s.replace('href="%s/"' % d, 'href="%s"' % d)
        s = s.replace('href="%s%s/"' % (BASE, d), 'href="%s%s"' % (BASE, d))
        s = s.replace('content="%s%s/"' % (BASE, d), 'content="%s%s"' % (BASE, d))
        s = s.replace("<loc>%s%s/</loc>" % (BASE, d), "<loc>%s%s</loc>" % (BASE, d))
    return s


SKIP_DIRS = {"branding", "homepage-heroes", "sidebar-variants", "assets", "scripts", "api", "seo", "node_modules"}


def main():
    root = os.path.abspath(sys.argv[1])
    global GIT_ROOT
    GIT_ROOT = root if os.path.isdir(os.path.join(root, ".git")) and os.popen("git -C '%s' rev-list --count HEAD 2>/dev/null" % root).read().strip() not in ("", "1") else None
    dry = "--dry-run" in sys.argv
    report = []
    dirs = dir_pages(root)
    sm = os.path.join(root, "sitemap.xml")
    if os.path.isfile(sm):
        t = open(sm, encoding="utf-8").read()
        if fix_slashes(t, dirs) != t and not dry:
            open(sm, "w", encoding="utf-8").write(fix_slashes(t, dirs))
            report.append("%-58s %s" % ("sitemap.xml", "trailing-slash URLs fixed"))
    for dp, dn, fn in os.walk(root):
        # design-scratch folders in the deploy repo are noindex via vercel.json headers: leave them alone
        dn[:] = [d for d in dn if not d.startswith(".") and d not in SKIP_DIRS]
        for f in sorted(fn):
            if not f.endswith(".html") or (dp == root and f == "404.html"):
                continue
            p = os.path.join(dp, f)
            rel = os.path.relpath(p, root)
            s = open(p, encoding="utf-8").read()
            fixed = fix_slashes(s, dirs)
            new, what = patch_html(rel, fixed)
            if fixed != s:
                what += " + slash URLs fixed"
            if new != s and not dry:
                open(p, "w", encoding="utf-8").write(new)
            report.append("%-58s %s" % (rel, what))
    llms, full = build_llms(root)
    if not dry:
        for name, text in (("robots.txt", ROBOTS), ("llms.txt", llms), ("llms-full.txt", full)):
            open(os.path.join(root, name), "w", encoding="utf-8").write(text)
    print("\n".join(sorted(report)))
    print("llms.txt %d bytes, llms-full.txt %d bytes, robots.txt %d bytes" % (len(llms), len(full), len(ROBOTS)))


if __name__ == "__main__":
    main()
