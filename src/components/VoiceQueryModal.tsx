import React, { useState } from 'react';
import { Mic, Send, X, Volume2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { soundEffects } from '../utils/audio';
import { voiceRecognition } from '../utils/speech';

interface VoiceQueryModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  onSubmitQuestion: (question: string) => void;
}

export const VoiceQueryModal: React.FC<VoiceQueryModalProps> = ({
  isOpen,
  language,
  onClose,
  onSubmitQuestion,
}) => {
  const [question, setQuestion] = useState('');
  const [isListening, setIsListening] = useState(false);
  const t = translations[language];

  if (!isOpen) return null;

  const handleStartListening = () => {
    if (!voiceRecognition.isSupported()) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    soundEffects.playTap();
    setIsListening(true);

    voiceRecognition.listen(
      language,
      (transcript) => {
        setIsListening(false);
        setQuestion(transcript);
        soundEffects.playSuccess();
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    soundEffects.playTap();
    onSubmitQuestion(question);
    setQuestion('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-query-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      <div className="w-full max-w-lg bg-zinc-950 border-4 border-yellow-400 rounded-3xl p-6 md:p-8 text-white shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 id="voice-query-title" className="text-xl md:text-2xl font-bold text-yellow-400 flex items-center space-x-2">
            <Mic className="w-6 h-6 text-yellow-400" />
            <span>{t.askQuestion.modalTitle}</span>
          </h2>
          <button
            onClick={onClose}
            aria-label={t.askQuestion.cancel}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t.askQuestion.inputPlaceholder}
              className="w-full p-4 rounded-2xl bg-zinc-900 border-2 border-zinc-700 focus:border-yellow-400 text-white placeholder-zinc-500 font-medium text-lg resize-none outline-none"
            />
          </div>

          {/* Voice input button */}
          <button
            type="button"
            onClick={handleStartListening}
            aria-label={isListening ? t.askQuestion.listening : t.askQuestion.speakButton}
            className={`w-full py-4 px-6 rounded-2xl border-3 font-black text-lg flex items-center justify-center space-x-3 transition cursor-pointer ${
              isListening
                ? 'border-red-500 bg-red-950 text-red-100 animate-pulse'
                : 'border-yellow-400 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300'
            }`}
          >
            <Mic className={`w-6 h-6 ${isListening ? 'animate-bounce text-red-400' : 'text-yellow-400'}`} />
            <span>{isListening ? t.askQuestion.listening : t.askQuestion.speakButton}</span>
          </button>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold"
            >
              {t.askQuestion.cancel}
            </button>
            <button
              type="submit"
              disabled={!question.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              <span>{t.askQuestion.submit}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
