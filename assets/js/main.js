/* ==========================================================================
   Physics Learning Notes — Core UI Scripts
   Theme toggle, Hub filtering/search, TOC Scrollspy
   ========================================================================== */

(function () {
  const STORAGE_KEY = "physics-notes-theme";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.textContent = theme === "light" ? "☀ Light" : "☾ Dark";
      btn.setAttribute("aria-label", `Switch to ${theme === "light" ? "dark" : "light"} mode`);
    }
  }

  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY) || "dark";
    applyTheme(saved);
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") || "dark";
        const next = current === "dark" ? "light" : "dark";
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
      });
    }
  }

  function initHubFilter() {
    const searchInput = document.getElementById("topic-search");
    const cards = Array.from(document.querySelectorAll(".topic-card[data-category]"));
    const pills = Array.from(document.querySelectorAll(".filter-pills .pill"));
    if (!cards.length) return;

    let activeCategory = "all";

    function filterCards() {
      const q = (searchInput ? searchInput.value : "").trim().toLowerCase();
      cards.forEach((card) => {
        const cat = card.dataset.category || "";
        const text = card.textContent.toLowerCase();
        const catMatch = activeCategory === "all" || cat.includes(activeCategory);
        const searchMatch = !q || text.includes(q);
        card.style.display = catMatch && searchMatch ? "" : "none";
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", filterCards);
    }

    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        pills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        activeCategory = pill.dataset.filter || "all";
        filterCards();
      });
    });
  }

  function initScrollSpy() {
    const tocLinks = Array.from(document.querySelectorAll(".toc a[href^='#']"));
    if (!tocLinks.length) return;

    const sections = tocLinks
      .map((link) => {
        const id = link.getAttribute("href").slice(1);
        return { link, el: document.getElementById(id) };
      })
      .filter((item) => item.el);

    function updateActive() {
      const scrollY = window.scrollY + 120;
      let current = sections[0];
      for (const item of sections) {
        if (item.el.offsetTop <= scrollY) {
          current = item;
        }
      }
      tocLinks.forEach((l) => l.classList.remove("active"));
      if (current) current.link.classList.add("active");
    }

    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initHubFilter();
    initScrollSpy();
  });
})();
