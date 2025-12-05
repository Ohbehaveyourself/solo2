import React, { useState, useRef } from 'react';
import { generateImage, editImage } from '../services/geminiService';
import { GeneratedAsset, ContentType } from '../types';
import { Image as ImageIcon, Download, Sparkles, Wand2, Upload, Eraser } from 'lucide-react';

interface ImageStudioProps {
  onSave: (asset: GeneratedAsset) => void;
}

const RATIOS = ["1:1", "16:9", "9:16", "4:3"];

const ImageStudio: React.FC<ImageStudioProps> = ({ onSave }) => {
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  
  // Common State
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Create State
  const [aspectRatio, setAspectRatio] = useState("1:1");

  // Edit State
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setResultImage(null);
    try {
      let b64 = '';
      if (mode === 'create') {
        b64 = await generateImage(prompt, aspectRatio);
      } else {
        if (!sourceImage) {
          alert("Please upload an image to edit first.");
          setIsProcessing(false);
          return;
        }
        b64 = await editImage(sourceImage, prompt);
      }
      
      setResultImage(b64);
      onSave({
        id: Date.now().toString(),
        type: ContentType.IMAGE,
        content: b64,
        createdAt: Date.now(),
        prompt
      });
    } catch (e) {
      console.error(e);
      alert("Generation failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setResultImage(null); // Reset result on new upload
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `soloflow-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4 max-w-md mx-auto w-full">
      <div className="flex-none flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Image Studio</h2>
          <p className="text-zinc-400 text-sm">Create & Edit with Gemini.</p>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex bg-zinc-800 rounded-lg p-1 border border-zinc-700">
           <button 
             onClick={() => { setMode('create'); setPrompt(''); setResultImage(null); }}
             className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'create' ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-white'}`}
           >
             Create
           </button>
           <button 
             onClick={() => { setMode('edit'); setPrompt(''); setResultImage(null); }}
             className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'edit' ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-white'}`}
           >
             Edit
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-0 space-y-4">
        {/* Display Area */}
        <div className="w-full relative aspect-square max-h-[400px] bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex items-center justify-center group">
          {resultImage ? (
            <>
              <img src={resultImage} alt="Result" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button onClick={handleDownload} className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 text-white">
                  <Download size={24} />
                </button>
              </div>
            </>
          ) : mode === 'edit' && sourceImage ? (
             <img src={sourceImage} alt="Source" className="w-full h-full object-contain opacity-50 grayscale" />
          ) : (
            <div className="text-zinc-600 flex flex-col items-center gap-3">
              {isProcessing ? (
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400 animate-pulse" size={16} />
                </div>
              ) : (
                <>
                  {mode === 'create' ? <ImageIcon size={48} className="opacity-50" /> : <Eraser size={48} className="opacity-50" />}
                  <p className="text-sm">{mode === 'create' ? 'Enter prompt to generate' : 'Upload image to edit'}</p>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Upload Button for Edit Mode */}
        {mode === 'edit' && !resultImage && (
           <div className="w-full">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 border-2 border-dashed border-zinc-700 rounded-xl text-zinc-400 text-sm hover:border-indigo-500 hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
              >
                <Upload size={16} /> {sourceImage ? 'Change Source Image' : 'Upload Source Image'}
              </button>
           </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex-none space-y-4 pb-safe">
        {mode === 'create' && (
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
        )}

        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={mode === 'create' ? "A cyberpunk street scene..." : "Add a neon sign, remove the dog..."}
            className="w-full bg-zinc-800 text-white rounded-xl pl-4 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isProcessing || (mode === 'edit' && !sourceImage)}
            className={`absolute top-2 right-2 p-2.5 rounded-lg transition-all ${
              !prompt.trim() || isProcessing || (mode === 'edit' && !sourceImage)
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