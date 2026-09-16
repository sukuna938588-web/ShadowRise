import { useState, useEffect } from 'react';
import { Flame, Mail, Lock, User as UserIcon, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthScreenProps {
  onAuthed: () => void;
  onDemoAccess?: () => void;
}

export function AuthScreen({ onAuthed, onDemoAccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError('');
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim() || email.split('@')[0],
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        // Auto sign-in after sign-up (email confirmation is off)
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError('Account created. Please sign in.');
          setMode('signin');
          return;
        }

        onAuthed();
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        onAuthed();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10 animate-scale-in">
        <div className="w-16 h-16 rounded-2xl gradient-mixed flex items-center justify-center glow-primary mb-4 animate-glow-pulse">
          <Flame className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display font-bold text-3xl tracking-wider gradient-text">SHADOWRISE</h1>
        <p className="text-sm text-slate-400 mt-2 font-mono uppercase tracking-widest">
          {mode === 'signin' ? 'Welcome back, hunter' : 'Begin your ascent'}
        </p>
      </div>

      {/* Form card */}
      <div className="w-full max-w-sm glass-strong rounded-3xl p-6 space-y-4 animate-slide-up">
        {/* Mode tabs */}
        <div className="flex glass rounded-xl p-1">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-mono uppercase tracking-wider transition-all duration-300 ${
              mode === 'signin' ? 'gradient-mixed text-white glow-primary' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-mono uppercase tracking-wider transition-all duration-300 ${
              mode === 'signup' ? 'gradient-mixed text-white glow-primary' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Full name (sign-up only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  maxLength={50}
                  className="w-full glass rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder:text-slate-600 border border-white/8 focus:border-primary-400/50 transition-all"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full glass rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder:text-slate-600 border border-white/8 focus:border-primary-400/50 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="w-full glass rounded-xl pl-10 pr-10 py-3 text-slate-100 placeholder:text-slate-600 border border-white/8 focus:border-primary-400/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 glass rounded-xl px-3 py-2.5 text-sm text-error-400 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
              loading
                ? 'glass text-slate-500 cursor-not-allowed'
                : 'gradient-mixed text-white glow-primary hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Enter the Shadow' : 'Create Account'}
          </button>

          {onDemoAccess && (
            <button
              type="button"
              onClick={onDemoAccess}
              className="w-full py-2.5 rounded-xl glass border border-white/10 text-slate-300 hover:text-white hover:border-primary-400/40 text-xs font-mono uppercase tracking-wider transition-all"
            >
              Explore as Guest Hunter
            </button>
          )}
        </form>
      </div>

      <p className="text-xs text-slate-600 mt-6 text-center max-w-xs font-mono">
        Your fitness journey starts here. Track quests, hydrate, and rise through the ranks.
      </p>
    </div>
  );
}
