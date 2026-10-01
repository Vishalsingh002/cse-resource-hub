// =====================================================================
// Quantum University Academic Archive — Modern Minimalist Frontend Engine
// (Modeled faithfully after the reference student portal design)
// =====================================================================

const DEFAULT_TYPES = {
  pyq: "Previous Year Question (PYQ)",
  mid: "Mid-Term Exam",
  mft: "MFT (Mid Final Term)",
  ent: "End-Term Exam",
  notes: "Notes & Lecture Slides",
  syl: "Syllabus Guide",
  tut: "Tutorials & Assignments",
  lab: "Lab Manuals",
};

const TYPE_SHORT = {
  pyq: "PYQ",
  mid: "MID TERM",
  mft: "MFT",
  ent: "END TERM",
  notes: "NOTES",
  syl: "SYLLABUS",
  tut: "TUTORIAL",
  lab: "LAB MANUAL",
};

const TYPE_ICONS = {
  pyq: "📝",
  mid: "🎯",
  mft: "📋",
  ent: "🏆",
  notes: "📚",
  syl: "📑",
  tut: "💡",
  lab: "🔬",
};

const TYPE_COLORS = {
  pyq: { css: "--pyq-color", tintCss: "--pyq-tint" },
  mid: { css: "--mid-color", tintCss: "--mid-tint" },
  mft: { css: "--mft-color", tintCss: "--mft-tint" },
  ent: { css: "--end-color", tintCss: "--end-tint" },
  notes: { css: "--notes-color", tintCss: "--notes-tint" },
  syl: { css: "--syl-color", tintCss: "--syl-tint" },
  tut: { css: "--tut-color", tintCss: "--tut-tint" },
  lab: { css: "--lab-color", tintCss: "--lab-tint" },
};

const BRANCH_ICONS = {
  all: "🌐",
  cse: "💻",
  aiml: "🤖",
  ds: "📊",
  cs: "🛡️",
  ece: "📡",
  me: "⚙️",
  ce: "🏗️",
  bca: "📱",
  mca: "🚀",
  bba: "💼",
  bpharma: "💊",
};

const DEFAULT_BRANCHES = [
  { id: "all", code: "ALL", name: "All Branches" },
  { id: "cse", code: "B.TECH CSE", name: "Computer Science & Engineering" },
  { id: "aiml", code: "B.TECH AI & ML", name: "Artificial Intelligence & ML" },
  { id: "ds", code: "B.TECH DATA SCIENCE", name: "Data Science" },
  { id: "cs", code: "B.TECH CYS", name: "Cyber Security" },
  { id: "ece", code: "B.TECH ECE", name: "Electronics & Communication" },
  { id: "me", code: "B.TECH ME", name: "Mechanical Engineering" },
  { id: "ce", code: "B.TECH CIVIL", name: "Civil Engineering" },
  { id: "bca", code: "BCA", name: "Bachelor of Computer Apps" },
  { id: "mca", code: "MCA", name: "Master of Computer Apps" },
  { id: "bba", code: "BBA", name: "Bachelor of Business Admin" },
  { id: "bpharma", code: "B.PHARMA", name: "Bachelor of Pharmacy" },
];

const FOLDER_SVG = `
<svg viewBox="0 0 24 24" width="22" height="22" fill="#EAB308" stroke="#CA8A04" stroke-width="0.5" style="flex-shrink:0; display:inline-block; vertical-align:middle;">
  <path d="M2.5 5.5A1.5 1.5 0 0 1 4 4h4.379a1.5 1.5 0 0 1 1.06.44l1.622 1.62A1.5 1.5 0 0 0 12.12 6.5H20a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18V5.5z"/>
</svg>
`;

const state = {
  allPapers: [],        // approved resources
  papers: [],           // currently visible list in cards/search
  branches: DEFAULT_BRANCHES,
  types: DEFAULT_TYPES,
  semesters: [1, 2, 3, 4, 5, 6, 7, 8],
  isAdmin: false,
  adminDiscovered: false,
  pendingCount: 0,
  requestsCount: 0,
  pendingPapers: [],
  feedbackRequests: [],
  filters: {
    branch: "all",
    semester: "",
    type: "",
    q: "",
  },
  subject: "",
  viewMode: "folders",  // default to folder directory mode (matching screenshot 5)
  folderLevel: "root",  // "root", "branch", "semester"
  folderBranch: null,
  folderSem: null,
};

const el = (id) => document.getElementById(id);
const rootStyles = getComputedStyle(document.documentElement);
const cssVar = (name) => rootStyles.getPropertyValue(name).trim();

// ---------------------------------------------------------------------
// Pure Dark Theme Engine (Permanent Dark Mode Only)
// ---------------------------------------------------------------------
function initTheme() {
  document.documentElement.setAttribute("data-theme", "dark");
  localStorage.setItem("vault_theme", "dark");
}

// ---------------------------------------------------------------------
// Toast Notification Utility
// ---------------------------------------------------------------------
function showToast(message, type = "success") {
  const container = el("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === "success" ? "✓" : "⚠"}</span>
    <span class="toast-msg">${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(40px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4200);
}

// ---------------------------------------------------------------------
// API Helper
// ---------------------------------------------------------------------
async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
}

// ---------------------------------------------------------------------
// Helper: Matches Branch
// ---------------------------------------------------------------------
function matchesBranch(paperBranch, branchObj) {
  if (!paperBranch || !branchObj) return false;
  if (branchObj.id === "all") return true;
  const pb = paperBranch.toLowerCase().trim();
  const bId = branchObj.id.toLowerCase().trim();
  const bCode = (branchObj.code || "").toLowerCase().trim();
  const bName = (branchObj.name || "").toLowerCase().trim();
  return (
    pb === bId ||
    bCode.includes(pb) ||
    pb.includes(bCode) ||
    bName.includes(pb) ||
    pb.includes(bId)
  );
}

// ---------------------------------------------------------------------
// Normalize Paper Objects & File Type Detection
// ---------------------------------------------------------------------
function normalizePaper(p) {
  const rawType = (p.type || p.paper_type || "pyq").toLowerCase();
  let typeKey = "pyq";
  if (rawType.includes("mid")) typeKey = "mid";
  else if (rawType.includes("end") || rawType.includes("ent")) typeKey = "ent";
  else if (rawType.includes("mft")) typeKey = "mft";
  else if (rawType.includes("note")) typeKey = "notes";
  else if (rawType.includes("syl")) typeKey = "syl";
  else if (rawType.includes("tut")) typeKey = "tut";
  else if (rawType.includes("lab")) typeKey = "lab";
  else if (TYPE_SHORT[rawType]) typeKey = rawType;

  // File extension detector
  const filename = (p.original_name || p.filename || "").toLowerCase();
  let fileType = "pdf";
  let fileClass = "tag-pdf";
  if (filename.endsWith(".doc") || filename.endsWith(".docx")) {
    fileType = "docx";
    fileClass = "tag-doc";
  } else if (filename.endsWith(".ppt") || filename.endsWith(".pptx")) {
    fileType = "pptx";
    fileClass = "tag-ppt";
  } else if (filename.endsWith(".png") || filename.endsWith(".jpg") || filename.endsWith(".jpeg") || filename.endsWith(".webp")) {
    fileType = "img";
    fileClass = "tag-img";
  }

  // Preview URL
  let previewUrl = p.filename;
  if (!previewUrl.startsWith("http://") && !previewUrl.startsWith("https://")) {
    previewUrl = `/uploads/${encodeURIComponent(p.filename)}`;
  }

  return {
    ...p,
    type: typeKey,
    fileType: fileType.toUpperCase(),
    fileClass: fileClass,
    previewUrl: previewUrl,
    semester: Number(p.semester),
    code: p.code || "",
    branch: p.branch || "CSE",
    contributor_name: p.contributor_name || "Campus Community",
    downloads: Number(p.downloads || 0),
  };
}

function getInitials(name) {
  if (!name) return "QU";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ---------------------------------------------------------------------
// Fetch All Papers & Update Live Stats
// ---------------------------------------------------------------------
async function fetchAllPapers() {
  try {
    const data = await api("/api/papers");
    const rawList = Array.isArray(data) ? data : (data.papers || []);
    state.allPapers = rawList.map(normalizePaper);
    if (typeof data.pending_count === "number") {
      state.pendingCount = data.pending_count;
      updatePendingBadge();
    }
    updateStats();
    renderFolderDirectory();
  } catch (err) {
    console.error("Failed to load papers:", err);
    state.allPapers = [];
  }
}

function updateStats() {
  const totalPapers = state.allPapers.length;
  const activeBranches = new Set(state.allPapers.map((p) => (p.branch || "").toUpperCase())).size;
  const uniqueContributors = new Set(
    state.allPapers
      .map((p) => (p.contributor_name || "").trim().toLowerCase())
      .filter((n) => n && n !== "anonymous" && n !== "campus community")
  ).size;

  if (el("statPapers")) el("statPapers").textContent = totalPapers;
  if (el("statBranches")) el("statBranches").textContent = Math.max(activeBranches, 1);
  if (el("statContributors")) el("statContributors").textContent = Math.max(uniqueContributors, 1);

  // Update dynamic footer timestamp
  const tsEl = el("lastUpdatedTimestamp");
  if (tsEl) {
    const now = new Date();
    tsEl.textContent = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }) + ", " + now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }) + " IST";
  }
}

function updatePendingBadge() {
  const badge = el("pendingBadge");
  if (!badge) return;
  if (state.pendingCount > 0) {
    badge.textContent = state.pendingCount;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
  if (el("adminPendingCount")) el("adminPendingCount").textContent = state.pendingCount;
}

// ---------------------------------------------------------------------
// Folder Directory Explorer (Matching Screenshot 5: ↑ pyqs)
// ---------------------------------------------------------------------
function renderFolderDirectory() {
  const listEl = el("folderTreeList");
  const breadcrumbEl = el("folderBreadcrumb");
  const upBtn = el("folderUpBtn");
  if (!listEl || !breadcrumbEl) return;

  listEl.innerHTML = "";

  if (state.folderLevel === "root") {
    if (upBtn) upBtn.classList.add("hidden");
    breadcrumbEl.innerHTML = `<span class="crumb-active">pyqs</span>`;

    state.branches.forEach((b) => {
      if (b.id === "all") return;
      const count = state.allPapers.filter((p) => matchesBranch(p.branch, b)).length;
      const row = document.createElement("div");
      row.className = "folder-row-item";
      row.innerHTML = `
        <div class="folder-left-content">
          ${FOLDER_SVG}
          <span class="folder-name-text">${escapeHtml(b.code || b.name.toUpperCase())}</span>
        </div>
        <div class="folder-right-content">
          <span class="folder-file-count">${count} ${count === 1 ? 'file' : 'files'}</span>
          <span class="folder-row-chevron">&rsaquo;</span>
        </div>
      `;
      row.addEventListener("click", () => {
        state.folderLevel = "branch";
        state.folderBranch = b;
        renderFolderDirectory();
      });
      listEl.appendChild(row);
    });

  } else if (state.folderLevel === "branch") {
    if (upBtn) upBtn.classList.remove("hidden");
    const b = state.folderBranch;
    breadcrumbEl.innerHTML = `
      <span class="crumb-link" onclick="goToFolderLevel('root')">pyqs</span>
      <span style="color:#71717A;margin:0 4px;">/</span>
      <span class="crumb-active">${escapeHtml(b.code || b.name)}</span>
    `;

    state.semesters.forEach((s) => {
      const count = state.allPapers.filter(
        (p) => matchesBranch(p.branch, b) && Number(p.semester) === Number(s)
      ).length;
      const row = document.createElement("div");
      row.className = "folder-row-item";
      row.innerHTML = `
        <div class="folder-left-content">
          ${FOLDER_SVG}
          <span class="folder-name-text">SEMESTER ${s}</span>
        </div>
        <div class="folder-right-content">
          <span class="folder-file-count">${count} ${count === 1 ? 'item' : 'items'}</span>
          <span class="folder-row-chevron">&rsaquo;</span>
        </div>
      `;
      row.addEventListener("click", () => {
        state.folderLevel = "semester";
        state.folderSem = s;
        renderFolderDirectory();
      });
      listEl.appendChild(row);
    });

  } else if (state.folderLevel === "semester") {
    if (upBtn) upBtn.classList.remove("hidden");
    const b = state.folderBranch;
    const s = state.folderSem;
    breadcrumbEl.innerHTML = `
      <span class="crumb-link" onclick="goToFolderLevel('root')">pyqs</span>
      <span style="color:#71717A;margin:0 4px;">/</span>
      <span class="crumb-link" onclick="goToFolderLevel('branch')">${escapeHtml(b.code || b.name)}</span>
      <span style="color:#71717A;margin:0 4px;">/</span>
      <span class="crumb-active">SEMESTER ${s}</span>
    `;

    const papers = state.allPapers.filter(
      (p) => matchesBranch(p.branch, b) && Number(p.semester) === Number(s)
    );

    if (papers.length === 0) {
      const emptyRow = document.createElement("div");
      emptyRow.className = "folder-empty-row";
      emptyRow.innerHTML = `
        <div>📁 No papers uploaded yet for <strong>${escapeHtml(b.code)} Semester ${s}</strong>.</div>
        <button class="btn-contribute-mini" onclick="openUploadForContext('${escapeHtml(b.code)}', ${s})">+ Contribute First Paper</button>
      `;
      listEl.appendChild(emptyRow);
    } else {
      papers.forEach((p) => {
        listEl.appendChild(createPaperRow(p));
      });
      bindPaperEvents(listEl);
    }
  }
}

window.goToFolderLevel = function(level) {
  if (level === "root") {
    state.folderLevel = "root";
    state.folderBranch = null;
    state.folderSem = null;
  } else if (level === "branch") {
    state.folderLevel = "branch";
    state.folderSem = null;
  }
  renderFolderDirectory();
};

function handleFolderUp() {
  if (state.folderLevel === "semester") {
    state.folderLevel = "branch";
    state.folderSem = null;
  } else if (state.folderLevel === "branch") {
    state.folderLevel = "root";
    state.folderBranch = null;
  }
  renderFolderDirectory();
}

// ---------------------------------------------------------------------
// Minimalist Paper Row Renderer (Matching Screenshot Style)
// ---------------------------------------------------------------------
function createPaperRow(p) {
  const row = document.createElement("div");
  row.className = "paper-item-row";
  const typeBadge = TYPE_SHORT[p.type] || p.type.toUpperCase();

  row.innerHTML = `
    <div class="paper-item-main">
      <span class="paper-file-tag ${p.fileClass}">${p.fileType}</span>
      <div class="paper-content-col">
        <div class="paper-row-title">${escapeHtml(p.title)}</div>
        <div class="paper-row-meta">
          <span>${escapeHtml(p.subject)}</span>
          ${p.code ? `<span>&bull; ${escapeHtml(p.code)}</span>` : ""}
          <span>&bull; Sem ${p.semester}</span>
          <span class="paper-contributor-tag">&bull; Shared by <strong>${escapeHtml(p.contributor_name)}</strong></span>
        </div>
      </div>
    </div>
    <div class="paper-item-actions">
      <a href="${p.previewUrl}" target="_blank" rel="noopener noreferrer" class="btn-preview" title="Preview in browser">
        Preview ↗
      </a>
      <a href="/api/download/${p.id}" class="btn-download" download title="Direct file download">
        Download ↓
      </a>
      ${state.isAdmin ? `
        <button class="btn btn-outline btn-sm" data-edit="${p.id}">Edit</button>
        <button class="btn btn-danger btn-sm" data-delete="${p.id}">&times;</button>
      ` : ""}
    </div>
  `;
  return row;
}

function bindPaperEvents(container) {
  if (state.isAdmin) {
    container.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", () => deletePaper(btn.dataset.delete));
    });
    container.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => openEditModal(btn.dataset.edit));
    });
  }
}

// ---------------------------------------------------------------------
// Live Search Engine
// ---------------------------------------------------------------------
function handleSearch(query) {
  const q = query.trim().toLowerCase();
  state.filters.q = q;

  const clearBtn = el("clearSearchBtn");
  if (clearBtn) clearBtn.classList.toggle("hidden", !q);

  const folderView = el("folderDirectoryView");
  const papersGrid = el("papersGrid");
  const empty = el("emptyState");

  if (!q) {
    if (folderView) folderView.classList.remove("hidden");
    if (papersGrid) papersGrid.classList.add("hidden");
    if (empty) empty.classList.add("hidden");
    renderFolderDirectory();
    return;
  }

  // In search mode:
  if (folderView) folderView.classList.add("hidden");
  if (papersGrid) papersGrid.classList.remove("hidden");

  // Check if search query reveals admin access
  const isAdminQuery = (
    q === "admin" ||
    q === "/admin" ||
    q === "admin login" ||
    q === "admin portal" ||
    q === "portal" ||
    q === "login" ||
    (q.includes("@") && (q.includes("admin") || q.includes("gmail") || q.includes("college")))
  );

  if (isAdminQuery) {
    state.adminDiscovered = true;
    if (el("adminBtn") && !state.isAdmin) el("adminBtn").classList.remove("hidden");
  }

  const matches = state.allPapers.filter((p) => {
    return (
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.subject && p.subject.toLowerCase().includes(q)) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.branch && p.branch.toLowerCase().includes(q)) ||
      (p.contributor_name && p.contributor_name.toLowerCase().includes(q))
    );
  });

  papersGrid.innerHTML = "";

  // Render Admin Portal access card if admin intent detected
  if (isAdminQuery) {
    const callout = document.createElement("div");
    callout.className = "admin-search-callout";
    callout.innerHTML = `
      <div class="admin-search-callout-left">
        <div class="admin-search-callout-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <div>
          <div class="admin-search-callout-title">Admin Moderation Portal</div>
          <div class="admin-search-callout-desc">Authorized administrators can sign in to moderate uploads and manage papers.</div>
        </div>
      </div>
      <button type="button" class="admin-search-callout-btn" id="adminSearchLoginBtn">
        ${state.isAdmin ? "Open Dashboard" : "Sign In"}
      </button>
    `;
    const calloutBtn = callout.querySelector("#adminSearchLoginBtn");
    if (calloutBtn) {
      calloutBtn.addEventListener("click", () => {
        openModal(state.isAdmin ? "moderationModal" : "loginModal");
      });
    }
    papersGrid.appendChild(callout);
  }

  if (matches.length === 0) {
    if (isAdminQuery) {
      if (empty) empty.classList.add("hidden");
    } else {
      if (empty) {
        empty.classList.remove("hidden");
        el("emptyTitle").textContent = "No matching resources found";
        el("emptyText").textContent = `No papers matched "${query}". Try searching another subject or code.`;
      }
    }
  } else {
    if (empty) empty.classList.add("hidden");
    matches.forEach((p) => {
      papersGrid.appendChild(createPaperRow(p));
    });
    bindPaperEvents(papersGrid);
  }
}

// ---------------------------------------------------------------------
// Build Filter UI for Modals (Upload & Edit Dropdowns)
// ---------------------------------------------------------------------
function buildFilterUI() {
  const uploadBranchSelect = el("uploadBranch");
  const editBranchSelect = el("editBranch");
  const uploadSemSelect = el("uploadSemester");
  const editSemSelect = el("editSemester");
  const uploadTypeSelect = el("uploadType");
  const editTypeSelect = el("editType");

  if (uploadBranchSelect && uploadBranchSelect.children.length === 0) {
    state.branches.forEach((b) => {
      if (b.id !== "all") {
        if (uploadBranchSelect) uploadBranchSelect.add(new Option(`${b.code} — ${b.name}`, b.code));
        if (editBranchSelect) editBranchSelect.add(new Option(`${b.code} — ${b.name}`, b.code));
      }
    });
  }

  if (uploadSemSelect && uploadSemSelect.children.length === 0) {
    state.semesters.forEach((s) => {
      if (uploadSemSelect) uploadSemSelect.add(new Option(`Semester ${s}`, s));
      if (editSemSelect) editSemSelect.add(new Option(`Semester ${s}`, s));
    });
  }

  if (uploadTypeSelect && uploadTypeSelect.children.length === 0) {
    Object.entries(state.types).forEach(([id, label]) => {
      if (uploadTypeSelect) uploadTypeSelect.add(new Option(label, id));
      if (editTypeSelect) editTypeSelect.add(new Option(label, id));
    });
  }
}

// ---------------------------------------------------------------------
// Admin Session & Moderation
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
  if (el("adminPill")) el("adminPill").classList.toggle("hidden", !state.isAdmin);
  if (el("adminBtn")) {
    el("adminBtn").classList.toggle("hidden", state.isAdmin || !state.adminDiscovered);
  }
  updatePendingBadge();
  if (state.viewMode === "folders") renderFolderDirectory();
  else renderCardsView();
}

async function reloadData() {
  await fetchAllPapers();
  if (state.viewMode === "folders") renderFolderDirectory();
  else renderCardsView();
}

async function deletePaper(id) {
  if (!confirm("Are you sure you want to permanently delete this resource?")) return;
  try {
    await api(`/api/papers/${id}`, { method: "DELETE" });
    showToast("Resource removed successfully.", "success");
    await reloadData();
  } catch (err) {
    showToast("Delete failed: " + err.message, "error");
  }
}

function openEditModal(id) {
  const paper = state.allPapers.find((p) => String(p.id) === String(id));
  if (!paper) return;
  el("editPaperId").value = paper.id;
  el("editTitle").value = paper.title;
  el("editBranch").value = paper.branch || "CSE";
  el("editSemester").value = paper.semester;
  el("editType").value = paper.type;
  el("editSubject").value = paper.subject;
  el("editCode").value = paper.code || "";
  el("editContributorName").value = paper.contributor_name || "";
  el("editError").classList.add("hidden");
  openModal("editModal");
}

async function openModerationPanel() {
  openModal("moderationModal");
  switchAdminTab("pending");
  await fetchPendingSubmissions();
}

async function fetchPendingSubmissions() {
  const listEl = el("adminPendingList");
  if (!listEl) return;
  listEl.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:24px;">Loading pending queue…</p>`;

  try {
    const data = await api("/api/admin/pending");
    state.pendingPapers = data.papers || [];
    state.pendingCount = state.pendingPapers.length;
    updatePendingBadge();
    renderPendingList();
  } catch (err) {
    listEl.innerHTML = `<p class="form-error">Failed to load pending queue: ${escapeHtml(err.message)}</p>`;
  }
}

function renderPendingList() {
  const listEl = el("adminPendingList");
  if (!listEl) return;
  listEl.innerHTML = "";

  if (state.pendingPapers.length === 0) {
    listEl.innerHTML = `
      <div style="text-align:center;padding:36px 14px;color:var(--text-muted);">
        <p style="font-size:16px;font-weight:700;margin:0 0 6px;">Queue is clear! 🎉</p>
        <p style="font-size:13px;margin:0;">No submissions waiting for approval right now.</p>
      </div>
    `;
    return;
  }

  state.pendingPapers.forEach((p) => {
    const card = document.createElement("div");
    card.className = "pending-card";
    const previewUrl = p.filename.startsWith("http") ? p.filename : `/uploads/${encodeURIComponent(p.filename)}`;
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
        <h4 class="pending-title">${escapeHtml(p.title)}</h4>
        <span class="paper-branch-pill">${escapeHtml(p.branch || "CSE")}</span>
      </div>
      <p class="pending-meta">${escapeHtml(p.subject)} &bull; Sem ${p.semester} &bull; Category: <strong>${escapeHtml(p.type.toUpperCase())}</strong></p>
      <div class="pending-contributor-tag">
        Submitted by: <strong>${escapeHtml(p.contributor_name || "Anonymous")}</strong> ${p.contributor_contact ? `(${escapeHtml(p.contributor_contact)})` : ""}
      </div>
      <div class="pending-actions">
        <a href="${previewUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Preview File</a>
        <button class="btn btn-approve btn-sm" data-approve="${p.id}">✓ Approve &amp; Publish</button>
        <button class="btn btn-danger btn-sm" data-reject="${p.id}">✕ Reject</button>
      </div>
    `;
    listEl.appendChild(card);
  });

  listEl.querySelectorAll("[data-approve]").forEach((btn) => {
    btn.addEventListener("click", () => approvePaper(btn.dataset.approve));
  });
  listEl.querySelectorAll("[data-reject]").forEach((btn) => {
    btn.addEventListener("click", () => rejectPaper(btn.dataset.reject));
  });
}

async function approvePaper(id) {
  try {
    await api(`/api/admin/approve/${id}`, { method: "POST" });
    showToast("Resource approved and published live!", "success");
    await fetchPendingSubmissions();
    await reloadData();
  } catch (err) {
    showToast("Approval failed: " + err.message, "error");
  }
}

async function rejectPaper(id) {
  if (!confirm("Are you sure you want to reject this submission?")) return;
  try {
    await api(`/api/admin/reject/${id}`, { method: "POST" });
    showToast("Submission rejected.", "success");
    await fetchPendingSubmissions();
    await reloadData();
  } catch (err) {
    showToast("Rejection failed: " + err.message, "error");
  }
}

async function fetchAdminRequests() {
  const listEl = el("adminRequestsList");
  if (!listEl) return;
  listEl.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:24px;">Loading requests & reports…</p>`;

  try {
    const data = await api("/api/admin/feedback");
    state.feedbackRequests = data.feedback || [];
    state.requestsCount = state.feedbackRequests.length;
    if (el("adminRequestsCount")) el("adminRequestsCount").textContent = state.requestsCount;
    renderAdminRequestsList();
  } catch (err) {
    listEl.innerHTML = `<p class="form-error">Failed to load requests: ${escapeHtml(err.message)}</p>`;
  }
}

function renderAdminRequestsList() {
  const listEl = el("adminRequestsList");
  if (!listEl) return;
  listEl.innerHTML = "";

  if (state.feedbackRequests.length === 0) {
    listEl.innerHTML = `
      <div style="text-align:center;padding:36px 14px;color:var(--text-muted);">
        <p style="font-size:16px;font-weight:700;margin:0 0 6px;">No pending requests! 🎉</p>
        <p style="font-size:13px;margin:0;">No paper requests or takedown notices right now.</p>
      </div>
    `;
    return;
  }

  state.feedbackRequests.forEach((req) => {
    const card = document.createElement("div");
    card.className = "pending-card";
    const dateFormatted = new Date(req.created_at).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
    });
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
        <span class="file-type-pill ${req.category === 'dmca_takedown' ? 'file-pdf' : 'file-doc'}">${escapeHtml(req.category.toUpperCase())}</span>
        <span style="font-size:11.5px;color:var(--text-muted);">${dateFormatted}</span>
      </div>
      <div style="font-size:14.5px;font-weight:700;color:var(--text-main);margin-top:4px;">${escapeHtml(req.subject || "Resource Request")}</div>
      <p style="font-size:13px;color:var(--text-muted);margin:4px 0;line-height:1.5;">${escapeHtml(req.message)}</p>
      <div class="pending-contributor-tag">
        From: <strong>${escapeHtml(req.name || "Anonymous")}</strong> &bull; Contact: ${escapeHtml(req.contact || "None")} ${req.branch ? `&bull; ${escapeHtml(req.branch)}` : ""}
      </div>
      <div class="pending-actions">
        <button class="btn btn-outline btn-sm" data-resolve-req="${req.id}">Mark Resolved</button>
      </div>
    `;
    listEl.appendChild(card);
  });

  listEl.querySelectorAll("[data-resolve-req]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await api(`/api/admin/feedback/${btn.dataset.resolveReq}`, { method: "DELETE" });
        showToast("Request marked resolved!", "success");
        await fetchAdminRequests();
      } catch (err) {
        showToast("Failed to resolve: " + err.message, "error");
      }
    });
  });
}

function switchAdminTab(tab) {
  const tabPending = el("adminTabPending");
  const tabRequests = el("adminTabRequests");
  const tabAccount = el("adminTabAccount");
  const secPending = el("adminPendingSection");
  const secRequests = el("adminRequestsSection");
  const secAccount = el("adminAccountSection");

  if (tabPending) tabPending.classList.toggle("active", tab === "pending");
  if (tabRequests) tabRequests.classList.toggle("active", tab === "requests");
  if (tabAccount) tabAccount.classList.toggle("active", tab === "account");

  if (secPending) secPending.classList.toggle("hidden", tab !== "pending");
  if (secRequests) secRequests.classList.toggle("hidden", tab !== "requests");
  if (secAccount) secAccount.classList.toggle("hidden", tab !== "account");

  if (tab === "requests") fetchAdminRequests();
}

// ---------------------------------------------------------------------
// Contributors Hall of Fame
// ---------------------------------------------------------------------
async function openContributorsWall() {
  openModal("contributorsModal");
  const listEl = el("contributorsList");
  if (!listEl) return;
  listEl.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:24px;">Loading top contributors…</p>`;

  try {
    const data = await api("/api/contributors");
    const list = data.contributors || [];
    renderContributorsList(list);
  } catch (err) {
    listEl.innerHTML = `<p class="form-error">Failed to load contributors.</p>`;
  }
}

function renderContributorsList(list) {
  const listEl = el("contributorsList");
  if (!listEl) return;
  listEl.innerHTML = "";

  if (list.length === 0) {
    listEl.innerHTML = `
      <div class="contributors-empty-box">
        <div class="empty-trophy">🏆</div>
        <div class="empty-trophy-title">No Contributors Yet</div>
        <p class="empty-trophy-desc">Be the very first student or faculty to upload an exam paper or revision notes to claim Rank #1!</p>
        <button type="button" class="btn btn-sm btn-primary" onclick="window.closeModal('contributorsModal'); window.openModal('uploadModal');" style="margin-top:8px;">
          + Share First Paper
        </button>
      </div>
    `;
    return;
  }

  list.forEach((c, idx) => {
    const rank = idx + 1;
    let rankBadgeHtml = "";
    if (rank === 1) {
      rankBadgeHtml = `<span class="rank-badge rank-gold" title="Rank 1">🥇</span>`;
    } else if (rank === 2) {
      rankBadgeHtml = `<span class="rank-badge rank-silver" title="Rank 2">🥈</span>`;
    } else if (rank === 3) {
      rankBadgeHtml = `<span class="rank-badge rank-bronze" title="Rank 3">🥉</span>`;
    } else {
      rankBadgeHtml = `<span class="rank-badge rank-num">#${rank}</span>`;
    }

    const initials = getInitials(c.contributor_name);
    const branches = c.branches ? c.branches.split(",").map(b => b.trim()).filter(Boolean) : ["CSE"];
    const branchTagsHtml = branches.map(b => `<span class="contributor-branch-chip">${escapeHtml(b)}</span>`).join("");

    const isTop = rank === 1;
    const card = document.createElement("div");
    card.className = `contributor-rank-card rank-${rank <= 3 ? rank : 'other'}`;
    card.innerHTML = `
      <div class="rank-badge-col">${rankBadgeHtml}</div>
      <div class="contributor-avatar-col">
        <div class="contributor-big-avatar">${initials}</div>
      </div>
      <div class="contributor-details">
        <div class="contributor-name-title">
          <span>${escapeHtml(c.contributor_name)}</span>
          ${isTop ? '<span class="top-star-chip">★ Top Contributor</span>' : ''}
        </div>
        <div class="contributor-branches-text">
          <span class="branch-label">Dept:</span>
          ${branchTagsHtml}
        </div>
      </div>
      <div class="contributor-score-col">
        <span class="contributor-score">${c.count} ${c.count === 1 ? "paper" : "papers"}</span>
      </div>
    `;
    listEl.appendChild(card);
  });
}

// ---------------------------------------------------------------------
// Contextual Upload Opener
// ---------------------------------------------------------------------
window.openUploadForContext = function(branchCode, semesterNum) {
  if (branchCode && el("uploadBranch")) el("uploadBranch").value = branchCode;
  if (semesterNum && el("uploadSemester")) el("uploadSemester").value = semesterNum;
  openModal("uploadModal");
};

// ---------------------------------------------------------------------
// Event Bindings
// ---------------------------------------------------------------------
function bindEvents() {
  // Folder Up Button
  const folderUpBtn = el("folderUpBtn");
  if (folderUpBtn) folderUpBtn.addEventListener("click", handleFolderUp);

  // Live Search Input
  const searchInput = el("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => handleSearch(e.target.value));
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const q = searchInput.value.trim().toLowerCase();
        if (q === "admin" || q === "/admin" || q === "admin login" || q === "login" || q.includes("@")) {
          e.preventDefault();
          state.adminDiscovered = true;
          if (el("adminBtn") && !state.isAdmin) el("adminBtn").classList.remove("hidden");
          openModal(state.isAdmin ? "moderationModal" : "loginModal");
        }
      }
    });
  }

  const clearSearchBtn = el("clearSearchBtn");
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      handleSearch("");
    });
  }

  // Keyboard Shortcuts (Ctrl + K or / to search, Esc to close modals, Ctrl + Shift + A for Admin)
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    } else if (e.key === "/" && document.activeElement !== searchInput && !document.activeElement.matches("input, textarea, select")) {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
      // Secret Admin Shortcut: Ctrl + Shift + A
      e.preventDefault();
      state.adminDiscovered = true;
      if (el("adminBtn") && !state.isAdmin) el("adminBtn").classList.remove("hidden");
      openModal(state.isAdmin ? "moderationModal" : "loginModal");
    } else if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay:not(.hidden)").forEach((m) => {
        m.classList.add("hidden");
      });
    }
  });

  // Modal open handlers
  const openUploadModal = () => {
    if (state.folderBranch && el("uploadBranch")) {
      el("uploadBranch").value = state.folderBranch.code || state.folderBranch.name;
    }
    if (state.folderSem && el("uploadSemester")) {
      el("uploadSemester").value = state.folderSem;
    }
    openModal("uploadModal");
  };

  const openUploadBtn = el("openUploadBtn");
  if (openUploadBtn) openUploadBtn.addEventListener("click", openUploadModal);

  const emptyActionBtn = el("emptyActionBtn");
  if (emptyActionBtn) emptyActionBtn.addEventListener("click", openUploadModal);

  const openContributorsBtn = el("openContributorsBtn");
  if (openContributorsBtn) openContributorsBtn.addEventListener("click", openContributorsWall);

  const requestPaperBtn = el("requestPaperBtn");
  if (requestPaperBtn) requestPaperBtn.addEventListener("click", () => openModal("requestModal"));

  // Admin access
  const adminBtn = el("adminBtn");
  if (adminBtn) adminBtn.addEventListener("click", () => openModal("loginModal"));

  const adminPill = el("adminPill");
  if (adminPill) adminPill.addEventListener("click", openModerationPanel);

  // Admin Tabs
  const tabPending = el("adminTabPending");
  if (tabPending) tabPending.addEventListener("click", () => switchAdminTab("pending"));

  const tabRequests = el("adminTabRequests");
  if (tabRequests) tabRequests.addEventListener("click", () => switchAdminTab("requests"));

  const tabAccount = el("adminTabAccount");
  if (tabAccount) tabAccount.addEventListener("click", () => switchAdminTab("account"));

  // Modal close handlers
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.add("hidden");
    });
  });

  // Public Upload Form
  const uploadForm = el("uploadForm");
  if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const errorEl = el("uploadError");
      if (errorEl) errorEl.classList.add("hidden");

      const submitBtn = uploadForm.querySelector("button[type=submit]");
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Uploading Resource...";
      submitBtn.disabled = true;

      const formData = new FormData();
      formData.append("contributor_name", el("uploadContributorName").value.trim());
      formData.append("contributor_contact", el("uploadContributorContact").value.trim());
      formData.append("title", el("uploadTitle").value.trim());
      formData.append("branch", el("uploadBranch").value);
      formData.append("semester", el("uploadSemester").value);
      formData.append("subject", el("uploadSubject").value.trim());
      formData.append("code", el("uploadCode").value.trim());
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
        uploadForm.reset();
        resetFileDropzone();

        if (data.status === "pending") {
          showToast(data.message || "Submitted for moderation! Thanks for contributing.", "success");
        } else {
          showToast("Resource published to the hub!", "success");
        }
        await reloadData();
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = err.message;
          errorEl.classList.remove("hidden");
        }
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // File Dropzone Interaction
  const dropzone = el("fileDropzone");
  const fileInput = el("uploadFile");

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelected();
      }
    });

    fileInput.addEventListener("change", handleFileSelected);
  }

  function handleFileSelected() {
    const file = fileInput.files[0];
    if (!file) { resetFileDropzone(); return; }
    if (el("fileDropzoneEmpty")) el("fileDropzoneEmpty").classList.add("hidden");
    if (el("fileDropzonePreview")) el("fileDropzonePreview").classList.remove("hidden");
    if (dropzone) dropzone.classList.add("has-file");
    if (el("filePreviewName")) el("filePreviewName").textContent = file.name;
    if (el("filePreviewMeta")) el("filePreviewMeta").textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB • Click to change`;
  }

  // DMCA Takedown Notice Form
  const dmcaForm = el("dmcaForm");
  if (dmcaForm) {
    dmcaForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const statusEl = el("dmcaStatusMsg");
      if (statusEl) statusEl.classList.add("hidden");

      const payload = {
        category: "dmca_takedown",
        name: el("dmcaName").value.trim(),
        contact: el("dmcaContact").value.trim(),
        subject: el("dmcaSubject").value.trim(),
        message: el("dmcaMessage").value.trim(),
      };

      try {
        await api("/api/feedback", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showToast("Takedown notice submitted. Our team will review within 24 hours.", "success");
        closeModal("dmcaModal");
        dmcaForm.reset();
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = err.message;
          statusEl.classList.remove("hidden");
        }
      }
    });
  }

  // Missing Paper Request Form
  const requestForm = el("requestForm");
  if (requestForm) {
    requestForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const statusEl = el("requestStatusMsg");
      if (statusEl) statusEl.classList.add("hidden");

      const payload = {
        category: el("requestCategory").value,
        name: el("requestName").value.trim(),
        contact: el("requestContact").value.trim(),
        subject: el("requestSubject").value.trim(),
        branch: el("requestBranch").value.trim(),
        message: el("requestMessage").value.trim(),
      };

      try {
        await api("/api/feedback", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showToast("Request received! We'll notify the student community.", "success");
        closeModal("requestModal");
        requestForm.reset();
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = err.message;
          statusEl.classList.remove("hidden");
        }
      }
    });
  }

  // Admin Login Form
  const loginForm = el("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = el("loginEmail").value.trim();
      const password = el("loginPassword").value;
      const errorEl = el("loginError");
      if (errorEl) errorEl.classList.add("hidden");

      try {
        await api("/api/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        state.isAdmin = true;
        closeModal("loginModal");
        loginForm.reset();
        updateAdminUI();
        showToast("Signed in as Administrator.", "success");
        await fetchPendingSubmissions();
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = err.message;
          errorEl.classList.remove("hidden");
        }
      }
    });
  }

  // Admin Change Password Form
  const changePasswordForm = el("changePasswordForm");
  if (changePasswordForm) {
    changePasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const current = el("currentPassword").value;
      const newPwd = el("newPassword").value;
      const msgEl = el("changePasswordMsg");
      if (msgEl) msgEl.classList.add("hidden");

      try {
        await api("/api/change-password", {
          method: "POST",
          body: JSON.stringify({ current_password: current, new_password: newPwd }),
        });
        showToast("Password updated successfully!", "success");
        changePasswordForm.reset();
      } catch (err) {
        if (msgEl) {
          msgEl.textContent = err.message;
          msgEl.classList.remove("hidden");
        }
      }
    });
  }

  // Admin Logout
  const logoutBtn = el("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await api("/api/logout", { method: "POST" });
      state.isAdmin = false;
      state.adminDiscovered = false;
      closeModal("moderationModal");
      updateAdminUI();
      showToast("Signed out of Admin Portal.", "success");
    });
  }

  // Admin Edit Form
  const editForm = el("editForm");
  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const errorEl = el("editError");
      if (errorEl) errorEl.classList.add("hidden");

      const id = el("editPaperId").value;
      const payload = {
        title: el("editTitle").value.trim(),
        branch: el("editBranch").value,
        semester: el("editSemester").value,
        subject: el("editSubject").value.trim(),
        code: el("editCode").value.trim(),
        type: el("editType").value,
        contributor_name: el("editContributorName").value.trim(),
      };

      try {
        await api(`/api/papers/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        closeModal("editModal");
        editForm.reset();
        showToast("Changes saved successfully.", "success");
        await reloadData();
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = err.message;
          errorEl.classList.remove("hidden");
        }
      }
    });
  }
}

function resetFileDropzone() {
  if (el("fileDropzoneEmpty")) el("fileDropzoneEmpty").classList.remove("hidden");
  if (el("fileDropzonePreview")) el("fileDropzonePreview").classList.add("hidden");
  const dropzone = el("fileDropzone");
  if (dropzone) dropzone.classList.remove("has-file");
}

window.openModal = function(id) {
  const m = el(id);
  if (m) m.classList.remove("hidden");
};

window.closeModal = function(id) {
  const m = el(id);
  if (m) m.classList.add("hidden");
};

window.openUploadModal = function() {
  if (state.folderBranch && el("uploadBranch")) {
    el("uploadBranch").value = state.folderBranch.code || state.folderBranch.name;
  }
  if (state.folderSem && el("uploadSemester")) {
    el("uploadSemester").value = state.folderSem;
  }
  window.openModal("uploadModal");
};

window.openContributorsWall = openContributorsWall;
window.openModerationPanel = openModerationPanel;

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

// ---------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------
(async function init() {
  initTheme();
  bindEvents();
  buildFilterUI();

  // Instant Check: If navigated via /admin, ?admin, or #admin, reveal admin immediately
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const isAdminUrl = path === "/admin" || path === "/admin/" || path.endsWith("/admin") || search.includes("admin") || hash.includes("admin");

  if (isAdminUrl) {
    state.adminDiscovered = true;
    if (el("adminBtn")) el("adminBtn").classList.remove("hidden");
    openModal("loginModal");
  }

  const loadingEl = el("loadingState");
  if (loadingEl) loadingEl.classList.remove("hidden");

  try {
    await Promise.all([checkSession(), fetchAllPapers()]);
    setViewMode("folders"); // start in folder explorer mode
  } finally {
    if (loadingEl) loadingEl.classList.add("hidden");
  }
})();