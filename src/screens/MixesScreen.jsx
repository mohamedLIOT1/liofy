import React, { useState } from 'react';
import { Play, Pause, Sparkles, Disc, RefreshCw, Layers } from 'lucide-react';

export default function MixesScreen({ 
  tracks = [], 
  onSelectTrack, 
  onSelectMix, 
  currentTrack, 
  isPlaying, 
  togglePlay 
}) {
  const [djQuoteIndex, setDjQuoteIndex] = useState(0);

  const voiceQuotes = [
    "Hey! I'm DJ Lio, your AI host. Drop some songs into your library and I will create custom mixes for you!",
    "Switching it up with some fresh vibes for you and your friends!",
    "Let's slow things down with some late night chill tracks..."
  ];

  const handleNextQuote = () => {
    setDjQuoteIndex((prev) => (prev + 1) % voiceQuotes.length);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-32 select-none px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-black shadow-lg">
          <Sparkles size={22} />
        </div>
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">AI DJ & Mixes</h1>
          <p className="text-xs text-zinc-400">Personalized AI transitions & custom mixes</p>
        </div>
      </div>

      {/* AI DJ Lio Card */}
      <div className="bg-gradient-to-r from-cyan-950 via-zinc-900 to-black p-6 md:p-8 rounded-3xl border border-cyan-500/30 mb-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-cyan-400/40">
            <img 
              src="https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=600&auto=format&fit=crop&q=80" 
              alt="DJ Lio" 
              className="w-full h-full object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-cyan-950/60 backdrop-blur-xs flex items-center justify-center">
                <Disc size={48} className="text-cyan-400 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400">AI Host</span>
            <h2 className="text-3xl font-black text-white mt-1">DJ Lio</h2>
            <p className="text-xs md:text-sm text-zinc-300 mt-2 font-medium italic bg-cyan-950/40 p-3 rounded-2xl border border-cyan-500/20">
              "{voiceQuotes[djQuoteIndex]}"
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
              <button
                disabled={tracks.length === 0}
                onClick={() => {
                  if (tracks.length > 0) {
                    onSelectTrack(tracks[0]);
                  }
                }}
                className={`px-6 py-3 rounded-full font-extrabold text-xs flex items-center gap-2 transition-all shadow-xl ${
                  tracks.length > 0 
                    ? 'bg-cyan-400 hover:bg-cyan-300 text-black hover:scale-105 active:scale-95 cursor-pointer' 
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                {isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" />}
                <span>{isPlaying ? 'Pause DJ' : 'Start AI DJ'}</span>
              </button>

              <button
                onClick={handleNextQuote}
                className="px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-cyan-300 font-bold text-xs rounded-full border border-zinc-800 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={14} />
                <span>Next Voice Quote</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tracks Mix List */}
      <section>
        <h3 className="text-xl font-extrabold text-white mb-4">Your Dynamic Tracks ({tracks.length})</h3>
        {tracks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tracks.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTrack(t)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:bg-zinc-800/60 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3 truncate">
                  <img src={t.cover} alt={t.title} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="truncate">
                    <h4 className="font-bold text-sm text-white truncate">{t.title}</h4>
                    <p className="text-xs text-zinc-400 truncate">{t.artist}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-black px-2 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                  {t.bpm || 95} BPM • {t.key || '2A'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-zinc-900/40 rounded-3xl border border-zinc-800/80 p-8 text-zinc-500 text-xs font-bold">
            No tracks available in your library for AI DJ. Add a song to generate DJ transitions!
          </div>
        )}
      </section>
    </div>
  );
}
