import { Home, ScrollText, Bell, Plus, StickyNote, User } from 'lucide-react';
import type { ScreenName } from '@/types';

interface BottomNavProps {
  active: ScreenName;
  onNavigate: (screen: ScreenName) => void;
}

const navItems: { screen: ScreenName; icon: typeof Home; label: string }[] = [
  { screen: 'home', icon: Home, label: 'Home' },
  { screen: 'quests', icon: ScrollText, label: 'Quests' },
  { screen: 'alarms', icon: Bell, label: 'Alarms' },
  { screen: 'add', icon: Plus, label: 'Add' },
  { screen: 'notes', icon: StickyNote, label: 'Notes' },
  { screen: 'profile', icon: User, label: 'Profile' },
];

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[max(0.5rem,env(safe-area-inset-bottom))] pointer-events-none">
      <nav className="glass-nav rounded-2xl mx-2 sm:mx-4 mb-2 sm:mb-3 px-1 sm:px-2 py-1 flex items-center justify-between w-full max-w-md shadow-2xl pointer-events-auto border border-white/10">
        {navItems.map((item) => {
          const isActive = active === item.screen;
          const isAdd = item.screen === 'add';

          if (isAdd) {
            return (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                className="relative -mt-5 flex flex-col items-center min-w-[44px] justify-center focus:outline-none active:scale-95 transition-transform"
                aria-label={item.label}
              >
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'gradient-mixed glow-primary scale-105'
                      : 'gradient-mixed glow-primary hover:scale-105'
                  }`}
                >
                  <item.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[9px] mt-0.5 font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className="relative flex flex-col items-center justify-center gap-0.5 px-1.5 py-1 min-w-[42px] transition-all duration-300 active:scale-95 focus:outline-none"
              aria-label={item.label}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'glass-strong glow-primary'
                    : 'hover:bg-white/5'
                }`}
              >
                <item.icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                    isActive
                      ? 'text-primary-300 text-glow-primary'
                      : 'text-slate-500'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className={`text-[9px] font-mono uppercase tracking-wider transition-all duration-300 ${
                  isActive ? 'text-primary-300 font-semibold' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary-400 glow-primary" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
