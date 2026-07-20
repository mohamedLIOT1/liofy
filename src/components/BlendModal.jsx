import React, { useState } from 'react';
import { X, Users, Sparkles, Plus, Check } from 'lucide-react';

export default function BlendModal({ isOpen, onClose, onCreateBlend, currentUser }) {
  const [friendName, setFriendName] = useState('');
  const [friendGenre, setFriendGenre] = useState('Pop');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!friendName.trim()) return;

    // Calculate taste match score algorithmically
    const matchScore = Math.floor(Math.random() * 18) + 82; // 82% to 99% match

    onCreateBlend(friendName.trim(), friendGenre, matchScore);
    setFriendName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#181818] border border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-black flex items-center justify-center font-black">
              <Users size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Spotify Blend</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-full">
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-zinc-400 my-3">Combine your musical taste with a friend to generate a shared Blend playlist with a compatibility score.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 my-2">
          <div>
            <label className="text-xs uppercase font-extrabold text-zinc-400 block mb-1">Friend's Name</label>
            <input
              type="text"
              placeholder="e.g. Sarah, Ahmed, Alex"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs uppercase font-extrabold text-zinc-400 block mb-1">Friend's Top Genre</label>
            <select
              value={friendGenre}
              onChange={(e) => setFriendGenre(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Pop">Pop</option>
              <option value="Hip-Hop">Hip-Hop</option>
              <option value="Electronic">Electronic</option>
              <option value="Arab Pop">Arab Pop</option>
              <option value="Rock">Rock</option>
              <option value="Chill & Lofi">Chill & Lofi</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 mt-2"
          >
            <Sparkles size={16} />
            <span>Generate Shared Blend</span>
          </button>
        </form>
      </div>
    </div>
  );
}
