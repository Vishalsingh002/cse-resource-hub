# 📚 Campus Resource Hub — Multi-Branch Academic Portal

A full-stack university resource hub built with **Flask + SQLite / Turso + vanilla JS + Cloudinary**.
Students across **all branches** (CSE, AI & ML, Data Science, Cyber Security, ECE, ME, Civil, EE, BCA, MCA) can browse, search, and download previous year question papers, notes, syllabus, and lab manuals — no login required.

Any student can contribute new study resources with **their name credited on the platform**, while **deletion is strictly protected** so no materials can be lost or removed by unauthorized visitors.

---

## ✨ Features

- 🏛️ **All-Branch Support** — dedicated branch switcher supporting CSE, AI & ML, Data Science, Cyber Security, ECE, ME, Civil, EE, BCA, MCA, and custom branches.
- 🤝 **Open Community Contributions** — any student can click **Contribute Resource** to share notes or question papers without needing an account.
- 🎖️ **Contributor Crediting ("Show their name")** — each resource card showcases who contributed it (`Contributed by <Name>`) with custom avatar initials.
- 🏆 **Campus Hall of Fame** — public leaderboard highlighting top contributors and the branches they support.
- 🛡️ **Deletion Protection** — public users cannot edit or delete any resources. Content is preserved safely.
- 📋 **Admin Moderation Queue** — submissions from students land in an admin moderation queue (`/api/admin/pending`) where administrators verify and publish them in 1-click.
- 🔍 **Multi-Level Navigation** — Branch Switcher → 8 Semesters → Subjects with live resource counts → Category Pills (PYQ, Mid Term, End Term, Notes, Syllabus, Tutorials, Lab Manuals).
- 📥 **Direct Attachment Downloads** — tracked with a live download counter on each paper.
- 🔐 **Brute-Force Rate Limiting** — 5 consecutive failed logins result in a 10-minute IP lockout.
- 🗄️ **Dual Database & Storage Support** — Local SQLite or Turso Cloud DB; Local uploads or Cloudinary CDN.

---

## 🗂️ Project Structure

```
cse-resource-hub/
├── app.py                         # Flask backend — multi-branch routes, public upload, moderation
├── requirements.txt               # Python dependencies
├── database.db                    # Auto-created SQLite database (gitignored)
├── vercel.json                    # Vercel deployment configuration
├── wsgi_pythonanywhere_example.py # Example WSGI config for PythonAnywhere
├── uploads/                       # Uploaded files live here (gitignored)
├── templates/
│   └── index.html                 # Main interface template with modals & branch switcher
└── static/
    ├── style.css                  # Custom luxury dark hero + cards + modals theme
    ├── script.js                  # Frontend engine: filters, contributor cards, moderation
    ├── logo.png                   # University logo
    └── quantum_logo.png           # Favicon
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the application
```bash
python app.py
```

### 3. Open in your browser
```
http://127.0.0.1:5000
```

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/papers` | Public | List approved resources with branch/sem/type/search filtering |
| POST | `/api/upload` | Public | Anyone can contribute (students enter queue; admins auto-publish) |
| GET | `/api/contributors` | Public | List top contributors for the Hall of Fame leaderboard |
| GET | `/api/download/<id>` | Public | Direct attachment download + counter increment |
| POST | `/api/login` | Public | Admin sign-in (rate-limited) |
| POST | `/api/logout` | Admin | Admin sign-out |
| GET | `/api/session` | Public | Check current admin session |
| GET | `/api/admin/pending` | Admin | View pending community submissions queue |
| POST | `/api/admin/approve/<id>`| Admin | Approve and publish a submission live |
| POST | `/api/admin/reject/<id>` | Admin | Reject and delete a submission |
| PUT | `/api/papers/<id>` | Admin | Edit paper metadata |
| DELETE | `/api/papers/<id>` | Admin | Permanently delete a resource |
| POST | `/api/change-password` | Admin | Change admin password securely |

---

## 🔒 Security & Data Integrity

- **Strict Access Control on Content**: Regular students can add materials, but the `DELETE` and `PUT` endpoints are protected by `@admin_required`.
- **Quality Assurance**: New uploads go into `status = 'pending'` for administrator review before becoming visible publicly.
- **Passwords**: Hashed with Werkzeug `scrypt` / `pbkdf2`. Never stored in plaintext.
- **File Validation**: Extensions strictly whitelisted (`pdf, doc, docx, ppt, pptx, jpg, jpeg, png, gif, webp`) and filenames sanitized with `secure_filename`.

---

## 📄 License

Free to use and modify for university and college campuses.
