import { useState } from 'react';
import { Dumbbell, Droplets, Plus, X, Footprints, Bike, Brain, Flame, Waves, Timer, Bell, Layers, History } from 'lucide-react';
import type { ExerciseTimerMode } from '@/types';

interface QuickActionsProps {
  onAddWater: (amountMl: number) => void;
  onLogExercise: (type: string, durationMin: number, caloriesBurned: number, intensity: string) => void;
  onOpenTimer?: (mode?: ExerciseTimerMode, minutes?: number, title?: string) => void;
  onOpenWaterReminder?: () => void;
  onOpenCustomAlarms?: () => void;
  onOpenWorkoutLogger?: () => void;
  onOpenWorkoutHistory?: () => void;
}

const exerciseTypes = [
  { type: 'cardio', icon: Footprints, label: 'Cardio', color: '#f87171', defaultMin: 30, defaultCal: 250, intensity: 'moderate' },
  { type: 'strength', icon: Dumbbell, label: 'Strength', color: '#fbbf24', defaultMin: 45, defaultCal: 200, intensity: 'high' },
  { type: 'yoga', icon: Brain, label: 'Yoga', color: '#a78bfa', defaultMin: 30, defaultCal: 120, intensity: 'low' },
  { type: 'hiit', icon: Flame, label: 'HIIT', color: '#34d399', defaultMin: 20, defaultCal: 300, intensity: 'high' },
  { type: 'cycling', icon: Bike, label: 'Cycling', color: '#60a5fa', defaultMin: 40, defaultCal: 350, intensity: 'moderate' },
  { type: 'swimming', icon: Waves, label: 'Swimming', color: '#22d3ee', defaultMin: 30, defaultCal: 280, intensity: 'moderate' },
];

export function QuickActions({
  onAddWater,
  onLogExercise,
  onOpenTimer,
  onOpenWaterReminder,
  onOpenCustomAlarms,
  onOpenWorkoutLogger,
  onOpenWorkoutHistory,
}: QuickActionsProps) {
  const [showExercise, setShowExercise] = useState(false);

  return (
    <div className="space-y-3 animate-slide-up stagger-1">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-300">
          Quick Actions & Timers
        </h2>
        <div className="flex items-center gap-1.5">
          {onOpenWorkoutHistory && (
            <button
              type="button"
              onClick={onOpenWorkoutHistory}
              className="text-[10px] font-mono text-primary-300 hover:text-primary-200 flex items-center gap-1 glass px-2 py-0.5 rounded-full border border-primary-500/20 active:scale-95 transition-all"
            >
              <History className="w-2.5 h-2.5" />
              <span>Log History</span>
            </button>
          )}
          {onOpenCustomAlarms ? (
            <button
              type="button"
              onClick={onOpenCustomAlarms}
              className="text-[10px] font-mono text-amber-300 hover:text-amber-200 flex items-center gap-1 glass px-2 py-0.5 rounded-full border border-amber-500/20 active:scale-95 transition-all"
            >
              <Bell className="w-2.5 h-2.5" />
              <span>Custom Alarms</span>
            </button>
          ) : onOpenWaterReminder && (
            <button
              type="button"
              onClick={onOpenWaterReminder}
              className="text-[10px] font-mono text-blue-300 hover:text-blue-200 flex items-center gap-1 glass px-2 py-0.5 rounded-full border border-blue-500/20 active:scale-95 transition-all"
            >
              <Bell className="w-2.5 h-2.5" />
              <span>Water Alarms</span>
            </button>
          )}
        </div>
      </div>

      {/* Featured Exercise Timer Quick Launch */}
      {onOpenTimer && (
        <button
          type="button"
          onClick={() => onOpenTimer('stopwatch')}
          className="w-full glass-strong rounded-2xl p-3.5 flex items-center justify-between border border-primary-500/30 hover:border-primary-400/60 transition-all duration-300 active:scale-[0.99] group bg-gradient-to-r from-primary-950/40 via-base-900 to-base-900"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-mixed glow-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-100">Combat Exercise Timer</p>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase tracking-wider bg-primary-500/20 text-primary-300 border border-primary-500/30">
                  Live
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                Stopwatch · Countdown · HIIT Intervals · Earn XP
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-primary-300 group-hover:text-primary-200 flex items-center gap-1 font-bold">
            Start <Plus className="w-3.5 h-3.5" />
          </span>
        </button>
      )}

      {showExercise && (
        <div className="glass-strong rounded-2xl p-4 space-y-3 animate-scale-in border border-primary-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300">Choose Exercise Mode</span>
            <button
              onClick={() => setShowExercise(false)}
              className="w-7 h-7 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-error-400 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Enhanced Logger Prominent Shortcut */}
          {onOpenWorkoutLogger && (
            <button
              type="button"
              onClick={() => {
                setShowExercise(false);
                onOpenWorkoutLogger();
              }}
              className="w-full py-2.5 px-3 rounded-xl gradient-mixed text-white font-mono text-xs uppercase tracking-wider font-semibold glow-primary flex items-center justify-between active:scale-[0.98] transition-all"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-warning-300" />
                <span>Enhanced Sets & Reps Tracker</span>
              </span>
              <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded font-mono">Custom</span>
            </button>
          )}

          <div className="pt-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-2">
              Quick 1-Tap Logging
            </span>
            <div className="grid grid-cols-3 gap-2">
              {exerciseTypes.map((ex) => {
                const Icon = ex.icon;
                return (
                  <button
                    key={ex.type}
                    onClick={() => {
                      onLogExercise(ex.type, ex.defaultMin, ex.defaultCal, ex.intensity);
                      setShowExercise(false);
                    }}
                    className="glass rounded-xl p-3 flex flex-col items-center gap-1.5 hover:border-white/15 transition-all duration-300 active:scale-95"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${ex.color}15`, border: `1px solid ${ex.color}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: ex.color }} />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300">{ex.label}</span>
                    <span className="text-[9px] font-mono text-slate-500">{ex.defaultMin}m · {ex.defaultCal}cal</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            if (onOpenWorkoutLogger) {
              onOpenWorkoutLogger();
            } else {
              setShowExercise((v) => !v);
            }
          }}
          className="glass-strong rounded-2xl p-4 flex items-center gap-3 hover:border-primary-400/30 transition-all duration-300 active:scale-95 group"
        >
          <div className="w-11 h-11 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Dumbbell className="w-5 h-5 text-primary-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-200">Log Workout</p>
            <p className="text-[10px] font-mono text-slate-500">Sets, reps & load</p>
          </div>
          <Plus className="w-4 h-4 text-primary-400 ml-auto" />
        </button>

        <button
          onClick={() => onAddWater(250)}
          className="glass-strong rounded-2xl p-4 flex items-center gap-3 hover:border-secondary-400/30 transition-all duration-300 active:scale-95 group"
        >
          <div className="w-11 h-11 rounded-xl bg-secondary-500/15 border border-secondary-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Droplets className="w-5 h-5 text-secondary-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-200">Add Water</p>
            <p className="text-[10px] font-mono text-slate-500">+250ml quick add</p>
          </div>
          <Plus className="w-4 h-4 text-secondary-400 ml-auto" />
        </button>
      </div>
    </div>
  );
}
