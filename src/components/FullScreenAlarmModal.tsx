import { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Volume2,
  VolumeX,
  Vibrate,
  Sparkles,
  Flame,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import type { ShadowAlarm } from '@/types';
import {
  startAlarmAudioLoop,
  startAlarmVibration,
  stopAlarmVibration,
  showAlarmBrowserNotification,
} from '@/utils/audioEffects';

interface FullScreenAlarmModalProps {
  alarm: ShadowAlarm | null;
  onDismiss: (alarm: ShadowAlarm) => void;
  onSnooze: (alarm: ShadowAlarm, minutes?: number) => void;
}

export function FullScreenAlarmModal({
  alarm,
  onDismiss,
  onSnooze,
}: FullScreenAlarmModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const audioStopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!alarm) {
      if (audioStopRef.current) {
        audioStopRef.current();
        audioStopRef.current = null;
      }
      stopAlarmVibration();
      return;
    }

    // Trigger browser notification if supported
    showAlarmBrowserNotification(
      alarm.title || 'Hunter System Alarm',
      `Hunter Directive: ${alarm.time} · Wake up and Arise to claim your Shadow XP!`
    );

    // Start looping audio
    if (!isMuted) {
      audioStopRef.current = startAlarmAudioLoop(alarm);
    }

    // Start vibration if enabled
    if (alarm.vibration) {
      startAlarmVibration();
    }

    // Second counter for visual urgency
    const timer = setInterval(() => {
      setCurrentSeconds((s) => s + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (audioStopRef.current) {
        audioStopRef.current();
        audioStopRef.current = null;
      }
      stopAlarmVibration();
    };
  }, [alarm, isMuted]);

  if (!alarm) return null;

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioStopRef.current = startAlarmAudioLoop(alarm);
    } else {
      setIsMuted(true);
      if (audioStopRef.current) {
        audioStopRef.current();
        audioStopRef.current = null;
      }
    }
  };

  const handleDismiss = () => {
    if (audioStopRef.current) {
      audioStopRef.current();
      audioStopRef.current = null;
    }
    stopAlarmVibration();
    onDismiss(alarm);
  };

  const handleSnooze = (mins = 10) => {
    if (audioStopRef.current) {
      audioStopRef.current();
      audioStopRef.current = null;
    }
    stopAlarmVibration();
    onSnooze(alarm, mins);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between p-6 bg-slate-950/95 backdrop-blur-2xl animate-fade-in overflow-hidden">
      {/* Background Animated Ethereal Mana Flames & Purple Lightning Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-600/30 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-rose-600/25 blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[140px] pointer-events-none" />

        {/* Solo Leveling Diagonal Warning Scanlines */}
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Top Header: System Status Bar */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary-500/30">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-primary-300">
            SYSTEM DIRECTIVE #ALARM
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggleMute}
          className={`p-2.5 rounded-xl border transition-all active:scale-90 ${
            isMuted
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              : 'glass border-white/10 text-slate-300 hover:text-white'
          }`}
          title={isMuted ? 'Unmute alarm' : 'Mute sound'}
          aria-label={isMuted ? 'Unmute alarm' : 'Mute sound'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
        </button>
      </div>

      {/* Centerpiece: Solo Leveling System Window */}
      <div className="relative z-10 w-full max-w-md my-auto flex flex-col items-center text-center">
        {/* Pulsing Shadow Monarch Rune Seal */}
        <div className="relative mb-6">
          <div className="absolute -inset-6 rounded-full bg-primary-500/30 blur-2xl animate-glow-pulse" />
          <div className="relative w-24 h-24 rounded-3xl gradient-mixed border-2 border-primary-400/60 flex items-center justify-center text-white shadow-[0_0_50px_rgba(139,92,246,0.6)] animate-bounce">
            <Flame className="w-12 h-12 text-primary-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
          </div>
          {alarm.vibration && (
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-base-900 border border-primary-400/40 text-primary-300 shadow-md">
              <Vibrate className="w-4 h-4 animate-spin" />
            </div>
          )}
        </div>

        {/* Huge Digital Clock */}
        <div className="font-display font-black text-6xl sm:text-7xl tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-primary-300 drop-shadow-[0_0_35px_rgba(139,92,246,0.5)] mb-2">
          {alarm.time}
        </div>

        {/* Custom Alarm Title */}
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-100 uppercase tracking-wide px-4 mb-3 drop-shadow-md">
          {alarm.title}
        </h2>

        {/* Sound & Repeat Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="px-3 py-1 rounded-lg glass border border-primary-500/30 text-xs font-mono text-primary-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-warning-400" />
            {alarm.soundType === 'custom'
              ? alarm.customSoundName || 'Custom MP3 Track'
              : alarm.builtinSound.replace(/_/g, ' ').toUpperCase()}
          </span>

          <span className="px-3 py-1 rounded-lg glass border border-white/10 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {alarm.repeat === 'daily'
              ? 'Everyday'
              : alarm.repeat === 'weekdays'
              ? 'Mon-Fri'
              : alarm.repeat === 'once'
              ? 'One-Time'
              : alarm.days.join(', ')}
          </span>
        </div>

        {/* Audio Visualizer Waves */}
        <div className="flex items-center gap-1.5 h-6 mb-6">
          {[40, 75, 100, 60, 90, 45, 80, 100, 70, 50, 85, 95].map((h, i) => (
            <span
              key={i}
              className={`w-1.5 rounded-full transition-all duration-200 ${
                isMuted ? 'bg-slate-700 h-1.5' : 'bg-primary-400 animate-pulse'
              }`}
              style={{
                height: isMuted ? '4px' : `${h}%`,
                animationDelay: `${(i % 5) * 120}ms`,
              }}
            />
          ))}
        </div>

        {/* Solo Leveling Penalty Notice HUD */}
        <div className="w-full glass-strong rounded-2xl p-4 border border-rose-500/40 shadow-lg mb-2 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
                [ PENALTY SYSTEM ACTIVE ]
              </div>
              <p className="text-xs font-mono text-slate-300 mt-0.5 leading-relaxed">
                Hunter discipline test in progress ({currentSeconds}s). Arise immediately to avoid penalty zone and claim <span className="text-warning-300 font-bold">+25 Hunter XP</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Triggers */}
      <div className="relative z-10 w-full max-w-md space-y-3 pb-4">
        {/* Main Awakening Action Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="w-full py-4 px-6 rounded-2xl gradient-mixed font-display font-bold text-base uppercase tracking-widest text-white shadow-[0_0_35px_rgba(139,92,246,0.6)] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all border border-primary-300/40 group"
        >
          <Sparkles className="w-5 h-5 text-warning-300 group-hover:rotate-12 transition-transform" />
          <span>ARISE & DISMISS (+25 XP)</span>
          <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Secondary Snooze Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSnooze(10)}
            className="py-3 px-4 rounded-xl glass font-mono text-xs text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/10"
          >
            <Clock className="w-4 h-4 text-primary-400" />
            <span>Snooze (10 min)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSnooze(5)}
            className="py-3 px-4 rounded-xl glass font-mono text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/10"
          >
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Snooze (5 min)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
