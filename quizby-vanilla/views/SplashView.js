// Splash View
export function SplashView() {
  return `
    <div class="relative w-full h-screen flex flex-col items-center justify-center p-6 bg-[#0f0a1a] overflow-hidden">
      <!-- Background Ambience -->
      <div class="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(45,27,77,0.4)_0%,#0f0a1a_85%)]"></div>
      
      <div class="relative z-10 flex flex-col items-center justify-center w-full max-w-md animate-float">
        
        <!-- Logo Container -->
        <div class="relative flex items-center justify-center w-44 h-44 mb-12 rounded-3xl bg-[#2a1d2e]/80 backdrop-blur-xl border border-white/10 animate-pulse-glow shadow-2xl">
           <div class="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-primary via-purple-500 to-primary opacity-50"></div>
           <!-- Logo SVG -->
           <svg class="w-28 h-28 relative z-10 drop-shadow-[0_0_20px_rgba(238,140,43,0.4)]" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="qGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" style="stop-color: #ee8c2b; stop-opacity: 1" />
                  <stop offset="100%" style="stop-color: #7c3aed; stop-opacity: 1" />
                </linearGradient>
                <filter id="neonGlow" height="200%" width="200%" x="-50%" y="-50%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g filter="url(#neonGlow)">
                <path d="M50 20C33.43 20 20 33.43 20 50C20 66.57 33.43 80 50 80C57.4 80 64.18 77.31 69.39 72.84" fill="none" stroke="url(#qGradient)" stroke-linecap="round" stroke-width="10" />
                <path d="M70 70L85 85" fill="none" stroke="url(#qGradient)" stroke-linecap="round" stroke-width="10" />
                <rect x="70" y="45" width="10" height="10" rx="2" fill="url(#qGradient)" />
              </g>
           </svg>
        </div>

        <h1 class="text-4xl md:text-5xl font-bold tracking-tight text-center mb-2 text-white font-display bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-gray-400">
          The Great Quizby
        </h1>
        <p class="text-white/80 text-sm tracking-[0.25em] uppercase mb-16 font-medium font-display">
          Knowledge Refined
        </p>

        <!-- Loading Bar -->
        <div class="w-full flex flex-col items-center gap-4 p-5 rounded-xl bg-[#1a0d26]/60 backdrop-blur-md border border-white/10 shadow-xl">
          <div class="w-64 h-1.5 bg-black/40 rounded-full overflow-hidden relative shadow-inner border border-white/5">
            <div class="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-primary via-orange-300 to-purple-500 rounded-full shadow-[0_0_15px_rgba(238,140,43,0.8)] animate-loading-bar"></div>
          </div>
          <div class="flex items-center gap-2 text-orange-200 text-xs font-semibold tracking-wide drop-shadow-sm uppercase">
            <span class="material-symbols-outlined text-sm animate-spin text-primary">data_usage</span>
            <span>Initializing neural sync...</span>
          </div>
        </div>
      </div>

      <div class="absolute bottom-8 text-white/30 text-[10px] font-mono tracking-widest uppercase">
        v2.5.0-beta • UoM Build
      </div>
    </div>
  `;
}
