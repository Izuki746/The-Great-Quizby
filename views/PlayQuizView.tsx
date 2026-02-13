import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Question, QuizConfig, QuizResult } from '../types';

interface PlayQuizViewProps {
  questions: Question[];
  config: QuizConfig;
  onComplete: (result: QuizResult) => void;
}

export const PlayQuizView: React.FC<PlayQuizViewProps> = ({ questions, config, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ questionIndex: number, userAnswer: string, isCorrect: boolean }[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    setTimeLeft(30);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleTimeUp = () => {
    // Treat as incorrect if not selected
    if (!selectedOption) {
      submitAnswer(null);
    }
  };

  const submitAnswer = (answer: string | null) => {
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    const newAnswers = [...userAnswers, { 
      questionIndex: currentIndex, 
      userAnswer: answer || "Time Out", 
      isCorrect 
    }];
    setUserAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setSelectedOption(null);
      setCurrentIndex(prev => prev + 1);
    } else {
      // Quiz Complete
      const score = newAnswers.filter(a => a.isCorrect).length * 100;
      const correctCount = newAnswers.filter(a => a.isCorrect).length;
      
      onComplete({
        score,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        streak: calculateStreak(newAnswers),
        date: new Date().toISOString(),
        topic: config.topic,
        answers: newAnswers
      });
    }
  };

  const calculateStreak = (answers: any[]) => {
    let streak = 0;
    for (let i = answers.length - 1; i >= 0; i--) {
      if (answers[i].isCorrect) streak++;
      else break;
    }
    return streak;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Quiz Header */}
      <div className="p-6 pb-2 border-b border-white/5 flex items-center justify-between bg-surface/50 backdrop-blur-sm relative z-20">
         <div className="flex flex-col gap-1">
            <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</span>
            <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
            </div>
         </div>
         
         <div className="flex items-center gap-3 bg-uom-deep border border-white/10 px-4 py-2 rounded-full shadow-lg">
            <span className={`material-symbols-outlined ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>timer</span>
            <div className="flex flex-col items-end leading-none">
               <span className={`text-xl font-bold tabular-nums tracking-tight ${timeLeft < 10 ? 'text-red-500' : 'text-white'}`}>
                  00:{timeLeft.toString().padStart(2, '0')}
               </span>
               <span className="text-[8px] text-white/50 font-bold uppercase">Seconds Left</span>
            </div>
         </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 relative flex flex-col justify-center max-w-5xl mx-auto w-full px-6 py-8">
         <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]"></div>
         </div>

         <div className="relative z-10 text-center space-y-8 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
               <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
               Live Question
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow-xl font-display">
               {currentQuestion.question}
            </h2>
         </div>

         <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(option)}
                className={`group relative flex items-center p-6 rounded-2xl border transition-all duration-300 text-left
                   ${selectedOption === option 
                     ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(238,140,43,0.3)]' 
                     : 'bg-surface border-white/10 hover:border-primary/50 hover:bg-white/5'
                   }
                `}
              >
                 <div className={`flex items-center justify-center w-10 h-10 rounded-lg border font-bold mr-5 transition-colors shrink-0
                    ${selectedOption === option
                      ? 'bg-primary text-uom-deep border-primary'
                      : 'bg-white/5 border-white/10 text-white group-hover:border-primary group-hover:text-primary'
                    }
                 `}>
                    {String.fromCharCode(65 + idx)}
                 </div>
                 <span className="text-lg font-medium text-white/90">{option}</span>
              </button>
            ))}
         </div>

         <div className="relative z-10 flex justify-end mt-12">
            <Button 
               onClick={() => submitAnswer(selectedOption)}
               disabled={!selectedOption}
               className="px-10 py-4 text-lg"
            >
               <span className="flex items-center gap-3">
                  Confirm Selection
                  <span className="material-symbols-outlined">arrow_forward</span>
               </span>
            </Button>
         </div>
      </div>
    </div>
  );
};
