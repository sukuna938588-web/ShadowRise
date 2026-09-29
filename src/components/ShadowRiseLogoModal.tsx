import React, { useState } from 'react';
import {
  X,
  Download,
  Sparkles,
  Shield,
  Layers,
  Check,
  Share2,
  Sword,
  Moon,
} from 'lucide-react';

interface ShadowRiseLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShadowRiseLogoModal: React.FC<ShadowRiseLogoModalProps> = ({ isOpen, onClose }) => {
  const [backgroundMode, setBackgroundMode] = useState<'dark' | 'transparent'>('dark');
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = (format: 'raster' | 'svg-transparent' | 'svg-dark') => {
    let url = '/shadowrise-logo.jpg';
    let filename = 'ShadowRise-Gaming-Logo-4K.jpg';

    if (format === 'svg-transparent') {
      url = '/shadowrise-gaming-logo.svg';
      filename = 'ShadowRise-Emblem-Transparent.svg';
    } else if (format === 'svg-dark') {
      url = '/shadowrise-gaming-logo-dark.svg';
      filename = 'ShadowRise-Emblem-Dark.svg';
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloadSuccess(format);
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ShadowRise - Rise from the Shadows',
          text: 'The official ShadowRise Hunter Guild gaming emblem. Forged from shadow mana and crystal blade.',
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to copy link
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.origin + '/shadowrise-gaming-logo.svg');
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Ignored
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logo-modal-title"
    >
      <div className="glass-strong rounded-3xl p-5 sm:p-6 max-w-lg w-full border border-purple-500/40 shadow-[0_0_60px_rgba(168,85,247,0.4)] animate-scale-in relative overflow-hidden max-h-[92vh] flex flex-col">
        {/* Ambient Glows */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-600/30 rounded-full blur-3xl pointer-events-none animate-glow-pulse" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-blue-600/25 rounded-full blur-3xl pointer-events-none animate-glow-pulse" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-400/50 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              <Sword className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-purple-300">
                <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                <span>Hunter Guild Insignia</span>
              </div>
              <h2 id="logo-modal-title" className="font-display font-bold text-base sm:text-lg text-white">
                ShadowRise Gaming Logo
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto space-y-4 pt-4 pr-1 relative z-10 custom-scrollbar">
          {/* Logo Preview Canvas Container */}
          <div className="relative group rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl flex flex-col items-center justify-center p-4">
            {/* Background Toggle Bar */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-xl p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setBackgroundMode('dark')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                  backgroundMode === 'dark'
                    ? 'bg-purple-600/70 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setBackgroundMode('transparent')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                  backgroundMode === 'transparent'
                    ? 'bg-purple-600/70 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Transparent</span>
              </button>
            </div>

            {/* Canvas Surface with Grid for transparent preview */}
            <div
              className={`w-full aspect-square max-w-[280px] sm:max-w-[320px] rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
                backgroundMode === 'transparent'
                  ? 'bg-[linear-gradient(45deg,#120e24_25%,transparent_25%),linear-gradient(-45deg,#120e24_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#120e24_75%),linear-gradient(-45deg,transparent_75%,#120e24_75%)] bg-[size:16px_16px] bg-[#090514]'
                  : 'bg-black'
              }`}
            >
              {backgroundMode === 'transparent' ? (
                <img
                  src="/shadowrise-gaming-logo.svg"
                  alt="ShadowRise Logo Transparent"
                  className="w-full h-full object-contain p-2 drop-shadow-[0_0_25px_rgba(192,132,252,0.6)] animate-pulse-slow"
                />
              ) : (
                <img
                  src="/shadowrise-logo.jpg"
                  alt="ShadowRise Logo 4K"
                  className="w-full h-full object-contain rounded-xl drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                  onError={(e) => {
                    // Fallback to dark SVG if JPG is not found
                    (e.currentTarget as HTMLImageElement).src = '/shadowrise-gaming-logo-dark.svg';
                  }}
                />
              )}

              {/* Tagline Badge */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-black/75 border border-purple-500/40 text-[9px] font-mono tracking-widest uppercase text-purple-300 whitespace-nowrap shadow-lg">
                Rise from the Shadows
              </div>
            </div>
          </div>

          {/* Emblem Design Breakdowns */}
          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="glass rounded-xl p-2.5 border border-white/5">
              <div className="flex items-center gap-1.5 text-purple-300 text-xs font-bold mb-1">
                <Sword className="w-3.5 h-3.5 text-purple-400" />
                <span>Crystal Sword</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Faceted amethyst mana blade forged with white-hot core light & dragon hilt.
              </p>
            </div>

            <div className="glass rounded-xl p-2.5 border border-white/5">
              <div className="flex items-center gap-1.5 text-blue-300 text-xs font-bold mb-1">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Crescent Blades</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Silver-chrome bevels & obsidian wings flanking the central crest.
              </p>
            </div>

            <div className="glass rounded-xl p-2.5 border border-white/5">
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Arcane Runic Ring</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Concentric orbital containment ring with cardinal diamond seals.
              </p>
            </div>

            <div className="glass rounded-xl p-2.5 border border-white/5">
              <div className="flex items-center gap-1.5 text-pink-300 text-xs font-bold mb-1">
                <Layers className="w-3.5 h-3.5 text-pink-400" />
                <span>Neon Violet Aura</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Floating mana embers, ethereal shadows & cosmic energy smoke.
              </p>
            </div>
          </div>

          {/* Download & Asset Action Options */}
          <div className="space-y-2 pt-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-1">
              Download Official Assets
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDownload('raster')}
                className="py-2.5 px-3 rounded-xl gradient-mixed border border-purple-400/50 text-[11px] font-mono uppercase tracking-wider text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {downloadSuccess === 'raster' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>4K Emblem</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleDownload('svg-transparent')}
                className="py-2.5 px-3 rounded-xl glass border border-purple-500/40 text-[11px] font-mono uppercase tracking-wider text-purple-200 hover:text-white hover:border-purple-400/80 transition-all cursor-pointer flex items-center justify-center gap-1.5 font-semibold"
              >
                {downloadSuccess === 'svg-transparent' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Saved SVG!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Vector (Alpha)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleDownload('svg-dark')}
                className="py-2.5 px-3 rounded-xl glass border border-white/10 text-[11px] font-mono uppercase tracking-wider text-slate-300 hover:text-white hover:border-white/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 font-semibold"
              >
                {downloadSuccess === 'svg-dark' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Saved Dark!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Vector (Dark)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between text-xs relative z-10">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 text-slate-400 hover:text-purple-300 font-mono text-[11px] transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Emblem</span>
              </>
            )}
          </button>

          <span className="text-[10px] font-mono text-slate-500">
            SHADOWRISE SYSTEM • 4K ULTRA HD
          </span>
        </div>
      </div>
    </div>
  );
};
