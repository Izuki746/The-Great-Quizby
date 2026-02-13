import React, { useState } from 'react';
import { Button } from '../components/Button';

interface AuthViewProps {
  onLogin: () => void;
  onRegisterClick: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#1a0524]">
      {/* Tech Background Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
               <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(238,140,43,0.2)" strokeWidth="1"/>
               </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
         </svg>
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="glass-card rounded-2xl p-8 sm:p-12 border-t border-primary/40 shadow-2xl">
          <div className="mb-10 text-center flex flex-col items-center">
             <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 border border-primary/30 shadow-[0_0_20px_rgba(238,140,43,0.3)]">
                <span className="material-symbols-outlined text-4xl text-primary">fingerprint</span>
             </div>
             <h1 className="text-3xl font-bold text-white mb-2 font-display">The Great Quizby</h1>
             <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">University of Manchester Tech Quiz</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary uppercase tracking-[0.15em] ml-1">University ID</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@manchester.ac.uk"
                  className="w-full bg-[#0d0214]/60 border border-uom-purple/50 text-white rounded-xl p-4 pl-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-600"
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">person</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-primary uppercase tracking-[0.15em] ml-1">Password</label>
              <div className="relative group">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0d0214]/60 border border-uom-purple/50 text-white rounded-xl p-4 pl-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-600"
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">lock</span>
              </div>
            </div>

            <div className="flex justify-end">
               <a href="#" className="text-xs font-bold text-primary/80 hover:text-primary">Forgot Password?</a>
            </div>

            <Button type="submit" className="w-full text-lg py-4">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined">login</span>
                LOGIN
              </span>
            </Button>
          </form>

          <div className="relative my-8">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
             <div className="relative flex justify-center">
                <span className="bg-[#1a0524] px-4 text-[10px] font-black text-uom-purple uppercase tracking-[0.2em] border border-uom-purple/40 rounded-full">Secure Auth</span>
             </div>
          </div>

          <div className="text-center">
             <p className="text-sm text-gray-400">
               New student? 
               <button onClick={onRegisterClick} className="font-bold text-white hover:text-primary ml-1 underline underline-offset-4 decoration-primary/50">
                 Create account
               </button>
             </p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-[10px] text-primary/40 font-mono tracking-[0.3em] uppercase">The University of Manchester</p>
        </div>
      </div>
    </div>
  );
};