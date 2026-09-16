import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Flag,
  Flame,
  X,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  Volume2,
  VolumeX,
  Plus,
  Minus,
} from 'lucide-react';
import type { ExerciseTimerMode } from '@/types';
import {
  playTone,
  playCountdownTick,
  playPhaseTransitionTone,
  playWorkoutCompleteFanfare,
} from '@/utils/audioEffects';

interface ExerciseTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogWorkout: (
    exerciseType: string,
    durationMin: number,
    caloriesBurned: number,
    intensity: string,
    xpReward: number
  ) => void;
  initialMode?: ExerciseTimerMode;
  initialMinutes?: number;
  initialWorkoutTitle?: string;
}

type IntervalPhase = 'idle' | 'prep' | 'work' | 'rest' | 'complete';

export function ExerciseTimerModal({
  isOpen,
  onClose,
  onLogWorkout,
  initialMode = 'stopwatch',
  initialMinutes = 10,
  initialWorkoutTitle = 'Shadow Training',
}: ExerciseTimerModalProps) {
  const [mode, setMode] = useState<ExerciseTimerMode>(initialMode);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // --- Stopwatch State ---
  const [swTimeMs, setSwTimeMs] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  // --- Countdown State ---
  const [cdDurationSec, setCdDurationSec] = useState(initialMinutes * 60);
  const [cdRemainingSec, setCdRemainingSec] = useState(initialMinutes * 60);
  const [cdRunning, setCdRunning] = useState(false);

  // --- Interval State ---
  const [workSec, setWorkSec] = useState(45);
  const [restSec, setRestSec] = useState(15);
  const [totalSets, setTotalSets] = useState(8);
  const [currentSet, setCurrentSet] = useState(1);
  const [intervalPhase, setIntervalPhase] = useState<IntervalPhase>('idle');
  const [intervalPhaseSec, setIntervalPhaseSec] = useState(5); // prep duration
  const [intervalRunning, setIntervalRunning] = useState(false);
  const [totalIntervalElapsedSec, setTotalIntervalElapsedSec] = useState(0);

  // --- Completion Overlay State ---
  const [showSummary, setShowSummary] = useState(false);
  const [summaryDurationMin, setSummaryDurationMin] = useState(1);
  const [exerciseType, setExerciseType] = useState('HIIT');
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high' | 'extreme'>('high');
  const [workoutTitle, setWorkoutTitle] = useState(initialWorkoutTitle);

  // Refs for timers
  const swRafRef = useRef<number | null>(null);
  const swLastTimeRef = useRef<number>(0);
  const cdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const intIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update initial parameters if reopened with a specific suggestion
  useEffect(() => {
    if (isOpen) {
      if (initialMode) setMode(initialMode);
      if (initialMinutes > 0) {
        setCdDurationSec(initialMinutes * 60);
        setCdRemainingSec(initialMinutes * 60);
      }
      if (initialWorkoutTitle) setWorkoutTitle(initialWorkoutTitle);
    }
  }, [isOpen, initialMode, initialMinutes, initialWorkoutTitle]);

  // --- Stopwatch Engine ---
  useEffect(() => {
    if (swRunning) {
      swLastTimeRef.current = performance.now();
      const tick = (now: number) => {
        const delta = now - swLastTimeRef.current;
        swLastTimeRef.current = now;
        setSwTimeMs((prev) => prev + delta);
        swRafRef.current = requestAnimationFrame(tick);
      };
      swRafRef.current = requestAnimationFrame(tick);
    } else if (swRafRef.current) {
      cancelAnimationFrame(swRafRef.current);
      swRafRef.current = null;
    }
    return () => {
      if (swRafRef.current) cancelAnimationFrame(swRafRef.current);
    };
  }, [swRunning]);

  const handleSwLap = () => {
    setLaps((prev) => [swTimeMs, ...prev]);
    if (soundEnabled) playTone(587.33, 0.08, 'sine', 0.08);
  };

  const handleSwReset = () => {
    setSwRunning(false);
    setSwTimeMs(0);
    setLaps([]);
  };

  // --- Countdown Engine ---
  useEffect(() => {
    if (cdRunning) {
      cdIntervalRef.current = setInterval(() => {
        setCdRemainingSec((prev) => {
          if (prev <= 1) {
            clearInterval(cdIntervalRef.current!);
            setCdRunning(false);
            if (soundEnabled) playWorkoutCompleteFanfare();
            openSummary(Math.max(1, Math.round(cdDurationSec / 60)));
            return 0;
          }
          if (prev <= 4 && soundEnabled) {
            playCountdownTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else if (cdIntervalRef.current) {
      clearInterval(cdIntervalRef.current);
    }
    return () => {
      if (cdIntervalRef.current) clearInterval(cdIntervalRef.current);
    };
  }, [cdRunning, cdDurationSec, soundEnabled]);

  const handleCdReset = () => {
    setCdRunning(false);
    setCdRemainingSec(cdDurationSec);
  };

  const handleSelectCdPreset = (mins: number) => {
    setCdRunning(false);
    setCdDurationSec(mins * 60);
    setCdRemainingSec(mins * 60);
  };

  // --- Interval Engine ---
  const handleNextIntervalPhase = useCallback(
    (currentP: IntervalPhase, setNum: number) => {
      if (currentP === 'prep') {
        setIntervalPhase('work');
        setIntervalPhaseSec(workSec);
        if (soundEnabled) playPhaseTransitionTone(true);
      } else if (currentP === 'work') {
        if (setNum >= totalSets) {
          // Completed all sets
          setIntervalPhase('complete');
          setIntervalRunning(false);
          if (soundEnabled) playWorkoutCompleteFanfare();
          openSummary(Math.max(1, Math.round(totalIntervalElapsedSec / 60)));
        } else {
          setIntervalPhase('rest');
          setIntervalPhaseSec(restSec);
          if (soundEnabled) playPhaseTransitionTone(false);
        }
      } else if (currentP === 'rest') {
        setCurrentSet((prev) => prev + 1);
        setIntervalPhase('work');
        setIntervalPhaseSec(workSec);
        if (soundEnabled) playPhaseTransitionTone(true);
      }
    },
    [workSec, restSec, totalSets, totalIntervalElapsedSec, soundEnabled]
  );

  useEffect(() => {
    if (intervalRunning) {
      intIntervalRef.current = setInterval(() => {
        setTotalIntervalElapsedSec((prev) => prev + 1);
        setIntervalPhaseSec((prev) => {
          if (prev <= 1) {
            handleNextIntervalPhase(intervalPhase, currentSet);
            return 0;
          }
          if (prev <= 4 && soundEnabled) {
            playCountdownTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intIntervalRef.current) {
      clearInterval(intIntervalRef.current);
    }
    return () => {
      if (intIntervalRef.current) clearInterval(intIntervalRef.current);
    };
  }, [intervalRunning, intervalPhase, currentSet, handleNextIntervalPhase, soundEnabled]);

  const startInterval = () => {
    if (intervalPhase === 'idle' || intervalPhase === 'complete') {
      setCurrentSet(1);
      setIntervalPhase('prep');
      setIntervalPhaseSec(5);
      setTotalIntervalElapsedSec(0);
    }
    setIntervalRunning(true);
    if (soundEnabled) playTone(440, 0.1, 'sine', 0.1);
  };

  const handleIntervalReset = () => {
    setIntervalRunning(false);
    setIntervalPhase('idle');
    setIntervalPhaseSec(5);
    setCurrentSet(1);
    setTotalIntervalElapsedSec(0);
  };

  // --- Completion & XP Awarding ---
  const openSummary = (minutesElapsed: number) => {
    setSummaryDurationMin(Math.max(1, minutesElapsed));
    setShowSummary(true);
  };

  const handleFinishCurrentWorkout = () => {
    let activeMinutes = 1;
    if (mode === 'stopwatch') {
      activeMinutes = Math.max(1, Math.round(swTimeMs / 60000));
      setSwRunning(false);
    } else if (mode === 'countdown') {
      activeMinutes = Math.max(1, Math.round((cdDurationSec - cdRemainingSec) / 60));
      setCdRunning(false);
    } else if (mode === 'interval') {
      activeMinutes = Math.max(1, Math.round(totalIntervalElapsedSec / 60));
      setIntervalRunning(false);
    }
    openSummary(activeMinutes);
  };

  const calculateCalories = (mins: number, inten: string) => {
    const rate =
      inten === 'low' ? 4.5 : inten === 'moderate' ? 7.5 : inten === 'high' ? 10.5 : 13.5;
    return Math.round(mins * rate);
  };

  const calculateXP = (mins: number, inten: string) => {
    const mult = inten === 'low' ? 3 : inten === 'moderate' ? 5 : inten === 'high' ? 7 : 9;
    return Math.round(20 + mins * mult);
  };

  const handleCommitWorkout = () => {
    const calories = calculateCalories(summaryDurationMin, intensity);
    const xp = calculateXP(summaryDurationMin, intensity);
    onLogWorkout(exerciseType, summaryDurationMin, calories, intensity, xp);
    setShowSummary(false);
    onClose();
  };

  if (!isOpen) return null;

  // Format stopwatch
  const swMinutes = Math.floor(swTimeMs / 60000);
  const swSeconds = Math.floor((swTimeMs % 60000) / 1000);
  const swCentis = Math.floor((swTimeMs % 1000) / 10);
  const formatSw = `${String(swMinutes).padStart(2, '0')}:${String(swSeconds).padStart(2, '0')}.${String(swCentis).padStart(2, '0')}`;

  // Format countdown
  const cdMins = Math.floor(cdRemainingSec / 60);
  const cdSecs = cdRemainingSec % 60;
  const formatCd = `${String(cdMins).padStart(2, '0')}:${String(cdSecs).padStart(2, '0')}`;
  const cdProgressPercent =
    cdDurationSec > 0 ? Math.min(100, Math.max(0, (cdRemainingSec / cdDurationSec) * 100)) : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-strong border border-white/10 rounded-3xl w-full max-w-md p-5 relative overflow-hidden shadow-2xl animate-scale-in max-h-[92vh] flex flex-col">
        {/* Glow ambient */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-primary-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-secondary-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-300">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm tracking-wider uppercase text-slate-100 flex items-center gap-1.5">
                <span>Shadow Exercise Timer</span>
                <Sparkles className="w-3.5 h-3.5 text-secondary-400" />
              </h2>
              <p className="text-[10px] font-mono text-slate-400">Combat pacing & stamina tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
              title={soundEnabled ? 'Mute chimes' : 'Enable audio chimes'}
              aria-label="Toggle sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-primary-300" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              aria-label="Close timer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-base-950/80 border border-white/5 my-3 shrink-0">
          {(
            [
              { id: 'stopwatch', label: 'Stopwatch', icon: Timer },
              { id: 'countdown', label: 'Countdown', icon: Activity },
              { id: 'interval', label: 'Intervals', icon: Zap },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = mode === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setMode(t.id)}
                className={`py-2 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  active
                    ? 'gradient-mixed text-white font-bold shadow-lg shadow-primary-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mode Body Viewport */}
        <div className="flex-1 overflow-y-auto py-2 space-y-4">
          {/* ================= MODE 1: STOPWATCH ================= */}
          {mode === 'stopwatch' && (
            <div className="flex flex-col items-center justify-center py-4 space-y-5 animate-fade-in">
              <div className="relative flex flex-col items-center justify-center w-52 h-52 rounded-full border-2 border-primary-500/30 bg-base-950/60 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                <span className="text-[10px] font-mono tracking-[0.25em] text-slate-500 uppercase">
                  Active Duration
                </span>
                <span className="font-mono font-bold text-4xl text-slate-100 tracking-tight my-1 text-glow-primary">
                  {formatSw}
                </span>
                <span className="text-[10px] font-mono text-primary-400">
                  {swRunning ? 'RECORDING COMBAT' : swTimeMs > 0 ? 'PAUSED' : 'READY'}
                </span>
              </div>

              {/* Stopwatch Controls */}
              <div className="flex items-center gap-3 w-full max-w-xs">
                <button
                  type="button"
                  onClick={handleSwReset}
                  className="flex-1 glass py-3 rounded-2xl font-mono text-xs uppercase tracking-wider text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  title="Reset Stopwatch"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSwRunning(!swRunning)}
                  className={`flex-1 py-3 rounded-2xl font-mono text-xs uppercase tracking-wider font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-95 ${
                    swRunning ? 'bg-rose-500/80 hover:bg-rose-600' : 'gradient-mixed glow-primary'
                  }`}
                >
                  {swRunning ? (
                    <>
                      <Pause className="w-4 h-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 ml-0.5" /> Start
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSwLap}
                  disabled={!swRunning}
                  className="flex-1 glass py-3 rounded-2xl font-mono text-xs uppercase tracking-wider text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-30"
                  title="Flag Lap"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Lap</span>
                </button>
              </div>

              {/* Laps List */}
              {laps.length > 0 && (
                <div className="w-full max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs font-mono border-t border-white/5 pt-3">
                  <div className="flex justify-between text-slate-500 text-[10px] uppercase tracking-wider px-2">
                    <span>Split</span>
                    <span>Lap Time</span>
                  </div>
                  {laps.map((lapMs, index) => {
                    const lM = Math.floor(lapMs / 60000);
                    const lS = Math.floor((lapMs % 60000) / 1000);
                    const lC = Math.floor((lapMs % 1000) / 10);
                    return (
                      <div
                        key={lapMs}
                        className="glass px-3 py-1.5 rounded-xl flex justify-between text-slate-300"
                      >
                        <span className="text-primary-400">Lap {laps.length - index}</span>
                        <span>{`${String(lM).padStart(2, '0')}:${String(lS).padStart(2, '0')}.${String(lC).padStart(2, '0')}`}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= MODE 2: COUNTDOWN ================= */}
          {mode === 'countdown' && (
            <div className="flex flex-col items-center justify-center py-3 space-y-5 animate-fade-in">
              {/* Circular Countdown Display */}
              <div className="relative w-52 h-52 flex items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" width={208} height={208}>
                  <circle
                    cx={104}
                    cy={104}
                    r={92}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={8}
                  />
                  <circle
                    cx={104}
                    cy={104}
                    r={92}
                    fill="none"
                    stroke={cdRemainingSec <= 5 ? '#f87171' : '#a855f7'}
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 92}
                    strokeDashoffset={2 * Math.PI * 92 - (cdProgressPercent / 100) * 2 * Math.PI * 92}
                    style={{
                      transition: 'stroke-dashoffset 0.8s ease-out',
                      filter: `drop-shadow(0 0 8px ${cdRemainingSec <= 5 ? 'rgba(248,113,113,0.5)' : 'rgba(168,85,247,0.5)'})`,
                    }}
                  />
                </svg>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-slate-500 uppercase">
                    Remaining
                  </span>
                  <span className="font-mono font-bold text-4xl text-slate-100 tracking-tight my-1">
                    {formatCd}
                  </span>
                  <span className="text-[10px] font-mono text-purple-400">
                    {cdRunning ? 'COUNTING DOWN' : cdRemainingSec === 0 ? 'COMPLETE!' : 'STANDBY'}
                  </span>
                </div>
              </div>

              {/* Presets Bar */}
              <div className="w-full">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 text-center">
                  Combat Duration Presets
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 3, 5, 10, 15, 20, 30, 45].map((mins) => {
                    const isSelected = cdDurationSec === mins * 60;
                    return (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => handleSelectCdPreset(mins)}
                        className={`py-1.5 rounded-xl text-xs font-mono transition-all border ${
                          isSelected
                            ? 'gradient-mixed text-white font-bold border-transparent shadow-md'
                            : 'glass text-slate-400 border-white/5 hover:text-white'
                        }`}
                      >
                        {mins}m
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Countdown Controls */}
              <div className="flex items-center gap-3 w-full max-w-xs">
                <button
                  type="button"
                  onClick={handleCdReset}
                  className="flex-1 glass py-3 rounded-2xl font-mono text-xs uppercase tracking-wider text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCdRunning(!cdRunning)}
                  className={`flex-1 py-3 rounded-2xl font-mono text-xs uppercase tracking-wider font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-95 ${
                    cdRunning ? 'bg-rose-500/80 hover:bg-rose-600' : 'gradient-mixed glow-primary'
                  }`}
                >
                  {cdRunning ? (
                    <>
                      <Pause className="w-4 h-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 ml-0.5" /> Start
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ================= MODE 3: INTERVAL (HIIT) ================= */}
          {mode === 'interval' && (
            <div className="flex flex-col items-center justify-center py-2 space-y-4 animate-fade-in">
              {/* Dynamic Phase Stage Card */}
              <div
                className={`w-full rounded-3xl p-5 border text-center relative overflow-hidden transition-all duration-500 ${
                  intervalPhase === 'work'
                    ? 'bg-rose-950/40 border-rose-500/50 shadow-[0_0_35px_rgba(244,63,94,0.25)]'
                    : intervalPhase === 'rest'
                      ? 'bg-blue-950/40 border-blue-500/50 shadow-[0_0_35px_rgba(59,130,246,0.25)]'
                      : intervalPhase === 'prep'
                        ? 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                        : 'glass border-white/10'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider mb-2">
                  <span
                    className={`font-bold ${
                      intervalPhase === 'work'
                        ? 'text-rose-400'
                        : intervalPhase === 'rest'
                          ? 'text-blue-400'
                          : 'text-amber-400'
                    }`}
                  >
                    {intervalPhase === 'work'
                      ? 'Combat Sprint (Work)'
                      : intervalPhase === 'rest'
                        ? 'Mana Recharge (Rest)'
                        : intervalPhase === 'prep'
                          ? 'Get Ready'
                          : 'Interval Protocol'}
                  </span>
                  <span className="text-slate-400">
                    Round {currentSet} / {totalSets}
                  </span>
                </div>

                <div className="my-3">
                  <span className="font-mono font-black text-6xl tracking-tight text-white drop-shadow-md">
                    {intervalPhaseSec}
                  </span>
                  <span className="text-sm font-mono text-slate-400 ml-1">sec</span>
                </div>

                <p className="text-[11px] font-mono text-slate-300">
                  {intervalPhase === 'work'
                    ? 'Push maximum intensity! Slay the directive!'
                    : intervalPhase === 'rest'
                      ? 'Breathe deeply. Recover stamina for the next assault.'
                      : 'Prepare form and stance.'}
                </p>
              </div>

              {/* Interval Calibration Settings (Work / Rest / Sets) */}
              <div className="grid grid-cols-3 gap-2 w-full text-center">
                {/* Work duration */}
                <div className="glass rounded-2xl p-2.5 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Work</span>
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      disabled={intervalRunning}
                      onClick={() => setWorkSec(Math.max(10, workSec - 5))}
                      className="w-5 h-5 rounded glass flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold text-sm text-slate-100">{workSec}s</span>
                    <button
                      type="button"
                      disabled={intervalRunning}
                      onClick={() => setWorkSec(workSec + 5)}
                      className="w-5 h-5 rounded glass flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Rest duration */}
                <div className="glass rounded-2xl p-2.5 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Rest</span>
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      disabled={intervalRunning}
                      onClick={() => setRestSec(Math.max(5, restSec - 5))}
                      className="w-5 h-5 rounded glass flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold text-sm text-slate-100">{restSec}s</span>
                    <button
                      type="button"
                      disabled={intervalRunning}
                      onClick={() => setRestSec(restSec + 5)}
                      className="w-5 h-5 rounded glass flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Total Sets */}
                <div className="glass rounded-2xl p-2.5 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Rounds</span>
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      disabled={intervalRunning}
                      onClick={() => setTotalSets(Math.max(2, totalSets - 1))}
                      className="w-5 h-5 rounded glass flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold text-sm text-slate-100">{totalSets}</span>
                    <button
                      type="button"
                      disabled={intervalRunning}
                      onClick={() => setTotalSets(totalSets + 1)}
                      className="w-5 h-5 rounded glass flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Interval Controls */}
              <div className="flex items-center gap-3 w-full max-w-xs">
                <button
                  type="button"
                  onClick={handleIntervalReset}
                  className="flex-1 glass py-3 rounded-2xl font-mono text-xs uppercase tracking-wider text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (intervalRunning) {
                      setIntervalRunning(false);
                    } else {
                      startInterval();
                    }
                  }}
                  className={`flex-1 py-3 rounded-2xl font-mono text-xs uppercase tracking-wider font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-95 ${
                    intervalRunning ? 'bg-rose-500/80 hover:bg-rose-600' : 'gradient-mixed glow-primary'
                  }`}
                >
                  {intervalRunning ? (
                    <>
                      <Pause className="w-4 h-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 ml-0.5" /> Start
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Finish & Log Workout Trigger */}
        <div className="pt-3 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={handleFinishCurrentWorkout}
            className="w-full py-3.5 rounded-2xl gradient-mixed glow-primary font-display font-bold text-xs uppercase tracking-wider text-white flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <Flame className="w-4 h-4 text-warning-300" />
            <span>Finish Workout & Claim XP</span>
          </button>
        </div>

        {/* ================= WORKOUT COMPLETION OVERLAY ================= */}
        {showSummary && (
          <div className="absolute inset-0 z-20 glass-strong bg-base-950/95 backdrop-blur-xl p-5 flex flex-col justify-between animate-scale-in">
            <div className="text-center space-y-2 pt-2">
              <div className="w-12 h-12 rounded-2xl gradient-mixed glow-primary flex items-center justify-center mx-auto mb-2 text-white">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-secondary-400 font-bold">
                Combat Directive Fulfilled
              </span>
              <h3 className="text-xl font-display font-bold text-slate-100 uppercase tracking-wider">
                Workout Complete
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Log your exertion to boost Hunter Rank & Vitality
              </p>
            </div>

            {/* Metrics Showcase Card */}
            <div className="grid grid-cols-3 gap-2 my-2 text-center">
              <div className="glass rounded-2xl p-3 border border-white/5">
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Duration</span>
                <span className="text-lg font-display font-bold text-slate-100">
                  {summaryDurationMin}m
                </span>
              </div>
              <div className="glass rounded-2xl p-3 border border-white/5">
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Calories</span>
                <span className="text-lg font-display font-bold text-warning-400">
                  {calculateCalories(summaryDurationMin, intensity)}
                </span>
              </div>
              <div className="glass rounded-2xl p-3 border border-white/5">
                <span className="text-[9px] font-mono uppercase text-slate-500 block">XP Reward</span>
                <span className="text-lg font-display font-bold text-primary-300">
                  +{calculateXP(summaryDurationMin, intensity)}
                </span>
              </div>
            </div>

            {/* Workout Configuration */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Exercise Name
                </label>
                <input
                  type="text"
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  className="w-full glass px-3.5 py-2.5 rounded-xl text-xs font-mono text-slate-200 border border-white/10 focus:border-primary-400 focus:outline-none"
                  placeholder="Workout Name"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Discipline Category
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['HIIT', 'Strength', 'Cardio', 'Mobility', 'Core', 'Yoga'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setExerciseType(cat)}
                      className={`py-1.5 rounded-xl text-xs font-mono transition-all border ${
                        exerciseType === cat
                          ? 'gradient-mixed text-white font-bold border-transparent shadow-md'
                          : 'glass text-slate-400 border-white/5 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Intensity Rating
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['low', 'moderate', 'high', 'extreme'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setIntensity(lvl)}
                      className={`py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-wider transition-all border ${
                        intensity === lvl
                          ? 'bg-primary-500/20 text-primary-300 font-bold border-primary-500/40 shadow-sm'
                          : 'glass text-slate-400 border-white/5 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 space-y-2">
              <button
                type="button"
                onClick={handleCommitWorkout}
                className="w-full py-3.5 rounded-2xl gradient-mixed glow-primary font-display font-bold text-xs uppercase tracking-wider text-white flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Archive Workout & Claim +{calculateXP(summaryDurationMin, intensity)} XP</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSummary(false)}
                className="w-full py-2.5 rounded-xl glass text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
              >
                Back to Timer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
