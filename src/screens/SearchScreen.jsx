import React, { useState } from 'react';
import { Search as SearchIcon, Play, Heart, Mic } from 'lucide-react';
import { GENRES } from '../data/musicData';

export default function SearchScreen({ tracks, onSelectTrack, toggleLike }) {
  const [query, setQuery] = useState('');

  const filteredTracks = tracks.filter((t) => 
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.artist.toLowerCase().includes(query.toLowerCase()) ||
    t.genre.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
      {/* Header with Live Search Input */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-4">Search</h1>
        <div className="relative max-w-xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-900 text-white placeholder-zinc-400 pl-12 pr-12 py-3.5 rounded-full border border-zinc-800 focus:outline-none focus:border-[#1DB954] text-sm font-semibold shadow-xl"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {query ? (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Top Results ({filteredTracks.length})</h2>
          {filteredTracks.length > 0 ? (
            <div className="flex flex-col gap-2">
              {filteredTracks.map((track) => (
                <div
                  key={track.id}
                  onClick={() => onSelectTrack(track)}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-900/80 cursor-pointer group transition-colors border border-transparent hover:border-zinc-800"
                >
                  <img src={track.cover} alt={track.title} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 truncate">
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">{track.title}</h4>
                    <p className="text-xs text-zinc-400 truncate">{track.artist} • {track.genre}</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(track.id);
                    }}
                    className="p-2 text-zinc-400 hover:text-white"
                  >
                    <Heart size={18} className={track.liked ? 'fill-[#1DB954] text-[#1DB954]' : ''} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-zinc-500 font-medium">No songs found matching "{query}"</div>
          )}
        </section>
      ) : (
        /* Genre Category Cards Grid */
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Browse All Genres</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {GENRES.map((g) => (
              <div
                key={g.id}
                onClick={() => setQuery(g.name)}
                style={{ backgroundColor: g.color }}
                className="relative h-36 rounded-xl p-4 overflow-hidden cursor-pointer shadow-lg hover:scale-[1.02] transition-transform flex flex-col justify-between group"
              >
                <h3 className="text-xl font-extrabold text-white drop-shadow-md">{g.name}</h3>
                <div className="absolute -bottom-2 -right-2 text-6xl group-hover:scale-110 transition-transform opacity-90">
                  {g.icon}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
