
import React from 'react';
import { AppView } from '../types';
import { Button } from '../components/Button';

interface DashboardViewProps {
  onViewChange: (view: AppView) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onViewChange }) => {
  const categories = [
    { name: 'World Culture', icon: 'public', players: '1.5k', color: 'text-blue-400', img: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&q=80&w=400' },
    { name: 'Cinema & TV', icon: 'movie', players: '2.3k', color: 'text-pink-400', img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400' },
    { name: 'Food & Drink', icon: 'restaurant', players: '3.1k', color: 'text-orange-400', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400' },
    { name: 'Global History', icon: 'history_edu', players: '980', color: 'text-yellow-400', img: 'https://images.unsplash.com/photo-1461360346148-3470a5d6e241?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center p-6 md:p-12 max-w-7xl mx-auto w-full">
      <div className="text-center space-y-6 animate-float mb-12 mt-8">
         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-purple-300 text-xs font-semibold tracking-wide uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Live Season 4
         </div>
         <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight font-display">
            <span className="block text-white mb-2">MASTER THE CODE.</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-orange-400 to-yellow-500 drop-shadow-[0_0_15px_rgba(238,140,43,0.5)]">WIN THE GAME.</span>
         </h1>
         
         <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mt-8">
            <Button 
              className="h-16 px-8 text-xl" 
              onClick={() => onViewChange(AppView.CREATE_QUIZ)}
              icon="add_circle"
            >
              Create Quiz
            </Button>
            <Button 
              variant="outline" 
              className="h-16 px-8 text-xl"
              onClick={() => onViewChange(AppView.QUICK_MATCH)}
              icon="bolt"
            >
              Quick Match
            </Button>
         </div>
      </div>

      <div className="w-full mt-8">
        <div className="flex items-end justify-between mb-6">
           <div>
              <h3 className="text-2xl font-bold text-white font-display">Trending Categories</h3>
              <p className="text-gray-400 text-sm mt-1">Explore popular topics right now</p>
           </div>
           <button 
             onClick={() => onViewChange(AppView.QUICK_MATCH)}
             className="text-primary hover:text-white flex items-center gap-1 text-sm font-bold uppercase tracking-wide"
           >
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
           </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           {categories.map((cat) => (
             <div 
               key={cat.name}
               className="group relative h-48 rounded-xl overflow-hidden bg-[#1a1a20] border border-white/10 hover:border-primary/50 cursor-pointer transition-all"
               onClick={() => onViewChange(AppView.QUICK_MATCH)}
             >
                <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-40 transition-opacity" style={{ backgroundImage: `url(${cat.img})`}}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-5">
                   <span className={`material-symbols-outlined ${cat.color} mb-2 text-3xl`}>{cat.icon}</span>
                   <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{cat.name}</h4>
                   <p className="text-xs text-gray-400 mt-1 font-mono">{cat.players} Active Players</p>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
