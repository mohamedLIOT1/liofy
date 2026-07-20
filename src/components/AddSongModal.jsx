import React, { useState } from 'react';
import { X, Plus, Music, Image, Mic, FileAudio, Clock, Trash2, Check, Search, Sparkles, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function AddSongModal({ isOpen, onClose, onAddSong }) {
  const [activeTab, setActiveTab] = useState('auto'); // 'auto' | 'quick' | 'custom'
  const [searchQuery, setSearchQuery] = useState('ليجي سي');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedTrackIds, setAddedTrackIds] = useState(new Set());
  const [searchSourceFilter, setSearchSourceFilter] = useState('all'); // 'all' | 'soundcloud' | 'youtube'

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
      const cleanQuery = q.trim();

      // 1. Fetch real synced lyrics from LrcLib API
      let lrcTracks = [];
      try {
        const lrcRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(cleanQuery)}`);
        const lrcData = await lrcRes.json();
        if (Array.isArray(lrcData)) lrcTracks = lrcData;
      } catch(e){}

      const getLyricsForSong = (songTitle, artistName) => {
        let matchedLrc = lrcTracks.find((l) =>
          l.trackName && songTitle &&
          (l.trackName.toLowerCase().includes(songTitle.toLowerCase()) ||
           songTitle.toLowerCase().includes(l.trackName.toLowerCase()))
        );

        if (matchedLrc && matchedLrc.syncedLyrics) {
          const parsed = parseLrcLyrics(matchedLrc.syncedLyrics);
          if (parsed) return { lyrics: parsed, hasSynced: true };
        }

        return {
          lyrics: [
            { time: 0, text: `🎵 ${songTitle}` },
            { time: 5, text: `Artist: ${artistName}` },
            { time: 15, text: `♪ Full Audio & Synced Karaoke on Liofy ♪` }
          ],
          hasSynced: false
        };
      };

      // 2. SoundCloud Search (Direct High Quality MP3 Streams)
      let scTracks = [];
      const scClientId = 'emAJdGEj1mm9yjoCD2jkixmgqrGIyfpi';
      try {
        const scRes = await fetch(`https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(cleanQuery)}&client_id=${scClientId}&limit=12`);
        const scData = await scRes.json();

        if (scData && Array.isArray(scData.collection)) {
          for (const item of scData.collection) {
            const progressive = item.media?.transcodings?.find(t => t.format?.protocol === 'progressive');
            let streamMp3Url = null;
            if (progressive) {
              try {
                const streamRes = await fetch(`${progressive.url}?client_id=${scClientId}`);
                const streamData = await streamRes.json();
                streamMp3Url = streamData.url;
              } catch(e){}
            }

            if (streamMp3Url) {
              const songTitle = item.title || cleanQuery;
              const artistName = item.user?.username || 'SoundCloud Artist';
              const { lyrics, hasSynced } = getLyricsForSong(songTitle, artistName);

              scTracks.push({
                id: `sc-${item.id}`,
                title: songTitle,
                artist: artistName,
                album: 'SoundCloud',
                cover: item.artwork_url ? item.artwork_url.replace('-large', '-t500x500') : (item.user?.avatar_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'),
                audioUrl: streamMp3Url,
                duration: Math.round((item.duration || 180000) / 1000),
                genre: 'SoundCloud',
                source: 'SoundCloud',
                lyrics,
                hasSynced
              });
            }
          }
        }
      } catch(e) {
        console.warn('SoundCloud search:', e);
      }

      // 3. YouTube Search via Piped API
      let ytTracks = [];
      try {
        const ytRes = await fetch(`https://api.piped.private.coffee/search?q=${encodeURIComponent(cleanQuery)}&filter=music_songs`);
        const ytData = await ytRes.json();

        if (ytData && Array.isArray(ytData.items)) {
          for (const video of ytData.items.slice(0, 12)) {
            const videoId = video.url ? video.url.replace('/watch?v=', '') : '';
            const songTitle = video.title || cleanQuery;
            const artistName = video.uploaderName || 'YouTube Artist';
            const { lyrics, hasSynced } = getLyricsForSong(songTitle, artistName);

            const thumb = video.thumbnail
              ? video.thumbnail.replace(/w120-h120/, 'w600-h600')
              : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

            // Mapped soundcloud audio or fallback stream
            const scMatch = scTracks.find(s => s.title.toLowerCase().includes(songTitle.toLowerCase()));
            const audioUrl = scMatch ? scMatch.audioUrl : (scTracks[0] ? scTracks[0].audioUrl : '');

            if (audioUrl) {
              ytTracks.push({
                id: `yt-${videoId || Math.random()}`,
                videoId,
                title: songTitle,
                artist: artistName,
                album: 'YouTube Music',
                cover: thumb,
                audioUrl,
                duration: video.duration || 210,
                genre: 'YouTube',
                source: 'YouTube',
                lyrics,
                hasSynced
              });
            }
          }
        }
      } catch(e) {
        console.warn('YouTube search:', e);
      }

      const combined = [...scTracks, ...ytTracks];
      setSearchResults(combined);
    } catch (err) {
      console.warn('External search error:', err);
    }
    setIsSearching(false);
  };

  const handleAddExternalTrack = async (track) => {
    if (addedTrackIds.has(track.id)) return;

    setAddedTrackIds((prev) => new Set(prev).add(track.id));

    const newTrack = {
      ...track,
      id: `track-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      plays: "12,400",
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

            {/* Quick Suggestions Chips & Source Filter */}
            <div className="flex flex-col gap-2">
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

              {/* Platform Filter Buttons */}
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                <span className="text-zinc-400 text-xs font-bold">المصدر:</span>
                <button
                  type="button"
                  onClick={() => setSearchSourceFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                    searchSourceFilter === 'all' ? 'bg-[#1DB954] text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  🌐 الكل
                </button>
                <button
                  type="button"
                  onClick={() => setSearchSourceFilter('soundcloud')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                    searchSourceFilter === 'soundcloud' ? 'bg-orange-500 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  🟠 SoundCloud
                </button>
                <button
                  type="button"
                  onClick={() => setSearchSourceFilter('youtube')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                    searchSourceFilter === 'youtube' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  🔴 YouTube
                </button>
              </div>
            </div>

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto max-h-[50vh] pr-1 flex flex-col gap-2">
              {isSearching ? (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-400 gap-2">
                  <Loader2 size={28} className="animate-spin text-[#1DB954]" />
                  <span className="text-xs font-extrabold">جاري البحث على YouTube و SoundCloud...</span>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults
                  .filter((t) => {
                    if (searchSourceFilter === 'soundcloud') return t.source === 'SoundCloud';
                    if (searchSourceFilter === 'youtube') return t.source === 'YouTube';
                    return true;
                  })
                  .map((t) => {
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
                            <p className="text-xs text-zinc-400 truncate flex items-center gap-2 mt-0.5">
                              <span>{t.artist}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                t.source === 'SoundCloud' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {t.source || 'Music'}
                              </span>
                              {t.hasSynced && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                  <span>🎵 الليركس</span>
                                </span>
                              )}
                            </p>
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
                  ابحث عن اسم الفنان لعرض أغانيه من YouTube و SoundCloud مع الليركس متزامنة 🎵
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
