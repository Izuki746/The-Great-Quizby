// Password Reset View
import { Button } from './Button.js';

export function PasswordResetView(onResetPassword, onBackToLogin) {
  setTimeout(() => {
    const form = document.getElementById('reset-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('reset-username').value;
        onResetPassword(username);
      });
    }

    const backBtn = document.getElementById('back-to-login-btn');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        onBackToLogin();
      });
    }
  }, 0);

  return `
    <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#1a0524]">
      <!-- Tech Background Lines -->
      <div class="absolute inset-0 pointer-events-none opacity-20">
         <svg class="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
               <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(238,140,43,0.2)" stroke-width="1"/>
               </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
         </svg>
      </div>

      <div class="relative z-10 w-full max-w-[440px]">
        <div class="glass-card rounded-2xl p-8 sm:p-12 border-t border-primary/40 shadow-2xl">
          <div class="mb-10 text-center flex flex-col items-center">
             <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 border border-primary/30 shadow-[0_0_20px_rgba(238,140,43,0.3)]">
                <span class="material-symbols-outlined text-4xl text-primary">lock_reset</span>
             </div>
             <h1 class="text-3xl font-bold text-white mb-2 font-display">Reset Password</h1>
             <p class="text-gray-400 text-xs font-bold uppercase tracking-widest">We'll send you a reset link</p>
          </div>

          <form id="reset-form" class="space-y-6">
            <!-- Success Message Display -->
            <div id="reset-success" class="hidden bg-green-500/10 border border-green-500/50 rounded-xl p-4 text-green-400 text-sm">
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-500 flex-shrink-0">check_circle</span>
                <span id="reset-success-text"></span>
              </div>
            </div>

            <!-- Error Message Display -->
            <div id="reset-error" class="hidden bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm">
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-red-500 flex-shrink-0">error</span>
                <span id="reset-error-text"></span>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-primary uppercase tracking-[0.15em] ml-1">Username or Email</label>
              <div class="relative group">
                <input 
                  type="text" 
                  id="reset-username"
                  placeholder="your_username or email@example.com"
                  required
                  class="w-full bg-[#0d0214]/60 border border-uom-purple/50 text-white rounded-xl p-4 pl-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-600"
                />
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">person</span>
              </div>
              <p class="text-xs text-gray-500 ml-1 mt-1">We'll send a password reset link to your email address</p>
            </div>

            ${Button({
              type: 'submit',
              className: 'w-full text-lg py-4',
              children: `
                <span class="flex items-center gap-2">
                  <span class="material-symbols-outlined">mail</span>
                  SEND RESET LINK
                </span>
              `
            })}
          </form>

          <div class="mt-6 text-center">
            <button id="back-to-login-btn" class="text-xs font-bold text-primary/80 hover:text-primary transition-colors uppercase tracking-wider">
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
