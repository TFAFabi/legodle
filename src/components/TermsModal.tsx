import { motion } from 'motion/react';
import { X, FileText, Scale, ShieldCheck } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className="bg-[#f7fafa] border-4 border-[#e0e3e4] rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.15)] flex flex-col"
        id="terms-modal"
      >
        {/* Header */}
        <div className="p-5 bg-[#f2f4f5] border-b-4 border-[#e0e3e4] flex justify-between items-center relative">
          <div className="flex items-center gap-2">
            <Scale size={20} className="text-[#002B7F]" />
            <h2 className="font-sans text-xl font-black text-[#191c1d] tracking-tight uppercase">
              Terms &amp; Conditions
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
            Welcome to LEGODLE!
          </p>
          <p>
            Please read these Terms and Conditions carefully before playing. By using or accessing LEGODLE, you agree to be bound by these terms. If you do not agree, please do not use the website.
          </p>

          <h3 className="font-black text-neutral-800 uppercase tracking-wider text-xs pt-2">
            1. Intellectual Property &amp; Trademarks
          </h3>
          <p>
            LEGO is a trademark of the LEGO Group of companies. LEGODLE is an unofficial fan-made puzzle trivia application built for educational and entertainment purposes only. We do not represent, hold affiliation with, nor are we sponsored by the LEGO Group of companies. No trademark infringement is intended.
          </p>

          <h3 className="font-black text-neutral-800 uppercase tracking-wider text-xs pt-2">
            2. Permitted Use &amp; Clues
          </h3>
          <p>
            You are permitted to play the trivia game, share your results/blocks on social media (such as Reddit or Discord), and explore different modes of the website. Automation, scrapers, or malicious payload submission are strictly prohibited.
          </p>

          <h3 className="font-black text-neutral-800 uppercase tracking-wider text-xs pt-2">
            3. Accuracy of Trivia Sets
          </h3>
          <p>
            All set sizes, minifigure counts, years, and historical descriptions are based on public catalogues. While we strive to maintain accurate dimensions and brick data, occasional catalog mismatches might happen.
          </p>

          <h3 className="font-black text-neutral-800 uppercase tracking-wider text-xs pt-2">
            4. Revisions to the Game
          </h3>
          <p>
            LEGODLE is crafted by <b>Fabi</b>. We reserve the right to modify, restrict, reset statistics, or sunset game modes at any time without continuous direct notice to players.
          </p>

          <h3 className="font-black text-neutral-800 uppercase tracking-wider text-xs pt-2">
            5. Limitation of Liability
          </h3>
          <p>
            This website is provided on an "as-is" basis. Fabi or LEGODLE makes no warranties regarding uninterrupted puzzle service, network security, or uptime guarantees. Play playfully and have fun!
          </p>

          <div className="pt-4 border-t border-neutral-200 text-center text-xs text-neutral-400 font-bold uppercase tracking-widest">
            Last Updated &bull; June 2026
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-[#f2f4f5] border-t-2 border-[#e0e3e4] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#002B7F] hover:bg-[#00205f] text-white font-black text-xs uppercase px-5 py-2.5 rounded-xl border-b-4 border-[#001D57] shadow-sm select-none cursor-pointer transition-all active:translate-y-0.5 active:border-b-0"
          >
            I Understand
          </button>
        </div>
      </motion.div>
    </div>
  );
}
