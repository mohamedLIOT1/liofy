import React, { useState } from 'react';
import { Heart, Plus, Download, Music, UserCheck } from 'lucide-react';

export default function LibraryScreen({ playlists, tracks, onSelectPlaylist, onSelectTrack, openCreatePlaylistModal, toggleLike }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'playlists' | 'downloads'

  const likedTracks = tracks.filter((t) => t.liked);
  const downloadedTracks = tracks.filter((t) => t.downloaded);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-white">Your Library</h1>
        <button
          onClick={openCreatePlaylistModal}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-xs shadow-lg transition-transform active:scale-95"
        >
          <Plus size={16} />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'playlists', 'downloads'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all shrink-0 ${
              filter === f ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Library Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {/* Liked Songs Special Card */}
        {(filter === 'all' || filter === 'playlists') && (
          <div
            onClick={() => onSelectPlaylist(playlists[0])}
            className="bg-gradient-to-br from-indigo-700 via-purple-800 to-zinc-900 p-5 rounded-2xl cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-44 shadow-xl border border-indigo-500/30 group"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white mb-2 backdrop-blur-md">
                <Heart size={20} fill="white" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">Liked Songs</h3>
            </div>
            <p className="text-xs font-bold text-indigo-200">{likedTracks.length} liked songs</p>
          </div>
        )}

        {/* Playlists Cards */}
        {(filter === 'all' || filter === 'playlists') &&
          playlists.slice(1).map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl)}
              className="bg-[#181818] p-4 rounded-2xl hover:bg-[#282828] cursor-pointer transition-all border border-zinc-800/60 shadow-lg flex items-center gap-4 group"
            >
              <img src={pl.cover} alt={pl.name} className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-md" />
              <div className="truncate">
                <h4 className="font-bold text-base text-white truncate group-hover:text-[#1DB954] transition-colors">{pl.name}</h4>
                <p className="text-xs text-zinc-400 truncate mt-1">{pl.description}</p>
                <span className="text-[11px] text-zinc-500 font-semibold mt-2 block">{pl.trackIds.length} tracks</span>
              </div>
            </div>
          ))}
      </div>

      {/* Offline Downloaded Section */}
      {(filter === 'all' || filter === 'downloads') && (
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Download className="text-[#1DB954]" size={20} />
            <h2 className="text-xl font-bold text-white">Downloaded Offline ({downloadedTracks.length})</h2>
          </div>
          <div className="flex flex-col gap-2">
            {downloadedTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track)}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-900/80 cursor-pointer group transition-colors border border-transparent hover:border-zinc-800"
              >
                <img src={track.cover} alt={track.title} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 truncate">
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">{track.title}</h4>
                  <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                </div>
                <span className="text-xs text-[#1DB954] font-bold bg-[#1DB954]/10 px-2.5 py-1 rounded-full">Offline Ready</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
