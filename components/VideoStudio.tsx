import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { GeneratedAsset, ContentType } from '../types';
import { Video, Film, AlertCircle, Loader2 } from 'lucide-react';

interface VideoStudioProps {
  onSave: (asset: GeneratedAsset) => void;
}

const VideoStudio: React.FC<VideoStudioProps> = ({ onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking_key' | 'generating' | 'polling' | 'complete' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const checkAndGenerate = async () => {
    if (!prompt.trim()) return;
    setStatus('checking_key');
    setStatusMsg('Verifying Veo access...');

    try {
      const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
      
      if (!hasKey) {
        setStatusMsg('Waiting for API Key selection...');
        // We must assume success after openSelectKey as per instructions (race condition mitigation)
        await (window as any).aistudio?.openSelectKey();
      }

      // Proceed to generation
      generateVideo();

    } catch (e) {
      console.error(e);
      setStatus('error');
      setStatusMsg('Failed to verify API key. Please try again.');
    }
  };

  const generateVideo = async () => {
    setStatus('generating');
    setStatusMsg('Initiating Veo generation...');

    try {
      // Create NEW instance to ensure latest key is used
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      setStatus('polling');
      setStatusMsg('Rendering video... This may take a moment.');

      // Poll until done
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      if (operation.error) {
         throw new Error(String(operation.error.message));
      }

      const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!videoUri) throw new Error("No video URI returned");

      // We must append the key to fetch the actual bytes if we were downloading, 
      // but for display in video tag, we usually need a signed URL or similar.
      // However, the instructions say: `fetch(`${downloadLink}&key=${process.env.API_KEY}`)`
      // To display it in a video tag, we likely need to fetch it as a blob and create a local object URL.
      
      setStatusMsg('Finalizing download...');
      const vidResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
      const blob = await vidResponse.blob();
      const localUrl = URL.createObjectURL(blob);

      setVideoUri(localUrl);
      setStatus('complete');
      onSave({
        id: Date.now().toString(),
        type: ContentType.VIDEO,
        content: localUrl,
        createdAt: Date.now(),
        prompt
      });

    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('Requested entity was not found')) {
        setStatus('error');
        setStatusMsg('Session expired. Please re-select API Key.');
        // Reset key selection if needed by calling openSelectKey again next time
      } else {
        setStatus('error');
        setStatusMsg(e.message || 'Video generation failed.');
      }
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4 max-w-md mx-auto w-full">
       <div className="flex-none">
        <h2 className="text-2xl font-bold text-white mb-1">Veo Studio</h2>
        <p className="text-zinc-400 text-sm">Generate high-fidelity videos with Veo 3.1.</p>
        <p className="text-xs text-indigo-400 mt-1">Requires paid GCP Project API Key</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-0 space-y-4">
        {status === 'idle' || status === 'checking_key' || status === 'error' ? (
           <div className="w-full aspect-video bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center text-zinc-600 p-6 text-center">
             <Film size={48} className="mb-4 opacity-50" />
             {status === 'error' ? (
               <div className="text-red-400 flex flex-col items-center gap-2">
                 <AlertCircle size={20} />
                 <p className="text-sm">{statusMsg}</p>
               </div>
             ) : (
               <p className="text-sm">Describe a scene to animate.</p>
             )}
           </div>
        ) : status === 'complete' && videoUri ? (
          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-700 shadow-2xl">
            <video src={videoUri} controls autoPlay loop className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-video bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center text-zinc-400 space-y-4">
            <Loader2 size={40} className="animate-spin text-indigo-500" />
            <p className="text-sm font-medium animate-pulse">{statusMsg}</p>
          </div>
        )}
      </div>

      <div className="flex-none space-y-3 pb-safe">
         {/* Billing Link Hint */}
         <div className="text-center">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-[10px] text-zinc-500 hover:text-zinc-300 underline">
              View Billing Documentation
            </a>
         </div>

         <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A cinematic drone shot of a neon city..."
            className="w-full bg-zinc-800 text-white rounded-xl pl-4 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-28 text-sm"
            disabled={status === 'generating' || status === 'polling'}
          />
          <button
            onClick={checkAndGenerate}
            disabled={!prompt.trim() || status === 'generating' || status === 'polling'}
            className={`absolute bottom-3 right-3 p-3 rounded-lg transition-all ${
              !prompt.trim() || status === 'generating' || status === 'polling'
                ? 'bg-zinc-700 text-zinc-500'
                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
            }`}
          >
            <Video size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;