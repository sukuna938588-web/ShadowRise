import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, X, RotateCcw, CheckCircle2, ShieldAlert } from 'lucide-react';
import {
  type VoiceMessage,
  getRandomHunterVoiceMessage,
  speakHunterMotivation,
  stopSpeaking,
  isSpeechSupported,
} from '@/utils/voiceMotivation';

interface VoiceMotivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: VoiceMessage | null;
  workoutTitle?: string;
  xpEarned?: number;
}

export function VoiceMotivationModal({
  isOpen,
  onClose,
  initialMessage,
  workoutTitle = 'Combat Training',
  xpEarned = 150,
}: VoiceMotivationModalProps) {
  const [currentMessage, setCurrentMessage] = useState<VoiceMessage>(
    initialMessage || getRandomHunterVoiceMessage()
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const msg = initialMessage || getRandomHunterVoiceMessage();
      setCurrentMessage(msg);
      if (speechEnabled) {
        setIsPlaying(true);
        speakHunterMotivation(msg, {
          playFanfareFirst: true,
          onEnd: () => setIsPlaying(false),
          onError: () => setIsPlaying(false),
        });
      }
    } else {
      stopSpeaking();
      setIsPlaying(false);
    }
  }, [isOpen, initialMessage, speechEnabled]);

  if (!isOpen) return null;

  const handleReplay = () => {
    stopSpeaking();
    setIsPlaying(true);
    speakHunterMotivation(currentMessage, {
      playFanfareFirst: false,
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const handleCycleQuote = () => {
    stopSpeaking();
    const nextMsg = getRandomHunterVoiceMessage();
    setCurrentMessage(nextMsg);
    if (speechEnabled) {
      setIsPlaying(true);
      speakHunterMotivation(nextMsg, {
        playFanfareFirst: false,
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  };

  const handleDismiss = () => {
    stopSpeaking();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-strong border border-primary-500/40 rounded-3xl w-full max-w-md p-6 relative overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.35)] animate-scale-in">
        {/* Ambient glow backgrounds */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-primary-500/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-secondary-500/20 blur-3xl pointer-events-none" />

        {/* Dismiss trigger */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          aria-label="Close voice celebration"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hunter Badge & Soundwave Animation */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 via-secondary-600 to-indigo-700 border-2 border-primary-400/50 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Sparkles className="w-8 h-8 text-primary-200 animate-pulse" />
            </div>
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary-500" />
              </span>
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/15 border border-primary-500/30 text-[10px] font-mono uppercase tracking-widest text-primary-300 mb-1.5">
            <span>System Voice Transmission</span>
          </div>

          <h3 className="font-display font-bold text-xl uppercase tracking-wider text-slate-100 mb-0.5">
            Workout Cleared
          </h3>
          <p className="text-xs font-mono text-slate-400 mb-4">
            {workoutTitle} · <span className="text-emerald-400 font-bold">+{xpEarned} XP</span>
          </p>

          {/* Spoken Quote Box */}
          <div className="w-full glass-strong rounded-2xl p-4 mb-4 border border-white/10 text-left relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-primary-300">
                  {currentMessage.speaker}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {currentMessage.title}
              </span>
            </div>

            <p className="text-sm text-slate-200 font-display italic leading-relaxed">
              "{currentMessage.text}"
            </p>

            {/* Audio Wave Visualizer */}
            <div className="flex items-center gap-1 mt-3 pt-2 border-t border-white/5">
              <div className="flex items-center gap-0.5">
                {[12, 20, 16, 24, 14, 22, 18, 10, 26, 16].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isPlaying ? 'bg-primary-400 animate-pulse' : 'bg-slate-600'
                    }`}
                    style={{
                      height: isPlaying ? `${h}px` : '6px',
                      animationDelay: `${i * 70}ms`,
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-mono text-slate-400 ml-auto">
                {isPlaying ? 'Voice playing...' : 'Voice broadcast ready'}
              </span>
            </div>
          </div>

          {/* Voice Engine Note if unsupported */}
          {!isSpeechSupported() && (
            <div className="w-full p-2.5 mb-3 rounded-xl glass border border-amber-500/30 flex items-center gap-2 text-left">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-[11px] font-mono text-amber-200/90">
                Browser Speech API unavailable; text transmission and audio fanfares active.
              </p>
            </div>
          )}

          {/* Voice Controls */}
          <div className="w-full grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={handleReplay}
              disabled={isPlaying}
              className="py-2.5 px-3 rounded-xl glass border border-primary-500/30 font-mono text-xs text-primary-300 hover:text-white hover:bg-primary-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Voice</span>
            </button>

            <button
              type="button"
              onClick={handleCycleQuote}
              className="py-2.5 px-3 rounded-xl glass border border-white/10 font-mono text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-secondary-400" />
              <span>Next Quote</span>
            </button>
          </div>

          {/* Bottom actions: Mute toggle & Continue */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setSpeechEnabled(!speechEnabled);
                if (isPlaying) stopSpeaking();
              }}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
            >
              {speechEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-primary-400" />
                  <span>Voice Auto-Play: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-500" />
                  <span>Voice Auto-Play: OFF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="py-2.5 px-5 rounded-xl gradient-mixed font-display font-bold text-xs uppercase tracking-wider text-white shadow-lg shadow-primary-500/20 hover:opacity-95 transition-opacity flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Claim Victory</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
