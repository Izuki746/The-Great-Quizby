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
            "INSERT INTO users (username, firebase_uid, email) VALUES (?, ?, ?)",
            (username, firebase_uid, firebase_email or email)
        )

        conn.commit()
        return jsonify({"success": True, "message": "Profile created"})

    except sqlite3.IntegrityError:
        # Username already exists in database
        if conn:
            conn.rollback()
        return jsonify({"success": False, "error": "Username already exists"})
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"success": False, "error": str(e)})
    finally:
        if conn:
            conn.close()


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
            "SELECT id, username FROM users WHERE firebase_uid = ?",
            (firebase_uid,)
        )

        user = cursor.fetchone()
        
        # If user doesn't exist in SQLite, create profile automatically
        # This handles the case where user was created in Firebase but not in SQLite
        if not user:
            # Use username if provided, otherwise extract from email
            default_username = username or (email or firebase_email).split('@')[0]
            
            cursor.execute(
                "INSERT INTO users (username, firebase_uid, email) VALUES (?, ?, ?)",
                (default_username, firebase_uid, firebase_email or email)
            )
            conn.commit()
            
            user_id = cursor.lastrowid  # Get ID of newly created user
            username_db = default_username
        else:
            # User exists, use data from database
            user_id = user[0]
            username_db = user[1]
        
        # Store in Flask session for compatibility with existing code
        # Session data is stored server-side (encrypted cookie)
        session["user_id"] = user_id
        session["user"] = username_db
        
        # Return success with user data
        return jsonify({
            "success": True, 
            "user": {"id": user_id, "username": username_db}
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