import { useState } from 'react';
import {
  Shield,
  Zap,
  Sparkles,
  Lock,
  Play,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Target,
  ArrowUpRight,
  RotateCcw,
} from 'lucide-react';
import type { Rank, RankHistoryEntry } from '@/types';
import { RANK_TIMELINE_DEFINITIONS, RANK_ORDER } from '@/data/rankTimelineData';
import { rankConfig } from '@/data/initialData';
import { RankUpCinematicModal } from '@/components/RankUpCinematicModal';

interface RankHistoryTimelineProps {
  rankHistory: RankHistoryEntry[];
  currentRank: Rank;
  currentLevel: number;
  currentXp: number;
  xpToNext: number;
  totalQuestsCompleted: number;
  onPromoteTest?: (rank: Rank) => void;
  onRecalibrate?: () => void;
}

export function RankHistoryTimeline({
  rankHistory,
  currentRank,
  currentLevel,
  currentXp,
  xpToNext,
  totalQuestsCompleted,
  onPromoteTest,
  onRecalibrate,
}: RankHistoryTimelineProps) {
  const [selectedView, setSelectedView] = useState<'chronicle' | 'achieved' | 'privileges'>('chronicle');
  const [expandedRank, setExpandedRank] = useState<Rank | null>(currentRank);
  const [cinematicModalRank, setCinematicModalRank] = useState<Rank | null>(null);

  const currentRankIndex = RANK_ORDER.indexOf(currentRank);
  const nextRank = currentRankIndex < RANK_ORDER.length - 1 ? RANK_ORDER[currentRankIndex + 1] : null;
  const nextRankDef = nextRank ? RANK_TIMELINE_DEFINITIONS[nextRank] : null;

  // Levels needed to reach next rank
  const levelsNeeded = nextRankDef ? Math.max(0, nextRankDef.minLevel - currentLevel) : 0;
  const currentRankProgress = Math.round(
    Math.min(100, Math.max(0, (currentLevel % 10) * 10 + (currentXp / Math.max(1, xpToNext)) * 10))
  );

  const formatTimestamp = (isoDate?: string) => {
    if (!isoDate) return 'Awakening Inception';
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return isoDate;
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoDate;
    }
  };

  const formatRelativeTime = (isoDate?: string) => {
    if (!isoDate) return 'Day 1';
    try {
      const date = new Date(isoDate);
      const diffMs = Date.now() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    } catch {
      return '';
    }
  };

  // Find history entry for a given rank
  const getHistoryForRank = (r: Rank) => {
    return rankHistory.find((h) => h.rank === r);
  };

  // Filter ranks to display
  const displayedRanks =
    selectedView === 'achieved'
      ? RANK_ORDER.filter((r) => RANK_ORDER.indexOf(r) <= currentRankIndex)
      : RANK_ORDER;

  return (
    <div className="glass rounded-3xl p-5 md:p-6 border border-white/10 relative overflow-hidden animate-slide-up stagger-3">
      {/* Background ambient lighting */}
      <div
        className="absolute -top-24 -right-24 w-60 h-60 rounded-full opacity-20 pointer-events-none blur-3xl transition-all duration-700"
        style={{ background: rankConfig[currentRank]?.glow || 'rgba(167, 139, 250, 0.4)' }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base uppercase tracking-wider text-slate-100">
                  Rank History & Evolution
                </h3>
                <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-primary-950/80 border border-primary-500/40 text-primary-300">
                  Timeline
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Visual chronicle of awakenings, ascension trials, and hunter classifications.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-1.5 p-1 glass rounded-xl border border-white/5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedView('chronicle')}
            className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
              selectedView === 'chronicle'
                ? 'gradient-mixed text-white glow-primary font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chronicle
          </button>
          <button
            type="button"
            onClick={() => setSelectedView('achieved')}
            className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
              selectedView === 'achieved'
                ? 'gradient-mixed text-white glow-primary font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unlocked ({currentRankIndex + 1})
          </button>
          <button
            type="button"
            onClick={() => setSelectedView('privileges')}
            className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
              selectedView === 'privileges'
                ? 'gradient-mixed text-white glow-primary font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Privileges
          </button>
        </div>
      </div>

      {/* Overview Stat Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        {/* Current Standing */}
        <div className="glass rounded-2xl p-3.5 border border-white/5 flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-black text-xl shadow-lg"
            style={{
              background: rankConfig[currentRank].color + '25',
              border: `1px solid ${rankConfig[currentRank].color}70`,
              color: rankConfig[currentRank].color,
              boxShadow: `0 0 15px ${rankConfig[currentRank].glow}`,
            }}
          >
            {currentRank}
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Current Rank</div>
            <div className="text-sm font-display font-bold text-slate-100 truncate">
              {RANK_TIMELINE_DEFINITIONS[currentRank]?.title}
            </div>
            <div className="text-[11px] font-mono text-primary-300">
              Level {currentLevel} · {totalQuestsCompleted} Clears
            </div>
          </div>
        </div>

        {/* Mastered Progress */}
        <div className="glass rounded-2xl p-3.5 border border-white/5 flex flex-col justify-center">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-slate-400 uppercase tracking-wider">Rank Mastery</span>
            <span className="text-slate-200 font-bold">
              {currentRankIndex + 1} / {RANK_ORDER.length} Ranks
            </span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-white/5">
            <div
              className="h-full gradient-mixed rounded-full transition-all duration-700 glow-primary"
              style={{ width: `${((currentRankIndex + 1) / RANK_ORDER.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1.5">
            <span>E-Rank (Lv.1)</span>
            <span>S-Rank Monarch (Lv.50)</span>
          </div>
        </div>

        {/* Next Promotion Target */}
        <div className="glass rounded-2xl p-3.5 border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Target className="w-3 h-3 text-warning-400" />
              <span>Next Ascension</span>
            </div>
            {nextRankDef ? (
              <>
                <div className="text-sm font-display font-bold text-slate-200 mt-0.5">
                  {nextRankDef.title.split(' ')[0]}
                </div>
                <div className="text-[11px] font-mono text-warning-400">
                  {levelsNeeded > 0 ? `${levelsNeeded} levels to unlock (${currentRankProgress}%)` : 'Ready for promotion!'}
                </div>
                <div className="w-28 bg-slate-800/80 rounded-full h-1 mt-1 overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-warning-400 rounded-full transition-all duration-500"
                    style={{ width: `${currentRankProgress}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="text-xs font-display font-bold text-amber-400 mt-1">
                Apex Monarch Attained!
              </div>
            )}
          </div>
          {nextRank && onPromoteTest && (
            <button
              type="button"
              onClick={() => onPromoteTest(nextRank)}
              className="px-2.5 py-1.5 glass rounded-xl border border-warning-500/30 hover:border-warning-500/60 text-warning-300 hover:text-white text-[11px] font-mono uppercase tracking-wider flex items-center gap-1 transition-all"
              title="Test rank progression"
            >
              <span>Promote</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main View Mode Render */}
      {selectedView === 'privileges' ? (
        /* Matrix / Privileges comparison mode */
        <div className="space-y-3 pt-2">
          <p className="text-xs font-mono text-slate-400">
            System privileges and stat enhancements unlocked as your hunter rank ascends:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {RANK_ORDER.map((r, idx) => {
              const def = RANK_TIMELINE_DEFINITIONS[r];
              const isUnlocked = idx <= currentRankIndex;
              const isCurrent = r === currentRank;

              return (
                <div
                  key={r}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'glass-strong border-primary-400/60 shadow-lg'
                      : isUnlocked
                      ? 'glass border-white/10'
                      : 'bg-base-950/40 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-xs"
                        style={{
                          background: def.color + '20',
                          border: `1px solid ${def.color}60`,
                          color: def.color,
                        }}
                      >
                        {r}
                      </div>
                      <div>
                        <span className="font-display font-bold text-sm text-slate-200">{def.codename}</span>
                        <span className="text-[10px] font-mono text-slate-400 ml-2">Min. Lv.{def.minLevel}</span>
                      </div>
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-primary-300 px-2 py-0.5 rounded bg-primary-500/10 border border-primary-500/30">
                        Current
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-success-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-accent-300 mb-2">{def.statBonus}</div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {def.perks.map((p, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <span className="text-primary-400 mt-0.5">·</span>
                        <span className="font-mono text-[11px] text-slate-300">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Vertical Visual Timeline Chronicle */
        <div className="relative pl-6 md:pl-8 pt-3 pb-2 space-y-6">
          {/* Mana Conduit / Vertical Line */}
          <div className="absolute left-[17px] md:left-[21px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary-500 via-secondary-500 to-slate-800" />

          {displayedRanks.map((r) => {
            const def = RANK_TIMELINE_DEFINITIONS[r];
            const rankIndex = RANK_ORDER.indexOf(r);
            const isUnlocked = rankIndex <= currentRankIndex;
            const isCurrent = r === currentRank;
            const isNext = rankIndex === currentRankIndex + 1;
            const historyItem = getHistoryForRank(r);
            const isExpanded = expandedRank === r;

            return (
              <div key={r} className="relative group">
                {/* Node Connector on the vertical line */}
                <div
                  className={`absolute -left-[27px] md:-left-[31px] top-4 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
                    isCurrent
                      ? 'scale-125'
                      : isUnlocked
                      ? 'scale-100'
                      : 'scale-90 opacity-60'
                  }`}
                  style={{
                    background: isUnlocked ? def.color : '#1e293b',
                    boxShadow: isCurrent
                      ? `0 0 16px ${def.glow}, 0 0 30px ${def.glow}`
                      : isUnlocked
                      ? `0 0 8px ${def.glow}`
                      : 'none',
                    border: `2px solid ${isUnlocked ? '#0b0416' : '#475569'}`,
                  }}
                >
                  {isUnlocked ? (
                    <span className="text-[10px] font-display font-black text-base-950">{r}</span>
                  ) : (
                    <Lock className="w-3 h-3 text-slate-400" />
                  )}

                  {/* Pulsing ring for current rank */}
                  {isCurrent && (
                    <div
                      className="absolute -inset-1 rounded-full border-2 border-primary-400 animate-ping pointer-events-none"
                      style={{ borderColor: def.color }}
                    />
                  )}
                </div>

                {/* Milestone Content Card */}
                <div
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isCurrent
                      ? 'glass-strong border-primary-400/50 shadow-xl'
                      : isUnlocked
                      ? 'glass border-white/10 hover:border-white/20'
                      : isNext
                      ? 'bg-base-950/60 border-primary-500/20 hover:border-primary-500/40'
                      : 'bg-base-950/30 border-white/5 opacity-60'
                  }`}
                >
                  {/* Card Header / Summary row */}
                  <div
                    onClick={() => setExpandedRank(isExpanded ? null : r)}
                    className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      {/* Rank Emblem */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-lg transition-transform group-hover:scale-105 shrink-0"
                        style={{
                          background: isUnlocked ? def.color + '20' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isUnlocked ? def.color + '70' : 'rgba(255,255,255,0.08)'}`,
                          color: isUnlocked ? def.color : '#64748b',
                          boxShadow: isUnlocked ? `0 0 10px ${def.glow}` : 'none',
                        }}
                      >
                        {r}
                      </div>

                      {/* Rank Title and Epithet */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-bold text-sm text-slate-100">{def.title}</h4>
                          {isCurrent && (
                            <span className="text-[9px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-primary-500/20 border border-primary-400/50 text-primary-300 font-bold animate-pulse">
                              Active Rank
                            </span>
                          )}
                          {!isUnlocked && (
                            <span className="text-[9px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-400">
                              Requires Lv. {def.minLevel}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{def.epithet}</p>
                      </div>
                    </div>

                    {/* Right status / timestamp info */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-mono">
                      {isUnlocked && historyItem ? (
                        <div className="text-right">
                          <div className="text-[11px] text-slate-300 flex items-center gap-1.5 justify-end">
                            <Calendar className="w-3 h-3 text-primary-400" />
                            <span>{formatTimestamp(historyItem.unlockedAt)}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {formatRelativeTime(historyItem.unlockedAt)}
                          </div>
                        </div>
                      ) : isNext ? (
                        <div className="text-right">
                          <span className="text-[11px] text-warning-400 font-bold">
                            {levelsNeeded > 0 ? `${levelsNeeded} Lvls Remaining` : 'Threshold Met'}
                          </span>
                          <div className="text-[10px] text-slate-500">Next Ascension Goal</div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Sealed Protocol
                        </span>
                      )}

                      <button
                        type="button"
                        aria-label="Toggle details"
                        className="w-7 h-7 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Milestone Details Drawer */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3.5 animate-fade-in">
                      {/* Description & Solo Leveling System Quote */}
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{def.description}</p>

                      <div className="p-3 rounded-xl bg-base-950/70 border border-primary-500/20 text-xs font-mono text-primary-200 italic relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
                        <span className="block pl-2">{def.quote}</span>
                      </div>

                      {/* Milestone Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div className="glass rounded-xl p-2.5">
                          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                            Milestone Requirement
                          </span>
                          <span className="text-xs font-display font-bold text-slate-200">
                            Level {def.minLevel}+
                          </span>
                        </div>

                        <div className="glass rounded-xl p-2.5">
                          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                            Combat Output
                          </span>
                          <span className="text-xs font-display font-bold text-emerald-400">
                            {def.statBonus}
                          </span>
                        </div>

                        <div className="glass rounded-xl p-2.5 col-span-2 sm:col-span-1">
                          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                            Dungeon Clears
                          </span>
                          <span className="text-xs font-display font-bold text-primary-300">
                            {isUnlocked && historyItem
                              ? `${historyItem.questsClearedAtUnlock ?? totalQuestsCompleted} Cleared`
                              : `Target: ${def.minLevel * 2} Clears`}
                          </span>
                        </div>
                      </div>

                      {/* System Privileges List */}
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                          Privileges & Unlocked Directives:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {def.perks.map((perk, pIdx) => (
                            <div
                              key={pIdx}
                              className="flex items-center gap-2 p-2 rounded-lg bg-base-900/60 border border-white/5 text-[11px] font-mono text-slate-300"
                            >
                              <Sparkles className="w-3 h-3 text-secondary-400 shrink-0" />
                              <span className="truncate">{perk}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action footer */}
                      <div className="flex items-center justify-between pt-2">
                        {isUnlocked ? (
                          <button
                            type="button"
                            onClick={() => setCinematicModalRank(r)}
                            className="px-3.5 py-1.5 glass rounded-xl border border-primary-500/30 hover:border-primary-500/60 text-primary-300 hover:text-white text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-102"
                          >
                            <Play className="w-3.5 h-3.5 text-primary-400 fill-primary-400" />
                            <span>Replay Awakening Directive</span>
                          </button>
                        ) : isNext && onPromoteTest ? (
                          <button
                            type="button"
                            onClick={() => onPromoteTest(r)}
                            className="px-3.5 py-1.5 gradient-mixed rounded-xl text-white text-xs font-mono uppercase tracking-wider flex items-center gap-2 glow-primary hover:scale-102 transition-all"
                          >
                            <Zap className="w-3.5 h-3.5 text-warning-300" />
                            <span>Awaken Promotion ({r}-Rank)</span>
                          </button>
                        ) : (
                          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                            <Lock className="w-3 h-3" />
                            <span>Locked until Level {def.minLevel}</span>
                          </div>
                        )}

                        <span className="text-[10px] font-mono text-slate-500">
                          {isUnlocked ? 'Chronicle verified' : 'System Locked'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recalibrate / Resync action */}
      {onRecalibrate && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>ShadowRise Rank Telemetry Engine</span>
          <button
            type="button"
            onClick={onRecalibrate}
            className="hover:text-primary-300 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Recalibrate Timeline</span>
          </button>
        </div>
      )}

      {/* Replay Rank-Up Cinematic Modal */}
      {cinematicModalRank && (
        <RankUpCinematicModal
          isOpen={true}
          onClose={() => setCinematicModalRank(null)}
          rank={cinematicModalRank}
          level={RANK_TIMELINE_DEFINITIONS[cinematicModalRank]?.minLevel || currentLevel}
          unlockedTitle={RANK_TIMELINE_DEFINITIONS[cinematicModalRank]?.title}
        />
      )}
    </div>
  );
}
