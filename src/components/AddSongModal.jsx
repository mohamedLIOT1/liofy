import React, { useState } from 'react';
import { X, Plus, Music, Image, Mic, FileAudio, Clock, Trash2, Check } from 'lucide-react';

export default function AddSongModal({ isOpen, onClose, onAddSong }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [coverUrl, setCoverUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  // Timed Lyrics List [{ time: 0, text: 'First line' }, { time: 15, text: 'Second line' }]
  const [lyricsLines, setLyricsLines] = useState([
    { time: 0, text: 'Intro music playing...' },
    { time: 10, text: 'First verse starts here...' },
    { time: 25, text: 'Chorus soaring high...' }
  ]);

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
      setCoverUrl(URL.createObjectURL(file));
    }
  };

  const handleAudioFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !artist) return;

    const finalCover = coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';
    const finalAudio = audioUrl || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3';

    // Sort lyrics by timestamp
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
      plays: "10,500",
      liked: true,
      downloaded: true,
      genre,
      color: "#1DB954",
      lyrics: sortedLyrics.length > 0 ? sortedLyrics : [{ time: 0, text: 'No lyrics available' }]
    };

    onAddSong(newTrack);
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
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center font-black">
              <Plus size={22} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">Add Song & Synced Lyrics</h3>
              <p className="text-xs text-zinc-400">Add songs with artwork, audio MP3, and timed lyrics</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
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

          {/* Media Files Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
            {/* Cover Image Upload / URL */}
            <div>
              <label className="text-xs uppercase font-extrabold text-zinc-400 flex items-center gap-1.5 mb-2">
                <Image size={15} className="text-[#1DB954]" />
                <span>Cover Art (File or URL)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverFileChange}
                className="text-xs text-zinc-400 mb-2 block file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#1DB954] file:text-black hover:file:bg-[#1ed760]"
              />
              <input
                type="text"
                placeholder="Or paste image URL (https://...)"
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
                <span>Audio MP3 (File or URL)</span>
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioFileChange}
                className="text-xs text-zinc-400 mb-2 block file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#1DB954] file:text-black hover:file:bg-[#1ed760]"
              />
              <input
                type="text"
                placeholder="Or paste MP3 URL (https://...)"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
              />
            </div>
          </div>

          {/* Timed Lyrics Editor */}
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

          <button
            type="submit"
            className="w-full py-3.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold rounded-xl transition-all shadow-xl text-sm mt-2"
          >
            Save Song & Sync Karaoke Lyrics
          </button>
        </form>
      </div>
    </div>
  );
}
