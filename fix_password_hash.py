import sqlite3

# ============================================
# FIX PASSWORD_HASH CONSTRAINT
# ============================================
# Make password_hash nullable so Firebase users don't need it

def fix_password_hash_constraint():
    """Make password_hash column nullable for Firebase users"""
    conn = sqlite3.connect('quizby.db')
    cursor = conn.cursor()
    
    try:
        print("🔧 Fixing password_hash constraint...\n")
        
        # SQLite doesn't support ALTER COLUMN directly
        # We need to recreate the table without the NOT NULL constraint
        
        # Step 1: Get current table structure
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        print("📋 Current table structure:")
        for col in columns:
            print(f"   - {col[1]}: {col[2]} {'NOT NULL' if col[3] else 'NULL'}")
        
        # Step 2: Create new table with nullable password_hash
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT,
                firebase_uid TEXT,
                email TEXT
            )
        ''')
        
        # Step 3: Copy data from old table to new table
        cursor.execute('''
            INSERT INTO users_new (id, username, password_hash, firebase_uid, email)
            SELECT id, username, password_hash, firebase_uid, email
            FROM users
        ''')
        
        # Step 4: Drop old table
        cursor.execute('DROP TABLE users')
        
        # Step 5: Rename new table to users
        cursor.execute('ALTER TABLE users_new RENAME TO users')
        
        conn.commit()
        print("\n✅ Successfully fixed password_hash constraint!")
        print("   password_hash is now nullable (Firebase users don't need it)")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    fix_password_hash_constraint()
