// static/LeaderboardView.js
export function LeaderboardView(publicQuizzes = []) {
  const hasQuizzes = publicQuizzes && publicQuizzes.length > 0;

  return `
    <div class="flex-1 w-full max-w-[1200px] mx-auto px-6 py-10">
      <div class="mb-10">
        <h1 class="text-4xl font-bold text-white font-display">Leaderboards</h1>
        <p class="text-slate-400 mt-2 text-lg">
          Explore public quizzes and view the top learners for each one.
        </p>
      </div>

      ${
        hasQuizzes
          ? `
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              ${publicQuizzes.map(q => `
                <div class="glass-card rounded-2xl p-6 border border-white/10 hover:border-primary/40 hover:-translate-y-1 transition-all duration-200">
                  
                  <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0">
                      <h2 class="text-2xl font-bold text-white truncate">${q.title}</h2>
                      <p class="text-slate-400 mt-2 capitalize">${q.difficulty} difficulty</p>
                    </div>

                    <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <span class="material-symbols-outlined text-2xl">leaderboard</span>
                    </div>
                  </div>

                  <p class="text-slate-500 text-sm mt-4 min-h-[40px]">
                    ${q.description || 'Challenge yourself, learn, and compare your performance with others.'}
                  </p>

                  <div class="mt-6 flex items-center gap-3">
                    <button
                      class="px-4 py-2 rounded-xl bg-primary text-uom-purple font-bold hover:bg-[#ff9e3d] transition"
                      data-open-quiz-leaderboard="${q.id}"
                      data-quiz-title="${q.title}"
                    >
                      View Rankings
                    </button>

                    <button
                      class="px-4 py-2 rounded-xl border border-white/10 text-white hover:bg-white/5 transition"
                      data-play-public-quiz="${q.id}"
                      data-play-title="${q.title}"
                    >
                      Play Quiz
                    </button>
                  </div>
                </div>
              `).join("")}
            </div>
          `
          : `
            <div class="glass-card rounded-2xl p-10 text-center border border-white/10">
              <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <span class="material-symbols-outlined text-4xl">leaderboard</span>
              </div>
              <h2 class="text-2xl font-bold text-white">No public quizzes yet</h2>
              <p class="text-slate-400 mt-2">
                Once public quizzes are available, their leaderboards will appear here.
              </p>
            </div>
          `
      }
    </div>
  `;
}