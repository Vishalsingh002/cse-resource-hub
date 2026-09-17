const state = {
  papers: [],
  allPapers: [],
  types: {},
  semesters: [],
  isAdmin: false,
  filters: { semester: "", type: "", q: "" },
};

const el = (id) => document.getElementById(id);

const TYPE_SHORT = { pyq: "PYQ", mid: "MID", mft: "MFT", ent: "END", notes: "NOTES", syl: "SYL" };
const TYPE_COLORS = {
  pyq: { css: "--pyq-color", tintCss: "--pyq-tint" },
  mid: { css: "--mid-color", tintCss: "--mid-tint" },
  mft: { css: "--mft-color", tintCss: "--mft-tint" },
  ent: { css: "--end-color", tintCss: "--end-tint" },
  notes: { css: "--notes-color", tintCss: "--notes-tint" },
  syl: { css: "--syl-color", tintCss: "--syl-tint" },
};
const rootStyles = getComputedStyle(document.documentElement);
const cssVar = (name) => rootStyles.getPropertyValue(name).trim();

// ---------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------
async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

// ---------------------------------------------------------------------
// Load papers + filters + stats
// ---------------------------------------------------------------------
async function loadPapers() {
  const params = new URLSearchParams();
  if (state.filters.semester) params.set("semester", state.filters.semester);
  if (state.filters.type) params.set("type", state.filters.type);
  if (state.filters.q) params.set("q", state.filters.q);

  const data = await api(`/api/papers?${params.toString()}`);
  state.papers = data.papers;
  state.types = data.types;
  state.semesters = data.semesters;

  buildFilterUI();
  renderPapers();
}

async function loadStats() {
  const data = await api("/api/papers");
  state.allPapers = data.papers;
  const semestersCovered = new Set(state.allPapers.map((p) => p.semester)).size;
  el("statPapers").textContent = state.allPapers.length;
  el("statSemesters").textContent = `${semestersCovered}/${state.semesters.length || 8}`;
}

// ---------------------------------------------------------------------
// Build semester tabs + category pills (once)
// ---------------------------------------------------------------------
function buildFilterUI() {
  const semTabs = el("semesterTabs");
  const typePills = el("typeFilter");
  const uploadSemSelect = el("uploadSemester");
  const uploadTypeSelect = el("uploadType");

  if (semTabs.children.length === 0) {
    state.semesters.forEach((s) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "sem-tab";
      tab.dataset.semester = s;
      tab.innerHTML = `<div class="sem-tab-label">Sem</div><div class="sem-tab-num">${s}</div>`;
      tab.addEventListener("click", () => {
        state.filters.semester = state.filters.semester === String(s) ? "" : String(s);
        updateSemTabActive();
        loadPapers();
      });
      semTabs.appendChild(tab);
      uploadSemSelect.add(new Option(`Semester ${s}`, s));
    });
    updateSemTabActive();
  }

  if (typePills.children.length === 0) {
    const allPill = document.createElement("button");
    allPill.type = "button";
    allPill.className = "type-pill pill-all";
    allPill.dataset.type = "";
    allPill.textContent = "ALL";
    allPill.addEventListener("click", () => {
      state.filters.type = "";
      updateTypePillActive();
      loadPapers();
    });
    typePills.appendChild(allPill);

    Object.entries(state.types).forEach(([id, label]) => {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "type-pill";
      pill.dataset.type = id;
      pill.textContent = TYPE_SHORT[id] || label.toUpperCase();
      const colorInfo = TYPE_COLORS[id];
      if (colorInfo) pill.style.setProperty("--pill-color", cssVar(colorInfo.css));
      pill.addEventListener("click", () => {
        state.filters.type = id;
        updateTypePillActive();
        loadPapers();
      });
      typePills.appendChild(pill);

      uploadTypeSelect.add(new Option(label, id));
    });
    updateTypePillActive();
  }
}

function updateSemTabActive() {
  el("semesterTabs").querySelectorAll(".sem-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.semester === state.filters.semester);
  });
}

function updateTypePillActive() {
  el("typeFilter").querySelectorAll(".type-pill").forEach((pill) => {
    pill.classList.toggle("active", pill.dataset.type === state.filters.type);
  });
}

// ---------------------------------------------------------------------
// Render papers grid
// ---------------------------------------------------------------------
function renderPapers() {
  const grid = el("papersGrid");
  const empty = el("emptyState");
  grid.innerHTML = "";

  if (state.papers.length === 0) {
    empty.classList.remove("hidden");
    const semLabel = state.filters.semester ? `Semester ${state.filters.semester}` : "this filter";
    el("emptyTitle").textContent = state.filters.semester || state.filters.type || state.filters.q
      ? `Nothing here yet for ${semLabel}`
      : "Nothing here yet";
    el("emptyText").textContent = state.isAdmin
      ? "Add the first paper for this semester below."
      : "Ask an admin to add resources here.";
    el("emptyActionBtn").classList.toggle("hidden", !state.isAdmin);
    return;
  }
  empty.classList.add("hidden");

  state.papers.forEach((p) => {
    const colorInfo = TYPE_COLORS[p.type];
    const accent = colorInfo ? cssVar(colorInfo.css) : cssVar("--brand-pink");
    const tint = colorInfo ? cssVar(colorInfo.tintCss) : cssVar("--pink-tint");
    const card = document.createElement("div");
    card.className = "paper-card";
    card.style.setProperty("--card-accent", accent);
    card.innerHTML = `
      <span class="paper-tag" style="background:${tint};color:${accent}">
        ${TYPE_SHORT[p.type] || state.types[p.type] || p.type}
      </span>
      <h3 class="paper-title">${escapeHtml(p.title)}</h3>
      <p class="paper-meta">${escapeHtml(p.subject)}${p.code ? ` · ${escapeHtml(p.code)}` : ""} · Semester ${p.semester}</p>
      <div class="paper-actions">
        <a href="/uploads/${encodeURIComponent(p.filename)}" target="_blank" class="btn btn-outline">Download</a>
        ${state.isAdmin ? `<button class="btn btn-danger" data-delete="${p.id}">Remove</button>` : ""}
      </div>
    `;
    grid.appendChild(card);
  });

  if (state.isAdmin) {
    grid.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", () => deletePaper(btn.dataset.delete));
    });
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------------------------------------------------------------------
// Admin session
// ---------------------------------------------------------------------
async function checkSession() {
  const data = await api("/api/session");
  state.isAdmin = data.loggedIn;
  updateAdminUI();
}

function updateAdminUI() {
  el("adminPill").classList.toggle("hidden", !state.isAdmin);
  el("adminBtn").classList.toggle("hidden", state.isAdmin);
  el("uploadBtn").classList.toggle("hidden", !state.isAdmin);
  renderPapers();
}

async function deletePaper(id) {
  if (!confirm("Remove this resource? This cannot be undone.")) return;
  try {
    await api(`/api/papers/${id}`, { method: "DELETE" });
    await loadPapers();
    await loadStats();
  } catch (err) {
    alert(err.message);
  }
}

// ---------------------------------------------------------------------
// Event bindings
// ---------------------------------------------------------------------
function bindEvents() {
  el("searchInput").addEventListener("input", debounce((e) => {
    state.filters.q = e.target.value;
    loadPapers();
  }, 300));

  el("adminBtn").addEventListener("click", () => openModal("loginModal"));
  el("uploadBtn").addEventListener("click", () => openModal("uploadModal"));
  el("emptyActionBtn").addEventListener("click", () => openModal("uploadModal"));

  el("adminPill").addEventListener("click", async () => {
    if (!confirm("Sign out of admin mode?")) return;
    await api("/api/logout", { method: "POST" });
    state.isAdmin = false;
    updateAdminUI();
  });

  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.add("hidden");
    });
  });

  el("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = el("loginEmail").value.trim();
    const password = el("loginPassword").value;
    const errorEl = el("loginError");
    errorEl.classList.add("hidden");

    try {
      await api("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      state.isAdmin = true;
      closeModal("loginModal");
      el("loginForm").reset();
      updateAdminUI();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.remove("hidden");
    }
  });

  el("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = el("uploadError");
    errorEl.classList.add("hidden");

    const formData = new FormData();
    formData.append("title", el("uploadTitle").value.trim());
    formData.append("subject", el("uploadSubject").value.trim());
    formData.append("code", el("uploadCode").value.trim());
    formData.append("semester", el("uploadSemester").value);
    formData.append("type", el("uploadType").value);
    formData.append("file", el("uploadFile").files[0]);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");

      closeModal("uploadModal");
      el("uploadForm").reset();
      resetFileDropzone();
      await loadPapers();
      await loadStats();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.remove("hidden");
    }
  });

  el("fileDropzone").addEventListener("click", () => el("uploadFile").click());
  el("uploadFile").addEventListener("change", () => {
    const file = el("uploadFile").files[0];
    if (!file) { resetFileDropzone(); return; }
    el("fileDropzoneEmpty").classList.add("hidden");
    el("fileDropzonePreview").classList.remove("hidden");
    el("fileDropzone").classList.add("has-file");
    el("filePreviewName").textContent = file.name;
    el("filePreviewMeta").textContent = `${(file.size / (1024 * 1024)).toFixed(2)}MB · tap to replace`;
  });
}

function resetFileDropzone() {
  el("fileDropzoneEmpty").classList.remove("hidden");
  el("fileDropzonePreview").classList.add("hidden");
  el("fileDropzone").classList.remove("has-file");
}

function openModal(id) { el(id).classList.remove("hidden"); }
function closeModal(id) { el(id).classList.add("hidden"); }

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ---------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------
(async function init() {
  bindEvents();
  const loadingEl = el("loadingState");
  loadingEl.classList.remove("hidden");
  try {
    await checkSession();
    await loadPapers();
    await loadStats();
  } finally {
    loadingEl.classList.add("hidden");
  }
})();
