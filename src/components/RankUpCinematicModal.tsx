import { useEffect, useState } from 'react';
import { Sparkles, Trophy, Flame, Shield, Zap, X } from 'lucide-react';
import type { Rank } from '@/types';
import { rankConfig } from '@/data/initialData';
import { playRankUpFanfare } from '@/utils/audioEffects';

interface RankUpCinematicModalProps {
  isOpen: boolean;
  onClose: () => void;
  rank: Rank;
  level?: number;
  unlockedTitle?: string;
}

export function RankUpCinematicModal({
  isOpen,
  onClose,
  rank,
  level = 1,
  unlockedTitle = 'Shadow Monarch Vessel',
}: RankUpCinematicModalProps) {
  const [stage, setStage] = useState<'intro' | 'blast' | 'reveal'>('intro');

  const config = rankConfig[rank] ?? rankConfig.S;

  useEffect(() => {
    if (!isOpen) {
      setStage('intro');
      return;
    }

    // Play triumph audio fanfare
    playRankUpFanfare();

    // Stage 1: Intro pulse & darkness
    const t1 = setTimeout(() => setStage('blast'), 400);
    // Stage 2: Apex explosion & badge reveal
    const t2 = setTimeout(() => setStage('reveal'), 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Deep abyssal backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-base-950/95 backdrop-blur-2xl transition-opacity duration-700 animate-fade-in"
      />

      {/* Screen shake & lightning flashes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Shockwave expanding ring */}
        {stage !== 'intro' && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary-400 pointer-events-none animate-ping"
            style={{
              width: '450px',
              height: '450px',
              borderColor: config.color,
              animationDuration: '1.4s',
            }}
          />
        )}

        {/* Ambient radial blast */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-50 transition-all duration-1000"
          style={{
            background: `radial-gradient(circle, ${config.glow} 0%, rgba(139, 92, 246, 0.2) 40%, transparent 70%)`,
            transform: stage === 'reveal' ? 'translate(-50%, -50%) scale(1.3)' : 'translate(-50%, -50%) scale(0.6)',
          }}
        />
      </div>

      {/* Main Cinematic Container */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center space-y-6 animate-scale-in">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 right-0 w-8 h-8 rounded-full glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* System Directive Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-primary-500/40 bg-primary-950/60 shadow-lg">
            <Zap className="w-3.5 h-3.5 text-warning-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-[0.25em] uppercase font-bold text-primary-300">
              SYSTEM AWAKENING NOTICE
            </span>
          </div>
          <h2 className="text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-primary-200 to-purple-300 tracking-wider">
            RANK ADVANCEMENT
          </h2>
        </div>

        {/* Giant Glowing Rank Badge with Multi-Ring Rotation */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Outer Rotating Runic Ring */}
          <div
            className="absolute w-56 h-56 rounded-full border border-dashed animate-spin-slow pointer-events-none"
            style={{
              borderColor: `${config.color}60`,
              boxShadow: `0 0 30px ${config.glow}30`,
            }}
          />

          {/* Counter-rotating Astral Ring */}
          <div
            className="absolute w-48 h-48 rounded-full border animate-spin-reverse pointer-events-none"
            style={{
              borderColor: `${config.color}80`,
              boxShadow: `inset 0 0 20px ${config.glow}30`,
            }}
          >
            <div
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
              style={{ background: '#ffffff', boxShadow: `0 0 10px ${config.glow}` }}
            />
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
              style={{ background: config.color, boxShadow: `0 0 10px ${config.glow}` }}
            />
          </div>

          {/* Central Rank Core */}
          <div
            className="relative w-36 h-36 rounded-3xl flex flex-col items-center justify-center font-display font-black shadow-2xl transition-transform duration-500"
            style={{
              background: `linear-gradient(135deg, ${config.color}35 0%, rgba(8, 8, 18, 0.95) 60%, ${config.color}20 100%)`,
              border: `3px solid ${config.color}`,
              boxShadow: `0 0 50px ${config.glow}, inset 0 0 30px ${config.glow}50`,
            }}
          >
            <span
              className="text-7xl"
              style={{
                color: config.color,
                textShadow: `0 0 30px ${config.glow}, 0 0 60px ${config.glow}`,
              }}
            >
              {rank}
            </span>
            <span
              className="text-[10px] font-mono tracking-[0.3em] font-bold uppercase"
              style={{ color: config.color }}
            >
              HUNTER RANK
            </span>
          </div>
        </div>

        {/* Rewards & Bonuses Card */}
        <div className="w-full glass-strong rounded-3xl p-5 border border-primary-500/30 space-y-3 shadow-2xl bg-base-900/90 text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-warning-400" />
              <span className="text-xs font-mono font-bold text-slate-200">
                CLASS: {rank} RANK HUNTER
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-500/20 text-primary-300 border border-primary-500/30">
              LVL {level}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Flame className="w-3.5 h-3.5 text-primary-400 shrink-0" />
              <span>Title Gained: <strong className="text-primary-200">{unlockedTitle}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Shadow Mana Aura: <strong className="text-emerald-300">+35% Energy Flow</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>XP Generation Rate: <strong className="text-amber-300">Permanent Multiplier</strong></span>
            </div>
          </div>
        </div>

        {/* Confirm Awakening Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl gradient-mixed font-display font-bold text-white tracking-widest uppercase text-sm glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-warning-300" />
          <span>CONFIRM AWAKENING & ARISE</span>
        </button>
      </div>
    </div>
  );
}
