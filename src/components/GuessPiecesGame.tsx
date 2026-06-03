import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RefreshCw, Zap, Flame, Info, Sparkles, Check, ChevronUp, ChevronDown, Award, Copy, HelpCircle, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LegoSet } from '../types';
import { LEGO_SETS } from '../data';

interface GuessPiecesGameProps {
  onBackToHome: () => void;
  archiveDate?: Date | null;
}

interface PieceGuess {
  amount: number;
  diff: number;
  direction: 'higher' | 'lower' | 'correct';
  closeness: 'correct' | 'super-hot' | 'very-warm' | 'warm' | 'cool' | 'freezing';
}

const MAX_ATTEMPTS = 6;

// Deterministic daily puzzle based on date
function getDailyPiecesSet(overrideDate?: Date): { set: LegoSet; puzzleNumber: number } {
  const epoch = new Date(2026, 5, 1, 0, 0, 0, 0).getTime(); // June 1, 2026 (Month is 0-indexed)
  const date = overrideDate || new Date();
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
  const dayIndex = Math.max(0, Math.floor((today - epoch) / (1000 * 60 * 60 * 24)));
  const puzzleNumber = dayIndex + 1;
  // Use a shifted or distinct indexing so the daily pieces set is different from the daily set!
  const shiftedIndex = (dayIndex + 17) % LEGO_SETS.length;
  return {
    set: LEGO_SETS[shiftedIndex],
    puzzleNumber
  };
}

export default function GuessPiecesGame({ onBackToHome, archiveDate }: GuessPiecesGameProps) {
  const [gameMode, setGameMode] = useState<'DAILY' | 'PRACTICE'>('DAILY');
  const [targetSet, setTargetSet] = useState<LegoSet>(LEGO_SETS[0]);
  const [puzzleNumber, setPuzzleNumber] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [guesses, setGuesses] = useState<PieceGuess[]>([]);
  const [status, setStatus] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');
  const [copied, setCopied] = useState(false);

  // Initialize daily or practice target set
  useEffect(() => {
    if (gameMode === 'DAILY') {
      const { set, puzzleNumber: pNum } = getDailyPiecesSet(archiveDate || undefined);
      setTargetSet(set);
      setPuzzleNumber(pNum);

      // Load saved state from localStorage
      const saved = localStorage.getItem(`legodle_pieces_daily_state_${pNum}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setGuesses(parsed.guesses);
          setStatus(parsed.status);
        } catch (e) {
          console.error(e);
        }
      } else {
        setGuesses([]);
        setStatus('PLAYING');
      }
    } else {
      // Pick a random set for practice
      resetPracticeSet();
    }
    setInputValue('');
  }, [gameMode, archiveDate]);

  const resetPracticeSet = () => {
    const randomSet = LEGO_SETS[Math.floor(Math.random() * LEGO_SETS.length)];
    setTargetSet(randomSet);
    setGuesses([]);
    setStatus('PLAYING');
    setInputValue('');
  };

  const getClosenessDetails = (diff: number) => {
    const absDiff = Math.abs(diff);
    if (absDiff === 0) {
      return { label: '🎯 Correct!', color: 'bg-emerald-500 text-white border-emerald-600', code: 'correct', emoji: '🎯' };
    }
    if (absDiff <= 100) {
      return { label: '🔥 Super Hot!', color: 'bg-red-500 text-white border-red-600', code: 'super-hot', emoji: '🔥' };
    }
    if (absDiff <= 300) {
      return { label: '☀️ Very Warm', color: 'bg-orange-500 text-white border-orange-600', code: 'very-warm', emoji: '☀️' };
    }
    if (absDiff <= 600) {
      return { label: '⛅ Warm', color: 'bg-amber-400 text-neutral-900 border-amber-500', code: 'warm', emoji: '⛅' };
    }
    if (absDiff <= 1200) {
      return { label: '🧊 Cool', color: 'bg-teal-400 text-white border-teal-500', code: 'cool', emoji: '🧊' };
    }
    return { label: '❄️ Freezing Cold', color: 'bg-sky-200 text-sky-800 border-sky-300', code: 'freezing', emoji: '❄️' };
  };

  const handleGuessSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (status !== 'PLAYING') return;

    const guessNum = parseInt(inputValue.replace(/,/g, ''), 10);
    if (isNaN(guessNum) || guessNum <= 0) return;

    const rawDiff = guessNum - targetSet.piece_count;
    const diff = Math.abs(rawDiff) <= 25 ? 0 : rawDiff;
    const direction = diff > 0 ? 'lower' : diff < 0 ? 'higher' : 'correct';
    const closenessInfo = getClosenessDetails(diff);

    const newGuess: PieceGuess = {
      amount: guessNum,
      diff,
      direction,
      closeness: closenessInfo.code as any
    };

    const updatedGuesses = [...guesses, newGuess];
    let newStatus: 'PLAYING' | 'WON' | 'LOST' = 'PLAYING';

    if (diff === 0) {
      newStatus = 'WON';
      triggerConfetti();
    } else if (updatedGuesses.length >= MAX_ATTEMPTS) {
      newStatus = 'LOST';
    }

    setGuesses(updatedGuesses);
    setStatus(newStatus);
    setInputValue('');

    // Save state if playing Daily Puzzle
    if (gameMode === 'DAILY') {
      localStorage.setItem(
        `legodle_pieces_daily_state_${puzzleNumber}`,
        JSON.stringify({ guesses: updatedGuesses, status: newStatus })
      );
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 45,
        spread: 60,
        origin: { x: 0, y: 0.8 }
      });
      confetti({
        particleCount: 100,
        angle: 135,
        spread: 60,
        origin: { x: 1, y: 0.8 }
      });
    }, 250);
  };

  const getClosenessEmoji = (code: string) => {
    switch (code) {
      case 'correct': return '🎯';
      case 'super-hot': return '🔥';
      case 'very-warm': return '☀️';
      case 'warm': return '⛅';
      case 'cool': return '🧊';
      default: return '❄️';
    }
  };

  const handleCopyShare = () => {
    const title = `LEGODLE Guess the Pieces ${gameMode === 'DAILY' ? `#${puzzleNumber}` : 'Practice'}`;
    const grid = guesses.map(g => getClosenessEmoji(g.closeness)).join(' ');
    const endText = status === 'WON' 
      ? `Nailed it in ${guesses.length}/${MAX_ATTEMPTS} attempts! 🏆` 
      : `Exhausted all attempts! 🧩`;
    const inviteLink = 'https://legodle.tipa-hub.com';

    const textToCopy = `${title}\n${grid}\n${endText}\nPlay here: ${inviteLink}\nDesigned by Tipa Fabian & Hack Club`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error(err);
    });
  };

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 md:px-6 pt-5 pb-16 flex flex-col items-center gap-6 animate-[fadeSlideIn_0.3s_ease-out]">
      
      {/* Back button and Menu layout row */}
      <div className="w-full flex justify-between items-center bg-white border-2 border-[#e0e3e4] px-4 py-2.5 rounded-2xl shadow-sm">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#002B7F] hover:text-[#CE1126] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} className="stroke-[2.5]" />
          Home Menu
        </button>

        <span className="font-sans font-black text-xs text-[#191c1d] uppercase tracking-wider flex items-center gap-1.5 bg-[#FCD116]/20 text-neutral-900 px-3 py-1 rounded-lg">
          <Sparkles size={14} className="text-yellow-600 animate-spin" />
          Guess the Pieces
        </span>
      </div>

      {/* Archive Date warning banner */}
      {archiveDate && (
        <div className="w-full bg-[#FCD116] border-4 border-[#c7a107] p-3.5 rounded-2xl text-xs font-black uppercase tracking-wider text-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-[fadeSlideIn_0.2s_ease-out]">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-amber-700 shrink-0" />
            <span className="font-bold">
              Playing Archived Puzzle: {archiveDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <button
            onClick={onBackToHome}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-black text-[10px] uppercase py-1.5 px-3 rounded-lg border-b-2 border-neutral-950 shadow-sm active:translate-y-0.5 cursor-pointer whitespace-nowrap"
          >
            Return to Live Day
          </button>
        </div>
      )}

      {/* Mode selectors */}
      <div className="bg-[#eceeef] p-1 rounded-2xl border-2 border-[#e0e3e4] flex gap-1 relative shadow-inner">
        <button
          onClick={() => setGameMode('DAILY')}
          className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
            gameMode === 'DAILY'
              ? 'bg-[#bb0026] text-white shadow-[0_3px_0_#92001b] border-b border-[#92001b]'
              : 'text-neutral-500 hover:text-[#bb0026]'
          }`}
        >
          <Zap size={14} className={gameMode === 'DAILY' ? 'animate-bounce' : ''} />
          Daily Pieces Challenge
        </button>
        <button
          onClick={() => setGameMode('PRACTICE')}
          className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
            gameMode === 'PRACTICE'
              ? 'bg-[#0e59c3] text-white shadow-[0_3px_0_#004298] border-b border-[#004298]'
              : 'text-neutral-500 hover:text-[#0e59c3]'
          }`}
        >
          <RefreshCw size={14} className={gameMode === 'PRACTICE' ? 'animate-spin' : ''} />
          Infinite Random
        </button>
      </div>

      {/* Information Box representing LEGO model attributes to guess */}
      <div className="w-full bg-white border-4 border-[#e0e3e4] p-5 rounded-2xl shadow-md text-center flex flex-col items-center gap-4 relative overflow-hidden">
        {/* Playful top block studs illustration background */}
        <div className="flex gap-4 justify-center items-center opacity-10 absolute top-2 w-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-stone-500"></div>
          ))}
        </div>

        <div className="mt-2 text-center">
          <span className="text-[10px] font-black tracking-widest uppercase block text-[#0e59c3] mb-1">
            CONSTRUCT GUESS TRIVIA
          </span>
          <h2 className="font-sans font-black text-xl md:text-2xl text-[#191c1d] tracking-tight uppercase leading-snug">
            {targetSet.name}
          </h2>
        </div>

        {/* LEGO Set specifications summary */}
        <div className="grid grid-cols-3 gap-3 w-full bg-[#f8faf9] border-2 border-[#e0e3e4] p-3 rounded-xl">
          <div className="flex flex-col items-center justify-center py-1">
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Theme</span>
            <span className="text-xs md:text-sm font-bold text-[#0e59c3]">{targetSet.theme}</span>
          </div>
          <div className="flex flex-col items-center justify-center border-x border-neutral-200 py-1">
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Release Year</span>
            <span className="text-xs md:text-sm font-bold text-neutral-800">{targetSet.year}</span>
          </div>
          <div className="flex flex-col items-center justify-center py-1">
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Minifigures</span>
            <span className="text-xs md:text-sm font-bold text-[#bb0026]">{targetSet.minifigure_count}</span>
          </div>
        </div>


      </div>

      {/* GUESS INTAKE INPUT SECTION */}
      {status === 'PLAYING' && (
        <form onSubmit={handleGuessSubmit} className="w-full flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter brick piece count (e.g. 2500)"
                className="w-full bg-white border-4 border-[#e0e3e4] focus:border-[#0e59c3] px-4 py-3.5 rounded-xl font-sans font-extrabold text-[#191c1d] shadow-sm select-none outline-none placeholder-neutral-400 text-base"
                autoFocus
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-neutral-400 uppercase tracking-wider pointer-events-none bg-[#eceeef] px-2.5 py-1.5 rounded-lg">
                pieces
              </div>
            </div>

            <button
              type="submit"
              disabled={!inputValue}
              className="bg-[#002B7F] hover:bg-[#001D57] disabled:bg-neutral-200 disabled:text-neutral-400 disabled:border-neutral-300 text-white font-black text-sm uppercase px-6 rounded-xl border-b-4 border-[#001c52] shadow-sm cursor-pointer active:translate-y-0.5 active:border-b-0 disabled:active:translate-y-0 disabled:cursor-default transition-all flex items-center justify-center gap-1.5"
            >
              Verify
              <Check size={16} className="stroke-[2.5]" />
            </button>
          </div>

          <p className="text-[10px] md:text-xs font-black text-neutral-400 uppercase tracking-widest text-center mt-1">
            Attempts: <span className="text-[#CE1126]">{guesses.length}</span> / {MAX_ATTEMPTS}
          </p>
        </form>
      )}

      {/* REVEAL BOARD OUTCOME IN CASE GAME ENDS */}
      {status !== 'PLAYING' && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="w-full bg-white border-4 border-[#e0e3e4] p-6 rounded-2xl flex flex-col items-center gap-5 text-center shadow-md border-b-8 relative"
        >
          <div className={`w-14 h-14 rounded-full ${status === 'WON' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'} flex items-center justify-center mb-1 shadow-inner border-2 border-white`}>
            {status === 'WON' ? <Award size={28} className="stroke-[2.5]" /> : <Flame size={28} className="stroke-[2.5]" />}
          </div>

          <div>
            <span className="text-[10px] font-black tracking-widest uppercase block text-neutral-400 mb-1">
              THE REVEAL
            </span>
            <h3 className="font-sans font-black text-2xl text-[#191c1d] uppercase tracking-wide">
              {status === 'WON' ? 'Master Builder!' : 'Brick Collapse!'}
            </h3>
            <p className="text-sm text-neutral-500 font-semibold mt-2.5 max-w-sm mx-auto leading-relaxed">
              {status === 'WON' 
                ? `Sensational construction skills! You discovered the piece count in ${guesses.length} attempts.` 
                : 'Nice attempt! Even the best structures can lose bricks. Here is the actual count:'}
            </p>
          </div>

          {/* Actual Count Highlight Block */}
          <div className="bg-[#CE1126] text-white p-5 rounded-2xl relative shadow-[0_5px_0_#9a0c1a] border border-[#b20f21] inline-flex items-center gap-2 max-w-xs mx-auto mb-2 select-none group">
            {/* Stud layout on top of highlight count */}
            <div className="absolute top-1 left-4 w-1.5 h-1.5 rounded-full bg-white/25"></div>
            <div className="absolute top-1 right-4 w-1.5 h-1.5 rounded-full bg-white/25"></div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black tracking-widest uppercase text-white/80 leading-none mb-1">ACTUAL PIECES</span>
              <span className="font-sans font-black text-3xl leading-none">
                {targetSet.piece_count.toLocaleString()}
              </span>
            </div>
          </div>

          {targetSet.hint && (
            <div className="bg-[#f8faf9] p-3 rounded-xl border border-neutral-150 inline-flex items-start gap-2.5 max-w-md mx-auto italic text-xs text-neutral-600 text-center font-semibold leading-relaxed">
              "{targetSet.hint}"
            </div>
          )}

          {/* Share Block and Practice buttons action row */}
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
            <button
              onClick={handleCopyShare}
              className="flex-1 bg-neutral-900 border-b-4 border-neutral-950 hover:bg-neutral-800 text-white font-black text-xs uppercase py-3 px-5 rounded-xl shadow-sm select-none cursor-pointer transition-all active:translate-y-0.5 active:border-b-0 flex items-center justify-center gap-1.5"
            >
              <Copy size={14} />
              {copied ? 'Copied Results!' : 'Share Closeness'}
            </button>

            {gameMode === 'PRACTICE' && (
              <button
                onClick={resetPracticeSet}
                className="flex-1 bg-[#002B7F] border-b-4 border-[#001D57] hover:bg-[#00205f] text-white font-black text-xs uppercase py-3 px-5 rounded-xl shadow-sm select-none cursor-pointer transition-all active:translate-y-0.5 active:border-b-0 flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={14} />
                Next Random Set
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* GUESSES SCOREBOARD LIST */}
      {guesses.length > 0 && (
        <div className="w-full flex flex-col gap-3">
          <h4 className="font-sans font-black text-xs text-neutral-450 uppercase tracking-widest text-center">
            Verification Trail
          </h4>

          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {guesses.map((guess, idx) => {
                const details = getClosenessDetails(guess.diff);
                const absDiff = Math.abs(guess.diff);
                const isTooHigh = guess.diff > 0;

                return (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-white border-2 border-[#e0e3e4] rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm select-none"
                  >
                    {/* Index identifier */}
                    <div className="w-6 h-6 rounded-lg bg-[#f0f2f3] text-neutral-500 font-sans font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </div>

                    {/* Guess details representation */}
                    <div className="flex-1 text-left flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-3">
                      <div>
                        <span className="font-sans text-sm font-black text-[#191c1d]">
                          {guess.amount.toLocaleString()} pieces
                        </span>

                      </div>

                      {/* Pill showing feedback indicator hotness */}
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border-b-2 shadow-sm ${details.color}`}>
                          {details.label}
                        </span>

                        {absDiff !== 0 && (
                          <span className={`p-1 rounded-lg text-white ${isTooHigh ? 'bg-[#CE1126]' : 'bg-[#002B7F]'}`}>
                            {isTooHigh ? <ChevronDown size={14} className="stroke-[3]" /> : <ChevronUp size={14} className="stroke-[3]" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}



    </div>
  );
}
