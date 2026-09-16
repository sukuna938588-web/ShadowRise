/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          900: '#06060c',
          800: '#0a0a14',
          700: '#10101e',
          600: '#161628',
          500: '#1e1e36',
        },
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        secondary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        success: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        error: {
          400: '#f87171',
          500: '#ef4444',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        sans: ['Outfit', 'sans-serif'],
        mono: ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'float-up': 'floatUp linear infinite',
        'float-subtle': 'floatSubtle 5s ease-in-out infinite',
        'float-subtle-delayed': 'floatSubtle 6s ease-in-out 1.5s infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'glow-pulse-slow': 'glowPulse 5s ease-in-out infinite',
        'spin-slow': 'spin 24s linear infinite',
        'spin-reverse': 'spinReverse 16s linear infinite',
        'spin-runic': 'spin 36s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'sheen': 'sheenSweep 3.5s ease-in-out infinite',
        'xp-fill': 'xpFill 1s ease-out forwards',
        'badge-glow': 'badgeGlow 4s ease-in-out infinite',
        'shadow-flame': 'shadowFlame 4s ease-in-out infinite',
        'lightning-strike': 'lightningFlash 0.3s ease-out forwards',
      },
      keyframes: {
        floatSubtle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        sheenSweep: {
          '0%': { transform: 'translateX(-150%) skewX(-25deg)' },
          '50%, 100%': { transform: 'translateX(250%) skewX(-25deg)' },
        },
        shadowFlame: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '0.7', filter: 'blur(16px)' },
          '33%': { transform: 'scale(1.08) rotate(1deg)', opacity: '0.9', filter: 'blur(22px)' },
          '66%': { transform: 'scale(0.96) rotate(-1deg)', opacity: '0.75', filter: 'blur(18px)' },
        },
        lightningFlash: {
          '0%': { opacity: '0' },
          '15%': { opacity: '0.95' },
          '30%': { opacity: '0.2' },
          '45%': { opacity: '0.85' },
          '100%': { opacity: '0' },
        },
        floatUp: {
          '0%': { transform: 'translateY(100vh) translateX(0)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateY(-10vh) translateX(20px)', opacity: '0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5', filter: 'blur(20px)' },
          '50%': { opacity: '0.8', filter: 'blur(30px)' },
        },
        spinReverse: {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        xpFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--xp-width)' },
        },
        badgeGlow: {
          '0%, 100%': { boxShadow: '0 0 30px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.1)' },
          '50%': { boxShadow: '0 0 50px rgba(139, 92, 246, 0.5), 0 0 100px rgba(139, 92, 246, 0.2)' },
        },
      },
    },
  },
  plugins: [],
};
