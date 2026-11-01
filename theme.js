/* omo.sh theme: light (cream, the default) / dark.
   Light unless the visitor picks Dark with the Light/Dark switch; the choice
   is kept in localStorage. Loaded in <head> before paint so a dark-mode
   visitor never sees a flash of cream. The switch is placed inside each
   page's own navigation (sidebar, mobile menu, footer or paper top bar);
   pages with none get a small pill in the bottom-right corner. */
(function () {
  var KEY = "omo-theme";
  var root = document.documentElement;

  function current() {
    try { return localStorage.getItem(KEY) === "dark" ? "dark" : "light"; }
    catch (e) { return "light"; }
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", theme === "dark" ? "#171717" : "#f5f0e8");
    var btns = document.querySelectorAll(".omo-theme-switch button");
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", btns[i].getAttribute("data-theme-set") === theme ? "true" : "false");
    }
  }

  function set(theme) {
    if (theme === current()) return;
    try {
      if (theme === "dark") localStorage.setItem(KEY, "dark");
      else localStorage.removeItem(KEY);
    } catch (e) {}
    root.classList.add("omo-theme-switching");
    apply(theme);
    setTimeout(function () { root.classList.remove("omo-theme-switching"); }, 320);
  }

  apply(current());

  // other open tabs follow along
  window.addEventListener("storage", function (e) { if (e.key === KEY) apply(current()); });

  function makeSwitch(extraClass) {
    var wrap = document.createElement("div");
    wrap.className = "omo-theme-switch" + (extraClass ? " " + extraClass : "");
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Colour theme");
    ["light", "dark"].forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-theme-set", t);
      b.textContent = t === "light" ? "Light" : "Dark";
      b.addEventListener("click", function () { set(t); });
      wrap.appendChild(b);
    });
    return wrap;
  }

  function mount() {
    if (!document.body || document.querySelector(".omo-theme-switch")) return;
    var q = function (s) { return document.querySelector(s); };

    // desktop: bottom of the left sidebar
    var side = q(".sidebar .sidebar-inner") || q(".site-side");
    if (side) side.appendChild(makeSwitch("omo-ts-side"));

    // mobile: last row of the Menu dropdown
    var menu = q(".m-menu nav");
    if (menu) {
      var row = document.createElement("div");
      row.className = "omo-ts-menu-row";
      var label = document.createElement("span");
      label.textContent = "Theme";
      row.appendChild(label);
      row.appendChild(makeSwitch("omo-ts-menu"));
      menu.appendChild(document.createElement("hr"));
      menu.appendChild(row);
    }

    // pages missing one of those: footer or paper top bar, else a corner pill
    if (!side || !menu) {
      var bar = q(".site-footer .footer-inner") || q(".ct-foot") || q(".site-foot") || q(".omo-top");
      if (bar) bar.appendChild(makeSwitch("omo-ts-inline"));
      else if (!side && !menu) document.body.appendChild(makeSwitch("omo-ts-corner"));
    }
    apply(current());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
