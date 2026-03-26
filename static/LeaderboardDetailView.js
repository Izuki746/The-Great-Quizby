// static/LeaderboardDetailView.js
import { Button } from './Button.js';

export function LeaderboardDetailView(quizTitle, leaderboardEntries = []) {
  const hasEntries = leaderboardEntries && leaderboardEntries.length > 0;

  const rowsHtml = hasEntries
    ? leaderboardEntries.map((entry, index) => {
        const rank = index + 1;

        const rankColor =
          rank === 1
            ? 'text-yellow-400'
            : rank === 2
            ? 'text-slate-300'
            : rank === 3
            ? 'text-amber-600'
            : 'text-slate-500';

        return `
          <div class="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-4">
            <div class="flex items-center gap-4 min-w-0">
              <div class="w-10 text-center font-bold ${rankColor}">
                #${rank}
              </div>

              <div class="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
                <span class="material-symbols-outlined">person</span>
              </div>

              <div class="min-w-0">
                <p class="text-white font-semibold truncate">${entry.username || 'Unknown User'}</p>
                <p class="text-slate-400 text-xs">
                  ${entry.completed_at ? new Date(entry.completed_at).toLocaleDateString() : 'No date'}
                </p>
              </div>
            </div>

            <div class="text-right shrink-0 ml-4">
              <p class="text-primary font-bold text-lg">${entry.score ?? 0}</p>
              <p class="text-slate-500 text-xs">points</p>
            </div>
          </div>
        `;
      }).join('')
    : `
      <div class="rounded-xl border border-dashed border-white/10 px-6 py-12 text-center text-slate-500">
        No leaderboard data yet for this quiz.
      </div>
    `;

  return `
    <div class="flex-1 flex flex-col p-6 md:p-10 max-w-5xl mx-auto w-full">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white font-display">Leaderboard</h1>
          <p class="text-slate-400 mt-1">${quizTitle || 'Quiz Rankings'}</p>
        </div>

        ${Button({
          variant: 'ghost',
          icon: 'arrow_back',
          id: 'leaderboard-detail-back-btn',
          children: 'Back'
        })}
      </div>

      <div class="glass-card rounded-2xl p-6 border border-white/10">
        <div class="mb-6">
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">leaderboard</span>
            Top Learners
          </h2>
          <p class="text-slate-400 text-sm mt-1">See how people performed on this quiz.</p>
        </div>

        <div class="space-y-3">
          ${rowsHtml}
        </div>

        <div class="mt-8 flex justify-center">
          ${Button({
            variant: 'primary',
            icon: 'play_arrow',
            id: 'leaderboard-detail-play-btn',
            children: 'Play This Quiz'
          })}
        </div>
      </div>
    </div>
  `;
}