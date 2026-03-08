# Firebase Authentication Setup Instructions

## 🔥 What's Been Implemented

Your app now uses Firebase Authentication for login/signup while keeping SQLite for quiz data storage.

## 📋 Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard

### 2. Enable Authentication
1. In Firebase Console, go to **Authentication** → **Get Started**
2. Click **Sign-in method** tab
3. Enable **Email/Password** provider
4. Click **Save**

### 3. Get Web App Credentials
1. In Firebase Console, click the gear icon → **Project settings**
2. Scroll to "Your apps" section
3. Click the **</>** (web) icon to add a web app
4. Register your app (name it anything, e.g., "Quizby Web")
5. Copy the `firebaseConfig` object

### 4. Update Firebase Config
Open `static/firebase-config.js` and replace the placeholder config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 5. Get Service Account Key (Backend)
1. In Firebase Console → **Project settings** → **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. **Rename it to `serviceAccountKey.json`**
5. **Save it in your project root** (same folder as app.py)
6. **⚠️ IMPORTANT: Add to .gitignore** (never commit this file!)

### 6. Install Python Dependencies
```powershell
pip install -r requirements.txt
```

### 7. Migrate Database
```powershell
python migrate_db.py
```

This adds `firebase_uid` and `email` columns to your users table.

### 8. Start Your App
```powershell
python app.py
```

## 🔒 Security Notes

1. **Never commit `serviceAccountKey.json`** - Add to `.gitignore`:
   ```
   serviceAccountKey.json
   ```

2. **Firebase Config in frontend is safe** - The web config (apiKey, etc.) is meant to be public. Security rules protect your data.

3. **Test Authentication** - Create a test account to verify everything works.

## 🎯 How It Works Now

1. **Signup**: Firebase creates user → Backend stores username in SQLite
2. **Login**: Firebase authenticates → Backend verifies token → Returns user data
3. **Sessions**: Firebase ID tokens stored in localStorage, sent with API requests
4. **Logout**: Firebase signs out → Token cleared from localStorage

## 🐛 Troubleshooting

**"Firebase Admin initialization failed"**
- Make sure `serviceAccountKey.json` is in the project root
- Check the file is valid JSON

**"No token provided"**
- Update your Firebase config in `firebase-config.js`
- Clear browser cache and try again

**"Invalid token"**
- Token might be expired, try logging in again
- Check that service account key matches your Firebase project

## 📝 Next Steps

- Test signup with a new account
- Test login with existing Firebase account
- Consider adding password reset functionality
- Add email verification (optional but recommended)

## ✅ Success Checklist

- [ ] Firebase project created
- [ ] Email/Password authentication enabled
- [ ] Web config copied to `firebase-config.js`
- [ ] `serviceAccountKey.json` downloaded and placed in root
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Database migrated (`python migrate_db.py`)
- [ ] App running without errors
- [ ] Test signup works
- [ ] Test login works
