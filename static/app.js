// Main Application State and Router
import { SplashView } from './SplashView.js';
import { AuthView } from './AuthView.js';
import { RegisterView } from './RegisterView.js';
import { PasswordResetView } from './PasswordResetView.js';
import { DashboardView } from './DashboardView.js';
import { CreateQuizView } from './CreateQuizView.js';
import { QuickMatchView } from './QuickMatchView.js';
import { PlayQuizView } from './PlayQuizView.js';
import { ResultsView } from './ResultsView.js';
import { ProfileView } from './ProfileView.js';
import { Layout } from './Layout.js';
import { HomeView } from './homeView.js';
import { QuizPreviewView } from './QuizPreviewView.js';   // ⭐ 新增
// ============================================
// FIREBASE AUTHENTICATION IMPORTS
// ============================================
// Import Firebase helper functions for authentication and token management
import { firebaseAuth, storeToken, clearStoredToken } from './firebase-config.js';

// App Views Enum
const AppView = {
  SPLASH: 'SPLASH',
  AUTH: 'AUTH',
  REGISTER: 'REGISTER',
  PASSWORD_RESET: 'PASSWORD_RESET',
  DASHBOARD: 'DASHBOARD',
  CREATE_QUIZ: 'CREATE_QUIZ',
  QUICK_MATCH: 'QUICK_MATCH',
  PLAY_QUIZ: 'PLAY_QUIZ',
  RESULTS: 'RESULTS',
  PROFILE: 'PROFILE',
  PREVIEW_QUIZ: 'PREVIEW_QUIZ',   // ⭐ 新增
};

// Initial User Profile
const INITIAL_USER = {
  name: "Quizby Student",
  email: "student@learning.ai",
  level: 1,
  title: "Novice Scholar",
  totalQuizzes: 0,
  avgAccuracy: 0,
  streak: 0,
  points: 0,
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
};

class QuizbyApp {
  constructor() {
    this.currentView = AppView.SPLASH;
    this.questions = [];
    this.currentConfig = null;
    this.lastResult = null;
    this.user = { ...INITIAL_USER };

    this.previewQuiz = null;        // ⭐ 用于 Preview 和 Edit
    this.editingQuizIndex = null;   // ⭐ 用于 Edit

    this.rootElement = document.getElementById('root');
    this.init();
  }

  init() {
    this.render();
    setTimeout(() => {
      this.changeView(AppView.AUTH);
    }, 3500);
  }

  changeView(view) {
    this.currentView = view;
    this.render();
  }

  // Helper function to show error messages inline
  showError(elementId, message) {
    const errorDiv = document.getElementById(elementId);
    const errorText = document.getElementById(`${elementId}-text`);
    if (errorDiv && errorText) {
      errorText.textContent = message;
      errorDiv.classList.remove('hidden');
      // Auto-hide after 5 seconds
      setTimeout(() => {
        errorDiv.classList.add('hidden');
      }, 5000);
    }
  }

  // Helper function to hide error messages
  hideError(elementId) {
    const errorDiv = document.getElementById(elementId);
    if (errorDiv) {
      errorDiv.classList.add('hidden');
    }
  }

  // Helper function to show success messages inline
  showSuccess(elementId, message) {
    const successDiv = document.getElementById(elementId);
    const successText = document.getElementById(`${elementId}-text`);
    if (successDiv && successText) {
      successText.textContent = message;
      successDiv.classList.remove('hidden');
      // Auto-hide after 5 seconds
      setTimeout(() => {
        successDiv.classList.add('hidden');
      }, 5000);
    }
  }

  // Helper function to hide success messages
  hideSuccess(elementId) {
    const successDiv = document.getElementById(elementId);
    if (successDiv) {
      successDiv.classList.add('hidden');
    }
  }

  /**
   * Handle user registration with Firebase Authentication
   * Flow: Firebase creates account → Backend stores user profile in SQLite
   * @param {string} username - User's chosen username
   * @param {string} email - User's actual email address (used for Firebase and stored in SQLite)
   * @param {string} password - User's password (Firebase requires min 6 chars)
   * @param {string} confirmPassword - Password confirmation
   */
  async handleRegister(username, email, password, confirmPassword) {
    // Hide any previous errors or success messages
    this.hideError('register-error');
    this.hideSuccess('register-success');

    // Step 1: Validate password confirmation
    if (password !== confirmPassword) {
      this.showError('register-error', 'Passwords do not match! Please try again.');
      return;
    }

    // Step 2: Validate password length
    if (password.length < 6) {
      this.showError('register-error', 'Password must be at least 6 characters long.');
      return;
    }
    
    // Step 3: Create user account in Firebase Authentication using real email
    const result = await firebaseAuth.signup(email, password);
    
    if (result.success) {
      // Step 4: Store the Firebase ID token in localStorage
      // This token will be sent with API requests to prove user identity
      storeToken(result.token);
      
      // Step 5: Send token to backend to create user profile in SQLite database
      // Backend will verify the token and store username + real email + firebase_uid
      fetch('/signup', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.token}`  // Send token for verification
        },
        body: JSON.stringify({ username, email })  // Send username and real email for SQLite storage
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          // Success - show success message and redirect to login
          this.showSuccess('register-success', '✅ Account created successfully! Redirecting to login...');
          setTimeout(() => {
            this.changeView(AppView.AUTH);
          }, 2000);
        } else {
          this.showError('register-error', data.error || 'Registration failed. Please try again.');
        }
      })
      .catch(err => {
        console.error('Profile creation error:', err);
        // Firebase account created but SQLite profile creation failed
        this.showError('register-error', 'Account created but profile setup incomplete. Please contact support.');
      });
    } else {
      // Firebase signup failed (e.g., email already exists, weak password)
      let errorMessage = result.error;
      // Make Firebase errors more user-friendly
      if (errorMessage.includes('email-already-in-use')) {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (errorMessage.includes('weak-password')) {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      }
      this.showError('register-error', errorMessage);
    }
  }

  /**
   * Handle user login with Firebase Authentication
   * Flow: Look up email by username → Firebase authenticates → Backend verifies token → Redirect to dashboard
   * @param {string} username - User's username
   * @param {string} password - User's password
   */
  async handleLogin(username, password) {
    // Hide any previous errors
    this.hideError('login-error');

    // Check if user entered email directly or username
    let email;
    if (username.includes('@')) {
      // User entered email directly
      email = username;
    } else {
      // User entered username - need to look up their email first
      try {
        const response = await fetch('/get-email-by-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
        
        const data = await response.json();
        
        if (!data.success) {
          this.showError('login-error', 'Invalid username or password. Please try again.');
          return;
        }
        
        email = data.email;
      } catch (err) {
        console.error('Email lookup error:', err);
        this.showError('login-error', 'Network error. Could not reach server. Please try again.');
        return;
      }
    }
    
    // Step 1: Authenticate with Firebase using the email
    const result = await firebaseAuth.login(email, password);
    
    if (result.success) {
      // Step 2: Store Firebase ID token in localStorage
      // This token is a JWT that proves the user is authenticated
      storeToken(result.token);
      
      // Step 3: Send token to backend for verification and to get user profile
      // Backend will verify token with Firebase Admin SDK and return user data from SQLite
      fetch('/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.token}`  // Send token for verification
        },
        body: JSON.stringify({ email, username })
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          // Step 4: Update app state with user data from backend
          if (data.user) this.user = { ...this.user, ...data.user };
          this.user.name = data.user.username || username;
          // Step 5: Automatically redirect to dashboard (no alert)
          this.changeView(AppView.DASHBOARD);
        } else {
          this.showError('login-error', data.error || 'Login failed. Please check your credentials.');
        }
      })
      .catch((err) => {
        console.error('Network error:', err);
        this.showError('login-error', 'Network error. Could not reach server. Please try again.');
      });
    } else {
      // Firebase authentication failed (wrong password, user not found, etc.)
      let errorMessage = result.error;
      // Make Firebase errors more user-friendly
      if (errorMessage.includes('user-not-found') || errorMessage.includes('invalid-credential')) {
        errorMessage = 'Invalid username or password. Please try again.';
      } else if (errorMessage.includes('wrong-password')) {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (errorMessage.includes('too-many-requests')) {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      this.showError('login-error', errorMessage);
    }
  }

  /**
   * Handle password reset request
   * Flow: Look up email by username → Send reset email via Firebase
   * @param {string} username - User's username
   */
  async handlePasswordReset(username) {
    // Hide any previous errors or success messages
    this.hideError('reset-error');
    this.hideSuccess('reset-success');

    // Check if user entered email directly or username
    let email;
    if (username.includes('@')) {
      // User entered email directly
      email = username;
    } else {
      // User entered username - need to look up their email first
      try {
        const response = await fetch('/get-email-by-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
        
        const data = await response.json();
        
        if (!data.success) {
          this.showError('reset-error', 'Username not found. Please check and try again.');
          return;
        }
        
        email = data.email;
      } catch (err) {
        console.error('Email lookup error:', err);
        this.showError('reset-error', 'Network error. Could not reach server. Please try again.');
        return;
      }
    }
    
    // Send password reset email via Firebase to the user's real email address
    const result = await firebaseAuth.resetPassword(email);
    
    if (result.success) {
      // Show success message
      this.showSuccess('reset-success', '✅ Password reset link sent! Check your email inbox.');
    } else {
      // Firebase reset failed (user not found, invalid email, etc.)
      let errorMessage = result.error;
      // Make Firebase errors more user-friendly
      if (errorMessage.includes('user-not-found')) {
        errorMessage = 'Account not found. Please check your username.';
      } else if (errorMessage.includes('invalid-email')) {
        errorMessage = 'Invalid email format. Please try again.';
      } else if (errorMessage.includes('too-many-requests')) {
        errorMessage = 'Too many reset attempts. Please try again later.';
      }
      this.showError('reset-error', errorMessage);
    }
  }

  handleQuestionsGenerated(generatedQuestions, config) {
    this.questions = generatedQuestions;
    this.currentConfig = config;
    this.changeView(AppView.PLAY_QUIZ);
  }

  handleManualQuizSave(quiz) {
    if (!this.user.quizzes) this.user.quizzes = [];

    this.user.quizzes.push({
      name: quiz.name,
      createdAt: new Date().toISOString(),
      questions: quiz.questions
    });

    this.user.totalQuizzes = this.user.quizzes.length;

    alert("Your quiz has been saved!");
    this.changeView(AppView.DASHBOARD);
  }

  handleQuizComplete(result) {
    this.lastResult = result;
    this.user.totalQuizzes += 1;
    this.user.points += result.score;
    this.user.streak = Math.max(this.user.streak, result.streak);
    this.user.level = Math.floor(this.user.points / 500) + 1;
    this.changeView(AppView.RESULTS);
  }

  /**
   * Handle user logout
   * Signs out from Firebase and clears stored token
   */
  async handleLogout() {
    // Sign out from Firebase (clears Firebase session)
    await firebaseAuth.logout();
    // Remove token from localStorage
    clearStoredToken();
    // Redirect to login screen
    this.changeView(AppView.AUTH);
  }

  render() {
    let viewContent = '';

    switch (this.currentView) {
      case AppView.SPLASH:
        viewContent = SplashView();
        break;

      case AppView.AUTH:
        viewContent = AuthView(
          (username, password) => this.handleLogin(username, password),
          () => this.changeView(AppView.REGISTER),
          () => this.changeView(AppView.PASSWORD_RESET)
        );
        break;

      case AppView.REGISTER:
        viewContent = RegisterView(
          (username, email, password, confirmPassword) => this.handleRegister(username, email, password, confirmPassword),
          () => this.changeView(AppView.AUTH)
        );
        break;

      case AppView.PASSWORD_RESET:
        viewContent = PasswordResetView(
          (username) => this.handlePasswordReset(username),
          () => this.changeView(AppView.AUTH)
        );
        break;

      case AppView.DASHBOARD:
        viewContent = DashboardView(
          (view) => this.changeView(view),
          (q, c) => this.handleQuestionsGenerated(q, c)
        );
        break;

      // 👇 加上这一段 QUICK_MATCH 的页面路由逻辑 👇
      case AppView.QUICK_MATCH:
        viewContent = QuickMatchView(
          (q, c) => this.handleQuestionsGenerated(q, c),
          () => this.changeView(AppView.DASHBOARD) // 点击 Back 时返回主页
        );
        break;
      // 👆 ========================================= 👆

      case AppView.CREATE_QUIZ:
        viewContent = CreateQuizView(
          this.previewQuiz,   // ⭐ 如果是编辑模式，这里有 quiz 数据
          (quiz) => {
            if (this.editingQuizIndex !== null) {
              // ⭐ 编辑模式：覆盖原 quiz
              this.user.quizzes[this.editingQuizIndex] = {
                ...quiz,
                createdAt: this.user.quizzes[this.editingQuizIndex].createdAt
              };
              this.editingQuizIndex = null;
              this.previewQuiz = null;
              alert("Quiz updated!");
              this.changeView(AppView.PROFILE);
            } else {
              // ⭐ 创建模式
              this.handleManualQuizSave(quiz);
            }
          },
          () => this.changeView(AppView.DASHBOARD)
        );
        break;

      case AppView.PLAY_QUIZ:
        viewContent = PlayQuizView(
          this.questions,
          this.currentConfig,
          (result) => this.handleQuizComplete(result)
        );
        break;

      case AppView.RESULTS:
        viewContent = ResultsView(this.lastResult, (v) => this.changeView(v));
        break;

      case AppView.PROFILE:
        viewContent = ProfileView(this.user);
        break;

      case AppView.PREVIEW_QUIZ:
        viewContent = QuizPreviewView(
          this.previewQuiz,
          () => this.changeView(AppView.PROFILE)
        );
        break;

      default:
        viewContent = DashboardView((v) => this.changeView(v));
    }

    if ([AppView.SPLASH, AppView.AUTH, AppView.REGISTER, AppView.PASSWORD_RESET].includes(this.currentView)) {
      this.rootElement.innerHTML = viewContent;
    } else {
      this.rootElement.innerHTML = Layout(
        viewContent,
        this.currentView,
        this.user,
        (v) => this.changeView(v),
        () => this.handleLogout()
      );
    }

    this.attachEventListeners();
  }

  attachEventListeners() {

    // ⭐ Profile → Preview
    if (this.currentView === AppView.PROFILE) {
      document.querySelectorAll("[data-quiz-index]").forEach(btn => {
        btn.addEventListener("click", () => {
          const index = btn.getAttribute("data-quiz-index");
          this.previewQuiz = this.user.quizzes[index];
          this.changeView(AppView.PREVIEW_QUIZ);
        });
      });

      // ⭐ Profile → Edit
      document.querySelectorAll("[data-edit-index]").forEach(btn => {
        btn.addEventListener("click", () => {
          const index = btn.getAttribute("data-edit-index");
          this.editingQuizIndex = index;
          this.previewQuiz = this.user.quizzes[index];
          this.changeView(AppView.CREATE_QUIZ);
        });
      });

      // ⭐ Profile → Delete
      document.querySelectorAll("[data-delete-index]").forEach(btn => {
        btn.addEventListener("click", () => {
          const index = btn.getAttribute("data-delete-index");

          const confirmDelete = confirm("Are you sure you want to delete this quiz?");
          if (!confirmDelete) return;

          this.user.quizzes.splice(index, 1);
          this.user.totalQuizzes = this.user.quizzes.length;

          this.changeView(AppView.PROFILE);
        });
      });
    }

    // ⭐ Preview → Back
    if (this.currentView === AppView.PREVIEW_QUIZ) {
      const backBtn = document.getElementById("back-btn");
      if (backBtn) backBtn.addEventListener("click", () => this.changeView(AppView.PROFILE));
    }
  }
}

export { AppView };

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.quizbyApp = new QuizbyApp();
  });
} else {
  window.quizbyApp = new QuizbyApp();
}
