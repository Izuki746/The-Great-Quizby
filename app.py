from flask import Flask, jsonify, request, session, render_template
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import re
# ============================================
# FIREBASE ADMIN SDK IMPORTS
# ============================================
# Firebase Admin SDK allows backend to verify Firebase ID tokens
# and interact with Firebase services securely
import firebase_admin
from firebase_admin import credentials, auth
from functools import wraps

app = Flask(__name__)
app.secret_key = "super-secret-key"

# ============================================
# FIREBASE ADMIN SDK INITIALIZATION
# ============================================
# Initialize Firebase Admin SDK with service account credentials
# This allows the backend to verify Firebase ID tokens sent from the frontend
# TODO: Download your serviceAccountKey.json from Firebase Console
# Path: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
# Save the file as 'serviceAccountKey.json' in the project root directory
try:
    # Load service account credentials from JSON file
    cred = credentials.Certificate('serviceAccountKey.json')
    # Initialize Firebase Admin SDK
    firebase_admin.initialize_app(cred)
    print("✅ Firebase Admin initialized successfully")
except Exception as e:
    # If initialization fails, app will still run but auth won't work
    print(f"⚠️ Warning: Firebase Admin initialization failed: {e}")
    print("App will run but authentication won't work until you add serviceAccountKey.json")

def get_db():
    return sqlite3.connect("quizby.db")

# ============================================
# FIREBASE TOKEN VERIFICATION DECORATOR
# ============================================
# This decorator verifies Firebase ID tokens on protected routes
# It extracts the token from the Authorization header and verifies it with Firebase
def verify_firebase_token(f):
    """Decorator to verify Firebase ID token from Authorization header"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Step 1: Extract token from Authorization header
        # Expected format: "Authorization: Bearer <token>"
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                # Remove "Bearer " prefix to get the actual token
                token = auth_header.split(' ')[1]
        
        # Step 2: Return error if no token provided
        if not token:
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        try:
            # Step 3: Verify the token with Firebase Admin SDK
            # This checks:
            # - Token signature is valid
            # - Token hasn't expired
            # - Token was issued by your Firebase project
            decoded_token = auth.verify_id_token(token)
            
            # Step 4: Attach decoded token data to request object
            # Contains: uid, email, email_verified, etc.
            request.firebase_user = decoded_token
            
            # Step 5: Call the original route function
            return f(*args, **kwargs)
        except Exception as e:
            # Token verification failed (invalid, expired, or tampered)
            return jsonify({'success': False, 'error': f'Invalid token: {str(e)}'}), 401
    
    return decorated_function

# ============================================
# AUTH ROUTES
# ============================================

# ============================================
# AUTH ROUTES (FIREBASE)
# ============================================

@app.route("/signup", methods=["POST"])
@verify_firebase_token  # This decorator verifies the Firebase token before executing the route
def signup():
    """Create user profile in SQLite after Firebase account creation
    
    Flow:
    1. Frontend creates Firebase account with real email and gets ID token
    2. Frontend sends token + username + email to this route
    3. Backend verifies token (done by decorator)
    4. Backend stores user profile in SQLite with firebase_uid and real email
    """
    data = request.get_json()
    username = data.get("username", "").strip()
    email = data.get("email", "").strip()
    
    # Extract Firebase user info from verified token
    # The decorator already verified this token is valid
    firebase_uid = request.firebase_user.get('uid')      # Unique Firebase user ID
    firebase_email = request.firebase_user.get('email')  # Real email from Firebase
    
    # Validate username
    if not username:
        return jsonify({"success": False, "error": "Username required"})
    
    if not re.match("^[A-Za-z0-9_]+$", username):
        return jsonify({
            "success": False,
            "error": "Username can only contain letters, numbers, and underscores"
        })

    conn = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Store user profile in SQLite database with Firebase UID and real email
        # firebase_uid links SQLite profile to Firebase account
        # email is the user's real email (from Firebase token or request body)
        # Note: We don't store password_hash because Firebase handles authentication
        cursor.execute(
            "INSERT INTO users (username, firebase_uid, email, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
            (username, firebase_uid, firebase_email or email)
        )

        conn.commit()
        return jsonify({"success": True, "message": "Profile created"})

    except sqlite3.IntegrityError as e:
        if conn:
            conn.rollback()
        print("IntegrityError during signup:", e)
        return jsonify({"success": False, "error": str(e)})
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"success": False, "error": str(e)})
    finally:
        if conn:
            conn.close()

@app.route("/debug-users")
def debug_users():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()

    conn.close()
    return jsonify(rows)

@app.route("/login", methods=['POST'])
@verify_firebase_token  # Verifies Firebase token before executing
def login():
    """Verify Firebase authentication and return user profile from SQLite
    
    Flow:
    1. Frontend authenticates with Firebase and gets ID token
    2. Frontend sends token + username/email to this route
    3. Backend verifies token (done by decorator)
    4. Backend retrieves or creates user profile from SQLite
    5. Backend returns user data to frontend
    """
    data = request.get_json()
    username = data.get('username', "").strip()
    email = data.get('email', "").strip()
    
    # Extract Firebase user info from verified token
    firebase_uid = request.firebase_user.get('uid')      # Unique Firebase user ID
    firebase_email = request.firebase_user.get('email')  # Email from Firebase

    conn = None
    try:
        # Look up user profile in SQLite database using Firebase UID
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id, username, is_admin, created_at FROM users WHERE firebase_uid = ?",
            (firebase_uid,)
        )

        user = cursor.fetchone()
        
        # If user doesn't exist in SQLite, create profile automatically
        # This handles the case where user was created in Firebase but not in SQLite
        if not user:
            # Use username if provided, otherwise extract from email
            default_username = username or (email or firebase_email).split('@')[0]
            
            cursor.execute(
                "INSERT INTO users (username, firebase_uid, email, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
                (default_username, firebase_uid, firebase_email or email)
            )
            conn.commit()
            
            user_id = cursor.lastrowid  # Get ID of newly created user
            username_db = default_username
            created_at="just now"
            is_admin=0
        else:
            # User exists, use data from database
            user_id = user[0]
            username_db = user[1]
            created_at = user[3]
            is_admin = user[2]
        
        # Store in Flask session for compatibility with existing code
        # Session data is stored server-side (encrypted cookie)
        session["user_id"] = user_id
        session["user"] = username_db
        session["created_at"] = created_at
        
        # Return success with user data
        return jsonify({
            "success": True, 
            "user": {"id": user_id, "username": username_db, "created_at": created_at, "is_admin": is_admin}
        })
    
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"success": False, "error": str(e)})
    finally:
        if conn:
            conn.close()


@app.route("/get-email-by-username", methods=['POST'])
def get_email_by_username():
    """Look up user's email address by username
    
    This is used for login and password reset flows where user enters username
    but Firebase needs the actual email address to authenticate.
    """
    data = request.get_json()
    username = data.get('username', "").strip()
    
    if not username:
        return jsonify({"success": False, "error": "Username required"})
    
    conn = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Look up email by username in SQLite database
        cursor.execute(
            "SELECT email FROM users WHERE username = ?",
            (username,)
        )
        
        user = cursor.fetchone()
        
        if not user:
            # Username not found - return generic error for security
            # Don't reveal whether username exists or not
            return jsonify({"success": False, "error": "Invalid credentials"})
        
        email = user[0]
        
        if not email:
            return jsonify({"success": False, "error": "No email associated with this account"})
        
        return jsonify({"success": True, "email": email})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    finally:
        if conn:
            conn.close()


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})


@app.route("/me")
@verify_firebase_token
def me():
    firebase_uid=request.firebase_user.get('uid')
    conn=get_db()
    cursor=conn.cursor()
    cursor.execute(
        '''SELECT id, username, created_at, is_admin FROM users WHERE firebase_uid=?''',(firebase_uid,)
    )
    user=cursor.fetchone()
    conn.close()
    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404

    return jsonify({
    "success": True,
    "user": {
        "id": user[0],
        "username": user[1],
        "created_at": user[2],
        "is_admin": user[3]
    }
})

@app.route("/quizzes")
def get_quizzes():
    conn=get_db()
    cursor=conn.cursor()

    cursor.execute(
        '''SELECT id, title, description, difficulty, is_official FROM quizzes WHERE is_public=1''')
    rows = cursor.fetchall()
    conn.close()

    quizzes = []
    for row in rows:
        quizzes.append({
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "difficulty": row[3],
            "is_official": row[4]
        })

    return jsonify({
        "success":True,
        "quizzes":quizzes
    })


@app.route("/quiz/<int:quiz_id>")  
@verify_firebase_token  
def get_quiz(quiz_id):
    firebase_uid=request.firebase_user.get('uid')
    conn=get_db()
    cursor=conn.cursor()
    cursor.execute(
        '''SELECT id, is_admin FROM users WHERE firebase_uid=?''',(firebase_uid, )
    )
    user=cursor.fetchone()
    if not user:
        conn.close()
        return jsonify({"success": False, "error": "User not found"}), 404
    user_id=user[0]
    is_admin=user[1]
    cursor.execute(
        '''SELECT id, creator_id, is_public, is_official FROM quizzes WHERE id = ?''',(quiz_id, )
    )
    quiz=cursor.fetchone()
    if not quiz:
        conn.close()
        return jsonify({"success": False, "error": "Quiz not found"}), 404
    is_official=quiz[3]
    creator_id=quiz[1]
    is_public=quiz[2]
    can_view = (
    (is_public == 1) or
    (creator_id == user_id) or
    (is_admin == 1)
    )
    if not can_view:
        conn.close()
        return jsonify({"success": False, "error": "Unauthorized"}), 403
    cursor.execute(
        ''' SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE quiz_id=?''', (quiz_id,)
    )
    rows=cursor.fetchall()
    conn.close()

    questions=[]
    for row in rows:
        questions.append({
            'id': row[0],
            "question": row[1],
            "options": [row[2], row[3], row[4], row[5]],
           # "correctAnswer": row[6]
        })
    return jsonify({
    "success": True,
    "questions": questions
    })

@app.route("/submit-quiz/<int:quiz_id>", methods=["POST"])
@verify_firebase_token
def submit_quiz(quiz_id):
    firebase_uid=request.firebase_user.get('uid')
    data=request.get_json()
    conn=get_db()
    cursor=conn.cursor()
    cursor.execute(
            '''SELECT id, is_admin FROM users WHERE firebase_uid=?''',(firebase_uid, )
        )
    user=cursor.fetchone()
    if not user:
        conn.close()
        return jsonify({"success": False, "error": "User not found"}), 404
    user_id=user[0]
    is_admin=user[1]
    cursor.execute(
        '''SELECT id, correct_answer from questions where quiz_id=?''',
        (quiz_id, )
    )
    
    rows=cursor.fetchall()
    
    correct_answers={}
    for row in rows:
        question_id=row[0]
        correct_answer=row[1]
        correct_answers[question_id]=correct_answer
    time_taken=data.get('time_taken', 0)    
    answers=data.get("answers", []) 
    correct_count=0
    for answer in answers:
        question_id = answer.get("question_id")
        selected = answer.get("selected")  
        if selected==correct_answers.get(question_id):
            correct_count+=1
    base_score = correct_count * 100
    max_time = len(correct_answers) * 2000
    speed_bonus = max(0, max_time - time_taken*30)
    score = base_score + speed_bonus
    cursor.execute(
        '''INSERT INTO  attempts (user_id, quiz_id, score, time_taken) VALUES (?, ?, ?, ?)''', (user_id, quiz_id, score, time_taken)
    )
    conn.commit()
    conn.close()
    return jsonify({
        "score": score,
        "success": True,
        "totalQuestions":len(correct_answers),
        "correctAnswers": correct_count 
    })    
@app.route("/create-quiz", methods=["POST"])   
@verify_firebase_token 
def create_quiz():
    firebase_uid = request.firebase_user.get('uid')
    data=request.get_json()
    conn=get_db()
    cursor=conn.cursor()
    cursor.execute(
        '''SELECT id, is_admin FROM users where firebase_uid=?''',(firebase_uid,)
    )
    user=cursor.fetchone()
    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404
    user_id=user[0]
    is_admin=user[1]
    is_official=1 if is_admin else 0
    cursor.execute(
        "INSERT INTO quizzes (title, difficulty, is_public, creator_id, is_official) VALUES (?, ?, ?, ?, ?)",
        (data['name'], data['difficulty'], data['isPublic'], user_id, is_official)
    )
    quiz_id=cursor.lastrowid
    for q in data['questions']:
        correct_letter=chr(97+q['answer'])
        cursor.execute(
            '''INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES (?, ?, ?, ?, ?, ?, ?)'''
            ,(quiz_id, q['question'], q['options'][0], q['options'][1], q['options'][2], q['options'][3], correct_letter)
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True, "quiz_id": quiz_id})

@app.route("/my-quizzes", methods=['GET'])
@verify_firebase_token
def my_quizzes():
    quizzes=[]
    conn=get_db()
    firebase_uid = request.firebase_user.get('uid')
    cursor=conn.cursor()
    cursor.execute(
        '''SELECT id FROM users where firebase_uid=?''',(firebase_uid,)
    )
    user=cursor.fetchone()
    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404
    user_id=user[0]
    cursor.execute(
        '''SELECT id, title, difficulty FROM quizzes where creator_id=?''', (user_id,)
    )
    rows=cursor.fetchall()
    for row in rows:
        quizzes.append({
            'id':row[0],
            'title':row[1],
            'difficulty': row[2]
        })
    conn.close()    
    return jsonify(quizzes)

@app.route("/delete-quiz/<int:quiz_id>", methods=['POST'])
@verify_firebase_token
def delete_quiz(quiz_id):
    conn=get_db()
    firebase_uid = request.firebase_user.get('uid')
    cursor=conn.cursor()
    cursor.execute(
        '''SELECT id, is_admin FROM users where firebase_uid=?''',(firebase_uid,)
    )
    user=cursor.fetchone()
    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404
    user_id=user[0]
    is_admin=user[1]
    cursor.execute(
        "SELECT id, is_official, creator_id FROM quizzes WHERE id = ? ",
        (quiz_id, )
    )
    quiz = cursor.fetchone()
    if not quiz:
        conn.close()
        return jsonify({"success": False, "error": "Quiz not found"}), 404
    is_official=quiz[1]
    creator_id=quiz[2]

    can_edit=( (is_admin==1 and is_official==1) or (creator_id==user_id and is_official==0))
    if not can_edit:
        conn.close()
        return jsonify({ 'success': False, 'error': "Unauthorized"}), 403    
    cursor.execute("DELETE FROM questions WHERE quiz_id = ?", (quiz_id,))
    if is_admin == 1:
        cursor.execute("DELETE FROM quizzes WHERE id = ?", (quiz_id,))
    else:
        cursor.execute("DELETE FROM quizzes WHERE id = ? AND creator_id = ?", (quiz_id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Quiz deleted"})


@app.route("/edit-quiz/<int:quiz_id>", methods=['GET'])   
@verify_firebase_token 
def edit_quiz(quiz_id):
    conn=get_db()
    firebase_uid = request.firebase_user.get('uid')
    cursor=conn.cursor()
    cursor.execute(
        '''SELECT id, is_admin FROM users where firebase_uid=?''',(firebase_uid,)
    )
    user=cursor.fetchone()
    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404
    user_id=user[0]
    is_admin=user[1]
    cursor.execute(
        "SELECT id,is_official, creator_id FROM quizzes WHERE id = ? ",
        (quiz_id, )
    )
    quiz = cursor.fetchone()
    if not quiz:
        conn.close()
        return jsonify({"success": False, "error": "Quiz not found"}), 404
    is_official=quiz[1]
    creator_id=quiz[2]
    can_edit=( (is_admin==1 and is_official==1) or (creator_id==user_id and is_official==0))
    if not can_edit:
        conn.close()
        return jsonify({ 'success': False, 'error': "Unauthorized"}), 403
    cursor.execute(
        ''' SELECT id, question_text, option_a, option_b, option_c, option_d, correct_answer FROM questions WHERE quiz_id=?''', (quiz_id,)
    )
    rows=cursor.fetchall()
    conn.close()

    questions=[]
    for row in rows:
        questions.append({
            'id': row[0],
            "question": row[1],
            "options": [row[2], row[3], row[4], row[5]],
           "answer": ord(row[6])-ord('a')
        })
    return jsonify({
    "success": True,
    "questions": questions
    })

@app.route("/update-quiz/<int:quiz_id>", methods=['POST'])
@verify_firebase_token 
def update_quiz(quiz_id):
    conn=get_db()
    data=request.get_json()
    firebase_uid = request.firebase_user.get('uid')
    cursor=conn.cursor()
    cursor.execute(
        '''SELECT id, is_admin FROM users where firebase_uid=?''',(firebase_uid,)
    )
    user=cursor.fetchone()
    if not user:
        conn.close()
        return jsonify({"success": False, "error": "User not found"}), 404
    user_id=user[0]
    is_admin=user[1]
    cursor.execute(
        "SELECT id, is_official, creator_id FROM quizzes WHERE id = ? ",
        (quiz_id, )
    )
    quiz = cursor.fetchone()
    if not quiz:
        conn.close()
        return jsonify({"success": False, "error": "Quiz not found"}), 404
    is_official=quiz[1]
    creator_id=quiz[2]
    can_edit=( (is_admin==1 and is_official==1) or (creator_id==user_id and is_official==0))
    if not can_edit:
        conn.close()
        return jsonify({ 'success': False, 'error': "Unauthorized"}), 403
    cursor.execute(
        '''UPDATE quizzes
        SET title=?
        , difficulty=?
        , is_public=?
          WHERE id=?  ''', (data['name'], data['difficulty'], data.get('isPublic', 1), quiz_id, )
    )
    cursor.execute(
        '''DELETE FROM questions WHERE quiz_id=?''', (quiz_id, )
    )
    for q in data['questions']:
        correct_letter= chr(97+q['answer'])
        cursor.execute(
            '''INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES (?,?,?,?,?,?,?)''',
            (quiz_id, 
             q['question'],
            q['options'][0],
            q['options'][1],
            q['options'][2],
            q['options'][3],
            correct_letter)
        )

    conn.commit()
    conn.close()
    return jsonify({'success':True, 'message':"Quiz updated"})


@app.route('/leaderboard/<int:quiz_id>', methods=['GET'])
def leaderboard_update(quiz_id):
    conn=get_db()
    cursor=conn.cursor()
    cursor.execute(
        '''
        SELECT users.username, attempts.score, attempts.time_taken, attempts.completed_at
        FROM attempts
        JOIN users ON attempts.user_id = users.id
        WHERE attempts.quiz_id = ?
        ORDER BY attempts.score DESC, attempts.time_taken ASC, attempts.completed_at ASC
        LIMIT 10
        ''',
        (quiz_id,)
    )
    rows=cursor.fetchall()
    conn.close()
    entries=[]
    for row in rows:
        entries.append({
            "username":row[0],
            "score":row[1],
            "time_taken": row[2],
            "completed_at": row[3]
        })
    return jsonify({
        "success":True,
        "entries": entries
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
    """Add CORS headers to allow frontend to make requests from different origin"""
    response.headers["Access-Control-Allow-Origin"] = "*"  # Allow all origins (restrict in production)
    # Allow Content-Type and Authorization headers (Authorization needed for Firebase tokens)
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"  # Allowed HTTP methods
    return response


# ============================================
# RUN SERVER
# ============================================

if __name__ == "__main__":
    app.run(debug=True)





# 123454 : username
# 123456789 : password
