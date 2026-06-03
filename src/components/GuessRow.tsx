import { motion } from 'motion/react';
import { ArrowUp, ArrowDown, Check, X } from 'lucide-react';
import { GuessFeedback, FeedbackType } from '../types';

interface GuessRowProps {
  guess: GuessFeedback;
  index: number;
  key?: any;
}

export default function GuessRow({ guess, index }: GuessRowProps) {
  // Helpers to assign CSS classes based on Wordle-LEGO feedback values
  const getBrickTypeClass = (feedback: FeedbackType) => {
    switch (feedback) {
      case 'correct':
        return 'bg-[#4caf50] border-[#2e7d32] text-white shadow-[inset_0_3px_0_rgba(255,255,255,0.4),0_4px_0_rgba(0,0,0,0.15)]';
      case 'higher':
      case 'lower':
        return 'bg-[#fbc02d] border-[#f57f17] text-neutral-850 shadow-[inset_0_3px_0_rgba(255,255,255,0.5),0_4px_0_rgba(0,0,0,0.15)]';
      case 'incorrect':
      default:
        return 'bg-[#9e9e9e] border-[#616161] text-white shadow-[inset_0_3px_0_rgba(255,255,255,0.3),0_4px_0_rgba(0,0,0,0.15)]';
    }
  };

  // Compile individual brick tiles data for progressive masonry rendering
  const tilesData = [
    {
      label: "ID",
      value: guess.setId,
      feedback: 'incorrect' as FeedbackType, // Set number is always gray unless correct
      isExact: false,
    },
    {
      label: "Year",
      value: guess.year.value,
      feedback: guess.year.feedback,
      isExact: guess.year.feedback === 'correct',
    },
    {
      label: "Pieces",
      value: guess.piece_count.value.toLocaleString(),
      feedback: guess.piece_count.feedback,
      isExact: guess.piece_count.feedback === 'correct',
    },
    {
      label: "Theme",
      value: guess.theme.value,
      feedback: guess.theme.feedback,
      isExact: guess.theme.feedback === 'correct',
    },
    {
      label: "Minifigs",
      value: guess.minifigure_count.value,
      feedback: guess.minifigure_count.feedback,
      isExact: guess.minifigure_count.feedback === 'correct',
    }
  ];

  // Set number is fully Green if the entire guess matches the target!
  const isAllCorrect = guess.year.feedback === 'correct' &&
                       guess.piece_count.feedback === 'correct' &&
                       guess.theme.feedback === 'correct' &&
                       guess.minifigure_count.feedback === 'correct';

  if (isAllCorrect) {
    tilesData[0].feedback = 'correct';
    tilesData[0].isExact = true;
  }

  return (
    <div className="grid grid-cols-5 gap-1.5 md:gap- brick-gap w-full">
      {tilesData.map((tile, tIdx) => {
        const isTheme = tIdx === 3;
        const arrow = tile.feedback === 'higher' ? (
          <ArrowUp size={12} className="stroke-[3] inline-block ml-0.5" />
        ) : tile.feedback === 'lower' ? (
          <ArrowDown size={12} className="stroke-[3] inline-block ml-0.5" />
        ) : null;

        return (
          <motion.div
            key={tIdx}
            initial={{ scale: 0.8, opacity: 0, rotateX: -90 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 12,
              delay: tIdx * 0.12 // Progressive visual snap waterfall
            }}
            className={`relative h-18 md:h-20 rounded-xl border-b-6 flex flex-col items-center justify-center p-1 text-center transition-all ${getBrickTypeClass(
              tile.feedback
            )}`}
          >
            {/* Glossy Stud Dot pattern to mimic 1x1 brick connector */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white/25 border border-white/5 shadow-inner flex items-center justify-center pointer-events-none">
              <span className="text-[5px] text-white/40 block leading-[5px] scale-[0.6] select-none uppercase tracking-widest">
                L
              </span>
            </div>

            {/* Display value with beautiful spacing */}
            <div className="mt-2.5 flex flex-col items-center justify-center h-full w-full">
              <span
                className={`font-sans tracking-tight font-extrabold block break-words leading-tight ${
                  isTheme 
                    ? 'text-[8px] md:text-[10px] uppercase line-clamp-2 px-0.5' 
                    : 'text-[10px] md:text-xs'
                }`}
              >
                {tile.value}
              </span>
              
              {/* Optional direction arrow indicator */}
              {arrow && (
                <div className="flex items-center justify-center mt-0.5 leading-none">
                  {arrow}
                </div>
              )}

              {/* Exact check success icon */}
              {tile.isExact && (
                <div className="flex items-center justify-center mt-0.5 bg-white/20 rounded-full p-0.5 leading-none">
                  <Check size={8} className="stroke-[4] text-white" />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Hollow placeholder bricks for unsubmitted/pending guess attempts
export function EmptyRow() {
  return (
    <div className="grid grid-cols-5 gap-1.5 md:gap-brick-gap w-full opacity-35">
      {[1, 2, 3, 4, 5].map((idx) => (
        <div
          key={idx}
          className="relative h-18 md:h-20 bg-[#eceeef] border-2 border-dashed border-stone-300 rounded-xl flex items-center justify-center group"
        >
          {/* Faded embossed stud silhouette */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-neutral-200 border border-neutral-100 pointer-events-none"></div>
        </div>
      ))}
    </div>
  );
}
