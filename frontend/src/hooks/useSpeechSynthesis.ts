import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';

export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  gender: 'male' | 'female';
  description: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'vi-VN-NamMinhNeural',
    name: 'GS. Nam Minh (Trầm ấm, Nghiêm nghị)',
    lang: 'vi-VN',
    gender: 'male',
    description: 'Giọng Nam Bắc/Trung chuẩn học thuật, khắt khe',
  },
  {
    id: 'vi-VN-HoaiMyNeural',
    name: 'PGS. Hoài My (Thanh lịch, Sắc bén)',
    lang: 'vi-VN',
    gender: 'female',
    description: 'Giọng Nữ chuẩn ngữ điệu phản biện, khúc chiết',
  },
  {
    id: 'en-US-GuyNeural',
    name: 'Prof. Guy (English Standard)',
    lang: 'en-US',
    gender: 'male',
    description: 'Giọng Anh - Mỹ chuẩn Hội đồng Quốc tế',
  },
];

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const [currentVoice, setCurrentVoice] = useState<string>('vi-VN-NamMinhNeural');
  const isSupported = typeof window !== 'undefined';

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const simulatedSpeechTimerRef = useRef<number | null>(null);

  // Setup single reusable audio element & AudioContext
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const handleEnded = () => {
      setIsSpeaking(false);
      setAudioVolume(0);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };

    const handleError = () => {
      setIsSpeaking(false);
      setAudioVolume(0);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (simulatedSpeechTimerRef.current) {
        clearInterval(simulatedSpeechTimerRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Real-time audio analyser loop
  const startAnalyserLoop = useCallback(() => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const update = () => {
      analyser.getByteFrequencyData(dataArray);

      // Focus on vocal speech frequencies (around 100Hz - 3000Hz)
      let sum = 0;
      const range = Math.min(dataArray.length, 64);
      for (let i = 0; i < range; i++) {
        sum += dataArray[i];
      }
      const avg = sum / range;
      // Normalize to 0 - 1 with a gentle curve for natural lip open/close
      const normalized = Math.min(1, Math.max(0, (avg - 15) / 90));
      setAudioVolume(normalized);

      animFrameRef.current = requestAnimationFrame(update);
    };

    animFrameRef.current = requestAnimationFrame(update);
  }, []);

  // Simulated phonetic lip-sync fallback
  const startSimulatedVisemes = useCallback(() => {
    let tick = 0;
    if (simulatedSpeechTimerRef.current) {
      clearInterval(simulatedSpeechTimerRef.current);
    }
    simulatedSpeechTimerRef.current = window.setInterval(() => {
      tick++;
      // Human speech cadence: syllables (peaks) separated by small pauses
      const wave1 = Math.sin(tick * 0.4);
      const wave2 = Math.cos(tick * 0.85);
      const raw = Math.abs(wave1 * wave2);
      const volume = raw > 0.2 ? Math.min(1, raw * 1.2) : 0;
      setAudioVolume(volume);
    }, 60);
  }, []);

  // Web Speech API fallback
  const speakWebSpeech = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentVoice.startsWith('en') ? 'en-US' : 'vi-VN';
      utterance.rate = 1.0;
      utterance.pitch = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) =>
        currentVoice.startsWith('en') ? v.lang.includes('en') : v.lang.includes('vi')
      );
      if (match) utterance.voice = match;

      utterance.onstart = () => {
        setIsSpeaking(true);
        startSimulatedVisemes();
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setAudioVolume(0);
        if (simulatedSpeechTimerRef.current) {
          clearInterval(simulatedSpeechTimerRef.current);
        }
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setAudioVolume(0);
        if (simulatedSpeechTimerRef.current) {
          clearInterval(simulatedSpeechTimerRef.current);
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [currentVoice, startSimulatedVisemes]
  );

  const speak = useCallback(
    async (text: string, voiceOverride?: string) => {
      const activeVoice = voiceOverride || currentVoice;
      if (!text || !text.trim()) return;

      stop(); // Stop any current speech

      // Clean text for speech: remove markdown asterisks, brackets, quotes
      const cleanText = text
        .replace(/[*_#`~[\]]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const audio = audioRef.current;
      if (!audio) {
        speakWebSpeech(cleanText);
        return;
      }

      try {
        // Init AudioContext on user interaction
        if (!audioContextRef.current) {
          const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioContextRef.current = new AudioCtxClass();
          const analyser = audioContextRef.current.createAnalyser();
          analyser.fftSize = 128;
          analyserRef.current = analyser;

          const source = audioContextRef.current.createMediaElementSource(audio);
          sourceNodeRef.current = source;
          source.connect(analyser);
          analyser.connect(audioContextRef.current.destination);
        }

        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        const ttsUrl = api.getTtsAudioUrl(cleanText, activeVoice);
        audio.src = ttsUrl;
        audio.playbackRate = 1.0;

        await audio.play();
        setIsSpeaking(true);
        startAnalyserLoop();
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Play was aborted by stop() or rapid turn transition, ignore safely
          return;
        }
        console.warn('Backend Neural TTS error, falling back to Web Speech API:', err);
        speakWebSpeech(cleanText);
      }
    },
    [currentVoice, speakWebSpeech, startAnalyserLoop]
  );

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (simulatedSpeechTimerRef.current) {
      clearInterval(simulatedSpeechTimerRef.current);
    }
    setIsSpeaking(false);
    setAudioVolume(0);
  }, []);

  return {
    isSpeaking,
    audioVolume,
    isSupported,
    currentVoice,
    setCurrentVoice,
    voiceOptions: VOICE_OPTIONS,
    speak,
    stop,
  };
}
