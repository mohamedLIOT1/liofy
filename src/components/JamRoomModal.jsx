import React, { useState } from 'react';
import { X, Radio, Users, Copy, Check, Play, Pause, Volume2, Shield } from 'lucide-react';

export default function JamRoomModal({ 
  isOpen, 
  onClose, 
  jamSession, 
  onStartJam, 
  onJoinJam, 
  onLeaveJam,
  currentTrack,
  isPlaying 
}) {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (jamSession) {
      navigator.clipboard.writeText(jamSession.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#181818] border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-cyan-500 text-black flex items-center justify-center font-black">
              <Radio size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Spotify Jam Room</h3>
              <p className="text-xs text-zinc-400">Listen together with friends in real-time</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-full">
            <X size={20} />
          </button>
        </div>

        {jamSession ? (
          <div className="py-6 flex flex-col gap-6">
            {/* Active Jam Room Banner */}
            <div className="bg-gradient-to-r from-cyan-950 via-zinc-900 to-black p-5 rounded-2xl border border-cyan-500/40 text-center">
              <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400">Active Jam Session</span>
              <h2 className="text-3xl font-black text-white mt-1 tracking-wider">{jamSession.code}</h2>
              <p className="text-xs text-zinc-400 mt-1">Share this room code with your friends to listen together</p>

              <button
                onClick={handleCopyCode}
                className="mt-3 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-cyan-300 rounded-full font-bold text-xs inline-flex items-center gap-2 transition-colors border border-cyan-500/30"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Code Copied!' : 'Copy Room Code'}</span>
              </button>
            </div>

            {/* Currently Synced Track */}
            {currentTrack && (
              <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                <img src={currentTrack.cover} alt={currentTrack.title} className="w-12 h-12 rounded-xl object-cover" />
                <div className="truncate flex-1">
                  <span className="text-[10px] uppercase font-bold text-[#1DB954]">Synced Track</span>
                  <h4 className="font-bold text-sm text-white truncate">{currentTrack.title}</h4>
                  <p className="text-xs text-zinc-400 truncate">{currentTrack.artist}</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-[#1DB954] animate-ping mr-2" />
              </div>
            )}

            {/* Active Members */}
            <div>
              <h4 className="text-xs font-bold uppercase text-zinc-400 mb-2 flex items-center gap-1.5">
                <Users size={14} />
                <span>Listeners in Room ({jamSession.members.length})</span>
              </h4>
              <div className="flex flex-col gap-2">
                {jamSession.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs">
                    <div className="flex items-center gap-2.5">
                      <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover" />
                      <span className="font-bold text-white">{m.name}</span>
                    </div>
                    {m.isHost && (
                      <span className="text-[10px] font-black text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/40">
                        Host
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                onLeaveJam();
                onClose();
              }}
              className="w-full py-3 bg-red-600/20 hover:bg-red-600/40 text-red-400 font-extrabold text-xs rounded-xl border border-red-500/30 transition-colors"
            >
              End / Leave Jam Room
            </button>
          </div>
        ) : (
          <div className="py-6 flex flex-col gap-6">
            {/* Host a New Jam */}
            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
              <h4 className="font-extrabold text-white text-base">Host a Jam Room</h4>
              <p className="text-xs text-zinc-400 mt-1 mb-4">Start a live sync room and invite your friends to control music together.</p>
              <button
                onClick={() => {
                  onStartJam();
                }}
                className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Radio size={16} />
                <span>Create Jam Room</span>
              </button>
            </div>

            {/* Join an Existing Room */}
            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
              <h4 className="font-extrabold text-white text-base">Join Friend's Jam</h4>
              <p className="text-xs text-zinc-400 mt-1 mb-3">Enter the room code shared by your friend.</p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. JAM-8821"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white uppercase tracking-wider font-mono focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => {
                    if (inputCode.trim()) {
                      onJoinJam(inputCode.trim());
                      setInputCode('');
                    }
                  }}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-xs rounded-xl border border-zinc-700"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
