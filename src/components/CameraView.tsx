import React, { useEffect, useRef, useState } from 'react';
import { Camera, FlipHorizontal, Lightbulb, Play, Square, Upload, Video, Zap } from 'lucide-react';
import { Language, AssistiveMode } from '../types';
import { translations } from '../translations';
import { soundEffects } from '../utils/audio';

interface CameraViewProps {
  language: Language;
  mode: AssistiveMode;
  isAnalyzing: boolean;
  isContinuous: boolean;
  onCaptureSnapshot: (base64Image: string) => void;
  onCaptureVideoClip: (videoFrames: string[], videoBlobBase64?: string) => void;
  onToggleContinuous: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  language,
  mode,
  isAnalyzing,
  isContinuous,
  onCaptureSnapshot,
  onCaptureVideoClip,
  onToggleContinuous,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [isTorchSupported, setIsTorchSupported] = useState(false);
  const [isRecordingClip, setIsRecordingClip] = useState(false);
  const [clipSecondsLeft, setClipSecondsLeft] = useState(3);
  const [streamError, setStreamError] = useState<string | null>(null);

  const t = translations[language];

  // Initialize or update camera stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        setStreamError(null);
        if (currentStream) {
          currentStream.getTracks().forEach((track) => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        currentStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setHasPermission(true);

        // Check torch capability
        const track = stream.getVideoTracks()[0];
        const capabilities: any = track.getCapabilities?.() || {};
        setIsTorchSupported(!!capabilities.torch);
      } catch (err: any) {
        console.error('Camera stream access failed:', err);
        setHasPermission(false);
        setStreamError(err.message || 'Camera permission denied or camera unavailable');
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Handle continuous auto-capture mode
  useEffect(() => {
    if (!isContinuous || isAnalyzing) return;

    const interval = setInterval(() => {
      if (!isAnalyzing && videoRef.current && videoRef.current.readyState >= 2) {
        takeSnapshot(true);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isContinuous, isAnalyzing]);

  // Flashlight / Torch toggle
  const toggleTorch = async () => {
    if (!videoRef.current?.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState } as any],
        });
        setTorchOn(nextState);
        soundEffects.playTap();
      } catch (err) {
        console.warn('Torch toggle error:', err);
      }
    }
  };

  // Flip Camera
  const flipCamera = () => {
    soundEffects.playTap();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture single frame
  const takeSnapshot = (silent = false) => {
    if (!videoRef.current || videoRef.current.readyState < 2) return;
    if (!silent) soundEffects.playCapture();

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onCaptureSnapshot(dataUrl);
  };

  // Record 3-second motion clip (captures multi-frame sequence to analyze dynamics/motion)
  const recordVideoClip = async () => {
    if (!videoRef.current || isRecordingClip) return;

    setIsRecordingClip(true);
    setClipSecondsLeft(3);
    soundEffects.playCapture();

    const frames: string[] = [];
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = Math.min(video.videoWidth || 1280, 1280);
    canvas.height = Math.min(video.videoHeight || 720, 720);
    const ctx = canvas.getContext('2d');

    // Sample 4 frames across 3 seconds
    let captured = 0;
    const totalFrames = 4;
    const intervalTime = 750; // ms

    const frameInterval = setInterval(() => {
      if (ctx && video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL('image/jpeg', 0.8));
        captured++;
        setClipSecondsLeft((prev) => Math.max(0, prev - 1));
      }

      if (captured >= totalFrames) {
        clearInterval(frameInterval);
        setIsRecordingClip(false);
        soundEffects.playSuccess();
        onCaptureVideoClip(frames);
      }
    }, intervalTime);
  };

  // Handle uploaded file (image or video)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEffects.playCapture();
    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onCaptureSnapshot(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onCaptureVideoClip([], reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section
      aria-label="Camera Viewfinder and Capture Controls"
      className="relative w-full rounded-3xl overflow-hidden bg-black border-4 border-yellow-400 shadow-2xl"
    >
      {/* Video Viewport */}
      <div className="relative aspect-[4/3] sm:aspect-video w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Permission / Error Fallback */}
        {hasPermission === false && (
          <div className="absolute inset-0 bg-zinc-950/95 p-6 flex flex-col items-center justify-center text-center space-y-4 text-white">
            <Camera className="w-16 h-16 text-yellow-400" />
            <h3 className="text-xl font-bold text-yellow-400">Camera Access Needed</h3>
            <p className="text-zinc-300 max-w-md">
              {streamError || 'Please allow camera permissions in your browser to analyze your surroundings.'}
            </p>
            <button
              onClick={() => setFacingMode((f) => (f === 'environment' ? 'user' : 'environment'))}
              className="px-6 py-3 bg-yellow-400 text-black font-extrabold rounded-xl hover:bg-yellow-300"
            >
              Retry Camera Connection
            </button>
          </div>
        )}

        {/* Analyzing Overlay Badge */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <div className="bg-yellow-400 text-black font-extrabold text-lg md:text-xl px-6 py-2 rounded-full shadow-lg animate-pulse">
              {t.camera.analyzingView}
            </div>
          </div>
        )}

        {/* Recording Clip Badge */}
        {isRecordingClip && (
          <div className="absolute top-4 left-4 bg-red-600 text-white font-black px-4 py-2 rounded-full flex items-center space-x-2 animate-pulse shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full" />
            <span>RECORDING 3S MOTION CLIP ({clipSecondsLeft}s)</span>
          </div>
        )}

        {/* Live Auto-Guide Indicator Badge */}
        {isContinuous && !isRecordingClip && (
          <div className="absolute top-4 left-4 bg-emerald-500 text-black font-black px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg">
            <span className="w-3 h-3 bg-black rounded-full animate-ping" />
            <span>LIVE AUTO-GUIDE ACTIVE</span>
          </div>
        )}

        {/* Quick Viewport Action Controls (Torch & Flip) */}
        <div className="absolute top-4 right-4 flex items-center space-x-3">
          {isTorchSupported && (
            <button
              onClick={toggleTorch}
              aria-label={torchOn ? t.camera.turnOffFlash : t.camera.turnOnFlash}
              className={`p-3 rounded-full border-2 transition ${
                torchOn
                  ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]'
                  : 'bg-black/70 text-white border-zinc-500 hover:border-yellow-400'
              }`}
            >
              <Lightbulb className="w-6 h-6" />
            </button>
          )}

          <button
            onClick={flipCamera}
            aria-label={t.camera.flipCamera}
            className="p-3 rounded-full bg-black/70 text-white border-2 border-zinc-500 hover:border-yellow-400 transition"
          >
            <FlipHorizontal className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Accessible Action Controls */}
      <div className="p-4 md:p-6 bg-zinc-950 border-t-4 border-yellow-400/30 space-y-4">
        {/* Giant Main Primary Button */}
        <button
          onClick={() => takeSnapshot(false)}
          disabled={isAnalyzing || isRecordingClip}
          aria-label={`${t.camera.captureSnapshot} (or press Space)`}
          className="w-full py-5 md:py-6 px-6 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.99] text-black font-black text-xl md:text-2xl rounded-2xl shadow-xl flex items-center justify-center space-x-3 cursor-pointer transition disabled:opacity-50"
        >
          <Camera className="w-8 h-8 stroke-[2.5]" aria-hidden="true" />
          <span>{t.camera.captureSnapshot}</span>
          <span className="hidden sm:inline text-xs bg-black text-yellow-300 px-2 py-1 rounded font-bold uppercase tracking-wider">
            SPACE
          </span>
        </button>

        {/* Secondary Row of Actions: Record Video Clip, Continuous Auto-Guide, File Upload */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Record 3s Video Clip */}
          <button
            onClick={recordVideoClip}
            disabled={isAnalyzing || isRecordingClip}
            aria-label={t.camera.recordVideoClip}
            className="p-4 rounded-xl border-2 border-zinc-700 bg-zinc-900 hover:border-yellow-400 hover:bg-zinc-800 text-white font-bold flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            <Video className="w-5 h-5 text-red-400" />
            <span className="text-sm md:text-base">
              {isRecordingClip ? t.camera.recordingClip : t.camera.recordVideoClip}
            </span>
          </button>

          {/* Continuous Auto-Guide Toggle */}
          <button
            onClick={onToggleContinuous}
            aria-pressed={isContinuous}
            aria-label={isContinuous ? t.camera.continuousOn : t.camera.continuousOff}
            className={`p-4 rounded-xl border-2 font-bold flex items-center justify-center space-x-2 transition ${
              isContinuous
                ? 'border-emerald-400 bg-emerald-950/80 text-emerald-200'
                : 'border-zinc-700 bg-zinc-900 hover:border-yellow-400 hover:bg-zinc-800 text-white'
            }`}
          >
            <Zap className={`w-5 h-5 ${isContinuous ? 'text-emerald-400 fill-emerald-400' : 'text-zinc-400'}`} />
            <span className="text-sm md:text-base">
              {isContinuous ? t.camera.continuousOn : t.camera.continuousOff}
            </span>
          </button>

          {/* Upload File */}
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label={t.camera.uploadFile}
            className="p-4 rounded-xl border-2 border-zinc-700 bg-zinc-900 hover:border-yellow-400 hover:bg-zinc-800 text-white font-bold flex items-center justify-center space-x-2 transition"
          >
            <Upload className="w-5 h-5 text-yellow-400" />
            <span className="text-sm md:text-base">{t.camera.uploadFile}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </button>
        </div>
      </div>
    </section>
  );
};
