import { useState, useEffect, useRef } from 'react';
import { Terminal, ChevronRight, Zap } from 'lucide-react';
import { playTone } from '@/utils/audioEffects';

interface SystemTypewriterBannerProps {
  messages?: string[];
  typingSpeedMs?: number;
  pauseBetweenMs?: number;
  enableSound?: boolean;
}

const DEFAULT_SYSTEM_MESSAGES = [
  'DAILY QUEST: PHYSICAL RE-CONDITIONING INITIALIZED. DO NOT NEGLECT DAILY TRAINING.',
  'ALERT: SHADOW MONARCH VESSEL DETECTED. ALL COMBAT STATS ACCELERATING.',
  'NOTIFICATION: HYDRATION TARGETS DIRECTLY GOVERN CELLULAR MANA CAPACITY.',
  'SYSTEM APPRAISAL: CONSISTENCY STREAK ACTIVE. PENALTY ZONE EVADED.',
  'DIRECTIVE: RECORD SETS AND REPS PRECISELY TO UNLOCK RANK ADVANCEMENT.',
  'MONARCH BROADCAST: "ARISE" — HARNESS UNYIELDING WILLPOWER IN EVERY REP.',
];

export function SystemTypewriterBanner({
  messages = DEFAULT_SYSTEM_MESSAGES,
  typingSpeedMs = 38,
  pauseBetweenMs = 4500,
  enableSound = false,
}: SystemTypewriterBannerProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const audioThrottler = useRef(0);

  const fullText = messages[currentMessageIndex] || '';

  // Typewriter effect
  useEffect(() => {
    let charIndex = 0;
    setDisplayedText('');
    setIsTyping(true);

    const typeInterval = setInterval(() => {
      charIndex++;
      setDisplayedText(fullText.slice(0, charIndex));

      // Subtle typewriter click tone (throttled)
      if (enableSound && charIndex % 3 === 0 && Date.now() - audioThrottler.current > 80) {
        audioThrottler.current = Date.now();
        playTone(1200 + Math.random() * 200, 0.02, 'sine', 0.02);
      }

      if (charIndex >= fullText.length) {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, typingSpeedMs);

    return () => clearInterval(typeInterval);
  }, [currentMessageIndex, fullText, typingSpeedMs, enableSound]);

  // Pause and cycle to next message
  useEffect(() => {
    if (isTyping) return;

    const pauseTimer = setTimeout(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, pauseBetweenMs);

    return () => clearTimeout(pauseTimer);
  }, [isTyping, pauseBetweenMs, messages.length]);

  const handleNextMessage = () => {
    setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
  };

  return (
    <div
      onClick={handleNextMessage}
      className="glass-sheen glass rounded-2xl p-3 border border-primary-500/30 hover:border-primary-400/60 transition-all duration-300 cursor-pointer select-none group bg-gradient-to-r from-base-900 via-primary-950/20 to-base-900 shadow-md shadow-primary-950/40"
    >
      <div className="flex items-center justify-between mb-1.5 border-b border-primary-500/20 pb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-primary-500/20 border border-primary-500/40 flex items-center justify-center">
            <Terminal className="w-2.5 h-2.5 text-primary-300" />
          </div>
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-bold text-primary-300">
            SYSTEM NOTIFICATION
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        </div>
        <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400 group-hover:text-primary-300 transition-colors">
          <Zap className="w-2.5 h-2.5 text-warning-400 animate-pulse" />
          <span>Tap to advance</span>
          <ChevronRight className="w-2.5 h-2.5" />
        </div>
      </div>

      <div className="flex items-start gap-2">
        <p className="text-xs font-mono font-medium text-slate-200 leading-relaxed tracking-wide min-h-[2.5rem]">
          {displayedText}
          <span className="inline-block w-2 h-3.5 ml-1 align-middle bg-primary-400 animate-pulse" />
        </p>
      </div>
    </div>
  );
}
