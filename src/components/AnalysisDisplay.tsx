import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Compass, Copy, DollarSign, FileText, Play, RotateCcw, ShieldAlert, Square, Volume2, VolumeX } from 'lucide-react';
import { Language, VisionAnalysis, TextSize, HighContrastTheme } from '../types';
import { translations } from '../translations';
import { soundEffects } from '../utils/audio';

interface AnalysisDisplayProps {
  language: Language;
  analysis: VisionAnalysis;
  isSpeaking: boolean;
  speechRate: number;
  textSize: TextSize;
  theme: HighContrastTheme;
  onReplayAudio: () => void;
  onStopAudio: () => void;
  onChangeRate: (newRate: number) => void;
  onReAnalyze: () => void;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({
  language,
  analysis,
  isSpeaking,
  speechRate,
  textSize,
  theme,
  onReplayAudio,
  onStopAudio,
  onChangeRate,
  onReAnalyze,
}) => {
  const t = translations[language];

  // Font size classes
  const fontClass =
    textSize === 'giant'
      ? 'text-2xl md:text-3xl leading-relaxed'
      : textSize === 'large'
      ? 'text-xl md:text-2xl leading-relaxed'
      : 'text-lg md:text-xl leading-relaxed';

  const headingClass =
    textSize === 'giant'
      ? 'text-3xl md:text-4xl font-extrabold'
      : textSize === 'large'
      ? 'text-2xl md:text-3xl font-bold'
      : 'text-xl md:text-2xl font-bold';

  // Safety badge color
  const getSafetyBadge = () => {
    switch (analysis.safetyLevel) {
      case 'danger':
        return {
          icon: <ShieldAlert className="w-8 h-8 text-red-400" />,
          bg: 'bg-red-950 border-red-500 text-red-200',
          label: t.analysis.safetyDanger,
        };
      case 'caution':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
          bg: 'bg-amber-950 border-amber-500 text-amber-200',
          label: t.analysis.safetyCaution,
        };
      case 'safe':
      default:
        return {
          icon: <CheckCircle className="w-8 h-8 text-emerald-400" />,
          bg: 'bg-emerald-950 border-emerald-500 text-emerald-200',
          label: t.analysis.safetySafe,
        };
    }
  };

  const safetyInfo = getSafetyBadge();

  return (
    <article
      aria-label="Scene Analysis and Visual Explanation"
      className="w-full bg-zinc-950 border-4 border-yellow-400 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl text-white"
    >
      {/* Top Banner: Safety Level & Audio Narration Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-zinc-800">
        <div
          role="status"
          className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl border-2 font-bold ${safetyInfo.bg}`}
        >
          {safetyInfo.icon}
          <span className="text-lg md:text-xl">{safetyInfo.label}</span>
        </div>

        {/* Audio Status & Controls */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
          {isSpeaking ? (
            <button
              onClick={onStopAudio}
              aria-label={t.analysis.stopAudio}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black cursor-pointer shadow-lg animate-pulse"
            >
              <Square className="w-5 h-5 fill-white" />
              <span>{t.analysis.stopAudio} (S)</span>
            </button>
          ) : (
            <button
              onClick={onReplayAudio}
              aria-label={t.analysis.repeatAudio}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black cursor-pointer shadow-lg"
            >
              <Volume2 className="w-5 h-5 stroke-[2.5]" />
              <span>{t.analysis.repeatAudio} (R)</span>
            </button>
          )}

          {/* Speed selector (0.8x, 1.0x, 1.25x) */}
          <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-xl p-1 text-sm font-bold">
            {[0.8, 1.0, 1.25].map((rate) => (
              <button
                key={rate}
                onClick={() => onChangeRate(rate)}
                aria-label={`Speech rate ${rate}x`}
                className={`px-3 py-1.5 rounded-lg transition ${
                  speechRate === rate
                    ? 'bg-yellow-400 text-black font-black'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Immediate Summary Headline */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-yellow-400">
          {t.analysis.summary}
        </h2>
        <p className={`${headingClass} text-white font-extrabold`} aria-live="polite">
          {analysis.headline}
        </p>
      </div>

      {/* Recommended Navigation Action (Immediate Advice) */}
      {analysis.suggestedAction && (
        <div className="p-4 rounded-2xl bg-yellow-400/15 border-2 border-yellow-400 text-yellow-200 space-y-1">
          <div className="flex items-center space-x-2 text-yellow-400 font-extrabold text-sm uppercase tracking-wider">
            <Compass className="w-5 h-5" />
            <span>{t.analysis.suggestedActionTitle}</span>
          </div>
          <p className={`${fontClass} font-bold text-white`}>{analysis.suggestedAction}</p>
        </div>
      )}

      {/* Hazards and Obstacles List */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold flex items-center space-x-2 text-amber-400">
          <AlertTriangle className="w-5 h-5" />
          <span>{t.analysis.hazardsTitle}</span>
        </h3>
        {analysis.hazardsAndObstacles && analysis.hazardsAndObstacles.length > 0 ? (
          <ul className="space-y-2" role="list">
            {analysis.hazardsAndObstacles.map((hazard, index) => (
              <li
                key={index}
                className="flex items-start space-x-3 p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span className={fontClass}>{hazard}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`${fontClass} text-zinc-400 p-3 bg-zinc-900 rounded-xl border border-zinc-800`}>
            {t.analysis.noHazards}
          </p>
        )}
      </div>

      {/* Full Spoken Script */}
      <div className="space-y-2 p-5 rounded-2xl bg-zinc-900/90 border-2 border-zinc-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-400 flex items-center space-x-2">
          <Volume2 className="w-4 h-4" />
          <span>{t.analysis.spokenNarrative}</span>
        </h3>
        <p className={`${fontClass} text-zinc-200`}>{analysis.speechScript}</p>
      </div>

      {/* Spatial Clock-Face Layout Map */}
      {analysis.spatialLayout && analysis.spatialLayout.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold flex items-center space-x-2 text-yellow-400">
            <Clock className="w-5 h-5" />
            <span>{t.analysis.spatialTitle}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analysis.spatialLayout.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start justify-between space-x-3"
              >
                <div className="space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-yellow-400 text-black font-extrabold text-xs">
                    {item.position}
                  </span>
                  <div className={`${fontClass} font-semibold text-white`}>{item.item}</div>
                </div>
                {item.distance && (
                  <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded font-medium shrink-0">
                    {item.distance}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detected Text / Document OCR */}
      {analysis.detectedText && analysis.detectedText.trim() !== '' && (
        <div className="space-y-2 p-4 rounded-2xl bg-blue-950/30 border-2 border-blue-500 text-blue-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>{t.analysis.textDetectedTitle}</span>
            </h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(analysis.detectedText || '');
                soundEffects.playTap();
              }}
              aria-label="Copy detected text"
              className="p-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs flex items-center space-x-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>
          <p className={`${fontClass} whitespace-pre-wrap font-mono text-zinc-100`}>
            {analysis.detectedText}
          </p>
        </div>
      )}

      {/* Detected Currency / Banknotes */}
      {analysis.detectedCurrency && analysis.detectedCurrency.trim() !== '' && (
        <div className="space-y-2 p-4 rounded-2xl bg-emerald-950/30 border-2 border-emerald-500 text-emerald-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>{t.analysis.currencyDetectedTitle}</span>
          </h3>
          <p className={`${fontClass} font-bold text-emerald-200`}>
            {analysis.detectedCurrency}
          </p>
        </div>
      )}

      {/* Bottom Re-analyze CTA */}
      <div className="pt-4 border-t border-zinc-800 flex justify-end">
        <button
          onClick={onReAnalyze}
          className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-700 text-yellow-300 font-bold flex items-center space-x-2 cursor-pointer transition"
        >
          <RotateCcw className="w-5 h-5" />
          <span>{t.analysis.reAnalyze}</span>
        </button>
      </div>
    </article>
  );
};
