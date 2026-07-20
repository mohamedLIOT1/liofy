import React from 'react';
import { X, Moon, Clock } from 'lucide-react';

export default function SleepTimerModal({ isOpen, onClose, activeTimer, setSleepTimer }) {
  if (!isOpen) return null;

  const options = [
    { label: 'Off', minutes: 0 },
    { label: '5 Minutes', minutes: 5 },
    { label: '15 Minutes', minutes: 15 },
    { label: '30 Minutes', minutes: 30 },
    { label: '45 Minutes', minutes: 45 },
    { label: '1 Hour', minutes: 60 },
    { label: 'End of Track', minutes: -1 }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Moon className="text-[#1DB954]" size={22} />
            <h3 className="text-lg font-bold text-white">Sleep Timer</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-full">
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-zinc-400 my-3">Stop audio playback automatically when the timer ends.</p>

        <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
          {options.map((opt) => {
            const isSelected = activeTimer === opt.minutes;
            return (
              <button
                key={opt.label}
                onClick={() => {
                  setSleepTimer(opt.minutes);
                  onClose();
                }}
                className={`p-3 rounded-xl text-left text-sm font-semibold flex items-center justify-between transition-all ${
                  isSelected 
                    ? 'bg-[#1DB954] text-black font-extrabold shadow-md' 
                    : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Clock size={16} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
