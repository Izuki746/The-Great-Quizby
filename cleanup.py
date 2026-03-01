import sqlite3

conn = sqlite3.connect("quizby.db")
cursor = conn.cursor()

cursor.execute("""
DELETE FROM users
WHERE username IS NULL
   OR TRIM(username) = ''
   OR username NOT GLOB '[A-Za-z0-9_]*'
""")

conn.commit()
conn.close()

print("Invalid users deleted successfully.")