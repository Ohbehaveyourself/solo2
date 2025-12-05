import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, decodeAudio, decodeAudioData } from '../services/geminiService';
import { Mic, MicOff, Radio, StopCircle, Waves } from 'lucide-react';

const LiveStudio: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for audio handling to persist across renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null); // To hold the active session object

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    
    // Stop tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Disconnect audio nodes
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    // Close contexts
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }

    setIsActive(false);
    setIsConnecting(false);
  };

  const startSession = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // 1. Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;
      nextStartTimeRef.current = 0;

      // 2. Get Media Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Connect to Gemini Live
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // We keep the promise to resolve specifically for sending input
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are a creative partner for a solopreneur. Help brainstorm ideas concisely while walking or driving.',
        },
        callbacks: {
          onopen: () => {
            console.log("Live session opened");
            setIsActive(true);
            setIsConnecting(false);

            // Start Audio Input Stream
            const source = inputCtx.createMediaStreamSource(stream);
            sourceRef.current = source;
            
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              
              // Send data when session is ready
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputCtx) {
              try {
                // Ensure timing
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);

                const audioBuffer = await decodeAudioData(
                  decodeAudio(base64Audio),
                  outputCtx,
                  24000,
                  1
                );

                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputCtx.destination); // Simple direct connect for mobile
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
              } catch (err) {
                console.error("Audio decode error", err);
              }
            }

            // Handle Interruption
            if (msg.serverContent?.interrupted) {
              nextStartTimeRef.current = 0;
              // Ideally cancel current audio nodes here if we tracked them in a Set
            }
          },
          onclose: () => {
            console.log("Live session closed");
            stopSession();
          },
          onerror: (e) => {
            console.error("Live session error", e);
            setError("Connection lost");
            stopSession();
          }
        }
      });

      // Save session ref for cleanup
      sessionPromise.then(sess => {
        sessionRef.current = sess;
      });

    } catch (e: any) {
      console.error(e);
      setError("Could not access microphone or connect.");
      setIsConnecting(false);
      stopSession();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="flex flex-col h-full items-center justify-center p-6 space-y-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? 'opacity-20' : 'opacity-0'}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-purple-500 rounded-full blur-[80px] animate-bounce"></div>
      </div>

      <div className="z-10 text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Live Voice Mode</h2>
        <p className="text-zinc-400 text-sm max-w-xs mx-auto">
          {isActive ? "Listening... Speak naturally." : "Brainstorm while you walk or drive."}
        </p>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>

      <div className="z-10 relative">
        <button
          onClick={isActive ? stopSession : startSession}
          disabled={isConnecting}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
            isActive 
              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 ring-4 ring-red-500/20' 
              : 'bg-indigo-600 text-white hover:bg-indigo-500 ring-8 ring-indigo-900/50 shadow-[0_0_50px_rgba(79,70,229,0.3)]'
          }`}
        >
          {isConnecting ? (
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isActive ? (
            <StopCircle size={40} />
          ) : (
            <Mic size={40} />
          )}
        </button>
        
        {/* Ripple Effect Animation when Active */}
        {isActive && (
          <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-red-500/20"></div>
        )}
      </div>

      {isActive && (
        <div className="z-10 flex items-center gap-2 text-indigo-300 text-sm font-medium animate-pulse">
          <Waves size={16} />
          <span>Live Session Active</span>
        </div>
      )}
    </div>
  );
};

export default LiveStudio;