import { useEffect, useState, useMemo } from 'react';
import { Sparkles, Trophy, Flame, Shield, Zap, X, ArrowRight, Award, Crown } from 'lucide-react';
import type { Rank } from '@/types';
import { rankConfig } from '@/data/initialData';
import { RANK_TIMELINE_DEFINITIONS } from '@/data/rankTimelineData';
import {
  playRankUpFanfare,
  playLightningCrackSound,
  playShadowResonance,
} from '@/utils/audioEffects';
import { PurpleLightning } from '@/components/PurpleLightning';

export interface RankUpCinematicModalProps {
  isOpen: boolean;
  onClose: () => void;
  rank: Rank;
  oldRank?: Rank;
  level?: number;
  unlockedTitle?: string;
  totalXp?: number;
}

export function RankUpCinematicModal({
  isOpen,
  onClose,
  rank,
  oldRank,
  level = 1,
  unlockedTitle,
  totalXp,
}: RankUpCinematicModalProps) {
  const [stage, setStage] = useState<'surge' | 'blast' | 'ascension'>('surge');
  const [screenShaking, setScreenShaking] = useState(true);

  const prevRank = useMemo(() => {
    if (oldRank && oldRank !== rank) return oldRank;
    const rankOrder: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S'];
    const idx = rankOrder.indexOf(rank);
    return idx > 0 ? rankOrder[idx - 1] : 'E';
  }, [oldRank, rank]);

  const config = rankConfig[rank] ?? rankConfig.S;
  const prevConfig = rankConfig[prevRank] ?? rankConfig.E;
  const rankMilestone = RANK_TIMELINE_DEFINITIONS[rank];

  const titleToDisplay = unlockedTitle || rankMilestone?.title || `${rank}-Rank Shadow Sovereign`;
  const statBonusToDisplay = rankMilestone?.statBonus || '+25% Peak Mana Resonance';

  // Generate 28 floating purple and gold celebration mana particles
  const particles = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      left: `${(i * 3.7) % 100}%`,
      top: `${(i * 7.3) % 100}%`,
      size: (i % 4) * 2 + 3,
      delay: `${(i * 0.12).toFixed(2)}s`,
      duration: `${3 + (i % 3)}s`,
      color: i % 3 === 0 ? '#fbbf24' : i % 2 === 0 ? '#c084fc' : '#a855f7',
    }));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setStage('surge');
      setScreenShaking(false);
      return;
    }

    // High-impact sound and haptic initiation
    try {
      playLightningCrackSound();
      playShadowResonance();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([80, 40, 150, 40, 250]);
      }
    } catch {
      // safe fallback
    }

    setScreenShaking(true);

    // Stage 1: Surge of mana & screen vibration (0 to 650ms)
    const t1 = setTimeout(() => {
      setStage('blast');
      try {
        playLightningCrackSound();
      } catch {
        // safe fallback
      }
    }, 650);

    // Stage 2: Stop shake, trigger fanfare & ascend (1300ms)
    const t2 = setTimeout(() => {
      setScreenShaking(false);
      setStage('ascension');
      try {
        playRankUpFanfare();
      } catch {
        // safe fallback
      }
    }, 1300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 select-none overflow-hidden">
      {/* Abyssal Backdrop Overlay with Heavy Blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#030209]/95 backdrop-blur-3xl transition-opacity duration-700 cursor-pointer"
        aria-label="Close celebration modal"
      />

      {/* Background Interactive Purple Lightning System */}
      <div className="fixed inset-0 pointer-events-none opacity-60 z-0">
        <PurpleLightning interactive={false} frequencySeconds={2} intensity="high" />
      </div>

      {/* Floating Purple & Gold Mana Embers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full animate-float-up pointer-events-none"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}`,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* Multi-tier Expanding Purple Shockwaves */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
        {/* Tier 1 Primary Purple Shockwave */}
        <div
          className="absolute rounded-full border border-purple-500/80 animate-shockwave-purple"
          style={{
            width: '320px',
            height: '320px',
            boxShadow: '0 0 60px rgba(168, 85, 247, 0.7), inset 0 0 30px rgba(147, 51, 234, 0.5)',
          }}
        />

        {/* Tier 2 Delayed Outward Shockwave */}
        {stage !== 'surge' && (
          <div
            className="absolute rounded-full border-2 border-primary-400 animate-shockwave-purple"
            style={{
              width: '420px',
              height: '420px',
              animationDelay: '0.4s',
              borderColor: config.color,
              boxShadow: `0 0 80px ${config.glow}, inset 0 0 40px ${config.glow}`,
            }}
          />
        )}

        {/* Vertical Celestial Purple Sovereign Beam */}
        <div
          className="absolute w-32 sm:w-48 h-full bg-gradient-to-b from-transparent via-purple-600/25 to-transparent blur-2xl pointer-events-none transition-opacity duration-1000"
          style={{
            opacity: stage === 'ascension' ? 0.7 : 0.3,
          }}
        />

        {/* Ambient Expanding Monarch Flame Aura */}
        <div
          className="w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] rounded-full blur-3xl opacity-50 shadow-flame-aura transition-all duration-1000 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${config.glow} 0%, rgba(147, 51, 234, 0.3) 40%, rgba(15, 10, 30, 0) 70%)`,
            transform: stage === 'ascension' ? 'scale(1.2)' : 'scale(0.8)',
          }}
        />
      </div>

      {/* Main Celebration Content Container with optional Screen Shake */}
      <div
        className={`relative z-10 w-full max-w-sm sm:max-w-md my-auto flex flex-col items-center text-center space-y-4 sm:space-y-5 animate-scale-in max-h-[96vh] overflow-y-auto no-scrollbar py-2 ${
          screenShaking ? 'animate-celebration-shake' : ''
        }`}
      >
        {/* Top Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="self-end w-8 h-8 rounded-full bg-base-900/90 hover:bg-base-800 border border-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-lg cursor-pointer hover:rotate-90"
          title="Close Celebration"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Solo Leveling System Notice Badge */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#120a26]/90 border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <Zap className="w-3.5 h-3.5 text-warning-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-[0.25em] uppercase font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-300 to-purple-100">
              SYSTEM RANK ASCENSION DIRECTIVE
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-purple-100 to-primary-200 tracking-wider drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]">
            AWAKENING COMPLETE
          </h2>

          {/* Rank Transition Indicator: e.g. E-RANK ➔ D-RANK */}
          <div className="flex items-center justify-center gap-2.5 pt-1">
            <div
              className="px-2.5 py-0.5 rounded-lg border text-xs font-mono font-bold"
              style={{
                backgroundColor: `${prevConfig.color}15`,
                borderColor: `${prevConfig.color}40`,
                color: prevConfig.color,
              }}
            >
              {prevRank} RANK
            </div>
            <div className="flex items-center text-primary-400 animate-pulse">
              <ArrowRight className="w-4 h-4" />
            </div>
            <div
              className="px-3 py-0.5 rounded-lg font-mono font-bold text-xs sm:text-sm shadow-md"
              style={{
                backgroundColor: `${config.color}22`,
                borderColor: `${config.color}80`,
                borderWidth: '1px',
                color: config.color,
                boxShadow: `0 0 15px ${config.glow}`,
              }}
            >
              {rank} RANK
            </div>
          </div>
        </div>

        {/* Giant Glowing Central Monarch Rank Insignia */}
        <div className="relative my-3 sm:my-4 flex items-center justify-center">
          {/* Outer Rotating Runic Ring */}
          <div
            className="absolute w-56 sm:w-64 h-56 sm:h-64 rounded-full border border-dashed animate-spin-slow pointer-events-none"
            style={{
              borderColor: `${config.color}60`,
              boxShadow: `0 0 35px ${config.glow}, inset 0 0 20px ${config.glow}40`,
            }}
          />

          {/* Counter-Rotating Astral Ring with Node Orbs */}
          <div
            className="absolute w-44 sm:w-52 h-44 sm:h-52 rounded-full border animate-spin-reverse pointer-events-none"
            style={{
              borderColor: `${config.color}90`,
              boxShadow: `inset 0 0 25px ${config.glow}50`,
            }}
          >
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full"
              style={{
                background: '#ffffff',
                boxShadow: `0 0 14px #ffffff, 0 0 25px ${config.glow}`,
              }}
            />
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full"
              style={{
                background: config.color,
                boxShadow: `0 0 14px ${config.color}, 0 0 25px ${config.glow}`,
              }}
            />
          </div>

          {/* Central 3D High-Impact Rank Emblem */}
          <div
            className="relative w-36 sm:w-40 h-36 sm:h-40 rounded-3xl flex flex-col items-center justify-center font-display font-black shadow-2xl transition-all duration-700 animate-monarch-pulse"
            style={{
              background: `linear-gradient(135deg, ${config.color}35 0%, rgba(10, 8, 22, 0.96) 55%, ${config.color}25 100%)`,
              border: `3px solid ${config.color}`,
              boxShadow: `0 0 60px ${config.glow}, 0 0 120px rgba(139, 92, 246, 0.5), inset 0 0 30px ${config.glow}60`,
            }}
          >
            <Crown className="w-5 h-5 mb-1 opacity-90 animate-bounce" style={{ color: config.color }} />
            <span
              className="text-6xl sm:text-7xl leading-none"
              style={{
                color: config.color,
                textShadow: `0 0 30px ${config.glow}, 0 0 60px ${config.glow}, 0 0 90px #ffffff`,
              }}
            >
              {rank}
            </span>
            <span
              className="text-[9px] font-mono tracking-[0.3em] font-black uppercase mt-1"
              style={{ color: config.color }}
            >
              HUNTER RANK
            </span>
          </div>
        </div>

        {/* Rewards, Title & Power Buffs Dossier */}
        <div
          className="w-full rounded-2xl p-4 sm:p-5 text-left space-y-3 shadow-2xl relative overflow-hidden"
          style={{
            background: 'rgba(15, 12, 28, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(139, 92, 246, 0.2)',
          }}
        >
          {/* Card Top Title Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-warning-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100">
                CLASS: {rank} RANK HUNTER
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {totalXp !== undefined && totalXp > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold">
                  {totalXp.toLocaleString()} XP
                </span>
              )}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-500/20 text-primary-300 border border-primary-500/40 font-bold">
                LVL {level}
              </span>
            </div>
          </div>

          {/* Unlocked Perks List */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2.5 text-slate-200">
              <Flame className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                Title Awakened: <strong className="text-purple-200">{titleToDisplay}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-200">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Vitality Protocol: <strong className="text-emerald-300">{statBonusToDisplay}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-200">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Authority Expansion: <strong className="text-amber-300">Permanent Multiplier Unlocked</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Confirm Awakening & Arise Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl font-display font-extrabold text-white tracking-widest uppercase text-sm glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(139,92,246,0.5)] flex items-center justify-center gap-2 cursor-pointer border border-purple-400/50"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 60%, #1e1b4b 100%)',
          }}
        >
          <Award className="w-4 h-4 text-amber-300 animate-spin-slow" />
          <span>CONFIRM AWAKENING & ARISE</span>
        </button>
      </div>
    </div>
  );
}
