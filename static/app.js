// Main Application State and Router
import { SplashView } from './SplashView.js';
import { AuthView } from './AuthView.js';
import { RegisterView } from './RegisterView.js';
import { DashboardView } from './DashboardView.js';
import { CreateQuizView } from './CreateQuizView.js';
import { QuickMatchView } from './QuickMatchView.js';
import { PlayQuizView } from './PlayQuizView.js';
import { ResultsView } from './ResultsView.js';
import { ProfileView } from './ProfileView.js';
import { Layout } from './Layout.js';
import { HomeView } from './homeView.js';
import { QuizPreviewView } from './QuizPreviewView.js';

// App Views Enum
const AppView = {
  SPLASH: 'SPLASH',
  AUTH: 'AUTH',
  REGISTER: 'REGISTER',
  DASHBOARD: 'DASHBOARD',
  CREATE_QUIZ: 'CREATE_QUIZ',
  QUICK_MATCH: 'QUICK_MATCH',
  PLAY_QUIZ: 'PLAY_QUIZ',
  RESULTS: 'RESULTS',
  PROFILE: 'PROFILE',
  PREVIEW_QUIZ: 'PREVIEW_QUIZ',
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
  quizHistory: [] // record question history in Trending categories

class QuizbyApp {
  constructor() {
    this.currentView = AppView.SPLASH;
    this.questions = [];
    this.currentConfig = null;
    this.lastResult = null;

    this.user = { ...INITIAL_USER };

    this.previewQuiz = null;
    this.editingQuizIndex = null;

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

  // -----------------------------
  // REGISTER
  // -----------------------------
  handleRegister(username, password) {
    fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        alert('Account created successfully! Please log in.');
        this.changeView(AppView.AUTH);
      } else {
        alert('Registration failed: ' + (data.error || 'Please try again'));
      }
    });
  }

  // -----------------------------
  // LOGIN
  // -----------------------------
  handleLogin(username, password) {
    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(r => r.json())
    .then(data => {
      if (!data.success) {
        alert('Login failed: ' + (data.error || 'Invalid credentials'));
        return;
      }

      // Load user info
      this.user.name = username;
      this.user.email = `${username}@learning.ai`;

      // Load quizzes from backend
      fetch('/get_user_quizzes')
        .then(r => r.json())
        .then(quizzes => {
          this.user.quizzes = quizzes;
          this.user.totalQuizzes = quizzes.length;
          this.changeView(AppView.DASHBOARD);
        });

    });
  }

  // -----------------------------
  // SAVE QUIZ TO DATABASE
  // -----------------------------
  handleManualQuizSave(quiz) {
    fetch('/save_quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: quiz.name,
        createdAt: new Date().toISOString(),
        questions: quiz.questions
      })
    })
    .then(r => r.json())
    .then(data => {
      if (!data.success) {
        alert("Failed to save quiz.");
        return;
      }

      // Reload quizzes
      fetch('/get_user_quizzes')
        .then(r => r.json())
        .then(quizzes => {
          this.user.quizzes = quizzes;
          this.user.totalQuizzes = quizzes.length;
          alert("Your quiz has been saved!");
          this.changeView(AppView.DASHBOARD);
        });
    });
  }

  // -----------------------------
  // QUIZ COMPLETE
  // -----------------------------
  handleQuizComplete(result) {
    this.lastResult = result;
    this.user.points += result.score;
    
    if (!this.user.quizHistory) this.user.quizHistory = [];
    this.user.quizHistory.push(result);
    
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
    this.questions = questions;      // 把生成的题目存入全局状态
    this.currentConfig = config;     // 存入当前测验的配置
    this.changeView(AppView.PLAY_QUIZ); // 完美跳转到答题页面！
  }

  // -----------------------------
  // LOGOUT
  // -----------------------------
  handleLogout() {
    fetch('/logout', { method: 'POST' });
    this.user = { ...INITIAL_USER };
    this.changeView(AppView.AUTH);
  }

  // -----------------------------
  // RENDER
  // -----------------------------
  render() {
    let viewContent = '';

    switch (this.currentView) {
      case AppView.SPLASH:
        viewContent = SplashView();
        break;

      case AppView.AUTH:
        viewContent = AuthView(
          (u, p) => this.handleLogin(u, p),
          () => this.changeView(AppView.REGISTER)
        );
        break;

      case AppView.REGISTER:
        viewContent = RegisterView(
          (u, p) => this.handleRegister(u, p),
          () => this.changeView(AppView.AUTH)
        );
        break;

      case AppView.DASHBOARD:
        viewContent = DashboardView(
          (view) => this.changeView(view),
          (q, c) => this.handleQuestionsGenerated(q, c)
        );
        break;

      case AppView.QUICK_MATCH:
        viewContent = QuickMatchView(
          (q, c) => this.handleQuestionsGenerated(q, c),
          () => this.changeView(AppView.DASHBOARD)
        );
        break;

      case AppView.CREATE_QUIZ:
        viewContent = CreateQuizView(
          this.previewQuiz,
          (quiz) => {
            if (this.editingQuizIndex !== null) {
              // UPDATE QUIZ
              const quizId = this.user.quizzes[this.editingQuizIndex].id;

              fetch('/update_quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: quizId,
                  name: quiz.name,
                  questions: quiz.questions
                })
              })
              .then(r => r.json())
              .then(() => {
                return fetch('/get_user_quizzes');
              })
              .then(r => r.json())
              .then(quizzes => {
                this.user.quizzes = quizzes;
                this.editingQuizIndex = null;
                this.previewQuiz = null;
                alert("Quiz updated!");
                this.changeView(AppView.PROFILE);
              });

            } else {
              // CREATE NEW QUIZ
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
          () => this.changeView(AppView.PROFILE),
          () => {
            this.questions = this.previewQuiz.questions;
            this.currentConfig = { manual: true };
            this.changeView(AppView.PLAY_QUIZ);
          }
        );
        break;
    }

    if ([AppView.SPLASH, AppView.AUTH, AppView.REGISTER].includes(this.currentView)) {
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

  // -----------------------------
  // EVENT LISTENERS
  // -----------------------------
  attachEventListeners() {

    if (this.currentView === AppView.PROFILE) {
      document.querySelectorAll("[data-quiz-index]").forEach(btn => {
        btn.addEventListener("click", () => {
          const index = btn.getAttribute("data-quiz-index");
          this.previewQuiz = this.user.quizzes[index];
          this.changeView(AppView.PREVIEW_QUIZ);
        });
      });

      document.querySelectorAll("[data-edit-index]").forEach(btn => {
        btn.addEventListener("click", () => {
          const index = btn.getAttribute("data-edit-index");
          this.editingQuizIndex = index;
          this.previewQuiz = this.user.quizzes[index];
          this.changeView(AppView.CREATE_QUIZ);
        });
      });

      document.querySelectorAll("[data-delete-index]").forEach(btn => {
        btn.addEventListener("click", () => {
          const index = btn.getAttribute("data-delete-index");
          const quiz = this.user.quizzes[index];

          const confirmDelete = confirm("Are you sure you want to delete this quiz?");
          if (!confirmDelete) return;

          fetch('/delete_quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: quiz.id })
          })
          .then(() => {
            this.user.quizzes.splice(index, 1);
            this.changeView(AppView.PROFILE);
          });
        });
      });
    }

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
