import React from 'react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  user: UserProfile;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  return (
    <div className="flex-1 w-full">
       <div className="relative w-full border-b border-white/10 bg-[#140e1a]">
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{
             backgroundImage: 'linear-gradient(to right, rgba(238, 140, 43, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(238, 140, 43, 0.1) 1px, transparent 1px)',
             backgroundSize: '40px 40px'
          }}></div>
          
          <div className="relative z-10 flex flex-col items-center py-12 px-4">
             <div className="relative group mb-6">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                <img src={user.avatarUrl} alt={user.name} className="relative w-32 h-32 rounded-full border-4 border-background-dark object-cover" />
             </div>
             
             <h1 className="text-3xl font-bold text-white mb-2 font-display">{user.name}</h1>
             <div className="flex items-center gap-2 text-primary font-bold text-lg mb-1">
                <span className="material-symbols-outlined">military_tech</span>
                <span>Level {user.level} {user.title}</span>
             </div>
             <p className="text-slate-500 text-sm">Member since October 2023</p>

             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 w-full max-w-[960px]">
                {[
                   { label: 'Total Quizzes', value: user.totalQuizzes, icon: 'quiz', color: 'text-primary' },
                   { label: 'Avg Accuracy', value: user.avgAccuracy + '%', icon: 'analytics', color: 'text-secondary' },
                   { label: 'Current Streak', value: user.streak + ' Days', icon: 'local_fire_department', color: 'text-green-500' }
                ].map((stat) => (
                   <div key={stat.label} className="glass-card rounded-xl p-6 relative overflow-hidden group">
                      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}>
                         <span className="material-symbols-outlined text-6xl">{stat.icon}</span>
                      </div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                      <p className="text-3xl font-bold text-white mt-1 font-display">{stat.value}</p>
                   </div>
                ))}
             </div>
          </div>
       </div>

       <div className="max-w-[960px] mx-auto py-8 px-4">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
             <span className="material-symbols-outlined text-primary">history</span>
             Recent Activity
          </h2>
          
          <div className="rounded-xl border border-white/10 overflow-hidden bg-surface">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-white/5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <tr>
                         <th className="px-6 py-4">Quiz Name</th>
                         <th className="px-6 py-4">Score</th>
                         <th className="px-6 py-4">Date</th>
                         <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                      <tr>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="bg-primary/10 p-2 rounded text-primary"><span className="material-symbols-outlined">javascript</span></div>
                               <div><p className="font-bold text-white">JavaScript Basics</p><p className="text-xs text-slate-500">10 Questions</p></div>
                            </div>
                         </td>
                         <td className="px-6 py-4"><span className="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded">90%</span></td>
                         <td className="px-6 py-4">Oct 12, 2023</td>
                         <td className="px-6 py-4 text-right"><button className="text-primary hover:text-white"><span className="material-symbols-outlined">visibility</span></button></td>
                      </tr>
                      <tr>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="bg-secondary/10 p-2 rounded text-secondary"><span className="material-symbols-outlined">data_object</span></div>
                               <div><p className="font-bold text-white">Python Data Science</p><p className="text-xs text-slate-500">15 Questions</p></div>
                            </div>
                         </td>
                         <td className="px-6 py-4"><span className="text-yellow-400 font-bold bg-yellow-400/10 px-2 py-1 rounded">75%</span></td>
                         <td className="px-6 py-4">Oct 10, 2023</td>
                         <td className="px-6 py-4 text-right"><button className="text-primary hover:text-white"><span className="material-symbols-outlined">visibility</span></button></td>
                      </tr>
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  );
};
