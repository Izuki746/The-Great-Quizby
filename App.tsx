
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AppView, UserProfile, Question, QuizConfig, QuizResult } from './types';

import { SplashView } from './views/SplashView';
import { AuthView } from './views/AuthView';
import { RegisterView } from './views/RegisterView';
import { DashboardView } from './views/DashboardView';
import { CreateQuizView } from './views/CreateQuizView';
import { PlayQuizView } from './views/PlayQuizView';
import { ResultsView } from './views/ResultsView';
import { ProfileView } from './views/ProfileView';
import { QuickMatchView } from './views/QuickMatchView';

// Production-ready standalone frontend user state
const INITIAL_USER: UserProfile = {
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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.SPLASH);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentConfig, setCurrentConfig] = useState<QuizConfig | null>(null);
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);

  // Splash logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentView(AppView.AUTH);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    // In a real standalone app, we'd persist session or fetch profile
    setCurrentView(AppView.DASHBOARD);
  };

  const handleQuestionsGenerated = (generatedQuestions: Question[], config: QuizConfig) => {
    setQuestions(generatedQuestions);
    setCurrentConfig(config);
    setCurrentView(AppView.PLAY_QUIZ);
  };

  const handleQuizComplete = (result: QuizResult) => {
    setLastResult(result);
    // Update user stats locally for demonstration
    setUser(prev => ({
      ...prev,
      totalQuizzes: prev.totalQuizzes + 1,
      points: prev.points + result.score,
      streak: result.streak > prev.streak ? result.streak : prev.streak,
      level: Math.floor((prev.points + result.score) / 500) + 1
    }));
    setCurrentView(AppView.RESULTS);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.SPLASH:
        return <SplashView />;
      case AppView.AUTH:
        return (
          <AuthView 
            onLogin={handleLogin} 
            onRegisterClick={() => setCurrentView(AppView.REGISTER)} 
          />
        );
      case AppView.REGISTER:
        return (
          <RegisterView 
            onRegister={handleLogin} 
            onLoginClick={() => setCurrentView(AppView.AUTH)} 
          />
        );
      case AppView.DASHBOARD:
        return <DashboardView onViewChange={setCurrentView} />;
      case AppView.CREATE_QUIZ:
        return <CreateQuizView onQuestionsGenerated={handleQuestionsGenerated} />;
      case AppView.QUICK_MATCH:
        return (
          <QuickMatchView 
            onQuestionsGenerated={handleQuestionsGenerated} 
            onBack={() => setCurrentView(AppView.DASHBOARD)}
          />
        );
      case AppView.PLAY_QUIZ:
        if (!currentConfig || questions.length === 0) return <DashboardView onViewChange={setCurrentView} />;
        return (
          <PlayQuizView 
            questions={questions} 
            config={currentConfig} 
            onComplete={handleQuizComplete} 
          />
        );
      case AppView.RESULTS:
        if (!lastResult) return <DashboardView onViewChange={setCurrentView} />;
        return <ResultsView result={lastResult} onViewChange={setCurrentView} />;
      case AppView.PROFILE:
        return <ProfileView user={user} />;
      default:
        return <DashboardView onViewChange={setCurrentView} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      user={user} 
      onChangeView={setCurrentView}
      onLogout={() => setCurrentView(AppView.AUTH)}
    >
      <div className="animate-fade-in flex-grow flex flex-col">
        {renderView()}
      </div>
    </Layout>
  );
};

export default App;
