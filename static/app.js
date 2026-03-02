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
import { QuizPreviewView } from './QuizPreviewView.js';   // ⭐ 新增

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
    this.previewQuiz = null;   // ⭐ 新增
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
    })
    .catch(() => alert('Network error: Could not reach server'));
  }

  handleLogin(username, password) {
    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        if (data.user) this.user = { ...this.user, ...data.user };
        this.user.name = username;
        this.changeView(AppView.DASHBOARD);
      } else {
        alert('Login failed: ' + (data.error || 'Invalid credentials'));
      }
    })
    .catch(() => alert('Network error: Could not reach server'));
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

  handleLogout() {
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

      case AppView.CREATE_QUIZ:
        viewContent = CreateQuizView(
          (quiz) => this.handleManualQuizSave(quiz),
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

      case AppView.PREVIEW_QUIZ:   // ⭐ 新增
        viewContent = QuizPreviewView(
          this.previewQuiz,
          () => this.changeView(AppView.PROFILE)
        );
        break;

      default:
        viewContent = DashboardView((v) => this.changeView(v));
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

  attachEventListeners() {

    // ⭐ Profile → 点击眼睛按钮进入预览
    if (this.currentView === AppView.PROFILE) {
      document.querySelectorAll("[data-quiz-index]").forEach(btn => {
        btn.addEventListener("click", () => {
          const index = btn.getAttribute("data-quiz-index");
          this.previewQuiz = this.user.quizzes[index];
          this.changeView(AppView.PREVIEW_QUIZ);
        });
      });

      // ⭐ Profile → 删除 Quiz
      document.querySelectorAll("[data-delete-index]").forEach(btn => {
        btn.addEventListener("click", () => {
          const index = btn.getAttribute("data-delete-index");

          const confirmDelete = confirm("Are you sure you want to delete this quiz?");
          if (!confirmDelete) return;

          this.user.quizzes.splice(index, 1);
          this.user.totalQuizzes = this.user.quizzes.length;

          this.changeView(AppView.PROFILE); // 刷新页面
        });
      });
    }

    // ⭐ Preview → 返回按钮
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
