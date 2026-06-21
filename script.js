// ─── DOM helpers ──────────────────────────────────────────
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (typeof text === "string") node.textContent = text;
  return node;
}

function createTextPanel(text) {
  const wrap = el("div", "text-panel");
  const lbl  = el("p", "audio-label", "Description");
  const body = el("div", "sample-text", text);
  wrap.append(lbl, body);
  return wrap;
}

function createDemoCard(demo, index) {
  const card = el("article", "sample-card reveal");

  // Stagger delay
  card.style.setProperty("--delay", `${Math.min(index * 55, 330)}ms`);

  // Header
  const header = el("header", "sample-header");
  const copy   = document.createElement("div");
  const lang   = el("p", "sample-lang", demo.languageLabel);
  const title  = el("h4", "sample-title", demo.name);
  const chip   = el("span", "status-chip", demo.status);

  copy.append(lang, title);
  header.append(copy, chip);

  // Body
  card.append(header, createTextPanel(demo.text));

  return card;
}

// ─── Reveal observer ──────────────────────────────────────
const revealObserver =
  typeof IntersectionObserver === "function"
    ? new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0, rootMargin: "0px 0px -6% 0px" },
      )
    : null;

function observeReveal(el) {
  if (el.dataset.revealBound) return;
  el.dataset.revealBound = "true";
  if (!revealObserver) {
    el.classList.add("is-visible");
    return;
  }
  revealObserver.observe(el);
}

function setupRevealAnimations() {
  document.querySelectorAll(".reveal").forEach(observeReveal);
}

// ─── Sidebar nav active state ─────────────────────────────
function setupSidebarActive() {
  const links = document.querySelectorAll(".sidebar-link");
  if (!links.length || typeof IntersectionObserver !== "function") return;

  // Read section IDs from sidebar link hrefs (skip "← Home" link)
  const sectionIds = [];
  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      const id = href.slice(1);
      if (!sectionIds.includes(id)) sectionIds.push(id);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach((link) => {
          const href = link.getAttribute("href");
          const match = href === `#${id}`;
          link.classList.toggle("active", match);
        });
      });
    },
    { threshold: 0.3, rootMargin: "-80px 0px -40% 0px" },
  );

  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

// ─── Tab switching ────────────────────────────────────────
function setupTabs() {
  const tabs = document.querySelectorAll(".demo-tab");
  if (!tabs.length) return;

  // Build panel map from data-tab attributes (convention: panel id = "{tab}Samples")
  const panels = {};
  tabs.forEach((tab) => {
    const key = tab.dataset.tab;
    if (key) {
      panels[key] = document.getElementById(`${key}Samples`);
    }
  });

  function showTab(targetKey) {
    tabs.forEach((t) => {
      const isActive = t.dataset.tab === targetKey;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    Object.entries(panels).forEach(([key, panel]) => {
      if (!panel) return;
      panel.style.display = key === targetKey ? "grid" : "none";
    });
    setupRevealAnimations();
  }

  // Initialize: show first tab
  const firstTab = tabs[0];
  if (firstTab && firstTab.dataset.tab) {
    showTab(firstTab.dataset.tab);
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => showTab(tab.dataset.tab));
  });
}

// ─── Demo rendering ───────────────────────────────────────
function renderDemos(demosByCategory) {
  Object.entries(demosByCategory).forEach(([category, demos]) => {
    const target = document.getElementById(`${category}Samples`);
    if (!target) return;
    target.textContent = "";
    demos.forEach((demo, i) => {
      target.append(createDemoCard(demo, i));
    });
  });
}

// ─── Init ─────────────────────────────────────────────────
async function init() {
  setupRevealAnimations();
  setupSidebarActive();
  setupTabs();

  // Use page-specific demo data if defined, otherwise use default
  if (window.PAGE_DEMOS && Object.keys(window.PAGE_DEMOS).length > 0) {
    renderDemos(window.PAGE_DEMOS);
  }

  setupRevealAnimations(); // observe newly created cards
}

init();
