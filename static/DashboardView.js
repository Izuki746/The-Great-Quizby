// static/DashboardView.js
import { Button } from './Button.js';

export function DashboardView(onViewChange) {
  setTimeout(() => {
    const createQuizBtn = document.getElementById('create-quiz-btn');
    const quickMatchBtn = document.getElementById('quick-match-btn');

    if (createQuizBtn) {
      createQuizBtn.addEventListener('click', () => onViewChange('CREATE_QUIZ'));
    }
    if (quickMatchBtn) {
      quickMatchBtn.addEventListener('click', () => onViewChange('QUICK_MATCH'));
    }
  }, 0);

  return `
    <div class="flex-1 flex flex-col items-center p-6 md:p-12 max-w-7xl mx-auto w-full">
      <div class="text-center space-y-6 animate-float mb-12 mt-8">
         <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-purple-300 text-xs font-semibold tracking-wide uppercase">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Live Season 4
         </div>
         <h1 class="text-4xl md:text-6xl font-black tracking-tighter leading-tight font-display">
            <span class="block text-white mb-2">MASTER THE CODE.</span>
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-orange-400 to-yellow-500 drop-shadow-[0_0_15px_rgba(238,140,43,0.5)]">WIN THE GAME.</span>
         </h1>
         
         <div class="flex flex-col sm:flex-row items-center gap-4 justify-center mt-8">
            ${Button({
              className: 'h-16 px-8 text-xl',
              icon: 'add_circle',
              id: 'create-quiz-btn',
              children: 'Create Quiz'
            })}
            ${Button({
              variant: 'outline',
              className: 'h-16 px-8 text-xl',
              icon: 'bolt',
              id: 'quick-match-btn',
              children: 'Choose & start'
            })}
         </div>
      </div>
    </div>
  `;
}
