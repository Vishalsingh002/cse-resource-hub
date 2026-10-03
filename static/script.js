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

// =====================================================================
// Quantum University Academic Departments & Programs Architecture
// (Faithfully modeled after Quantum University Official Program Structure)
// =====================================================================
const DEPARTMENTS = [
  {
    id: "engineering",
    name: "ENGINEERING",
    icon: "💻",
    branches: [
      { id: "cse", code: "B.TECH CSE", name: "Computer Science & Engineering", semesters: 8, aliases: ["cse", "cs", "computer science"] },
      { id: "cys", code: "B.TECH CYS", name: "Cyber Security and Digital Forensics", semesters: 8, aliases: ["cys", "cyber", "cse", "cs"] },
      { id: "aiml", code: "B.TECH AI & ML", name: "AI & ML in Collaboration with Samatrix", semesters: 8, aliases: ["aiml", "ai & ml", "ai", "ml", "cse", "cs"] },
      { id: "cloud", code: "B.TECH CLOUD", name: "Cloud Computing and Virtualization", semesters: 8, aliases: ["cloud", "cse", "cs"] },
      { id: "fullstack", code: "B.TECH FULL STACK", name: "Full Stack Development with inurture", semesters: 8, aliases: ["full stack", "fullstack", "cse", "cs"] },
      { id: "ds", code: "B.TECH DATA SCIENCE", name: "AI & Data Science", semesters: 8, aliases: ["ds", "data science", "cse", "cs"] },
      { id: "robotics", code: "B.TECH AI & ROBOTICS", name: "AI & Robotics", semesters: 8, aliases: ["robotics", "ai & robotics", "cse", "cs"] },
      { id: "me", code: "B.TECH ME", name: "Mechanical Engineering with L&T", semesters: 8, aliases: ["me", "mechanical"] },
      { id: "ce", code: "B.TECH CIVIL", name: "Civil Engineering with L&T", semesters: 8, aliases: ["ce", "civil"] },
      { id: "ece", code: "B.TECH ECE", name: "ECE (Semiconductors) with L&T", semesters: 8, aliases: ["ece", "electronics"] },
      { id: "ee", code: "B.TECH EE", name: "Electrical Engineering", semesters: 8, aliases: ["ee", "electrical"] },
    ]
  },
  {
    id: "computer_app",
    name: "COMPUTER APPLICATION",
    icon: "📱",
    branches: [
      { id: "bca", code: "BCA", name: "Bachelor of Computer Applications", semesters: 6, aliases: ["bca"] },
      { id: "bca_mobile", code: "BCA (HONS) MOBILE APP", name: "BCA (Hons.) Mobile App Development", semesters: 6, aliases: ["bca", "mobile app"] },
      { id: "bca_iot", code: "BCA - IOT", name: "BCA - Internet of Things (IoT)", semesters: 6, aliases: ["bca", "iot"] },
      { id: "bca_aiml", code: "BCA - AI/ML", name: "BCA - AI/ML", semesters: 6, aliases: ["bca", "ai/ml", "aiml"] },
      { id: "mca", code: "MCA", name: "Master of Computer Applications", semesters: 4, aliases: ["mca"] },
    ]
  },
  {
    id: "diploma",
    name: "DIPLOMA",
    icon: "🏗️",
    branches: [
      { id: "dip_cse", code: "DIPLOMA CSE", name: "Computer Science & Engineering", semesters: 6, aliases: ["diploma cse", "dip cse"] },
      { id: "dip_me", code: "DIPLOMA ME", name: "Mechanical Engineering", semesters: 6, aliases: ["diploma me", "dip me"] },
      { id: "dip_ce", code: "DIPLOMA CIVIL", name: "Civil Engineering", semesters: 6, aliases: ["diploma civil", "dip civil"] },
      { id: "dip_ee", code: "DIPLOMA EE", name: "Electrical Engineering", semesters: 6, aliases: ["diploma ee", "dip ee"] },
    ]
  },
  {
    id: "management",
    name: "MANAGEMENT",
    icon: "💼",
    branches: [
      { id: "bba", code: "BBA", name: "Bachelor of Business Administration", semesters: 6, aliases: ["bba"] },
      { id: "bba_bi", code: "BBA (HONS) BUSINESS ANALYTICS", name: "BBA (Hons.) - Business Intelligence & Analytics", semesters: 6, aliases: ["bba", "business analytics"] },
      { id: "bba_digital", code: "BBA DIGITAL MARKETING", name: "BBA - Digital Marketing", semesters: 6, aliases: ["bba", "digital marketing"] },
      { id: "bba_trade", code: "BBA IMPORT & EXPORT", name: "BBA - Import & Export Management", semesters: 6, aliases: ["bba", "import export"] },
      { id: "bba_retail", code: "BBA RETAIL & TOURISM", name: "BBA - Retail & Tourism", semesters: 6, aliases: ["bba", "retail", "tourism"] },
      { id: "bba_hospital", code: "BBA HOSPITAL MANAGEMENT", name: "BBA - Hospital Management", semesters: 6, aliases: ["bba", "hospital management"] },
      { id: "mba", code: "MBA", name: "Master of Business Administration", semesters: 4, aliases: ["mba"] },
    ]
  },
  {
    id: "commerce",
    name: "COMMERCE & FINANCE",
    icon: "📊",
    branches: [
      { id: "bcom", code: "B.COM (HONS)", name: "Bachelor of Commerce (Hons.)", semesters: 6, aliases: ["b.com", "bcom"] },
      { id: "bcom_acca", code: "B.COM (HONS) ACCA", name: "B.Com (Hons.) Accounting & Taxation - ACCA UK", semesters: 6, aliases: ["acca", "bcom acca", "b.com"] },
    ]
  },
  {
    id: "sciences",
    name: "SCIENCES",
    icon: "🔬",
    branches: [
      { id: "bsc_physics", code: "B.SC (HONS) PHYSICS", name: "B.Sc (Hons.) Physics", semesters: 6, aliases: ["physics", "bsc physics"] },
      { id: "bsc_maths", code: "B.SC (HONS) MATHEMATICS", name: "B.Sc (Hons.) Mathematics", semesters: 6, aliases: ["mathematics", "maths", "bsc maths"] },
      { id: "bsc_chem", code: "B.SC (HONS) CHEMISTRY", name: "B.Sc (Hons.) Chemistry", semesters: 6, aliases: ["chemistry", "bsc chem"] },
      { id: "bsc_cbz", code: "B.SC (HONS) CBZ", name: "B.Sc (Hons.) CBZ", semesters: 6, aliases: ["cbz", "bsc cbz"] },
      { id: "bsc_biotech", code: "B.SC (HONS) BIOTECHNOLOGY", name: "B.Sc (Hons.) Biotechnology", semesters: 6, aliases: ["biotech", "biotechnology", "bsc biotech"] },
    ]
  },
  {
    id: "humanities",
    name: "HUMANITIES & SOCIAL SCIENCES",
    icon: "📚",
    branches: [
      { id: "ba_english", code: "B.A. (HONS) ENGLISH", name: "B.A. (Hons.) English", semesters: 6, aliases: ["ba english", "english"] },
      { id: "ba_econ", code: "B.A. (HONS) ECONOMICS", name: "B.A. (Hons.) Economics", semesters: 6, aliases: ["ba economics", "economics"] },
      { id: "ba_psych", code: "B.A. (HONS) PSYCHOLOGY", name: "B.A. (Hons.) Psychology", semesters: 6, aliases: ["ba psychology", "psychology"] },
    ]
  },
  {
    id: "agriculture",
    name: "AGRICULTURAL STUDIES",
    icon: "🌾",
    branches: [
      { id: "bsc_agri", code: "B.SC (HONS) AGRICULTURE", name: "B.Sc (Hons.) Agriculture", semesters: 8, aliases: ["agriculture", "agri", "bsc agriculture"] },
    ]
  },
  {
    id: "media",
    name: "MEDIA STUDIES & DESIGN",
    icon: "🎬",
    branches: [
      { id: "ba_journalism", code: "B.A. (HONS) JOURNALISM", name: "B.A. (Hons.) Journalism & Mass Comm", semesters: 6, aliases: ["journalism", "mass comm"] },
      { id: "bsc_animation", code: "B.SC ANIMATION & VFX", name: "B.Sc - Animation & VFX", semesters: 6, aliases: ["animation", "vfx"] },
    ]
  },
  {
    id: "health",
    name: "HEALTH SCIENCES",
    icon: "💊",
    branches: [
      { id: "dpharma", code: "D.PHARMA", name: "Diploma in Pharmacy", semesters: 4, aliases: ["d.pharma", "dpharma"] },
      { id: "bpharma", code: "B.PHARMA", name: "Bachelor of Pharmacy", semesters: 8, aliases: ["b.pharma", "bpharma"] },
      { id: "bmlt", code: "BMLT", name: "Bachelor in Medical Laboratory Technology", semesters: 6, aliases: ["bmlt"] },
      { id: "bmrit", code: "BMRIT", name: "B.Sc Medical Radiology & Imaging Technology", semesters: 6, aliases: ["bmrit"] },
      { id: "bpt", code: "BPT", name: "Bachelor of Physiotherapy", semesters: 8, aliases: ["bpt", "physiotherapy"] },
      { id: "bsc_optometry", code: "B.SC OPTOMETRY", name: "B.Sc (Optometry)", semesters: 6, aliases: ["optometry"] },
      { id: "bsc_nutrition", code: "B.SC NUTRITION", name: "B.Sc (Nutrition and Dietetics)", semesters: 6, aliases: ["nutrition", "dietetics"] },
    ]
  },
  {
    id: "hospitality",
    name: "HOSPITALITY & TOURISM",
    icon: "🏨",
    branches: [
      { id: "bhm", code: "BHM", name: "BHM - Bachelors in Hotel Management", semesters: 8, aliases: ["bhm", "hotel management"] },
      { id: "dip_hm", code: "DIPLOMA HM", name: "Diploma in Hotel Management", semesters: 4, aliases: ["diploma hotel management"] },
      { id: "cert_hm", code: "CERTIFICATE HM", name: "Certificate in Hotel Management", semesters: 2, aliases: ["certificate hotel management"] },
    ]
  },
  {
    id: "law",
    name: "LAW",
    icon: "⚖️",
    branches: [
      { id: "ba_llb", code: "BA LLB (HONS)", name: "BA LLB (Hons)", semesters: 10, aliases: ["ba llb", "ballb"] },
      { id: "bba_llb", code: "BBA LLB (HONS)", name: "BBA LLB (Hons)", semesters: 10, aliases: ["bba llb", "bballb"] },
    ]
  },
];

// Flattened list of all individual programs
const DEFAULT_BRANCHES = [
  { id: "all", code: "ALL", name: "All Branches" },
  ...DEPARTMENTS.flatMap((d) => d.branches.map((b) => ({ ...b, department: d.name })))
];

// Standard University Subject Registry per Branch & Semester
const CURRICULUM_REGISTRY = {
  cse_core: {
    1: ["Engineering Physics", "Engineering Mathematics - I", "Basic Electrical Engineering", "Programming for Problem Solving", "Technical Communication"],
    2: ["Engineering Chemistry", "Engineering Mathematics - II", "Basic Electronics Engineering", "Engineering Mechanics", "Environmental Studies"],
    3: ["Database Management System", "Discrete Design Structure", "Data Structure & Programming", "Digital Electronics", "Technical Skills Development-II", "Employability Skills II (Reasoning Ability)"],
    4: ["Computer Network", "Operating Systems", "Theory of Automata & Formal Language", "Object Oriented Programming Language and System with Java", "Employability Skills I(Aptitude Abilities)", "Technical Skills Development-III", "Computer Network Lab"],
    5: ["Design and Analysis of Algorithm", "Foundation of Cloud Computing", "Operating System", "R Programming", "Software Engineering"],
    6: ["Machine Learning", "Web Technologies & Full Stack", "Computer Graphics", "Information & Cyber Security"],
    7: ["Artificial Intelligence", "Deep Learning", "Compiler Design", "Cloud Architecture"],
    8: ["Major Project", "Industrial Internship", "Seminar"]
  },
  me: {
    1: ["Engineering Physics", "Engineering Mathematics - I", "Basic Electrical Engineering", "Engineering Graphics", "Technical English"],
    2: ["Engineering Chemistry", "Engineering Mathematics - II", "Basic Electronics Engineering", "Engineering Mechanics", "Workshop Practice"],
    3: ["Mechanics of Solids", "Material Science & Engineering", "Thermodynamics", "Fluid Mechanics", "Applied Mathematics - III"],
    4: ["Applied Thermodynamics", "Manufacturing Processes", "Kinematics of Machines", "Instrumentation & Control"],
    5: ["Heat and Mass Transfer", "Dynamics of Machines", "Design of Machine Elements", "Machine Drawing"],
    6: ["Refrigeration and Air Conditioning", "IC Engines", "Fluid Machines", "CAD/CAM"],
    7: ["Automobile Engineering", "Power Plant Engineering", "Mechatronics", "Operations Research"],
    8: ["Major Project", "Industrial Training", "Viva-Voce"]
  },
  ce: {
    1: ["Engineering Physics", "Engineering Mathematics - I", "Basic Electrical Engineering", "Engineering Graphics", "Technical English"],
    2: ["Engineering Chemistry", "Engineering Mathematics - II", "Basic Electronics Engineering", "Engineering Mechanics", "Environmental Studies"],
    3: ["Surveying", "Building Materials and Construction", "Mechanics of Solids", "Fluid Mechanics", "Engineering Geology"],
    4: ["Structural Analysis - I", "Geotechnical Engineering - I", "Transportation Engineering - I", "Hydraulics & Hydraulic Machines"],
    5: ["Design of Concrete Structures - I", "Environmental Engineering - I", "Structural Analysis - II", "Geotechnical Engineering - II"],
    6: ["Design of Steel Structures", "Transportation Engineering - II", "Water Resources Engineering", "Construction Planning & Management"],
    7: ["Design of Concrete Structures - II", "Estimation & Costing", "Bridge Engineering", "Earthquake Engineering"],
    8: ["Major Project", "Professional Practice", "Internship"]
  },
  ece: {
    1: ["Engineering Physics", "Engineering Mathematics - I", "Basic Electrical Engineering", "Programming for Problem Solving", "Technical English"],
    2: ["Engineering Chemistry", "Engineering Mathematics - II", "Basic Electronics Engineering", "Engineering Mechanics", "Environmental Studies"],
    3: ["Electronic Devices & Circuits", "Digital System Design", "Network Theory", "Signals and Systems", "Mathematics - III"],
    4: ["Analog Circuits", "Microprocessors and Microcontrollers", "Electromagnetic Fields", "Communication Systems"],
    5: ["Digital Signal Processing", "VLSI Design", "Control Systems", "Antenna and Wave Propagation"],
    6: ["Microwave Engineering", "Wireless Communication", "Embedded Systems", "Optical Communication"],
    7: ["Radar & Satellite Communication", "IoT Systems", "Digital Image Processing", "Machine Learning"],
    8: ["Major Project", "Internship", "Seminar"]
  },
  ee: {
    1: ["Engineering Physics", "Engineering Mathematics - I", "Basic Electrical Engineering", "Programming for Problem Solving", "Technical English"],
    2: ["Engineering Chemistry", "Engineering Mathematics - II", "Basic Electronics Engineering", "Engineering Mechanics", "Environmental Studies"],
    3: ["Electric Circuit Analysis", "Electrical Machines - I", "Analog Electronics", "Electromagnetic Fields"],
    4: ["Electrical Machines - II", "Power Systems - I", "Digital Electronics", "Control Systems"],
    5: ["Power Electronics", "Power Systems - II", "Microprocessors", "Electrical Measurements & Instrumentation"],
    6: ["Power System Protection", "Electric Drives", "Renewable Energy Sources", "High Voltage Engineering"],
    7: ["Utilization of Electrical Energy", "Power Quality", "Smart Grid", "Industrial Automation"],
    8: ["Major Project", "Industrial Training"]
  },
  bca: {
    1: ["Fundamentals of Computer & IT", "Programming in C", "Basic Mathematics", "English & Communication"],
    2: ["Data Structures using C", "Digital Computer Fundamentals", "Discrete Mathematics", "Environmental Studies"],
    3: ["Web Technologies", "Database Management Systems", "Object Oriented Programming in C++", "Computer Organization"],
    4: ["Java Programming", "Operating Systems", "Software Engineering", "Computer Networks"],
    5: ["Python Programming", "Mobile Application Development", "Information Security", "E-Commerce"],
    6: ["Cloud Computing", "Artificial Intelligence", "Major Project", "Cyber Law & Ethics"]
  },
  bba: {
    1: ["Principles of Management", "Business Economics", "Financial Accounting", "Business Communication"],
    2: ["Organizational Behaviour", "Business Statistics", "Business Law", "Marketing Management"],
    3: ["Human Resource Management", "Cost Accounting", "Management Information Systems", "Business Environment"],
    4: ["Financial Management", "Research Methodology", "Operations Management", "Digital Marketing"],
    5: ["Strategic Management", "International Business", "Business Analytics", "Consumer Behaviour"],
    6: ["Entrepreneurship Development", "Business Ethics & CSR", "Project Report & Viva"]
  },
  bcom: {
    1: ["Financial Accounting", "Business Law", "Micro Economics", "Business Organization & Management"],
    2: ["Corporate Accounting", "Corporate Laws", "Macro Economics", "Business Statistics"],
    3: ["Cost Accounting", "Income Tax Law & Practice", "Principles of Marketing", "Business Mathematics"],
    4: ["Management Accounting", "Auditing & Corporate Governance", "Financial Markets", "Indian Economy"],
    5: ["Financial Management", "Goods & Services Tax (GST)", "International Finance", "Banking Operations"],
    6: ["E-Commerce", "Security Analysis & Portfolio Management", "Research Project"]
  },
  bpharma: {
    1: ["Human Anatomy and Physiology - I", "Pharmaceutical Analysis - I", "Pharmaceutics - I", "Pharmaceutical Inorganic Chemistry"],
    2: ["Human Anatomy and Physiology - II", "Pharmaceutical Organic Chemistry - I", "Biochemistry", "Pathophysiology"],
    3: ["Pharmaceutical Organic Chemistry - II", "Physical Pharmaceutics - I", "Pharmaceutical Microbiology", "Pharmaceutical Engineering"],
    4: ["Pharmaceutical Organic Chemistry - III", "Medicinal Chemistry - I", "Physical Pharmaceutics - II", "Pharmacology - I", "Pharmacognosy - I"],
    5: ["Medicinal Chemistry - II", "Industrial Pharmacy - I", "Pharmacology - II", "Pharmacognosy - II"],
    6: ["Medicinal Chemistry - III", "Pharmacology - III", "Herbal Drug Technology", "Biopharmaceutics"],
    7: ["Instrumental Methods of Analysis", "Industrial Pharmacy - II", "Pharmacy Practice", "Novel Drug Delivery Systems"],
    8: ["Biostatistics and Research", "Social and Preventive Pharmacy", "Project Work"]
  },
  law: {
    1: ["General Principles of Contract - I", "Constitutional Law - I", "Law of Torts", "Legal Method"],
    2: ["Special Contracts - II", "Constitutional Law - II", "Family Law - I", "Law of Crimes (IPC)"],
    3: ["Family Law - II", "Jurisprudence (Legal Theory)", "Law of Evidence", "Civil Procedure Code"],
    4: ["Criminal Procedure Code", "Administrative Law", "Property Law", "Company Law"],
    5: ["Public International Law", "Labour & Industrial Law - I", "Environmental Law", "Human Rights Law"],
    6: ["Labour & Industrial Law - II", "Taxation Law", "Intellectual Property Rights", "Alternative Dispute Resolution"],
    7: ["Banking & Insurance Law", "Cyber Law", "Professional Ethics", "Drafting, Pleading & Conveyancing"],
    8: ["Moot Court Exercise", "Internship", "Arbitration & Conciliation"],
    9: ["Land Laws", "Competition Law", "Humanitarian & Refugee Law"],
    10: ["Dissertation", "Legal Aid Clinic", "Viva-Voce"]
  },
  bsc_agri: {
    1: ["Fundamentals of Agronomy", "Fundamentals of Genetics", "Fundamentals of Soil Science", "Fundamentals of Horticulture"],
    2: ["Fundamentals of Agricultural Economics", "Agricultural Microbiology", "Soil and Water Conservation", "Plant Pathogens"],
    3: ["Crop Production Technology - I (Kharif Crops)", "Agricultural Finance and Cooperation", "Farm Machinery and Power"],
    4: ["Crop Production Technology - II (Rabi Crops)", "Production Technology for Vegetables and Spices", "Renewable Energy"],
    5: ["Principles of Integrated Pest and Disease Management", "Manures, Fertilizers and Soil Fertility Management"],
    6: ["Farming System & Sustainable Agriculture", "Post-harvest Management of Fruits and Vegetables"],
    7: ["Rural Agricultural Work Experience (RAWE)", "Agro-industrial Attachment"],
    8: ["Experiential Learning Programme (ELP)", "Commercial Agriculture Project"]
  },
  diploma: {
    1: ["Applied Physics - I", "Applied Chemistry", "Applied Mathematics - I", "Communication Skills - I"],
    2: ["Applied Physics - II", "Applied Mathematics - II", "Engineering Drawing", "General Workshop Practice"],
    3: ["Applied Mechanics", "Basic Electrical & Electronics", "Fluid Mechanics", "Computer Applications"],
    4: ["Manufacturing Technology", "Thermal Engineering", "Theory of Machines", "Strength of Materials"],
    5: ["Industrial Management & Safety", "Design of Machine Elements", "Advanced Manufacturing"],
    6: ["Major Project", "Industrial Training & Viva"]
  }
};

function getCurriculumSubjects(branchObj, semesterNum) {
  if (!branchObj) return [];
  const bId = (branchObj.id || "").toLowerCase();
  const bCode = (branchObj.code || "").toLowerCase();
  const s = Number(semesterNum);

  if (
    bId === "cse" || bId === "cys" || bId === "aiml" || bId === "cloud" ||
    bId === "fullstack" || bId === "ds" || bId === "robotics" ||
    bCode.includes("cse") || bCode.includes("cys") || bCode.includes("data science")
  ) {
    return (CURRICULUM_REGISTRY.cse_core && CURRICULUM_REGISTRY.cse_core[s]) || [];
  }
  if (bId === "me" || bCode.includes("me") || bCode.includes("mechanical")) {
    return (CURRICULUM_REGISTRY.me && CURRICULUM_REGISTRY.me[s]) || [];
  }
  if (bId === "ce" || bCode.includes("civil")) {
    return (CURRICULUM_REGISTRY.ce && CURRICULUM_REGISTRY.ce[s]) || [];
  }
  if (bId === "ece" || bCode.includes("ece") || bCode.includes("electronics")) {
    return (CURRICULUM_REGISTRY.ece && CURRICULUM_REGISTRY.ece[s]) || [];
  }
  if (bId === "ee" || bCode.includes("electrical")) {
    return (CURRICULUM_REGISTRY.ee && CURRICULUM_REGISTRY.ee[s]) || [];
  }
  if (bId.startsWith("bca") || bCode.includes("bca")) {
    return (CURRICULUM_REGISTRY.bca && CURRICULUM_REGISTRY.bca[s]) || [];
  }
  if (bId.startsWith("bba") || bCode.includes("bba")) {
    return (CURRICULUM_REGISTRY.bba && CURRICULUM_REGISTRY.bba[s]) || [];
  }
  if (bId.startsWith("bcom") || bCode.includes("b.com")) {
    return (CURRICULUM_REGISTRY.bcom && CURRICULUM_REGISTRY.bcom[s]) || [];
  }
  if (bId.includes("pharma") || bCode.includes("pharma")) {
    return (CURRICULUM_REGISTRY.bpharma && CURRICULUM_REGISTRY.bpharma[s]) || [];
  }
  if (bId.includes("llb") || bCode.includes("llb") || bCode.includes("law")) {
    return (CURRICULUM_REGISTRY.law && CURRICULUM_REGISTRY.law[s]) || [];
  }
  if (bId.includes("agri") || bCode.includes("agri")) {
    return (CURRICULUM_REGISTRY.bsc_agri && CURRICULUM_REGISTRY.bsc_agri[s]) || [];
  }
  if (bId.startsWith("dip") || bCode.includes("diploma")) {
    return (CURRICULUM_REGISTRY.diploma && CURRICULUM_REGISTRY.diploma[s]) || [];
  }
  return [];
}

function getDeptForBranch(branchObj) {
  if (!branchObj) return null;
  return DEPARTMENTS.find((d) => d.branches.some((b) => b.id === branchObj.id || b.code === branchObj.code)) || DEPARTMENTS[0];
}

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
  adminEmail: "evior0364@gmail.com",
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
  folderLevel: "root",  // "root", "dept", "branch", "semester", "subject", "category"
  folderDept: null,
  folderBranch: null,
  folderSem: null,
  folderSubject: null,
  folderCategoryKey: null,
  folderCategoryName: null,
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
  const headers = {};
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
}

// ---------------------------------------------------------------------
// Helper: Matches Branch (with Specialization Aliases)
// ---------------------------------------------------------------------
function matchesBranch(paperBranch, branchObj) {
  if (!paperBranch || !branchObj) return false;
  if (branchObj.id === "all") return true;
  const pb = paperBranch.toLowerCase().trim();
  const bId = branchObj.id.toLowerCase().trim();
  const bCode = (branchObj.code || "").toLowerCase().trim();
  const bName = (branchObj.name || "").toLowerCase().trim();

  // 1. Direct equality
  if (pb === bId || pb === bCode || pb === bName) return true;

  // 2. Check branch aliases (e.g. Cyber Security & AI/ML inherit core CSE papers)
  if (branchObj.aliases && branchObj.aliases.length > 0) {
    if (branchObj.aliases.some((a) => {
      const al = a.toLowerCase().trim();
      return pb === al || pb.includes(al) || al.includes(pb);
    })) {
      return true;
    }
  }

  // 3. Fallback partial matching
  return (
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
// Determine Resource Category for Subject Folder Organization
// ---------------------------------------------------------------------
function getPaperCategory(p) {
  const rawType = (p.type || p.paper_type || "").toLowerCase().trim();
  const title = (p.title || "").toLowerCase();

  // 1. End-Term Exams (highest priority for exam prep)
  if (rawType === "ent" || rawType === "end" || title.includes("end sem") || title.includes("end-term") || title.includes("endterm") || /\bend\b/.test(title)) {
    return { key: "ent", name: "End-Term Exams", order: 1 };
  }
  // 2. Mid-Term Exams
  if (rawType === "mid" || title.includes("mid sem") || title.includes("mid-term") || title.includes("midterm") || /\bmid\b/.test(title)) {
    return { key: "mid", name: "Mid-Term Exams", order: 2 };
  }
  // 3. MFT (Mid Final Term)
  if (rawType === "mft" || title.includes("mft")) {
    return { key: "mft", name: "MFT (Mid Final Term)", order: 3 };
  }
  // 4. Tutorials & Assignments
  if (rawType === "tut" || rawType === "assignment" || title.includes("tutorial") || title.includes("assignment")) {
    return { key: "tut", name: "Tutorials & Assignments", order: 4 };
  }
  // 5. Notes & Study Material
  if (rawType === "notes" || rawType === "note" || title.includes("notes") || title.includes("lecture")) {
    return { key: "notes", name: "Notes & Study Material", order: 5 };
  }
  // 6. Syllabus & Course Guides
  if (rawType === "syl" || rawType === "syllabus" || title.includes("syllabus") || (title.startsWith("#") && !title.includes("sem") && !title.includes("mft") && !title.includes("tut") && !title.includes("assignment") && !title.includes("lab"))) {
    return { key: "syl", name: "Syllabus & Course Guides", order: 6 };
  }
  // 7. Lab Manuals
  if (rawType === "lab" || title.includes("lab manual") || title.includes("lab")) {
    return { key: "lab", name: "Lab Manuals", order: 7 };
  }
  // 8. Previous Year Questions (PYQs)
  if (rawType === "pyq" || title.includes("pyq") || title.includes("question paper")) {
    return { key: "pyq", name: "Previous Year Questions (PYQs)", order: 8 };
  }

  return { key: "other", name: "Other Resources", order: 9 };
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
  if (el("statBranches")) el("statBranches").textContent = DEPARTMENTS.length;
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
// Folder Directory Explorer (Faithfully Structured per University Faculties)
// ---------------------------------------------------------------------
function renderFolderDirectory() {
  const listEl = el("folderTreeList");
  const breadcrumbEl = el("folderBreadcrumb");
  if (!listEl || !breadcrumbEl) return;

  listEl.innerHTML = "";

  if (state.folderLevel === "root") {
    breadcrumbEl.innerHTML = `<span class="crumb-active">pyqs</span>`;

    DEPARTMENTS.forEach((dept) => {
      // Calculate total files in this department across all its branches
      const deptPapersCount = state.allPapers.filter((p) =>
        dept.branches.some((b) => matchesBranch(p.branch, b))
      ).length;

      const row = document.createElement("div");
      row.className = "folder-row-item";
      row.innerHTML = `
        <div class="folder-left-content">
          ${FOLDER_SVG}
          <span class="folder-name-text">${escapeHtml(dept.name)}</span>
        </div>
        <div class="folder-right-content">
          <span class="folder-file-count">${dept.branches.length} ${dept.branches.length === 1 ? 'program' : 'programs'} &bull; ${deptPapersCount} ${deptPapersCount === 1 ? 'file' : 'files'}</span>
          <span class="folder-row-chevron">&rsaquo;</span>
        </div>
      `;
      row.addEventListener("click", () => {
        state.folderLevel = "dept";
        state.folderDept = dept;
        renderFolderDirectory();
      });
      listEl.appendChild(row);
    });

  } else if (state.folderLevel === "dept") {
    const dept = state.folderDept || DEPARTMENTS[0];
    breadcrumbEl.innerHTML = `
      <span class="crumb-link" onclick="goToFolderLevel('root')">pyqs</span>
      <span style="color:#71717A;margin:0 4px;">/</span>
      <span class="crumb-active">${escapeHtml(dept.name)}</span>
    `;

    dept.branches.forEach((b) => {
      const count = state.allPapers.filter((p) => matchesBranch(p.branch, b)).length;
      const row = document.createElement("div");
      row.className = "folder-row-item";
      row.innerHTML = `
        <div class="folder-left-content">
          ${FOLDER_SVG}
          <span class="folder-name-text">${escapeHtml(b.code || b.name)}</span>
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
    const b = state.folderBranch;
    const dept = state.folderDept || getDeptForBranch(b);
    breadcrumbEl.innerHTML = `
      <span class="crumb-link" onclick="goToFolderLevel('root')">pyqs</span>
      <span style="color:#71717A;margin:0 4px;">/</span>
      ${dept ? `<span class="crumb-link" onclick="goToFolderLevel('dept')">${escapeHtml(dept.name)}</span><span style="color:#71717A;margin:0 4px;">/</span>` : ""}
      <span class="crumb-active">${escapeHtml(b.code || b.name)}</span>
    `;

    const totalSemesters = b.semesters || 8;
    const semList = Array.from({ length: totalSemesters }, (_, i) => i + 1);

    semList.forEach((s) => {
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
    const b = state.folderBranch;
    const s = state.folderSem;
    const dept = state.folderDept || getDeptForBranch(b);
    breadcrumbEl.innerHTML = `
      <span class="crumb-link" onclick="goToFolderLevel('root')">pyqs</span>
      <span style="color:#71717A;margin:0 4px;">/</span>
      ${dept ? `<span class="crumb-link" onclick="goToFolderLevel('dept')">${escapeHtml(dept.name)}</span><span style="color:#71717A;margin:0 4px;">/</span>` : ""}
      <span class="crumb-link" onclick="goToFolderLevel('branch')">${escapeHtml(b.code || b.name)}</span>
      <span style="color:#71717A;margin:0 4px;">/</span>
      <span class="crumb-active">SEMESTER ${s}</span>
    `;

    const semPapers = state.allPapers.filter(
      (p) => matchesBranch(p.branch, b) && Number(p.semester) === Number(s)
    );

    // Group papers by unique subject names
    const subjectsMap = new Map();

    // 1. Add curriculum subjects for this branch and semester
    const curriculumSubjects = getCurriculumSubjects(b, s);
    curriculumSubjects.forEach((subj) => {
      subjectsMap.set(subj.toLowerCase(), { name: subj, count: 0 });
    });

    // 2. Merge uploaded papers from database
    semPapers.forEach((p) => {
      const subj = (p.subject || "").trim();
      if (!subj) return;
      const key = subj.toLowerCase();
      if (!subjectsMap.has(key)) {
        subjectsMap.set(key, { name: subj, count: 0 });
      }
      subjectsMap.get(key).count++;
    });

    const subjectsList = Array.from(subjectsMap.values());

    if (subjectsList.length === 0) {
      const emptyRow = document.createElement("div");
      emptyRow.className = "folder-empty-row";
      emptyRow.innerHTML = `
        <div>📁 No subjects or papers uploaded yet for <strong>${escapeHtml(b.code)} Semester ${s}</strong>.</div>
        <button class="btn-contribute-mini" onclick="openUploadForContext('${escapeHtml(b.code)}', ${s})">+ Contribute First Paper</button>
      `;
      listEl.appendChild(emptyRow);
    } else {
      // Sort subjects: subjects with files first, then alphabetically
      subjectsList.sort((x, y) => (y.count - x.count) || x.name.localeCompare(y.name)).forEach((sub) => {
        const row = document.createElement("div");
        row.className = "folder-row-item";
        row.innerHTML = `
          <div class="folder-left-content">
            ${FOLDER_SVG}
            <span class="folder-name-text">${escapeHtml(sub.name.toUpperCase())}</span>
          </div>
          <div class="folder-right-content">
            <span class="folder-file-count">${sub.count} ${sub.count === 1 ? 'file' : 'files'}</span>
            <span class="folder-row-chevron">&rsaquo;</span>
          </div>
        `;
        row.addEventListener("click", () => {
          state.folderLevel = "subject";
          state.folderSubject = sub.name;
          renderFolderDirectory();
        });
        listEl.appendChild(row);
      });
    }

  } else if (state.folderLevel === "subject") {
    const b = state.folderBranch;
    const s = state.folderSem;
    const subj = state.folderSubject;
    const dept = state.folderDept || getDeptForBranch(b);

    breadcrumbEl.innerHTML = `
      <span class="crumb-link" onclick="goToFolderLevel('root')">pyqs</span>
      <span style="color:#71717A;margin:0 4px;">/</span>
      ${dept ? `<span class="crumb-link" onclick="goToFolderLevel('dept')">${escapeHtml(dept.name)}</span><span style="color:#71717A;margin:0 4px;">/</span>` : ""}
      <span class="crumb-link" onclick="goToFolderLevel('branch')">${escapeHtml(b.code || b.name)}</span>
      <span style="color:#71717A;margin:0 4px;">/</span>
      <span class="crumb-link" onclick="goToFolderLevel('semester')">SEMESTER ${s}</span>
      <span style="color:#71717A;margin:0 4px;">/</span>
      <span class="crumb-active">${escapeHtml(subj)}</span>
    `;

    const subjectPapers = state.allPapers.filter(
      (p) => matchesBranch(p.branch, b) &&
             Number(p.semester) === Number(s) &&
             p.subject && p.subject.toLowerCase() === subj.toLowerCase()
    );

    if (subjectPapers.length === 0) {
      const emptyRow = document.createElement("div");
      emptyRow.className = "folder-empty-row";
      emptyRow.innerHTML = `
        <div>📁 No files uploaded yet for <strong>${escapeHtml(subj)}</strong>.</div>
        <p style="font-size:12px;color:var(--text-muted);margin:0;">Be the first student to upload a question paper or notes for this subject.</p>
        <button class="btn-contribute-mini" onclick="openUploadForContext('${escapeHtml(b.code)}', ${s}, '${escapeHtml(subj)}')">+ Contribute Paper for this Subject</button>
      `;
      listEl.appendChild(emptyRow);
    } else {
      // Group papers into categories (folders based on what PDFs are inside)
      const categoriesMap = new Map();
      subjectPapers.forEach((p) => {
        const cat = getPaperCategory(p);
        if (!categoriesMap.has(cat.key)) {
          categoriesMap.set(cat.key, {
            key: cat.key,
            name: cat.name,
            order: cat.order,
            count: 0
          });
        }
        categoriesMap.get(cat.key).count++;
      });

      const categoriesList = Array.from(categoriesMap.values()).sort(
        (a, b) => a.order - b.order || a.name.localeCompare(b.name)
      );

      // Render category folders
      categoriesList.forEach((cat) => {
        const row = document.createElement("div");
        row.className = "folder-row-item";
        row.innerHTML = `
          <div class="folder-left-content">
            ${FOLDER_SVG}
            <span class="folder-name-text">${escapeHtml(cat.name)}</span>
          </div>
          <div class="folder-right-content">
            <span class="folder-file-count">${cat.count} ${cat.count === 1 ? 'file' : 'files'}</span>
            <span class="folder-row-chevron">&rsaquo;</span>
          </div>
        `;
        row.addEventListener("click", () => {
          state.folderLevel = "category";
          state.folderCategoryKey = cat.key;
          state.folderCategoryName = cat.name;
          renderFolderDirectory();
        });
        listEl.appendChild(row);
      });

      // Also provide an "All Resources" folder option if multiple categories exist
      if (categoriesList.length > 1) {
        const allRow = document.createElement("div");
        allRow.className = "folder-row-item";
        allRow.innerHTML = `
          <div class="folder-left-content">
            ${FOLDER_SVG}
            <span class="folder-name-text">All Resources (${escapeHtml(subj)})</span>
          </div>
          <div class="folder-right-content">
            <span class="folder-file-count">${subjectPapers.length} ${subjectPapers.length === 1 ? 'file' : 'files'}</span>
            <span class="folder-row-chevron">&rsaquo;</span>
          </div>
        `;
        allRow.addEventListener("click", () => {
          state.folderLevel = "category";
          state.folderCategoryKey = "all";
          state.folderCategoryName = `All Resources (${subj})`;
          renderFolderDirectory();
        });
        listEl.appendChild(allRow);
      }
    }

  } else if (state.folderLevel === "category") {
    const b = state.folderBranch;
    const s = state.folderSem;
    const subj = state.folderSubject;
    const catKey = state.folderCategoryKey;
    const catName = state.folderCategoryName;
    const dept = state.folderDept || getDeptForBranch(b);

    breadcrumbEl.innerHTML = `
      <span class="crumb-link" onclick="goToFolderLevel('root')">pyqs</span>
      <span style="color:#71717A;margin:0 4px;">/</span>
      ${dept ? `<span class="crumb-link" onclick="goToFolderLevel('dept')">${escapeHtml(dept.name)}</span><span style="color:#71717A;margin:0 4px;">/</span>` : ""}
      <span class="crumb-link" onclick="goToFolderLevel('branch')">${escapeHtml(b.code || b.name)}</span>
      <span style="color:#71717A;margin:0 4px;">/</span>
      <span class="crumb-link" onclick="goToFolderLevel('semester')">SEMESTER ${s}</span>
      <span style="color:#71717A;margin:0 4px;">/</span>
      <span class="crumb-link" onclick="goToFolderLevel('subject')">${escapeHtml(subj)}</span>
      <span style="color:#71717A;margin:0 4px;">/</span>
      <span class="crumb-active">${escapeHtml(catName)}</span>
    `;

    const subjectPapers = state.allPapers.filter(
      (p) => matchesBranch(p.branch, b) &&
             Number(p.semester) === Number(s) &&
             p.subject && p.subject.toLowerCase() === subj.toLowerCase()
    );

    let categoryPapers = [];
    if (catKey === "all") {
      categoryPapers = [...subjectPapers];
    } else {
      categoryPapers = subjectPapers.filter((p) => getPaperCategory(p).key === catKey);
    }

    if (categoryPapers.length === 0) {
      const emptyRow = document.createElement("div");
      emptyRow.className = "folder-empty-row";
      emptyRow.innerHTML = `
        <div>📁 No files found in <strong>${escapeHtml(catName)}</strong>.</div>
        <button class="btn-contribute-mini" onclick="openUploadForContext('${escapeHtml(b.code)}', ${s}, '${escapeHtml(subj)}', '${escapeHtml(catKey)}')">+ Contribute Paper</button>
      `;
      listEl.appendChild(emptyRow);
    } else {
      categoryPapers.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
      categoryPapers.forEach((p) => {
        listEl.appendChild(createPaperRow(p));
      });
      bindPaperEvents(listEl);
    }
  }
}

window.goToFolderLevel = function(level) {
  if (level === "root") {
    state.folderLevel = "root";
    state.folderDept = null;
    state.folderBranch = null;
    state.folderSem = null;
    state.folderSubject = null;
    state.folderCategoryKey = null;
    state.folderCategoryName = null;
  } else if (level === "dept") {
    state.folderLevel = "dept";
    state.folderBranch = null;
    state.folderSem = null;
    state.folderSubject = null;
    state.folderCategoryKey = null;
    state.folderCategoryName = null;
  } else if (level === "branch") {
    state.folderLevel = "branch";
    state.folderSem = null;
    state.folderSubject = null;
    state.folderCategoryKey = null;
    state.folderCategoryName = null;
  } else if (level === "semester") {
    state.folderLevel = "semester";
    state.folderSubject = null;
    state.folderCategoryKey = null;
    state.folderCategoryName = null;
  } else if (level === "subject") {
    state.folderLevel = "subject";
    state.folderCategoryKey = null;
    state.folderCategoryName = null;
  }
  renderFolderDirectory();
};

function handleFolderUp() {
  if (state.folderLevel === "category") {
    state.folderLevel = "subject";
    state.folderCategoryKey = null;
    state.folderCategoryName = null;
  } else if (state.folderLevel === "subject") {
    state.folderLevel = "semester";
    state.folderSubject = null;
    state.folderCategoryKey = null;
    state.folderCategoryName = null;
  } else if (state.folderLevel === "semester") {
    state.folderLevel = "branch";
    state.folderSem = null;
    state.folderSubject = null;
    state.folderCategoryKey = null;
    state.folderCategoryName = null;
  } else if (state.folderLevel === "branch") {
    state.folderLevel = "dept";
    state.folderBranch = null;
    state.folderSem = null;
    state.folderSubject = null;
    state.folderCategoryKey = null;
    state.folderCategoryName = null;
  } else if (state.folderLevel === "dept") {
    state.folderLevel = "root";
    state.folderDept = null;
    state.folderBranch = null;
    state.folderSem = null;
    state.folderSubject = null;
    state.folderCategoryKey = null;
    state.folderCategoryName = null;
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
    DEPARTMENTS.forEach((dept) => {
      const g1 = document.createElement("optgroup");
      g1.label = dept.name;
      const g2 = document.createElement("optgroup");
      g2.label = dept.name;
      dept.branches.forEach((b) => {
        g1.appendChild(new Option(`${b.code} — ${b.name}`, b.code));
        g2.appendChild(new Option(`${b.code} — ${b.name}`, b.code));
      });
      uploadBranchSelect.appendChild(g1);
      if (editBranchSelect) editBranchSelect.appendChild(g2);
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
    if (data.email) state.adminEmail = data.email;
    else if (state.isAdmin && !state.adminEmail) state.adminEmail = "evior0364@gmail.com";
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
  const email = state.adminEmail || "evior0364@gmail.com";
  if (el("adminDisplayEmail")) el("adminDisplayEmail").textContent = email;
  if (el("adminAvatarInitials")) el("adminAvatarInitials").textContent = getInitials(email);
  if (el("accountAdminEmail")) el("accountAdminEmail").textContent = email;
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

// ---------------------------------------------------------------------
// In-Portal Document & Image Inspector Engine (Admin Moderation)
// ---------------------------------------------------------------------
let previewImageZoom = 1;
let previewImageRotate = 0;

function applyImageTransform() {
  const img = el("previewImageEl");
  const lvl = el("previewZoomLevel");
  if (img) {
    img.style.transform = `scale(${previewImageZoom}) rotate(${previewImageRotate}deg)`;
  }
  if (lvl) {
    lvl.textContent = `${Math.round(previewImageZoom * 100)}%`;
  }
}

function resetImageInspectorState() {
  previewImageZoom = 1;
  previewImageRotate = 0;
  applyImageTransform();
}

window.openAdminDocPreview = function(paperId, customDoc = null) {
  let doc = customDoc;
  if (!doc && paperId) {
    doc = state.pendingPapers.find((p) => String(p.id) === String(paperId));
  }
  if (!doc) {
    showToast("Document details not found.", "error");
    return;
  }

  const filename = doc.filename || doc.attachment || "";
  const previewUrl = filename.startsWith("http") ? filename : `/uploads/${encodeURIComponent(filename)}`;

  const ext = (doc.original_name || filename).split(".").pop().toLowerCase().split("?")[0];
  const isImage = ["png", "jpg", "jpeg", "webp", "gif", "bmp"].includes(ext);
  const isPdf = ext === "pdf";

  // Populate Header
  const titleEl = el("previewDocTitle");
  if (titleEl) titleEl.textContent = doc.title || doc.subject || "Academic Document";

  const subEl = el("previewDocSubject");
  if (subEl) {
    const codeStr = doc.code ? ` (${doc.code})` : "";
    subEl.textContent = (doc.subject || "Resource Review") + codeStr;
  }

  const contribEl = el("previewDocContributor");
  if (contribEl) {
    contribEl.textContent = doc.contributor_name || doc.name || "Anonymous Contributor";
  }

  const branchEl = el("previewBranchBadge");
  if (branchEl) {
    branchEl.textContent = doc.branch || "CSE";
    branchEl.style.display = doc.branch ? "inline-flex" : "none";
  }

  const semEl = el("previewSemBadge");
  if (semEl) {
    semEl.textContent = doc.semester ? `Semester ${doc.semester}` : "";
    semEl.style.display = doc.semester ? "inline-flex" : "none";
  }

  const typeEl = el("previewTypeBadge");
  if (typeEl) {
    const typeLabel = (TYPE_SHORT && TYPE_SHORT[doc.type]) ? TYPE_SHORT[doc.type] : (doc.type || "RESOURCE").toUpperCase();
    typeEl.textContent = typeLabel;
  }

  const fmtBadge = el("previewFormatBadge");
  if (fmtBadge) {
    fmtBadge.className = "preview-format-chip";
    if (isPdf) {
      fmtBadge.classList.add("chip-pdf");
      fmtBadge.textContent = "📄 PDF Document";
    } else if (isImage) {
      fmtBadge.classList.add("chip-image");
      fmtBadge.textContent = "🖼️ High-Res Image";
    } else {
      fmtBadge.classList.add("chip-doc");
      fmtBadge.textContent = `📑 ${ext.toUpperCase() || "File"}`;
    }
  }

  // External tab link
  const extLink = el("previewExtLink");
  if (extLink) extLink.href = previewUrl;

  // Viewports Management
  const pdfContainer = el("previewPdfContainer");
  const imgContainer = el("previewImageContainer");
  const fallbackContainer = el("previewFallbackContainer");
  const imgControls = el("previewImageControls");

  if (pdfContainer) pdfContainer.classList.add("hidden");
  if (imgContainer) imgContainer.classList.add("hidden");
  if (fallbackContainer) fallbackContainer.classList.add("hidden");
  if (imgControls) imgControls.style.display = "none";

  if (isPdf) {
    if (pdfContainer) pdfContainer.classList.remove("hidden");
    const frame = el("previewPdfFrame");
    if (frame) frame.src = previewUrl;
  } else if (isImage) {
    if (imgContainer) imgContainer.classList.remove("hidden");
    if (imgControls) imgControls.style.display = "inline-flex";
    const imgEl = el("previewImageEl");
    if (imgEl) imgEl.src = previewUrl;
    resetImageInspectorState();
  } else {
    if (fallbackContainer) fallbackContainer.classList.remove("hidden");
    const dBtn = el("previewDownloadBtn");
    if (dBtn) dBtn.href = previewUrl;
  }

  // Bottom Decision Toolbar (Approve / Reject)
  const decisionToolbar = el("previewDecisionToolbar");
  if (decisionToolbar) {
    if (doc.id && state.pendingPapers.some((p) => String(p.id) === String(doc.id))) {
      decisionToolbar.style.display = "flex";
      const appBtn = el("previewApproveBtn");
      const rejBtn = el("previewRejectBtn");
      if (appBtn) {
        appBtn.onclick = async () => {
          closeModal("adminDocPreviewModal");
          await approvePaper(doc.id);
        };
      }
      if (rejBtn) {
        rejBtn.onclick = async () => {
          closeModal("adminDocPreviewModal");
          await rejectPaper(doc.id);
        };
      }
    } else {
      decisionToolbar.style.display = "none";
    }
  }

  openModal("adminDocPreviewModal");
};

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
      <div class="admin-empty-state-card">
        <div class="admin-empty-icon-wrap">
          <div class="empty-icon-pulse"></div>
          <svg class="empty-svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h3 class="admin-empty-title">All Caught Up! 🎉</h3>
        <p class="admin-empty-subtitle">The moderation queue is completely clear. Any new student-contributed question papers, mid-term exams, or lecture notes will populate here automatically for your verification.</p>
        <div class="admin-empty-actions">
          <button type="button" class="btn-admin-action" onclick="fetchPendingSubmissions()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Refresh Queue
          </button>
          <button type="button" class="btn-admin-secondary" onclick="closeModal('moderationModal'); openModal('uploadModal');">
            + Publish Directly as Admin
          </button>
        </div>
        <div class="admin-live-badge">
          <span class="live-dot"></span> Real-time moderation active &bull; Auto-syncing
        </div>
      </div>
    `;
    return;
  }

  state.pendingPapers.forEach((p) => {
    const card = document.createElement("div");
    card.className = "pending-card-pro";
    const previewUrl = p.filename.startsWith("http") ? p.filename : `/uploads/${encodeURIComponent(p.filename)}`;
    const dateFormatted = p.uploaded_at ? new Date(p.uploaded_at).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
    }) : "Recent";
    const typeLabel = (TYPE_SHORT && TYPE_SHORT[p.type]) ? TYPE_SHORT[p.type] : (p.type || "RESOURCE").toUpperCase();

    const ext = (p.original_name || p.filename || "").split('.').pop().toLowerCase().split('?')[0];
    const isImage = ["png", "jpg", "jpeg", "webp", "gif", "bmp"].includes(ext);
    const isPdf = ext === "pdf";

    card.innerHTML = `
      <div class="pending-card-header">
        <div class="pending-badge-group">
          <span class="pending-branch-badge">${escapeHtml(p.branch || "CSE")}</span>
          <span class="pending-type-badge">${escapeHtml(typeLabel)}</span>
          <span class="pending-sem-badge">Semester ${p.semester}</span>
        </div>
        <span class="pending-time-text">${dateFormatted}</span>
      </div>

      <div class="pending-body-section">
        <h4 class="pending-title-text">${escapeHtml(p.title)}</h4>
        <div class="pending-subject-line">
          <span class="pending-sub-name">${escapeHtml(p.subject)}</span>
          ${p.code ? `<span class="pending-sub-code">${escapeHtml(p.code)}</span>` : ""}
        </div>
      </div>

      ${isImage ? `
        <div class="pending-card-thumb" data-inspect-id="${p.id}" title="Click to inspect full image">
          <img src="${previewUrl}" alt="${escapeHtml(p.title)}" loading="lazy" />
          <div class="thumb-inspect-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Click to Inspect Image (${ext.toUpperCase()})
          </div>
        </div>
      ` : (isPdf ? `
        <div class="pending-card-pdf-strip" data-inspect-id="${p.id}" title="Click to open interactive PDF reader">
          <div class="pdf-strip-left">
            <span class="pdf-file-icon">📄</span>
            <div class="pdf-strip-text">
              <strong>${escapeHtml(p.original_name || p.filename || "Question Paper")}</strong>
              <span>PDF Document &bull; Click to inspect questions &amp; pages</span>
            </div>
          </div>
          <span class="pdf-inspect-btn-text">
            Inspect PDF &rarr;
          </span>
        </div>
      ` : "")}

      <div class="pending-contributor-row">
        <div class="contributor-mini-avatar">${getInitials(p.contributor_name || "ST")}</div>
        <div class="contributor-info-meta">
          <span class="contrib-label">Contributed by:</span>
          <strong class="contrib-name">${escapeHtml(p.contributor_name || "Anonymous Student")}</strong>
          ${p.contributor_contact ? `<span class="contrib-contact">(${escapeHtml(p.contributor_contact)})</span>` : ""}
        </div>
      </div>

      <div class="pending-actions-bar">
        <div style="display: flex; align-items: center; gap: 6px;">
          <button type="button" class="btn-pending-inspect" data-inspect-id="${p.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Inspect ${isImage ? "Image" : (isPdf ? "PDF" : "Content")}
          </button>
          <a href="${previewUrl}" target="_blank" rel="noopener noreferrer" class="btn-pending-ext" title="Open original file in new window">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
        <div class="pending-btn-right">
          <button class="btn-pending-reject" data-reject="${p.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Reject
          </button>
          <button class="btn-pending-approve" data-approve="${p.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Approve &amp; Publish
          </button>
        </div>
      </div>
    `;
    listEl.appendChild(card);
  });

  listEl.querySelectorAll("[data-inspect-id]").forEach((btn) => {
    btn.addEventListener("click", () => openAdminDocPreview(btn.dataset.inspectId));
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
    const reqBadge = el("adminRequestsCount");
    if (reqBadge) {
      reqBadge.textContent = state.requestsCount;
      reqBadge.classList.toggle("has-count", state.requestsCount > 0);
    }
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
      <div class="admin-empty-state-card">
        <div class="admin-empty-icon-wrap" style="background: rgba(99, 102, 241, 0.12); color: #818cf8; border-color: rgba(99, 102, 241, 0.25);">
          <svg class="empty-svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <h3 class="admin-empty-title">Zero Pending Inquiries 🎉</h3>
        <p class="admin-empty-subtitle">All student inquiries, missing paper requests, and takedown notices have been addressed. New student requests will appear here.</p>
        <div class="admin-empty-actions">
          <button type="button" class="btn-admin-action" onclick="fetchAdminRequests()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Refresh Requests
          </button>
        </div>
      </div>
    `;
    return;
  }

  state.feedbackRequests.forEach((req) => {
    const card = document.createElement("div");
    card.className = "pending-card-pro";
    const dateFormatted = new Date(req.created_at).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
    });
    const isDmca = req.category === "dmca_takedown";
    card.innerHTML = `
      <div class="pending-card-header">
        <div class="pending-badge-group">
          <span class="file-type-pill ${isDmca ? 'file-pdf' : 'file-doc'}">${escapeHtml(req.category.toUpperCase().replace('_', ' '))}</span>
          ${req.branch ? `<span class="pending-branch-badge">${escapeHtml(req.branch)}</span>` : ""}
        </div>
        <span class="pending-time-text">${dateFormatted}</span>
      </div>

      <div class="pending-body-section">
        <h4 class="pending-title-text">${escapeHtml(req.subject || "Resource Inquiry")}</h4>
        <p style="font-size:13px;color:#cbd5e1;margin:6px 0;line-height:1.5;">${escapeHtml(req.message)}</p>
      </div>

      ${req.attachment ? `
        <div style="margin: 2px 0 6px 0;">
          <button type="button" class="btn-request-attachment" data-req-inspect="${req.id}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            Inspect Attached ${req.attachment.toLowerCase().endsWith('.pdf') ? 'PDF Document' : 'Photo / Screenshot'}
          </button>
        </div>
      ` : ""}

      <div class="pending-contributor-row">
        <div class="contributor-mini-avatar" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24;">${getInitials(req.name || "ST")}</div>
        <div class="contributor-info-meta">
          <span class="contrib-label">From:</span>
          <strong class="contrib-name">${escapeHtml(req.name || "Anonymous")}</strong>
          ${req.contact ? `<span class="contrib-contact">&bull; Contact: ${escapeHtml(req.contact)}</span>` : ""}
        </div>
      </div>

      <div class="pending-actions-bar" style="justify-content: flex-end;">
        <button class="btn btn-outline btn-sm" data-resolve-req="${req.id}">✓ Mark as Resolved</button>
      </div>
    `;
    listEl.appendChild(card);
  });

  listEl.querySelectorAll("[data-req-inspect]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = state.feedbackRequests.find((r) => String(r.id) === String(btn.dataset.reqInspect));
      if (!item || !item.attachment) return;
      openAdminDocPreview(null, {
        title: item.subject || "Student Request Attachment",
        subject: item.category.replace('_', ' ').toUpperCase(),
        branch: item.branch || "",
        semester: "",
        type: "REQUEST",
        filename: item.attachment,
        original_name: item.attachment,
        contributor_name: item.name || "Student",
        isRequest: true
      });
    });
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
window.openUploadForContext = function(branchCode, semesterNum, subject, typeKey) {
  if (branchCode && el("uploadBranch")) el("uploadBranch").value = branchCode;
  if (semesterNum && el("uploadSemester")) el("uploadSemester").value = semesterNum;
  if (subject && el("uploadSubject")) el("uploadSubject").value = subject;
  if (typeKey && typeKey !== "all" && el("uploadType")) el("uploadType").value = typeKey;
  openModal("uploadModal");
};

// ---------------------------------------------------------------------
// Event Bindings
// ---------------------------------------------------------------------
function bindEvents() {
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
    if (state.folderSubject && el("uploadSubject")) {
      el("uploadSubject").value = state.folderSubject;
    }
    if (state.folderCategoryKey && state.folderCategoryKey !== "all" && el("uploadType")) {
      el("uploadType").value = state.folderCategoryKey;
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

  // Document Inspector Zoom & Rotate Controls
  const zoomIn = el("previewZoomInBtn");
  if (zoomIn) {
    zoomIn.addEventListener("click", () => {
      previewImageZoom = Math.min(3.5, Number((previewImageZoom + 0.25).toFixed(2)));
      applyImageTransform();
    });
  }

  const zoomOut = el("previewZoomOutBtn");
  if (zoomOut) {
    zoomOut.addEventListener("click", () => {
      previewImageZoom = Math.max(0.4, Number((previewImageZoom - 0.25).toFixed(2)));
      applyImageTransform();
    });
  }

  const rotateBtn = el("previewRotateBtn");
  if (rotateBtn) {
    rotateBtn.addEventListener("click", () => {
      previewImageRotate = (previewImageRotate + 90) % 360;
      applyImageTransform();
    });
  }

  const resetBtn = el("previewResetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetImageInspectorState);
  }

  // Modal close handlers
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay.id);
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

      const fileInput = el("requestFile");
      const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;

      try {
        if (hasFile) {
          const formData = new FormData();
          formData.append("category", el("requestCategory").value);
          formData.append("name", el("requestName").value.trim());
          formData.append("contact", el("requestContact").value.trim());
          formData.append("subject", el("requestSubject").value.trim());
          formData.append("branch", el("requestBranch").value.trim());
          formData.append("message", el("requestMessage").value.trim());
          formData.append("file", fileInput.files[0]);

          const res = await fetch("/api/feedback", {
            method: "POST",
            credentials: "same-origin",
            body: formData,
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Submission failed.");
        } else {
          const payload = {
            category: el("requestCategory").value,
            name: el("requestName").value.trim(),
            contact: el("requestContact").value.trim(),
            subject: el("requestSubject").value.trim(),
            branch: el("requestBranch").value.trim(),
            message: el("requestMessage").value.trim(),
          };
          await api("/api/feedback", {
            method: "POST",
            body: JSON.stringify(payload),
          });
        }

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

  // ---------------------------------------------------------------------
  // Firebase Auth Helper
  // ---------------------------------------------------------------------
  let firebaseAuthInstance = null;

  function getFirebaseAuth() {
    if (firebaseAuthInstance) return firebaseAuthInstance;
    const cfg = window.FIREBASE_CONFIG;
    if (cfg && cfg.apiKey && cfg.projectId && typeof firebase !== "undefined") {
      try {
        if (!firebase.apps || !firebase.apps.length) {
          firebase.initializeApp(cfg);
        }
        firebaseAuthInstance = firebase.auth();
        return firebaseAuthInstance;
      } catch (err) {
        console.warn("[Firebase] Initialization notice:", err);
      }
    }
    return null;
  }

  // Admin Login Form
  const loginForm = el("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = el("loginEmail").value.trim();
      const password = el("loginPassword").value;
      const errorEl = el("loginError");
      const submitBtn = loginForm.querySelector("button[type=submit]");
      const originalText = submitBtn ? submitBtn.textContent : "Sign in to Moderation";

      if (errorEl) errorEl.classList.add("hidden");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Authenticating...";
      }

      try {
        const auth = getFirebaseAuth();
        let payload = { email, password };

        if (auth) {
          try {
            const userCred = await auth.signInWithEmailAndPassword(email, password);
            const idToken = await userCred.user.getIdToken();
            payload = { email: userCred.user.email || email, idToken: idToken };
          } catch (fbErr) {
            let userMessage = fbErr.message;
            if (fbErr.code === "auth/invalid-credential" || fbErr.code === "auth/wrong-password" || fbErr.code === "auth/user-not-found") {
              userMessage = "Invalid admin email or password.";
            } else if (fbErr.code === "auth/too-many-requests") {
              userMessage = "Too many attempts. Access temporarily locked. Try again later.";
            } else if (fbErr.code === "auth/invalid-email") {
              userMessage = "Please enter a valid email address.";
            } else if (fbErr.code === "auth/network-request-failed") {
              userMessage = "Network error. Please check your internet connection.";
            }
            throw new Error(userMessage);
          }
        }

        await api("/api/login", {
          method: "POST",
          body: JSON.stringify(payload),
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
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }

  // Admin Forgot Password (Firebase Auth)
  const forgotPasswordLink = el("forgotPasswordLink");
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = el("loginEmail").value.trim();
      const errorEl = el("loginError");
      if (!email) {
        if (errorEl) {
          errorEl.textContent = "Please enter your admin email above first, then click 'Forgot password?'.";
          errorEl.classList.remove("hidden");
        }
        return;
      }

      try {
        const auth = getFirebaseAuth();
        if (auth) {
          await auth.sendPasswordResetEmail(email);
          showToast(`Password reset link sent to ${email}`, "success");
          if (errorEl) errorEl.classList.add("hidden");
        } else {
          showToast("Firebase Auth could not be loaded. Please refresh the page.", "error");
        }
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = err.message || "Failed to send reset link.";
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
      const current = (el("currentPassword")?.value || "").trim();
      const newPwd = el("newPassword")?.value || "";
      const confirmPwd = el("confirmNewPassword") ? el("confirmNewPassword").value : newPwd;
      const msgEl = el("changePasswordMsg");
      const submitBtn = el("btnChangePasswordSubmit");
      const origContent = submitBtn ? submitBtn.innerHTML : "Save New Password";

      if (msgEl) msgEl.classList.add("hidden");

      if (newPwd.length < 8) {
        if (msgEl) {
          msgEl.textContent = "New password must be at least 8 characters.";
          msgEl.classList.remove("hidden");
        }
        return;
      }

      if (newPwd !== confirmPwd) {
        if (msgEl) {
          msgEl.textContent = "New passwords do not match. Please re-enter.";
          msgEl.classList.remove("hidden");
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Updating Password...</span>`;
      }

      try {
        const auth = getFirebaseAuth();
        if (auth && auth.currentUser) {
          try {
            await auth.currentUser.updatePassword(newPwd);
          } catch (fbPassErr) {
            console.warn("Firebase password update note:", fbPassErr);
          }
        }
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
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origContent;
        }
      }
    });
  }

  // Password Visibility Eye Toggle Helper
  window.togglePasswordVisibility = function(inputId, btnEl) {
    const inp = el(inputId);
    if (!inp) return;
    const isPass = inp.type === "password";
    inp.type = isPass ? "text" : "password";
    if (btnEl) {
      btnEl.innerHTML = isPass ? `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
      ` : `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      `;
    }
  };

  // Admin Quick Password Reset Email (Security Tab)
  const adminSendResetBtn = el("adminSendResetBtn");
  if (adminSendResetBtn) {
    adminSendResetBtn.addEventListener("click", async () => {
      const email = state.adminEmail || "evior0364@gmail.com";
      const origText = adminSendResetBtn.innerHTML;
      adminSendResetBtn.disabled = true;
      adminSendResetBtn.textContent = "Sending link...";
      try {
        const auth = getFirebaseAuth();
        if (auth) {
          await auth.sendPasswordResetEmail(email);
          showToast(`Password reset link dispatched to ${email}`, "success");
        } else {
          showToast("Firebase Auth could not be initialized.", "error");
        }
      } catch (err) {
        showToast(err.message || "Failed to send reset link.", "error");
      } finally {
        adminSendResetBtn.disabled = false;
        adminSendResetBtn.innerHTML = origText;
      }
    });
  }

  // Admin Logout
  const logoutBtn = el("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        const auth = getFirebaseAuth();
        if (auth) {
          await auth.signOut();
        }
      } catch (e) {
        console.warn("Firebase signout notice:", e);
      }
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
  if (id === "adminDocPreviewModal") {
    const f = el("previewPdfFrame");
    if (f) f.src = "about:blank";
    const img = el("previewImageEl");
    if (img) img.src = "";
  }
};

window.openUploadModal = function() {
  if (state.folderBranch && el("uploadBranch")) {
    el("uploadBranch").value = state.folderBranch.code || state.folderBranch.name;
  }
  if (state.folderSem && el("uploadSemester")) {
    el("uploadSemester").value = state.folderSem;
  }
  if (state.folderSubject && el("uploadSubject")) {
    el("uploadSubject").value = state.folderSubject;
  }
  if (state.folderCategoryKey && state.folderCategoryKey !== "all" && el("uploadType")) {
    el("uploadType").value = state.folderCategoryKey;
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