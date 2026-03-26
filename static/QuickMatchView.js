import { Button } from './Button.js';
export function QuickMatchView(myQuizzes, availableQuizzes, onStart, onPlayUserQuiz, onBack) {


  // 🔹 Split quizzes
  const officialQuizzes = availableQuizzes.filter(q => q.is_official === 1);
  const communityQuizzes = availableQuizzes.filter(q => q.is_official === 0);

  // 🔹 Official cards
  const officialQuizCards = officialQuizzes.map(q => `
    <div class="glass-card p-4 rounded-xl">
      <h3 class="text-white font-bold">${q.title}</h3>
      <p class="text-slate-400 text-sm">${q.description || ''}</p>
      <button class="text-primary mt-2" data-play-id="${q.id}" data-play-title="${q.title}">
        Play
      </button>
    </div>
  `).join('');

  // 🔹 Community cards
  const communityQuizCards = communityQuizzes.map(q => `
    <div class="glass-card p-4 rounded-xl">
      <h3 class="text-white font-bold">${q.title}</h3>
      <p class="text-slate-400 text-sm">Community Quiz</p>
      <button class="text-primary mt-2" data-play-id="${q.id}" data-play-title="${q.title}">
        Play
      </button>
    </div>
  `).join('');

  // 🔹 My quiz cards (your existing logic but safe)
  const myQuizCards = myQuizzes.map(q => `
    <div class="glass-card p-4 rounded-xl">
      <h3 class="text-white font-bold">${q.title}</h3>
      <p class="text-slate-400 text-sm">${q.difficulty || ''}</p>
      <button class="text-primary mt-2" data-play-id="${q.id}" data-play-title="${q.title}">
        Play
      </button>
    </div>
  `).join('');

  return `
  <div class="flex-1 flex flex-col items-center p-6 md:p-12 max-w-7xl mx-auto w-full overflow-y-auto">
    <div class="w-full space-y-12 mt-4">

      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-white font-display">Available Quizzes</h1>
          <p class="text-slate-400 mt-1">Play official quizzes, community quizzes, or your own quizzes</p>
        </div>
        ${Button({
          variant: 'ghost',
          icon: 'arrow_back',
          id: 'quick-back-btn',
          children: 'Back'
        })}
      </div>

      <div>
        <h2 class="text-2xl font-bold text-white mb-4">Official Quizzes</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${officialQuizCards || '<p class="text-slate-400">No official quizzes available yet.</p>'}
        </div>
      </div>

      <div class="pt-8 border-t border-white/10">
        <h2 class="text-2xl font-bold text-white mb-4">Community Quizzes</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${communityQuizCards || '<p class="text-slate-400">No community quizzes available yet.</p>'}
        </div>
      </div>

      <div class="pt-8 border-t border-white/10">
        <h2 class="text-2xl font-bold text-white mb-4">My Quizzes</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${myQuizCards || '<p class="text-slate-400">You have not created any quizzes yet.</p>'}
        </div>
      </div>

    </div>
  </div>
`;
}