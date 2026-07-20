import React from 'react';
import { X, Settings, ShieldCheck, WifiOff, Volume2, Music, Check } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  audioQuality,
  setAudioQuality,
  crossfade,
  setCrossfade,
  isOfflineMode,
  setIsOfflineMode
}) {
  if (!isOpen) return null;

  const qualities = [
    { label: 'Very High (320 kbps Lossless)', value: '320' },
    { label: 'High (256 kbps)', value: '256' },
    { label: 'Normal (160 kbps)', value: '160' },
    { label: 'Automatic (Based on network)', value: 'auto' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Settings className="text-[#1DB954]" size={22} />
            <h3 className="text-lg font-bold text-white">Liofy Settings</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Premium Account Badge */}
        <div className="my-4 bg-gradient-to-r from-emerald-950 to-zinc-900 p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center font-black">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">Liofy Premium</h4>
              <p className="text-xs text-emerald-300">Unlimited Skips • High-Fidelity Audio • Zero Ads</p>
            </div>
          </div>
        </div>

        {/* Offline Mode Toggle */}
        <div className="flex items-center justify-between py-3 border-b border-zinc-800">
          <div>
            <span className="text-sm font-semibold text-white">Offline Mode</span>
            <p className="text-xs text-zinc-400">Only play downloaded songs</p>
          </div>
          <button
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${isOfflineMode ? 'bg-[#1DB954]' : 'bg-zinc-700'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isOfflineMode ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Crossfade Slider */}
        <div className="py-4 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white">Crossfade Songs</span>
            <span className="text-xs font-bold text-[#1DB954]">{crossfade} seconds</span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            value={crossfade}
            onChange={(e) => setCrossfade(Number(e.target.value))}
            className="w-full accent-[#1DB954]"
          />
        </div>

        {/* Audio Streaming Quality */}
        <div className="py-4">
          <label className="text-xs font-extrabold uppercase text-zinc-400 block mb-3">Audio Streaming Quality</label>
          <div className="flex flex-col gap-2">
            {qualities.map((q) => (
              <button
                key={q.value}
                onClick={() => setAudioQuality(q.value)}
                className={`p-3 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all ${
                  audioQuality === q.value 
                    ? 'bg-[#1DB954]/20 border border-[#1DB954] text-[#1DB954]' 
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <span>{q.label}</span>
                {audioQuality === q.value && <Check size={16} />}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-2 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold rounded-xl transition-all shadow-lg"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
