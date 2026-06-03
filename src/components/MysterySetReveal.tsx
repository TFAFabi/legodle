import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Check, Share2, Clipboard, ArrowRight, Sparkles, Flame, RefreshCw } from 'lucide-react';
import { LegoSet, GuessFeedback, FeedbackType } from '../types';

interface MysterySetRevealProps {
  targetSet: LegoSet;
  guesses: GuessFeedback[];
  won: boolean;
  puzzleNumber: number;
}

export default function MysterySetReveal({ targetSet, guesses, won, puzzleNumber }: MysterySetRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const guessCount = guesses.length;

  useEffect(() => {
    // Reset reveal when target changes
    setIsRevealed(false);
  }, [targetSet]);

  const generateShareText = () => {
    let resultGrid = '';
    guesses.forEach((g) => {
      // 5 attributes
      const idIcon = won && g.setId === targetSet.id ? '🟩' : '⬛';
      const yearIcon = g.year.feedback === 'correct' ? '🟩' : g.year.feedback === 'incorrect' ? '⬛' : '🟨';
      const piecesIcon = g.piece_count.feedback === 'correct' ? '🟩' : g.piece_count.feedback === 'incorrect' ? '⬛' : '🟨';
      const themeIcon = g.theme.feedback === 'correct' ? '🟩' : '⬛';
      const minifigsIcon = g.minifigure_count.feedback === 'correct' ? '🟩' : g.minifigure_count.feedback === 'incorrect' ? '⬛' : '🟨';
      resultGrid += `${idIcon}${yearIcon}${piecesIcon}${themeIcon}${minifigsIcon}\n`;
    });

    const statusText = won ? `${guessCount}/6` : 'X/6';
    return `LEGOdle #${puzzleNumber} (${statusText})\n\n${resultGrid}\nPlay LEGOdle: ${window.location.origin}`;
  };

  const handleCopyShare = () => {
    const text = generateShareText();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSocialShare = (platform: 'reddit' | 'discord') => {
    const text = encodeURIComponent(generateShareText());
    if (platform === 'reddit') {
      window.open(`https://www.reddit.com/submit?title=${encodeURIComponent(`LEGODLE Daily Puzzle #${puzzleNumber}`)}&text=${text}`, '_blank');
    } else {
      // Direct clipboard fallback for others
      handleCopyShare();
    }
  };

  // Render a detailed aesthetic vector illustration matching target set category
  const renderSetSilhouette = () => {
    const prompt = targetSet.imagePrompt || 'house';
    
    // We construct cute stylized SVG structures that adapt to themes
    switch (prompt) {
      case 'starship':
      case 'spaceship':
        return (
          <svg className="w-36 h-36 text-[#bb0026]" viewBox="0 0 100 100" fill="currentColor">
            {/* Spaceship wing pods */}
            <path d="M 10 70 L 30 55 L 30 75 Z" />
            <path d="M 90 70 L 70 55 L 70 75 Z" />
            {/* Main fuselage & engines */}
            <rect x="38" y="25" width="24" height="52" rx="4" />
            <polygon points="50,10 38,35 62,35" />
            {/* Stud cockpits */}
            <circle cx="50" cy="40" r="5" className="text-amber-400" />
            <circle cx="50" cy="55" r="4" className="text-[#0e59c3]" />
            <rect x="42" y="77" width="6" height="8" className="text-orange-500" />
            <rect x="52" y="77" width="6" height="8" className="text-orange-500" />
          </svg>
        );
      case 'car':
      case 'minivan':
        return (
          <svg className="w-36 h-36 text-[#0e59c3]" viewBox="0 0 100 100" fill="currentColor">
            {/* Car body */}
            <rect x="15" y="45" width="70" height="25" rx="5" />
            <path d="M 30 45 L 42 22 L 68 22 L 75 45 Z" />
            {/* Windshield divider studs */}
            <circle cx="45" cy="32" r="3" className="text-[#eceeef]" />
            <circle cx="55" cy="32" r="3" className="text-[#eceeef]" />
            {/* Wheels slots */}
            <circle cx="32" cy="70" r="10" className="text-neutral-900" />
            <circle cx="32" cy="70" r="4" className="text-neutral-400" />
            <circle cx="68" cy="70" r="10" className="text-neutral-900" />
            <circle cx="68" cy="70" r="4" className="text-neutral-400" />
          </svg>
        );
      case 'castle':
      case 'temple':
        return (
          <svg className="w-36 h-36 text-stone-500" viewBox="0 0 100 100" fill="currentColor">
            {/* Tower structures */}
            <rect x="15" y="30" width="16" height="50" rx="1" />
            <rect x="69" y="30" width="16" height="50" rx="1" />
            <rect x="31" y="45" width="38" height="35" />
            {/* Medieval turrets */}
            <polygon points="12,30 23,12 34,30" className="text-[#bb0026]" />
            <polygon points="66,30 77,12 88,30" className="text-[#bb0026]" />
            {/* Drawbridge hole */}
            <rect x="42" y="60" width="16" height="20" rx="8" className="text-[#ffe176]" />
            {/* Modular Merlon battlements */}
            <rect x="35" y="40" width="6" height="6" />
            <rect x="47" y="40" width="6" height="6" />
            <rect x="59" y="40" width="6" height="6" />
          </svg>
        );
      case 'skyscraper':
        return (
          <svg className="w-36 h-36 text-sky-700" viewBox="0 0 100 100" fill="currentColor">
            <rect x="25" y="10" width="50" height="80" rx="4" />
            {/* Window studs grid pattern */}
            <circle cx="35" cy="22" r="2.5" className="text-cyan-200" />
            <circle cx="50" cy="22" r="2.5" className="text-cyan-200" />
            <circle cx="65" cy="22" r="2.5" className="text-cyan-200" />
            <circle cx="35" cy="40" r="2.5" className="text-cyan-200" />
            <circle cx="50" cy="40" r="2.5" className="text-cyan-200" />
            <circle cx="65" cy="40" r="2.5" className="text-cyan-200" />
            <circle cx="35" cy="58" r="2.5" className="text-cyan-200" />
            <circle cx="50" cy="58" r="2.5" className="text-cyan-200" />
            <circle cx="65" cy="58" r="2.5" className="text-cyan-200" />
            <circle cx="35" cy="76" r="2.5" className="text-cyan-200" />
            <circle cx="50" cy="76" r="2.5" className="text-cyan-200" />
            <circle cx="65" cy="76" r="2.5" className="text-cyan-200" />
            {/* Antenna rod */}
            <line x1="50" y1="10" x2="50" y2="2" stroke="currentColor" strokeWidth="4" />
          </svg>
        );
      default:
        // Standard Stacked 2x4 Bricks (Classic pile)
        return (
          <svg className="w-36 h-36 text-amber-500" viewBox="0 0 100 100" fill="currentColor">
            {/* Bottom block red */}
            <rect x="15" y="55" width="70" height="24" rx="2" className="text-[#bb0026]" />
            <circle cx="28" cy="51" r="4" className="text-red-700" />
            <circle cx="43" cy="51" r="4" className="text-red-700" />
            <circle cx="58" cy="51" r="4" className="text-red-700" />
            <circle cx="72" cy="51" r="4" className="text-red-700" />
            
            {/* Top block yellow */}
            <rect x="25" y="27" width="50" height="24" rx="2" className="text-[#fbc02d]" />
            <circle cx="35" cy="23" r="4" className="text-yellow-700" />
            <circle cx="50" cy="23" r="4" className="text-yellow-700" />
            <circle cx="65" cy="23" r="4" className="text-yellow-700" />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full mt-4">
      
      {/* Victory Header */}
      <div className="text-center flex flex-col items-center gap-2">
        <motion.h2 
          className="text-4xl md:text-5xl font-black text-[#bb0026] tracking-tighter uppercase drop-shadow-sm flex items-center gap-1.5"
          initial={{ scale: 0.8 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5 }}
        >
          {won ? "You Nailed It! 🏆" : "Exhausted! 💔"}
        </motion.h2>
        
        <div className="flex items-center justify-center gap-4">
          <span className="text-2xl font-black text-neutral-600">
            {won ? `${guessCount}/6 Attempts` : "0/6 Attempts"}
          </span>
          <span className={`px-4 py-1.5 rounded-full font-bold text-sm uppercase tracking-widest shadow-md flex items-center gap-1 text-white ${
            won ? 'bg-[#4caf50]' : 'bg-[#e41a36]'
          }`}>
            {won ? 'Success' : 'Failed'}
          </span>
        </div>
      </div>

      {/* Grid of colors Wordle-style showing visual outcome summary */}
      <div className="bg-[#eceeef] border-4 border-[#e0e3e4] rounded-2xl p-4 shadow-inner flex flex-col items-center gap-2">
        <span className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">
          Puzzle Grid Map
        </span>
        <div className="flex flex-col gap-1.5">
          {guesses.map((g, gIdx) => {
            const getIconBg = (feedback: FeedbackType) => {
              if (feedback === 'correct') return 'bg-[#4caf50]';
              if (feedback === 'incorrect') return 'bg-[#9e9e9e]';
              return 'bg-[#fbc02d]';
            };

            return (
              <div key={gIdx} className="flex gap-1.5">
                {[
                  won && g.setId === targetSet.id ? 'correct' : 'incorrect',
                  g.year.feedback,
                  g.piece_count.feedback,
                  g.theme.feedback,
                  g.minifigure_count.feedback
                ].map((feed, fIdx) => (
                  <div
                    key={fIdx}
                    className={`w-6 h-6 rounded-md shadow-sm relative ${getIconBg(feed as FeedbackType)}`}
                  >
                    {/* Embedded micro plastic stud dome on each matrix tile */}
                    <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/20"></div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Set Silhouette Reveal Card */}
      <div className="relative overflow-hidden bg-white rounded-2xl border-4 border-[#e0e3e4] shadow-xl p-5 flex flex-col items-center">
        
        <div className="relative w-full max-w-[260px] aspect-square bg-[#f2f4f5] rounded-xl flex items-center justify-center overflow-hidden border border-neutral-200">
          
          {/* Subtle stud grid background layout inside card */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: "radial-gradient(#191c1d 2px, transparent 2.5px)",
            backgroundSize: "20px 20px"
          }}></div>

          {/* Render the illustration */}
          <div className={`transition-all duration-700 transform ${
            isRevealed ? 'scale-105 filter-none' : 'scale-95 brightness-0 opacity-80'
          }`}>
            {renderSetSilhouette()}
          </div>

          {/* Reveal Overlay Lock */}
          {!isRevealed && (
            <div className="absolute inset-0 bg-black/45 backdrop-blur-sm flex flex-col items-center justify-center p-4">
              <span className="font-black text-sm text-white uppercase tracking-wider mb-3 leading-none">
                {won ? "Victory Mystery Set" : "Failed Set Revealed"}
              </span>
              <button
                onClick={() => setIsRevealed(true)}
                className="bg-[#bb0026] text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl border-b-4 border-[#92001b] shadow-md hover:brightness-110 active:translate-y-1 active:border-b-0 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Eye size={14} />
                Reveal Set info
              </button>
            </div>
          )}
        </div>

        {/* Set Information details panel */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="text-center mt-4 w-full"
            >
              <h3 className="text-xl font-black text-neutral-800 tracking-tight leading-snug">
                {targetSet.name}
              </h3>
              <p className="text-sm font-bold text-neutral-500 uppercase mt-0.5 tracking-wide">
                Set #{targetSet.id} &bull; {targetSet.theme} &bull; {targetSet.year}
              </p>
              <div className="flex justify-center gap-3 mt-2 text-xs font-black text-neutral-400">
                <span className="bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
                  {targetSet.piece_count.toLocaleString()} Pieces
                </span>
                <span className="bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
                  {targetSet.minifigure_count} Minifigures
                </span>
              </div>
              {targetSet.hint && (
                <p className="text-xs font-semibold text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-150 mt-3 max-w-sm italic mx-auto text-center">
                  "{targetSet.hint}"
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Copy link or share trigger action button standardizes wordle code sharing */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleCopyShare}
          className="w-full bg-[#0e59c3] hover:bg-[#0c4ca5] active:translate-y-1 active:border-b-0 py-3.5 px-6 rounded-xl font-black text-white border-b-4 border-[#004298] shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={18} />
              Copied to Clipboard!
            </>
          ) : (
            <>
              <Clipboard size={18} />
              Copy Wordle Grid Result
            </>
          )}
        </button>

        {/* Social platform hotlinks */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleSocialShare('reddit')}
            className="bg-[#FF4500] text-white hover:opacity-90 py-2 rounded-xl text-xs font-bold border-b-4 border-[#d63a00] shadow-sm uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
          >
            Post on Reddit
          </button>
          <button
            onClick={handleCopyShare}
            className="bg-[#5865F2] text-white hover:opacity-90 py-2 rounded-xl text-xs font-bold border-b-4 border-[#4752C4] shadow-sm uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
          >
            Share on Discord
          </button>
        </div>
      </div>

    </div>
  );
}
