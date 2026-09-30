/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Sliders,
  HelpCircle,
  Volume2,
  VolumeX,
  Eye,
  Info,
  Shield,
  Zap,
} from 'lucide-react';
import {
  Language,
  AssistiveMode,
  HighContrastTheme,
  TextSize,
  VisionAnalysis,
} from './types';
import { translations } from './translations';
import { soundEffects } from './utils/audio';
import { speechManager } from './utils/speech';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { CameraView } from './components/CameraView';
import { ModeSelector } from './components/ModeSelector';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { VoiceQueryModal } from './components/VoiceQueryModal';
import { AccessibilityControls } from './components/AccessibilityControls';

export default function App() {
  // Language selection: starts open to explicitly prompt user before any output
  const [language, setLanguage] = useState<Language>('en');
  const [isFirstLanguageChoice, setIsFirstLanguageChoice] = useState(true);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(true);

  // Assistive mode
  const [currentMode, setCurrentMode] = useState<AssistiveMode>('general');

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<VisionAnalysis | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio / Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [useNeuralTts, setUseNeuralTts] = useState<boolean>(false);

  // Continuous auto-scan
  const [isContinuous, setIsContinuous] = useState(false);

  // Accessibility styling
  const [theme, setTheme] = useState<HighContrastTheme>('yellow-black');
  const [textSize, setTextSize] = useState<TextSize>('large');

  // Modals
  const [isVoiceQueryOpen, setIsVoiceQueryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const t = translations[language];

  // Initialize speech voices
  useEffect(() => {
    speechManager.initVoices();
  }, []);

  // Sync isSpeaking state
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSpeaking(speechManager.isSpeaking);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Theme wrapper styling
  const getThemeClasses = () => {
    switch (theme) {
      case 'white-black':
        return 'bg-black text-white border-white';
      case 'cyan-black':
        return 'bg-slate-950 text-cyan-300 border-cyan-400';
      case 'black-white':
        return 'bg-white text-black border-black';
      case 'yellow-black':
      default:
        return 'bg-black text-zinc-100 border-yellow-400';
    }
  };

  // Perform Vision Analysis via Express backend
  const performAnalysis = useCallback(
    async (
      imagePayload: { image?: string; images?: string[]; videoData?: any },
      questionOverride?: string
    ) => {
      setIsAnalyzing(true);
      setErrorMessage(null);
      soundEffects.playAnalyzing();

      try {
        const response = await fetch('/api/analyze-vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...imagePayload,
            language,
            mode: questionOverride ? 'question' : currentMode,
            userQuestion: questionOverride,
            isContinuous,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to analyze scene');
        }

        const analysisResult: VisionAnalysis = data.analysis;
        setCurrentAnalysis(analysisResult);

        // Sound feedback
        if (analysisResult.safetyLevel === 'danger') {
          soundEffects.playAlert();
        } else {
          soundEffects.playSuccess();
        }

        // Automatic audio narration in selected language
        if (analysisResult.speechScript) {
          speechManager.speak(analysisResult.speechScript, language, {
            rate: speechRate,
            useNeuralTts,
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
          });
        }
      } catch (err: any) {
        console.error('Analysis error:', err);
        const errText = err.message || 'Analysis could not be completed. Please try again.';
        setErrorMessage(errText);
        soundEffects.playAlert();
        speechManager.speak(errText, language);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [language, currentMode, isContinuous, speechRate, useNeuralTts]
  );

  // Capture single snapshot
  const handleCaptureSnapshot = useCallback(
    (base64Image: string) => {
      setActiveImage(base64Image);
      performAnalysis({ image: base64Image });
    },
    [performAnalysis]
  );

  // Capture multi-frame video sequence
  const handleCaptureVideoClip = useCallback(
    (frames: string[], videoBlobBase64?: string) => {
      if (frames.length > 0) {
        setActiveImage(frames[0]);
        performAnalysis({ images: frames });
      } else if (videoBlobBase64) {
        performAnalysis({
          videoData: {
            base64: videoBlobBase64,
            mimeType: 'video/mp4',
          },
        });
      }
    },
    [performAnalysis]
  );

  // Handle voice question submit
  const handleVoiceQuestionSubmit = useCallback(
    (questionText: string) => {
      setCurrentMode('question');
      if (activeImage) {
        performAnalysis({ image: activeImage }, questionText);
      } else {
        // Trigger fresh analysis with the question
        const videoEl = document.querySelector('video');
        if (videoEl && videoEl.readyState >= 2) {
          const canvas = document.createElement('canvas');
          canvas.width = videoEl.videoWidth || 1280;
          canvas.height = videoEl.videoHeight || 720;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setActiveImage(dataUrl);
            performAnalysis({ image: dataUrl }, questionText);
            return;
          }
        }
        performAnalysis({}, questionText);
      }
    },
    [activeImage, performAnalysis]
  );

  // Keyboard accessibility listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in modal textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Space: trigger snapshot
      if (e.code === 'Space') {
        e.preventDefault();
        const mainCaptureBtn = document.querySelector('button[aria-label*="Analyze Current View"]') as HTMLButtonElement;
        if (mainCaptureBtn && !isAnalyzing) {
          mainCaptureBtn.click();
        }
      }

      // S: stop audio
      if (e.key === 's' || e.key === 'S') {
        speechManager.stop();
        setIsSpeaking(false);
      }

      // R: replay audio
      if (e.key === 'r' || e.key === 'R') {
        if (currentAnalysis?.speechScript) {
          speechManager.speak(currentAnalysis.speechScript, language, {
            rate: speechRate,
            useNeuralTts,
          });
        }
      }

      // 1, 2, 3: quick language switches
      if (e.key === '1') {
        setLanguage('en');
        speechManager.speak('Language set to English', 'en');
      } else if (e.key === '2') {
        setLanguage('hi');
        speechManager.speak('हिन्दी भाषा चुनी गई है', 'hi');
      } else if (e.key === '3') {
        setLanguage('gu');
        speechManager.speak('ગુજરાતી ભાષા પસંદ કરી છે', 'gu');
      }

      // C: toggle continuous auto-guide
      if (e.key === 'c' || e.key === 'C') {
        setIsContinuous((prev) => !prev);
      }

      // M: cycle modes
      if (e.key === 'm' || e.key === 'M') {
        const modes: AssistiveMode[] = ['general', 'text_ocr', 'currency', 'objects_colors', 'question'];
        setCurrentMode((curr) => {
          const nextIdx = (modes.indexOf(curr) + 1) % modes.length;
          return modes[nextIdx];
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnalyzing, currentAnalysis, language, speechRate, useNeuralTts]);

  return (
    <div className={`min-h-screen ${getThemeClasses()} flex flex-col font-sans transition-colors duration-200`}>
      {/* Screen Reader Live Region for Instant Verbal Feedback */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {isAnalyzing ? t.camera.analyzingView : currentAnalysis?.headline || ''}
      </div>

      {/* Top Accessible Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b-4 border-yellow-400 p-4 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* App Branding */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-yellow-400 text-black">
              <Eye className="w-8 h-8 stroke-[2.5]" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-yellow-400 flex items-center gap-2">
                <span>{t.appTitle}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 font-extrabold border border-yellow-400/40">
                  ASSISTIVE
                </span>
              </h1>
              <p className="text-xs md:text-sm text-zinc-400 font-medium hidden sm:block">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Top Quick Actions: Language Selector, Audio Toggle, Settings */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Language Selector Button */}
            <button
              onClick={() => {
                soundEffects.playTap();
                setIsLanguageModalOpen(true);
              }}
              aria-label={`Current language: ${t.languages[language]}. Tap or press 1, 2, 3 to change language.`}
              className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl border-2 border-yellow-400 bg-yellow-400/10 hover:bg-yellow-400 hover:text-black text-yellow-300 font-bold transition cursor-pointer"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm md:text-base font-extrabold uppercase">
                {language === 'hi' ? 'हिन्दी' : language === 'gu' ? 'ગુજરાતી' : 'English'}
              </span>
            </button>

            {/* Audio Stop / Speaking indicator */}
            {isSpeaking && (
              <button
                onClick={() => {
                  speechManager.stop();
                  setIsSpeaking(false);
                }}
                aria-label={t.analysis.stopAudio}
                className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold animate-pulse cursor-pointer shadow-lg"
              >
                <VolumeX className="w-6 h-6" />
              </button>
            )}

            {/* Accessibility Settings */}
            <button
              onClick={() => {
                soundEffects.playTap();
                setIsSettingsOpen(true);
              }}
              aria-label={t.settings.title}
              className="p-2.5 rounded-xl border-2 border-zinc-700 bg-zinc-900 hover:border-yellow-400 hover:text-yellow-300 text-white transition cursor-pointer"
            >
              <Sliders className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Assistive Mode Selector */}
        <section aria-label="Select Assistive Vision Mode">
          <ModeSelector
            currentMode={currentMode}
            language={language}
            onSelectMode={(mode) => setCurrentMode(mode)}
            onOpenVoiceQuery={() => setIsVoiceQueryOpen(true)}
          />
        </section>

        {/* Live Camera View & Capture Controls */}
        <CameraView
          language={language}
          mode={currentMode}
          isAnalyzing={isAnalyzing}
          isContinuous={isContinuous}
          onCaptureSnapshot={handleCaptureSnapshot}
          onCaptureVideoClip={handleCaptureVideoClip}
          onToggleContinuous={() => {
            soundEffects.playTap();
            setIsContinuous((prev) => !prev);
          }}
        />

        {/* Error Announcement */}
        {errorMessage && (
          <div
            role="alert"
            className="p-5 rounded-2xl bg-red-950 border-3 border-red-500 text-red-200 font-bold text-lg flex items-center space-x-3"
          >
            <Shield className="w-7 h-7 text-red-400 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Scene Analysis Results Display */}
        {currentAnalysis && (
          <AnalysisDisplay
            language={language}
            analysis={currentAnalysis}
            isSpeaking={isSpeaking}
            speechRate={speechRate}
            textSize={textSize}
            theme={theme}
            onReplayAudio={() => {
              if (currentAnalysis?.speechScript) {
                speechManager.speak(currentAnalysis.speechScript, language, {
                  rate: speechRate,
                  useNeuralTts,
                });
              }
            }}
            onStopAudio={() => {
              speechManager.stop();
              setIsSpeaking(false);
            }}
            onChangeRate={(rate) => setSpeechRate(rate)}
            onReAnalyze={() => {
              const videoEl = document.querySelector('video');
              if (videoEl && videoEl.readyState >= 2) {
                const canvas = document.createElement('canvas');
                canvas.width = videoEl.videoWidth || 1280;
                canvas.height = videoEl.videoHeight || 720;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
                  handleCaptureSnapshot(canvas.toDataURL('image/jpeg', 0.85));
                }
              }
            }}
          />
        )}

        {/* Help & Accessibility Instructions Accordion */}
        <section
          aria-label="How to use Drishti AI"
          className="p-5 rounded-2xl bg-zinc-950 border-2 border-zinc-800 text-zinc-300 space-y-3"
        >
          <div className="flex items-center space-x-2 text-yellow-400 font-bold text-base">
            <Info className="w-5 h-5" />
            <span>Accessible Navigation Guide & Shortcuts</span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Aim your camera towards any room, path, document, medicine, or banknote. Press <strong className="text-yellow-400">Spacebar</strong> or tap the big yellow button to hear an immediate spoken description.
            Press <strong className="text-yellow-400">1 for English</strong>, <strong className="text-yellow-400">2 for Hindi (हिन्दी)</strong>, or <strong className="text-yellow-400">3 for Gujarati (ગુજરાતી)</strong> at any time.
          </p>
        </section>
      </main>

      {/* Accessible Modals */}
      {/* 1. Language Preference Prompt (Prominently shown before output as requested) */}
      <LanguageSelectorModal
        currentLanguage={language}
        isOpen={isLanguageModalOpen}
        isFirstTime={isFirstLanguageChoice}
        onSelectLanguage={(chosenLang) => {
          setLanguage(chosenLang);
          setIsFirstLanguageChoice(false);
          setIsLanguageModalOpen(false);
        }}
        onClose={() => setIsLanguageModalOpen(false)}
      />

      {/* 2. Voice Query Question Modal */}
      <VoiceQueryModal
        isOpen={isVoiceQueryOpen}
        language={language}
        onClose={() => setIsVoiceQueryOpen(false)}
        onSubmitQuestion={handleVoiceQuestionSubmit}
      />

      {/* 3. Accessibility Settings Modal */}
      <AccessibilityControls
        isOpen={isSettingsOpen}
        language={language}
        theme={theme}
        textSize={textSize}
        speechRate={speechRate}
        useNeuralTts={useNeuralTts}
        onClose={() => setIsSettingsOpen(false)}
        onSelectTheme={(t) => setTheme(t)}
        onSelectTextSize={(s) => setTextSize(s)}
        onSelectSpeechRate={(r) => setSpeechRate(r)}
        onToggleNeuralTts={(val) => setUseNeuralTts(val)}
      />
    </div>
  );
}
