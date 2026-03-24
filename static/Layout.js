// Layout Component - Header and Footer wrapper
import { AppView } from './app.js';

export function Layout(children, currentView, user, onChangeView, onLogout) {
  return `
    <div class="min-h-screen flex flex-col font-display bg-background-dark text-white relative overflow-hidden">
      <!-- Background Ambience -->
      <div class="fixed inset-0 z-0 pointer-events-none">
         <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] mix-blend-screen"></div>
         <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] mix-blend-screen"></div>
         <!-- Removed the texture layer that caused 'Available Quizzes' -->
      </div>

      <!-- Header -->
      <header class="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-background-dark/80 backdrop-blur-md px-6 py-4">
        <div class="flex items-center gap-4 cursor-pointer" onclick="window.quizbyApp.changeView('DASHBOARD')">
          <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-[0_0_15px_rgba(238,140,43,0.3)]">
            <span class="text-white font-bold text-xl">Q</span>
          </div>
          <h2 class="text-white text-lg font-bold tracking-tight uppercase hidden md:block">The Great Quizby</h2>
        </div>
        
        <div class="flex items-center gap-6">
          <!-- Nav Links (Desktop) -->
          <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
            <button 
              onclick="window.quizbyApp.changeView('DASHBOARD')" 
              class="hover:text-primary transition-colors ${currentView === 'DASHBOARD' ? 'text-primary' : 'text-slate-400'}"
            >
              Dashboard
            </button>
            <button 
              onclick="window.quizbyApp.changeView('PROFILE')" 
              class="hover:text-primary transition-colors ${currentView === 'PROFILE' ? 'text-primary' : 'text-slate-400'}"
            >
              Profile
            </button>
          </nav>

          <div class="h-6 w-px bg-white/10 hidden md:block"></div>

          <div class="flex items-center gap-4">
             <div class="flex items-center gap-3 cursor-pointer" onclick="window.quizbyApp.changeView('PROFILE')">
                <div class="text-right hidden sm:block">
                   <p class="text-sm font-bold leading-none text-white">${user.name}</p>
                   <p class="text-[10px] text-primary font-bold uppercase tracking-wider mt-1">Lvl ${user.level}</p>
                </div>
                <img src="${user.avatarUrl}" alt="Profile" class="w-9 h-9 rounded-full border border-white/20 cursor-pointer" />
             </div>
             <button onclick="window.quizbyApp.handleLogout()" class="text-slate-400 hover:text-white ml-2">
                <span class="material-symbols-outlined">logout</span>
             </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-grow relative z-10 flex flex-col">
        <div class="animate-fade-in flex-grow flex flex-col">
          ${children}
        </div>
      </main>
    </div>
  `;
}
