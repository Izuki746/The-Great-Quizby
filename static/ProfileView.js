// Profile View
export function ProfileView(user) {
  return `
    <div class="flex-1 w-full overflow-hidden">
       <div class="relative w-full border-b border-white/10 bg-[#140e1a]">
          <div class="absolute inset-0 pointer-events-none opacity-20" style="background-image: linear-gradient(to right, rgba(238, 140, 43, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(238, 140, 43, 0.1) 1px, transparent 1px); background-size: 40px 40px;"></div>
          
          <div class="relative z-10 flex flex-col items-center py-12 px-4">
             <div class="relative group mb-6">
                <div class="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                <img src="${user.avatarUrl}" alt="${user.name}" class="relative w-32 h-32 rounded-full border-4 border-background-dark object-cover" />
             </div>
             
             <h1 class="text-3xl font-bold text-white mb-2 font-display">${user.name}</h1>
             <div class="flex items-center gap-2 text-primary font-bold text-lg mb-1">
                <span class="material-symbols-outlined">military_tech</span>
                <span>Level ${user.level} ${user.title}</span>
             </div>

             <!-- Optimized Stats Grid -->
             <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 w-full max-w-[960px] justify-items-center">

                <div class="glass-card rounded-xl p-6 relative overflow-hidden group text-center">
                   <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
                      <span class="material-symbols-outlined text-6xl">quiz</span>
                   </div>
                   <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Quizzes</p>
                   <p class="text-3xl font-bold text-white mt-1 font-display">${user.totalQuizzes}</p>
                </div>

                <div class="glass-card rounded-xl p-6 relative overflow-hidden group text-center">
                   <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-secondary">
                      <span class="material-symbols-outlined text-6xl">analytics</span>
                   </div>
                   <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg Accuracy</p>
                   <p class="text-3xl font-bold text-white mt-1 font-display">${user.avgAccuracy}%</p>
                </div>

             </div>
          </div>
       </div>

       <div class="max-w-[960px] mx-auto py-8 px-4">

          <!-- My Quizzes Section -->
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
             <span class="material-symbols-outlined text-primary">folder_special</span>
             My Quizzes
          </h2>

          <div class="space-y-4">
            ${
              user.quizzes && user.quizzes.length > 0
                ? user.quizzes
                    .map(
                      (q, i) => `
              <div class="glass-card rounded-xl p-5 flex justify-between items-center">
                <div>
                  <p class="text-white font-bold text-lg">${q.name}</p>
                  <p class="text-slate-400 text-sm">${q.questions.length} Questions</p>
                  <p class="text-slate-500 text-xs mt-1">${new Date(q.createdAt).toLocaleDateString()}</p>
                </div>

                <div class="flex items-center gap-4">

                  <!-- Preview -->
                  <button class="text-primary hover:text-white" data-quiz-index="${i}">
                    <span class="material-symbols-outlined text-3xl">visibility</span>
                  </button>

                  <!-- Edit -->
                  <button class="text-yellow-400 hover:text-yellow-600" data-edit-index="${i}">
                    <span class="material-symbols-outlined text-3xl">edit</span>
                  </button>

                  <!-- Delete -->
                  <button class="text-red-400 hover:text-red-600" data-delete-index="${i}">
                    <span class="material-symbols-outlined text-3xl">delete</span>
                  </button>

                </div>
              </div>
            `
                    )
                    .join("")
                : `<p class="text-slate-500">You haven't created any quizzes yet.</p>`
            }
          </div>

          <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3 mt-10">
             <span class="material-symbols-outlined text-primary">history</span>
             Recent Activity
          </h2>
          
          <div class="rounded-xl border border-white/10 overflow-hidden bg-surface">
             <div class="overflow-x-auto">
                <table class="w-full text-left">
                   <thead class="bg-white/5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <tr>
                         <th class="px-6 py-4">Quiz Name</th>
                         <th class="px-6 py-4">Score</th>
                         <th class="px-6 py-4">Date</th>
                         <th class="px-6 py-4 text-right">Action</th>
                      </tr>
                   </thead>
                   <tbody class="divide-y divide-white/5 text-sm text-slate-300">
                      <tr>
                         <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                               <div class="bg-primary/10 p-2 rounded text-primary"><span class="material-symbols-outlined">javascript</span></div>
                               <div><p class="font-bold text-white">JavaScript Basics</p><p class="text-xs text-slate-500">10 Questions</p></div>
                            </div>
                         </td>
                         <td class="px-6 py-4"><span class="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded">90%</span></td>
                         <td class="px-6 py-4">Oct 12, 2023</td>
                         <td class="px-6 py-4 text-right"><button class="text-primary hover:text-white"><span class="material-symbols-outlined">visibility</span></button></td>
                      </tr>
                      <tr>
                         <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                               <div class="bg-secondary/10 p-2 rounded text-secondary"><span class="material-symbols-outlined">data_object</span></div>
                               <div><p class="font-bold text-white">Python Data Science</p><p class="text-xs text-slate-500">15 Questions</p></div>
                            </div>
                         </td>
                         <td class="px-6 py-4"><span class="text-yellow-400 font-bold bg-yellow-400/10 px-2 py-1 rounded">75%</span></td>
                         <td class="px-6 py-4">Oct 10, 2023</td>
                         <td class="px-6 py-4 text-right"><button class="text-primary hover:text-white"><span class="material-symbols-outlined">visibility</span></button></td>
                      </tr>
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  `;
}

