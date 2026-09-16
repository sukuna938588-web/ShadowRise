import { useState } from 'react';
import { StickyNote, Plus, X, Trash2, Smile, Meh, Minus, BatteryLow, Frown } from 'lucide-react';
import type { Store } from '@/store';
import type { Mood } from '@/types';
import { moodConfig } from '@/data/initialData';

interface NotesScreenProps {
  store: Store;
}

const moodIconMap: Record<string, typeof Smile> = {
  Smile,
  Meh,
  Minus,
  BatteryLow,
  Frown,
};

export function NotesScreen({ store }: NotesScreenProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood>('good');

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    store.addNote({ title: title.trim(), content: content.trim(), mood });
    setTitle('');
    setContent('');
    setMood('good');
    setShowForm(false);
  };

  return (
    <div className="px-4 pt-[env(safe-area-inset-top)] pb-28 space-y-5">
      {/* Header */}
      <div className="pt-4 flex items-center justify-between animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StickyNote className="w-5 h-5 text-primary-400" />
            <h1 className="font-display font-bold text-2xl gradient-text">Hunter's Journal</h1>
          </div>
          <p className="text-sm text-slate-400">Record your journey and reflections.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="w-10 h-10 rounded-xl gradient-mixed flex items-center justify-center glow-primary transition-transform hover:scale-110 active:scale-95"
        >
          {showForm ? <X className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="glass-strong rounded-2xl p-5 space-y-4 animate-scale-in">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entry title..."
              maxLength={50}
              className="w-full glass rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-600 border border-white/8 focus:border-primary-400/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Entry</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts..."
              maxLength={500}
              rows={4}
              className="w-full glass rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-600 border border-white/8 focus:border-primary-400/50 transition-all resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Mood</label>
            <div className="flex items-center gap-2">
              {(Object.keys(moodConfig) as Mood[]).map((m) => {
                const config = moodConfig[m];
                const Icon = moodIconMap[config.icon] ?? Smile;
                const isActive = mood === m;
                return (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`flex-1 py-2.5 rounded-xl flex flex-col items-center gap-1 transition-all duration-300 ${
                      isActive ? 'glass-strong' : 'glass'
                    }`}
                    style={isActive ? { borderColor: config.color + '60', boxShadow: `0 0 12px ${config.color}30` } : {}}
                  >
                    <Icon className="w-4 h-4" style={{ color: isActive ? config.color : '#64748b' }} />
                    <span className="text-[9px] font-mono uppercase" style={{ color: isActive ? config.color : '#64748b' }}>
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            className={`w-full py-3.5 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
              title.trim() && content.trim()
                ? 'gradient-mixed text-white glow-primary hover:scale-[1.02] active:scale-[0.98]'
                : 'glass text-slate-600 cursor-not-allowed'
            }`}
          >
            Save Entry
          </button>
        </div>
      )}

      {/* Notes list */}
      <div className="space-y-3">
        {store.notes.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center animate-fade-in">
            <StickyNote className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Your journal is empty.</p>
            <p className="text-xs text-slate-500 mt-1">Tap the + button to write your first entry.</p>
          </div>
        ) : (
          store.notes.map((note, i) => {
            const config = moodConfig[note.mood];
            const MoodIcon = moodIconMap[config.icon] ?? Smile;
            return (
              <div
                key={note.id}
                className="glass rounded-2xl p-5 animate-slide-up group"
                style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: config.color + '15', border: `1px solid ${config.color}30` }}
                    >
                      <MoodIcon className="w-4 h-4" style={{ color: config.color }} />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-sm text-slate-100">{note.title}</h3>
                      <p className="text-[10px] font-mono text-slate-500">{note.date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => store.deleteNote(note.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-error-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-error-400" />
                  </button>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mt-2">{note.content}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
