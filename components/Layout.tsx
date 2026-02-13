import React from 'react';
import { AppView, UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  user: UserProfile;
  onChangeView: (view: AppView) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, user, onChangeView, onLogout }) => {
  // HIDDEN HEADER MODE: Splash, Auth, and Register should have no header/footer
  if (currentView === AppView.SPLASH || currentView === AppView.AUTH || currentView === AppView.REGISTER) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col font-display bg-background-dark text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] mix-blend-screen" />
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] mix-blend-screen" />
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-background-dark/80 backdrop-blur-md px-6 py-4">
        <div 
          className="flex items-center gap-4 cursor-pointer" 
          onClick={() => onChangeView(AppView.DASHBOARD)}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-[0_0_15px_rgba(238,140,43,0.3)]">
            <span className="text-white font-bold text-xl">Q</span>
          </div>
          <h2 className="text-white text-lg font-bold tracking-tight uppercase hidden md:block">The Great Quizby</h2>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button 
              onClick={() => onChangeView(AppView.DASHBOARD)} 
              className={`hover:text-primary transition-colors ${currentView === AppView.DASHBOARD ? 'text-primary' : 'text-slate-400'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => onChangeView(AppView.PROFILE)} 
              className={`hover:text-primary transition-colors ${currentView === AppView.PROFILE ? 'text-primary' : 'text-slate-400'}`}
            >
              Profile
            </button>
          </nav>

          <div className="h-6 w-px bg-white/10 hidden md:block"></div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3" onClick={() => onChangeView(AppView.PROFILE)}>
                <div className="text-right hidden sm:block">
                   <p className="text-sm font-bold leading-none text-white">{user.name}</p>
                   <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1">Lvl {user.level}</p>
                </div>
                <img src={user.avatarUrl} alt="Profile" className="w-9 h-9 rounded-full border border-white/20 cursor-pointer" />
             </div>
             <button onClick={onLogout} className="text-slate-400 hover:text-white ml-2">
                <span className="material-symbols-outlined">logout</span>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative z-10 flex flex-col">
        {children}
      </main>
    </div>
  );
};