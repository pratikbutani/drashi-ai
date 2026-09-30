import React, { useEffect, useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { soundEffects } from '../utils/audio';
import { speechManager, voiceRecognition } from '../utils/speech';
import { Check, Globe, Mic, Volume2 } from 'lucide-react';

interface LanguageSelectorModalProps {
  currentLanguage: Language;
  isOpen: boolean;
  onSelectLanguage: (lang: Language) => void;
  onClose?: () => void;
  isFirstTime?: boolean;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  currentLanguage,
  isOpen,
  onSelectLanguage,
  onClose,
  isFirstTime = false,
}) => {
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string>('');
  const t = translations[currentLanguage];

  // Vocalize instructions on opening if first time
  useEffect(() => {
    if (isOpen && isFirstTime) {
      // Short introductory speech
      const introTimer = setTimeout(() => {
        speechManager.speak(
          'Welcome to Drishti AI. Please choose your preferred language: Press 1 or select for English. Press 2 for Hindi. Press 3 for Gujarati.',
          'en',
          { rate: 1.05 }
        );
      }, 500);

      return () => clearTimeout(introTimer);
    }
  }, [isOpen, isFirstTime]);

  // Keyboard shortcut listener: 1, 2, 3
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') {
        handleChoice('en');
      } else if (e.key === '2') {
        handleChoice('hi');
      } else if (e.key === '3') {
        handleChoice('gu');
      } else if (e.key === 'Escape' && onClose && !isFirstTime) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isFirstTime]);

  if (!isOpen) return null;

  const handleChoice = (lang: Language) => {
    soundEffects.playTap();
    soundEffects.playSuccess();
    speechManager.stop();

    // Confirm in chosen language
    if (lang === 'hi') {
      speechManager.speak('हिन्दी भाषा चुनी गई है। अब आप कैमरा विश्लेषण कर सकते हैं।', 'hi');
    } else if (lang === 'gu') {
      speechManager.speak('ગુજરાતી ભાષા પસંદ કરવામાં આવી છે. હવે તમે કેમેરાનો ઉપયોગ કરી શકો છો.', 'gu');
    } else {
      speechManager.speak('English selected. You are ready to analyze with the camera.', 'en');
    }

    onSelectLanguage(lang);
    if (onClose) onClose();
  };

  const startVoiceChoice = () => {
    if (!voiceRecognition.isSupported()) {
      setVoiceNotice('Voice recognition not supported in this browser.');
      return;
    }

    setIsListeningVoice(true);
    setVoiceNotice('Say "English", "Hindi", or "Gujarati"...');
    soundEffects.playTap();

    voiceRecognition.listen(
      'en',
      (transcript) => {
        setIsListeningVoice(false);
        const lower = transcript.toLowerCase();
        if (lower.includes('hindi') || lower.includes('हिंदी') || lower.includes('हिन्दी')) {
          handleChoice('hi');
        } else if (lower.includes('gujarati') || lower.includes('ગુજરાતી')) {
          handleChoice('gu');
        } else if (lower.includes('english') || lower.includes('अंग्रेजी')) {
          handleChoice('en');
        } else {
          setVoiceNotice(`Could not recognize language from "${transcript}". Please try 1, 2, or 3.`);
        }
      },
      () => {
        setIsListeningVoice(false);
        setVoiceNotice('Voice timeout. Tap a button or press 1, 2, 3.');
      }
    );
  };

  const languagesList: Array<{ code: Language; name: string; nativeName: string; keyNumber: string }> = [
    { code: 'en', name: 'English', nativeName: 'English (US / UK / Global)', keyNumber: '1' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी (Hindi)', keyNumber: '2' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી (Gujarati)', keyNumber: '3' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      <div className="w-full max-w-xl bg-zinc-950 border-4 border-yellow-400 rounded-3xl p-6 md:p-8 text-white shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-yellow-400/20 text-yellow-400 mb-2">
            <Globe className="w-10 h-10" aria-hidden="true" />
          </div>
          <h2 id="language-modal-title" className="text-2xl md:text-3xl font-bold tracking-tight text-yellow-400">
            {t.selectLanguageTitle}
          </h2>
          <p className="text-base md:text-lg text-zinc-300">
            {t.selectLanguageDesc}
          </p>
          <div className="inline-block bg-yellow-400 text-black font-extrabold text-sm md:text-base px-4 py-1.5 rounded-full mt-1">
            {t.pressKeyToSelect}
          </div>
        </div>

        {/* 3 Main Language Choice Buttons */}
        <div className="space-y-4" role="radiogroup" aria-label="Language selection">
          {languagesList.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleChoice(lang.code)}
                className={`w-full flex items-center justify-between p-5 md:p-6 rounded-2xl border-4 text-left transition-all cursor-pointer font-bold ${
                  isSelected
                    ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 ring-2 ring-yellow-400'
                    : 'border-zinc-700 bg-zinc-900 hover:border-yellow-400 hover:bg-zinc-800 text-white'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-400 text-black font-black text-xl">
                    {lang.keyNumber}
                  </span>
                  <div>
                    <div className="text-xl md:text-2xl font-bold">{lang.nativeName}</div>
                    <div className="text-sm md:text-base text-zinc-400">Press {lang.keyNumber} on keyboard</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isSelected && (
                    <div className="p-2 rounded-full bg-yellow-400 text-black">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Voice Selection Option */}
        <div className="pt-2 border-t border-zinc-800 flex flex-col items-center space-y-3">
          <button
            onClick={startVoiceChoice}
            disabled={isListeningVoice}
            className={`w-full py-3.5 px-4 rounded-xl border-2 font-bold flex items-center justify-center space-x-2 transition ${
              isListeningVoice
                ? 'border-red-500 bg-red-950 text-red-200 animate-pulse'
                : 'border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200'
            }`}
          >
            <Mic className={`w-5 h-5 ${isListeningVoice ? 'text-red-400 animate-bounce' : 'text-yellow-400'}`} />
            <span>{isListeningVoice ? t.listeningVoice : t.voiceSelectHint}</span>
          </button>

          {voiceNotice && (
            <p className="text-sm text-yellow-300 font-medium text-center" aria-live="polite">
              {voiceNotice}
            </p>
          )}

          {/* Close button if not first time */}
          {!isFirstTime && onClose && (
            <button
              onClick={onClose}
              className="mt-2 text-sm text-zinc-400 hover:text-white underline p-2"
            >
              Cancel (Close without changing)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
