import React, { useState } from 'react';
import {
  Flame,
  User,
  Calendar,
  Ruler,
  Scale,
  Target,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import type { Store } from '@/store';
import { HUNTER_AVATARS } from '@/data/hunterAvatars';
import { RankBadge } from '@/components/RankBadge';

interface HunterRegistrationScreenProps {
  store: Store;
  onComplete: () => void;
}

export function HunterRegistrationScreen({ store, onComplete }: HunterRegistrationScreenProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('24');
  const [heightCm, setHeightCm] = useState<string>('178');
  const [weightKg, setWeightKg] = useState<string>('72.5');
  const [goalWeightKg, setGoalWeightKg] = useState<string>('75.0');
  const [selectedAvatar, setSelectedAvatar] = useState(HUNTER_AVATARS[0].avatarSvg);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live BMI calculation
  const parsedHeight = parseFloat(heightCm) || 0;
  const parsedWeight = parseFloat(weightKg) || 0;
  const parsedGoalWeight = parseFloat(goalWeightKg) || 0;
  const parsedAge = parseInt(age, 10) || 0;

  const heightM = parsedHeight / 100;
  const calculatedBMI =
    heightM > 0 && parsedWeight > 0 ? (parsedWeight / (heightM * heightM)).toFixed(1) : null;

  const deltaKg =
    parsedWeight > 0 && parsedGoalWeight > 0
      ? Math.round((parsedGoalWeight - parsedWeight) * 10) / 10
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Hunter name or codename is required.');
      return;
    }

    if (!parsedAge || parsedAge < 10 || parsedAge > 120) {
      setError('Please provide a valid age between 10 and 120.');
      return;
    }

    if (!parsedHeight || parsedHeight < 100 || parsedHeight > 250) {
      setError('Please enter a valid height between 100cm and 250cm.');
      return;
    }

    if (!parsedWeight || parsedWeight < 30 || parsedWeight > 250) {
      setError('Please enter a valid weight between 30kg and 250kg.');
      return;
    }

    if (!parsedGoalWeight || parsedGoalWeight < 30 || parsedGoalWeight > 250) {
      setError('Please enter a valid goal weight between 30kg and 250kg.');
      return;
    }

    setIsSubmitting(true);

    try {
      store.registerHunter({
        name: trimmedName,
        age: parsedAge,
        heightCm: parsedHeight,
        weightKg: parsedWeight,
        goalWeightKg: parsedGoalWeight,
        gender,
        photo: selectedAvatar,
      });

      // Directly open dashboard
      onComplete();
    } catch (err) {
      console.error(err);
      setError('Failed to complete hunter registration. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pt-8 pb-16 flex flex-col justify-center animate-fade-in relative z-10">
      {/* System Notification Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass border border-primary-500/40 text-[10px] font-mono tracking-widest uppercase text-primary-300 mb-3 animate-pulse">
          <Sparkles className="w-3 h-3 text-secondary-400" />
          <span>[ SYSTEM: HUNTER AWAKENING DETECTED ]</span>
        </div>

        <div className="relative mb-3 group">
          <div className="absolute -inset-4 rounded-3xl bg-purple-600/35 blur-xl pointer-events-none animate-glow-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-purple-950/80 border border-purple-400/60 shadow-[0_0_25px_rgba(168,85,247,0.5)] p-1 flex items-center justify-center overflow-hidden">
            <img
              src="/shadowrise-gaming-logo.svg"
              alt="ShadowRise Gaming Logo"
              className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(192,132,252,0.9)]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>
        </div>

        <h1 className="font-display font-bold text-2xl tracking-wide gradient-text uppercase">
          Hunter Registration
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1 max-w-xs">
          Calibrate your physical biometrics to awaken as an initial E-Rank Hunter in the System.
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="glass-strong rounded-3xl p-6 border border-primary-500/30 shadow-2xl relative overflow-hidden">
        {/* Glow corner ambient */}
        <div
          className="absolute -top-20 -right-20 w-44 h-44 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }}
        />

        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-error-500/10 border border-error-500/30 flex items-center gap-2.5 text-xs text-error-300 font-mono animate-scale-in">
            <ShieldAlert className="w-4 h-4 text-error-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Archetype Selection */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
              Select Hunter Archetype
            </label>
            <div className="grid grid-cols-6 gap-2">
              {HUNTER_AVATARS.map((avatar) => {
                const isSelected = selectedAvatar === avatar.avatarSvg;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar.avatarSvg)}
                    className={`relative rounded-xl p-1 transition-all overflow-hidden ${
                      isSelected
                        ? 'border-2 border-primary-400 glow-primary scale-105 bg-primary-500/20'
                        : 'border border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                    }`}
                    title={avatar.name}
                  >
                    <img
                      src={avatar.avatarSvg}
                      alt={avatar.name}
                      className="w-full aspect-square rounded-lg object-cover"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-400 shadow-[0_0_6px_#a855f7]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1. Name */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 text-primary-400" />
              <span>Hunter Name / Codename *</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sung Jin-Woo"
              className="w-full glass rounded-xl px-3.5 py-2.5 text-slate-100 font-sans text-sm border border-white/10 focus:border-primary-400/60 focus:outline-none transition-all placeholder:text-slate-600"
              required
              autoFocus
            />
          </div>

          {/* 2. Age & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-warning-400" />
                <span>Age *</span>
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="24"
                min={10}
                max={120}
                className="w-full glass rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm border border-white/10 focus:border-primary-400/60 focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-1">
                <span>Gender Archetype</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                className="w-full glass rounded-xl px-3 py-2.5 text-slate-200 font-mono text-xs border border-white/10 focus:border-primary-400/60 focus:outline-none transition-all bg-base-950"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Hunter</option>
              </select>
            </div>
          </div>

          {/* 3. Height */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-primary-400" />
                <span>Height (cm) *</span>
              </label>
              {parsedHeight > 0 && (
                <span className="text-[10px] font-mono text-slate-500">
                  ≈ {(parsedHeight / 30.48).toFixed(1)} ft
                </span>
              )}
            </div>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="178"
              min={100}
              max={250}
              className="w-full glass rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm border border-white/10 focus:border-primary-400/60 focus:outline-none transition-all"
              required
            />
          </div>

          {/* 4. Current Weight & 5. Goal Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-1">
                <Scale className="w-3.5 h-3.5 text-secondary-400" />
                <span>Weight (kg) *</span>
              </label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="72.5"
                min={30}
                max={250}
                step={0.1}
                className="w-full glass rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm border border-white/10 focus:border-primary-400/60 focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-1">
                <Target className="w-3.5 h-3.5 text-accent-400" />
                <span>Goal Weight (kg) *</span>
              </label>
              <input
                type="number"
                value={goalWeightKg}
                onChange={(e) => setGoalWeightKg(e.target.value)}
                placeholder="75.0"
                min={30}
                max={250}
                step={0.1}
                className="w-full glass rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm border border-white/10 focus:border-primary-400/60 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Live System Biometrics Appraisal */}
          <div className="p-3.5 rounded-2xl bg-base-950/60 border border-primary-500/20 space-y-2 mt-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-primary-400" />
                Initial Rank Designation:
              </span>
              <span className="text-primary-300 font-bold flex items-center gap-1.5">
                <RankBadge rank="E" size="sm" />
                <span>E-Rank Hunter</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono border-t border-white/5 pt-1.5">
              <span className="text-slate-400">Estimated Biometric Index (BMI):</span>
              <span className="text-slate-200 font-bold">
                {calculatedBMI ? `${calculatedBMI} kg/m²` : 'Calibrating...'}
              </span>
            </div>

            {deltaKg !== null && (
              <div className="flex items-center justify-between text-[11px] font-mono border-t border-white/5 pt-1.5">
                <span className="text-slate-400">Target Trajectory:</span>
                <span
                  className={`font-bold ${
                    deltaKg > 0
                      ? 'text-primary-300'
                      : deltaKg < 0
                      ? 'text-secondary-300'
                      : 'text-success-400'
                  }`}
                >
                  {deltaKg > 0
                    ? `+${deltaKg} kg (Mass Hypertrophy)`
                    : deltaKg < 0
                    ? `${deltaKg} kg (Body Fat Reduction)`
                    : 'Maintenance Equilibrium'}
                </span>
              </div>
            )}
          </div>

          {/* Awaken Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 py-3.5 px-6 rounded-2xl gradient-mixed font-display font-bold text-sm tracking-wider uppercase text-white glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-xl cursor-pointer disabled:opacity-50"
          >
            <Flame className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            <span>{isSubmitting ? 'Calibrating System...' : 'Awaken As Hunter'}</span>
            <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>

      {/* Footer system note */}
      <p className="text-[11px] text-center font-mono text-slate-500 mt-5">
        Biometrics are stored permanently on this device and can be modified anytime in your Profile.
      </p>
    </div>
  );
}
