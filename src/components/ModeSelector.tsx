import React from 'react';
import { Eye, FileText, Banknote, Palette, HelpCircle } from 'lucide-react';
import { Language, AssistiveMode } from '../types';
import { translations } from '../translations';
import { soundEffects } from '../utils/audio';

interface ModeSelectorProps {
  currentMode: AssistiveMode;
  language: Language;
  onSelectMode: (mode: AssistiveMode) => void;
  onOpenVoiceQuery: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  language,
  onSelectMode,
  onOpenVoiceQuery,
}) => {
  const t = translations[language];

  const modesConfig: Array<{ id: AssistiveMode; icon: React.ReactNode }> = [
    { id: 'general', icon: <Eye className="w-5 h-5 shrink-0" /> },
    { id: 'text_ocr', icon: <FileText className="w-5 h-5 shrink-0" /> },
    { id: 'currency', icon: <Banknote className="w-5 h-5 shrink-0" /> },
    { id: 'objects_colors', icon: <Palette className="w-5 h-5 shrink-0" /> },
    { id: 'question', icon: <HelpCircle className="w-5 h-5 shrink-0" /> },
  ];

  const handleModeClick = (modeId: AssistiveMode) => {
    soundEffects.playTap();
    if (modeId === 'question') {
      onOpenVoiceQuery();
    } else {
      onSelectMode(modeId);
    }
  };

  return (
    <nav aria-label="Assistive Mode Selection" className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {modesConfig.map((item) => {
          const isSelected = currentMode === item.id;
          const modeInfo = t.modes[item.id];

          return (
            <button
              key={item.id}
              onClick={() => handleModeClick(item.id)}
              aria-pressed={isSelected}
              aria-label={`${modeInfo.title} - ${modeInfo.desc}`}
              className={`p-3.5 rounded-2xl border-3 text-left transition flex flex-col justify-between cursor-pointer space-y-2 ${
                isSelected
                  ? 'border-yellow-400 bg-yellow-400 text-black shadow-lg ring-2 ring-yellow-400 font-extrabold'
                  : 'border-zinc-800 bg-zinc-950 hover:border-yellow-400/60 hover:bg-zinc-900 text-white font-bold'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`p-2 rounded-xl ${
                    isSelected ? 'bg-black text-yellow-400' : 'bg-zinc-900 text-yellow-400'
                  }`}
                >
                  {item.icon}
                </div>
                {isSelected && (
                  <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-black text-yellow-300 font-black">
                    Active
                  </span>
                )}
              </div>
              <div>
                <div className="text-base font-black leading-snug">{modeInfo.title}</div>
                <div
                  className={`text-xs mt-1 line-clamp-2 ${
                    isSelected ? 'text-zinc-900 font-semibold' : 'text-zinc-400'
                  }`}
                >
                  {modeInfo.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
