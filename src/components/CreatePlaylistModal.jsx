import React, { useState } from 'react';
import { X, Plus, Music } from 'lucide-react';

export default function CreatePlaylistModal({ isOpen, onClose, onCreatePlaylist }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreatePlaylist(title.trim(), description.trim());
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Plus className="text-[#1DB954]" size={22} />
            <h3 className="text-lg font-bold text-white">Create Playlist</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 my-4">
          <div>
            <label className="text-xs uppercase font-bold text-zinc-400 block mb-1">Playlist Title</label>
            <input
              type="text"
              placeholder="e.g. My Favorite Chill Mix"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
            />
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-zinc-400 block mb-1">Description (Optional)</label>
            <textarea
              placeholder="Give your playlist a cool description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954] resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold rounded-xl transition-all shadow-lg mt-2"
          >
            Create Playlist
          </button>
        </form>
      </div>
    </div>
  );
}
