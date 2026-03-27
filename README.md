# The Great Quizby

A full-stack quiz web application where users can create, play, and track quiz performance.

---

## Features

* User authentication (Firebase)
* Create and manage quizzes
* Play quizzes with timer
* Score calculation and accuracy tracking
* Detailed results breakdown
* Leaderboard system

---

## Tech Stack

**Frontend**

* Vanilla JavaScript
* HTML/CSS

**Backend**

* Python (Flask)
* SQLite

**Authentication**

* Firebase Authentication

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd quizby
```

---

### 2. Install Python dependencies

Make sure Python is installed (Python 3 recommended), then run:

```bash
pip install flask firebase-admin
```

---

### 3. Set up Firebase

1. Go to Firebase Console
2. Create a project
3. Enable **Email/Password Authentication**
4. Go to **Project Settings → Service Accounts**
5. Click **Generate New Private Key**
6. Download the JSON file

Place it in your project root as:

```
serviceAccountKey.json
```

---

### 4. Initialize the database

Run:

```bash
python init_db.py
```

(Optional)

```bash
python migrate_db.py
```

---

### 5. Run the backend

```bash
python app.py
```

Backend will run at:

```
http://127.0.0.1:5000
```

---

### 6. Run the frontend

You have two options:

**Option 1: Open directly**

* Open `index.html` in your browser

**Option 2 (recommended): Use a local server**

```bash
python -m http.server 8000
```

Then open:

```
http://localhost:8000
```

---

## Authentication Flow

* Frontend logs in via Firebase
* Firebase returns an ID token
* Token is stored in localStorage
* Backend verifies token using Firebase Admin SDK
* User data is stored in SQLite

---

## Quiz Flow

1. User fetches quiz (questions only, no answers)
2. User submits answers
3. Backend:

   * checks answers
   * calculates score
   * returns breakdown
4. Frontend displays results

---

## Notes

* Correct answers are not exposed in the quiz-fetch route
* Answers are only returned after submission
* Do not commit `serviceAccountKey.json` to version control

---

## Future Improvements

* UI improvements and animations
* Multiplayer or real-time quizzes
* Enhanced leaderboard system
* Mobile responsiveness

---

## Author

Viral Chandiramani
