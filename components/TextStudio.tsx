import React, { useState, useRef, useEffect } from 'react';
import { generateTextStream } from '../services/geminiService';
import { GeneratedAsset, ContentType } from '../types';
import { Send, Copy, Check, Sparkles } from 'lucide-react';

interface TextStudioProps {
  onSave: (asset: GeneratedAsset) => void;
}

const PRESETS = [
  "LinkedIn Post: Professional update",
  "Twitter Thread: Industry insights",
  "Instagram Caption: Behind the scenes",
  "Blog Outline: How-to guide",
  "Email Newsletter: Weekly roundup"
];

const TextStudio: React.FC<TextStudioProps> = ({ onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResult('');
    try {
      await generateTextStream(prompt, (chunk) => {
        setResult(prev => prev + chunk);
      });
    } catch (e) {
      console.error(e);
      setResult("Error generating content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      id: Date.now().toString(),
      type: ContentType.TEXT,
      content: result,
      createdAt: Date.now(),
      prompt
    });
    setCopied(true);
    navigator.clipboard.writeText(result);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4 max-w-md mx-auto w-full">
      <div className="flex-none">
        <h2 className="text-2xl font-bold text-white mb-1">Text Studio</h2>
        <p className="text-zinc-400 text-sm">Draft posts, emails, and scripts instantly.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Output Area */}
        <div className={`p-4 rounded-2xl border ${result ? 'border-indigo-500/50 bg-zinc-900/50' : 'border-zinc-800 bg-zinc-900/30'} min-h-[200px] transition-all duration-300 relative`}>
          {result ? (
            <div className="whitespace-pre-wrap text-zinc-100 leading-relaxed text-sm">{result}</div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-2">
              <Sparkles size={24} />
              <p>AI magic awaits...</p>
            </div>
          )}
          
          {result && !isGenerating && (
            <button 
              onClick={handleSave}
              className="absolute top-2 right-2 p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 text-zinc-300"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          )}
        </div>

        {/* Presets */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => setPrompt(p)}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-700 hover:border-indigo-500/50 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area - Sticky Bottom */}
      <div className="flex-none pt-2 pb-safe">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What are we writing today?"
            className="w-full bg-zinc-800 text-white rounded-2xl pl-4 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24 text-base"
            disabled={isGenerating}
          />
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={`absolute bottom-3 right-3 p-3 rounded-xl transition-all ${
              !prompt.trim() || isGenerating 
                ? 'bg-zinc-700 text-zinc-500' 
                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
            }`}
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextStudio;