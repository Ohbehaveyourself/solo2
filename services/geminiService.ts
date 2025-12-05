import { GoogleGenAI, Modality } from "@google/genai";

// Ensure API key is present
const API_KEY = process.env.API_KEY || '';

/**
 * Creates a new GenAI instance.
 */
export const createClient = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

// --- TEXT & CHAT ---

export const generateChatStream = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  config: {
    useSearch?: boolean;
    useThinking?: boolean;
  },
  onChunk: (text: string) => void
) => {
  const ai = createClient();
  
  let model = 'gemini-2.5-flash'; // Default for fast responses
  let generationConfig: any = {};

  if (config.useThinking) {
    model = 'gemini-3-pro-preview';
    generationConfig.thinkingConfig = { thinkingBudget: 32768 };
  } else if (config.useSearch) {
    model = 'gemini-2.5-flash'; // Flash supports search well and is fast
    generationConfig.tools = [{ googleSearch: {} }];
  } else {
    // Standard fast chat
    model = 'gemini-2.5-flash'; // Or flash-lite if extreme speed needed, but flash is good balance
  }

  const chat = ai.chats.create({
    model: model,
    history: history,
    config: generationConfig
  });

  const response = await chat.sendMessageStream({ message });

  for await (const chunk of response) {
    if (chunk.text) {
      onChunk(chunk.text);
    }
  }
};

// --- AUDIO UTILS ---

export const transcribeAudio = async (audioBase64: string): Promise<string> => {
  const ai = createClient();
  // Remove header if present
  const base64Data = audioBase64.split(',')[1] || audioBase64;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType: 'audio/webm', data: base64Data } }, // Assuming webm from MediaRecorder
        { text: "Transcribe this audio exactly. Do not add any commentary." }
      ]
    }
  });
  return response.text || "";
};

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = createClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: { parts: [{ text }] },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
      }
    }
  });
  
  const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64) throw new Error("No audio generated");
  return `data:audio/wav;base64,${base64}`; // API returns raw PCM/WAV usually, but let's assume standard handling
};

// --- IMAGE UTILS ---

export const generateImage = async (prompt: string, aspectRatio: string = "1:1") => {
  const ai = createClient();
  // Gemini 3 Pro for high quality generation
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: "1K" 
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const editImage = async (base64Image: string, prompt: string) => {
  const ai = createClient();
  const base64Data = base64Image.split(',')[1] || base64Image;

  // Use Nano Banana (Flash Image) for editing
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64Data } },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

// --- VIDEO UTILS ---

export const generateVideo = async (prompt: string, imageBase64?: string) => {
  // Always create new client for Veo to ensure fresh key if recently selected
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let imagePart = undefined;
  if (imageBase64) {
    imagePart = {
      imageBytes: imageBase64.split(',')[1] || imageBase64,
      mimeType: 'image/png' // Assuming PNG for simplicity
    };
  }

  return await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: imagePart,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });
};

export const getVideoOperation = async (operation: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.operations.getVideosOperation({ operation });
}


// --- LIVE API AUDIO HELPERS ---

export function decodeAudio(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function encodeAudio(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function createPcmBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encodeAudio(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}