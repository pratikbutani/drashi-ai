import { Language } from '../types';

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  useNeuralTts?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class SpeechManager {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isSpeakingState = false;

  public get isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  // Stop any ongoing speech immediately
  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isSpeakingState = false;
  }

  // Speak using best available engine
  public async speak(
    text: string,
    language: Language,
    options: TTSOptions = {}
  ): Promise<void> {
    this.stop();
    if (!text || text.trim() === '') return;

    this.isSpeakingState = true;
    options.onStart?.();

    // If neural Gemini TTS requested, attempt server endpoint first
    if (options.useNeuralTts) {
      try {
        const resp = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, language }),
        });
        const data = await resp.json();
        if (data.success && data.audioData) {
          const audio = new Audio(`data:${data.mimeType};base64,${data.audioData}`);
          audio.playbackRate = options.rate || 1.0;
          this.currentAudio = audio;

          audio.onended = () => {
            this.isSpeakingState = false;
            this.currentAudio = null;
            options.onEnd?.();
          };

          audio.onerror = (e) => {
            console.warn('Neural audio playback failed, falling back to Web Speech:', e);
            this.fallbackWebSpeech(text, language, options);
          };

          await audio.play();
          return;
        }
      } catch (err) {
        console.warn('Neural TTS request failed, falling back to Web Speech API:', err);
      }
    }

    // Default Web Speech API
    this.fallbackWebSpeech(text, language, options);
  }

  private fallbackWebSpeech(text: string, language: Language, options: TTSOptions) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.isSpeakingState = false;
      options.onError?.('Speech synthesis not supported in this browser');
      return;
    }

    // Clean text
    const cleanText = text.replace(/[*_#`~]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Language code mapping
    const langCodeMap: Record<Language, string[]> = {
      hi: ['hi-IN', 'hi', 'en-IN'],
      gu: ['gu-IN', 'gu', 'hi-IN', 'en-IN'],
      en: ['en-US', 'en-GB', 'en-IN', 'en'],
    };

    const targetLangs = langCodeMap[language] || ['en-US'];
    utterance.lang = targetLangs[0];
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;

    // Pick best available voice
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find((v) =>
      targetLangs.some((code) => v.lang.toLowerCase().startsWith(code.toLowerCase()))
    );

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      this.isSpeakingState = false;
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeakingState = false;
      this.currentUtterance = null;
      options.onError?.(e);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  // Pre-load voices to avoid lag
  public initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }
}

export const speechManager = new SpeechManager();

// Voice Recognition helper for voice commands and questions
export class VoiceRecognition {
  private recognition: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public listen(
    language: Language,
    onResult: (transcript: string) => void,
    onError?: (err: any) => void
  ) {
    if (!this.recognition) {
      onError?.('Speech recognition not supported');
      return;
    }

    const langCodeMap: Record<Language, string> = {
      hi: 'hi-IN',
      gu: 'gu-IN',
      en: 'en-US',
    };

    this.recognition.lang = langCodeMap[language] || 'en-US';

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      onError?.(event.error);
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start error:', e);
    }
  }

  public stop() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }
}

export const voiceRecognition = new VoiceRecognition();
