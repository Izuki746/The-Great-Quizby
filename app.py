from flask import Flask, jsonify, request, session, render_template
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import re

app = Flask(__name__)
app.secret_key = "super-secret-key"

def get_db():
    return sqlite3.connect("quizby.db")

# ============================================
# AUTH ROUTES
# ============================================

@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    if not username or not password:
        return "Username and password required" 
    if not re.match("^[A-Za-z0-9_]+$", username):
        return jsonify({
        "success": False,
        "error": "Username can only contain letters, numbers, and underscores"
    })  
    if len(password)<8 :
        return jsonify({"success": False,"error":"Password is too short, Password must be 8 characters "})
    if " " in password:
        return jsonify({"success": False, "error":"Password cannout contain spaces, enter a valid password"})

    # Hash the password
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


@app.route("/login", methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', "").strip()
    password = data.get('password', "").strip()

    # Get user from database
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, username, password_hash FROM users WHERE username = ?",
        (username,)
    ) 

    user = cursor.fetchone()
    conn.close()
    # Check if user exists and password matches 
    if user and check_password_hash(user[2], password):
        session["user_id"] = user[0]
        session["user"] = user[1]
        return jsonify({"success": True, "eorror":"login completes"})
    else:
        return jsonify({"success": False, "error": "Invalid credentials"})


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})


@app.route("/me")
def me():
    if "user" not in session:
        return jsonify({"logged_in": False}), 401

    return jsonify({
        "logged_in": True,
        "username": session["user"]
    })

@app.route("/quizzes")
def get_quizzes():
    conn=get_db()
    cursor=conn.cursor()

    cursor.execute(
        '''SELECT id, title, description, difficulty FROM quizzes WHERE is_public=1
''')
    rows = cursor.fetchall()
    conn.close()

    quizzes = []
    for row in rows:
        quizzes.append({
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "difficulty": row[3]
        })

    return jsonify(quizzes)


@app.route("/quiz/<int:quiz_id>")    
def get_quiz(quiz_id):
    conn=get_db()
    cursor=conn.cursor()

    cursor.execute(
        ''' SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE quiz_id=?''', (quiz_id,)
    )
    rows=cursor.fetchall()
    conn.close()

    questions=[]
    for row in rows:
        questions.append({
            'id': row[0],
            "question": row[0],
            "options": [row[1], row[2], row[3], row[4]],
            "correctAnswer": row[5]
        })
    return jsonify({
    "success": True,
    "questions": questions
    })




# ============================================
# PAGE ROUTES
# ============================================

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/home")
def home():
    return render_template("home.html")


# ============================================
# UTILITY ROUTES
# ============================================

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "Backend is running!"})


# ============================================
# CORS HEADERS (for development)
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