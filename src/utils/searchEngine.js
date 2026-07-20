/**
 * Clean track title by removing extra info in parentheses or brackets
 * e.g. "3alam Kadaba (From The TV Series...)" -> "3alam Kadaba"
 */
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
  const results = [];
  const addedTitles = new Set();

  const scClientId = 'emAJdGEj1mm9yjoCD2jkixmgqrGIyfpi';

  // Helper to fetch SoundCloud full MP3 stream for artist & title
  const fetchSCFullMp3 = async (artist, title) => {
    try {
      const cleanedT = cleanSongTitle(title);
      const q = `${artist} ${cleanedT}`.trim();
      const res = await fetch(`https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(q)}&client_id=${scClientId}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.collection)) {
          for (const item of data.collection) {
            const durationSec = Math.round((item.duration || 0) / 1000);
            if (durationSec <= 35) continue; // Skip 30s clips on SoundCloud too

            const progressive = item.media?.transcodings?.find(t => t.format?.protocol === 'progressive');
            if (progressive) {
              const streamRes = await fetch(`${progressive.url}?client_id=${scClientId}`);
              if (streamRes.ok) {
                const streamData = await streamRes.json();
                if (streamData.url) {
                  return {
                    url: streamData.url,
                    duration: durationSec,
                    cover: item.artwork_url ? item.artwork_url.replace('-large', '-t500x500') : (item.user?.avatar_url || '')
                  };
                }
              }
            }
          }
        }
      }
    } catch(e){}
    return null;
  };

  // 1. Fetch Synced Lyrics from LrcLib
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
    let matchedLrc = lrcTracks.find((l) =>
      l.trackName && cleanT &&
      (l.trackName.toLowerCase().includes(cleanT.toLowerCase()) ||
       cleanT.toLowerCase().includes(l.trackName.toLowerCase()))
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
    const backendRes = await fetch(`${API_BASE_URL}/api/search/external?q=${encodeURIComponent(cleanQ)}`);
    const contentType = backendRes.headers.get('content-type');
    if (backendRes.ok && contentType && contentType.includes('application/json')) {
      const data = await backendRes.json();
      if (data.success && Array.isArray(data.tracks) && data.tracks.length > 0) {
        for (const t of data.tracks) {
          const is30s = !t.audioUrl || t.audioUrl.includes('itunes.apple.com') || t.audioUrl.includes('apple-assets') || (t.duration && t.duration <= 35);
          if (t.title && !is30s) {
            addedTitles.add(cleanSongTitle(t.title).toLowerCase());
            results.push(t);
          }
        }
      }
    }
  } catch(e) {}

  // 3. Direct SoundCloud API Search (Strictly Full Tracks > 35s)
  try {
    const scRes = await fetch(`https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(cleanQ)}&client_id=${scClientId}&limit=15`);
    if (scRes.ok) {
      const scData = await scRes.json();
      if (scData && Array.isArray(scData.collection)) {
        for (const item of scData.collection) {
          const durationSec = Math.round((item.duration || 0) / 1000);
          if (durationSec <= 35) continue; // Skip 30s preview tracks

          const title = item.title || cleanQ;
          const cleanTitleKey = cleanSongTitle(title).toLowerCase();
          if (addedTitles.has(cleanTitleKey)) continue;

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

            addedTitles.add(cleanTitleKey);
            results.push({
              id: `sc-${item.id}`,
              title,
              artist,
              album: 'SoundCloud',
              cover: item.artwork_url ? item.artwork_url.replace('-large', '-t500x500') : (item.user?.avatar_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600'),
              audioUrl: streamMp3Url,
              duration: durationSec,
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

  // 4. iTunes Metadata + SoundCloud Stream Matcher (Never output 30s iTunes url!)
  try {
    const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQ)}&media=music&limit=15`);
    if (itunesRes.ok) {
      const itunesData = await itunesRes.json();
      if (itunesData && Array.isArray(itunesData.results)) {
        for (const item of itunesData.results) {
          const rawTitle = item.trackName || item.collectionName || cleanQ;
          const cleanTitleKey = cleanSongTitle(rawTitle).toLowerCase();
          if (addedTitles.has(cleanTitleKey)) continue;

          const artist = item.artistName || 'Artist';
          const cover = item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : '';
          const { lyrics, hasSynced } = getLyricsForSong(rawTitle, artist);

          // Resolve full length MP3 stream from SoundCloud using clean title
          const scMatch = await fetchSCFullMp3(artist, rawTitle);
          if (scMatch && scMatch.url) {
            addedTitles.add(cleanTitleKey);
            results.push({
              id: `ext-${item.trackId || Date.now()}-${Math.floor(Math.random() * 1000)}`,
              title: rawTitle,
              artist,
              album: item.collectionName || 'Single',
              cover: scMatch.cover || cover,
              audioUrl: scMatch.url,
              duration: scMatch.duration || Math.round((item.trackTimeMillis || 210000) / 1000),
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
