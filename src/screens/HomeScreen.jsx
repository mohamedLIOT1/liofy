import React from 'react';
import { Play, Heart, Music, Plus, Sparkles, Radio, Disc } from 'lucide-react';

export default function HomeScreen({ 
  tracks = [], 
  playlists = [], 
  artists = [], 
  onSelectTrack, 
  onSelectPlaylist, 
  toggleLike, 
  onSelectArtist,
  openAddSongModal
}) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex-1 overflow-y-auto pb-32 select-none px-4 md:px-8 py-6">
      {/* Top Greeting Banner */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">{getGreeting()}</h1>
        <button
          onClick={openAddSongModal}
          className="bg-gradient-to-r from-emerald-500 to-[#1DB954] text-black font-extrabold px-4 py-2 rounded-full text-xs flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span>+ Add Song & Synced Lyrics</span>
        </button>
      </div>

      {tracks.length > 0 ? (
        <div className="flex flex-col gap-8">
          {/* Quick 6-Pack Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tracks.slice(0, 6).map((track) => (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track)}
                className="flex items-center gap-3 bg-zinc-900/80 hover:bg-zinc-800/80 rounded-xl overflow-hidden cursor-pointer transition-all border border-zinc-800/50 group"
              >
                <img src={track.cover} alt={track.title} className="w-16 h-16 object-cover" />
                <span className="font-bold text-sm text-white truncate flex-1">{track.title}</span>
                <button className="w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center mr-3 opacity-0 group-hover:opacity-100 shadow-xl transition-opacity">
                  <Play size={18} fill="black" className="ml-0.5" />
                </button>
              </div>
            ))}
          </div>

          {/* All Tracks Grid */}
          <section>
            <h2 className="text-xl font-extrabold text-white mb-4">Your Songs ({tracks.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  onClick={() => onSelectTrack(track)}
                  className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/60 hover:bg-zinc-800/60 cursor-pointer group transition-all"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                    <img src={track.cover} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={18} fill="black" className="ml-0.5" />
                    </button>
                  </div>
                  <h4 className="font-bold text-sm text-white truncate">{track.title}</h4>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{track.artist}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* Empty State Screen optimized for Mobile & Tablet */
        <div className="my-12 flex flex-col items-center justify-center text-center p-8 bg-zinc-900/40 rounded-3xl border border-zinc-800/80 max-w-xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-[#1DB954] mb-4 shadow-2xl">
            <Disc size={40} className="animate-spin-slow" />
          </div>
          <h2 className="text-2xl font-black text-white">Your Music Library is Empty</h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-2 max-w-md">
            All mock tracks have been removed. Add your custom MP3 songs, cover artwork, and synced karaoke lyrics to start listening!
          </p>

          <button
            onClick={openAddSongModal}
            className="mt-6 px-6 py-3.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-sm rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            <span>+ Add Your First Song & Lyrics</span>
          </button>
        </div>
      )}
    </div>
  );
}
