import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, Play, Heart, Plus, Loader2, Sparkles } from 'lucide-react';
import { GENRES } from '../data/musicData';
import { searchMusicOnline } from '../utils/searchEngine';

export default function SearchScreen({ tracks, onSelectTrack, toggleLike, onAddSong }) {
  const [query, setQuery] = useState('');
  const [externalResults, setExternalResults] = useState([]);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'local' | 'online'
  const debounceTimerRef = useRef(null);

  const localFiltered = tracks.filter((t) => 
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.artist.toLowerCase().includes(query.toLowerCase()) ||
    (t.genre && t.genre.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSearchOnline = async (searchQ) => {
    const q = searchQ !== undefined ? searchQ : query;
    if (!q || !q.trim()) {
      setExternalResults([]);
      setIsSearchingExternal(false);
      return;
    }

    setIsSearchingExternal(true);
    try {
      const results = await searchMusicOnline(q);
      setExternalResults(results);
    } catch(err) {
      console.warn('Search error:', err);
    }
    setIsSearchingExternal(false);
  };

  // Live Auto Search as user types
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (query && query.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        handleSearchOnline(query);
      }, 400);
    } else {
      setExternalResults([]);
    }

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  const handlePlayOrAdd = (track) => {
    if (onAddSong) {
      onAddSong(track);
    } else {
      onSelectTrack(track);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
      {/* Header with Search Input & Instant Search Button */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white mb-4">البحث عن الأغاني والليركس</h1>
        <div className="flex items-center gap-2 max-w-2xl">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input
              type="text"
              placeholder="اكتب اسم الأغنية أو الفنان (مثال: ليجي سي، البخت...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-zinc-900 text-white placeholder-zinc-400 pl-12 pr-12 py-3.5 rounded-full border border-zinc-800 focus:outline-none focus:border-[#1DB954] text-sm font-semibold shadow-xl"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setExternalResults([]);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
          <button
            onClick={() => handleSearchOnline(query)}
            disabled={isSearchingExternal}
            className="py-3.5 px-5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-xs rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            {isSearchingExternal ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>بحث</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      {query && (
        <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
              activeTab === 'all' ? 'bg-[#1DB954] text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            الكل ({localFiltered.length + externalResults.length})
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
              activeTab === 'local' ? 'bg-[#1DB954] text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            مكتبتك ({localFiltered.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('online');
              if (externalResults.length === 0) handleSearchOnline();
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
              activeTab === 'online' ? 'bg-[#1DB954] text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            أغاني أونلاين ({externalResults.length})
          </button>
        </div>
      )}

      {/* Search Results */}
      {query ? (
        <div className="flex flex-col gap-8 mb-8">
          {/* Local Library Section */}
          {(activeTab === 'all' || activeTab === 'local') && localFiltered.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span>أغاني في مكتبتك</span>
                <span className="text-xs text-[#1DB954] font-semibold">({localFiltered.length})</span>
              </h2>
              <div className="flex flex-col gap-2">
                {localFiltered.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => onSelectTrack(track)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-900/80 cursor-pointer group transition-colors border border-transparent hover:border-zinc-800"
                  >
                    <img src={track.cover} alt={track.title} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 truncate">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">{track.title}</h4>
                      <p className="text-xs text-zinc-400 truncate">{track.artist} • {track.genre || 'Music'}</p>
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
            </section>
          )}

          {/* External YouTube & SoundCloud Section */}
          {(activeTab === 'all' || activeTab === 'online') && (
            <section>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span>نتائج YouTube و SoundCloud</span>
                <span className="text-xs text-orange-400 font-semibold">({externalResults.length})</span>
              </h2>
              {isSearchingExternal ? (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-400 gap-2">
                  <Loader2 size={28} className="animate-spin text-[#1DB954]" />
                  <span className="text-xs font-semibold">جاري البحث عن أغاني كاملة وليركس لـ "{query}"...</span>
                </div>
              ) : externalResults.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {externalResults.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => handlePlayOrAdd(track)}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 cursor-pointer group transition-all border border-zinc-800/60 gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={track.cover} alt={track.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-white truncate group-hover:text-[#1DB954] transition-colors">{track.title}</h4>
                          <p className="text-xs text-zinc-400 truncate flex items-center gap-2 mt-0.5">
                            <span>{track.artist}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                              track.source === 'SoundCloud' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {track.source || 'Music'}
                            </span>
                            {track.hasSynced && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                🎵 الليركس
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayOrAdd(track);
                        }}
                        className="px-3 py-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-black text-xs rounded-lg transition-all shrink-0 flex items-center gap-1 shadow-md"
                      >
                        <Play size={14} fill="black" />
                        <span>تشغيل وإضافة</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500 text-xs font-medium">
                  اضغط "بحث أونلاين" للبحث عن أغاني {query} من يوتيوب وساوند كلاود 🎵
                </div>
              )}
            </section>
          )}
        </div>
      ) : (
        /* Genre Category Cards Grid */
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Browse All Genres</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {GENRES.map((g) => (
              <div
                key={g.id}
                onClick={() => {
                  setQuery(g.name);
                  handleSearchOnline(g.name);
                }}
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
