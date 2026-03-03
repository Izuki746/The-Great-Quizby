// static/QuickMatchView.js
import { Button } from './Button.js';
import { generateQuizQuestions } from './quizService.js';

export function QuickMatchView(onQuestionsGenerated, onBack) {
  let isLoading = false;
  let loadingText = 'Initializing...';

  // 从主页迁移过来的 categories 数据，并加上 topic 以便于生成对应题目
  const categories = [
    { name: 'World Culture', icon: 'public', players: '1.5k', color: 'text-blue-400', img: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&q=80&w=400', topic: 'World Culture' },
    { name: 'Cinema & TV', icon: 'movie', players: '2.3k', color: 'text-pink-400', img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400', topic: 'Cinema & TV' },
    { name: 'Food & Drink', icon: 'restaurant', players: '3.1k', color: 'text-orange-400', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400', topic: 'Food & Drink' },
    { name: 'Global History', icon: 'history_edu', players: '980', color: 'text-yellow-400', img: 'https://images.unsplash.com/photo-1461360346148-3470a5d6e241?auto=format&fit=crop&q=80&w=400', topic: 'Global History' },
  ];

  const handleSelect = async (topic) => {
    isLoading = true;
    loadingText = 'Connecting to neural network...';
    window.quizbyApp.render();

    const config = {
      topic,
      difficulty: 'Standard',
      questionCount: 5
    };

    try {
      loadingText = 'Synthesizing questions...';
      const questions = await generateQuizQuestions(config);
      onQuestionsGenerated(questions, config);
    } catch (e) {
      console.error(e);
      loadingText = 'Fallback protocol activated...';
      isLoading = false;
      window.quizbyApp.render();
    }
  };

  setTimeout(() => {
    const backBtn = document.getElementById('quick-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', onBack);
    }

    // 给新的分类卡片绑定点击事件
    document.querySelectorAll('.category-card').forEach((card, idx) => {
      card.addEventListener('click', () => handleSelect(categories[idx].topic));
    });
  }, 0);

  // 题目加载动画
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

  // 渲染迁移过来的分类卡片
  return `
    <div class="flex-1 flex flex-col items-center p-6 md:p-12 max-w-7xl mx-auto w-full">
      <div class="w-full space-y-8 animate-fade-in mt-8">
         <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-3xl font-bold text-white font-display">Trending Categories</h1>
              <p class="text-slate-400 mt-1">Explore popular topics right now</p>
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
              <div class="category-card group relative h-48 rounded-xl overflow-hidden bg-[#1a1a20] border border-white/10 hover:border-primary/50 cursor-pointer transition-all">
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
