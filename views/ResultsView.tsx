import React from 'react';
import { AppView, QuizResult } from '../types';
import { Button } from '../components/Button';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ResultsViewProps {
  result: QuizResult;
  onViewChange: (view: AppView) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, onViewChange }) => {
  const accuracy = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const data = [
    { name: 'Correct', value: accuracy },
    { name: 'Incorrect', value: 100 - accuracy },
  ];
  const COLORS = ['#ee8c2b', '#333'];

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-8">
      {/* Hero Card */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-between glass-card rounded-2xl p-8 relative overflow-hidden shadow-2xl">
         <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
         
         <div className="z-10 flex flex-col gap-4 max-w-lg">
            <div className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
               <span className="material-symbols-outlined text-sm">trophy</span>
               Quiz Completed
            </div>
            <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-white font-display">
               Mission <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Accomplished!</span>
            </h2>
            <p className="text-gray-400 text-lg">
               Great job on the "{result.topic}" quiz.
            </p>
            <div className="flex gap-4 mt-2">
               <div className="px-5 py-3 rounded-lg bg-white/5 border border-white/10 flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Total Points</span>
                  <span className="text-2xl font-bold text-white font-display">{result.score}</span>
               </div>
               <div className="px-5 py-3 rounded-lg bg-white/5 border border-white/10 flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Streak</span>
                  <span className="text-2xl font-bold text-white font-display">{result.streak} Days 🔥</span>
               </div>
            </div>
         </div>

         {/* Chart */}
         <div className="z-10 relative size-48 md:size-56 shrink-0 flex items-center justify-center">
             <div className="absolute inset-0">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={data}
                     innerRadius={80}
                     outerRadius={95}
                     startAngle={90}
                     endAngle={-270}
                     paddingAngle={5}
                     dataKey="value"
                     stroke="none"
                     cornerRadius={10}
                   >
                     {data.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl md:text-5xl font-black text-white tracking-tighter font-display">{accuracy}%</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Accuracy</span>
             </div>
         </div>
      </div>

      {/* Breakdown */}
      <div className="flex flex-col gap-6">
         <h3 className="text-2xl font-bold flex items-center gap-3 text-white">
            <span className="material-symbols-outlined text-primary">analytics</span>
            Detailed Breakdown
         </h3>
         
         <div className="grid gap-4">
            {result.answers.map((ans, idx) => (
               <div key={idx} className={`glass-card border-l-4 rounded-xl p-5 flex gap-4 transition-all hover:bg-white/5 ${ans.isCorrect ? 'border-l-emerald-500/50' : 'border-l-red-500/50'}`}>
                  <div className="flex-shrink-0 mt-1">
                     <div className={`size-8 rounded-full flex items-center justify-center border ${ans.isCorrect ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        <span className="material-symbols-outlined text-lg">{ans.isCorrect ? 'check' : 'close'}</span>
                     </div>
                  </div>
                  <div className="flex-1 space-y-2">
                     <div className="flex justify-between items-start">
                        <h4 className="font-medium text-lg leading-snug text-gray-100">Question {idx + 1}</h4>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Your Answer:</span>
                        <span className={`text-sm font-bold font-mono ${ans.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                           {ans.userAnswer}
                        </span>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      <div className="flex justify-between items-center mt-8 pt-8 border-t border-white/10">
         <Button variant="outline" onClick={() => onViewChange(AppView.DASHBOARD)} icon="arrow_back">
            Exit to Home
         </Button>
         <Button onClick={() => onViewChange(AppView.CREATE_QUIZ)} icon="restart_alt">
            Play Again
         </Button>
      </div>
    </div>
  );
};
