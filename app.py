import os
import sqlite3
import secrets
from datetime import datetime, timedelta, timezone
from functools import wraps

from flask import (
    Flask, request, jsonify, session, send_from_directory,
    render_template, g
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
MAX_FILE_BYTES = 5 * 1024 * 1024  # 5 MB per file
ALLOWED_EXTENSIONS = {"pdf", "doc", "docx", "ppt", "pptx", "jpg", "jpeg", "png", "gif", "webp"}

# These are read from environment variables — NOT hardcoded — so nothing
# secret ever ends up inside a file that could be committed to GitHub.
ADMIN_EMAIL_DEFAULT = os.environ.get("ADMIN_EMAIL", "admin@college.edu")
ADMIN_PASSWORD_DEFAULT = os.environ.get("ADMIN_PASSWORD", "ChangeMe123!")

MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 10

SEMESTERS = list(range(1, 9))
TYPES = {
    "pyq": "Previous Year Paper",
    "mid": "Mid Term",
    "mft": "MFT",
    "ent": "End Term",
    "notes": "Notes",
    "syl": "Syllabus",
}

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", secrets.token_hex(32))
app.config["MAX_CONTENT_LENGTH"] = MAX_FILE_BYTES
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
# Only sends the session cookie over HTTPS. Set SESSION_COOKIE_SECURE=1 in
# your host's environment once you're live on HTTPS (e.g. PythonAnywhere).
# Leave it unset (defaults to off) for local http://127.0.0.1 testing.
app.config["SESSION_COOKIE_SECURE"] = os.environ.get("SESSION_COOKIE_SECURE", "0") == "1"

os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS papers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            subject TEXT NOT NULL,
            code TEXT,
            semester INTEGER NOT NULL,
            type TEXT NOT NULL,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            uploaded_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS login_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT NOT NULL,
            attempted_at TEXT NOT NULL,
            success INTEGER NOT NULL
        );
        """
    )
    # migrate older databases that predate the optional `code` column
    try:
        conn.execute("ALTER TABLE papers ADD COLUMN code TEXT")
        conn.commit()
    except sqlite3.OperationalError:
        pass  # column already exists

    # seed default admin if table empty — password is hashed immediately,
    # the plain text is never written to disk anywhere
    existing = conn.execute("SELECT COUNT(*) AS c FROM admins").fetchone()
    if existing["c"] == 0:
        conn.execute(
            "INSERT INTO admins (email, password_hash, created_at) VALUES (?, ?, ?)",
            (
                ADMIN_EMAIL_DEFAULT,
                generate_password_hash(ADMIN_PASSWORD_DEFAULT),
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        conn.commit()
        print(f"[setup] Admin account ready -> {ADMIN_EMAIL_DEFAULT}")
    conn.close()


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
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    db = get_db()
    admin = db.execute("SELECT * FROM admins WHERE email = ?", (email,)).fetchone()

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
# Papers API
# ---------------------------------------------------------------------------

@app.route("/api/papers")
def list_papers():
    semester = request.args.get("semester", type=int)
    type_ = request.args.get("type")
    q = request.args.get("q", "").strip()

    query = "SELECT * FROM papers WHERE 1=1"
    params = []

    if semester:
        query += " AND semester = ?"
        params.append(semester)
    if type_ and type_ in TYPES:
        query += " AND type = ?"
        params.append(type_)
    if q:
        query += " AND (title LIKE ? OR subject LIKE ?)"
        like = f"%{q}%"
        params.extend([like, like])

    query += " ORDER BY uploaded_at DESC"

    db = get_db()
    rows = db.execute(query, params).fetchall()
    papers = [dict(row) for row in rows]
    return jsonify({"papers": papers, "types": TYPES, "semesters": SEMESTERS})


@app.route("/api/upload", methods=["POST"])
@admin_required
def upload_paper():
    title = (request.form.get("title") or "").strip()
    subject = (request.form.get("subject") or "").strip()
    code = (request.form.get("code") or "").strip() or None
    semester = request.form.get("semester", type=int)
    type_ = request.form.get("type")
    file = request.files.get("file")

    if not title or not subject or not semester or not type_:
        return jsonify({"error": "All fields are required."}), 400
    if semester not in SEMESTERS:
        return jsonify({"error": "Invalid semester."}), 400
    if type_ not in TYPES:
        return jsonify({"error": "Invalid resource type."}), 400
    if not file or file.filename == "":
        return jsonify({"error": "A file is required."}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type."}), 400

    safe_name = secure_filename(file.filename)
    stored_name = f"{secrets.token_hex(8)}_{safe_name}"
    file.save(os.path.join(UPLOAD_DIR, stored_name))

    db = get_db()
    db.execute(
        """INSERT INTO papers (title, subject, code, semester, type, filename, original_name, uploaded_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (title, subject, code, semester, type_, stored_name, safe_name, datetime.now(timezone.utc).isoformat()),
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

    file_path = os.path.join(UPLOAD_DIR, paper["filename"])
    if os.path.exists(file_path):
        os.remove(file_path)

    db.execute("DELETE FROM papers WHERE id = ?", (paper_id,))
    db.commit()
    return jsonify({"ok": True})


@app.route("/uploads/<path:filename>")
def get_upload(filename):
    # basic path-traversal guard on top of secure_filename used at save time
    if "/" in filename or ".." in filename:
        return jsonify({"error": "Invalid filename."}), 400
    return send_from_directory(UPLOAD_DIR, filename, as_attachment=False)


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

# Runs both when started directly (`python app.py`) and when imported by a
# production server / WSGI file (e.g. on PythonAnywhere or with gunicorn),
# so the database and default admin always get set up.
init_db()

if __name__ == "__main__":
    debug_mode = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(debug=debug_mode, port=5000)