import sqlite3

conn = sqlite3.connect("quizby.db")
cursor = conn.cursor()

# Add a sample quiz
cursor.execute("""
INSERT INTO quizzes (title, description, difficulty, is_public, creator_id)
VALUES ('Python Basics', 'Test your Python knowledge!', 'easy', 1, 1)
""")

quiz_id = cursor.lastrowid

# Add questions for this quiz
questions = [
    {
        "text": "What is the output of print(2 + 2)?",
        "a": "3",
        "b": "4",
        "c": "22",
        "d": "Error",
        "correct": "b"
    },
    {
        "text": "Which keyword is used to define a function in Python?",
        "a": "function",
        "b": "def",
        "c": "func",
        "d": "define",
        "correct": "b"
    },
    {
        "text": "What does 'len([1, 2, 3])' return?",
        "a": "1",
        "b": "2",
        "c": "3",
        "d": "6",
        "correct": "c"
    }
]

for q in questions:
    cursor.execute("""
        INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (quiz_id, q["text"], q["a"], q["b"], q["c"], q["d"], q["correct"]))

conn.commit()
conn.close()

print("Sample quiz added!")
print(f"Quiz ID: {quiz_id}")
print(f"Questions added: {len(questions)}")