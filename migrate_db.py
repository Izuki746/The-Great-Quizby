import sqlite3

# ============================================
# DATABASE MIGRATION SCRIPT
# ============================================
# This script adds Firebase-related columns to the existing users table
# Run this ONCE after setting up Firebase to update your database schema

def migrate_database():
    """Migrate the database to support Firebase authentication
    
    Adds two new columns to the users table:
    - firebase_uid: Stores the unique Firebase user ID (links SQLite to Firebase)
    - email: Stores the user's email address
    
    Old users (with password_hash) will still work
    New Firebase users will have firebase_uid instead of password_hash
    """
    conn = sqlite3.connect('quizby.db')
    cursor = conn.cursor()
    
    try:
        # Check which columns already exist in the users table
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Add firebase_uid column if it doesn't exist
        # This column links SQLite user profiles to Firebase accounts
        if 'firebase_uid' not in columns:
            print("➕ Adding firebase_uid column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN firebase_uid TEXT")
        else:
            print("✅ firebase_uid column already exists")
        
        # Add email column if it doesn't exist
        # Stores user email from Firebase
        if 'email' not in columns:
            print("➕ Adding email column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN email TEXT")
        else:
            print("✅ email column already exists")
        
        # Commit changes to database
        conn.commit()
        print("\n✅ Database migration completed successfully!")
        print("\n📝 NOTE: Existing users with password_hash will still work,")
        print("   but new Firebase users won't have password_hash (which is fine).")
        print("   Firebase handles authentication, SQLite only stores profiles.")
        
    except Exception as e:
        print(f"❌ Migration error: {e}")
        conn.rollback()  # Undo changes if error occurs
    finally:
        conn.close()

if __name__ == "__main__":
    # Run migration when script is executed directly
    print("🔧 Starting database migration for Firebase authentication...\n")
    migrate_database()
