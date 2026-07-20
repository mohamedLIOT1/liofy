import React, { useState } from 'react';
import { X, User, Lock, Mail, ShieldCheck, LogIn, UserPlus } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, currentUser, onLogin, onLogout }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    const userData = {
      id: `user-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80`,
      isPremium: true,
      tasteProfile: ['Pop', 'Electronic', 'Arab Pop']
    };

    onLogin(userData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#181818] border border-zinc-800 rounded-3xl max-w-sm w-full p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#1DB954] text-black flex items-center justify-center font-black">
              <User size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">{currentUser ? 'Your Profile' : (isSignup ? 'Create Account' : 'Sign In')}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-full">
            <X size={20} />
          </button>
        </div>

        {currentUser ? (
          <div className="py-6 flex flex-col items-center text-center gap-4">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-20 h-20 rounded-full object-cover shadow-2xl border-2 border-[#1DB954]" />
            <div>
              <h4 className="text-xl font-extrabold text-white">{currentUser.name}</h4>
              <p className="text-xs text-zinc-400 mt-0.5">{currentUser.email}</p>
            </div>

            <div className="w-full bg-gradient-to-r from-emerald-950 to-zinc-900 p-3 rounded-2xl border border-emerald-500/30 flex items-center justify-center gap-2 text-emerald-400 text-xs font-black">
              <ShieldCheck size={16} />
              <span>Premium Plan Active</span>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-3 bg-red-600/20 hover:bg-red-600/40 text-red-400 font-extrabold text-xs rounded-xl border border-red-500/30 transition-colors mt-2"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 my-4">
            {isSignup && (
              <div>
                <label className="text-xs uppercase font-extrabold text-zinc-400 block mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mohamed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
                />
              </div>
            )}

            <div>
              <label className="text-xs uppercase font-extrabold text-zinc-400 block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
              />
            </div>

            <div>
              <label className="text-xs uppercase font-extrabold text-zinc-400 block mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold rounded-xl transition-all shadow-xl text-sm mt-2 flex items-center justify-center gap-2"
            >
              {isSignup ? <UserPlus size={18} /> : <LogIn size={18} />}
              <span>{isSignup ? 'Sign Up' : 'Sign In'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-xs text-zinc-400 hover:text-white font-bold text-center mt-2"
            >
              {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
