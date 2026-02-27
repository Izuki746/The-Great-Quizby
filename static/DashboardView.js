// Dashboard View
import { Button } from './Button.js';

export function DashboardView(onViewChange) {
  const categories = [
    { name: 'World Culture', icon: 'public', players: '1.5k', color: 'text-blue-400', img: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&q=80&w=400' },
    { name: 'Cinema & TV', icon: 'movie', players: '2.3k', color: 'text-pink-400', img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400' },
    { name: 'Food & Drink', icon: 'restaurant', players: '3.1k', color: 'text-orange-400', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400' },
    { name: 'Global History', icon: 'history_edu', players: '980', color: 'text-yellow-400', img: 'https://images.unsplash.com/photo-1461360346148-3470a5d6e241?auto=format&fit=crop&q=80&w=400' },
  ];

  setTimeout(() => {
    const createQuizBtn = document.getElementById('create-quiz-btn');
    const quickMatchBtn = document.getElementById('quick-match-btn');
    const viewAllBtn = document.getElementById('view-all-btn');

    if (createQuizBtn) {
      createQuizBtn.addEventListener('click', () => onViewChange('CREATE_QUIZ'));
    }
    if (quickMatchBtn) {
      quickMatchBtn.addEventListener('click', () => onViewChange('QUICK_MATCH'));
    }
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => onViewChange('QUICK_MATCH'));
    }

    // Category cards
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => onViewChange('QUICK_MATCH'));
    });
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
              children: 'Quick Match'
            })}
         </div>
      </div>

      <div class="w-full mt-8">
        <div class="flex items-end justify-between mb-6">
           <div>
              <h3 class="text-2xl font-bold text-white font-display">Trending Categories</h3>
              <p class="text-gray-400 text-sm mt-1">Explore popular topics right now</p>
           </div>
           <button 
             id="view-all-btn"
             class="text-primary hover:text-white flex items-center gap-1 text-sm font-bold uppercase tracking-wide"
           >
              View All <span class="material-symbols-outlined text-sm">arrow_forward</span>
           </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           ${categories.map(cat => `
             <div 
               class="category-card group relative h-48 rounded-xl overflow-hidden bg-[#1a1a20] border border-white/10 hover:border-primary/50 cursor-pointer transition-all"
             >
                <div class="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-40 transition-opacity" style="background-image: url(${cat.img})"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                <div class="absolute bottom-0 left-0 p-5">
                   <span class="material-symbols-outlined ${cat.color} mb-2 text-3xl">${cat.icon}</span>
                   <h4 class="text-lg font-bold text-white group-hover:text-primary transition-colors">${cat.name}</h4>
                   <p class="text-xs text-gray-400 mt-1 font-mono">${cat.players} Active Players</p>
                </div>
             </div>
           `).join('')}
        </div>
      </div>
    </div>
  `;
}
