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
import { QuizPreviewView } from './QuizPreviewView.js';   // New added
import { LeaderboardView } from './LeaderboardView.js';
import { LeaderboardDetailView } from './LeaderboardDetailView.js'; 
// ============================================
// FIREBASE AUTHENTICATION IMPORTS
// ============================================
// Import Firebase helper functions for authentication and token management
import { firebaseAuth, storeToken, clearStoredToken, getStoredToken } from './firebase-config.js';

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
  PREVIEW_QUIZ: 'PREVIEW_QUIZ',   // New added
  LEADERBOARD:'LEADERBOARD',
  LEADERBOARD_DETAIL:'LEADERBOARD_DETAIL'
};

// Initial User Profile
const INITIAL_USER = {
  name: "",
  email: "",
  level: 1,
  title: "Novice Scholar",
  totalQuizzes: 0,
  avgAccuracy: 0,
  points: 0,
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  quizzes: [],
  quizHistory: [] // New added：For record all quizzes user done
};

class QuizbyApp {
  constructor() {
    this.currentView = AppView.SPLASH;
    this.questions = [];
    this.currentConfig = null;
    this.lastResult = null;
    this.user = { ...INITIAL_USER };
    this.myQuizzes=[];
    this.availableQuizzes=[];
    this.previewQuiz = null;        // For Preview and Edit
    this.editingQuizId = null;   // For Edit
    this.leaderboardEntries = [];
    this.currentLeaderboardQuizId = null;
    this.currentLeaderboardQuizTitle = '';

    this.rootElement = document.getElementById('root');
    this.init();
  }

  init() {
    this.render();
    setTimeout(async () => {
      const token= getStoredToken();
      if(token){
        const response=await fetch('/me', {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
        const data=await response.json();   
        if (data.success){
          this.user = { ...this.user, ...data.user } 
          this.username=data.user.username
          await this.fetchAvailableQuizzes()
          await this.fetchMyQuizzes()
          this.changeView(AppView.DASHBOARD)
        }
        else{
          clearStoredToken()
          this.changeView(AppView.AUTH)
        }
      
      }
      else{
        this.changeView(AppView.AUTH)
      }
    }, 3500);
  }

  async changeView(view) {
    if (view === AppView.CREATE_QUIZ && this.currentView !== AppView.PROFILE || view === AppView.LEADERBOARD) {
    this.previewQuiz = null;
    this.editingQuizId = null;
  }
    if(view==AppView.QUICK_MATCH || view==AppView.PROFILE){
      await this.fetchAvailableQuizzes()
      await this.fetchMyQuizzes()
      console.log("myQuizzes:", this.myQuizzes);
    }
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
  async fetchAvailableQuizzes(){
    const token=getStoredToken()
    const response=await fetch("/quizzes", {
      method:'GET',
      headers:{
        'Content-Type':'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    const data=await response.json();
    if (data.success){
      this.availableQuizzes=data.quizzes;
    } else{
      this.availableQuizzes=[];
    }

  }

  async fetchLeaderboard(quizId) {
    try {
      const response = await fetch(`/leaderboard/${quizId}`);
      const data = await response.json();

      if (data.success) {
        this.leaderboardEntries = Array.isArray(data.entries) ? data.entries : [];
      } else {
        this.leaderboardEntries = [];
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      this.leaderboardEntries = [];
    }
  }

  async handleOpenLeaderboard(quizId, quizTitle) {
  this.currentLeaderboardQuizId = quizId;
  this.currentLeaderboardQuizTitle = quizTitle || 'Quiz Leaderboard';
  await this.fetchLeaderboard(quizId);
  this.changeView(AppView.LEADERBOARD_DETAIL);
}

  // handleQuestionsGenerated(generatedQuestions, config) {
  //   this.questions = generatedQuestions;
  //   this.currentConfig = config;
  //   this.changeView(AppView.PLAY_QUIZ);
  // }

  async handleManualQuizSave(quiz) {
    const token=getStoredToken();
    const response = await fetch ('/create-quiz',{
      method:'POST',
      headers:{
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(quiz)
    })
    const data = await response.json();

    if (data.success) {
    await this.fetchMyQuizzes();  
    this.user.totalQuizzes = this.myQuizzes.length;

    alert("Your quiz has been saved!");
    this.changeView(AppView.DASHBOARD);
  } else{
    alert("Failed to save quiz: " + data.error);
  }
  }

 async fetchMyQuizzes() {
  const token = await firebaseAuth.getIdToken();
  console.log("token:", token);

  const response = await fetch('/my-quizzes', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();
  console.log("result:", result);
  this.myQuizzes = Array.isArray(result) ? result : [];
}

// -----------------------------
  // QUIZ COMPLETE
  // -----------------------------
  handleQuizComplete(result) {
    this.lastResult = result;
    this.user.points += result.score;
    
    // record test history
    if (!this.user.quizHistory) this.user.quizHistory = [];
    this.user.quizHistory.push(result);
    
    // dynamic calculate average accuracy
    let totalCorrect = 0;
    let totalQuestions = 0;
    this.user.quizHistory.forEach(r => {
      totalCorrect += r.correctAnswers;
      totalQuestions += r.totalQuestions;
    });
    
    this.user.avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    
    this.changeView(AppView.RESULTS);
  }

    // -----------------------------
  // MATCH START (QUICK MATCH)
  // -----------------------------
  handleQuestionsGenerated(questions, config) {
    this.questions = questions;
    this.currentConfig = config;
    this.changeView(AppView.PLAY_QUIZ);
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

  async handlePlayUserquiz(quizId, quizTitle){
    const token = getStoredToken();
    const response = await fetch(`/quiz/${quizId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data= await response.json();
    if (data.success) {
      this.questions = data.questions
      console.log("QUESTIONS:", this.questions);
      if (!this.questions || this.questions.length === 0) {
        alert("No questions found");
        return;
    }
    this.previewQuiz = null;
    this.editingQuizId = null;
    this.currentConfig={quizId: quizId, title:quizTitle}  
    this.changeView(AppView.PLAY_QUIZ)
    }
  }

  async handlePreviewQuiz(quizId){
    const response =  await fetch(`/quiz/${quizId}`);
    const data =await response.json();
    
    if (!data.success) {
      alert("Failed to load quiz preview");
      return;
    }
    const quizSummary = this.myQuizzes.find(q => q.id === quizId);
    if (!quizSummary) {
      alert("Failed to load quiz preview");
      return;
    }

    if (!data.questions || data.questions.length === 0) {
      alert("No questions found");
      return;
    }
      this.previewQuiz={
      id:quizId,
      name:quizSummary.title,
      difficulty:quizSummary.difficulty,
      questions:data.questions
    }
    
      //this.currentConfig={quizId:quizId}
      this.changeView(AppView.PREVIEW_QUIZ)
    
  }

  async handleEditQuiz(quizId){
    const token = getStoredToken();
    const response =  await fetch(`/edit-quiz/${quizId}`,{
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
    const data =await response.json();

    if (!data.success) {
      alert("Failed to load quiz ");
      return;
    }
    const quizSummary = this.myQuizzes.find(q => q.id === quizId);
    
    if (!quizSummary) {
      alert("Failed to load quiz ");
      return;
    }

    if (!data.questions || data.questions.length === 0) {
      alert("No questions found");
      return;
    }
    this.editingQuizId=quizId
    this.previewQuiz={
      id:quizId,
      name:quizSummary.title,
      difficulty:quizSummary.difficulty,
      questions:data.questions
    }

    this.changeView(AppView.CREATE_QUIZ)

  }


  async handleUpdateQuiz(quizId, quiz){
    const token = getStoredToken();
    const response =  await fetch(`/update-quiz/${quizId}`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(quiz)
  });
    const data =await response.json();

    if (!data.success) {
      alert("Failed to update quiz: " + (data.error || "Unknown error"));
      return;
    }

    this.editingQuizId = null;
    this.previewQuiz = null;
    alert("Quiz updated!");
    this.changeView(AppView.PROFILE);

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

      case AppView.LEADERBOARD:
        viewContent = LeaderboardView(this.availableQuizzes);
        break;

      case AppView.LEADERBOARD_DETAIL:
        viewContent = LeaderboardDetailView(
          this.currentLeaderboardQuizTitle,
          this.leaderboardEntries
        );
        break;  

      // 👇 加上这一段 QUICK_MATCH 的页面路由逻辑 👇
      case AppView.QUICK_MATCH:
        
        viewContent = QuickMatchView(
          this.myQuizzes, this.availableQuizzes,
          (q, c) => this.handleQuestionsGenerated(q, c),
          (quizId, quizTitle) => this.handlePlayUserquiz(quizId, quizTitle),
          () => this.changeView(AppView.DASHBOARD) // 点击 Back 时返回主页
        );
        break;
      // 👆 ========================================= 👆

        case AppView.CREATE_QUIZ:
          viewContent = CreateQuizView(
            this.previewQuiz,
            (quiz) => {
              if (this.editingQuizId !== null) {
                this.handleUpdateQuiz(this.editingQuizId, quiz);
              } else {
                this.handleManualQuizSave(quiz);
              }
            },
            () => {
              this.previewQuiz = null;
              this.editingQuizId = null;
              this.changeView(AppView.DASHBOARD);
            }
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
        viewContent = ResultsView(
          this.lastResult,
          (v) => this.changeView(v),
          () => {
            const quizId = this.currentConfig?.quizId;
            const quizTitle = this.currentConfig?.title;
            if (quizId) {
              this.handlePlayUserquiz(quizId, quizTitle);
            }
          }
        );
        break;

      case AppView.PROFILE:
        viewContent = ProfileView(this.user, this.myQuizzes);
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

  if (this.currentView === AppView.LEADERBOARD) {
      document.querySelectorAll("[data-play-public-quiz]").forEach(btn => {
        btn.addEventListener("click", () => {
          const quizId = Number(btn.getAttribute("data-play-public-quiz"));
          const quizTitle = btn.getAttribute("data-play-title");
          this.handlePlayUserquiz(quizId, quizTitle);
        });
      });

      document.querySelectorAll("[data-open-quiz-leaderboard]").forEach(btn => {
        btn.addEventListener("click", () => {
          const quizId = Number(btn.getAttribute("data-open-quiz-leaderboard"));
          const quizTitle = btn.getAttribute("data-quiz-title");
          this.handleOpenLeaderboard(quizId, quizTitle);
        });
      });
    }

    if (this.currentView === AppView.LEADERBOARD_DETAIL) {
        const backBtn = document.getElementById("leaderboard-detail-back-btn");
        if (backBtn) {
          backBtn.addEventListener("click", () => this.changeView(AppView.LEADERBOARD));
        }

        const playBtn = document.getElementById("leaderboard-detail-play-btn");
        if (playBtn) {
          playBtn.addEventListener("click", () => {
            if (this.currentLeaderboardQuizId) {
              this.handlePlayUserquiz(
                this.currentLeaderboardQuizId,
                this.currentLeaderboardQuizTitle
              );
            }
          });
        }
      }
    if (this.currentView === AppView.QUICK_MATCH) {
      const backBtn = document.getElementById("quick-back-btn");
      if (backBtn) {
        backBtn.addEventListener("click", () => this.changeView(AppView.DASHBOARD));
      }

      document.querySelectorAll("[data-play-id]").forEach(btn => {
        btn.addEventListener("click", () => {
          const quizId = Number(btn.getAttribute("data-play-id"));
          const quizTitle = btn.getAttribute("data-play-title");
          this.handlePlayUserquiz(quizId, quizTitle);
        });
      });
    }  
    // ⭐ Profile → Preview
    if (this.currentView === AppView.PROFILE) {
      document.querySelectorAll("[data-quiz-id]").forEach(btn => {
        btn.addEventListener("click", () => {
          const quizId = Number(btn.getAttribute("data-quiz-id"));
          const quizTitle = btn.getAttribute("data-play-title");
          this.handlePreviewQuiz(quizId, quizTitle)

          // if (!this.previewQuiz){
          //   alert("Quiz not found!!!")
          // }
          // this.changeView(AppView.PREVIEW_QUIZ);
        });
      });

      // Profile -> Play
      document.querySelectorAll("[data-play-id]").forEach( btn =>{
        btn.addEventListener("click", ()=>{
          const quizId=btn.getAttribute("data-play-id");
          this.handlePlayUserquiz(quizId)
        })
      })

      // ⭐ Profile → Edit
      document.querySelectorAll("[data-edit-id]").forEach(btn => {
        btn.addEventListener("click", () => {
          const quizId = Number(btn.getAttribute("data-edit-id"));
          //this.editingQuizId=null;
          this.handleEditQuiz(quizId)
        });
      });

      // ⭐ Profile → Delete
      document.querySelectorAll("[data-delete-id]").forEach(btn => {
        btn.addEventListener("click", async () => {
          const index = btn.getAttribute("data-delete-id");

          const confirmDelete = confirm("Are you sure you want to delete this quiz?");
          if (!confirmDelete) return;
          const token = getStoredToken();
          await fetch(`/delete-quiz/${index}`, {
            
            method: "POST", // or DELETE later if you want
            headers: {
              "Authorization": `Bearer ${token}`
             }
            });
          await this.fetchMyQuizzes();
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
