import React, { useState, useRef, useEffect } from 'react';
import { generateChatStream, transcribeAudio, generateSpeech } from '../services/geminiService';
import { GeneratedAsset, ContentType } from '../types';
import { Send, Copy, Mic, Globe, Brain, Volume2, StopCircle, Sparkles, Loader2 } from 'lucide-react';

interface TextStudioProps {
  onSave: (asset: GeneratedAsset) => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const TextStudio: React.FC<TextStudioProps> = ({ onSave }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Feature Toggles
  const [useSearch, setUseSearch] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  
  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<number | null>(null); // Index of message playing
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsGenerating(true);

    let fullResponse = '';
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      setMessages(prev => [...prev, { role: 'model', text: '' }]); // Placeholder
      
      await generateChatStream(
        history,
        userMsg,
        { useSearch, useThinking },
        (chunk) => {
          fullResponse += chunk;
          setMessages(prev => {
            const newArr = [...prev];
            newArr[newArr.length - 1] = { role: 'model', text: fullResponse };
            return newArr;
          });
        }
      );
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          setIsGenerating(true); // Show loading while transcribing
          try {
            const text = await transcribeAudio(base64);
            setInput(prev => (prev ? prev + ' ' + text : text));
          } catch (e) {
            console.error("Transcription failed", e);
          } finally {
            setIsGenerating(false);
          }
        };
      };

      recorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Mic error", e);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
  };

  const playTTS = async (text: string, index: number) => {
    if (isPlayingAudio === index) {
      audioRef.current?.pause();
      setIsPlayingAudio(null);
      return;
    }

    try {
      const audioUrl = await generateSpeech(text);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlayingAudio(index);
        audioRef.current.onended = () => setIsPlayingAudio(null);
      } else {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.play();
        setIsPlayingAudio(index);
        audio.onended = () => setIsPlayingAudio(null);
      }
    } catch (e) {
      console.error("TTS Error", e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="flex-none p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="text-indigo-500" size={18} />
          AI Assistant
        </h2>
        <p className="text-xs text-zinc-500">Powered by Gemini 3 Pro & 2.5 Flash</p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50 gap-4">
             <Brain size={48} />
             <p>Start a conversation...</p>
           </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] rounded-2xl p-4 relative group ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-zinc-800 text-zinc-100 rounded-tl-sm border border-zinc-700'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</div>
              
              {msg.role === 'model' && !isGenerating && (
                <div className="absolute -bottom-6 left-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => playTTS(msg.text, idx)}
                     className="p-1.5 bg-zinc-800 rounded-full border border-zinc-700 text-zinc-400 hover:text-white"
                   >
                     {isPlayingAudio === idx ? <StopCircle size={12} className="animate-pulse text-indigo-400" /> : <Volume2 size={12} />}
                   </button>
                   <button 
                     onClick={() => {
                       navigator.clipboard.writeText(msg.text);
                       onSave({
                         id: Date.now().toString(),
                         type: ContentType.TEXT,
                         content: msg.text,
                         createdAt: Date.now(),
                         prompt: messages[idx-1]?.text || "Chat Response"
                       });
                     }}
                     className="p-1.5 bg-zinc-800 rounded-full border border-zinc-700 text-zinc-400 hover:text-white"
                   >
                     <Copy size={12} />
                   </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-2xl p-4 rounded-tl-sm border border-zinc-700 flex items-center gap-2">
              <Loader2 className="animate-spin text-indigo-400" size={16} />
              <span className="text-xs text-zinc-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 bg-zinc-900 border-t border-zinc-800 pb-safe">
        {/* Tools */}
        <div className="flex gap-3 mb-3">
           <button 
             onClick={() => setUseSearch(!useSearch)}
             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${useSearch ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}`}
           >
             <Globe size={12} /> Search
           </button>
           <button 
             onClick={() => setUseThinking(!useThinking)}
             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${useThinking ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}`}
           >
             <Brain size={12} /> Deep Think
           </button>
        </div>

        <div className="relative flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isRecording ? "Listening..." : "Ask anything..."}
            className="flex-1 bg-zinc-800 text-white rounded-2xl pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none max-h-32 min-h-[50px] text-sm"
            disabled={isGenerating || isRecording}
          />
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex-none p-3 rounded-xl transition-all ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
          </button>

          <button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating || isRecording}
            className={`flex-none p-3 rounded-xl transition-all ${
              !input.trim() || isGenerating 
                ? 'bg-zinc-700 text-zinc-500' 
                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextStudio;