
import React from 'react';
import { CommunityTab } from '../types';
import { MessageSquare, Users, Heart, Share2, Award, Zap, Ghost, EyeOff, MessageCircle } from 'lucide-react';

interface CommunityProps {
  activeTab: CommunityTab;
}

const Community: React.FC<CommunityProps> = ({ activeTab }) => {
  const renderFeed = () => (
    <div className="space-y-4 p-4 pb-20">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold">
              {i === 1 ? 'SJ' : i === 2 ? 'MK' : 'AL'}
            </div>
            <div>
              <h4 className="font-medium text-sm text-zinc-200">
                {i === 1 ? 'Sarah Jenkins' : i === 2 ? 'Mike K.' : 'Anna Lee'}
              </h4>
              <p className="text-xs text-zinc-500">Freelance Strategist • 2h ago</p>
            </div>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {i === 1 
              ? "Just used the new Veo video tool to pitch a client. The render quality is insane! 🚀 Has anyone tried combining it with the text scripts yet?"
              : i === 2
              ? "Struggling with my niche. Do you guys think 'AI for Florists' is too narrow, or just right?"
              : "Looking for an accountability partner for the 30-day content sprint. EST timezone preferred!"}
          </p>
          <div className="flex items-center gap-4 pt-2 border-t border-zinc-800/50">
            <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors">
              <Heart size={14} /> <span>{12 + i * 5}</span>
            </button>
            <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-indigo-400 transition-colors">
              <MessageSquare size={14} /> <span>{3 + i}</span>
            </button>
            <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors ml-auto">
              <Share2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPods = () => (
    <div className="space-y-4 p-4 pb-20">
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-2xl p-5 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="font-bold text-lg mb-1">Your Active Pod</h3>
          <p className="text-indigo-200 text-xs mb-4">Content Sprint: Week 3 of 4</p>
          <div className="flex -space-x-2 mb-4">
             {[1,2,3,4].map(k => (
               <div key={k} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-700 flex items-center justify-center text-[10px] text-zinc-300">
                 U{k}
               </div>
             ))}
             <div className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500">
               +2
             </div>
          </div>
          <button className="w-full py-2 bg-indigo-600 rounded-xl text-xs font-semibold hover:bg-indigo-500 transition-colors">
            Enter Pod Chat
          </button>
        </div>
        <Zap className="absolute right-[-20px] top-[-20px] text-indigo-500/20" size={120} />
      </div>

      <h3 className="text-sm font-semibold text-zinc-400 mt-6 mb-2">Recommended Pods</h3>
      {[1, 2].map((i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
               <Users size={20} />
             </div>
             <div>
               <h4 className="text-sm font-medium">{i === 1 ? 'SaaS Founders' : 'Visual Artists'}</h4>
               <p className="text-xs text-zinc-500">{150 + i * 10} members</p>
             </div>
          </div>
          <button className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs font-medium hover:bg-zinc-800">
            Join
          </button>
        </div>
      ))}
    </div>
  );

  const renderMentors = () => (
    <div className="p-4 space-y-4 pb-20">
      <div className="text-center py-6">
        <Award size={40} className="mx-auto text-yellow-500 mb-3" />
        <h3 className="text-lg font-bold">Expert Reviews</h3>
        <p className="text-zinc-400 text-sm">Get feedback on your generated content from industry pros.</p>
      </div>
      
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
           <div className="flex gap-4">
             <div className="w-12 h-12 rounded-full bg-zinc-800 flex-none bg-cover bg-center" style={{backgroundImage: `url(https://i.pravatar.cc/150?u=${i+10})`}}></div>
             <div className="flex-1">
               <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm">Alex Rivera</h4>
                    <p className="text-xs text-zinc-500">Video Marketing Lead</p>
                  </div>
                  <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">Available</span>
               </div>
               <div className="mt-3 flex gap-2">
                 <button className="flex-1 py-1.5 bg-zinc-800 rounded-lg text-xs hover:bg-zinc-700">View Profile</button>
                 <button className="flex-1 py-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg text-xs hover:bg-indigo-600/30">Request Review</button>
               </div>
             </div>
           </div>
        </div>
      ))}
    </div>
  );

  const renderAngst = () => (
    <div className="p-4 space-y-4 pb-20">
       <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-2xl p-4 text-center mb-6">
          <Ghost className="mx-auto text-zinc-500 mb-2" size={32} />
          <h3 className="font-bold text-zinc-200">Afternoon Angst</h3>
          <p className="text-xs text-zinc-500 mt-1">Vent anonymously. Get support without the judgment.</p>
          <button className="mt-3 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-full text-xs font-medium text-white transition-colors">
            Post Anonymously
          </button>
       </div>

       {[1, 2, 3].map((i) => (
         <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 relative group">
            <div className="absolute top-4 right-4 text-zinc-600">
               <EyeOff size={16} />
            </div>
            <div className="mb-2">
               <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                 {i === 1 ? 'Imposter Syndrome' : i === 2 ? 'Client Issues' : 'Burnout'}
               </span>
            </div>
            <p className="text-sm text-zinc-300 italic mb-3">
               "{i === 1 
                 ? "I feel like a fraud every time I send an invoice. Does this feeling ever actually go away?" 
                 : i === 2 
                 ? "My biggest client just ghosted me after 3 months of work. I don't even know how to follow up without sounding desperate."
                 : "I haven't taken a weekend off in 6 months."}"
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
               <span className="flex items-center gap-1"><MessageCircle size={12} /> {4 + i * 2} Supportive Comments</span>
               <span>• 4h ago</span>
            </div>
         </div>
       ))}
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      {activeTab === CommunityTab.FEED && renderFeed()}
      {activeTab === CommunityTab.PODS && renderPods()}
      {activeTab === CommunityTab.MENTORS && renderMentors()}
      {activeTab === CommunityTab.ANGST && renderAngst()}
    </div>
  );
};

export default Community;
