import os
import secrets
import sqlite3
import urllib.request
from datetime import datetime, timedelta, timezone
from functools import wraps

from flask import (
    Flask, request, jsonify, session, send_from_directory,
    render_template, g, redirect, Response
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

# Cloudinary Library
import cloudinary
import cloudinary.uploader

# ---------------------------------------------------------------------------
# Config & .env Auto-Loader
# ---------------------------------------------------------------------------

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Automatically load .env file if present (for Turso & Cloudinary credentials)
_env_file = os.path.join(BASE_DIR, ".env")
if os.path.exists(_env_file):
    try:
        with open(_env_file, "r", encoding="utf-8") as _f:
            for _line in _f:
                _line = _line.strip()
                if _line and not _line.startswith("#") and "=" in _line:
                    _k, _v = _line.split("=", 1)
                    _k = _k.strip()
                    _v = _v.strip().strip("'\"")
                    if _k and _k not in os.environ:
                        os.environ[_k] = _v
    except Exception:
        pass

DB_PATH = os.path.join(BASE_DIR, "database.db")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB per file
ALLOWED_EXTENSIONS = {"pdf", "doc", "docx", "ppt", "pptx", "jpg", "jpeg", "png", "gif", "webp"}

# Turso (Cloud SQLite) credentials
TURSO_DB_URL = os.environ.get("TURSO_DATABASE_URL")
TURSO_AUTH_TOKEN = os.environ.get("TURSO_AUTH_TOKEN")
if TURSO_DB_URL and ("your-db-name" in TURSO_DB_URL or "your_turso" in str(TURSO_AUTH_TOKEN)):
    TURSO_DB_URL = None
    TURSO_AUTH_TOKEN = None

# Cloudinary credentials
CLOUDINARY_CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.environ.get("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.environ.get("CLOUDINARY_API_SECRET")
if CLOUDINARY_CLOUD_NAME and ("your_cloud_name" in CLOUDINARY_CLOUD_NAME or "your_api_key" in str(CLOUDINARY_API_KEY)):
    CLOUDINARY_CLOUD_NAME = None
    CLOUDINARY_API_KEY = None

if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY:
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True,
    )

ADMIN_EMAIL_DEFAULT = os.environ.get("ADMIN_EMAIL", "admin@college.edu").strip().lower()
ADMIN_PASSWORD_DEFAULT = os.environ.get("ADMIN_PASSWORD", "ChangeMe123!").strip()

MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 10

SEMESTERS = list(range(1, 9))

BRANCHES = [
    {"id": "all", "code": "ALL", "name": "All Branches"},
    {"id": "cse", "code": "CSE", "name": "Computer Science & Engineering"},
    {"id": "aiml", "code": "AI & ML", "name": "Artificial Intelligence & ML"},
    {"id": "ds", "code": "DS", "name": "Data Science"},
    {"id": "cs", "code": "CYS", "name": "Cyber Security"},
    {"id": "ece", "code": "ECE", "name": "Electronics & Communication"},
    {"id": "me", "code": "ME", "name": "Mechanical Engineering"},
    {"id": "ce", "code": "CE", "name": "Civil Engineering"},
    {"id": "ee", "code": "EE", "name": "Electrical Engineering"},
    {"id": "bca", "code": "BCA", "name": "Bachelor of Computer Applications"},
    {"id": "mca", "code": "MCA", "name": "Master of Computer Applications"},
]

TYPES = {
    "pyq": "Previous Year Question (PYQ)",
    "mid": "Mid Term Exam",
    "ent": "End Term Exam",
    "mft": "MFT (Mid Final Term)",
    "notes": "Notes & Study Material",
    "syl": "Syllabus",
    "tut": "Tutorials & Assignments",
    "lab": "Lab Manuals",
}

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", secrets.token_hex(32))
app.config["MAX_CONTENT_LENGTH"] = MAX_FILE_BYTES
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = os.environ.get("SESSION_COOKIE_SECURE", "0") == "1"

os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Turso / SQLite Compatibility Layer (Row & Dict support)
# ---------------------------------------------------------------------------

class RowWrapper(dict):
    """Supports both row['col'] and row[0] as well as dict(row)."""
    def __init__(self, columns, values):
        super().__init__(zip(columns, values))
        self._values = tuple(values)

    def __getitem__(self, item):
        if isinstance(item, int):
            return self._values[item]
        return super().__getitem__(item)


class TursoQueryResult:
    def __init__(self, res):
        self.res = res
        self._rows = []
        if res and hasattr(res, "columns") and hasattr(res, "rows"):
            cols = list(res.columns)
            for r in res.rows:
                vals = list(r) if hasattr(r, "__iter__") else [r]
                self._rows.append(RowWrapper(cols, vals))

    def fetchone(self):
        return self._rows[0] if self._rows else None

    def fetchall(self):
        return self._rows


class TursoDBWrapper:
    def __init__(self, client):
        self.client = client

    def execute(self, sql, params=None):
        if params is None:
            params = []
        elif isinstance(params, tuple):
            params = list(params)
        res = self.client.execute(sql, params)
        return TursoQueryResult(res)

    def commit(self):
        pass

    def close(self):
        try:
            self.client.close()
        except Exception:
            pass


def get_db():
    if "db" not in g:
        if TURSO_DB_URL and TURSO_AUTH_TOKEN:
            import libsql_client
            url = TURSO_DB_URL
            if url.startswith("libsql://"):
                url = url.replace("libsql://", "https://")
            client = libsql_client.create_client_sync(url=url, auth_token=TURSO_AUTH_TOKEN)
            g.db = TursoDBWrapper(client)
        else:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            try:
                conn.execute("PRAGMA foreign_keys = ON")
            except Exception:
                pass
            g.db = conn
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


# 👉 Nayi Line 1:
_db_initialized = False

def init_db():
    global _db_initialized
    if _db_initialized:
        return

    db = get_db()
    statements = [
        """
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS papers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            subject TEXT NOT NULL,
            code TEXT,
            semester INTEGER NOT NULL,
            type TEXT NOT NULL,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            uploaded_at TEXT NOT NULL,
            branch TEXT DEFAULT 'CSE',
            contributor_name TEXT DEFAULT 'Anonymous',
            contributor_contact TEXT,
            status TEXT DEFAULT 'approved',
            downloads INTEGER DEFAULT 0
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS login_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT NOT NULL,
            attempted_at TEXT NOT NULL,
            success INTEGER NOT NULL
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS feedback_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            name TEXT,
            contact TEXT,
            subject TEXT,
            branch TEXT,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        """
    ]
    for stmt in statements:
        try:
            db.execute(stmt)
        except Exception as e:
            print("[setup] Table create notice:", e)

    migration_statements = [
        "ALTER TABLE papers ADD COLUMN code TEXT",
        "ALTER TABLE papers ADD COLUMN branch TEXT DEFAULT 'CSE'",
        "ALTER TABLE papers ADD COLUMN contributor_name TEXT DEFAULT 'Anonymous'",
        "ALTER TABLE papers ADD COLUMN contributor_contact TEXT",
        "ALTER TABLE papers ADD COLUMN status TEXT DEFAULT 'approved'",
        "ALTER TABLE papers ADD COLUMN downloads INTEGER DEFAULT 0",
    ]
    for m_stmt in migration_statements:
        try:
            db.execute(m_stmt)
        except Exception:
            pass

    try:
        db.execute("UPDATE papers SET branch = 'CSE' WHERE branch IS NULL OR branch = ''")
        db.execute("UPDATE papers SET status = 'approved' WHERE status IS NULL OR status = ''")
        db.execute("UPDATE papers SET contributor_name = 'Campus Community' WHERE contributor_name IS NULL OR contributor_name = ''")
        db.execute("UPDATE papers SET downloads = 0 WHERE downloads IS NULL")
        db.commit()
    except Exception:
        pass

    try:
        admin_row = db.execute("SELECT * FROM admins WHERE LOWER(email) = LOWER(?)", (ADMIN_EMAIL_DEFAULT,)).fetchone()
        hashed = generate_password_hash(ADMIN_PASSWORD_DEFAULT)
        now_time = datetime.now(timezone.utc).isoformat()
        if not admin_row:
            db.execute(
                "INSERT INTO admins (email, password_hash, created_at) VALUES (?, ?, ?)",
                (ADMIN_EMAIL_DEFAULT, hashed, now_time),
            )
            print(f"[setup] Admin created -> {ADMIN_EMAIL_DEFAULT}")
    except Exception as e:
        print("[setup] Admin check notice:", e)

    _db_initialized = True


# ---------------------------------------------------------------------------
# Auth helpers


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("admin_id"):
            return jsonify({"error": "Unauthorized"}), 401
        return fn(*args, **kwargs)
    return wrapper


def client_ip():
    fwd = request.headers.get("X-Forwarded-For")
    return fwd.split(",")[0].strip() if fwd else request.remote_addr


def is_locked_out(ip):
    db = get_db()
    cutoff = (datetime.now(timezone.utc) - timedelta(minutes=LOCKOUT_MINUTES)).isoformat()
    rows = db.execute(
        "SELECT success FROM login_attempts WHERE ip = ? AND attempted_at > ? ORDER BY attempted_at DESC",
        (ip, cutoff),
    ).fetchall()
    fail_streak = 0
    for r in rows:
        if r["success"]:
            break
        fail_streak += 1
    return fail_streak >= MAX_LOGIN_ATTEMPTS


def record_attempt(ip, success):
    db = get_db()
    db.execute(
        "INSERT INTO login_attempts (ip, attempted_at, success) VALUES (?, ?, ?)",
        (ip, datetime.now(timezone.utc).isoformat(), 1 if success else 0),
    )
    db.commit()


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ---------------------------------------------------------------------------
# Page routes
# ---------------------------------------------------------------------------

@app.route("/")
@app.route("/admin")
@app.route("/admin/")
def index():
    return render_template("index.html")


# ---------------------------------------------------------------------------
# Auth API
# ---------------------------------------------------------------------------

@app.route("/api/login", methods=["POST"])
def login():
    ip = client_ip()
    if is_locked_out(ip):
        return jsonify({
            "error": f"Too many failed attempts. Try again after {LOCKOUT_MINUTES} minutes."
        }), 429

    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    db = get_db()
    admin = db.execute("SELECT * FROM admins WHERE LOWER(email) = LOWER(?)", (email,)).fetchone()

    if not admin or not check_password_hash(admin["password_hash"], password):
        record_attempt(ip, success=False)
        return jsonify({"error": "Invalid email or password."}), 401

    record_attempt(ip, success=True)
    session.clear()
    session["admin_id"] = admin["id"]
    session["admin_email"] = admin["email"]
    session.permanent = True
    return jsonify({"ok": True, "email": admin["email"]})


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"ok": True})


@app.route("/api/session")
def session_status():
    if session.get("admin_id"):
        return jsonify({"loggedIn": True, "email": session.get("admin_email")})
    return jsonify({"loggedIn": False})


@app.route("/api/change-password", methods=["POST"])
@admin_required
def change_password():
    data = request.get_json(silent=True) or {}
    current = data.get("current_password") or ""
    new = data.get("new_password") or ""

    if len(new) < 8:
        return jsonify({"error": "New password must be at least 8 characters."}), 400

    db = get_db()
    admin = db.execute("SELECT * FROM admins WHERE id = ?", (session["admin_id"],)).fetchone()
    if not check_password_hash(admin["password_hash"], current):
        return jsonify({"error": "Current password is incorrect."}), 401

    db.execute(
        "UPDATE admins SET password_hash = ? WHERE id = ?",
        (generate_password_hash(new), admin["id"]),
    )
    db.commit()
    return jsonify({"ok": True})


# ---------------------------------------------------------------------------
# Papers API & Public Submission
# ---------------------------------------------------------------------------

@app.route("/api/papers")
def list_papers():
    branch = request.args.get("branch", "").strip().lower()
    semester = request.args.get("semester", type=int)
    type_ = request.args.get("type", "").strip().lower()
    q = request.args.get("q", "").strip()
    status_filter = request.args.get("status", "approved").strip().lower()

    is_admin = bool(session.get("admin_id"))

    # Regular visitors can ONLY view approved papers
    if not is_admin or status_filter not in ["pending", "all", "approved"]:
        status_filter = "approved"

    query = "SELECT * FROM papers WHERE 1=1"
    params = []

    if status_filter != "all":
        query += " AND status = ?"
        params.append(status_filter)

    if branch and branch != "all":
        query += " AND LOWER(branch) = LOWER(?)"
        params.append(branch)

    if semester:
        query += " AND semester = ?"
        params.append(semester)

    if type_ and type_ in TYPES:
        query += " AND type = ?"
        params.append(type_)

    if q:
        query += " AND (title LIKE ? OR subject LIKE ? OR code LIKE ? OR contributor_name LIKE ?)"
        like = f"%{q}%"
        params.extend([like, like, like, like])

    query += " ORDER BY uploaded_at DESC"

    db = get_db()
    rows = db.execute(query, params).fetchall()
    papers = [dict(row) for row in rows]

    # Calculate pending count for admin badge
    pending_count = 0
    if is_admin:
        try:
            p_row = db.execute("SELECT COUNT(*) as cnt FROM papers WHERE status = 'pending'").fetchone()
            pending_count = p_row["cnt"] if p_row else 0
        except Exception:
            pending_count = 0

    return jsonify({
        "papers": papers,
        "types": TYPES,
        "branches": BRANCHES,
        "semesters": SEMESTERS,
        "pending_count": pending_count,
    })


@app.route("/api/upload", methods=["POST"])
def upload_paper():
    title = (request.form.get("title") or "").strip()
    subject = (request.form.get("subject") or "").strip()
    code = (request.form.get("code") or "").strip() or None
    semester = request.form.get("semester", type=int)
    type_ = (request.form.get("type") or "").strip().lower()
    branch = (request.form.get("branch") or "CSE").strip()
    contributor_name = (request.form.get("contributor_name") or "Anonymous").strip()
    contributor_contact = (request.form.get("contributor_contact") or "").strip()
    file = request.files.get("file")

    if not title or not subject or not semester or not type_:
        return jsonify({"error": "Title, Subject, Semester, and Type are required."}), 400
    if semester not in SEMESTERS:
        return jsonify({"error": "Invalid semester (must be 1 to 8)."}), 400
    if type_ not in TYPES:
        return jsonify({"error": "Invalid resource type."}), 400
    if not file or file.filename == "":
        return jsonify({"error": "A file is required."}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type. Allowed: PDF, Word, PPT, Images."}), 400

    safe_name = secure_filename(file.filename)

    # Cloudinary Upload if configured
    if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY:
        try:
            upload_result = cloudinary.uploader.upload(
                file,
                resource_type="auto",
                folder="quantum_hub",
                use_filename=True,
            )
            stored_file_ref = upload_result.get("secure_url")
        except Exception as e:
            return jsonify({"error": f"Cloudinary upload failed: {str(e)}"}), 500
    else:
        stored_name = f"{secrets.token_hex(8)}_{safe_name}"
        file.save(os.path.join(UPLOAD_DIR, stored_name))
        stored_file_ref = stored_name

    # Determine moderation status:
    # Admins get immediate publishing; community submissions go to moderation
    is_admin = bool(session.get("admin_id"))
    status = "approved" if is_admin else "pending"

    db = get_db()
    db.execute(
        """INSERT INTO papers (
            title, subject, code, semester, type, filename, original_name,
            uploaded_at, branch, contributor_name, contributor_contact, status, downloads
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)""",
        (
            title, subject, code, semester, type_, stored_file_ref, safe_name,
            datetime.now(timezone.utc).isoformat(), branch, contributor_name,
            contributor_contact, status
        ),
    )
    db.commit()

    if status == "approved":
        msg = "Resource published to the hub immediately!"
    else:
        msg = f"Thank you, {contributor_name}! Your resource has been submitted for verification. It will appear on the hub once approved by an admin."

    return jsonify({"ok": True, "status": status, "message": msg, "contributor": contributor_name})


@app.route("/api/contributors")
def list_contributors():
    db = get_db()
    try:
        rows = db.execute(
            """SELECT contributor_name, COUNT(*) as count,
                      GROUP_CONCAT(DISTINCT branch) as branches
               FROM papers
               WHERE status = 'approved' AND contributor_name IS NOT NULL
                 AND contributor_name != '' AND LOWER(contributor_name) != 'anonymous'
               GROUP BY contributor_name
               ORDER BY count DESC
               LIMIT 12"""
        ).fetchall()
        contributors = [dict(r) for r in rows]
    except Exception:
        contributors = []
    return jsonify({"contributors": contributors})


# ---------------------------------------------------------------------------
# Admin Moderation API
# ---------------------------------------------------------------------------

@app.route("/api/admin/pending")
@admin_required
def get_pending_papers():
    db = get_db()
    rows = db.execute("SELECT * FROM papers WHERE status = 'pending' ORDER BY uploaded_at DESC").fetchall()
    return jsonify({"papers": [dict(r) for r in rows]})


@app.route("/api/admin/approve/<int:paper_id>", methods=["POST"])
@admin_required
def approve_paper(paper_id):
    db = get_db()
    db.execute("UPDATE papers SET status = 'approved' WHERE id = ?", (paper_id,))
    db.commit()
    return jsonify({"ok": True, "message": "Resource approved and published!"})


@app.route("/api/admin/reject/<int:paper_id>", methods=["POST"])
@admin_required
def reject_paper(paper_id):
    db = get_db()
    paper = db.execute("SELECT * FROM papers WHERE id = ?", (paper_id,)).fetchone()
    if not paper:
        return jsonify({"error": "Resource not found."}), 404

    filename = paper["filename"]
    if not filename.startswith("http"):
        file_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass

    db.execute("DELETE FROM papers WHERE id = ?", (paper_id,))
    db.commit()
    return jsonify({"ok": True, "message": "Submission rejected and removed."})


@app.route("/api/papers/<int:paper_id>", methods=["PUT"])
@admin_required
def update_paper(paper_id):
    db = get_db()
    paper = db.execute("SELECT * FROM papers WHERE id = ?", (paper_id,)).fetchone()
    if not paper:
        return jsonify({"error": "Not found."}), 404

    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    subject = (data.get("subject") or "").strip()
    code = (data.get("code") or "").strip() or None
    branch = (data.get("branch") or paper.get("branch") or "CSE").strip()
    contributor_name = (data.get("contributor_name") or paper.get("contributor_name") or "Anonymous").strip()
    semester = data.get("semester")
    type_ = data.get("type")

    try:
        semester = int(semester)
    except (TypeError, ValueError):
        semester = None

    if not title or not subject or not semester or not type_:
        return jsonify({"error": "All fields are required."}), 400
    if semester not in SEMESTERS:
        return jsonify({"error": "Invalid semester."}), 400
    if type_ not in TYPES:
        return jsonify({"error": "Invalid resource type."}), 400

    db.execute(
        """UPDATE papers SET title = ?, subject = ?, code = ?, semester = ?, type = ?, branch = ?, contributor_name = ?
           WHERE id = ?""",
        (title, subject, code, semester, type_, branch, contributor_name, paper_id),
    )
    db.commit()
    return jsonify({"ok": True})


@app.route("/api/papers/<int:paper_id>", methods=["DELETE"])
@admin_required
def delete_paper(paper_id):
    db = get_db()
    paper = db.execute("SELECT * FROM papers WHERE id = ?", (paper_id,)).fetchone()
    if not paper:
        return jsonify({"error": "Not found."}), 404

    filename = paper["filename"]
    if not filename.startswith("http"):
        file_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass

    db.execute("DELETE FROM papers WHERE id = ?", (paper_id,))
    db.commit()
    return jsonify({"ok": True})


# ---------------------------------------------------------------------------
# Feedback, Resource Requests & DMCA Notices
# ---------------------------------------------------------------------------

@app.route("/api/feedback", methods=["POST"])
def submit_feedback():
    data = request.get_json(silent=True) or {}
    category = (data.get("category") or "feedback").strip()
    message = (data.get("message") or "").strip()
    name = (data.get("name") or "Anonymous").strip()
    contact = (data.get("contact") or "").strip()
    subject = (data.get("subject") or "").strip()
    branch = (data.get("branch") or "").strip()

    if not message:
        return jsonify({"error": "Message or details are required."}), 400

    db = get_db()
    db.execute(
        """INSERT INTO feedback_requests (category, name, contact, subject, branch, message, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (category, name, contact, subject, branch, message, datetime.now(timezone.utc).isoformat()),
    )
    db.commit()
    return jsonify({"ok": True, "message": "Thank you! Your request/notice has been submitted."})


@app.route("/api/admin/feedback", methods=["GET"])
@admin_required
def list_feedback():
    db = get_db()
    rows = db.execute("SELECT * FROM feedback_requests ORDER BY created_at DESC LIMIT 50").fetchall()
    return jsonify({"feedback": [dict(r) for r in rows]})


@app.route("/api/admin/feedback/<int:item_id>", methods=["DELETE"])
@admin_required
def delete_feedback(item_id):
    db = get_db()
    db.execute("DELETE FROM feedback_requests WHERE id = ?", (item_id,))
    db.commit()
    return jsonify({"ok": True})


# ---------------------------------------------------------------------------
# Direct Download
# ---------------------------------------------------------------------------

@app.route("/api/download/<int:paper_id>")
def download_paper(paper_id):
    db = get_db()
    cur = db.execute("SELECT filename, original_name, title FROM papers WHERE id = ?", (paper_id,))
    paper = cur.fetchone()
    if not paper:
        return jsonify({"error": "Resource not found"}), 404

    try:
        db.execute("UPDATE papers SET downloads = COALESCE(downloads, 0) + 1 WHERE id = ?", (paper_id,))
        db.commit()
    except Exception:
        pass

    file_url = paper["filename"]

    if file_url.startswith("http://") or file_url.startswith("https://"):
        if "/upload/" in file_url and "fl_attachment" not in file_url:
            file_url = file_url.replace("/upload/", "/upload/fl_attachment/")
        return redirect(file_url)

    safe_download_name = paper.get("original_name") or f"{paper['title']}.pdf"
    return send_from_directory(UPLOAD_DIR, file_url, as_attachment=True, download_name=safe_download_name)


@app.route("/uploads/<path:filename>")
def get_upload(filename):
    if filename.startswith("http://") or filename.startswith("https://"):
        return redirect(filename)
    return send_from_directory(UPLOAD_DIR, filename, as_attachment=False)


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

with app.app_context():
    init_db()

if __name__ == "__main__":
    debug_mode = os.environ.get("FLASK_DEBUG", "1") == "1"
    app.run(debug=debug_mode, port=5000)