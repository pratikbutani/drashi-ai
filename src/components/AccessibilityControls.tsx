import React from 'react';
import { Sliders, X, Eye, Volume2, Type, Sparkles } from 'lucide-react';
import { Language, HighContrastTheme, TextSize } from '../types';
import { translations } from '../translations';
import { soundEffects } from '../utils/audio';

interface AccessibilityControlsProps {
  isOpen: boolean;
  language: Language;
  theme: HighContrastTheme;
  textSize: TextSize;
  speechRate: number;
  useNeuralTts: boolean;
  onClose: () => void;
  onSelectTheme: (theme: HighContrastTheme) => void;
  onSelectTextSize: (size: TextSize) => void;
  onSelectSpeechRate: (rate: number) => void;
  onToggleNeuralTts: (useNeural: boolean) => void;
}

export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  isOpen,
  language,
  theme,
  textSize,
  speechRate,
  useNeuralTts,
  onClose,
  onSelectTheme,
  onSelectTextSize,
  onSelectSpeechRate,
  onToggleNeuralTts,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-4 border-yellow-400 rounded-3xl p-6 md:p-8 text-white shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <h2
            id="accessibility-settings-title"
            className="text-2xl font-bold text-yellow-400 flex items-center space-x-2"
          >
            <Sliders className="w-7 h-7 text-yellow-400" />
            <span>{t.settings.title}</span>
          </h2>
          <button
            onClick={onClose}
            aria-label={t.settings.close}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* High Contrast Themes */}
        <div className="space-y-3">
          <label className="text-base font-bold text-zinc-200 flex items-center space-x-2">
            <Eye className="w-5 h-5 text-yellow-400" />
            <span>{t.settings.highContrast}</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'yellow-black' as HighContrastTheme, name: t.settings.contrastThemes.yellowBlack, bg: 'bg-black text-yellow-400 border-yellow-400' },
              { id: 'white-black' as HighContrastTheme, name: t.settings.contrastThemes.whiteBlack, bg: 'bg-black text-white border-white' },
              { id: 'cyan-black' as HighContrastTheme, name: t.settings.contrastThemes.cyanBlack, bg: 'bg-slate-950 text-cyan-400 border-cyan-400' },
              { id: 'black-white' as HighContrastTheme, name: t.settings.contrastThemes.blackWhite, bg: 'bg-white text-black border-black' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  soundEffects.playTap();
                  onSelectTheme(item.id);
                }}
                className={`p-4 rounded-xl border-3 font-bold text-left transition ${item.bg} ${
                  theme === item.id ? 'ring-4 ring-yellow-400' : 'opacity-80 hover:opacity-100'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Text Size */}
        <div className="space-y-3">
          <label className="text-base font-bold text-zinc-200 flex items-center space-x-2">
            <Type className="w-5 h-5 text-yellow-400" />
            <span>{t.settings.textSize}</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'normal' as TextSize, label: 'Large' },
              { id: 'large' as TextSize, label: 'Extra Large' },
              { id: 'giant' as TextSize, label: 'Giant' },
            ].map((size) => (
              <button
                key={size.id}
                onClick={() => {
                  soundEffects.playTap();
                  onSelectTextSize(size.id);
                }}
                className={`p-3.5 rounded-xl border-2 font-bold text-center transition ${
                  textSize === size.id
                    ? 'border-yellow-400 bg-yellow-400 text-black'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-yellow-400'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Speech Rate */}
        <div className="space-y-3">
          <label className="text-base font-bold text-zinc-200 flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-yellow-400" />
            <span>{t.settings.speechSpeed}</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[0.8, 1.0, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => {
                  soundEffects.playTap();
                  onSelectSpeechRate(rate);
                }}
                className={`p-3 rounded-xl border-2 font-bold text-center transition ${
                  speechRate === rate
                    ? 'border-yellow-400 bg-yellow-400 text-black'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-yellow-400'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Voice Engine Toggle */}
        <div className="space-y-3">
          <label className="text-base font-bold text-zinc-200 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span>{t.settings.speechEngine}</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                soundEffects.playTap();
                onToggleNeuralTts(true);
              }}
              className={`p-4 rounded-xl border-2 text-left font-bold transition ${
                useNeuralTts
                  ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 ring-2 ring-yellow-400'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-300'
              }`}
            >
              <div className="font-extrabold">{t.settings.neuralVoice}</div>
              <div className="text-xs text-zinc-400 mt-1">High fidelity AI narrator</div>
            </button>

            <button
              onClick={() => {
                soundEffects.playTap();
                onToggleNeuralTts(false);
              }}
              className={`p-4 rounded-xl border-2 text-left font-bold transition ${
                !useNeuralTts
                  ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 ring-2 ring-yellow-400'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-300'
              }`}
            >
              <div className="font-extrabold">{t.settings.browserVoice}</div>
              <div className="text-xs text-zinc-400 mt-1">Zero latency device speech</div>
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts Guide */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-yellow-400">
            {t.keyboardShortcuts.title}
          </h4>
          <ul className="text-sm text-zinc-300 space-y-1">
            <li>• {t.keyboardShortcuts.space}</li>
            <li>• {t.keyboardShortcuts.keys123}</li>
            <li>• {t.keyboardShortcuts.keyS}</li>
            <li>• {t.keyboardShortcuts.keyR}</li>
            <li>• {t.keyboardShortcuts.keyC}</li>
            <li>• {t.keyboardShortcuts.keyM}</li>
          </ul>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-lg"
          >
            {t.settings.close}
          </button>
        </div>
      </div>
    </div>
  );
};
