import { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  Clock,
  Plus,
  Sparkles,
  ShieldAlert,
  History,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import type { Store } from '@/store';
import type { ShadowAlarm } from '@/types';
import { AlarmCard } from '@/components/AlarmCard';
import { AlarmEditModal } from '@/components/AlarmEditModal';

interface AlarmsScreenProps {
  store: Store;
}

export function AlarmsScreen({ store }: AlarmsScreenProps) {
  const [activeTab, setActiveTab] = useState<'alarms' | 'history'>('alarms');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<ShadowAlarm | null>(null);

  // Live ticking clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Browser notification permission state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setNotificationPermission(res);
      } catch (err) {
        console.warn('Error requesting notification permission:', err);
      }
    }
  };

  const handleOpenCreateModal = () => {
    setEditingAlarm(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (alarm: ShadowAlarm) => {
    setEditingAlarm(alarm);
    setIsEditModalOpen(true);
  };

  const handleSaveAlarm = (
    alarmData: Omit<ShadowAlarm, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      store.updateAlarm(existingId, alarmData);
    } else {
      store.addAlarm(alarmData);
    }
  };

  // Next upcoming alarm calculation
  const nextAlarm = useMemo(() => {
    const enabledAlarms = store.alarms.filter((a) => a.enabled);
    if (enabledAlarms.length === 0) return null;

    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const sorted = [...enabledAlarms].sort((a, b) => {
      const [hA, mA] = a.time.split(':').map(Number);
      const [hB, mB] = b.time.split(':').map(Number);
      const minA = hA * 60 + mA;
      const minB = hB * 60 + mB;
      const diffA = minA >= nowMinutes ? minA - nowMinutes : minA + 24 * 60 - nowMinutes;
      const diffB = minB >= nowMinutes ? minB - nowMinutes : minB + 24 * 60 - nowMinutes;
      return diffA - diffB;
    });

    return sorted[0] || null;
  }, [store.alarms, currentTime]);

  const activeCount = store.alarms.filter((a) => a.enabled).length;

  return (
    <div className="px-4 pt-[env(safe-area-inset-top)] pb-28 space-y-5">
      {/* Top Header */}
      <div className="pt-4 flex items-center justify-between animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-300">
              <Bell className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary-400">
              SYSTEM DIRECTIVES
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-100">
            Hunter Alarms
          </h1>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl gradient-mixed font-display font-bold text-xs uppercase tracking-wider text-white shadow-lg shadow-primary-500/30 hover:opacity-95 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Alarm</span>
        </button>
      </div>

      {/* Live Hunter System Clock Card */}
      <div className="glass-strong rounded-3xl p-5 relative overflow-hidden border border-primary-500/30 shadow-[0_0_30px_rgba(139,92,246,0.15)] animate-slide-up">
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-primary-500/15 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-primary-400 flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Hunter Dimensional Clock</span>
            </div>

            <div className="font-display font-black text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-primary-200 tracking-tight">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>

            <div className="text-xs font-mono text-slate-400 mt-1">
              {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
            <div className="glass rounded-2xl p-3 text-center min-w-[90px] border border-white/5">
              <div className="text-xl font-display font-bold text-primary-300">
                {activeCount}
              </div>
              <div className="text-[10px] font-mono uppercase text-slate-400">
                Armed
              </div>
            </div>

            <div className="glass rounded-2xl p-3 text-center min-w-[100px] border border-white/5">
              <div className="text-xl font-display font-bold text-warning-400">
                {nextAlarm ? nextAlarm.time : '--:--'}
              </div>
              <div className="text-[10px] font-mono uppercase text-slate-400">
                Next Alarm
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Browser Notification Permission Banner if not granted */}
      {notificationPermission !== 'granted' && (
        <div className="glass rounded-2xl p-4 border border-warning-500/30 bg-warning-500/5 flex items-start justify-between gap-3 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-warning-500/20 border border-warning-500/30 flex items-center justify-center shrink-0 text-warning-400 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-warning-300">
                Browser Notifications Inactive
              </div>
              <p className="text-xs font-mono text-slate-300 mt-0.5 leading-relaxed">
                Permit system notifications so your alarms ring with full immersion even if ShadowRise is minimized.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={requestNotificationPermission}
            className="px-3 py-1.5 rounded-xl gradient-mixed font-mono text-xs text-white shrink-0 shadow-md active:scale-95 transition-transform"
          >
            Authorize
          </button>
        </div>
      )}

      {/* Navigation Tabs (Alarms vs History) */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('alarms')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all ${
              activeTab === 'alarms'
                ? 'bg-primary-500/25 border border-primary-400 text-white font-bold shadow-sm'
                : 'glass border border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-primary-400" />
            <span>Alarms ({store.alarms.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all ${
              activeTab === 'history'
                ? 'bg-primary-500/25 border border-primary-400 text-white font-bold shadow-sm'
                : 'glass border border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5 text-primary-400" />
            <span>History ({store.alarmHistory.length})</span>
          </button>
        </div>

        {/* Instant Test Button */}
        <button
          type="button"
          onClick={() => {
            if (store.alarms.length > 0) {
              store.triggerAlarm(store.alarms[0]);
            } else {
              handleOpenCreateModal();
            }
          }}
          className="text-[11px] font-mono px-2.5 py-1 rounded-lg glass border border-warning-500/30 text-warning-300 hover:bg-warning-500/10 flex items-center gap-1 transition-all"
          title="Simulate full-screen alarm ring right now"
        >
          <Sparkles className="w-3 h-3" />
          <span>Test Wakeup</span>
        </button>
      </div>

      {/* Tab 1: Alarms List */}
      {activeTab === 'alarms' && (
        <div className="space-y-3 animate-fade-in">
          {store.alarms.length === 0 ? (
            <div className="glass-strong rounded-3xl p-8 text-center border border-white/10 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-300 mx-auto">
                <Bell className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-200">
                No Hunter Alarms Armed
              </h3>
              <p className="text-xs font-mono text-slate-400 max-w-xs mx-auto">
                Create unlimited daily, weekday, or custom alarms with built-in Solo Leveling sounds or uploaded custom MP3s.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl gradient-mixed font-display font-bold text-xs uppercase tracking-wider text-white shadow-lg shadow-primary-500/30"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Alarm</span>
              </button>
            </div>
          ) : (
            store.alarms.map((alarm) => (
              <AlarmCard
                key={alarm.id}
                alarm={alarm}
                onToggle={store.toggleAlarm}
                onEdit={handleOpenEditModal}
                onDelete={store.deleteAlarm}
                onTestTrigger={store.triggerAlarm}
              />
            ))
          )}
        </div>
      )}

      {/* Tab 2: Alarm History */}
      {activeTab === 'history' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>Logged Directive Wakeups</span>
            {store.alarmHistory.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear all alarm history logs?')) {
                    store.clearAlarmHistory();
                  }
                }}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {store.alarmHistory.length === 0 ? (
            <div className="glass rounded-2xl p-6 text-center border border-white/5 space-y-2">
              <History className="w-8 h-8 text-slate-500 mx-auto mb-1" />
              <div className="text-xs font-mono text-slate-300 font-bold">
                No Alarm History Yet
              </div>
              <p className="text-[11px] font-mono text-slate-500">
                When your alarms ring and you arise or snooze, records will appear here.
              </p>
            </div>
          ) : (
            store.alarmHistory.map((item) => (
              <div
                key={item.id}
                className="glass rounded-2xl p-3.5 border border-white/5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.action === 'dismissed'
                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                        : 'bg-amber-500/20 border border-amber-500/30 text-amber-300'
                    }`}
                  >
                    {item.action === 'dismissed' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>

                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-200 truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Triggered {new Date(item.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(item.triggeredAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider ${
                      item.action === 'dismissed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {item.action === 'dismissed' ? 'ARISED (+25 XP)' : `SNOOZED ${item.snoozeMinutes || 10}M`}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Alarm Create / Edit Modal */}
      <AlarmEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveAlarm}
        onDelete={store.deleteAlarm}
        initialAlarm={editingAlarm}
      />
    </div>
  );
}
