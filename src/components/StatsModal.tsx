import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, Share2, Award, Calendar, RefreshCw } from 'lucide-react';
import { PlayerStats } from '../types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onShare?: () => void;
  shareDisabled?: boolean;
}

export default function StatsModal({ isOpen, onClose, stats, onShare, shareDisabled }: StatsModalProps) {
  const [timeLeft, setTimeLeft] = useState('');

  // Calculate clock ticking down to local midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextDay = new Date();
      nextDay.setHours(24, 0, 0, 0); // Next midnight

      const diff = nextDay.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      const hours = String(h).padStart(2, '0');
      const minutes = String(m).padStart(2, '0');
      const seconds = String(s).padStart(2, '0');

      setTimeLeft(`${hours}:${minutes}:${seconds}`);
    };

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();

    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const winPercentage = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  // Find max distribution item to scale chart bars appropriately
  const maxDistributionValue = Math.max(...Object.values(stats.guessDistribution), 1);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="bg-[#f7fafa] border-4 border-[#e0e3e4] rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.2)] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 bg-[#f2f4f5] border-b-4 border-[#e0e3e4] flex justify-between items-center relative">
          <div className="w-6 h-6"></div> {/* Spacer */}
          <h2 className="font-sans text-xl font-black text-[#bb0026] tracking-tight uppercase">
            Your Stats
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-200 transition-colors text-neutral-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-5 flex flex-col gap-6">
          
          {/* Stats overview bento boxes */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-[#eceeef] border-b-2 border-stone-350 p-2 rounded-lg flex flex-col items-center">
              <span className="font-sans text-2xl font-extrabold text-[#191c1d]">{stats.played}</span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">Played</span>
            </div>
            <div className="bg-[#eceeef] border-b-2 border-stone-350 p-2 rounded-lg flex flex-col items-center">
              <span className="font-sans text-2xl font-extrabold text-[#191c1d]">{winPercentage}%</span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">Win %</span>
            </div>
            <div className="bg-[#eceeef] border-b-2 border-stone-350 p-2 rounded-lg flex flex-col items-center">
              <span className="font-sans text-2xl font-extrabold text-[#191c1d]">{stats.currentStreak}</span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">Streak</span>
            </div>
            <div className="bg-[#eceeef] border-b-2 border-stone-350 p-2 rounded-lg flex flex-col items-center">
              <span className="font-sans text-2xl font-extrabold text-[#191c1d]">{stats.maxStreak}</span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">Max</span>
            </div>
          </div>

          {/* Bar Chart: Guess Distribution */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-black text-neutral-500 uppercase tracking-wider text-left border-b border-neutral-200 pb-1">
              Guess Distribution
            </h3>
            <div className="flex flex-col gap-1.5 mt-1">
              {[1, 2, 3, 4, 5, 6].map((guessIdx) => {
                const count = stats.guessDistribution[guessIdx] || 0;
                // Compute width percent relative to max guess frequency
                const widthPercent = maxDistributionValue > 0 ? (count / maxDistributionValue) * 100 : 5;
                const displayWidth = Math.max(widthPercent, 8); // Minimum size for nice block rendering

                return (
                  <div key={guessIdx} className="flex items-center gap-2">
                    <span className="w-3 font-bold text-sm text-neutral-600 text-right">{guessIdx}</span>
                    <div className="flex-1 h-6 bg-[#eceeef] rounded-md relative overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${displayWidth}%` }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
                        className={`h-full flex items-center justify-end px-2 text-white font-bold text-xs rounded-sm border-b-2 ${
                          count > 0 
                            ? 'bg-[#0e59c3] border-[#004298]' 
                            : 'bg-[#9e9e9e] border-[#616161]'
                        }`}
                      >
                        {count}
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Countdown & Actions at bottom */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#e0e3e4] mt-2">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider leading-none">
                Next LEGOdle In
              </span>
              <span className="font-sans text-xl font-extrabold text-neutral-800 tabular-nums tracking-tight mt-1">
                {timeLeft}
              </span>
            </div>

            {onShare && (
              <button
                disabled={shareDisabled}
                onClick={onShare}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-bold font-sans text-sm text-white uppercase tracking-wider border-b-4 transition-all shadow-sm ${
                  shareDisabled
                    ? 'bg-neutral-300 border-neutral-400 cursor-not-allowed opacity-50'
                    : 'bg-[#5d93ff] hover:bg-[#477eeb] border-[#004298] active:translate-y-0.5 active:border-b-0 cursor-pointer'
                }`}
              >
                <Share2 size={16} className="stroke-[2.5]" />
                Share
              </button>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
}
