/* Workshop カタログ — データ読込・フィルタ・描画 */
(function () {
  "use strict";

  var state = {
    data: null,
    categoryById: {},
    levelById: {},
    activeCategory: null, // category id or null = all
    activeLevel: null, // level id or null = all
    query: ""
  };

  var els = {};

  document.addEventListener("DOMContentLoaded", function () {
    cacheEls();
    initTheme();
    loadData();
  });

  function cacheEls() {
    els.title = document.getElementById("site-title");
    els.subtitle = document.getElementById("site-subtitle");
    els.updated = document.getElementById("updated");
    els.categoryFilters = document.getElementById("category-filters");
    els.levelFilters = document.getElementById("level-filters");
    els.search = document.getElementById("search");
    els.cards = document.getElementById("cards");
    els.emptyState = document.getElementById("empty-state");
    els.resultCount = document.getElementById("result-count");
    els.resetBtn = document.getElementById("reset-filters");
    els.themeToggle = document.getElementById("theme-toggle");
  }

  /* ---------- Theme ---------- */
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem("wc-theme"); } catch (e) {}
    if (saved === "light" || saved === "dark") {
      document.documentElement.setAttribute("data-theme", saved);
    }
    els.themeToggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      if (!current) {
        var prefersDark = window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        current = prefersDark ? "dark" : "light";
      }
      var next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("wc-theme", next); } catch (e) {}
    });
  }

  /* ---------- Data ---------- */
  function loadData() {
    fetch("data/workshops.json", { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        state.data = data;
        (data.categories || []).forEach(function (c) { state.categoryById[c.id] = c; });
        (data.levels || []).forEach(function (l) { state.levelById[l.id] = l; });
        render();
        bindEvents();
      })
      .catch(function (err) {
        els.cards.innerHTML =
          '<p class="empty-state">データの読み込みに失敗しました（' +
          escapeHtml(String(err.message)) +
          '）。ローカルでは HTTP サーバ経由で開いてください。</p>';
        console.error(err);
      });
  }

  function render() {
    var meta = state.data.meta || {};
    if (meta.title) { els.title.textContent = meta.title; document.title = meta.title; }
    els.subtitle.textContent = meta.subtitle || "";
    els.updated.textContent = meta.updated || "—";
    renderCategoryFilters();
    renderLevelFilters();
    renderCards();
  }

  /* ---------- Filter chips ---------- */
  function renderCategoryFilters() {
    var cats = state.data.categories || [];
    var html = chip("すべて", null === state.activeCategory, "all", "category");
    cats.forEach(function (c) {
      html += '<button class="chip" data-type="category" data-value="' + escapeAttr(c.id) +
        '" aria-pressed="false"><span class="chip-dot" style="background:' +
        escapeHtml(c.color || "#888") + '"></span>' + escapeHtml(c.short) + "</button>";
    });
    els.categoryFilters.innerHTML = html;
  }

  function renderLevelFilters() {
    var levels = state.data.levels || [];
    var html = chip("すべて", null === state.activeLevel, "all", "level");
    levels.forEach(function (l) {
      html += '<button class="chip" data-type="level" data-value="' + escapeAttr(l.id) +
        '" aria-pressed="false">' + escapeHtml(l.name) + "</button>";
    });
    els.levelFilters.innerHTML = html;
  }

  function chip(label, pressed, value, type) {
    return '<button class="chip" data-type="' + type + '" data-value="' + value +
      '" aria-pressed="' + (pressed ? "true" : "false") + '">' + escapeHtml(label) + "</button>";
  }

  function syncFilterUI() {
    setPressed(els.categoryFilters, state.activeCategory);
    setPressed(els.levelFilters, state.activeLevel);
  }

  function setPressed(container, activeValue) {
    var chips = container.querySelectorAll(".chip");
    Array.prototype.forEach.call(chips, function (ch) {
      var v = ch.getAttribute("data-value");
      var isActive = (activeValue === null && v === "all") || v === activeValue;
      ch.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  /* ---------- Cards ---------- */
  function renderCards() {
    var list = filterWorkshops();
    els.resultCount.textContent = list.length + " 件のワークショップ";

    if (!list.length) {
      els.cards.innerHTML = "";
      els.emptyState.hidden = false;
      els.emptyState.textContent = (state.data.workshops || []).length
        ? "条件に一致するワークショップが見つかりませんでした。"
        : "まだワークショップが登録されていません。data/workshops.json に追加してください。";
      return;
    }
    els.emptyState.hidden = true;

    els.cards.innerHTML = list.map(cardHtml).join("");
  }

  function cardHtml(w) {
    var cat = state.categoryById[w.category] || { name: w.category, short: w.category, color: "#888" };
    var level = state.levelById[w.level] || { name: w.level };
    var hasUrl = w.url && w.url !== "#";

    var tags = (w.tags || []).map(function (t) {
      return '<span class="tag">' + escapeHtml(t) + "</span>";
    }).join("");

    var action = hasUrl
      ? '<a class="card-action" href="' + escapeAttr(w.url) +
        '" target="_blank" rel="noopener noreferrer">ワークショップを開く →</a>'
      : '<span class="card-action disabled">準備中</span>';

    var meta = w.duration
      ? '<div class="card-meta"><span aria-hidden="true">⏱️</span><span>' +
        escapeHtml(w.duration) + "</span></div>"
      : "";

    return '<article class="card" style="--card-color:' + escapeHtml(cat.color || "#888") + '">' +
      '<div class="card-badges">' +
        '<span class="badge badge-category" style="background:' + escapeHtml(cat.color || "#888") +
          '">' + escapeHtml(cat.short) + "</span>" +
        '<span class="badge badge-level ' + escapeAttr(w.level) + '">' + escapeHtml(level.name) + "</span>" +
      "</div>" +
      '<h3 class="card-title">' + escapeHtml(w.title) + "</h3>" +
      '<p class="card-desc">' + escapeHtml(w.description || "") + "</p>" +
      meta +
      (tags ? '<div class="tags">' + tags + "</div>" : "") +
      action +
      "</article>";
  }

  function filterWorkshops() {
    var q = state.query.trim().toLowerCase();
    return (state.data.workshops || []).filter(function (w) {
      if (state.activeCategory && w.category !== state.activeCategory) return false;
      if (state.activeLevel && w.level !== state.activeLevel) return false;
      if (q) {
        var hay = [w.title, w.description, (w.tags || []).join(" ")].join(" ").toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  /* ---------- Events ---------- */
  function bindEvents() {
    els.categoryFilters.addEventListener("click", onChipClick);
    els.levelFilters.addEventListener("click", onChipClick);

    els.search.addEventListener("input", function () {
      state.query = els.search.value;
      renderCards();
    });

    els.resetBtn.addEventListener("click", function () {
      state.activeCategory = null;
      state.activeLevel = null;
      state.query = "";
      els.search.value = "";
      syncFilterUI();
      renderCards();
    });
  }

  function onChipClick(e) {
    var chipEl = e.target.closest(".chip");
    if (!chipEl) return;
    var type = chipEl.getAttribute("data-type");
    var value = chipEl.getAttribute("data-value");
    var resolved = value === "all" ? null : value;
    if (type === "category") state.activeCategory = resolved;
    if (type === "level") state.activeLevel = resolved;
    syncFilterUI();
    renderCards();
  }

  /* ---------- Utils ---------- */
  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function escapeAttr(s) { return escapeHtml(s); }
})();
