
export interface Question {
  question: string;
  options: string[];
  correctAnswer: string; // The text of the correct answer
  explanation?: string;
}

export interface QuizConfig {
  topic: string;
  difficulty: 'Undergrad' | 'Postgrad' | 'Research';
  questionCount: number;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  streak: number;
  date: string;
  topic: string;
  answers: {
    questionIndex: number;
    userAnswer: string;
    isCorrect: boolean;
  }[];
}

export interface UserProfile {
  name: string;
  email: string;
  level: number;
  title: string;
  totalQuizzes: number;
  avgAccuracy: number;
  streak: number;
  points: number;
  avatarUrl: string;
}

export enum AppView {
  SPLASH = 'SPLASH',
  AUTH = 'AUTH',
  REGISTER = 'REGISTER',
  DASHBOARD = 'DASHBOARD',
  CREATE_QUIZ = 'CREATE_QUIZ',
  QUICK_MATCH = 'QUICK_MATCH',
  PLAY_QUIZ = 'PLAY_QUIZ',
  RESULTS = 'RESULTS',
  PROFILE = 'PROFILE',
}
