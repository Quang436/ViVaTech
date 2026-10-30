import { useState, useEffect, useCallback } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [vietnameseVoice, setVietnameseVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Look for Vietnamese voice or fallback to default
        const vn = voices.find((v) => v.lang.includes('vi') || v.lang.includes('VIE'));
        setVietnameseVoice(vn || voices[0] || null);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const speak = useCallback(
    (text: string, rate: number = 1.0, pitch: number = 1.0) => {
      if (!isSupported || !('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel(); // Cancel any ongoing speech

      const utterance = new SpeechSynthesisUtterance(text);
      if (vietnameseVoice) {
        utterance.voice = vietnameseVoice;
      }
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.lang = 'vi-VN';

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, vietnameseVoice]
  );

  const stop = useCallback(() => {
    if (isSupported && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
  };
}
