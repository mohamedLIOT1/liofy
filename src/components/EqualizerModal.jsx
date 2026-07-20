import React from 'react';
import { X, Sliders, Check, Volume2 } from 'lucide-react';

export default function EqualizerModal({ 
  isOpen, 
  onClose, 
  enabled, 
  setEnabled, 
  preset, 
  applyPreset, 
  bands, 
  setBands 
}) {
  if (!isOpen) return null;

  const presets = ['Flat', 'Bass Booster', 'Vocal Booster', 'Electronic', 'Rock', 'Acoustic'];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#181818] border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sliders className="text-[#1DB954]" size={22} />
            <h3 className="text-lg font-bold text-white">Audio Equalizer</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Enable Equalizer Toggle Switch */}
        <div className="flex items-center justify-between my-4 bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800">
          <div>
            <span className="text-sm font-bold text-zinc-100">Enable Equalizer</span>
            <p className="text-[11px] text-zinc-400">Real-time WebAudio Frequency Processing</p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${enabled ? 'bg-[#1DB954]' : 'bg-zinc-700'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Preset Profiles Grid */}
        <div className="mb-6">
          <label className="text-[11px] uppercase font-extrabold tracking-wider text-zinc-400 block mb-2">Preset Profiles</label>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => applyPreset(p)}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                  preset === p 
                    ? 'bg-[#1DB954]/20 border-[#1DB954] text-[#1DB954] shadow-md' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <span>{p}</span>
                {preset === p && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* 5-Band Vertical Frequency Controls */}
        <div className="bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 mb-6">
          <div className="flex justify-between items-end gap-2 h-44">
            {Object.entries(bands).map(([freq, val]) => (
              <div key={freq} className="flex flex-col items-center justify-between h-full flex-1">
                {/* dB Display */}
                <span className="text-[11px] font-extrabold text-[#1DB954]">
                  {val > 0 ? `+${val}` : val}dB
                </span>

                {/* Vertical Slider Track Container */}
                <div className="relative w-6 flex-1 flex items-center justify-center my-2">
                  <div className="w-1.5 h-full bg-zinc-800 rounded-full overflow-hidden absolute inset-0 mx-auto">
                    <div 
                      className="w-full bg-[#1DB954] transition-all"
                      style={{ height: `${((val + 10) / 20) * 100}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="1"
                    value={val}
                    disabled={!enabled}
                    onChange={(e) => {
                      const newVal = Number(e.target.value);
                      setBands({ ...bands, [freq]: newVal });
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {/* Frequency Label */}
                <span className="text-[10px] text-zinc-400 font-extrabold">{freq}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold rounded-xl transition-all shadow-xl text-sm"
        >
          Save & Apply Equalizer
        </button>
      </div>
    </div>
  );
}
