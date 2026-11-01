/* omo.sh theme: light (cream) / dark. Follows the system setting until the
   visitor picks one with the toggle; the choice is kept in localStorage.
   Loaded in <head> before paint so there is no flash of the wrong theme. */
(function () {
  var KEY = "omo-theme";
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function stored() {
    try { var v = localStorage.getItem(KEY); return v === "dark" || v === "light" ? v : null; }
    catch (e) { return null; }
  }
  function current() { return stored() || (mq && mq.matches ? "dark" : "light"); }

  function metaColor(theme) {
    var m = document.querySelector('meta[name="theme-color"]');
    if (!m) {
      if (!document.head) return;
      m = document.createElement("meta");
      m.name = "theme-color";
      document.head.appendChild(m);
    }
    m.setAttribute("content", theme === "dark" ? "#171717" : "#f5f0e8");
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    metaColor(theme);
    var b = document.getElementById("omo-theme-toggle");
    if (b) {
      var next = theme === "dark" ? "light" : "dark";
      b.setAttribute("aria-label", "Switch to " + next + " mode");
      b.setAttribute("title", "Switch to " + next + " mode");
      b.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    }
  }

  apply(current());

  if (mq) {
    var onChange = function () { if (!stored()) apply(current()); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  var SUN = '<svg class="omo-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg>';
  var MOON = '<svg class="omo-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8z"/></svg>';

  function mount() {
    if (document.getElementById("omo-theme-toggle") || !document.body) return;
    var b = document.createElement("button");
    b.type = "button";
    b.id = "omo-theme-toggle";
    b.className = "omo-theme-toggle";
    b.innerHTML = SUN + MOON;
    b.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      try { localStorage.setItem(KEY, next); } catch (e) {}
      root.classList.add("omo-theme-switching");
      apply(next);
      setTimeout(function () { root.classList.remove("omo-theme-switching"); }, 320);
    });
    document.body.appendChild(b);
    apply(current());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
