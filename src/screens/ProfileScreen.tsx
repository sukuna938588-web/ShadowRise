import { useState, useRef } from 'react';
import {
  User,
  Pencil,
  Check,
  X,
  Flame,
  Target,
  TrendingUp,
  Award,
  LogOut,
  Mail,
  Dumbbell,
  Droplets,
  Moon,
  HeartPulse,
  Camera,
  Sparkles,
  Scale,
  Ruler,
  Calendar,
  Layers,
  Bell,
} from 'lucide-react';
import type { Store } from '@/store';
import { RankBadge } from '@/components/RankBadge';
import { MetricRing } from '@/components/MetricRing';
import { BMICalculator } from '@/components/BMICalculator';
import { HealthIssuesTracker } from '@/components/HealthIssuesTracker';
import { WaterReminderSettingsModal } from '@/components/WaterReminderModal';
import { rankConfig } from '@/data/initialData';
import { HUNTER_AVATARS } from '@/data/hunterAvatars';
import { supabase } from '@/lib/supabase';

interface ProfileScreenProps {
  store: Store;
  onSignOut?: () => void;
}

export function ProfileScreen({ store, onSignOut }: ProfileScreenProps) {
  const { profile } = store;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isWaterSettingsOpen, setIsWaterSettingsOpen] = useState(false);

  // Form edit states
  const [name, setName] = useState(profile?.name ?? '');
  const [heightCm, setHeightCm] = useState(profile?.heightCm ?? 178);
  const [weightKg, setWeightKg] = useState(profile?.weightKg ?? 72.5);
  const [age, setAge] = useState(profile?.age ?? 24);
  const [goalWeightKg, setGoalWeightKg] = useState(profile?.goalWeightKg ?? 75.0);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(profile?.gender ?? 'male');

  if (!profile) return null;

  const rankInfo = rankConfig[profile.rank] ?? rankConfig.E;
  const totalXp = (profile.level - 1) * 500 + profile.xp;

  const startEditing = () => {
    setName(profile.name);
    setHeightCm(profile.heightCm ?? 178);
    setWeightKg(profile.weightKg ?? 72.5);
    setAge(profile.age ?? 24);
    setGoalWeightKg(profile.goalWeightKg ?? 75.0);
    setGender(profile.gender ?? 'male');
    setEditing(true);
  };

  const saveProfile = () => {
    if (name.trim()) {
      store.updateProfile({
        name: name.trim(),
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        age: Number(age),
        goalWeightKg: Number(goalWeightKg),
        gender,
      });
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    setName(profile.name);
    setEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress to max 320x320 for optimal performance in localStorage
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          store.updateProfile({ photo: dataUrl });
          setShowAvatarPicker(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetAvatar = (avatarSvg: string) => {
    store.updateProfile({ photo: avatarSvg });
    setShowAvatarPicker(false);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    onSignOut?.();
  };

  const deltaKg =
    profile.weightKg && profile.goalWeightKg
      ? Math.round((profile.weightKg - profile.goalWeightKg) * 10) / 10
      : null;

  return (
    <div className="px-4 pt-[env(safe-area-inset-top)] pb-28 space-y-5">
      {/* Header */}
      <div className="pt-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-5 h-5 text-primary-400" />
            <h1 className="font-display font-bold text-2xl gradient-text">Hunter Dossier</h1>
          </div>
          <button
            onClick={editing ? cancelEdit : startEditing}
            className="glass rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white hover:border-primary-400/40 transition-all"
          >
            {editing ? (
              <>
                <X className="w-3.5 h-3.5 text-error-400" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Pencil className="w-3.5 h-3.5 text-primary-400" />
                <span>Edit Profile</span>
              </>
            )}
          </button>
        </div>
        <p className="text-sm text-slate-400">Hunter identity, biometrics, and physical appraisal.</p>
      </div>

      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Profile Card */}
      <div className="glass-strong rounded-3xl p-6 relative overflow-hidden animate-slide-up">
        <div
          className="absolute -top-20 -left-20 w-48 h-48 rounded-full opacity-30 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${rankInfo.glow} 0%, transparent 70%)` }}
        />

        <div className="relative flex flex-col items-center text-center">
          <RankBadge rank={profile.rank} size="xl" />

          {/* Photo & Avatar container with Shadow Monarch Aura */}
          <div className="relative mt-4 group">
            {/* Shadow Monarch Aura Plume */}
            <div
              className="absolute -inset-4 rounded-3xl opacity-75 blur-xl pointer-events-none animate-shadow-flame"
              style={{
                background: `radial-gradient(ellipse at center, ${rankInfo.glow}90 0%, #1e1035 45%, transparent 75%)`,
              }}
            />
            <div
              className="absolute -inset-2 rounded-2xl opacity-80 blur-md pointer-events-none animate-pulse"
              style={{
                background: `radial-gradient(circle, ${rankInfo.glow}60 20%, #090314 60%, transparent 85%)`,
              }}
            />

            {profile.photo ? (
              <img
                src={profile.photo}
                alt={profile.name}
                className="relative z-10 w-24 h-24 rounded-2xl object-cover border-2 border-primary-400/60 glow-primary transition-all group-hover:brightness-110 shadow-2xl"
              />
            ) : (
              <div className="relative z-10 w-24 h-24 rounded-2xl gradient-mixed flex items-center justify-center border-2 border-primary-400/60 glow-primary shadow-2xl">
                <User className="w-10 h-10 text-white" />
              </div>
            )}

            {/* Photo upload trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 z-20 w-8 h-8 rounded-xl gradient-mixed border-2 border-base-900 flex items-center justify-center text-white glow-primary hover:scale-110 transition-transform shadow-lg"
              title="Upload photo"
              aria-label="Upload photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Avatar Presets Toggle */}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="text-[11px] font-mono text-primary-300 hover:text-primary-200 flex items-center gap-1 glass px-2.5 py-1 rounded-lg border border-primary-500/20 hover:border-primary-500/40 transition-all"
            >
              <Sparkles className="w-3 h-3 text-secondary-400" />
              <span>{showAvatarPicker ? 'Hide Avatars' : 'Choose Hunter Avatar'}</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 glass px-2.5 py-1 rounded-lg transition-all"
            >
              <Camera className="w-3 h-3 text-primary-400" />
              <span>Upload Photo</span>
            </button>
          </div>

          {/* Avatar Presets Drawer */}
          {showAvatarPicker && (
            <div className="mt-3 w-full p-3 glass rounded-2xl border border-primary-500/20 animate-scale-in">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                Select Hunter Archetype
              </p>
              <div className="grid grid-cols-6 gap-2">
                {HUNTER_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => handleSelectPresetAvatar(av.avatarSvg)}
                    className="p-1 rounded-xl glass hover:border-primary-400/60 transition-all flex flex-col items-center gap-1 hover:scale-105"
                    title={av.name}
                  >
                    <img src={av.avatarSvg} alt={av.name} className="w-9 h-9 rounded-lg object-cover" />
                    <span className="text-[8px] font-mono text-slate-400 truncate w-full">{av.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hunter Title & Status */}
          {editing ? (
            <div className="w-full mt-4 space-y-3 animate-fade-in text-left">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Hunter Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Hunter Name"
                  maxLength={30}
                  className="w-full mt-1 glass rounded-xl px-4 py-2 text-slate-100 font-mono text-sm border border-white/10 focus:border-primary-400/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    min={100}
                    max={250}
                    className="w-full mt-1 glass rounded-xl px-3 py-2 text-slate-100 font-mono text-sm border border-white/10"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    min={30}
                    max={250}
                    step={0.1}
                    className="w-full mt-1 glass rounded-xl px-3 py-2 text-slate-100 font-mono text-sm border border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    min={10}
                    max={120}
                    className="w-full mt-1 glass rounded-xl px-3 py-2 text-slate-100 font-mono text-sm border border-white/10"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Goal Weight (kg)</label>
                  <input
                    type="number"
                    value={goalWeightKg}
                    onChange={(e) => setGoalWeightKg(Number(e.target.value))}
                    min={30}
                    max={250}
                    step={0.1}
                    className="w-full mt-1 glass rounded-xl px-3 py-2 text-slate-100 font-mono text-sm border border-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Gender Archetype</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                        gender === g
                          ? 'gradient-mixed text-white glow-primary border border-primary-400/50'
                          : 'glass text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {g === 'other' ? 'Hunter' : g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 rounded-xl glass text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveProfile}
                  className="px-5 py-2 rounded-xl gradient-mixed text-xs font-mono uppercase tracking-wider text-white glow-primary flex items-center gap-1.5 hover:scale-105 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Dossier</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <h2 className="font-display font-bold text-2xl text-slate-100">{profile.name}</h2>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <Mail className="w-3 h-3 text-slate-500" />
                <p className="text-xs font-mono text-slate-500">{profile.email}</p>
              </div>
            </div>
          )}

          {/* Level & Rank Chips */}
          <div className="flex items-center gap-3 mt-4">
            <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Level</span>
              <span className="text-lg font-display font-bold gradient-text">{profile.level}</span>
            </div>
            <div
              className="rounded-xl px-4 py-2 flex items-center gap-2"
              style={{ background: rankInfo.color + '15', border: `1px solid ${rankInfo.color}40` }}
            >
              <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: rankInfo.color }}>
                Rank
              </span>
              <span className="text-lg font-display font-bold" style={{ color: rankInfo.color }}>
                {profile.rank}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Biometrics Summary Card (Height, Weight, Age, Goal Weight) */}
      <div className="glass rounded-3xl p-5 relative overflow-hidden border border-white/10 animate-slide-up stagger-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center">
              <Layers className="w-4 h-4 text-primary-400" />
            </div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-200">
              Hunter Biometrics
            </h3>
          </div>
          <button
            onClick={startEditing}
            className="text-[10px] font-mono uppercase tracking-wider text-primary-300 hover:text-primary-200 flex items-center gap-1"
          >
            <Pencil className="w-3 h-3" /> Edit Stats
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Height */}
          <div className="glass rounded-2xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
              <Ruler className="w-3.5 h-3.5 text-primary-400" />
              <span>Height</span>
            </div>
            <p className="text-base font-display font-bold text-slate-100 mt-1">
              {profile.heightCm ?? 178} <span className="text-xs font-mono font-normal text-slate-400">cm</span>
            </p>
          </div>

          {/* Current Weight */}
          <div className="glass rounded-2xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
              <Scale className="w-3.5 h-3.5 text-secondary-400" />
              <span>Weight</span>
            </div>
            <p className="text-base font-display font-bold text-slate-100 mt-1">
              {profile.weightKg ?? 72.5} <span className="text-xs font-mono font-normal text-slate-400">kg</span>
            </p>
          </div>

          {/* Age */}
          <div className="glass rounded-2xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
              <Calendar className="w-3.5 h-3.5 text-warning-400" />
              <span>Age</span>
            </div>
            <p className="text-base font-display font-bold text-slate-100 mt-1">
              {profile.age ?? 24} <span className="text-xs font-mono font-normal text-slate-400">yrs</span>
            </p>
          </div>

          {/* Goal Weight */}
          <div className="glass rounded-2xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
              <Target className="w-3.5 h-3.5 text-accent-400" />
              <span>Goal Target</span>
            </div>
            <p className="text-base font-display font-bold text-slate-100 mt-1">
              {profile.goalWeightKg ?? 75.0} <span className="text-xs font-mono font-normal text-slate-400">kg</span>
            </p>
            {deltaKg !== null && (
              <p className="text-[9px] font-mono text-slate-400 mt-0.5">
                {deltaKg === 0 ? (
                  <span className="text-success-400">Target hit</span>
                ) : deltaKg > 0 ? (
                  <span className="text-warning-400">-{deltaKg} kg</span>
                ) : (
                  <span className="text-secondary-400">+{Math.abs(deltaKg)} kg</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* BMI Calculator & Health Analysis Component */}
      <BMICalculator profile={profile} onUpdateBiometrics={store.updateProfile} />

      {/* Health Issues & Physical Strain Tracker */}
      <HealthIssuesTracker profile={profile} onUpdateProfile={store.updateProfile} />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 animate-slide-up stagger-2">
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning-500/15 border border-warning-500/30 flex items-center justify-center">
            <Flame className="w-5 h-5 text-warning-400" />
          </div>
          <div>
            <p className="text-xl font-display font-bold text-slate-100">{profile.streak}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Day Streak</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <p className="text-xl font-display font-bold text-slate-100">{profile.totalQuestsCompleted}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Quests Done</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary-500/15 border border-secondary-500/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-secondary-400" />
          </div>
          <div>
            <p className="text-xl font-display font-bold text-slate-100">{totalXp.toLocaleString()}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total XP</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-500/15 border border-accent-500/30 flex items-center justify-center">
            <Award className="w-5 h-5 text-accent-400" />
          </div>
          <div>
            <p className="text-xl font-display font-bold text-slate-100">{profile.level}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Level</p>
          </div>
        </div>
      </div>

      {/* Fitness Metrics */}
      <div className="glass rounded-2xl p-5 space-y-4 animate-slide-up stagger-2">
        <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-300">Fitness Metrics</h3>
        <div className="grid grid-cols-4 gap-2">
          <MetricRing
            icon={<Dumbbell className="w-4 h-4 text-primary-400" />}
            label="Exercise"
            value={profile.metrics.exerciseProgress}
            color="#a78bfa"
            glow="rgba(167,139,250,0.5)"
            delay={0}
          />
          <MetricRing
            icon={<Droplets className="w-4 h-4 text-secondary-400" />}
            label="Hydration"
            value={profile.metrics.hydration}
            color="#60a5fa"
            glow="rgba(96,165,250,0.5)"
            delay={80}
          />
          <MetricRing
            icon={<Moon className="w-4 h-4 text-primary-300" />}
            label="Sleep"
            value={profile.metrics.sleepQuality}
            color="#c4b5fd"
            glow="rgba(196,181,253,0.5)"
            delay={160}
          />
          <MetricRing
            icon={<HeartPulse className="w-4 h-4 text-success-400" />}
            label="Recovery"
            value={profile.metrics.recoveryScore}
            color="#34d399"
            glow="rgba(52,211,153,0.5)"
            delay={240}
          />
        </div>
      </div>

      {/* Rank Progression */}
      <div className="glass rounded-2xl p-5 space-y-3 animate-slide-up stagger-3">
        <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-300">Rank Progression</h3>
        <div className="flex items-center justify-between gap-1">
          {(Object.keys(rankConfig) as (keyof typeof rankConfig)[]).map((r) => {
            const config = rankConfig[r];
            const currentIdx = Object.keys(rankConfig).indexOf(profile.rank);
            const thisIdx = Object.keys(rankConfig).indexOf(r);
            const isUnlocked = thisIdx <= currentIdx;
            const isCurrent = r === profile.rank;
            return (
              <div key={r} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm transition-all duration-300 ${
                    isCurrent ? 'animate-badge-glow scale-110' : ''
                  }`}
                  style={{
                    background: isUnlocked ? config.color + '20' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isUnlocked ? config.color + '60' : 'rgba(255,255,255,0.05)'}`,
                    color: isUnlocked ? config.color : '#475569',
                  }}
                >
                  {r}
                </div>
                {isCurrent && (
                  <div className="w-1 h-1 rounded-full" style={{ background: config.color, boxShadow: `0 0 6px ${config.glow}` }} />
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 text-center mt-2">
          Reach Level {(Object.keys(rankConfig).indexOf(profile.rank) + 1) * 10} to advance to the next rank.
        </p>
      </div>

      {/* Water Reminder System Settings Card */}
      <div className="glass rounded-2xl p-5 space-y-3 animate-slide-up stagger-3 border border-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-200">
                Water Reminder System
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {store.waterReminder?.enabled
                  ? `Active · Every ${store.waterReminder.intervalMinutes} min (${store.waterReminder.startHour}:00 - ${store.waterReminder.endHour}:00)`
                  : 'Disabled'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsWaterSettingsOpen(true)}
            className="px-3 py-1.5 glass rounded-xl text-xs font-mono uppercase tracking-wider text-blue-300 hover:text-white hover:bg-blue-500/20 border border-blue-500/30 transition-all"
          >
            Configure
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full glass rounded-2xl py-3.5 flex items-center justify-center gap-2 text-sm font-mono uppercase tracking-wider text-slate-400 hover:text-error-400 hover:border-error-500/30 transition-all duration-300 animate-slide-up stagger-4"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>

      {/* Water Reminder Settings Modal */}
      <WaterReminderSettingsModal
        isOpen={isWaterSettingsOpen}
        onClose={() => setIsWaterSettingsOpen(false)}
        settings={store.waterReminder}
        onUpdateSettings={store.updateWaterReminder}
        onTriggerTestReminder={store.triggerWaterReminder}
      />
    </div>
  );
}
