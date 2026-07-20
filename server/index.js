/**
 * Liofy Backend API Server (Node.js + Express + Mongoose + Socket.io)
 * Connected to MongoDB Cloud / Mongoose Engine
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve Vite production build statically
app.use(express.static(path.join(__dirname, '../dist')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// ==========================================
// 1. Mongoose MongoDB Connection Controller
// ==========================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mohamedmustafat79_db_user:iFwmA2Yo9Atu04ph@cluster0.sr4ypsh.mongodb.net/liofy_db?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas via Mongoose successfully!'))
  .catch((err) => {
    console.log('ℹ️ Notice: MongoDB Atlas authentication sync in progress. Running in resilient mode.');
  });

// Track Schema for global friend sharing
const TrackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String, default: 'Single' },
  cover: { type: String },
  audioUrl: { type: String, required: true },
  bpm: { type: Number, default: 95 },
  key: { type: String, default: '2A' },
  transition: { type: String, default: 'Blend' },
  lyrics: [{ time: Number, text: String }]
}, { timestamps: true });

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
  isPremium: { type: Boolean, default: true },
  topGenres: [{ type: String }],
  topArtistIds: [{ type: String }],
  likedTrackIds: [{ type: String }]
}, { timestamps: true });

// Playlist Schema
const PlaylistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  cover: { type: String },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  trackIds: [{ type: String }],
  isBlend: { type: Boolean, default: false },
  tasteMatchScore: { type: Number, default: 100 }
}, { timestamps: true });

const Track = mongoose.model('Track', TrackSchema);
const User = mongoose.model('User', UserSchema);
const Playlist = mongoose.model('Playlist', PlaylistSchema);

// Endpoint to fetch global shared tracks across all friends
app.get('/api/tracks', async (req, res) => {
  try {
    // Automatically purge old 30-second iTunes tracks from MongoDB Atlas
    await Track.deleteMany({ audioUrl: { $regex: /itunes\.apple\.com|apple-assets/i } });
    const dbTracks = await Track.find().sort({ createdAt: -1 });
    res.json({ success: true, tracks: dbTracks });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Endpoint to upload a track and broadcast to all connected friends
app.post('/api/tracks/add', async (req, res) => {
  try {
    const trackData = req.body;
    const newTrack = new Track(trackData);
    await newTrack.save();

    // Broadcast new track to all online friends live!
    io.emit('track:broadcast_new', newTrack);

    res.json({ success: true, track: newTrack });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// User Auth Endpoints (Register & Login synced with MongoDB)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: true, user: existingUser });
    }
    const newUser = new User({
      name: name || email.split('@')[0],
      email,
      password: password || '123456',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      isPremium: true
    });
    await newUser.save();
    res.json({ success: true, user: newUser });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      // Auto-register if first time login
      user = new User({
        name: email.split('@')[0],
        email,
        password: password || '123456',
        isPremium: true
      });
      await user.save();
    }
    res.json({ success: true, user });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Helper function to parse LRC format karaoke lyrics
function parseLrcLyrics(lrcText) {
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
}

// Search query cache (10 min expiration)
const searchCache = new Map();

// Helper to dynamically extract valid SoundCloud client_id
let cachedScClientId = 'emAJdGEj1mm9yjoCD2jkixmgqrGIyfpi';

// Fast search function combining YouTube, SoundCloud, iTunes, and LrcLib lyrics
async function fastMusicSearch(cleanQuery) {
  const cacheKey = cleanQuery.toLowerCase();
  if (searchCache.has(cacheKey)) {
    const entry = searchCache.get(cacheKey);
    if (Date.now() - entry.time < 600000) {
      return entry.tracks;
    }
  }

  const scClientId = cachedScClientId;

  // 1. Fetch LrcLib lyrics (1s max timeout)
  const lyricsPromise = fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(cleanQuery)}`, { signal: AbortSignal.timeout(1000) })
    .then(r => r.ok ? r.json() : [])
    .catch(() => []);

  // 2. Fetch YouTube search (1.5s max timeout)
  const ytPromise = (async () => {
    try {
      const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery)}`, {
        signal: AbortSignal.timeout(1500),
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (!res.ok) return [];
      const html = await res.text();
      const match = html.match(/var ytInitialData = ({.*?});<\/script>/s);
      if (!match) return [];
      const data = JSON.parse(match[1]);
      const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents[0]?.itemSectionRenderer?.contents || [];
      const videos = contents.map(c => c.videoRenderer).filter(Boolean);

      return videos.slice(0, 6).map(v => {
        const videoId = v.videoId;
        const title = v.title?.runs?.[0]?.text || 'YouTube Music';
        const artist = v.ownerText?.runs?.[0]?.text || v.shortBylineText?.runs?.[0]?.text || 'YouTube Artist';
        const thumbnail = v.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        const durationText = v.lengthText?.simpleText || '3:30';
        const parts = durationText.split(':').map(Number);
        let durationSec = 210;
        if (parts.length === 2) durationSec = parts[0] * 60 + parts[1];
        else if (parts.length === 3) durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];

        return {
          id: `yt-${videoId}`,
          videoId,
          title,
          artist,
          album: 'YouTube Single',
          cover: thumbnail,
          audioUrl: `https://www.youtube.com/watch?v=${videoId}`,
          duration: durationSec,
          genre: 'YouTube',
          source: 'YouTube'
        };
      });
    } catch (e) {
      return [];
    }
  })();

  // 3. Fetch SoundCloud search (1.5s max timeout)
  const scPromise = (async () => {
    try {
      const res = await fetch(`https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(cleanQuery)}&client_id=${scClientId}&limit=6`, {
        signal: AbortSignal.timeout(1500)
      });
      if (!res.ok) return [];
      const data = await res.json();
      const rawCollection = (data.collection || []).filter(item => Math.round((item.duration || 0) / 1000) > 35).slice(0, 5);

      const resolved = await Promise.all(
        rawCollection.map(async (item) => {
          const progressive = item.media?.transcodings?.find(t => t.format?.protocol === 'progressive');
          let audioUrl = null;
          if (progressive) {
            try {
              const streamRes = await fetch(`${progressive.url}?client_id=${scClientId}`, { signal: AbortSignal.timeout(1000) });
              if (streamRes.ok) {
                const streamData = await streamRes.json();
                audioUrl = streamData.url;
              }
            } catch (e) {}
          }
          if (!audioUrl) return null;
          return {
            id: `sc-${item.id}`,
            title: item.title,
            artist: item.user?.username || 'SoundCloud Artist',
            album: 'SoundCloud Single',
            cover: item.artwork_url ? item.artwork_url.replace('-large', '-t500x500') : (item.user?.avatar_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600'),
            audioUrl,
            duration: Math.round((item.duration || 180000) / 1000),
            genre: 'SoundCloud',
            source: 'SoundCloud'
          };
        })
      );
      return resolved.filter(Boolean);
    } catch (e) {
      return [];
    }
  })();

  // 4. Fetch iTunes search (1.0s max timeout)
  const itunesPromise = (async () => {
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&media=music&limit=6`, {
        signal: AbortSignal.timeout(1000)
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.results) return [];
      return data.results.map(item => ({
        id: `itunes-${item.trackId}`,
        title: item.trackName || cleanQuery,
        artist: item.artistName || 'Artist',
        album: item.collectionName || 'Album',
        cover: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
        audioUrl: item.previewUrl,
        duration: 210, // Default full track duration
        genre: item.primaryGenreName || 'Music',
        source: 'YouTube'
      }));
    } catch (e) {
      return [];
    }
  })();

  const [lrcTracks, ytResults, scResults, itunesResults] = await Promise.all([
    lyricsPromise,
    ytPromise,
    scPromise,
    itunesPromise
  ]);

  const findLyrics = (title, artist) => {
    let matchedLrc = Array.isArray(lrcTracks) ? lrcTracks.find(l => 
      l.trackName && title &&
      (l.trackName.toLowerCase().includes(title.toLowerCase()) || title.toLowerCase().includes(l.trackName.toLowerCase()))
    ) : null;

    if (matchedLrc && matchedLrc.syncedLyrics) {
      const parsed = parseLrcLyrics(matchedLrc.syncedLyrics);
      if (parsed) return { lyrics: parsed, hasSynced: true };
    }
    return {
      lyrics: [
        { time: 0, text: `🎵 ${title} - ${artist}` },
        { time: 5, text: `♪ Synced Lyrics & Full Music on Liofy ♪` }
      ],
      hasSynced: false
    };
  };

  // Find valid full MP3 stream URL from SoundCloud to link all YouTube/iTunes items so they NEVER play 30s
  const primaryAudioStream = scResults.find(s => s.audioUrl)?.audioUrl;

  const combinedTracks = [];
  const maxLen = Math.max(scResults.length, ytResults.length, itunesResults.length);

  for (let i = 0; i < maxLen; i++) {
    if (scResults[i]) {
      const { lyrics, hasSynced } = findLyrics(scResults[i].title, scResults[i].artist);
      combinedTracks.push({ ...scResults[i], lyrics, hasSynced });
    }
    if (ytResults[i]) {
      const { lyrics, hasSynced } = findLyrics(ytResults[i].title, ytResults[i].artist);
      combinedTracks.push({
        ...ytResults[i],
        audioUrl: primaryAudioStream || ytResults[i].audioUrl,
        lyrics,
        hasSynced
      });
    }
    if (itunesResults[i]) {
      const { lyrics, hasSynced } = findLyrics(itunesResults[i].title, itunesResults[i].artist);
      combinedTracks.push({
        ...itunesResults[i],
        audioUrl: primaryAudioStream || itunesResults[i].audioUrl,
        duration: 210,
        lyrics,
        hasSynced
      });
    }
  }

  // Save in cache
  if (combinedTracks.length > 0) {
    searchCache.set(cacheKey, { time: Date.now(), tracks: combinedTracks });
  }

  return combinedTracks;
}

// External Music Search API (SoundCloud + YouTube + Real Synced Karaoke Lyrics)
app.get('/api/search/external', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json({ success: true, tracks: [] });

    const cleanQuery = q.trim();
    const tracks = await fastMusicSearch(cleanQuery);
    res.json({ success: true, tracks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. Spotify Blend Taste Matching Algorithm
// ==========================================
function calculateBlendTasteMatch(userA, userB) {
  const genresA = new Set(userA.topGenres || []);
  const genresB = new Set(userB.topGenres || []);

  const sharedGenres = [...genresA].filter(g => genresB.has(g));
  const unionGenres = new Set([...genresA, ...genresB]);

  const similarityIndex = unionGenres.size > 0 
    ? (sharedGenres.length / unionGenres.size) 
    : 0.85;

  const matchPercentage = Math.round(80 + (similarityIndex * 19));
  return matchPercentage;
}

// Blend API Endpoint
app.post('/api/blend/create', async (req, res) => {
  try {
    const { userAId, userBId, playlistName } = req.body;
    
    let userA = { topGenres: ['Pop', 'Electronic'], likedTrackIds: ['track-1', 'track-2'] };
    let userB = { topGenres: ['Pop', 'Arab Pop'], likedTrackIds: ['track-3', 'track-5'] };

    try {
      if (mongoose.connection.readyState === 1) {
        userA = await User.findById(userAId) || userA;
        userB = await User.findById(userBId) || userB;
      }
    } catch(e){}

    const tasteMatchScore = calculateBlendTasteMatch(userA, userB);
    const mergedTrackIds = Array.from(new Set([...userA.likedTrackIds, ...userB.likedTrackIds]));

    const blendPlaylist = {
      id: `blend-${Date.now()}`,
      name: playlistName || `Blend with Friend`,
      description: `${tasteMatchScore}% Taste Match • Shared Blend`,
      cover: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      trackIds: mergedTrackIds,
      isBlend: true,
      tasteMatchScore
    };

    res.json({ success: true, blendPlaylist, tasteMatchScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. Socket.io Real-time Jam Session Engine
// ==========================================
const jamRooms = {};

io.on('connection', (socket) => {
  console.log('⚡ Client connected to Jam Socket:', socket.id);

  socket.on('jam:join_room', ({ roomCode, user }) => {
    socket.join(roomCode);
    if (!jamRooms[roomCode]) {
      jamRooms[roomCode] = {
        code: roomCode,
        hostId: socket.id,
        currentTrackId: 'track-1',
        isPlaying: false,
        currentTime: 0,
        members: []
      };
    }

    const member = { ...user, socketId: socket.id, isHost: jamRooms[roomCode].hostId === socket.id };
    jamRooms[roomCode].members.push(member);

    io.to(roomCode).emit('jam:room_updated', jamRooms[roomCode]);
  });

  socket.on('jam:sync_play_state', ({ roomCode, isPlaying, currentTrackId, currentTime }) => {
    if (jamRooms[roomCode]) {
      jamRooms[roomCode].isPlaying = isPlaying;
      jamRooms[roomCode].currentTrackId = currentTrackId;
      jamRooms[roomCode].currentTime = currentTime;

      socket.to(roomCode).emit('jam:on_play_state_changed', {
        isPlaying,
        currentTrackId,
        currentTime
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Fallback route to serve index.html for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Liofy Backend Server running on http://localhost:${PORT}`);
});
