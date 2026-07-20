import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Car, Mic, X } from 'lucide-react';

export default function CarModeScreen({ currentTrack, isPlaying, togglePlay, playNext, playPrev, exitCarMode }) {
  if (!currentTrack) return null;

  return (
    <div className="flex-1 bg-black p-6 md:p-12 flex flex-col justify-between items-center text-center select-none pb-32">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#1DB954] font-extrabold text-sm uppercase tracking-widest bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
          <Car size={18} />
          <span>Car Driving Mode</span>
        </div>
        <button 
          onClick={exitCarMode} 
          className="p-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full font-bold text-xs flex items-center gap-2 border border-zinc-800"
        >
          <X size={20} />
          <span>Exit Car View</span>
        </button>
      </div>

      {/* Center Large Track Display */}
      <div className="my-auto flex flex-col items-center max-w-lg">
        <img 
          src={currentTrack.cover} 
          alt={currentTrack.title} 
          className="w-48 h-48 md:w-64 md:h-64 rounded-3xl object-cover shadow-2xl mb-8 border-4 border-zinc-800"
        />
        <h1 className="text-3xl md:text-5xl font-black text-white truncate max-w-full tracking-tight">{currentTrack.title}</h1>
        <p className="text-xl font-bold text-[#1DB954] mt-2 truncate">{currentTrack.artist}</p>
      </div>

      {/* Extra Large Driving Controls */}
      <div className="w-full max-w-md flex items-center justify-around gap-6 my-auto">
        <button 
          onClick={playPrev}
          className="w-20 h-20 rounded-full bg-zinc-900 border-2 border-zinc-700 text-white flex items-center justify-center active:scale-90 transition-transform shadow-2xl"
        >
          <SkipBack size={36} fill="white" />
        </button>

        <button 
          onClick={togglePlay}
          className="w-28 h-28 rounded-full bg-[#1DB954] text-black flex items-center justify-center active:scale-95 transition-transform shadow-2xl"
        >
          {isPlaying ? <Pause size={48} fill="black" /> : <Play size={48} fill="black" className="ml-2" />}
        </button>

        <button 
          onClick={playNext}
          className="w-20 h-20 rounded-full bg-zinc-900 border-2 border-zinc-700 text-white flex items-center justify-center active:scale-90 transition-transform shadow-2xl"
        >
          <SkipForward size={36} fill="white" />
        </button>
      </div>
    </div>
  );
}
