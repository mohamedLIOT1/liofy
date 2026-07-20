import React from 'react';
import { X, QrCode, Share2, Camera } from 'lucide-react';

export default function SpotifyCodeModal({ isOpen, onClose, currentTrack }) {
  if (!isOpen || !currentTrack) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900">
          <X size={20} />
        </button>

        <img src={currentTrack.cover} alt={currentTrack.title} className="w-40 h-40 rounded-2xl object-cover shadow-2xl mb-4 border border-white/10" />

        <h3 className="text-xl font-extrabold text-white truncate max-w-full">{currentTrack.title}</h3>
        <p className="text-sm font-medium text-zinc-400 mb-6">{currentTrack.artist}</p>

        {/* Spotify Soundwave Barcode Graphic */}
        <div className="w-full bg-[#1DB954] p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg mb-6">
          <div className="flex items-center gap-1.5 h-12 w-full justify-center">
            <div className="w-1.5 h-8 bg-black rounded-full"></div>
            <div className="w-1.5 h-12 bg-black rounded-full"></div>
            <div className="w-1.5 h-5 bg-black rounded-full"></div>
            <div className="w-1.5 h-10 bg-black rounded-full"></div>
            <div className="w-1.5 h-6 bg-black rounded-full"></div>
            <div className="w-1.5 h-11 bg-black rounded-full"></div>
            <div className="w-1.5 h-7 bg-black rounded-full"></div>
            <div className="w-1.5 h-12 bg-black rounded-full"></div>
            <div className="w-1.5 h-4 bg-black rounded-full"></div>
            <div className="w-1.5 h-9 bg-black rounded-full"></div>
            <div className="w-1.5 h-6 bg-black rounded-full"></div>
            <div className="w-1.5 h-10 bg-black rounded-full"></div>
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-black">Spotify Sound Code</span>
        </div>

        <div className="flex items-center gap-3 w-full">
          <button 
            onClick={() => alert('Camera scanner activated! Point your camera at a Spotify code.')}
            className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
          >
            <Camera size={16} />
            <span>Scan Code</span>
          </button>

          <button 
            onClick={() => alert(`Saved Spotify Code image for ${currentTrack.title}`)}
            className="flex-1 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <Share2 size={16} />
            <span>Save Code</span>
          </button>
        </div>
      </div>
    </div>
  );
}
