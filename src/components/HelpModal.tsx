import { motion } from 'motion/react';
import { HelpCircle, Search, Puzzle, Clock, Construction, X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className="bg-[#f7fafa] border-4 border-[#e0e3e4] rounded-2xl w-full max-w-md overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.15)] flex flex-col"
        id="help-modal"
      >
        {/* Header */}
        <div className="p-5 text-center bg-[#f2f4f5] border-b-4 border-[#e0e3e4] flex justify-between items-center relative">
          <div className="w-6 h-6"></div> {/* Spacer for symmetry */}
          <h2 className="font-sans text-2xl font-black text-[#191c1d] tracking-tight uppercase">
            How to Play
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-200 transition-colors text-neutral-500"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1 */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex-shrink-0 bg-[#5d93ff] rounded-xl border-b-4 border-[#004298] flex items-center justify-center text-[#002b69] shadow-sm">
              <Search size={22} className="stroke-[3]" />
            </div>
            <div className="flex-1">
              <p className="font-sans font-bold text-base text-[#191c1d]">
                Search and guess a LEGO set.
              </p>
              <div className="mt-1 bg-[#eceeef] rounded-lg p-2 border border-[#e0e3e4] italic text-neutral-600 text-sm font-medium">
                e.g., "UCS Millennium Falcon"
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex-shrink-0 bg-[#caa802] rounded-xl border-b-4 border-[#554500] flex items-center justify-center text-[#4c3e00] shadow-sm">
              <Puzzle size={22} className="stroke-[3]" />
            </div>
            <div className="flex-1">
              <p className="font-sans font-bold text-base text-[#191c1d] mb-2">
                Check the brick tiles for hints.
              </p>
              
              {/* Feedback Explanation Blocks */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-[#4caf50] border-b-4 border-[#2e7d32] shadow-[inset_0_2px_0_rgba(255,255,255,0.4)] flex items-center justify-center font-bold text-white text-xs">
                    G
                  </div>
                  <span className="text-sm font-semibold text-neutral-700">Green: Exact Match!</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-[#fbc02d] border-b-4 border-[#f57f17] shadow-[inset_0_2px_0_rgba(255,255,255,0.4)] flex items-center justify-center font-bold text-neutral-800 text-xs text-center flex-col leading-none">
                    <span>Y</span>
                    <span className="text-[8px]">↓</span>
                  </div>
                  <span className="text-sm font-semibold text-neutral-700">Yellow: Correct is LOWER (↓) or HIGHER (↑)</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-[#9e9e9e] border-b-4 border-[#616161] shadow-[inset_0_2px_0_rgba(255,255,255,0.4)] flex items-center justify-center font-bold text-white text-xs">
                    S
                  </div>
                  <span className="text-sm font-semibold text-neutral-700">Gray: Mismatch / Incorrect Attribute</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex-shrink-0 bg-[#e41a36] rounded-xl border-b-4 border-[#92001b] flex items-center justify-center text-white shadow-sm">
              <Clock size={22} className="stroke-[3]" />
            </div>
            <div>
              <p className="font-sans font-bold text-base text-[#191c1d]">
                A new hidden set every 24 hours!
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-neutral-500 text-sm font-semibold">
                <Clock size={14} />
                Resets daily at Midnight
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-5 bg-white border-t border-[#e0e3e4]">
          <button
            onClick={onClose}
            className="w-full bg-[#bb0026] hover:bg-[#a00020] active:scale-[0.98] active:border-b-0 py-3.5 px-6 rounded-xl font-bold text-lg text-white border-b-4 border-[#92001b] shadow-[0_4px_0_rgba(0,0,0,0.1)] transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
          >
            Let's Build!
            <Construction size={18} className="animate-pulse" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
