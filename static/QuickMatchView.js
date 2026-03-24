// static/QuickMatchView.js
import { Button } from './Button.js';
import { generateQuizQuestions } from './quizService.js';

let isLoading = false;
let loadingText = 'Initializing...';
let activeModalCategory = null;

export function QuickMatchView(onQuestionsGenerated, onBack) {

  const categories = [
    { name: 'World Culture', icon: 'public', color: 'text-blue-400', img: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&q=80&w=400', topic: 'World Culture' },
    { name: 'Cinema & TV', icon: 'movie', color: 'text-pink-400', img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400', topic: 'Cinema & TV' },
    { name: 'Food & Drink', icon: 'restaurant', color: 'text-orange-400', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400', topic: 'Food & Drink' },
    { name: 'Global History', icon: 'history_edu', color: 'text-yellow-400', img: 'https://images.unsplash.com/photo-1541194577687-8c63bf9e7ee3?auto=format&fit=crop&q=80&w=400', topic: 'Global History' },
  ];

  const mockLeaderboards = {
    'World Culture': [
      { name: 'AlexTheGreat', score: 9800, avatar: 'person' },
      { name: 'GlobeTrotter', score: 8500, avatar: 'explore' },
      { name: 'MapReader', score: 7200, avatar: 'map' }
    ],
    'Cinema & TV': [
      { name: 'MovieBuff', score: 12500, avatar: 'theaters' },
      { name: 'PopcornKing', score: 11200, avatar: 'fastfood' },
      { name: 'DirectorCut', score: 9800, avatar: 'videocam' }
    ],
    'Food & Drink': [
      { name: 'ChefMaster', score: 8900, avatar: 'local_dining' },
      { name: 'Taster01', score: 8100, avatar: 'ramen_dining' },
      { name: 'SpicyLover', score: 7600, avatar: 'local_fire_department' }
    ],
    'Global History': [
      { name: 'TimeTraveler', score: 10200, avatar: 'hourglass_empty' },
      { name: 'DinoRider', score: 9400, avatar: 'pets' },
      { name: 'OldScrolls', score: 8800, avatar: 'history' }
    ]
  };

  const handleSelect = async (topic) => {
    if (isLoading) return;
    isLoading = true;
    loadingText = 'Connecting to neural network...';
    window.quizbyApp.render();

    const config = { topic, difficulty: 'Standard', questionCount: 5 };

    try {
      const questions = await generateQuizQuestions(config);
      isLoading = false; 
      

      if (typeof onQuestionsGenerated === 'function') {
        onQuestionsGenerated(questions, config);
      } else if (window.quizbyApp && window.quizbyApp.handleQuestionsGenerated) {
        window.quizbyApp.handleQuestionsGenerated(questions, config);
      } else {
        console.error("Routing failed.");
      }
    } catch (e) {
      console.error(e);
      loadingText = 'Fallback protocol activated...';
      isLoading = false;
      window.quizbyApp.render();
    }
  };

  const openModal = (topic) => {
    activeModalCategory = topic;
    window.quizbyApp.render();
  };

  const closeModal = () => {
    activeModalCategory = null;
    window.quizbyApp.render();
  };

  setTimeout(() => {
    const backBtn = document.getElementById('quick-back-btn');
    if (backBtn) backBtn.addEventListener('click', onBack);

    document.querySelectorAll('.category-card').forEach((card, idx) => {
      card.addEventListener('click', () => handleSelect(categories[idx].topic));
    });

    document.querySelectorAll('.view-rankings-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        openModal(e.currentTarget.dataset.topic);
      });
    });

    const closeModalBtn = document.getElementById('close-modal-btn');
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    const modalBackdrop = document.getElementById('modal-backdrop');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
      });
    }
  }, 0);

  if (isLoading) {
    return `
      <div class="flex-1 flex flex-col items-center justify-center p-6 max-w-5xl mx-auto w-full">
        <div class="flex flex-col items-center gap-8 animate-pulse">
           <div class="relative w-24 h-24">
              <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span class="material-symbols-outlined absolute inset-0 flex items-center justify-center text-4xl text-primary animate-pulse">psychology</span>
           </div>
           <div class="text-center">
              <h2 class="text-2xl font-bold text-white mb-2 font-display">${loadingText}</h2>
              <p class="text-slate-400 text-sm tracking-widest uppercase">Building your customized session</p>
           </div>
        </div>
      </div>
    `;
  }

  const renderPlayerRow = (player, rank, isModal = false) => {
    const rankColors = {
      1: 'text-yellow-400 font-bold text-lg',
      2: 'text-slate-300 font-bold text-lg',
      3: 'text-amber-600 font-bold text-lg',
    };
    const rankStyle = rankColors[rank] || 'text-slate-500 font-mono text-sm';
    const paddingClass = isModal ? 'p-3 mb-2' : 'p-2';

    return `
      <div class="flex items-center justify-between ${paddingClass} rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
         <div class="flex items-center gap-3 w-full">
            <div class="w-8 text-center ${rankStyle}">${rank}</div>
            <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
               <span class="material-symbols-outlined text-sm">${player.avatar}</span>
            </div>
            <span class="text-white text-sm font-medium truncate flex-1" title="${player.name}">${player.name}</span>
         </div>
         <span class="text-primary font-mono text-sm font-bold bg-primary/10 px-2 py-1 rounded shrink-0">${player.score}</span>
      </div>
    `;
  };

  const renderModal = () => {
    if (!activeModalCategory) return '';
    const categoryInfo = categories.find(c => c.topic === activeModalCategory);
    const players = mockLeaderboards[activeModalCategory] || [];

    return `
      <div id="modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
         <div class="bg-surface border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            <div class="p-6 border-b border-white/10 flex items-center justify-between bg-white/5 relative overflow-hidden">
               <div class="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"></div>
               <div class="relative z-10 flex items-center gap-3">
                  <span class="material-symbols-outlined ${categoryInfo.color} text-3xl">${categoryInfo.icon}</span>
                  <div>
                    <h3 class="text-xl font-bold text-white font-display">${categoryInfo.name}</h3>
                    <p class="text-xs text-primary font-mono uppercase tracking-widest mt-1">Global Rankings</p>
                  </div>
               </div>
               <button id="close-modal-btn" class="relative z-10 text-slate-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-full">
                  <span class="material-symbols-outlined text-2xl">close</span>
               </button>
            </div>
            <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
               ${players.map((player, index) => renderPlayerRow(player, index + 1, true)).join('')}
               <div class="mt-6 pt-6 border-t border-white/10 text-center">
                  <p class="text-slate-500 text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live Updates Active
                  </p>
               </div>
            </div>
         </div>
      </div>
    `;
  };

  return `
    <div class="flex-1 flex flex-col items-center p-6 md:p-12 max-w-7xl mx-auto w-full overflow-y-auto">
      <div class="w-full space-y-12 animate-fade-in mt-4">
         <div>
             <div class="flex items-center justify-between mb-6">
                <div>
                  <h1 class="text-3xl font-bold text-white font-display">Trending Categories</h1>
                  <p class="text-slate-400 mt-1">Select a topic to start matching</p>
                </div>
                ${Button({
                  variant: 'ghost',
                  icon: 'arrow_back',
                  id: 'quick-back-btn',
                  children: 'Back'
                })}
             </div>

             <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                ${categories.map(cat => `
                  <div class="category-card group relative h-48 rounded-xl overflow-hidden bg-[#1a1a20] border border-white/10 hover:border-primary/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20">
                     <div class="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-40 transition-opacity duration-500" style="background-image: url(${cat.img})"></div>
                     <div class="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                     <div class="absolute bottom-0 left-0 p-5 w-full transform transition-transform duration-300 group-hover:-translate-y-2">
                        <div class="flex items-center justify-between mb-2">
                           <span class="material-symbols-outlined ${cat.color} text-3xl">${cat.icon}</span>
                           <span class="material-symbols-outlined text-white/0 group-hover:text-primary transition-colors">play_circle</span>
                        </div>
                        <h4 class="text-lg font-bold text-white group-hover:text-primary transition-colors">${cat.name}</h4>
                     </div>
                  </div>
                `).join('')}
             </div>
         </div>

         <div class="pt-8 border-t border-white/10">
             <div class="mb-6 flex items-center gap-3">
                <span class="material-symbols-outlined text-yellow-500 text-3xl">emoji_events</span>
                <div>
                  <h2 class="text-2xl font-bold text-white font-display">Hall of Fame</h2>
                  <p class="text-slate-400 text-sm mt-1">Top performers across all categories</p>
                </div>
             </div>
             
             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                ${categories.map(cat => `
                  <div class="bg-surface border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col shadow-lg">
                     <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                     <div class="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                        <span class="material-symbols-outlined ${cat.color} text-xl">${cat.icon}</span>
                        <h3 class="text-white font-bold text-sm tracking-wide">${cat.name}</h3>
                     </div>
                     <div class="space-y-2 flex-1">
                        ${(mockLeaderboards[cat.topic] || []).slice(0, 3).map((player, index) => renderPlayerRow(player, index + 1)).join('')}
                     </div>
                     <div class="mt-4 pt-3 text-center border-t border-white/5">
                         <button class="view-rankings-btn text-xs text-slate-400 hover:text-primary transition-colors font-medium uppercase tracking-wider" data-topic="${cat.topic}">
                            View Full Rankings
                         </button>
                     </div>
                  </div>
                `).join('')}
             </div>
         </div>
      </div>
      ${renderModal()}
    </div>
  `;
}
