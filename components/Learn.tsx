
import React from 'react';
import { PlayCircle, FileText, Download, CheckCircle, Lock } from 'lucide-react';

const Learn: React.FC = () => {
  return (
    <div className="flex flex-col h-full p-4 space-y-6 overflow-y-auto pb-safe">
      <div className="flex-none">
        <h2 className="text-2xl font-bold text-white mb-1">Growth Hub</h2>
        <p className="text-zinc-400 text-sm">Master the solopreneur journey.</p>
      </div>

      {/* Featured Course (Active) */}
      <div className="bg-gradient-to-br from-indigo-900 to-zinc-900 rounded-2xl p-5 border border-indigo-500/30 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
             <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-2 py-1 rounded-full">Current Module</span>
             <span className="text-xs font-mono text-indigo-300">65% Complete</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Pricing Power & Packaging</h3>
          <p className="text-sm text-indigo-200/70 mb-4">Learn how to productize your service into high-ticket offers.</p>
          
          <button className="flex items-center gap-2 bg-white text-indigo-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors">
            <PlayCircle size={16} fill="currentColor" />
            Resume Lesson 3
          </button>
        </div>
        {/* Abstract shapes */}
        <div className="absolute right-[-20px] bottom-[-40px] w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Course List (Inferred from 'course_modules') */}
      <div>
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Core Curriculum</h3>
        <div className="space-y-3">
           <ModuleCard 
             title="1. The Clarify Stage" 
             desc="Nailing your niche and avatar." 
             progress={100}
             isLocked={false}
           />
           <ModuleCard 
             title="2. Offer Design" 
             desc="Building your signature service." 
             progress={65}
             isLocked={false}
           />
           <ModuleCard 
             title="3. Content Systems" 
             desc="Automating your lead flow." 
             progress={0}
             isLocked={true}
           />
        </div>
      </div>

      {/* Resources (Inferred from 'resource_library') */}
      <div>
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3 mt-4">Resources</h3>
        <div className="grid grid-cols-2 gap-3">
           <ResourceCard type="PDF" title="Niche Finder Workbook" size="2.4 MB" />
           <ResourceCard type="Template" title="Cold Outreach Scripts" size="15 KB" />
           <ResourceCard type="Sheet" title="Pricing Calculator" size="450 KB" />
        </div>
      </div>
    </div>
  );
};

const ModuleCard: React.FC<{ title: string; desc: string; progress: number; isLocked: boolean }> = ({ title, desc, progress, isLocked }) => (
  <div className={`p-4 rounded-xl border flex items-center gap-4 ${isLocked ? 'bg-zinc-900/50 border-zinc-800 opacity-60' : 'bg-zinc-900 border-zinc-700 hover:border-zinc-600'}`}>
     <div className="flex-none">
        {isLocked ? (
           <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600">
             <Lock size={18} />
           </div>
        ) : progress === 100 ? (
           <div className="w-10 h-10 rounded-full bg-green-900/20 flex items-center justify-center text-green-500">
             <CheckCircle size={18} />
           </div>
        ) : (
           <div className="w-10 h-10 rounded-full border-2 border-zinc-700 relative flex items-center justify-center">
              <span className="text-[10px] font-bold">{progress}%</span>
           </div>
        )}
     </div>
     <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm truncate">{title}</h4>
        <p className="text-xs text-zinc-500 truncate">{desc}</p>
     </div>
  </div>
);

const ResourceCard: React.FC<{ type: string; title: string; size: string }> = ({ type, title, size }) => (
  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col gap-2 hover:bg-zinc-800 transition-colors cursor-pointer">
     <div className="flex justify-between items-start">
        <div className="p-1.5 bg-zinc-800 rounded text-zinc-400">
           <FileText size={16} />
        </div>
        <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">{type}</span>
     </div>
     <div>
        <h4 className="font-medium text-xs text-zinc-300 line-clamp-2">{title}</h4>
        <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-600">
           <Download size={10} /> {size}
        </div>
     </div>
  </div>
);

export default Learn;
