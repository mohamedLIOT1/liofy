/**
 * Unified Resilient Music & Synced Lyrics Search Engine
 * Clean track titles, enforce full-length MP3 streams (>35s), and query Backend / SoundCloud / LrcLib
 */

import { API_BASE_URL } from '../config';

const cleanSongTitle = (title) => {
  if (!title) return '';
  return title
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/ft\..*$/i, '')
    .replace(/feat\..*$/i, '')
    .replace(/official audio/i, '')
    .replace(/official video/i, '')
    .trim();
};

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

export const searchMusicOnline = async (searchQuery) => {
  if (!searchQuery || !searchQuery.trim()) return [];

  const rawQuery = searchQuery.trim();
  const cleanQ = cleanSongTitle(rawQuery);
  const scClientId = 'emAJdGEj1mm9yjoCD2jkixmgqrGIyfpi';

  // 1. Try Backend API first (< 800ms response)
  try {
    const backendRes = await fetch(`${API_BASE_URL}/api/search/external?q=${encodeURIComponent(cleanQ)}`);
    const contentType = backendRes.headers.get('content-type');
    if (backendRes.ok && contentType && contentType.includes('application/json')) {
      const data = await backendRes.json();
      if (data.success && Array.isArray(data.tracks) && data.tracks.length > 0) {
        const validTracks = data.tracks.filter(t => t.title && t.audioUrl);
        if (validTracks.length > 0) {
          return validTracks;
        }
      }
    }
  } catch(e) {}

  // 2. Client Fallback: Fetch LrcLib lyrics & iTunes search in Parallel
  let lrcTracks = [];
  try {
    const lrcRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(cleanQ)}`);
    if (lrcRes.ok) {
      const lrcData = await lrcRes.json();
      if (Array.isArray(lrcData)) lrcTracks = lrcData;
    }
  } catch(e) {}

  const getLyricsForSong = (songTitle, artistName) => {
    const cleanT = cleanSongTitle(songTitle);
    let matchedLrc = Array.isArray(lrcTracks) ? lrcTracks.find((l) =>
      l.trackName && cleanT &&
      (l.trackName.toLowerCase().includes(cleanT.toLowerCase()) ||
       cleanT.toLowerCase().includes(l.trackName.toLowerCase()))
    ) : null;

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

  // 3. Client Direct SoundCloud Search with Promise.all
  try {
    const scRes = await fetch(`https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(cleanQ)}&client_id=${scClientId}&limit=15`);
    if (scRes.ok) {
      const scData = await scRes.json();
      if (scData && Array.isArray(scData.collection)) {
        const collection = scData.collection.filter(item => Math.round((item.duration || 0) / 1000) > 35);
        const resolved = await Promise.all(
          collection.map(async (item) => {
            const progressive = item.media?.transcodings?.find(t => t.format?.protocol === 'progressive');
            let streamMp3Url = null;
            if (progressive) {
              try {
                const streamRes = await fetch(`${progressive.url}?client_id=${scClientId}`);
                if (streamRes.ok) {
                  const streamData = await streamRes.json();
                  streamMp3Url = streamData.url;
                }
              } catch(e){}
            }
            if (!streamMp3Url) return null;

            const title = item.title || cleanQ;
            const artist = item.user?.username || 'SoundCloud Artist';
            const { lyrics, hasSynced } = getLyricsForSong(title, artist);

            return {
              id: `sc-${item.id}`,
              title,
              artist,
              album: 'SoundCloud',
              cover: item.artwork_url ? item.artwork_url.replace('-large', '-t500x500') : (item.user?.avatar_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600'),
              audioUrl: streamMp3Url,
              duration: Math.round((item.duration || 180000) / 1000),
              genre: 'SoundCloud',
              source: 'SoundCloud',
              lyrics,
              hasSynced
            };
          })
        );
        const valid = resolved.filter(Boolean);
        if (valid.length > 0) return valid;
      }
    }
  } catch(e) {}

  // 4. Client Fallback: Ensure only full length tracks are returned
  return [];
};
