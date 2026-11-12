/* ==========================================================================
   Physics Learning Notes — Modern Core UI & Navigation Engine
   Theme toggle, Dynamic Domain Shelves, Search with "/" shortcut,
   Jump-to-Topic Menu, and Auto Prev/Next Topic Navigation
   ========================================================================== */

(function () {
  const STORAGE_KEY = "physics-notes-theme";

  // ---------- 1. THEME TOGGLE ----------
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

  // ---------- 2. HUB GROUPED DOMAINS & SEARCH ENGINE ----------
  function initModernHub() {
    const container = document.getElementById("domains-container");
    const domainNav = document.getElementById("domain-nav");
    const searchInput = document.getElementById("topic-search");
    const searchCount = document.getElementById("search-results-count");
    const totalLiveBadge = document.getElementById("stats-live-count");
    const totalPlannedBadge = document.getElementById("stats-total-count");
    const progressFill = document.getElementById("stats-progress-fill");
    const progressPct = document.getElementById("stats-progress-pct");

    if (!container || typeof PHYSICS_DOMAINS === "undefined" || typeof PHYSICS_TOPICS === "undefined") {
      return;
    }

    // Stats calculations
    const liveCount = PHYSICS_TOPICS.filter((t) => t.isLive).length;
    const totalCount = PHYSICS_TOPICS.length;
    const pct = Math.round((liveCount / totalCount) * 100);

    if (totalLiveBadge) totalLiveBadge.textContent = liveCount;
    if (totalPlannedBadge) totalPlannedBadge.textContent = totalCount;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressPct) progressPct.textContent = `${pct}%`;

    let activeDomainId = "all";

    // Build Domain Navigation Pills
    if (domainNav) {
      domainNav.innerHTML = "";

      // "All Domains" pill
      const allPill = document.createElement("button");
      allPill.className = "domain-pill active";
      allPill.type = "button";
      allPill.dataset.domain = "all";
      allPill.innerHTML = `All Domains <span class="domain-count-badge">${totalCount}</span>`;
      domainNav.appendChild(allPill);

      PHYSICS_DOMAINS.forEach((domain) => {
        const dTopics = PHYSICS_TOPICS.filter((t) => t.domainId === domain.id);
        const dLive = dTopics.filter((t) => t.isLive).length;
        const pill = document.createElement("button");
        pill.className = "domain-pill";
        pill.type = "button";
        pill.dataset.domain = domain.id;
        pill.innerHTML = `${domain.icon} ${domain.title} <span class="domain-count-badge">${dLive}/${dTopics.length}</span>`;
        domainNav.appendChild(pill);
      });

      domainNav.addEventListener("click", (e) => {
        const pill = e.target.closest(".domain-pill");
        if (!pill) return;
        domainNav.querySelectorAll(".domain-pill").forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        activeDomainId = pill.dataset.domain || "all";
        renderHub();
      });
    }

    // Render Grouped Domain Modules & Topic Cards
    function renderHub() {
      const q = (searchInput ? searchInput.value : "").trim().toLowerCase();
      container.innerHTML = "";

      let visibleTopicsCount = 0;

      PHYSICS_DOMAINS.forEach((domain) => {
        if (activeDomainId !== "all" && activeDomainId !== domain.id) return;

        let topics = PHYSICS_TOPICS.filter((t) => t.domainId === domain.id);

        if (q) {
          topics = topics.filter((t) => {
            const inTitle = t.title.toLowerCase().includes(q);
            const inSummary = t.summary.toLowerCase().includes(q);
            const inTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
            return inTitle || inSummary || inTags;
          });
        }

        if (topics.length === 0) return;

        visibleTopicsCount += topics.length;

        const dLiveCount = topics.filter((t) => t.isLive).length;

        // Create Domain Module Section
        const moduleSection = document.createElement("section");
        moduleSection.className = "domain-module";
        moduleSection.id = `domain-${domain.id}`;

        moduleSection.innerHTML = `
          <div class="domain-header">
            <div class="domain-title-wrap">
              <span class="domain-icon">${domain.icon}</span>
              <div>
                <h2>${domain.title}</h2>
                <p class="domain-desc">${domain.description}</p>
              </div>
            </div>
            <div class="domain-status-pill">
              ${dLiveCount > 0 ? `<strong>${dLiveCount} Live</strong> · ` : ""}${topics.length} Concepts
            </div>
          </div>
          <div class="topic-grid"></div>
        `;

        const grid = moduleSection.querySelector(".topic-grid");

        topics.forEach((t) => {
          const card = document.createElement(t.isLive ? "a" : "div");
          card.className = `topic-card ${t.isLive ? "live-card" : "upcoming"}`;
          if (t.isLive) card.href = t.path;

          const tagsHtml = t.tags.map((tag) => `<span class="tag">${tag}</span>`).join("");

          card.innerHTML = `
            <div class="card-top">
              <span class="card-num">TOPIC ${t.num}</span>
              ${
                t.isLive
                  ? `<span class="live-indicator"><span class="live-dot"></span> Live · Interactive</span>`
                  : `<span class="badge badge-planned">Roadmap</span>`
              }
            </div>
            <h3>${t.title}</h3>
            <p>${t.summary}</p>
            <div class="card-tags">${tagsHtml}</div>
          `;

          grid.appendChild(card);
        });

        container.appendChild(moduleSection);
      });

      if (searchCount) {
        searchCount.textContent = q
          ? `Found ${visibleTopicsCount} topic${visibleTopicsCount === 1 ? "" : "s"} matching "${q}"`
          : "";
      }

      if (visibleTopicsCount === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 3.5rem 1rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius); border: 1px dashed var(--border-strong);">
            <div style="font-size: 2.2rem; margin-bottom: 0.6rem;">🔍</div>
            <h3 style="color: var(--text-bright); margin-bottom: 0.4rem;">No matching physics topics found</h3>
            <p style="margin: 0;">Try searching for "photon", "light", "wave", "quantum", or "heat".</p>
          </div>
        `;
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", renderHub);
    }

    // Keyboard shortcut "/" to focus search
    window.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== searchInput) {
        e.preventDefault();
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    });

    renderHub();
  }

  // ---------- 3. TOPIC PAGES: JUMP MENU & PREV/NEXT NAVIGATION ----------
  function initTopicNavigation() {
    if (typeof PHYSICS_TOPICS === "undefined") return;

    // Detect current topic from URL pathname
    const path = window.location.pathname.replace(/\\/g, "/");
    const currentTopic = PHYSICS_TOPICS.find((t) => path.includes(t.id));

    // 1. Topic Jump Dropdown in Navigation Bar
    const jumpBtn = document.getElementById("jump-topics-btn");
    const jumpMenu = document.getElementById("jump-topics-menu");

    if (jumpBtn && jumpMenu) {
      jumpBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        jumpMenu.classList.toggle("open");
      });

      document.addEventListener("click", () => {
        jumpMenu.classList.remove("open");
      });

      // Populate Jump Menu
      jumpMenu.innerHTML = "";
      PHYSICS_DOMAINS.forEach((domain) => {
        const dTopics = PHYSICS_TOPICS.filter((t) => t.domainId === domain.id && t.isLive);
        if (dTopics.length === 0) return;

        const header = document.createElement("div");
        header.className = "dropdown-domain-header";
        header.textContent = `${domain.icon} ${domain.title}`;
        jumpMenu.appendChild(header);

        dTopics.forEach((t) => {
          const item = document.createElement("a");
          item.className = "dropdown-item";
          // Path relative to topics/ directory
          const href = t.path.replace("topics/", "");
          item.href = href;
          item.innerHTML = `<strong>${t.num}</strong> · ${t.title}`;
          jumpMenu.appendChild(item);
        });
      });
    }

    // 2. Next / Previous Topic Navigation at Article Bottom
    const navFooter = document.getElementById("topic-nav-footer");
    if (navFooter && currentTopic) {
      const liveTopics = PHYSICS_TOPICS.filter((t) => t.isLive);
      const currentIndex = liveTopics.findIndex((t) => t.id === currentTopic.id);

      const prev = currentIndex > 0 ? liveTopics[currentIndex - 1] : null;
      const next = currentIndex < liveTopics.length - 1 ? liveTopics[currentIndex + 1] : null;

      navFooter.innerHTML = "";

      if (prev) {
        const prevHref = prev.path.replace("topics/", "");
        navFooter.innerHTML += `
          <a class="nav-card" href="${prevHref}">
            <span class="nav-card-dir">← Previous Topic</span>
            <span class="nav-card-title">${prev.num}. ${prev.title}</span>
          </a>
        `;
      } else {
        navFooter.innerHTML += `
          <a class="nav-card" href="../index.html">
            <span class="nav-card-dir">← Back to Hub</span>
            <span class="nav-card-title">Explore All 100 Topics</span>
          </a>
        `;
      }

      if (next) {
        const nextHref = next.path.replace("topics/", "");
        navFooter.innerHTML += `
          <a class="nav-card" href="${nextHref}" style="text-align: right;">
            <span class="nav-card-dir">Next Topic →</span>
            <span class="nav-card-title">${next.num}. ${next.title}</span>
          </a>
        `;
      } else {
        navFooter.innerHTML += `
          <a class="nav-card" href="../index.html" style="text-align: right;">
            <span class="nav-card-dir">Upcoming Topics →</span>
            <span class="nav-card-title">Browse Full Roadmap</span>
          </a>
        `;
      }
    }
  }

  // ---------- 4. SCROLLSPY FOR TABLE OF CONTENTS ----------
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
    initModernHub();
    initTopicNavigation();
    initScrollSpy();
  });
})();
