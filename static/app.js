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
    this.rootElement = document.getElementById('root');
    
    this.init();
  }

  init() {
    // Start with splash screen
    this.render();
    
    // Automatically transition to auth after 3.5 seconds
    setTimeout(() => {
      this.changeView(AppView.AUTH);
    }, 3500);
  }

  changeView(view) {
    this.currentView = view;
    this.render();
  }

  handleRegister(username, password) {
    // Send credentials to Flask backend
    fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Account created successfully! Please log in.');
        this.changeView(AppView.AUTH);
      } else {
        alert('Registration failed: ' + (data.error || 'Please try again'));
      }
    })
    .catch(error => {
      console.error('Register error:', error);
      alert('Network error: Could not reach server');
    });
  }

  handleLogin(username, password) {
    // Send credentials to Flask backend
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Update user info from response if available
        if (data.user) {
          this.user = { ...this.user, ...data.user };
        }
        this.user.name = username;
        this.changeView(AppView.DASHBOARD);
      } else {
        alert('Login failed: ' + (data.error || 'Invalid credentials'));
      }
    })
    .catch(error => {
      console.error('Login error:', error);
      alert('Network error: Could not reach server');
    });
  }

  handleQuestionsGenerated(generatedQuestions, config) {
    this.questions = generatedQuestions;
    this.currentConfig = config;
    this.changeView(AppView.PLAY_QUIZ);
  }

  handleQuizComplete(result) {
    this.lastResult = result;
    
    // Update user stats
    this.user.totalQuizzes += 1;
    this.user.points += result.score;
    this.user.streak = result.streak > this.user.streak ? result.streak : this.user.streak;
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
      case AppView.HOME:
        app.innerHTML = HomeView();
        break;  
      case AppView.AUTH:
        viewContent = AuthView(
          (username, password) => this.handleLogin(username, password),
          () => this.changeView(AppView.REGISTER)
        );
        break;
      case AppView.REGISTER:
        viewContent = RegisterView(
          (username, password) => this.handleRegister(username, password),
          () => this.changeView(AppView.AUTH)
        );
        break;
      case AppView.DASHBOARD:
        viewContent = DashboardView(
          (view) => this.changeView(view),
          // Add a callback for generating questions
          (questions, config) => this.handleQuestionsGenerated(questions, config)
        );
        break;
      case AppView.CREATE_QUIZ:
        viewContent = CreateQuizView(
          (questions, config) => this.handleQuestionsGenerated(questions, config),
          () => this.changeView(AppView.DASHBOARD)
        );
        break;
      case AppView.PLAY_QUIZ:
        if (!this.currentConfig || this.questions.length === 0) {
          viewContent = DashboardView((view) => this.changeView(view));
        } else {
          viewContent = PlayQuizView(
            this.questions,
            this.currentConfig,
            (result) => this.handleQuizComplete(result)
          );
        }
        break;
      case AppView.RESULTS:
        if (!this.lastResult) {
          viewContent = DashboardView((view) => this.changeView(view));
        } else {
          viewContent = ResultsView(this.lastResult, (view) => this.changeView(view));
        }
        break;
      case AppView.PROFILE:
        viewContent = ProfileView(this.user);
        break;
      default:
        viewContent = DashboardView((view) => this.changeView(view));
    }

    // Wrap in layout if not splash/auth/register
    if ([AppView.SPLASH, AppView.AUTH, AppView.REGISTER].includes(this.currentView)) {
      this.rootElement.innerHTML = viewContent;
    } else {
      this.rootElement.innerHTML = Layout(
        viewContent,
        this.currentView,
        this.user,
        (view) => this.changeView(view),
        () => this.handleLogout()
      );
    }

    // Attach event listeners after render
    this.attachEventListeners();
  }

  attachEventListeners() {
    // This will be called after each render to re-attach event listeners
    // Specific view event listeners are handled in their respective view files
  }
}

// Export AppView for use in other modules
export { AppView };

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.quizbyApp = new QuizbyApp();
  });
} else {
  window.quizbyApp = new QuizbyApp();
}
