import { useState } from 'react';
import type { ScreenName } from '@/types';
import { useStore } from '@/store';
import { ParticleBackground } from '@/components/ParticleBackground';
import { PurpleLightning } from '@/components/PurpleLightning';
import { BottomNav } from '@/components/BottomNav';
import { HunterRegistrationScreen } from '@/screens/HunterRegistrationScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { QuestsScreen } from '@/screens/QuestsScreen';
import { AlarmsScreen } from '@/screens/AlarmsScreen';
import { AddScreen } from '@/screens/AddScreen';
import { NotesScreen } from '@/screens/NotesScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { VoiceMotivationModal } from '@/components/VoiceMotivationModal';
import { WorkoutAlarmPopup } from '@/components/WorkoutAlarmPopup';
import { FullScreenAlarmModal } from '@/components/FullScreenAlarmModal';
import { XPNotificationHUD } from '@/components/XPNotificationHUD';
import { RankUpCinematicModal } from '@/components/RankUpCinematicModal';
import { FirstTimeInstallPrompt } from '@/components/FirstTimeInstallPrompt';

function App() {
  const [screen, setScreen] = useState<ScreenName>('home');
  const store = useStore();

  const handleNavigate = (s: ScreenName) => setScreen(s);

  if (store.loading) {
    return (
      <div className="min-h-screen w-full max-w-md mx-auto relative flex items-center justify-center">
        <ParticleBackground />
        <div className="w-12 h-12 rounded-full border-2 border-primary-400/30 border-t-primary-400 animate-spin" />
      </div>
    );
  }

  // First-time Hunter Registration check
  if (!store.isRegistered) {
    return (
      <div className="min-h-screen min-h-[100dvh] w-full max-w-md mx-auto relative pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] overflow-x-hidden">
        <ParticleBackground />
        <PurpleLightning interactive frequencySeconds={8} intensity="medium" />
        <HunterRegistrationScreen
          store={store}
          onComplete={() => setScreen('home')}
        />
        {/* First-Time PWA Install Prompt */}
        <FirstTimeInstallPrompt />
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
        {screen === 'profile' && <ProfileScreen store={store} onSignOut={() => setScreen('home')} />}
      </div>

      {/* Global XP Rewards Animated Notification HUD */}
      <XPNotificationHUD
        notifications={store.xpToasts}
        onDismiss={store.dismissXpToast}
      />

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

      {/* Full-Screen High-Impact Celebration Animation on Rank Threshold Crossing */}
      {store.rankUpCelebration?.isOpen && (
        <RankUpCinematicModal
          isOpen={true}
          onClose={store.dismissRankUpCelebration}
          rank={store.rankUpCelebration.newRank}
          oldRank={store.rankUpCelebration.oldRank}
          level={store.rankUpCelebration.level}
          unlockedTitle={store.rankUpCelebration.unlockedTitle}
          totalXp={store.rankUpCelebration.totalXp}
        />
      )}

      {/* First-Time PWA Install Prompt */}
      <FirstTimeInstallPrompt />
    </div>
  );
}

export default App;
