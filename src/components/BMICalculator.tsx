import { useState } from 'react';
import { Activity, Target, Flame, Droplets, Info, ChevronDown, ChevronUp, Sparkles, Scale } from 'lucide-react';
import type { UserProfile } from '@/types';
import { calculateBMIAnalysis } from '@/utils/healthCalculations';

interface BMICalculatorProps {
  profile: UserProfile;
  onUpdateBiometrics?: (updates: { heightCm?: number; weightKg?: number; age?: number; goalWeightKg?: number }) => void;
  compact?: boolean;
}

export function BMICalculator({ profile, onUpdateBiometrics, compact = false }: BMICalculatorProps) {
  const [showDetails, setShowDetails] = useState(!compact);
  const [isQuickEditing, setIsQuickEditing] = useState(false);

  const [editHeight, setEditHeight] = useState(profile.heightCm ?? 175);
  const [editWeight, setEditWeight] = useState(profile.weightKg ?? 70);
  const [editAge, setEditAge] = useState(profile.age ?? 24);
  const [editGoal, setEditGoal] = useState(profile.goalWeightKg ?? 72);

  const analysis = calculateBMIAnalysis(
    profile.heightCm,
    profile.weightKg,
    profile.age,
    profile.goalWeightKg,
    profile.gender,
  );

  const handleSaveQuickEdit = () => {
    onUpdateBiometrics?.({
      heightCm: Number(editHeight),
      weightKg: Number(editWeight),
      age: Number(editAge),
      goalWeightKg: Number(editGoal),
    });
    setIsQuickEditing(false);
  };

  if (!analysis) {
    return (
      <div className="glass-strong rounded-2xl p-5 relative overflow-hidden border border-white/10 animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-400" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-200">
                BMI & Vitality Analysis
              </h3>
              <p className="text-[10px] font-mono text-slate-400">Configure height and weight to unlock appraisal</p>
            </div>
          </div>
          {onUpdateBiometrics && (
            <button
              onClick={() => setIsQuickEditing(!isQuickEditing)}
              className="px-3 py-1.5 rounded-lg gradient-mixed text-white text-xs font-mono uppercase tracking-wider glow-primary hover:scale-105 transition-all"
            >
              Setup Stats
            </button>
          )}
        </div>

        {isQuickEditing && onUpdateBiometrics && (
          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 animate-scale-in">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase">Height (cm)</label>
              <input
                type="number"
                value={editHeight}
                onChange={(e) => setEditHeight(Number(e.target.value))}
                min={100}
                max={250}
                className="w-full mt-1 glass rounded-xl px-3 py-2 text-sm text-white font-mono border border-white/10"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase">Weight (kg)</label>
              <input
                type="number"
                value={editWeight}
                onChange={(e) => setEditWeight(Number(e.target.value))}
                min={30}
                max={200}
                step={0.1}
                className="w-full mt-1 glass rounded-xl px-3 py-2 text-sm text-white font-mono border border-white/10"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase">Age</label>
              <input
                type="number"
                value={editAge}
                onChange={(e) => setEditAge(Number(e.target.value))}
                min={12}
                max={100}
                className="w-full mt-1 glass rounded-xl px-3 py-2 text-sm text-white font-mono border border-white/10"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase">Goal Weight (kg)</label>
              <input
                type="number"
                value={editGoal}
                onChange={(e) => setEditGoal(Number(e.target.value))}
                min={30}
                max={200}
                step={0.1}
                className="w-full mt-1 glass rounded-xl px-3 py-2 text-sm text-white font-mono border border-white/10"
              />
            </div>
            <div className="col-span-2 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsQuickEditing(false)}
                className="px-3 py-1.5 rounded-lg glass text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuickEdit}
                className="px-4 py-1.5 rounded-lg gradient-mixed text-xs font-mono uppercase tracking-wider text-white glow-primary"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const {
    bmi,
    categoryLabel,
    categoryColor,
    idealWeightMinKg,
    idealWeightMaxKg,
    deltaToGoalKg,
    bmrCalories,
    tdeeCalories,
    recommendedWaterMl,
    hunterStatusTitle,
    hunterStatusDescription,
  } = analysis;

  // Calculate position marker for BMI visual gauge (15 to 35 range clamped)
  const gaugePercent = Math.min(100, Math.max(0, ((bmi - 15) / (35 - 15)) * 100));

  return (
    <div className="glass-strong rounded-3xl p-5 relative overflow-hidden border border-white/10 animate-slide-up">
      {/* Subtle background glow */}
      <div
        className="absolute -top-16 -right-16 w-36 h-36 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ background: categoryColor }}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: `${categoryColor}20`,
              border: `1px solid ${categoryColor}50`,
              boxShadow: `0 0 12px ${categoryColor}30`,
            }}
          >
            <Activity className="w-4 h-4" style={{ color: categoryColor }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-200">
                BMI & Health Analysis
              </h3>
              <Sparkles className="w-3 h-3 text-primary-400 animate-pulse" />
            </div>
            <p className="text-[10px] font-mono text-slate-400">Hunter Vitality Evaluation</p>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-7 h-7 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Toggle details"
        >
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Primary BMI Display */}
      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-4xl font-display font-bold tracking-tight"
              style={{
                color: categoryColor,
                textShadow: `0 0 20px ${categoryColor}60`,
              }}
            >
              {bmi.toFixed(1)}
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">BMI</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
              style={{
                background: `${categoryColor}20`,
                color: categoryColor,
                border: `1px solid ${categoryColor}40`,
              }}
            >
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* Biometrics Summary */}
        <div className="text-right space-y-0.5">
          <div className="text-xs font-mono text-slate-300">
            <span className="text-slate-500">H:</span> {profile.heightCm} cm
            <span className="mx-1.5 text-slate-600">|</span>
            <span className="text-slate-500">W:</span> {profile.weightKg} kg
          </div>
          {profile.age && (
            <div className="text-[11px] font-mono text-slate-400">
              <span className="text-slate-500">Age:</span> {profile.age} yrs
            </div>
          )}
        </div>
      </div>

      {/* Visual BMI Gauge */}
      <div className="mt-4 space-y-1.5">
        <div className="relative h-2 rounded-full overflow-hidden flex bg-base-800 border border-white/5">
          <div className="w-[17.5%] bg-sky-500/70" title="Underweight (<18.5)" />
          <div className="w-[32%] bg-emerald-500/80" title="Normal (18.5 - 24.9)" />
          <div className="w-[25%] bg-amber-500/80" title="Overweight (25 - 29.9)" />
          <div className="w-[25.5%] bg-rose-500/80" title="Obese (30+)" />
        </div>

        {/* Pointer indicator */}
        <div className="relative h-3 w-full">
          <div
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-700 ease-out"
            style={{ left: `${gaugePercent}%` }}
          >
            <div
              className="w-2 h-2 rounded-full ring-2 ring-white"
              style={{ background: categoryColor, boxShadow: `0 0 8px ${categoryColor}` }}
            />
          </div>
        </div>

        <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase tracking-wider px-0.5">
          <span>&lt; 18.5 Lean</span>
          <span>18.5 - 24.9 Optimal</span>
          <span>25 - 29.9 Heavy</span>
          <span>30+ Overload</span>
        </div>
      </div>

      {/* Expandable Health & Vitality Details */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-white/8 space-y-3.5 animate-slide-up">
          {/* Hunter System Appraisal Box */}
          <div
            className="p-3.5 rounded-2xl relative overflow-hidden"
            style={{
              background: 'rgba(15, 12, 28, 0.65)',
              border: `1px solid ${categoryColor}35`,
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Info className="w-3.5 h-3.5" style={{ color: categoryColor }} />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-200">
                [{hunterStatusTitle}]
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{hunterStatusDescription}</p>
          </div>

          {/* Goal Weight & Target Delta */}
          <div className="glass rounded-2xl p-3.5 grid grid-cols-2 gap-2.5">
            <div>
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                <Target className="w-3 h-3 text-secondary-400" />
                <span>Ideal Weight Range</span>
              </div>
              <p className="text-sm font-display font-bold text-slate-200 mt-0.5">
                {idealWeightMinKg} - {idealWeightMaxKg} <span className="text-xs font-mono font-normal text-slate-400">kg</span>
              </p>
              <p className="text-[9px] font-mono text-slate-500 mt-0.5">Normal BMI window</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                <Scale className="w-3 h-3 text-warning-400" />
                <span>Goal Target</span>
              </div>
              {profile.goalWeightKg ? (
                <>
                  <p className="text-sm font-display font-bold text-slate-200 mt-0.5">
                    {profile.goalWeightKg} <span className="text-xs font-mono font-normal text-slate-400">kg</span>
                  </p>
                  <p className="text-[9px] font-mono text-slate-400 mt-0.5">
                    {deltaToGoalKg === null || deltaToGoalKg === 0 ? (
                      <span className="text-success-400">Goal reached!</span>
                    ) : deltaToGoalKg > 0 ? (
                      <span className="text-warning-400">-{deltaToGoalKg.toFixed(1)} kg to goal</span>
                    ) : (
                      <span className="text-secondary-400">+{Math.abs(deltaToGoalKg).toFixed(1)} kg to goal</span>
                    )}
                  </p>
                </>
              ) : (
                <p className="text-xs font-mono text-slate-500 mt-1">Not set in profile</p>
              )}
            </div>
          </div>

          {/* Metabolic & Hydration Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="glass rounded-xl p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 text-primary-400 mb-0.5">
                <Flame className="w-3.5 h-3.5" />
                <span className="text-[9px] font-mono uppercase">BMR</span>
              </div>
              <div className="text-xs font-display font-bold text-slate-200">{bmrCalories}</div>
              <div className="text-[8px] font-mono text-slate-500">kcal/day base</div>
            </div>

            <div className="glass rounded-xl p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 text-warning-400 mb-0.5">
                <Flame className="w-3.5 h-3.5" />
                <span className="text-[9px] font-mono uppercase">TDEE</span>
              </div>
              <div className="text-xs font-display font-bold text-slate-200">{tdeeCalories}</div>
              <div className="text-[8px] font-mono text-slate-500">kcal active burn</div>
            </div>

            <div className="glass rounded-xl p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 text-secondary-400 mb-0.5">
                <Droplets className="w-3.5 h-3.5" />
                <span className="text-[9px] font-mono uppercase">Hydration</span>
              </div>
              <div className="text-xs font-display font-bold text-slate-200">{(recommendedWaterMl / 1000).toFixed(1)}L</div>
              <div className="text-[8px] font-mono text-slate-500">target daily</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
