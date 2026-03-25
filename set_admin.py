import sqlite3

conn = sqlite3.connect("quizby.db")
cursor = conn.cursor()

cursor.execute(
    "UPDATE users SET is_admin = 1 WHERE username = ?",
    ("VIRAL_ADMIN",)
)

print("rows updated:", cursor.rowcount)

conn.commit()

cursor.execute("SELECT id, username, is_admin FROM users WHERE username = ?", ("VIRAL_ADMIN",))
print(cursor.fetchone())

conn.close()