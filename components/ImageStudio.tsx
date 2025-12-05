import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { GeneratedAsset, ContentType } from '../types';
import { Image as ImageIcon, Download, Share2, Sparkles, Wand2 } from 'lucide-react';

interface ImageStudioProps {
  onSave: (asset: GeneratedAsset) => void;
}

const RATIOS = ["1:1", "16:9", "9:16", "4:3"];

const ImageStudio: React.FC<ImageStudioProps> = ({ onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("1:1");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setImageSrc(null);
    try {
      const b64 = await generateImage(prompt, aspectRatio);
      setImageSrc(b64);
      onSave({
        id: Date.now().toString(),
        type: ContentType.IMAGE,
        content: b64,
        createdAt: Date.now(),
        prompt
      });
    } catch (e) {
      console.error(e);
      alert("Failed to generate image. Try a simpler prompt.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!imageSrc) return;
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `soloflow-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4 max-w-md mx-auto w-full">
      <div className="flex-none">
        <h2 className="text-2xl font-bold text-white mb-1">Image Studio</h2>
        <p className="text-zinc-400 text-sm">Create studio-quality visuals in seconds.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <div className="w-full relative aspect-square max-h-[400px] bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex items-center justify-center group">
          {imageSrc ? (
            <>
              <img src={imageSrc} alt="Generated" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button onClick={handleDownload} className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 text-white">
                  <Download size={24} />
                </button>
              </div>
            </>
          ) : (
            <div className="text-zinc-600 flex flex-col items-center gap-3">
              {isGenerating ? (
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400 animate-pulse" size={16} />
                </div>
              ) : (
                <>
                  <ImageIcon size={48} className="opacity-50" />
                  <p className="text-sm">Enter a prompt to start</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex-none space-y-4 pb-safe">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {RATIOS.map(r => (
            <button
              key={r}
              onClick={() => setAspectRatio(r)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                aspectRatio === r 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic workspace with neon lights..."
            className="w-full bg-zinc-800 text-white rounded-xl pl-4 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={`absolute top-2 right-2 p-2.5 rounded-lg transition-all ${
              !prompt.trim() || isGenerating
                ? 'bg-zinc-700 text-zinc-500'
                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
            }`}
          >
            <Wand2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;