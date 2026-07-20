/**
 * Unified Resilient Music & Synced Lyrics Search Engine
 * Queries SoundCloud, iTunes, LrcLib Synced Lyrics, and Backend API with safe fallback handling
 */

import { API_BASE_URL } from '../config';

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

  const cleanQuery = searchQuery.trim();
  const results = [];
  const addedTrackIds = new Set();
  const addedTitles = new Set();

  // 1. Try LrcLib API for synced karaoke lyrics
  let lrcTracks = [];
  try {
    const lrcRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(cleanQuery)}`);
    if (lrcRes.ok) {
      const lrcData = await lrcRes.json();
      if (Array.isArray(lrcData)) lrcTracks = lrcData;
    }
  } catch(e) {}

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

  // 2. Try Backend API first if available
  try {
    const backendRes = await fetch(`${API_BASE_URL}/api/search/external?q=${encodeURIComponent(cleanQuery)}`);
    const contentType = backendRes.headers.get('content-type');
    if (backendRes.ok && contentType && contentType.includes('application/json')) {
      const data = await backendRes.json();
      if (data.success && Array.isArray(data.tracks) && data.tracks.length > 0) {
        for (const t of data.tracks) {
          if (t.title && t.audioUrl) {
            addedTrackIds.add(t.id);
            addedTitles.add(t.title.toLowerCase());
            results.push(t);
          }
        }
      }
    }
  } catch(e) {}

  // 3. SoundCloud Direct API Search
  const scClientId = 'emAJdGEj1mm9yjoCD2jkixmgqrGIyfpi';
  try {
    const scRes = await fetch(`https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(cleanQuery)}&client_id=${scClientId}&limit=15`);
    if (scRes.ok) {
      const scData = await scRes.json();
      if (scData && Array.isArray(scData.collection)) {
        for (const item of scData.collection) {
          const title = item.title || cleanQuery;
          if (addedTitles.has(title.toLowerCase())) continue;

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

          if (streamMp3Url) {
            const artist = item.user?.username || 'SoundCloud Artist';
            const { lyrics, hasSynced } = getLyricsForSong(title, artist);

            addedTitles.add(title.toLowerCase());
            results.push({
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
            });
          }
        }
      }
    }
  } catch(e) {}

  // 4. iTunes Search API (100% CORS-Enabled Fallback)
  try {
    const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&media=music&limit=15`);
    if (itunesRes.ok) {
      const itunesData = await itunesRes.json();
      if (itunesData && Array.isArray(itunesData.results)) {
        for (const item of itunesData.results) {
          const title = item.trackName || item.collectionName || cleanQuery;
          if (addedTitles.has(title.toLowerCase())) continue;

          const artist = item.artistName || 'Artist';
          const cover = item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : '';
          const { lyrics, hasSynced } = getLyricsForSong(title, artist);

          // Resolve SoundCloud MP3 stream for iTunes item
          let audioUrl = item.previewUrl;
          try {
            const scSearchRes = await fetch(`https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(artist + ' ' + title)}&client_id=${scClientId}&limit=1`);
            if (scSearchRes.ok) {
              const scSearchData = await scSearchRes.json();
              if (scSearchData.collection && scSearchData.collection.length > 0) {
                const scItem = scSearchData.collection[0];
                const progressive = scItem.media?.transcodings?.find(t => t.format?.protocol === 'progressive');
                if (progressive) {
                  const streamRes = await fetch(`${progressive.url}?client_id=${scClientId}`);
                  if (streamRes.ok) {
                    const streamData = await streamRes.json();
                    if (streamData.url) audioUrl = streamData.url;
                  }
                }
              }
            }
          } catch(e){}

          if (audioUrl) {
            addedTitles.add(title.toLowerCase());
            results.push({
              id: `ext-${item.trackId || Date.now()}-${Math.floor(Math.random() * 1000)}`,
              title,
              artist,
              album: item.collectionName || 'Single',
              cover,
              audioUrl,
              duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 210,
              genre: item.primaryGenreName || 'Pop',
              source: 'Music',
              lyrics,
              hasSynced
            });
          }
        }
      }
    }
  } catch(e) {}

  return results;
};
