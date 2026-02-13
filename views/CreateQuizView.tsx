import React, { useState } from 'react';
import { Button } from '../components/Button';
import { generateQuizQuestions } from '../services/geminiService';
import { Question, QuizConfig } from '../types';

interface CreateQuizViewProps {
  onQuestionsGenerated: (questions: Question[], config: QuizConfig) => void;
}

export const CreateQuizView: React.FC<CreateQuizViewProps> = ({ onQuestionsGenerated }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'Undergrad' | 'Postgrad' | 'Research'>('Undergrad');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsLoading(true);
    
    const config: QuizConfig = {
        topic,
        difficulty,
        questionCount: 5
    };

    try {
      const questions = await generateQuizQuestions(config);
      onQuestionsGenerated(questions, config);
    } catch (e) {
      console.error(e);
      // In a real app, handle error UI here
      // For demo, we might fallback or show alert, but the service handles fallback now.
      alert("Note: If API fails, mock data will be used.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col gap-8 animate-fade-in">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-8">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                  <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#ee8c2b] animate-pulse"></span>
                  University of Manchester Module
               </div>
               <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-white font-display">
                  Create Your Quiz
               </h1>
               <p className="text-slate-400 text-base max-w-lg font-medium">
                  Establish the framework for your academic assessment. Define parameters and input protocols.
               </p>
            </div>
            <div className="flex gap-2">
               <span className="px-4 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-widest">
                  Live Generator
               </span>
            </div>
         </div>

         {/* Configuration Card */}
         <div className="glass-card rounded-xl p-6 md:p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
               <span className="material-symbols-outlined text-primary">settings_input_component</span>
               Quiz Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="md:col-span-2 space-y-2">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Quiz Topic</span>
                  <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Quantum Computing: Entanglement Principles"
                    className="w-full bg-[#1a102b]/50 border border-primary/20 text-white rounded-lg px-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-600"
                  />
               </div>

               <div className="space-y-2">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Difficulty Level</span>
                  <div className="flex gap-2 h-[54px]">
                     {(['Undergrad', 'Postgrad', 'Research'] as const).map((level) => (
                        <button
                           key={level}
                           onClick={() => setDifficulty(level)}
                           className={`flex-1 rounded-lg border font-bold text-xs uppercase tracking-tight transition-all ${
                              difficulty === level 
                              ? 'border-primary bg-primary/20 text-primary' 
                              : 'border-primary/20 bg-[#1a102b]/50 text-slate-500 hover:text-slate-300 hover:border-primary/40'
                           }`}
                        >
                           {level}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-2">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Model</span>
                  <div className="flex items-center h-[54px] bg-[#1a102b]/50 border border-primary/20 rounded-lg px-4 text-slate-400 text-sm">
                     <span className="material-symbols-outlined mr-2 text-primary">smart_toy</span>
                     Gemini 3 Flash Preview
                  </div>
               </div>
            </div>
         </div>

         {/* Action Bar */}
         <div className="flex justify-end pt-4">
             <Button 
               onClick={handleGenerate} 
               isLoading={isLoading}
               disabled={!topic}
               className="px-10 py-4 text-base"
             >
                <span className="flex items-center gap-2">
                   <span className="material-symbols-outlined">rocket_launch</span>
                   INITIALIZE NEURAL GENERATION
                </span>
             </Button>
         </div>
      </div>
    </div>
  );
};