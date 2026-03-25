import sqlite3

conn = sqlite3.connect("quizby.db")
cursor = conn.cursor()

# Users table
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)       
""")

# Quizzes table
cursor.execute("""
CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT DEFAULT 'medium',
    is_public INTEGER DEFAULT 1,
    creator_id INTEGER,
    FOREIGN KEY (creator_id) REFERENCES users(id)
)
""")

# Questions table
cursor.execute("""
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
)
""")

# Attempts table (for scoring/leaderboards)
cursor.execute("""
CREATE TABLE IF NOT EXISTS attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    quiz_id INTEGER,
    score INTEGER,
    time_taken INTEGER,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
)
""")

conn.commit()
conn.close()

print("Database initialized with quiz tables")