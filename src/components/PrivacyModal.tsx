import { motion } from 'motion/react';
import { X, ShieldCheck, Lock, Eye } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className="bg-[#f7fafa] border-4 border-[#e0e3e4] rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.15)] flex flex-col"
        id="privacy-modal"
      >
        {/* Header */}
        <div className="p-5 bg-[#f2f4f5] border-b-4 border-[#e0e3e4] flex justify-between items-center relative">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#CE1126]" />
            <h2 className="font-sans text-xl font-black text-[#191c1d] tracking-tight uppercase">
              Privacy Policy
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-200 transition-colors text-neutral-500 cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 text-sm text-neutral-600 leading-relaxed font-sans">
          <p className="font-bold text-neutral-800">
            Your Privacy Matters to Us!
          </p>
          <p>
            LEGODLE is a simple, lightweight fan-made word/brick puzzle game. We focus on fair play, fun, and keeping our users happy without tracking them.
          </p>

          <h3 className="font-black text-neutral-800 uppercase tracking-wider text-xs pt-2">
            1. No Personal Account Registration
          </h3>
          <p>
            You do not need to enter an email address, password, or set up any credentials to play. The application is free and fast, accessible immediately to everyone.
          </p>

          <h3 className="font-black text-neutral-800 uppercase tracking-wider text-xs pt-2">
            2. Local Storage Statistics
          </h3>
          <p>
            To keep track of your daily streaks, guess rates, wins, and layout settings, we store simple, anonymized variables directly inside your browser's <b>localStorage</b>. None of this data is transmitted to an external server or shared with third parties.
          </p>

          <h3 className="font-black text-neutral-800 uppercase tracking-wider text-xs pt-2">
            3. No Cookies or Trackers (Zero Tracking)
          </h3>
          <p>
            We do not use advertising biscuits or behavior-tracking pixels. Fabi designed LEGODLE with strict respect for user data, allowing you to enjoy pure, clean puzzle fun with zero commercial telemetry.
          </p>

          <h3 className="font-black text-neutral-800 uppercase tracking-wider text-xs pt-2">
            4. External Website Resource Safety
          </h3>
          <p>
            If you click on external resources or social sharing links (such as Reddit or Discord), those separate systems operate under their own independent privacy agreements.
          </p>

          <div className="pt-4 border-t border-neutral-200 text-center text-xs text-neutral-400 font-bold uppercase tracking-widest">
            Last Updated &bull; June 2026
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-[#f2f4f5] border-t-2 border-[#e0e3e4] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#CE1126] hover:bg-[#a10d1d] text-white font-black text-xs uppercase px-5 py-2.5 rounded-xl border-b-4 border-[#780a15] shadow-sm select-none cursor-pointer transition-all active:translate-y-0.5 active:border-b-0"
          >
            Acknowledged
          </button>
        </div>
      </motion.div>
    </div>
  );
}
