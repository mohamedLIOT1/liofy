import React, { useState } from 'react';
import { X, Plus, Music, Image, Mic, FileAudio, Clock, Trash2, Check, Search, Sparkles, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function AddSongModal({ isOpen, onClose, onAddSong }) {
  const [activeTab, setActiveTab] = useState('auto'); // 'auto' | 'quick' | 'custom'
  const [searchQuery, setSearchQuery] = useState('ليجي سي');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedTrackIds, setAddedTrackIds] = useState(new Set());

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [coverUrl, setCoverUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  const [lyricsLines, setLyricsLines] = useState([
    { time: 0, text: 'Intro music playing...' },
    { time: 10, text: 'First verse starts here...' },
    { time: 25, text: 'Chorus soaring high...' }
  ]);

  const [isUploading, setIsUploading] = useState(false);

  // Helper function to parse LRC format karaoke lyrics into timestamped array
  const parseLrcLyrics = (lrcText) => {
    if (!lrcText || typeof lrcText !== 'string') return null;
    const lines = lrcText.split('\n');
    const result = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

    for (const line of lines) {
      const match = line.match(timeRegex);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const totalSeconds = minutes * 60 + seconds;
        const text = match[4].trim();
        if (text) {
          result.push({ time: totalSeconds, text });
        }
      }
    }
    return result.length > 0 ? result : null;
  };

  const handleExternalSearch = async (queryToSearch) => {
    const q = queryToSearch || searchQuery;
    if (!q || !q.trim()) return;

    setIsSearching(true);
    try {
      // 1. Fetch real synced lyrics from LrcLib API
      let lrcTracks = [];
      try {
        const lrcRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(q)}`);
        const lrcData = await lrcRes.json();
        if (Array.isArray(lrcData)) lrcTracks = lrcData;
      } catch(e){}

      // 2. Query YouTube directly via Invidious for full 3-5 minute audio streams
      let ytTracks = [];
      try {
        const ytRes = await fetch(`https://inv.tux.pizza/api/v1/search?q=${encodeURIComponent(q)}&type=video`);
        const ytData = await ytRes.json();
        if (Array.isArray(ytData)) {
          ytTracks = ytData.slice(0, 15).map((video) => {
            const thumb = video.videoThumbnails && video.videoThumbnails.length > 0 
              ? video.videoThumbnails[video.videoThumbnails.length - 1].url
              : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';

            // Match synced lyrics from LrcLib
            let matchedLyrics = null;
            const matchedLrc = lrcTracks.find((l) =>
              l.trackName && video.title &&
              (l.trackName.toLowerCase().includes(video.title.toLowerCase()) ||
               video.title.toLowerCase().includes(l.trackName.toLowerCase()))
            );

            if (matchedLrc && matchedLrc.syncedLyrics) {
              matchedLyrics = parseLrcLyrics(matchedLrc.syncedLyrics);
            }

            if (!matchedLyrics) {
              matchedLyrics = [
                { time: 0, text: `🎵 ${video.title}` },
                { time: 5, text: `Artist: ${video.author}` },
                { time: 15, text: `♪ Full YouTube Audio on Liofy ♪` }
              ];
            }

            return {
              id: `yt-${video.videoId}`,
              title: video.title,
              artist: video.author || q,
              album: 'YouTube Full Track',
              cover: thumb,
              audioUrl: `https://inv.tux.pizza/latest_version?id=${video.videoId}&itag=140`,
              duration: video.lengthSeconds || 240,
              genre: 'Music',
              lyrics: matchedLyrics
            };
          });
        }
      } catch(e){
        console.warn('YouTube search fallback:', e);
      }

      // 3. Query iTunes API for official album tracks
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=15`;
      const res = await fetch(itunesUrl);
      const data = await res.json();

      let itunesTracks = [];
      if (data.results && Array.isArray(data.results)) {
        itunesTracks = data.results.map((item) => {
          const highResCover = item.artworkUrl100 
            ? item.artworkUrl100.replace('100x100bb', '600x600bb')
            : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';

          let matchedLyrics = null;
          const matchedLrc = lrcTracks.find((l) =>
            l.trackName && item.trackName &&
            (l.trackName.toLowerCase().includes(item.trackName.toLowerCase()) ||
             item.trackName.toLowerCase().includes(l.trackName.toLowerCase()))
          );

          if (matchedLrc && matchedLrc.syncedLyrics) {
            matchedLyrics = parseLrcLyrics(matchedLrc.syncedLyrics);
          }

          if (!matchedLyrics) {
            matchedLyrics = [
              { time: 0, text: `🎵 ${item.trackName} - ${item.artistName}` },
              { time: 6, text: `Album: ${item.collectionName || 'Single'}` },
              { time: 15, text: `♪ Synced Lyrics & Music on Liofy ♪` }
            ];
          }

          return {
            id: `ext-${item.trackId || Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: item.trackName || item.collectionName || 'Track',
            artist: item.artistName || 'Unknown Artist',
            album: item.collectionName || 'Single',
            cover: highResCover,
            audioUrl: item.previewUrl || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
            duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 210,
            genre: item.primaryGenreName || 'Pop',
            lyrics: matchedLyrics
          };
        });
      }

      // Combine YouTube tracks first (full duration) then iTunes tracks
      const combined = [...ytTracks, ...itunesTracks];
      setSearchResults(combined);
    } catch (err) {
      console.warn('External search error:', err);
    }
    setIsSearching(false);
  };

  const fetchFullAudioStream = async (artist, title, fallbackUrl) => {
    try {
      const query = `${artist} ${title}`;
      const invRes = await fetch(`https://inv.tux.pizza/api/v1/search?q=${encodeURIComponent(query)}&type=video`);
      const invData = await invRes.json();
      if (Array.isArray(invData) && invData.length > 0) {
        const topMatch = invData[0];
        if (topMatch && topMatch.videoId) {
          return `https://inv.tux.pizza/latest_version?id=${topMatch.videoId}&itag=140`;
        }
      }
    } catch (err) {
      console.warn('Full audio stream fetch error:', err);
    }
    return fallbackUrl;
  };

  const handleAddExternalTrack = async (track) => {
    if (addedTrackIds.has(track.id)) return;

    setAddedTrackIds((prev) => new Set(prev).add(track.id));

    // Resolve full 3-5 minute audio stream
    const fullAudioUrl = await fetchFullAudioStream(track.artist, track.title, track.audioUrl);

    const newTrack = {
      ...track,
      id: `track-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      audioUrl: fullAudioUrl,
      plays: "5,400",
      liked: true,
      downloaded: true
    };

    try {
      await onAddSong(newTrack);
    } catch (err) {}
  };

  if (!isOpen) return null;

  const handleAddLyricLine = () => {
    const lastTime = lyricsLines.length > 0 ? lyricsLines[lyricsLines.length - 1].time + 15 : 0;
    setLyricsLines([...lyricsLines, { time: lastTime, text: '' }]);
  };

  const handleUpdateLyric = (index, field, value) => {
    const updated = [...lyricsLines];
    updated[index][field] = field === 'time' ? Number(value) || 0 : value;
    setLyricsLines(updated);
  };

  const handleRemoveLyricLine = (index) => {
    setLyricsLines(lyricsLines.filter((_, i) => i !== index));
  };

  const handleCoverFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setCoverUrl(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAudioFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setAudioUrl(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !artist) return;

    setIsUploading(true);

    const defaultCovers = [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
    ];
    const randomDefaultCover = defaultCovers[Math.floor(Math.random() * defaultCovers.length)];

    const finalCover = coverUrl || randomDefaultCover;
    const finalAudio = audioUrl || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3';

    const sortedLyrics = [...lyricsLines]
      .filter((l) => l.text.trim().length > 0)
      .sort((a, b) => a.time - b.time);

    const newTrack = {
      id: `track-${Date.now()}`,
      title,
      artist,
      album: album || title,
      cover: finalCover,
      audioUrl: finalAudio,
      duration: 210,
      plays: "1,200",
      liked: true,
      downloaded: true,
      genre: genre || 'Pop',
      color: "#1DB954",
      lyrics: sortedLyrics.length > 0 ? sortedLyrics : [{ time: 0, text: `${title} - ${artist}` }]
    };

    try {
      await onAddSong(newTrack);
    } catch(err) {}

    setIsUploading(false);
    onClose();

    // Reset form
    setTitle('');
    setArtist('');
    setAlbum('');
    setCoverUrl('');
    setAudioUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#181818] border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center font-black">
              <Plus size={22} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">إضافة أغنية جديدة</h3>
              <p className="text-xs text-zinc-400">Add songs quickly to your library and sync across all devices</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900">
            <X size={20} />
          </button>
        </div>

        {/* Mode Toggle Switch */}
        <div className="flex bg-zinc-900 p-1 rounded-xl my-3 border border-zinc-800 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('auto');
              if (searchResults.length === 0) handleExternalSearch('ليجي سي');
            }}
            className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'auto' ? 'bg-[#1DB954] text-black shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>🔍 استيراد تلقائي</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'quick' ? 'bg-[#1DB954] text-black shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>⚡ إضافة سريعة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'custom' ? 'bg-[#1DB954] text-black shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>🎛️ إضافة تفصيلية</span>
          </button>
        </div>

        {/* Tab 1: Auto Import View */}
        {activeTab === 'auto' && (
          <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-4">
            {/* Search input bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-3 text-zinc-400" />
                <input
                  type="text"
                  placeholder="ابحث عن اسم الفنان أو الأغنية (مثال: ليجي سي، ويجز...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExternalSearch()}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
                />
              </div>
              <button
                type="button"
                onClick={() => handleExternalSearch()}
                disabled={isSearching}
                className="py-2.5 px-4 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-xs rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5"
              >
                {isSearching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                <span>بحث</span>
              </button>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-zinc-500 text-[11px] shrink-0">مقترحات:</span>
              {['ليجي سي', 'ويجز', 'مروان بابلو', 'The Weeknd', 'Drake', 'Travis Scott'].map((artistName) => (
                <button
                  key={artistName}
                  type="button"
                  onClick={() => {
                    setSearchQuery(artistName);
                    handleExternalSearch(artistName);
                  }}
                  className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold shrink-0 text-[11px]"
                >
                  {artistName}
                </button>
              ))}
            </div>

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto max-h-[50vh] pr-1 flex flex-col gap-2">
              {isSearching ? (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-400 gap-2">
                  <Loader2 size={28} className="animate-spin text-[#1DB954]" />
                  <span className="text-xs font-extrabold">جاري البحث عن أغاني وألبومات {searchQuery}...</span>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((t) => {
                  const isAdded = addedTrackIds.has(t.id);
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between bg-zinc-900/80 hover:bg-zinc-800/80 p-3 rounded-2xl border border-zinc-800 transition-all gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={t.cover}
                          alt={t.title}
                          className="w-12 h-12 rounded-xl object-cover border border-zinc-700/50 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-white truncate">{t.title}</h4>
                          <p className="text-xs text-zinc-400 truncate">{t.artist} • <span className="text-zinc-500">{t.album}</span></p>
                        </div>
                      </div>

                      {/* Single simple "إضافة" button */}
                      <button
                        type="button"
                        onClick={() => handleAddExternalTrack(t)}
                        disabled={isAdded}
                        className={`px-4 py-2 rounded-xl font-black text-xs transition-all shrink-0 flex items-center gap-1 ${
                          isAdded
                            ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30 cursor-default'
                            : 'bg-[#1DB954] hover:bg-[#1ed760] text-black shadow-lg active:scale-95'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check size={15} />
                            <span>تمت الإضافة</span>
                          </>
                        ) : (
                          <>
                            <Plus size={15} />
                            <span>إضافة</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center text-zinc-500 text-xs font-semibold">
                  ابحث عن اسم الفنان لعرض كافة أغانيه وألبوماته وإضافتها بضغطة زر 🎵
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2 & 3: Manual / Quick Forms */}
        {activeTab !== 'auto' && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 flex flex-col gap-6 pr-2">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase font-extrabold text-zinc-400 block mb-1">Song Title *</label>
              <input
                type="text"
                placeholder="e.g. Starboy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
              />
            </div>

            <div>
              <label className="text-xs uppercase font-extrabold text-zinc-400 block mb-1">Artist Name *</label>
              <input
                type="text"
                placeholder="e.g. The Weeknd"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
              />
            </div>
          </div>

          {activeTab === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase font-extrabold text-zinc-400 block mb-1">Album Name</label>
                <input
                  type="text"
                  placeholder="e.g. Starboy Album"
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-extrabold text-zinc-400 block mb-1">Genre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#1DB954]"
                >
                  <option value="Pop">Pop</option>
                  <option value="Hip-Hop">Hip-Hop</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Arab Pop">Arab Pop</option>
                  <option value="Rock">Rock</option>
                  <option value="Chill & Lofi">Chill & Lofi</option>
                </select>
              </div>
            </div>
          )}

          {/* Media Files Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
            {/* Cover Image Upload / URL */}
            <div>
              <label className="text-xs uppercase font-extrabold text-zinc-400 flex items-center gap-1.5 mb-2">
                <Image size={15} className="text-[#1DB954]" />
                <span>غلاف الأغنية (اختياري)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverFileChange}
                className="text-xs text-zinc-400 mb-2 block file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#1DB954] file:text-black hover:file:bg-[#1ed760]"
              />
              <input
                type="text"
                placeholder="أو ضع رابط صورة (https://...)"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
              />
              {coverUrl && (
                <img src={coverUrl} alt="Preview" className="w-16 h-16 rounded-lg object-cover mt-2 border border-zinc-700" />
              )}
            </div>

            {/* Audio File Upload / URL */}
            <div>
              <label className="text-xs uppercase font-extrabold text-zinc-400 flex items-center gap-1.5 mb-2">
                <FileAudio size={15} className="text-[#1DB954]" />
                <span>الملف الصوتي MP3 (اختياري)</span>
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioFileChange}
                className="text-xs text-zinc-400 mb-2 block file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#1DB954] file:text-black hover:file:bg-[#1ed760]"
              />
              <input
                type="text"
                placeholder="أو ضع رابط MP3 (https://...)"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
              />
            </div>
          </div>

          {/* Timed Lyrics Editor (Advanced Mode Only) */}
          {activeTab === 'custom' && (
            <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs uppercase font-extrabold text-zinc-400 flex items-center gap-1.5">
                  <Mic size={15} className="text-[#1DB954]" />
                  <span>Synced Timed Lyrics (Karaoke)</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddLyricLine}
                  className="text-xs font-bold text-[#1DB954] hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add Line
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {lyricsLines.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-700 shrink-0">
                      <Clock size={12} className="text-zinc-400" />
                      <input
                        type="number"
                        min="0"
                        value={line.time}
                        onChange={(e) => handleUpdateLyric(idx, 'time', e.target.value)}
                        className="w-12 bg-transparent text-xs text-[#1DB954] font-bold text-center focus:outline-none"
                      />
                      <span className="text-[10px] text-zinc-500">sec</span>
                    </div>

                    <input
                      type="text"
                      placeholder={`Lyric line ${idx + 1}...`}
                      value={line.text}
                      onChange={(e) => handleUpdateLyric(idx, 'text', e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveLyricLine(idx)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold rounded-xl transition-all shadow-xl text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isUploading ? (
              <span>⚡ جاري الحفظ والمزامنة المباشرة...</span>
            ) : (
              <span>{activeTab === 'quick' ? '⚡ إضافة سريعة وفورية' : 'حفظ الأغنية والكلمات المتزامنة'}</span>
            )}
          </button>
        </form>
      )}
      </div>
    </div>
  );
}
