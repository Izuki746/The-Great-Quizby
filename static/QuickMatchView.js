// Quick Match View
import { Button } from './Button.js';
import { generateQuizQuestions } from './quizService.js';

export function QuickMatchView(onQuestionsGenerated, onBack) {
  let isLoading = false;
  let loadingText = 'Initializing...';

  const quickCategories = [
    { id: 'tech', name: 'Tech & Coding', icon: 'terminal', color: 'from-blue-500/20 to-cyan-500/20', borderColor: 'group-hover:border-blue-500', iconColor: 'text-blue-400', topic: 'Modern Web Development and System Architecture' },
    { id: 'science', name: 'Deep Science', icon: 'science', color: 'from-emerald-500/20 to-teal-500/20', borderColor: 'group-hover:border-emerald-500', iconColor: 'text-emerald-400', topic: 'Quantum Physics and Molecular Biology Foundations' },
    { id: 'humanities', name: 'Humanities', icon: 'menu_book', color: 'from-amber-500/20 to-orange-500/20', borderColor: 'group-hover:border-amber-500', iconColor: 'text-amber-400', topic: 'Philosophy and Global Sociology' },
    { id: 'arts', name: 'Creative Arts', icon: 'palette', color: 'from-pink-500/20 to-rose-500/20', borderColor: 'group-hover:border-pink-500', iconColor: 'text-pink-400', topic: 'Post-Modern Art History and Design Principles' },
    { id: 'math', name: 'Mathematics', icon: 'functions', color: 'from-indigo-500/20 to-purple-500/20', borderColor: 'group-hover:border-indigo-500', iconColor: 'text-indigo-400', topic: 'Advanced Calculus and Statistics' },
    { id: 'business', name: 'Economics', icon: 'payments', color: 'from-slate-500/20 to-gray-500/20', borderColor: 'group-hover:border-white', iconColor: 'text-slate-300', topic: 'Global Macroeconomics and Finance' },
  ];

  const handleSelect = async (topic) => {
    isLoading = true;
    loadingText = 'Connecting to neural network...';
    window.quizbyApp.render();

    const config = {
      topic,
      difficulty: 'Undergrad',
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

  setTimeout(() => {
    const backBtn = document.getElementById('quick-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', onBack);
    }

    document.querySelectorAll('.category-select').forEach((btn, idx) => {
      btn.addEventListener('click', () => handleSelect(quickCategories[idx].topic));
    });

    const surpriseBtn = document.getElementById('surprise-btn');
    if (surpriseBtn) {
      surpriseBtn.addEventListener('click', handleSurpriseMe);
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

  return `
    <div class="flex-1 flex flex-col items-center justify-center p-6 max-w-5xl mx-auto w-full">
      <div class="w-full space-y-8 animate-fade-in">
         <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-white font-display">Select Challenge</h1>
              <p class="text-slate-400 mt-1">Choose a category to start your rapid assessment</p>
            </div>
            ${Button({
              variant: 'ghost',
              icon: 'arrow_back',
              id: 'quick-back-btn',
              children: 'Back'
            })}
         </div>

         <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            ${quickCategories.map(cat => `
               <button
                  class="category-select group relative flex flex-col items-start p-6 rounded-2xl bg-gradient-to-br ${cat.color} border border-white/5 transition-all hover:scale-[1.02] active:scale-[0.98] ${cat.borderColor} hover:shadow-2xl"
               >
                  <div class="p-3 rounded-xl bg-black/40 mb-4 ${cat.iconColor}">
                     <span class="material-symbols-outlined text-3xl">${cat.icon}</span>
                  </div>
                  <h3 class="text-xl font-bold text-white mb-1">${cat.name}</h3>
                  <p class="text-xs text-slate-400 text-left line-clamp-2">Standard University of Manchester ${cat.name} assessment module.</p>
                  
                  <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <span class="material-symbols-outlined text-primary">bolt</span>
                  </div>
               </button>
            `).join('')}
         </div>

         <div class="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5">
            <div class="flex items-center gap-4">
               <div class="size-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span class="material-symbols-outlined text-primary">auto_awesome</span>
               </div>
               <div>
                  <p class="text-white font-bold">Uncertain?</p>
                  <p class="text-xs text-slate-400 uppercase tracking-widest font-bold">Try Random Neural Topic</p>
               </div>
            </div>
            ${Button({
              variant: 'primary',
              className: 'w-full sm:w-auto px-12',
              icon: 'casino',
              id: 'surprise-btn',
              children: 'Surprise Me'
            })}
         </div>
      </div>
    </div>
  `;
}
