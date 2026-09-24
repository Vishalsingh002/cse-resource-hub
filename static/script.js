const DEFAULT_TYPES = {
  pyq: "Previous Year (PYQ)",
  mid: "Mid-Term",
  mft: "MFT",
  ent: "End-Term",
  notes: "Notes",
  syl: "Syllabus",
  tut: "Tutorial",
};

const TYPE_SHORT = {
  pyq: "PYQ",
  mid: "MID",
  mft: "MFT",
  ent: "END",
  notes: "NOTES",
  syl: "SYL",
  tut: "TUTORIAL",
};

const TYPE_COLORS = {
  pyq: { css: "--pyq-color", tintCss: "--pyq-tint" },
  mid: { css: "--mid-color", tintCss: "--mid-tint" },
  mft: { css: "--mft-color", tintCss: "--mft-tint" },
  ent: { css: "--end-color", tintCss: "--end-tint" },
  notes: { css: "--notes-color", tintCss: "--notes-tint" },
  syl: { css: "--syl-color", tintCss: "--syl-tint" },
  tut: { css: "--assign-color", tintCss: "--assign-tint" },
};

const state = {
  allPapers: [],        // master list of all papers in memory
  papers: [],           // currently visible flat list
  semesterPapers: [],   // papers for currently selected semester
  types: DEFAULT_TYPES,
  semesters: [1, 2, 3, 4, 5, 6, 7, 8],
  isAdmin: false,
  filters: { semester: "", type: "", q: "" },
  subject: "",
};

const el = (id) => document.getElementById(id);
const rootStyles = getComputedStyle(document.documentElement);
const cssVar = (name) => rootStyles.getPropertyValue(name).trim();

// ---------------------------------------------------------------------
// API helper
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

// Normalize paper objects to ensure type/paper_type compatibility
function normalizePaper(p) {
  const rawType = (p.paper_type || p.type || "pyq").toLowerCase();
  let typeKey = "pyq";
  if (rawType.includes("mid")) typeKey = "mid";
  else if (rawType.includes("end") || rawType.includes("ent")) typeKey = "ent";
  else if (rawType.includes("mft")) typeKey = "mft";
  else if (rawType.includes("note")) typeKey = "notes";
  else if (rawType.includes("syl")) typeKey = "syl";
  else if (rawType.includes("tut")) typeKey = "tut";
  else if (TYPE_SHORT[rawType]) typeKey = rawType;

  return {
    ...p,
    type: typeKey,
    paper_type: typeKey,
    semester: Number(p.semester),
    code: p.code || ""
  };
}

// ---------------------------------------------------------------------
// Fetch all papers ONCE and populate stats
// ---------------------------------------------------------------------
async function fetchAllPapers() {
  try {
    const data = await api("/api/papers");
    const rawList = Array.isArray(data) ? data : (data.papers || []);
    state.allPapers = rawList.map(normalizePaper);
    updateStats();
  } catch (err) {
    console.error("Failed to load papers:", err);
    state.allPapers = [];
  }
}

function updateStats() {
  const semestersCovered = new Set(state.allPapers.map((p) => p.semester)).size;
  if (el("statPapers")) el("statPapers").textContent = state.allPapers.length;
  if (el("statSemesters")) el("statSemesters").textContent = `${semestersCovered}/8`;
}

// ---------------------------------------------------------------------
// Build semester tabs + category pills
// ---------------------------------------------------------------------
function buildFilterUI() {
  const semTabs = el("semesterTabs");
  const typePills = el("typeFilter");
  const uploadSemSelect = el("uploadSemester");
  const uploadTypeSelect = el("uploadType");
  const editSemSelect = el("editSemester");
  const editTypeSelect = el("editType");

  if (semTabs && semTabs.children.length === 0) {
    state.semesters.forEach((s) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "sem-tab";
      tab.dataset.semester = s;
      tab.innerHTML = `<div class="sem-tab-label">Sem</div><div class="sem-tab-num">${s}</div>`;
      tab.addEventListener("click", () => {
        const newSem = state.filters.semester === String(s) ? "" : String(s);
        state.filters.semester = newSem;
        state.subject = "";
        state.filters.type = "";
        state.filters.q = "";
        if (el("searchInput")) el("searchInput").value = "";
        updateSemTabActive();
        updateTypePillActive();

        // Instant local filter without network request!
        if (newSem) {
          state.semesterPapers = state.allPapers.filter((p) => p.semester === Number(newSem));
        } else {
          state.semesterPapers = [];
        }
        renderView();
      });
      semTabs.appendChild(tab);

      if (uploadSemSelect) uploadSemSelect.add(new Option(`Semester ${s}`, s));
      if (editSemSelect) editSemSelect.add(new Option(`Semester ${s}`, s));
    });
    updateSemTabActive();
  }

  if (typePills && typePills.children.length === 0) {
    Object.entries(state.types).forEach(([id, label]) => {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "type-pill";
      pill.dataset.type = id;
      pill.textContent = TYPE_SHORT[id] || label.toUpperCase();
      const colorInfo = TYPE_COLORS[id];
      if (colorInfo) pill.style.setProperty("--pill-color", cssVar(colorInfo.css));
      pill.addEventListener("click", () => {
        state.filters.type = state.filters.type === id ? "" : id;
        updateTypePillActive();
        renderView();
      });
      typePills.appendChild(pill);

      if (uploadTypeSelect) uploadTypeSelect.add(new Option(label, id));
      if (editTypeSelect) editTypeSelect.add(new Option(label, id));
    });
    updateTypePillActive();
  }
}

function updateSemTabActive() {
  const semTabs = el("semesterTabs");
  if (!semTabs) return;
  semTabs.querySelectorAll(".sem-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.semester === state.filters.semester);
  });
}

function updateTypePillActive() {
  const typeFilter = el("typeFilter");
  if (!typeFilter) return;
  typeFilter.querySelectorAll(".type-pill").forEach((pill) => {
    pill.classList.toggle("active", pill.dataset.type === state.filters.type);
  });
}

// ---------------------------------------------------------------------
// Master view controller (Runs 100% in browser memory - 0ms delay)
// ---------------------------------------------------------------------
function renderView() {
  const subjectsGrid = el("subjectsGrid");
  const subjectHeader = el("subjectHeader");
  const typeFilter = el("typeFilter");
  const empty = el("emptyState");

  // Search Mode
  if (state.filters.q) {
    subjectsGrid.classList.add("hidden");
    subjectHeader.classList.add("hidden");
    typeFilter.classList.add("hidden");
    const query = state.filters.q.toLowerCase();
    state.papers = state.allPapers.filter((p) => {
      return (
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.subject && p.subject.toLowerCase().includes(query)) ||
        (p.code && p.code.toLowerCase().includes(query))
      );
    });
    renderPapers();
    return;
  }

  // No semester chosen
  if (!state.filters.semester) {
    subjectsGrid.classList.add("hidden");
    subjectHeader.classList.add("hidden");
    typeFilter.classList.add("hidden");
    state.papers = [];
    el("papersGrid").innerHTML = "";
    empty.classList.remove("hidden");
    el("emptyTitle").textContent = "Select a semester to view resources";
    el("emptyText").textContent = "Tap a semester above to see its subjects.";
    el("emptyActionBtn").classList.add("hidden");
    return;
  }

  // Semester chosen, no subject selected yet
  if (!state.subject) {
    subjectHeader.classList.add("hidden");
    typeFilter.classList.add("hidden");
    state.papers = [];
    el("papersGrid").innerHTML = "";
    renderSubjectsGrid();
    return;
  }

  // Subject chosen
  subjectsGrid.classList.add("hidden");
  subjectHeader.classList.remove("hidden");
  typeFilter.classList.remove("hidden");
  el("subjectHeaderTitle").textContent = state.subject;

  // No category chosen
  if (!state.filters.type) {
    state.papers = [];
    el("papersGrid").innerHTML = "";
    empty.classList.remove("hidden");
    el("emptyTitle").textContent = "Select a category";
    el("emptyText").textContent = "Click on END, MFT, MID, SYL, or TUTORIAL above to view resources.";
    el("emptyActionBtn").classList.add("hidden");
    return;
  }

  // Specific category selected
  state.papers = state.semesterPapers.filter((p) => {
    return p.subject === state.subject && p.type === state.filters.type;
  });
  renderPapers();
}

// ---------------------------------------------------------------------
// Render the subject grid
// ---------------------------------------------------------------------
function renderSubjectsGrid() {
  const grid = el("subjectsGrid");
  const empty = el("emptyState");
  grid.innerHTML = "";
  grid.classList.remove("hidden");

  if (state.semesterPapers.length === 0) {
    grid.classList.add("hidden");
    empty.classList.remove("hidden");
    el("emptyTitle").textContent = `Nothing here yet for Semester ${state.filters.semester}`;
    el("emptyText").textContent = state.isAdmin
      ? "Add the first paper for this semester below."
      : "Ask an admin to add resources here.";
    el("emptyActionBtn").classList.toggle("hidden", !state.isAdmin);
    return;
  }
  empty.classList.add("hidden");

  const bySubject = new Map();
  state.semesterPapers.forEach((p) => {
    if (!bySubject.has(p.subject)) {
      bySubject.set(p.subject, { subject: p.subject, code: p.code, count: 0, firstType: p.type });
    }
    bySubject.get(p.subject).count += 1;
  });

  Array.from(bySubject.values())
    .sort((a, b) => a.subject.localeCompare(b.subject))
    .forEach((s) => {
      const colorInfo = TYPE_COLORS[s.firstType];
      const accent = colorInfo ? cssVar(colorInfo.css) : cssVar("--brand-pink");
      const card = document.createElement("button");
      card.type = "button";
      card.className = "subject-card";
      card.style.setProperty("--card-accent", accent);
      card.innerHTML = `
        <h3 class="subject-card-name">${escapeHtml(s.subject)}</h3>
        ${s.code ? `<p class="subject-card-code">${escapeHtml(s.code)}</p>` : ""}
        <span class="subject-card-count">${s.count} resource${s.count > 1 ? "s" : ""}</span>
      `;
      card.addEventListener("click", () => {
        state.subject = s.subject;
        state.filters.type = "";
        updateTypePillActive();
        renderView();
      });
      grid.appendChild(card);
    });
}

// ---------------------------------------------------------------------
// Render the flat papers grid
// ---------------------------------------------------------------------
function renderPapers() {
  const grid = el("papersGrid");
  const empty = el("emptyState");
  grid.innerHTML = "";

  if (state.papers.length === 0) {
    empty.classList.remove("hidden");
    if (state.filters.q) {
      el("emptyTitle").textContent = "No matches found";
      el("emptyText").textContent = "Try a different search term.";
      el("emptyActionBtn").classList.add("hidden");
    } else {
      const typeLabel = TYPE_SHORT[state.filters.type] || state.types[state.filters.type] || state.filters.type;
      el("emptyTitle").textContent = `No ${typeLabel} resources found`;
      el("emptyText").textContent = state.isAdmin
        ? `Add the first ${typeLabel} resource for ${state.subject} below.`
        : "Ask an admin to add resources here.";
      el("emptyActionBtn").classList.toggle("hidden", !state.isAdmin);
    }
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
        ${TYPE_SHORT[p.type] || p.type}
      </span>
      <h3 class="paper-title">${escapeHtml(p.title)}</h3>
      <p class="paper-meta">${escapeHtml(p.subject)}${p.code ? ` · ${escapeHtml(p.code)}` : ""} · Semester ${p.semester}</p>
      <div class="paper-actions">
        <a href="/api/download/${p.id}" target="_blank" class="btn btn-outline">Download</a>
        ${state.isAdmin ? `<button class="btn btn-outline" data-edit="${p.id}">Edit</button>` : ""}
        ${state.isAdmin ? `<button class="btn btn-danger" data-delete="${p.id}">Remove</button>` : ""}
      </div>
    `;
    grid.appendChild(card);
  });

  if (state.isAdmin) {
    grid.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", () => deletePaper(btn.dataset.delete));
    });
    grid.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => openEditModal(btn.dataset.edit));
    });
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

// ---------------------------------------------------------------------
// Admin session
// ---------------------------------------------------------------------
async function checkSession() {
  try {
    const data = await api("/api/session");
    state.isAdmin = Boolean(data.logged_in || data.loggedIn);
    updateAdminUI();
  } catch (e) {
    state.isAdmin = false;
  }
}

function updateAdminUI() {
  el("adminPill").classList.toggle("hidden", !state.isAdmin);
  el("adminBtn").classList.toggle("hidden", state.isAdmin);
  el("uploadBtn").classList.toggle("hidden", !state.isAdmin);
  renderView();
}

async function reloadData() {
  await fetchAllPapers();
  if (state.filters.semester) {
    state.semesterPapers = state.allPapers.filter((p) => p.semester === Number(state.filters.semester));
  }
  renderView();
}

async function deletePaper(id) {
  if (!confirm("Are you sure you want to remove this resource?")) return;
  try {
    await api(`/api/papers/${id}`, { method: "DELETE" });
    await reloadData();
  } catch (err) {
    alert("Delete failed: " + err.message);
  }
}

function openEditModal(id) {
  const paper = state.allPapers.find((p) => String(p.id) === String(id));
  if (!paper) return;
  el("editPaperId").value = paper.id;
  el("editTitle").value = paper.title;
  el("editSemester").value = paper.semester;
  el("editType").value = paper.type;
  el("editSubject").value = paper.subject;
  el("editCode").value = paper.code || "";
  el("editError").classList.add("hidden");
  openModal("editModal");
}

// ---------------------------------------------------------------------
// Event bindings
// ---------------------------------------------------------------------
function bindEvents() {
  el("searchInput").addEventListener("input", (e) => {
    state.filters.q = e.target.value.trim();
    renderView();
  });

  el("adminBtn").addEventListener("click", () => openModal("loginModal"));
  el("uploadBtn").addEventListener("click", () => openModal("uploadModal"));
  el("emptyActionBtn").addEventListener("click", () => openModal("uploadModal"));

  el("backToSubjectsBtn").addEventListener("click", () => {
    state.subject = "";
    state.filters.type = "";
    updateTypePillActive();
    renderView();
  });

  el("adminPill").addEventListener("click", async () => {
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

  // Screen click to deselect category pill
  document.addEventListener("click", (e) => {
    if (state.subject && state.filters.type) {
      const isInsidePill = e.target.closest(".type-pill");
      const isInsidePaper = e.target.closest(".paper-card");
      const isInsideModal = e.target.closest(".modal");
      const isInsideHeader = e.target.closest(".subject-header");
      const isInsideControls = e.target.closest(".controls-row");
      const isInsideHero = e.target.closest(".hero");

      if (!isInsidePill && !isInsidePaper && !isInsideModal && !isInsideHeader && !isInsideControls && !isInsideHero) {
        state.filters.type = "";
        updateTypePillActive();
        renderView();
      }
    }
  });

  // Login Form
  el("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = el("loginEmail").value.trim();
    const password = el("loginPassword").value;
    const errorEl = el("loginError");
    errorEl.classList.add("hidden");

    try {
      await api("/api/login", {
        method: "POST",
        body: JSON.stringify({ username: email, email, password }),
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

  // Upload Form
  el("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = el("uploadError");
    errorEl.classList.add("hidden");

    const submitBtn = el("uploadForm").querySelector("button[type=submit]");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Uploading...";
    submitBtn.disabled = true;

    const formData = new FormData();
    formData.append("title", el("uploadTitle").value.trim());
    formData.append("subject", el("uploadSubject").value.trim());
    formData.append("code", el("uploadCode").value.trim());
    formData.append("semester", el("uploadSemester").value);
    formData.append("paper_type", el("uploadType").value);
    formData.append("file", el("uploadFile").files[0]);

    try {
      // Connects directly to /api/papers endpoint in app.py
      const res = await fetch("/api/papers", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");

      closeModal("uploadModal");
      el("uploadForm").reset();
      resetFileDropzone();
      await reloadData();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.remove("hidden");
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
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

  // Edit Form
  el("editForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = el("editError");
    errorEl.classList.add("hidden");

    const id = el("editPaperId").value;
    const payload = {
      title: el("editTitle").value.trim(),
      subject: el("editSubject").value.trim(),
      code: el("editCode").value.trim(),
      semester: el("editSemester").value,
      type: el("editType").value,
    };

    try {
      await api(`/api/papers/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      closeModal("editModal");
      el("editForm").reset();
      await reloadData();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.remove("hidden");
    }
  });
}

function resetFileDropzone() {
  el("fileDropzoneEmpty").classList.remove("hidden");
  el("fileDropzonePreview").classList.add("hidden");
  el("fileDropzone").classList.remove("has-file");
}

function openModal(id) { el(id).classList.remove("hidden"); }
function closeModal(id) { el(id).classList.add("hidden"); }

// ---------------------------------------------------------------------
// Instant Parallel Init
// ---------------------------------------------------------------------
(async function init() {
  bindEvents();
  buildFilterUI();
  const loadingEl = el("loadingState");
  if (loadingEl) loadingEl.classList.remove("hidden");

  // Load session & papers in parallel for maximum speed
  try {
    await Promise.all([checkSession(), fetchAllPapers()]);
    renderView();
  } finally {
    if (loadingEl) loadingEl.classList.add("hidden");
  }
})();