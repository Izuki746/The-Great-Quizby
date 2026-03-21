from flask import Flask, jsonify, request, session, render_template
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import json
import re

app = Flask(__name__)
app.secret_key = "super-secret-key"

# ============================================
# DATABASE CONNECTION
# ============================================

def get_db():
    conn = sqlite3.connect("quizby.db")
    conn.row_factory = sqlite3.Row
    return conn

# 初始化数据库（如果没有表则创建）
def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # 用户表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password_hash TEXT
        )
    """)

    # 用户自建 Quiz 表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT,
            created_at TEXT,
            questions_json TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)

    conn.commit()
    conn.close()

init_db()

# ============================================
# AUTH ROUTES
# ============================================

@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"success": False, "error": "Username and password required"})

    if not re.match("^[A-Za-z0-9_]+$", username):
        return jsonify({"success": False, "error": "Username can only contain letters, numbers, and underscores"})

    if len(password) < 8:
        return jsonify({"success": False, "error": "Password must be at least 8 characters"})

    if " " in password:
        return jsonify({"success": False, "error": "Password cannot contain spaces"})

    password_hash = generate_password_hash(password)

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            (username, password_hash)
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True})

    except sqlite3.IntegrityError:
        return jsonify({"success": False, "error": "Username already exists"})


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, username, password_hash FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()

    if user and check_password_hash(user["password_hash"], password):
        session["user_id"] = user["id"]
        session["username"] = user["username"]
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "error": "Invalid credentials"})


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})


@app.route("/me")
def me():
    if "username" not in session:
        return jsonify({"logged_in": False}), 401

    return jsonify({
        "logged_in": True,
        "username": session["username"]
    })

# ============================================
# USER QUIZ CRUD (你自己创建的 Quiz)
# ============================================

@app.route("/save_quiz", methods=["POST"])
def save_quiz():
    if "user_id" not in session:
        return jsonify({"success": False, "error": "Not logged in"})

    data = request.get_json()
    name = data["name"]
    created_at = data["createdAt"]
    questions = json.dumps(data["questions"])

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO user_quizzes (user_id, name, created_at, questions_json)
        VALUES (?, ?, ?, ?)
    """, (session["user_id"], name, created_at, questions))

    conn.commit()
    conn.close()

    return jsonify({"success": True})


@app.route("/get_user_quizzes", methods=["GET"])
def get_user_quizzes():
    if "user_id" not in session:
        return jsonify([])

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, name, created_at, questions_json
        FROM user_quizzes
        WHERE user_id = ?
    """, (session["user_id"],))

    rows = cursor.fetchall()
    conn.close()

    quizzes = []
    for row in rows:
        quizzes.append({
            "id": row["id"],
            "name": row["name"],
            "createdAt": row["created_at"],
            "questions": json.loads(row["questions_json"])
        })

    return jsonify(quizzes)


@app.route("/delete_quiz", methods=["POST"])
def delete_quiz():
    if "user_id" not in session:
        return jsonify({"success": False})

    quiz_id = request.json["id"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM user_quizzes WHERE id = ? AND user_id = ?", (quiz_id, session["user_id"]))
    conn.commit()
    conn.close()

    return jsonify({"success": True})


@app.route("/update_quiz", methods=["POST"])
def update_quiz():
    if "user_id" not in session:
        return jsonify({"success": False})

    data = request.get_json()

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE user_quizzes
        SET name = ?, questions_json = ?
        WHERE id = ? AND user_id = ?
    """, (data["name"], json.dumps(data["questions"]), data["id"], session["user_id"]))

    conn.commit()
    conn.close()

    return jsonify({"success": True})


# ============================================
# STATIC PAGES
# ============================================

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/home")
def home():
    return render_template("home.html")


# ============================================
# HEALTH CHECK
# ============================================

@app.route("/health")
def health():
    return jsonify({"status": "Backend is running!"})


# ============================================
# CORS (DEV ONLY)
# ============================================

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


# ============================================
# RUN SERVER
# ============================================

if __name__ == "__main__":
    app.run(debug=True)
