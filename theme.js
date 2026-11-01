/* omo.sh theme: light (cream, the default) / dark.
   Light unless the visitor picks Dark with the moon button; the choice
   is kept in localStorage. The control is one quiet moon / sun icon button. Loaded in <head> before paint so a dark-mode
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
    var label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    var btns = document.querySelectorAll(".omo-theme-switch");
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-label", label);
      btns[i].setAttribute("title", label);
      btns[i].setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
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

  // line icons drawn like the omo mark: thin square-cap strokes, no fills
  var MOON = '<svg class="omo-ts-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 14.2A7.8 7.8 0 0 1 9.8 4.5a7.8 7.8 0 1 0 9.7 9.7z"/></svg>';
  var SUN = '<svg class="omo-ts-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.6"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>';

  function makeSwitch(extraClass, withText) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "omo-theme-switch" + (extraClass ? " " + extraClass : "");
    b.innerHTML = MOON + SUN + (withText
      ? '<span class="omo-ts-to-dark">Dark mode</span><span class="omo-ts-to-light">Light mode</span>' : "");
    b.addEventListener("click", function () { set(current() === "dark" ? "light" : "dark"); });
    return b;
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
      menu.appendChild(document.createElement("hr"));
      menu.appendChild(makeSwitch("omo-ts-menu", true));
    }

    // pages missing one of those: footer or paper top bar, else a corner button
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
