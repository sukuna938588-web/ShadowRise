import { useState } from 'react';
import {
  ShieldAlert,
  AlertCircle,
  Activity,
  Crosshair,
  Shield,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
} from 'lucide-react';
import type { UserProfile, HealthIssueKey, HealthSeverity } from '@/types';
import { HEALTH_ISSUES_CONFIG } from '@/data/healthIssuesData';

interface HealthIssuesTrackerProps {
  profile?: UserProfile | null;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  compact?: boolean;
}

export function HealthIssuesTracker({ profile, onUpdateProfile, compact = false }: HealthIssuesTrackerProps) {
  const [expandedIssue, setExpandedIssue] = useState<HealthIssueKey | null>(null);
  const [isSectionOpen, setIsSectionOpen] = useState(!compact);

  const activeIssues: HealthIssueKey[] = Array.isArray(profile?.healthIssues) ? profile.healthIssues : [];
  const issueDetails = profile?.healthIssueDetails || {};

  const toggleIssue = (key: HealthIssueKey) => {
    const isCurrentlyActive = activeIssues.includes(key);
    let newIssues: HealthIssueKey[];
    if (isCurrentlyActive) {
      newIssues = activeIssues.filter((k) => k !== key);
    } else {
      newIssues = [...activeIssues, key];
    }

    const newDetails = { ...issueDetails };
    if (!isCurrentlyActive && !newDetails[key]) {
      newDetails[key] = { severity: 'mild' };
    }

    onUpdateProfile({
      healthIssues: newIssues,
      healthIssueDetails: newDetails,
    });
  };

  const setSeverity = (key: HealthIssueKey, severity: HealthSeverity) => {
    const current = issueDetails[key] || { severity: 'mild' };
    const newDetails = {
      ...issueDetails,
      [key]: { ...current, severity },
    };
    onUpdateProfile({ healthIssueDetails: newDetails });
  };

  const getIssueIcon = (key: HealthIssueKey) => {
    switch (key) {
      case 'back_pain':
        return <ShieldAlert className="w-4 h-4" />;
      case 'neck_pain':
        return <AlertCircle className="w-4 h-4" />;
      case 'knee_pain':
        return <Activity className="w-4 h-4" />;
      case 'shoulder_pain':
        return <Crosshair className="w-4 h-4" />;
      case 'poor_posture':
        return <Shield className="w-4 h-4" />;
      default:
        return <ShieldAlert className="w-4 h-4" />;
    }
  };

  const getSeverityBadge = (severity: HealthSeverity) => {
    switch (severity) {
      case 'mild':
        return { text: 'Mild', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.35)' };
      case 'moderate':
        return { text: 'Moderate', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.35)' };
      case 'severe':
        return { text: 'Severe', color: '#f87171', bg: 'rgba(248, 113, 113, 0.2)', border: 'rgba(248, 113, 113, 0.45)' };
    }
  };

  const allKeys: HealthIssueKey[] = ['back_pain', 'neck_pain', 'knee_pain', 'shoulder_pain', 'poor_posture'];

  return (
    <div className="glass-strong rounded-3xl p-5 relative overflow-hidden border border-white/10 animate-slide-up">
      {/* Background glow when issues are active */}
      {activeIssues.length > 0 && (
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-200">
                Health Issues & Armor Status
              </h3>
              {activeIssues.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {activeIssues.length} Active
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Joint strain, spinal health, and posture tracking
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSectionOpen(!isSectionOpen)}
          className="w-7 h-7 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Toggle section"
        >
          {isSectionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {allKeys.map((key) => {
          const cfg = HEALTH_ISSUES_CONFIG[key];
          const isActive = activeIssues.includes(key);
          const details = issueDetails[key];
          const badge = details ? getSeverityBadge(details.severity) : null;

          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleIssue(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'border shadow-md'
                  : 'glass text-slate-400 hover:text-slate-200 border-white/5 opacity-70'
              }`}
              style={
                isActive
                  ? {
                      background: badge ? badge.bg : 'rgba(251, 191, 36, 0.15)',
                      borderColor: badge ? badge.border : 'rgba(251, 191, 36, 0.4)',
                      color: badge ? badge.color : '#fbbf24',
                    }
                  : undefined
              }
            >
              {getIssueIcon(key)}
              <span className="font-medium">{cfg.label}</span>
              {isActive && badge && (
                <span className="text-[9px] px-1 rounded uppercase tracking-wider bg-black/30 font-bold ml-0.5">
                  {badge.text}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded Details List */}
      {isSectionOpen && (
        <div className="mt-4 pt-3 border-t border-white/5 space-y-2.5 animate-slide-up">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Tap an issue to toggle status and calibrate relief protocols</span>
            {activeIssues.length === 0 && (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Full Combat Readiness
              </span>
            )}
          </div>

          <div className="space-y-2">
            {allKeys.map((key) => {
              const cfg = HEALTH_ISSUES_CONFIG[key];
              const isActive = activeIssues.includes(key);
              const details = issueDetails[key] || { severity: 'mild' };
              const badge = getSeverityBadge(details.severity);
              const isItemExpanded = expandedIssue === key;

              return (
                <div
                  key={key}
                  className={`rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-base-900/60 border-amber-500/30 shadow-lg'
                      : 'glass border-white/5 hover:border-white/10'
                  }`}
                >
                  {/* Top Bar of Each Issue */}
                  <div className="p-3.5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleIssue(key)}
                      className="flex items-center gap-3 text-left flex-1"
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                        style={{
                          background: isActive ? badge.bg : 'rgba(255, 255, 255, 0.04)',
                          color: isActive ? badge.color : '#64748b',
                          border: `1px solid ${isActive ? badge.border : 'rgba(255, 255, 255, 0.05)'}`,
                        }}
                      >
                        {getIssueIcon(key)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-display font-semibold ${isActive ? 'text-slate-100' : 'text-slate-400'}`}>
                            {cfg.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{cfg.bodyPart}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans line-clamp-1">{cfg.description}</p>
                      </div>
                    </button>

                    <div className="flex items-center gap-2 pl-2">
                      {isActive ? (
                        <button
                          type="button"
                          onClick={() => setExpandedIssue(isItemExpanded ? null : key)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider font-bold border flex items-center gap-1 transition-all"
                          style={{
                            background: badge.bg,
                            color: badge.color,
                            borderColor: badge.border,
                          }}
                        >
                          <span>{badge.text}</span>
                          {isItemExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleIssue(key)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:text-white glass"
                        >
                          + Log Issue
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Severity & Relief Insights */}
                  {isActive && isItemExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1 border-t border-white/5 space-y-3 animate-scale-in">
                      {/* Severity Switcher */}
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                          Pain / Strain Severity Level
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['mild', 'moderate', 'severe'] as const).map((sev) => {
                            const b = getSeverityBadge(sev);
                            const isSelected = details.severity === sev;
                            return (
                              <button
                                key={sev}
                                type="button"
                                onClick={() => setSeverity(key, sev)}
                                className={`py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border ${
                                  isSelected
                                    ? 'font-bold shadow-md'
                                    : 'glass text-slate-400 border-white/5 hover:text-white'
                                }`}
                                style={
                                  isSelected
                                    ? { background: b.bg, color: b.color, borderColor: b.border }
                                    : undefined
                                }
                              >
                                {b.text}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Hunter Relief Protocol */}
                      <div className="p-3 rounded-xl bg-base-950/70 border border-primary-500/20 text-xs">
                        <div className="flex items-center gap-1.5 text-primary-300 font-mono text-[10px] uppercase font-bold mb-1">
                          <Sparkles className="w-3 h-3 text-secondary-400" />
                          <span>Hunter Relief Protocol</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed font-sans">{cfg.reliefTip}</p>
                      </div>

                      {/* Avoid vs Prioritize Tags */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                        <div className="p-2 rounded-xl glass border-rose-500/20">
                          <span className="text-rose-400 uppercase font-bold block mb-1">Contraindicated</span>
                          <p className="text-slate-400 leading-tight">{cfg.exercisesToAvoid.join(', ')}</p>
                        </div>
                        <div className="p-2 rounded-xl glass border-emerald-500/20">
                          <span className="text-emerald-400 uppercase font-bold block mb-1">Prioritize</span>
                          <p className="text-slate-400 leading-tight">{cfg.exercisesToPrioritize.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick System Notice */}
          <div className="p-2.5 rounded-xl glass flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <Info className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
            <span>Active health issues automatically customize your recommended workout directives.</span>
          </div>
        </div>
      )}
    </div>
  );
}
