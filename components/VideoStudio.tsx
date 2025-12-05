import React, { useState, useRef } from 'react';
import { generateVideo, getVideoOperation } from '../services/geminiService';
import { GeneratedAsset, ContentType } from '../types';
import { Video, Film, AlertCircle, Loader2, Upload, X, ImageIcon } from 'lucide-react';

interface VideoStudioProps {
  onSave: (asset: GeneratedAsset) => void;
}

const VideoStudio: React.FC<VideoStudioProps> = ({ onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking_key' | 'generating' | 'polling' | 'complete' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  
  // Image to Video State
  const [refImage, setRefImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setRefImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const checkAndGenerate = async () => {
    if (!prompt.trim() && !refImage) return; // Prompt OR Image usually required, but prompt is safer
    
    setStatus('checking_key');
    setStatusMsg('Verifying Veo access...');

    try {
      const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
      
      if (!hasKey) {
        setStatusMsg('Waiting for API Key selection...');
        await (window as any).aistudio?.openSelectKey();
      }

      generate();

    } catch (e) {
      console.error(e);
      setStatus('error');
      setStatusMsg('Failed to verify API key. Please try again.');
    }
  };

  const generate = async () => {
    setStatus('generating');
    setStatusMsg('Initiating Veo generation...');

    try {
      let operation = await generateVideo(prompt, refImage || undefined);

      setStatus('polling');
      setStatusMsg('Rendering video... This may take a moment.');

      // Poll until done
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await getVideoOperation(operation);
      }

      if (operation.error) {
         throw new Error(String(operation.error.message));
      }

      const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!uri) throw new Error("No video URI returned");
      
      setStatusMsg('Finalizing download...');
      const vidResponse = await fetch(`${uri}&key=${process.env.API_KEY}`);
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
        <p className="text-zinc-400 text-sm">Text-to-Video & Image-to-Video.</p>
        <p className="text-xs text-indigo-400 mt-1">Requires paid GCP Project API Key</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-0 space-y-4">
        {status === 'idle' || status === 'checking_key' || status === 'error' ? (
           <div className="w-full aspect-video bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center text-zinc-600 p-6 text-center relative overflow-hidden">
             {refImage && (
               <img src={refImage} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" />
             )}
             
             <Film size={48} className="mb-4 opacity-50 z-10" />
             {status === 'error' ? (
               <div className="text-red-400 flex flex-col items-center gap-2 z-10">
                 <AlertCircle size={20} />
                 <p className="text-sm">{statusMsg}</p>
               </div>
             ) : (
               <p className="text-sm z-10">Describe a scene or upload an image.</p>
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
         <div className="flex items-center justify-between px-1">
             <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
             {refImage ? (
                <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700">
                  <span className="text-xs text-indigo-400 font-medium flex items-center gap-1"><ImageIcon size={12}/> Image Set</span>
                  <button onClick={() => setRefImage(null)} className="text-zinc-500 hover:text-white"><X size={14} /></button>
                </div>
             ) : (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-zinc-400 hover:text-indigo-400 flex items-center gap-1.5 px-2 py-1"
                >
                  <Upload size={14} /> Add Reference Image
                </button>
             )}
             
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-[10px] text-zinc-600 hover:text-zinc-400">
              Billing Info
            </a>
         </div>

         <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={refImage ? "Animate this image..." : "A cinematic drone shot of a neon city..."}
            className="w-full bg-zinc-800 text-white rounded-xl pl-4 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-28 text-sm"
            disabled={status === 'generating' || status === 'polling'}
          />
          <button
            onClick={checkAndGenerate}
            disabled={(!prompt.trim() && !refImage) || status === 'generating' || status === 'polling'}
            className={`absolute bottom-3 right-3 p-3 rounded-lg transition-all ${
              (!prompt.trim() && !refImage) || status === 'generating' || status === 'polling'
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