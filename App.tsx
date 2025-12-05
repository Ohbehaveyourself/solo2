
import React, { useState } from 'react';
import { 
  Layout, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  Type, 
  FileText, 
  Menu, 
  Sparkles,
  Users,
  MessageSquare,
  Award,
  Zap,
  Ghost,
  BookOpen
} from 'lucide-react';
import TextStudio from './components/TextStudio';
import ImageStudio from './components/ImageStudio';
import VideoStudio from './components/VideoStudio';
import LiveStudio from './components/LiveStudio';
import Community from './components/Community';
import Learn from './components/Learn';
import SideMenu from './components/SideMenu';
import { GeneratedAsset, ContentType, AppMode, CommunityTab, UserProfile, CreditBalance } from './types';

const App: React.FC = () => {
  // App Mode State
  const [appMode, setAppMode] = useState<AppMode>(AppMode.STUDIO);
  
  // Studio Tab State
  const [activeStudioTab, setActiveStudioTab] = useState<ContentType>(ContentType.TEXT);
  
  // Community Tab State
  const [activeCommunityTab, setActiveCommunityTab] = useState<CommunityTab>(CommunityTab.FEED);

  // Side Menu State
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  // Mock User Data (Inferred from Schema)
  const [user] = useState<UserProfile>({
    id: 'u123',
    displayName: 'Hannah Lewis',
    avatarUrl: 'https://i.pravatar.cc/150?u=hannah',
    isAnonymous: false
  });

  const [credits] = useState<CreditBalance>({
    generation: 1500, // cents
    community: 30
  });

  // Data State
  const [library, setLibrary] = useState<GeneratedAsset[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);

  const handleSaveAsset = (asset: GeneratedAsset) => {
    setLibrary(prev => [asset, ...prev]);
  };

  const renderContent = () => {
    switch(appMode) {
      case AppMode.STUDIO:
        switch (activeStudioTab) {
          case ContentType.TEXT: return <TextStudio onSave={handleSaveAsset} />;
          case ContentType.IMAGE: return <ImageStudio onSave={handleSaveAsset} />;
          case ContentType.VIDEO: return <VideoStudio onSave={handleSaveAsset} />;
          case ContentType.LIVE: return <LiveStudio />;
          default: return <TextStudio onSave={handleSaveAsset} />;
        }
      case AppMode.COMMUNITY:
        return <Community activeTab={activeCommunityTab} />;
      case AppMode.LEARN:
        return <Learn />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-zinc-100 overflow-hidden font-sans">
      
      <SideMenu 
        isOpen={isSideMenuOpen} 
        onClose={() => setIsSideMenuOpen(false)} 
        user={user}
        credits={credits}
      />

      {/* Header with Mode Switcher */}
      <header className="flex-none h-16 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md z-20">
        
        {/* Hamburger Menu */}
        <button 
          onClick={() => setIsSideMenuOpen(true)}
          className="p-2 -ml-2 text-zinc-400 hover:text-white"
        >
          <Menu size={24} />
        </button>

        {/* Mode Toggle (Segmented Control) */}
        <div className="flex bg-zinc-950 p-1 rounded-full border border-zinc-800 w-56 relative">
          {/* Sliding Background Pill */}
          <div 
            className={`absolute top-1 bottom-1 w-[calc(33.33%-4px)] bg-zinc-800 rounded-full transition-all duration-300 shadow-sm ${
              appMode === AppMode.STUDIO ? 'left-1' : 
              appMode === AppMode.COMMUNITY ? 'left-[calc(33.33%)]' :
              'left-[calc(66.66%)]'
            }`}
          />
          
          <button 
            onClick={() => setAppMode(AppMode.STUDIO)}
            className={`flex-1 relative z-10 text-[10px] font-semibold py-1.5 text-center transition-colors ${
              appMode === AppMode.STUDIO ? 'text-white' : 'text-zinc-500'
            }`}
          >
            Studio
          </button>
          <button 
            onClick={() => setAppMode(AppMode.COMMUNITY)}
            className={`flex-1 relative z-10 text-[10px] font-semibold py-1.5 text-center transition-colors ${
              appMode === AppMode.COMMUNITY ? 'text-white' : 'text-zinc-500'
            }`}
          >
            Community
          </button>
          <button 
            onClick={() => setAppMode(AppMode.LEARN)}
            className={`flex-1 relative z-10 text-[10px] font-semibold py-1.5 text-center transition-colors ${
              appMode === AppMode.LEARN ? 'text-white' : 'text-zinc-500'
            }`}
          >
            Learn
          </button>
        </div>

        {/* Library Button */}
        <button 
          onClick={() => setShowLibrary(!showLibrary)}
          className={`p-2.5 rounded-full transition-colors ${showLibrary ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
        >
          <FileText size={18} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {/* Library Overlay */}
        {showLibrary && (
          <div className="absolute inset-0 bg-black/95 z-30 overflow-y-auto p-4 animate-in slide-in-from-right duration-200">
             <div className="flex items-center justify-between mb-6 sticky top-0 bg-black/95 py-2">
                <h2 className="text-xl font-bold">Your Assets</h2>
                <button onClick={() => setShowLibrary(false)} className="text-zinc-400 text-sm px-3 py-1 rounded-full bg-zinc-800">Close</button>
             </div>
             {library.length === 0 ? (
               <div className="text-center text-zinc-600 mt-20 flex flex-col items-center">
                 <FileText size={48} className="opacity-20 mb-4" />
                 <p>No content generated yet.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {library.map(item => (
                   <div key={item.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex gap-4">
                      <div className="flex-none w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
                        {item.type === ContentType.IMAGE ? (
                          <img src={item.content} className="w-full h-full object-cover" />
                        ) : item.type === ContentType.VIDEO ? (
                          <div className="text-indigo-500"><Video size={20}/></div>
                        ) : (
                          <div className="text-zinc-500"><FileText size={20}/></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-900/20 px-1.5 py-0.5 rounded">{item.type}</span>
                           <span className="text-[10px] text-zinc-600">{new Date(item.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm text-zinc-300 truncate mt-1">{item.prompt}</p>
                        {item.type === ContentType.TEXT && (
                           <p className="text-xs text-zinc-500 truncate mt-1">{item.content.substring(0, 30)}...</p>
                        )}
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {renderContent()}
      </main>

      {/* Contextual Bottom Navigation */}
      {appMode !== AppMode.LEARN && (
        <nav className="flex-none h-[88px] bg-zinc-900/90 backdrop-blur-lg border-t border-zinc-800 flex items-start pt-2 justify-around px-2 pb-safe z-20">
          
          {appMode === AppMode.STUDIO ? (
            // STUDIO NAVIGATION
            <>
              <NavButton 
                active={activeStudioTab === ContentType.TEXT} 
                onClick={() => setActiveStudioTab(ContentType.TEXT)}
                icon={<Type size={20} />} 
                label="Text" 
              />
              <NavButton 
                active={activeStudioTab === ContentType.IMAGE} 
                onClick={() => setActiveStudioTab(ContentType.IMAGE)}
                icon={<ImageIcon size={20} />} 
                label="Image" 
              />
              <NavButton 
                active={activeStudioTab === ContentType.VIDEO} 
                onClick={() => setActiveStudioTab(ContentType.VIDEO)}
                icon={<Video size={20} />} 
                label="Video" 
              />
              <NavButton 
                active={activeStudioTab === ContentType.LIVE} 
                onClick={() => setActiveStudioTab(ContentType.LIVE)}
                icon={<Mic size={20} />} 
                label="Live" 
              />
            </>
          ) : (
            // COMMUNITY NAVIGATION
            <>
              <NavButton 
                active={activeCommunityTab === CommunityTab.FEED} 
                onClick={() => setActiveCommunityTab(CommunityTab.FEED)}
                icon={<MessageSquare size={20} />} 
                label="Feed" 
              />
              <NavButton 
                active={activeCommunityTab === CommunityTab.PODS} 
                onClick={() => setActiveCommunityTab(CommunityTab.PODS)}
                icon={<Users size={20} />} 
                label="Pods" 
              />
              <NavButton 
                active={activeCommunityTab === CommunityTab.MENTORS} 
                onClick={() => setActiveCommunityTab(CommunityTab.MENTORS)}
                icon={<Award size={20} />} 
                label="Mentors" 
              />
              <NavButton 
                active={activeCommunityTab === CommunityTab.ANGST} 
                onClick={() => setActiveCommunityTab(CommunityTab.ANGST)}
                icon={<Ghost size={20} />} 
                label="Angst" 
              />
            </>
          )}
        </nav>
      )}
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 h-14 transition-colors duration-200 group`}
  >
    <div className={`mb-1 p-2 rounded-xl transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 scale-110' : 'text-zinc-500 group-hover:bg-zinc-800 group-hover:text-zinc-300'}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-medium transition-colors ${active ? 'text-indigo-400' : 'text-zinc-600'}`}>{label}</span>
  </button>
);

export default App;
