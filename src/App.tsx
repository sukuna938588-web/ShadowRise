import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { ScreenName } from '@/types';
import { useStore } from '@/store';
import { ParticleBackground } from '@/components/ParticleBackground';
import { PurpleLightning } from '@/components/PurpleLightning';
import { BottomNav } from '@/components/BottomNav';
import { AuthScreen } from '@/screens/AuthScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { QuestsScreen } from '@/screens/QuestsScreen';
import { AlarmsScreen } from '@/screens/AlarmsScreen';
import { AddScreen } from '@/screens/AddScreen';
import { NotesScreen } from '@/screens/NotesScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { VoiceMotivationModal } from '@/components/VoiceMotivationModal';
import { WorkoutAlarmPopup } from '@/components/WorkoutAlarmPopup';
import { FullScreenAlarmModal } from '@/components/FullScreenAlarmModal';

const DEMO_SESSION: Session = {
  access_token: 'demo-access-token',
  refresh_token: 'demo-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'demo-hunter-id',
    app_metadata: {},
    user_metadata: { full_name: 'Shadow Hunter' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: 'hunter@shadowrise.local',
  },
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [screen, setScreen] = useState<ScreenName>('home');
  const store = useStore(session);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    }).catch(() => {
      setAuthLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        setSession(newSession);
      })();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleNavigate = (s: ScreenName) => setScreen(s);

  if (authLoading) {
    return (
      <div className="min-h-screen w-full max-w-md mx-auto relative flex items-center justify-center">
        <ParticleBackground />
        <div className="w-12 h-12 rounded-full border-2 border-primary-400/30 border-t-primary-400 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen w-full max-w-md mx-auto relative">
        <ParticleBackground />
        <AuthScreen onAuthed={() => {}} onDemoAccess={() => setSession(DEMO_SESSION)} />
      </div>
    );
  }

  if (store.loading) {
    return (
      <div className="min-h-screen w-full max-w-md mx-auto relative flex items-center justify-center">
        <ParticleBackground />
        <div className="w-12 h-12 rounded-full border-2 border-primary-400/30 border-t-primary-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-md mx-auto relative pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] overflow-x-hidden">
      <ParticleBackground />
      <PurpleLightning interactive frequencySeconds={7} intensity="medium" />

      <div key={screen} className="animate-fade-in">
        {screen === 'home' && <HomeScreen store={store} onNavigate={handleNavigate} />}
        {screen === 'quests' && <QuestsScreen store={store} />}
        {screen === 'alarms' && <AlarmsScreen store={store} />}
        {screen === 'add' && <AddScreen store={store} onDone={() => setScreen('quests')} />}
        {screen === 'notes' && <NotesScreen store={store} />}
        {screen === 'profile' && <ProfileScreen store={store} onSignOut={() => setSession(null)} />}
      </div>

      <BottomNav active={screen} onNavigate={handleNavigate} />

      {/* Full-Screen Solo Leveling Hunter System Alarm Modal */}
      <FullScreenAlarmModal
        alarm={store.activeRingingAlarm}
        onDismiss={store.dismissAlarm}
        onSnooze={store.snoozeAlarm}
      />

      {/* Global Solo Leveling Voice Motivation Modal on workout completion */}
      <VoiceMotivationModal
        isOpen={store.isVoiceMotivationOpen}
        onClose={() => store.setIsVoiceMotivationOpen(false)}
        initialMessage={store.voiceMotivationData.message}
        workoutTitle={store.voiceMotivationData.workoutTitle}
        xpEarned={store.voiceMotivationData.xpEarned}
      />

      {/* Global Workout Alarm Notification Popup */}
      <WorkoutAlarmPopup
        isOpen={store.isWorkoutAlarmPopupOpen}
        alarmTime={store.workoutAlarm.time}
        onStartWorkout={() => {
          store.dismissWorkoutAlarm();
          handleNavigate('home');
        }}
        onSnooze={store.snoozeWorkoutAlarm}
        onDismiss={store.dismissWorkoutAlarm}
      />
    </div>
  );
}

export default App;
