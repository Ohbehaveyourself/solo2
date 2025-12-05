import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

// Ensure API key is present
const API_KEY = process.env.API_KEY || '';

/**
 * Creates a new GenAI instance.
 * IMPORTANT: For Veo (Video), we might need to recreate this after key selection.
 */
export const createClient = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const generateTextStream = async (
  prompt: string,
  onChunk: (text: string) => void
) => {
  const ai = createClient();
  const response = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: "You are an expert content strategist for solopreneurs. Keep answers punchy, engaging, and ready to post.",
    }
  });

  for await (const chunk of response) {
    if (chunk.text) {
      onChunk(chunk.text);
    }
  }
};

export const generateImage = async (prompt: string, aspectRatio: string = "1:1") => {
  const ai = createClient();
  // Using the pro model for high quality results as requested for a "Studio"
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: "1K" // "2K" is possible but slower, 1K is good for mobile
      }
    }
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

// --- AUDIO UTILS FOR LIVE API ---

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
