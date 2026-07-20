import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, 
  Heart, Volume2, Sliders, Moon, PlusCircle, Share2, Download
} from 'lucide-react';

export default function FullPlayerModal({
  currentTrack,
  isPlaying,
  togglePlay,
  playNext,
  playPrev,
  toggleLike,
  toggleDownload,
  isOpen,
  onClose,
  currentTime,
  duration,
  seekTo,
  volume,
  setVolume,
  isShuffle,
  toggleShuffle,
  isRepeat,
  toggleRepeat,
  queue = [],
  openEqualizer,
  openSleepTimer,
  openAddToPlaylist
}) {
  const [activeTab, setActiveTab] = useState('player');
  const lyricRefs = useRef({});

  const lyrics = currentTrack && Array.isArray(currentTrack.lyrics) ? currentTrack.lyrics : [];

  const activeLyricIndex = lyrics.length > 0
    ? lyrics.findIndex((line, idx) => {
        const nextLine = lyrics[idx + 1];
        return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
      })
    : -1;

  useEffect(() => {
    if (isOpen && activeTab === 'lyrics' && activeLyricIndex !== -1 && lyricRefs.current[activeLyricIndex]) {
      try {
        lyricRefs.current[activeLyricIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      } catch (err) {}
    }
  }, [activeLyricIndex, activeTab, isOpen]);

  if (!isOpen || !currentTrack) return null;

  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden animate-in fade-in duration-300 select-none">
      {/* Background Dynamic Color Glow */}
      <div 
        className="absolute inset-0 opacity-50 blur-3xl transition-all duration-1000 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center top, ${currentTrack.color || '#1DB954'}, #000000 85%)`
        }}
      />

      {/* Top Header Bar */}
      <div className="relative z-10 p-4 md:p-6 flex items-center justify-between">
        <button 
          onClick={onClose} 
          className="p-2 text-zinc-300 hover:text-white bg-black/40 hover:bg-black/70 rounded-full transition-all"
        >
          <ChevronDown size={28} />
        </button>

        <div className="text-center truncate px-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-black">Playing From Album</p>
          <h3 className="text-sm font-bold text-white truncate">{currentTrack.album || currentTrack.title}</h3>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={openAddToPlaylist} 
            className="p-2 text-zinc-300 hover:text-white bg-black/40 rounded-full"
            title="Add to Playlist"
          >
            <PlusCircle size={20} />
          </button>
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: currentTrack.title, text: `Listening to ${currentTrack.title} on Liofy` });
              } else {
                alert(`Copied share link for ${currentTrack.title}!`);
              }
            }}
            className="p-2 text-zinc-300 hover:text-white bg-black/40 rounded-full"
            title="Share"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Tab Selector Pill */}
      <div className="relative z-10 flex justify-center gap-2 px-4 mb-2">
        <div className="bg-zinc-900/90 backdrop-blur-md p-1 rounded-full border border-zinc-800 flex items-center gap-1 shadow-lg">
          <button
            onClick={() => setActiveTab('player')}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all ${
              activeTab === 'player' ? 'bg-[#1DB954] text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Cover Art
          </button>
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all ${
              activeTab === 'lyrics' ? 'bg-[#1DB954] text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Synced Lyrics 🎵
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all ${
              activeTab === 'queue' ? 'bg-[#1DB954] text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Queue ({queue.length})
          </button>
        </div>
      </div>

      {/* Main Player Display */}
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-xl mx-auto w-full px-6 overflow-hidden">
        {activeTab === 'player' && (
          <div className="flex flex-col items-center justify-center gap-6 my-auto">
            {/* Cover Art */}
            <div className="relative group max-w-[320px] sm:max-w-[360px] w-full aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <img 
                src={currentTrack.cover} 
                alt={currentTrack.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none flex items-end justify-center pb-6">
                  <div className="flex items-end gap-1.5 h-10">
                    <div className="w-1.5 bg-[#1DB954] rounded-full animate-bounce h-8"></div>
                    <div className="w-1.5 bg-[#1DB954] rounded-full animate-bounce h-10 delay-100"></div>
                    <div className="w-1.5 bg-[#1DB954] rounded-full animate-bounce h-6 delay-200"></div>
                    <div className="w-1.5 bg-[#1DB954] rounded-full animate-bounce h-9 delay-300"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Song Title & Like Button */}
            <div className="w-full flex items-center justify-between">
              <div className="truncate">
                <h2 className="text-2xl sm:text-3xl font-black text-white truncate tracking-tight">{currentTrack.title}</h2>
                <p className="text-base font-semibold text-zinc-400 truncate mt-0.5">{currentTrack.artist}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleDownload(currentTrack.id)} 
                  className={`p-2.5 rounded-full transition-all ${
                    currentTrack.downloaded ? 'text-[#1DB954] bg-[#1DB954]/10' : 'text-zinc-400 hover:text-white'
                  }`}
                  title={currentTrack.downloaded ? 'Downloaded Offline' : 'Download Track'}
                >
                  <Download size={24} />
                </button>
                <button 
                  onClick={() => toggleLike(currentTrack.id)}
                  className="p-2.5 text-zinc-400 hover:text-white transition-transform active:scale-125"
                >
                  <Heart size={28} className={currentTrack.liked ? 'fill-[#1DB954] text-[#1DB954]' : ''} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timed Karaoke Lyrics Tab */}
        {activeTab === 'lyrics' && (
          <div className="flex-1 bg-black/60 backdrop-blur-md rounded-3xl p-6 border border-zinc-800 overflow-y-auto flex flex-col gap-6 my-4 scroll-smooth">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#1DB954]">Live Synced Lyrics</h4>
              <span className="text-[11px] text-zinc-500 font-semibold">Click line to jump</span>
            </div>
            {lyrics.length > 0 ? (
              lyrics.map((line, idx) => {
                const isActive = idx === activeLyricIndex;
                return (
                  <p 
                    key={idx}
                    ref={(el) => (lyricRefs.current[idx] = el)}
                    onClick={() => seekTo(line.time)}
                    className={`text-xl md:text-3xl font-black cursor-pointer transition-all duration-300 leading-snug py-2 px-3 rounded-2xl ${
                      isActive 
                        ? 'text-[#1DB954] bg-[#1DB954]/10 scale-105 origin-left shadow-lg border-l-4 border-[#1DB954]' 
                        : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })
            ) : (
              <div className="text-center py-20 text-zinc-500 font-medium">No lyrics uploaded for this song yet.</div>
            )}
          </div>
        )}

        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <div className="flex-1 bg-black/60 backdrop-blur-md rounded-3xl p-6 border border-zinc-800 overflow-y-auto flex flex-col gap-3 my-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-800">Up Next</h4>
            {queue.map((track, i) => (
              <div 
                key={`${track.id}-${i}`}
                onClick={() => seekTo(0)}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer ${
                  track.id === currentTrack.id ? 'bg-zinc-800 border border-[#1DB954]/50' : 'hover:bg-zinc-900/80'
                }`}
              >
                <img src={track.cover} alt={track.title} className="w-11 h-11 rounded-xl object-cover" />
                <div className="flex-1 truncate">
                  <p className={`text-sm font-bold truncate ${track.id === currentTrack.id ? 'text-[#1DB954]' : 'text-white'}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Seekbar Slider */}
        <div className="w-full mt-4 group">
          <input 
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime || 0}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="w-full accent-[#1DB954]"
            style={{
              background: `linear-gradient(to right, #1DB954 ${duration > 0 ? (currentTime / duration) * 100 : 0}%, #333 ${duration > 0 ? (currentTime / duration) * 100 : 0}%)`
            }}
          />
          <div className="flex justify-between text-xs text-zinc-400 font-extrabold mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-between w-full py-6">
          <button 
            onClick={toggleShuffle} 
            className={`p-2 transition-colors ${isShuffle ? 'text-[#1DB954]' : 'text-zinc-400 hover:text-white'}`}
            title="Shuffle"
          >
            <Shuffle size={22} />
          </button>

          <button 
            onClick={playPrev} 
            className="p-2 text-white hover:scale-110 active:scale-95 transition-transform"
          >
            <SkipBack size={32} fill="white" />
          </button>

          <button 
            onClick={togglePlay} 
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-2xl"
          >
            {isPlaying ? <Pause size={30} fill="black" /> : <Play size={30} fill="black" className="ml-1" />}
          </button>

          <button 
            onClick={playNext} 
            className="p-2 text-white hover:scale-110 active:scale-95 transition-transform"
          >
            <SkipForward size={32} fill="white" />
          </button>

          <button 
            onClick={toggleRepeat} 
            className={`p-2 transition-colors ${isRepeat ? 'text-[#1DB954]' : 'text-zinc-400 hover:text-white'}`}
            title="Repeat"
          >
            <Repeat size={22} />
          </button>
        </div>

        {/* Bottom Tools Row */}
        <div className="flex items-center justify-between pt-2 pb-6 border-t border-zinc-900">
          <div className="flex items-center gap-3 w-36">
            <Volume2 size={18} className="text-zinc-400 shrink-0" />
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-[#1DB954]"
            />
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={openEqualizer}
              className="p-2 text-zinc-400 hover:text-[#1DB954] transition-colors"
              title="Audio Equalizer"
            >
              <Sliders size={20} />
            </button>
            <button 
              onClick={openSleepTimer}
              className="p-2 text-zinc-400 hover:text-[#1DB954] transition-colors"
              title="Sleep Timer"
            >
              <Moon size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
