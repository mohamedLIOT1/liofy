import React, { useState } from 'react';
import { Mic2, Play, Pause, Clock, RotateCcw, RotateCw } from 'lucide-react';
import { PODCASTS } from '../data/musicData';

export default function PodcastsScreen({ onPlayEpisode }) {
  const [selectedPodcast, setSelectedPodcast] = useState(PODCASTS[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x');

  const speedOptions = ['0.8x', '1.0x', '1.2x', '1.5x', '2.0x'];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
          <Mic2 size={20} />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Podcasts & Shows</h1>
      </div>

      {/* Speed Controller Bar */}
      <div className="flex items-center gap-3 bg-zinc-900 p-3 rounded-2xl mb-8 border border-zinc-800">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Speed:</span>
        {speedOptions.map((s) => (
          <button
            key={s}
            onClick={() => setPlaybackSpeed(s)}
            className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all ${
              playbackSpeed === s ? 'bg-[#1DB954] text-black shadow-md' : 'bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Podcast Shows Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {PODCASTS.map((pod) => (
          <div
            key={pod.id}
            onClick={() => setSelectedPodcast(pod)}
            className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center gap-4 ${
              selectedPodcast.id === pod.id 
                ? 'bg-zinc-800 border-[#1DB954]' 
                : 'bg-[#181818] border-zinc-800 hover:bg-zinc-800/60'
            }`}
          >
            <img src={pod.cover} alt={pod.title} className="w-20 h-20 rounded-xl object-cover shadow-lg" />
            <div>
              <h3 className="font-extrabold text-base text-white">{pod.title}</h3>
              <p className="text-xs text-zinc-400 font-medium mt-1">{pod.author}</p>
              <span className="text-[11px] text-[#1DB954] font-bold mt-2 block">{pod.episodesCount} episodes available</span>
            </div>
          </div>
        ))}
      </div>

      {/* Episodes List */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Latest Episodes from {selectedPodcast.title}</h2>
        <div className="flex flex-col gap-3">
          {selectedPodcast.episodes.map((ep) => (
            <div
              key={ep.id}
              className="bg-[#181818] p-4 rounded-2xl border border-zinc-800/80 hover:bg-zinc-900 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-[#1DB954] uppercase tracking-wider">{ep.date}</span>
                  <h4 className="text-base font-bold text-white mt-1">{ep.title}</h4>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{ep.description}</p>
                </div>
                <button
                  onClick={() => onPlayEpisode(ep, selectedPodcast)}
                  className="w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform shadow-xl"
                >
                  <Play size={22} fill="black" className="ml-0.5" />
                </button>
              </div>

              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-zinc-800 text-xs text-zinc-400">
                <span className="flex items-center gap-1 font-semibold">
                  <Clock size={14} /> {ep.duration}
                </span>
                <span className="bg-zinc-800 px-2.5 py-0.5 rounded-full font-bold text-white">{playbackSpeed}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
