// Results View
import { Button } from './Button.js';

export function ResultsView(result, onViewChange, onPLayAgain) {
  const score = result?.score ?? 0;
  const topic = result?.topic ?? "this";
  const streak = result?.streak ?? 0;
  const answers = result?.answers ?? [];
  const correctAnswers = result?.correctAnswers ?? 0;
  const totalQuestions = result?.totalQuestions ?? 0;

  const accuracy = totalQuestions > 0
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0;

  setTimeout(() => {
    const dashboardBtn = document.getElementById('exit-home-btn');
    const playAgainBtn = document.getElementById('play-again-btn');

    if (dashboardBtn) {
      dashboardBtn.addEventListener('click', () => onViewChange('DASHBOARD'));
    }
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', onPLayAgain);
    }
  }, 0);

  return `
    <div class="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-8">
      <div class="flex flex-col md:flex-row gap-8 items-center justify-between glass-card rounded-2xl p-8 relative overflow-hidden shadow-2xl">
         <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
         
         <div class="z-10 flex flex-col gap-4 max-w-lg">
            <div class="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
               <span class="material-symbols-outlined text-sm">trophy</span>
               Quiz Completed
            </div>
            <h2 class="text-4xl md:text-5xl font-black leading-tight tracking-tight text-white font-display">
               Mission <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Accomplished!</span>
            </h2>
            <p class="text-gray-400 text-lg">
               Great job on the "${topic}" quiz.
            </p>
            <div class="flex gap-4 mt-2">
               <div class="px-5 py-3 rounded-lg bg-white/5 border border-white/10 flex flex-col">
                  <span class="text-[10px] text-gray-400 uppercase font-bold">Total Points</span>
                  <span class="text-2xl font-bold text-white font-display">${score}</span>
               </div>
               
            </div>
         </div>

         <div class="z-10 relative w-48 h-48 md:w-56 md:h-56 shrink-0 flex items-center justify-center">
             <svg class="transform -rotate-90" width="100%" height="100%" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#333"
                  stroke-width="30"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#ee8c2b"
                  stroke-width="30"
                  stroke-dasharray="${(accuracy / 100) * 502.65} 502.65"
                  stroke-linecap="round"
                />
             </svg>
             <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span class="text-4xl md:text-5xl font-black text-white tracking-tighter font-display">${accuracy}%</span>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Accuracy</span>
             </div>
         </div>
      </div>

      <div class="flex flex-col gap-6">
         <h3 class="text-2xl font-bold flex items-center gap-3 text-white">
            <span class="material-symbols-outlined text-primary">analytics</span>
            Detailed Breakdown
         </h3>
         
         <div class="grid gap-4">
            ${answers.map((ans, idx) => `
               <div class="glass-card border-l-4 rounded-xl p-5 flex gap-4 transition-all hover:bg-white/5 border-l-primary/40">
                  <div class="flex-shrink-0 mt-1">
                     <div class="size-8 rounded-full flex items-center justify-center border bg-primary/10 text-primary border-primary/20">
                        <span class="material-symbols-outlined text-lg">quiz</span>
                     </div>
                  </div>
                  <div class="flex-1 space-y-2">
                     <div class="flex justify-between items-start">
                        <h4 class="font-medium text-lg leading-snug text-gray-100">Question ${idx + 1}</h4>
                     </div>
                     <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-400">Your Answer:</span>
                        <span class="text-sm font-bold font-mono text-primary">
                           ${ans.selected ?? "No answer"}
                        </span>
                     </div>
                     <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-400">Correct Answer:</span>
                        <span class="text-sm font-bold font-mono text-primary">
                           ${ans.correctAnswer  ?? "No answer"}
                        </span>
                     </div>
                  </div>
               </div>
            `).join('')}
         </div>
      </div>

      <div class="flex justify-between items-center mt-8 pt-8 border-t border-white/10">
         ${Button({
           variant: 'outline',
           icon: 'arrow_back',
           id: 'exit-home-btn',
           children: 'Exit to Home'
         })}
         ${Button({
           icon: 'restart_alt',
           id: 'play-again-btn',
           children: 'Play Again'
         })}
      </div>
    </div>
  `;
}