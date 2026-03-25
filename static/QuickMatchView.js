// static/QuickMatchView.js
import { Button } from './Button.js';

export function QuickMatchView(myQuizzes, availableQuizzes, onQuestionsGenerated, onPlayUserQuiz, onBack) {
  const availableQuizCards = Array.isArray(availableQuizzes)
    ? availableQuizzes.map(quiz => `
      <div class="glass-card rounded-xl p-4">
        <h3 class="text-white font-bold text-lg">${quiz.title}</h3>
        <p class="text-slate-400 text-sm mt-2">${quiz.description || 'No description available'}</p>
        <p class="text-slate-500 text-xs mt-2">${quiz.difficulty || ''}</p>

        <button
          class="mt-4 text-green-400 hover:text-green-600"
          data-play-id="${quiz.id}"
          data-play-title="${quiz.title}"
        >
          <span class="material-symbols-outlined text-3xl">play_arrow</span>
        </button>
      </div>
    `).join('')
    : '';

  const myQuizCards = Array.isArray(myQuizzes)
    ? myQuizzes.map(quiz => `
      <div class="glass-card rounded-xl p-4">
        <h3 class="text-white font-bold text-lg">${quiz.title}</h3>
        <p class="text-slate-400 text-sm mt-2">${quiz.difficulty || ''}</p>

        <button
          class="mt-4 text-green-400 hover:text-green-600"
          data-play-id="${quiz.id}"
          data-play-title="${quiz.title}"
        >
          <span class="material-symbols-outlined text-3xl">play_arrow</span>
        </button>
      </div>
    `).join('')
    : '';

  setTimeout(() => {
    document.querySelectorAll("[data-play-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const quizId = btn.getAttribute("data-play-id");
        const quizTitle = btn.getAttribute("data-play-title");
        onPlayUserQuiz(quizId, quizTitle);
      });
    });

    const backBtn = document.getElementById('quick-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', onBack);
    }
  }, 0);

  return `
    <div class="flex-1 flex flex-col items-center p-6 md:p-12 max-w-7xl mx-auto w-full overflow-y-auto">
      <div class="w-full space-y-12 mt-4">

        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-white font-display">Available Quizzes</h1>
            <p class="text-slate-400 mt-1">Play official quizzes or your own quizzes</p>
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
            ${availableQuizCards || '<p class="text-slate-400">No official quizzes available yet.</p>'}
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