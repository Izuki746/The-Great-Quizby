
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { generateQuizQuestions } from '../services/geminiService';
import { Question, QuizConfig, AppView } from '../types';

interface QuickMatchViewProps {
  onQuestionsGenerated: (questions: Question[], config: QuizConfig) => void;
  onBack: () => void;
}

export const QuickMatchView: React.FC<QuickMatchViewProps> = ({ onQuestionsGenerated, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing...');

  const quickCategories = [
    { id: 'tech', name: 'Tech & Coding', icon: 'terminal', color: 'from-blue-500/20 to-cyan-500/20', borderColor: 'group-hover:border-blue-500', iconColor: 'text-blue-400', topic: 'Modern Web Development and System Architecture' },
    { id: 'science', name: 'Deep Science', icon: 'science', color: 'from-emerald-500/20 to-teal-500/20', borderColor: 'group-hover:border-emerald-500', iconColor: 'text-emerald-400', topic: 'Quantum Physics and Molecular Biology Foundations' },
    { id: 'humanities', name: 'Humanities', icon: 'menu_book', color: 'from-amber-500/20 to-orange-500/20', borderColor: 'group-hover:border-amber-500', iconColor: 'text-amber-400', topic: 'Philosophy and Global Sociology' },
    { id: 'arts', name: 'Creative Arts', icon: 'palette', color: 'from-pink-500/20 to-rose-500/20', borderColor: 'group-hover:border-pink-500', iconColor: 'text-pink-400', topic: 'Post-Modern Art History and Design Principles' },
    { id: 'math', name: 'Mathematics', icon: 'functions', color: 'from-indigo-500/20 to-purple-500/20', borderColor: 'group-hover:border-indigo-500', iconColor: 'text-indigo-400', topic: 'Advanced Calculus and Statistics' },
    { id: 'business', name: 'Economics', icon: 'payments', color: 'from-slate-500/20 to-gray-500/20', borderColor: 'group-hover:border-white', iconColor: 'text-slate-300', topic: 'Global Macroeconomics and Finance' },
  ];

  const handleSelect = async (topic: string) => {
    setIsLoading(true);
    setLoadingText('Connecting to neural network...');
    
    const config: QuizConfig = {
      topic,
      difficulty: 'Undergrad',
      questionCount: 5
    };

    try {
      setLoadingText('Synthesizing questions...');
      const questions = await generateQuizQuestions(config);
      onQuestionsGenerated(questions, config);
    } catch (e) {
      console.error(e);
      setLoadingText('Fallback protocol activated...');
      // Error handling is managed inside service fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleSurpriseMe = () => {
    const topics = [
      'The History of Space Exploration',
      'Artificial General Intelligence Ethics',
      'Ancient Roman Engineering',
      'Marine Biology: Deep Sea Abyss',
      'Cybersecurity: Cryptography Foundations'
    ];
    handleSelect(topics[Math.floor(Math.random() * topics.length)]);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-5xl mx-auto w-full">
      {isLoading ? (
        <div className="flex flex-col items-center gap-8 animate-pulse">
           <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-4xl text-primary animate-pulse">psychology</span>
           </div>
           <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2 font-display">{loadingText}</h2>
              <p className="text-slate-400 text-sm tracking-widest uppercase">Building your customized session</p>
           </div>
        </div>
      ) : (
        <div className="w-full space-y-8 animate-fade-in">
           <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white font-display">Select Challenge</h1>
                <p className="text-slate-400 mt-1">Choose a category to start your rapid assessment</p>
              </div>
              <Button variant="ghost" onClick={onBack} icon="arrow_back">Back</Button>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickCategories.map((cat) => (
                 <button
                    key={cat.id}
                    onClick={() => handleSelect(cat.topic)}
                    className={`group relative flex flex-col items-start p-6 rounded-2xl bg-gradient-to-br ${cat.color} border border-white/5 transition-all hover:scale-[1.02] active:scale-[0.98] ${cat.borderColor} hover:shadow-2xl`}
                 >
                    <div className={`p-3 rounded-xl bg-black/40 mb-4 ${cat.iconColor}`}>
                       <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{cat.name}</h3>
                    <p className="text-xs text-slate-400 text-left line-clamp-2">Standard University of Manchester {cat.name} assessment module.</p>
                    
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className="material-symbols-outlined text-primary">bolt</span>
                    </div>
                 </button>
              ))}
           </div>

           <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5">
              <div className="flex items-center gap-4">
                 <div className="size-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                 </div>
                 <div>
                    <p className="text-white font-bold">Uncertain?</p>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Try Random Neural Topic</p>
                 </div>
              </div>
              <Button 
                variant="primary" 
                className="w-full sm:w-auto px-12" 
                icon="casino"
                onClick={handleSurpriseMe}
              >
                 Surprise Me
              </Button>
           </div>
        </div>
      )}
    </div>
  );
};
