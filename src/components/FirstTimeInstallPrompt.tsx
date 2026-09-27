import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Share,
  PlusSquare,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  Smartphone,
} from 'lucide-react';

export const SHADOWRISE_INSTALL_PROMPT_STORAGE_KEY = 'shadowrise_install_prompt_seen_v1';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const FirstTimeInstallPrompt: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check if the app is already running in standalone / installed mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      // Already installed, ensure flag is saved so it never appears
      try {
        localStorage.setItem(SHADOWRISE_INSTALL_PROMPT_STORAGE_KEY, 'true');
      } catch {
        // Storage access error safeguard
      }
      return;
    }

    // 2. Check if user has already seen/dismissed the install prompt
    try {
      const hasSeenPrompt = localStorage.getItem(SHADOWRISE_INSTALL_PROMPT_STORAGE_KEY);
      if (hasSeenPrompt) {
        return;
      }
    } catch {
      return;
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    // 4. Capture browser PWA beforeinstallprompt event if supported
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      deferredPromptRef.current = promptEvent;
    };

    const handleAppInstalled = () => {
      try {
        localStorage.setItem(SHADOWRISE_INSTALL_PROMPT_STORAGE_KEY, 'true');
      } catch {
        // Ignore
      }
      setIsOpen(false);
      setDeferredPrompt(null);
      deferredPromptRef.current = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 5. Open the prompt smoothly on first app launch
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const markPromptDismissed = () => {
    try {
      localStorage.setItem(SHADOWRISE_INSTALL_PROMPT_STORAGE_KEY, 'true');
    } catch (err) {
      console.warn('[ShadowRise] Could not save install prompt state:', err);
    }
  };

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || deferredPromptRef.current;

    if (promptEvent && typeof promptEvent.prompt === 'function') {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setInstallSuccess(true);
          markPromptDismissed();
          setTimeout(() => {
            setIsOpen(false);
          }, 900);
          return;
        }
      } catch (err) {
        console.warn('[ShadowRise] Install prompt trigger error:', err);
      }
      // If user dismissed browser prompt, remember dismissed state
      markPromptDismissed();
      setIsOpen(false);
    } else {
      // Browser does not support automatic prompt or it hasn't fired yet (e.g. iOS Safari)
      // Show guided instructions card
      setShowInstructions(true);
    }
  };

  const handleLaterClick = () => {
    markPromptDismissed();
    setIsOpen(false);
  };

  const handleCloseInstructions = () => {
    markPromptDismissed();
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-prompt-title"
    >
      <div className="glass-strong rounded-3xl p-6 sm:p-7 max-w-sm sm:max-w-md w-full border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.35)] animate-scale-in relative overflow-hidden">
        {/* Purple Glow Pulse & Ambient Lighting */}
        <div className="absolute -top-16 -left-16 w-44 h-44 bg-purple-600/30 rounded-full blur-3xl pointer-events-none animate-glow-pulse" />
        <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-blue-600/25 rounded-full blur-3xl pointer-events-none animate-glow-pulse" />

        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

        {/* Close Button ("Later" shortcut) */}
        <button
          type="button"
          onClick={handleLaterClick}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close install prompt"
        >
          <X className="w-4 h-4" />
        </button>

        {!showInstructions ? (
          <div className="space-y-5 text-center relative z-10">
            {/* Monarch Crest Icon with Pulse */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-500/50 flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.5)] relative">
              <div className="absolute inset-0 rounded-2xl border border-purple-400/30 animate-ping opacity-40 pointer-events-none" />
              <img
                src="/icon.svg"
                alt="ShadowRise"
                className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]"
                onError={(e) => {
                  // Fallback icon if svg fails to render
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <Download className="w-8 h-8 text-purple-300 absolute" style={{ display: 'none' }} />
            </div>

            {/* Prompt Title */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-mono uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3 text-purple-400 animate-spin-slow" />
                <span>Hunter System Directive</span>
              </div>
              <h2
                id="install-prompt-title"
                className="font-display font-bold text-lg sm:text-xl text-slate-100 uppercase tracking-wide text-glow-primary"
              >
                ⚔️ Enter the ShadowRise System
              </h2>
            </div>

            {/* Prompt Message */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans px-1">
              Install ShadowRise on your device for a faster app-like experience, offline access, and immersive hunter tracking.
            </p>

            {/* Feature Highlights Pills */}
            <div className="grid grid-cols-3 gap-2 pt-1 pb-1">
              <div className="glass rounded-xl p-2 text-center border border-white/5">
                <Smartphone className="w-4 h-4 mx-auto text-purple-400 mb-1" />
                <span className="text-[10px] font-mono text-slate-300 block">App Mode</span>
              </div>
              <div className="glass rounded-xl p-2 text-center border border-white/5">
                <ShieldCheck className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                <span className="text-[10px] font-mono text-slate-300 block">Offline Ready</span>
              </div>
              <div className="glass rounded-xl p-2 text-center border border-white/5">
                <Sparkles className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                <span className="text-[10px] font-mono text-slate-300 block">Instant Launch</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleLaterClick}
                className="order-2 sm:order-1 flex-1 py-3 px-4 rounded-xl glass border border-white/10 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white hover:border-white/20 transition-all cursor-pointer font-semibold"
              >
                Later
              </button>

              <button
                type="button"
                onClick={handleInstallClick}
                className="order-1 sm:order-2 flex-1 py-3 px-4 rounded-xl gradient-mixed border border-purple-400/50 text-xs font-mono uppercase tracking-wider text-white shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-bold flex items-center justify-center gap-2"
              >
                {installSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Installed!</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm">📱</span>
                    <span>Install Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Guided Instruction Card (For iOS Safari or manual install) */
          <div className="space-y-4 text-center relative z-10 animate-fade-in">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              {isIOS ? <Share className="w-6 h-6 text-purple-300" /> : <Download className="w-6 h-6 text-purple-300" />}
            </div>

            <div>
              <h3 className="font-display font-bold text-base text-slate-100 uppercase tracking-wide">
                {isIOS ? 'Install on iPhone / iPad' : 'Add to Home Screen'}
              </h3>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                Complete installation via your browser menu
              </p>
            </div>

            <div className="glass rounded-2xl p-4 text-left space-y-3 border border-purple-500/20 text-xs text-slate-300 font-sans">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </div>
                    <div>
                      Tap the <strong className="text-white">Share</strong> button in the Safari toolbar at the bottom:
                      <div className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">
                        <Share className="w-3 h-3" /> Share
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </div>
                    <div>
                      Scroll down and tap <strong className="text-white">Add to Home Screen</strong>:
                      <div className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">
                        <PlusSquare className="w-3 h-3" /> Add to Home Screen
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                    ★
                  </div>
                  <div>
                    Open your browser menu (tap <strong className="text-white">⋮</strong> or <strong className="text-white">⋯</strong>) and select <strong className="text-white">Install App</strong> or <strong className="text-white">Add to Home Screen</strong>.
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleCloseInstructions}
              className="w-full py-2.5 px-4 rounded-xl gradient-mixed border border-purple-400/40 text-xs font-mono uppercase tracking-wider text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Got It
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
