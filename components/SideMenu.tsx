
import React from 'react';
import { UserProfile, CreditBalance } from '../types';
import { X, Settings, Shield, User, Wallet, Key, Zap, logOut, LogOut, Ghost } from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  credits: CreditBalance;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, user, credits }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 w-[280px] bg-zinc-900 border-r border-zinc-800 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SoloFlow</h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400">
              <X size={20} />
            </button>
          </div>

          {/* User Card */}
          <div className="bg-zinc-800/50 rounded-2xl p-4 mb-6 border border-zinc-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 ${user.isAnonymous ? 'bg-zinc-700 border-zinc-500' : 'bg-indigo-600 border-indigo-400'}`}>
                {user.isAnonymous ? <Ghost size={24} /> : user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full rounded-full" /> : 'HL'}
              </div>
              <div>
                <h3 className="font-bold text-white">{user.isAnonymous ? 'Anon Ghost' : user.displayName}</h3>
                <span className="text-[10px] uppercase tracking-wider bg-zinc-700 px-2 py-0.5 rounded text-zinc-300">
                  {user.isAnonymous ? 'Incognito' : 'Pro Member'}
                </span>
              </div>
            </div>
            
            {/* Persona Switcher (Inferred from 'personas' table) */}
            <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors">
              <Shield size={12} />
              {user.isAnonymous ? 'Switch to Public Profile' : 'Switch to Anonymous'}
            </button>
          </div>

          {/* Economy / Credits (Inferred from 'user_credits' & 'ask_credits') */}
          <div className="space-y-4 mb-8">
             <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 flex items-center gap-2"><Zap size={14} className="text-yellow-500" /> Gen Credits</span>
                <span className="font-bold">{credits.generation}</span>
             </div>
             {/* Progress bar for credits */}
             <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
               <div className="bg-yellow-500 h-full w-[75%]"></div>
             </div>

             <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-zinc-400 flex items-center gap-2"><Wallet size={14} className="text-emerald-500" /> Ask Credits</span>
                <span className="font-bold">{credits.community}</span>
             </div>
             <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
               <div className="bg-emerald-500 h-full w-[30%]"></div>
             </div>
             
             <button className="text-xs text-indigo-400 hover:text-indigo-300 w-full text-left mt-1">
               + Top Up Credits
             </button>
          </div>

          {/* Menu Items */}
          <div className="space-y-2 flex-1">
             <MenuItem icon={<User size={18} />} label="Brand Voice Profile" />
             <MenuItem icon={<Key size={18} />} label="API Keys" subtext="Gemini, OpenAI, Anthropic" />
             <MenuItem icon={<Settings size={18} />} label="App Preferences" />
          </div>

          {/* Footer */}
          <button className="flex items-center gap-3 text-zinc-500 hover:text-red-400 p-2 transition-colors">
            <LogOut size={18} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; subtext?: string }> = ({ icon, label, subtext }) => (
  <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors text-left group">
    <div className="text-zinc-400 group-hover:text-white transition-colors">{icon}</div>
    <div>
      <div className="text-sm font-medium text-zinc-300 group-hover:text-white">{label}</div>
      {subtext && <div className="text-[10px] text-zinc-500">{subtext}</div>}
    </div>
  </button>
);

export default SideMenu;
