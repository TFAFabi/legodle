import { useState, useEffect } from 'react';
import { HelpCircle, RefreshCw, Award, Info, Sparkles, Lightbulb, Zap, Home, Play, Lock, Puzzle, Globe, Clock, Timer, ExternalLink, Scale, ShieldCheck, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LegoSet, GuessFeedback, GameState, PlayerStats } from './types';
import { LEGO_SETS } from './data';
import { getDailyPuzzle, compareGuess, loadStats, recordFinishedGame } from './utils';
import AutocompleteSearch from './components/AutocompleteSearch';
import GuessRow, { EmptyRow } from './components/GuessRow';
import MysterySetReveal from './components/MysterySetReveal';
import HelpModal from './components/HelpModal';
import GuessPiecesGame from './components/GuessPiecesGame';

export default function App() {
  // Screen views: 'HOME' menu, active 'GAME' board, 'GUESS_PIECES' board, 'TERMS' board, 'PRIVACY' board, or 'ARCHIVE' dashboard
  const [screen, setScreen] = useState<'HOME' | 'GAME' | 'GUESS_PIECES' | 'TERMS' | 'PRIVACY' | 'ARCHIVE'>(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path === '/classic' || hash === '#/classic' || hash === '#classic') return 'GAME';
    if (path === '/pieces' || hash === '#/pieces' || hash === '#pieces') return 'GUESS_PIECES';
    if (path === '/terms' || hash === '#/terms' || hash === '#terms') return 'TERMS';
    if (path === '/privacy' || hash === '#/privacy' || hash === '#privacy') return 'PRIVACY';
    if (path === '/archive' || hash === '#/archive' || hash === '#archive') return 'ARCHIVE';
    return 'HOME';
  });

  const [archiveDate, setArchiveDate] = useState<Date | null>(null);

  // Sync screen state with URL pathname/hash
  useEffect(() => {
    let targetPath = '/';
    if (screen === 'GAME') targetPath = '/classic';
    else if (screen === 'GUESS_PIECES') targetPath = '/pieces';
    else if (screen === 'TERMS') targetPath = '/terms';
    else if (screen === 'PRIVACY') targetPath = '/privacy';
    else if (screen === 'ARCHIVE') targetPath = '/archive';

    const currentPath = window.location.pathname;
    
    // Switch route in navigation history seamlessly
    if (currentPath !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  }, [screen]);

  // Listen for popstate events (e.g., user clicks browser's back or forward button)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/classic' || hash === '#/classic' || hash === '#classic') {
        setScreen('GAME');
      } else if (path === '/pieces' || hash === '#/pieces' || hash === '#pieces') {
        setScreen('GUESS_PIECES');
      } else if (path === '/terms' || hash === '#/terms' || hash === '#terms') {
        setScreen('TERMS');
      } else if (path === '/privacy' || hash === '#/privacy' || hash === '#privacy') {
        setScreen('PRIVACY');
      } else if (path === '/archive' || hash === '#/archive' || hash === '#archive') {
        setScreen('ARCHIVE');
      } else {
        setScreen('HOME');
        setArchiveDate(null);
        setDailyPuzzle(getDailyPuzzle());
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Helper selectors and plays for archive
  const getArchiveDays = (): Date[] => {
    const startDate = new Date('2026-06-01T12:00:00'); // secure mid-day to ignore TZ rollovers
    const endDate = new Date();
    const days: Date[] = [];
    const current = new Date(startDate);
    const limit = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 12, 0, 0);

    while (current <= limit) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days.reverse();
  };

  const getPiecesPuzzleNumber = (date: Date): number => {
    const epoch = new Date(2026, 5, 1, 0, 0, 0, 0).getTime(); // June 1, 2026 (Month index 5 is June)
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
    const dayIndex = Math.max(0, Math.floor((today - epoch) / (1000 * 60 * 60 * 24)));
    return dayIndex + 1;
  };

  const playClassicArchive = (date: Date) => {
    setArchiveDate(date);
    setDailyPuzzle(getDailyPuzzle(date));
    setGameMode('DAILY');
    setScreen('GAME');
  };

  const playPiecesArchive = (date: Date) => {
    setArchiveDate(date);
    setScreen('GUESS_PIECES');
  };

  const handleBackToHome = () => {
    setArchiveDate(null);
    setDailyPuzzle(getDailyPuzzle());
    setScreen('HOME');
  };

  const handleLogoClick = () => {
    setArchiveDate(null);
    setDailyPuzzle(getDailyPuzzle());
    setScreen('HOME');
  };

  // Modes: 'DAILY' (one puzzle per day, records stats) or 'PRACTICE' (infinite random training puzzles)
  const [gameMode, setGameMode] = useState<'DAILY' | 'PRACTICE'>('DAILY');

  // Daily puzzle state
  const [dailyPuzzle, setDailyPuzzle] = useState(getDailyPuzzle());
  const [dailyGuesses, setDailyGuesses] = useState<GuessFeedback[]>([]);
  const [dailyStatus, setDailyStatus] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');

  // Practice puzzle state
  const [practiceSet, setPracticeSet] = useState<LegoSet>(LEGO_SETS[0]);
  const [practiceGuesses, setPracticeGuesses] = useState<GuessFeedback[]>([]);
  const [practiceStatus, setPracticeStatus] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');

  // Player statistics and modals state
  const [stats, setStats] = useState<PlayerStats>({
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  });
  const [helpOpen, setHelpOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Next LEGODLE midnight countdown state and effect
  const [timeUntilMidnight, setTimeUntilMidnight] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00'
  });

  useEffect(() => {
    function updateTimer() {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Next 00:00 midnight
      const diffMs = Math.max(0, midnight.getTime() - now.getTime());
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      setTimeUntilMidnight({
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
      });
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load stats and check initial tutorial visit on mount
  useEffect(() => {
    // Load historical stats
    const loaded = loadStats();
    setStats(loaded);

    // If first-time user, automatically show the "How to Play" tutorial modal
    const hasVisited = localStorage.getItem("legodle_visited_before");
    if (!hasVisited) {
      setHelpOpen(true);
      localStorage.setItem("legodle_visited_before", "true");
    }

    // Set up a random practice set initially
    resetPracticeGame();
  }, []);

  // Sync Daily Game Session Guesses from / to localStorage
  useEffect(() => {
    const dateKey = dailyPuzzle.dateString;
    const saveGuessesKey = `legodle_daily_guesses_${dateKey}`;
    const saveStatusKey = `legodle_daily_status_${dateKey}`;

    try {
      const cachedGuesses = localStorage.getItem(saveGuessesKey);
      const cachedStatus = localStorage.getItem(saveStatusKey);

      if (cachedGuesses) {
        // Map target guess objects
        const parsedIds = JSON.parse(cachedGuesses) as string[];
        const mappedGuesses = parsedIds.map((id) => {
          const matchedSet = LEGO_SETS.find((s) => s.id === id);
          return matchedSet ? compareGuess(matchedSet, dailyPuzzle.targetSet) : null;
        }).filter(Boolean) as GuessFeedback[];

        setDailyGuesses(mappedGuesses);
      } else {
        setDailyGuesses([]);
      }

      if (cachedStatus) {
        setDailyStatus(cachedStatus as 'PLAYING' | 'WON' | 'LOST');
      } else {
        setDailyStatus('PLAYING');
      }
    } catch(e) {
      console.error("Failed to restore daily state", e);
    }

    // Reset hint state on target changed
    setShowHint(false);
  }, [dailyPuzzle]);

  // Handle midnight reset timer trigger
  useEffect(() => {
    if (archiveDate) return; // Do NOT auto-reset or compare when playing an archived game!

    // Periodically inspect if current calendar date differs from state loaded date
    const interval = setInterval(() => {
      const fresh = getDailyPuzzle();
      if (fresh.dateString !== dailyPuzzle.dateString) {
        setDailyPuzzle(fresh);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [dailyPuzzle, archiveDate]);

  const activeTargetSet = gameMode === 'DAILY' ? dailyPuzzle.targetSet : practiceSet;
  const activeGuesses = gameMode === 'DAILY' ? dailyGuesses : practiceGuesses;
  const activeStatus = gameMode === 'DAILY' ? dailyStatus : practiceStatus;

  // Set up a random new practice puzzle targets
  const resetPracticeGame = () => {
    const unselectedSets = LEGO_SETS.filter((s) => s.id !== dailyPuzzle.targetSet.id);
    const randomIndex = Math.floor(Math.random() * unselectedSets.length);
    setPracticeSet(unselectedSets[randomIndex]);
    setPracticeGuesses([]);
    setPracticeStatus('PLAYING');
    setShowHint(false);
  };

  // Submit a selected guess set ID
  const handleGuessSubmit = (set: LegoSet) => {
    if (activeStatus !== 'PLAYING' || activeGuesses.length >= 6) return;

    const feedback = compareGuess(set, activeTargetSet);
    const updatedGuesses = [...activeGuesses, feedback];
    const isCorrect = set.id === activeTargetSet.id;
    const isExhausted = updatedGuesses.length >= 6;

    let nextStatus: 'PLAYING' | 'WON' | 'LOST' = 'PLAYING';
    if (isCorrect) {
      nextStatus = 'WON';
      // Trigger confetti celebration!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);

      // Scroll smoothly down to the "you nailed it" reveal section
      setTimeout(() => {
        const el = document.getElementById('reveal-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
    } else if (isExhausted) {
      nextStatus = 'LOST';
      // Scroll to reveal panel on game over loss too
      setTimeout(() => {
        const el = document.getElementById('reveal-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
    }

    if (gameMode === 'DAILY') {
      setDailyGuesses(updatedGuesses);
      setDailyStatus(nextStatus);

      // Save daily guesses tracking payload to local Storage
      const dateKey = dailyPuzzle.dateString;
      const guessIds = updatedGuesses.map((g) => g.setId);
      localStorage.setItem(`legodle_daily_guesses_${dateKey}`, JSON.stringify(guessIds));
      localStorage.setItem(`legodle_daily_status_${dateKey}`, nextStatus);

      // Record final statistics on terminal guess win/loss
      if (nextStatus !== 'PLAYING') {
        const freshStats = recordFinishedGame(stats, nextStatus === 'WON', updatedGuesses.length, dateKey);
        setStats(freshStats);
      }
    } else {
      setPracticeGuesses(updatedGuesses);
      setPracticeStatus(nextStatus);
    }
  };

  const currentGuessesCount = activeGuesses.length;
  const emptyRowsCount = Math.max(0, 6 - currentGuessesCount);

  // Set of guessed brick IDs to exclude from recommendations dropdown list
  const guessedIds = new Set<string>(activeGuesses.map((g) => g.setId));

  return (
    <div className="min-h-screen bg-[#f7fafa] text-[#191c1d] flex flex-col relative" style={{
      backgroundImage: "radial-gradient(#d8dadb 2.5px, transparent 3px)",
      backgroundSize: "24px 24px"
    }}>
      {/* HEADER BAR */}
      <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-4 md:px-8 h-18 bg-white border-b-4 border-[#e0e3e4] shadow-[0_4px_0_rgba(0,0,0,0.06)]">
        {/* Left actions aligned left */}
        <div className="flex items-center gap-1 w-20 md:w-28">
          <button
            onClick={() => setHelpOpen(true)}
            className="p-2 aspect-square rounded-xl text-[#bb0026] hover:bg-neutral-100 transition-colors flex items-center justify-center cursor-pointer active:translate-y-0.5"
            title="How to Play"
          >
            <HelpCircle size={22} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Dynamic LEGODLE logo in blocks with Romanian Flag colors, centered perfectly */}
        <button 
          onClick={handleLogoClick}
          className="flex items-center gap-1 md:gap-1.5 select-none focus:outline-none transition-transform duration-200 hover:scale-105 cursor-pointer" 
          id="legodle-logo"
        >
          {['L', 'E', 'G', 'O', 'D', 'L', 'E'].map((char, index) => {
            // Romanian flag colors: LE (Blue) -> bg-[#002B7F], GOD (Yellow) -> bg-[#FCD116], LE (Red) -> bg-[#CE1126]
            let bgColor = 'bg-[#002B7F]';
            let textColor = 'text-white';
            if (index >= 2 && index <= 4) {
              bgColor = 'bg-[#FCD116]';
              textColor = 'text-neutral-900';
            } else if (index >= 5) {
              bgColor = 'bg-[#CE1126]';
              textColor = 'text-white';
            }

            return (
              <div
                key={index}
                className={`w-5.5 h-5.5 md:w-7 md:h-7 ${bgColor} ${textColor} rounded-[4px] md:rounded-[5px] flex items-center justify-center text-[10px] md:text-sm font-black leading-none shadow-[inset_0_1.5px_0_rgba(255,255,255,0.4),0_2px_0_rgba(0,0,0,0.15)] relative`}
              >
                {/* Micro stud dome on top of each block */}
                <div className="absolute top-[2.5px] md:top-1 w-1.2 h-1.2 md:w-1.5 md:h-1.5 rounded-full bg-white/20"></div>
                <span className="relative z-10 pt-0.5">{char}</span>
              </div>
            );
          })}
        </button>

        {/* Right side Fabi's Portfolio link aligned right */}
        <div className="flex items-center justify-end w-20 md:w-28">
          <a
            href="https://fabian.tipa-hub.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 aspect-square rounded-xl text-[#002B7F] hover:bg-neutral-100 transition-colors flex items-center justify-center cursor-pointer active:translate-y-0.5"
            title="Fabi's Portfolio"
          >
            <Globe size={22} className="stroke-[2.5]" />
          </a>
        </div>
      </header>

      {/* BODY GAME AREA */}
      {screen === 'HOME' ? (
        <main className="flex-1 mt-24 mb-24 flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 md:px-6 py-6 gap-8 animate-[fadeSlideIn_0.3s_ease-out]">
          
          {/* Main Large Hero Logo & Subtitle */}
          <div className="flex flex-col items-center text-center max-w-lg mb-4">
            <div className="flex items-center gap-1.5 md:gap-2.5 select-none mb-6">
              {['L', 'E', 'G', 'O', 'D', 'L', 'E'].map((char, index) => {
                // Romanian flag colors: LE (Blue) -> bg-[#002B7F], GOD (Yellow) -> bg-[#FCD116], LE (Red) -> bg-[#CE1126]
                let bgColor = 'bg-[#002B7F]';
                let textColor = 'text-white';
                if (index >= 2 && index <= 4) {
                  bgColor = 'bg-[#FCD116]';
                  textColor = 'text-neutral-900';
                } else if (index >= 5) {
                  bgColor = 'bg-[#CE1126]';
                  textColor = 'text-white';
                }

                return (
                  <div
                    key={index}
                    className={`w-9 h-9 md:w-14 md:h-14 ${bgColor} ${textColor} rounded-[6px] md:rounded-[10px] flex items-center justify-center text-sm md:text-2xl font-black leading-none shadow-[inset_0_2px_0_rgba(255,255,255,0.4),0_4px_0_rgba(0,0,0,0.15)] relative`}
                  >
                    {/* Micro stud dome on top of each block */}
                    <div className="absolute top-[4px] md:top-1.5 w-1.8 h-1.8 md:w-3 md:h-3 rounded-full bg-white/20"></div>
                    <span className="relative z-10 pt-0.5 md:pt-1">{char}</span>
                  </div>
                );
              })}
            </div>
            <h2 className="font-sans font-black text-2xl md:text-3xl text-[#191c1d] tracking-tight uppercase mb-3">
              Ready to construct?
            </h2>
            <p className="text-sm md:text-base text-neutral-500 font-semibold leading-relaxed">
              Solve daily brick puzzles, verify interactive attributes, and prove your master builder memory.
            </p>
          </div>

          {/* Red 3D Lego-brick Next LEGODLE Countdown clock */}
          <div className="bg-[#CE1126] px-6 py-5 md:py-6 rounded-2xl flex items-center justify-between gap-4 w-full max-w-3xl shadow-[0_6px_0_#9a0c1a,0_8px_16px_rgba(0,0,0,0.1)] relative overflow-hidden select-none border-b border-[#a10e1e]">
            {/* Stud background layout effect for lego vibe */}
            <div className="absolute top-[4px] left-[10%] w-2.5 h-2.5 rounded-full bg-white/5"></div>
            <div className="absolute top-[4px] left-[30%] w-2.5 h-2.5 rounded-full bg-white/5"></div>
            <div className="absolute top-[4px] left-[50%] w-2.5 h-2.5 rounded-full bg-white/5"></div>
            <div className="absolute top-[4px] left-[70%] w-2.5 h-2.5 rounded-full bg-white/5"></div>
            <div className="absolute top-[4px] left-[90%] w-2.5 h-2.5 rounded-full bg-white/5"></div>
            <div className="absolute bottom-[4px] left-[20%] w-2.5 h-2.5 rounded-full bg-white/5"></div>
            <div className="absolute bottom-[4px] left-[40%] w-2.5 h-2.5 rounded-full bg-white/5"></div>
            <div className="absolute bottom-[4px] left-[60%] w-2.5 h-2.5 rounded-full bg-white/5"></div>
            <div className="absolute bottom-[4px] left-[80%] w-2.5 h-2.5 rounded-full bg-white/5"></div>

            <div className="flex flex-col text-left relative z-10">
              <span className="text-[10px] md:text-sm font-black tracking-wider uppercase text-white/90 leading-none mb-1 md:mb-1.5">
                NEXT BRICK DROPS IN
              </span>
              <div className="font-sans font-black text-2xl md:text-4xl text-white tracking-widest flex items-center gap-0.5 leading-none">
                <span>{timeUntilMidnight.hours}</span>
                <span className="animate-[pulse_1s_infinite]">:</span>
                <span>{timeUntilMidnight.minutes}</span>
                <span className="animate-[pulse_1s_infinite]">:</span>
                <span>{timeUntilMidnight.seconds}</span>
              </div>
            </div>

            <div className="relative z-10 mr-1 shrink-0 md:scale-110">
              <Timer size={36} className="text-white stroke-[2.2]" />
            </div>
          </div>

          {/* Three Mode Cards Hierarchy */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
            {/* Mode 1 COMPLETED ACTIVE MODE : Classic Legodle */}
            <button
              onClick={() => setScreen('GAME')}
              className="text-left bg-white border-4 border-[#e0e3e4] hover:border-[#002B7F] hover:-translate-y-1 p-6 rounded-2xl transition-all cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-md select-none focus:outline-none"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#002B7F] flex items-center justify-center text-white mb-5 border-b-4 border-[#001D57] shadow-sm">
                  <Play size={22} className="fill-current stroke-[2.5] ml-0.5" />
                </div>
                <h3 className="font-sans font-black text-lg text-[#191c1d] uppercase tracking-wide group-hover:text-[#002B7F] transition-colors mb-2">
                  Classic Guess
                </h3>
                <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
                  Analyze relative years, piece counts, themes, and minifigures to uncover the target set.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-black uppercase text-[#002B7F] group-hover:text-[#bb0026] transition-colors">
                Play Now
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div>
              </div>
            </button>

            {/* Mode 2: Guess the Pieces */}
            <button
              onClick={() => setScreen('GUESS_PIECES')}
              className="text-left bg-white border-4 border-[#e0e3e4] hover:border-[#0e59c3] hover:-translate-y-1 p-6 rounded-2xl transition-all cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-md select-none focus:outline-none"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#0e59c3] flex items-center justify-center text-white mb-5 border-b-4 border-[#003da1] shadow-sm">
                  <Puzzle size={22} className="stroke-[2.5]" />
                </div>
                <h3 className="font-sans font-black text-lg text-[#191c1d] uppercase tracking-wide group-hover:text-[#0e59c3] transition-colors mb-2">
                  Guess Pieces
                </h3>
                <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
                  Identify exact part details, custom components, and color configurations of a selected model.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-black uppercase text-[#0e59c3] group-hover:text-[#bb0026] transition-colors">
                Play Now
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div>
              </div>
            </button>

            {/* Mode 3: Surprise Mode (LOCKED COMING SOON) */}
            <div className="bg-[#eceeeef0] border-4 border-[#e5e7eb] p-6 rounded-2xl relative flex flex-col justify-between select-none opacity-80 shadow-inner">
              <span className="absolute top-4 right-4 bg-amber-500 border border-amber-600 text-white text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded-[6px] shadow-sm">
                Coming Soon
              </span>
              <div>
                <div className="w-12 h-12 rounded-xl bg-neutral-300 flex items-center justify-center text-neutral-500 mb-5 border-b-4 border-neutral-450 shadow-sm">
                  <Sparkles size={22} className="stroke-[2.5]" />
                </div>
                <h3 className="font-sans font-black text-lg text-neutral-500 uppercase tracking-wide mb-2">
                  Surprise Mode
                </h3>
                <p className="text-xs text-neutral-400 font-semibold leading-relaxed">
                  Unpredictable layouts, rare vintage sets, or micro-scale community brick designs.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-black uppercase text-neutral-500">
                <Lock size={12} className="stroke-[2.5]" />
                Locked
              </div>
            </div>
          </div>

          {/* View Archive Button */}
          <button
            onClick={() => setScreen('ARCHIVE')}
            className="w-full max-w-3xl text-center bg-white hover:bg-neutral-50 border-4 border-[#e0e3e4] hover:border-[#002B7F] text-[#191c1d] font-black text-xs uppercase py-3.5 rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.03)] hover:shadow-md transition-all active:translate-y-0.5 flex items-center justify-center gap-2 select-none cursor-pointer"
          >
            <Clock size={14} className="text-[#002B7F]" />
            View Puzzle Archive
          </button>

          {/* Other Projects Section designed beautifully with Lego/Hackclub Vibe */}
          <div className="w-full max-w-3xl mt-6 border-t-4 border-[#e0e3e4] pt-8 flex flex-col items-center">
            <h3 className="font-sans font-black text-2xl md:text-3xl text-[#191c1d] tracking-tight uppercase mb-6 text-center">
              Some more projects you might enjoy
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-6">
              {/* Card 1: FTC Games */}
              <a
                href="https://ftc-games.tipa-hub.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-left bg-white border-4 border-[#e0e3e4] hover:border-[#0e59c3] hover:-translate-y-1 p-6 rounded-2xl transition-all flex flex-col justify-between group shadow-sm hover:shadow-md select-none outline-none"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#0e59c3] flex items-center justify-center text-white mb-5 border-b-4 border-[#003da1] shadow-sm">
                    <Puzzle size={22} className="stroke-[2.5]" />
                  </div>
                  <h3 className="font-sans font-black text-lg text-[#191c1d] uppercase tracking-wide group-hover:text-[#0e59c3] transition-colors mb-2">
                    FTC Games
                  </h3>
                  <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
                    A gamified STEM learning platform built for a robotics team and their community. FTC: Daily Word Games.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-xs font-black uppercase text-[#0e59c3] group-hover:text-[#bb0026] transition-colors">
                  Check Out
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0e59c3] animate-ping"></div>
                </div>
              </a>

              {/* Card 2: eID Reader */}
              <a
                href="https://play.google.com/store/apps/details?id=com.TFAStudios.eidreadermobile&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="text-left bg-white border-4 border-[#e0e3e4] hover:border-[#CE1126] hover:-translate-y-1 p-6 rounded-2xl transition-all flex flex-col justify-between group shadow-sm hover:shadow-md select-none outline-none"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#CE1126] flex items-center justify-center text-white mb-5 border-b-4 border-[#9a0c1a] shadow-sm">
                    <Globe size={22} className="stroke-[2.5]" />
                  </div>
                  <h3 className="font-sans font-black text-lg text-[#191c1d] uppercase tracking-wide group-hover:text-[#CE1126] transition-colors mb-2">
                    eID Reader
                  </h3>
                  <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
                    A standards-compliant Android app that reads eIDs and ePassports via NFC, no hardware needed.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-xs font-black uppercase text-[#CE1126] group-hover:text-[#bb0026] transition-colors">
                  Check Out
                  <div className="w-1.5 h-1.5 rounded-full bg-[#CE1126] animate-ping"></div>
                </div>
              </a>

              {/* Card 3: Mind Metric */}
              <a
                href="https://mind-metric.tipa-hub.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-left bg-white border-4 border-[#e0e3e4] hover:border-[#FCD116] hover:-translate-y-1 p-6 rounded-2xl transition-all flex flex-col justify-between group shadow-sm hover:shadow-md select-none outline-none"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#FCD116] flex items-center justify-center text-neutral-900 mb-5 border-b-4 border-[#c7a107] shadow-sm">
                    <Sparkles size={22} className="stroke-[2.5]" />
                  </div>
                  <h3 className="font-sans font-black text-lg text-[#191c1d] uppercase tracking-wide group-hover:text-amber-500 transition-colors mb-2">
                    Mind Metric
                  </h3>
                  <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
                    A psychometric personality test that profiles your social style and emotional patterns.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-xs font-black uppercase text-amber-500 group-hover:text-[#bb0026] transition-colors font-extrabold">
                  Check Out
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></div>
                </div>
              </a>
            </div>

            {/* View More Full-Width Button */}
            <a
              href="https://fabian.tipa-hub.com/projects"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center bg-neutral-900 hover:bg-neutral-850 border-b-4 border-neutral-950 text-white font-black text-xs uppercase py-3.5 rounded-xl shadow-md transition-all active:translate-y-0.5 active:border-b-0 flex items-center justify-center gap-2 select-none cursor-pointer"
            >
              View More
              <ExternalLink size={14} />
            </a>
          </div>
        </main>
      ) : screen === 'GUESS_PIECES' ? (
        <GuessPiecesGame onBackToHome={handleBackToHome} archiveDate={archiveDate} />
      ) : screen === 'ARCHIVE' ? (
        <main className="flex-1 mt-24 mb-24 flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 md:px-6 py-6 gap-6 animate-[fadeSlideIn_0.3s_ease-out]">
          
          {/* Header Title with Clock symbol representing Time/Archive */}
          <div className="flex items-center justify-center gap-3 mb-1 select-none">
            <Clock size={28} className="text-[#002B7F] shrink-0" />
            <h2 className="font-sans font-black text-2xl md:text-3xl text-[#191c1d] tracking-tight uppercase text-center">
              Daily Puzzle Archive
            </h2>
          </div>
          <p className="text-xs text-neutral-500 font-semibold text-center max-w-md mb-2">
            Step back in time to play previous daily challenges since June 1st, 2026. Put your memory to the test!
          </p>

          {/* List of archive dates */}
          <div className="w-full flex flex-col gap-4">
            {getArchiveDays().map((dateVal) => {
              const puzzle = getDailyPuzzle(dateVal);
              const piecesNum = getPiecesPuzzleNumber(dateVal);
              
              // Load historical solved states
              const classicStatusStr = localStorage.getItem(`legodle_daily_status_${puzzle.dateString}`);
              const piecesStateStr = localStorage.getItem(`legodle_pieces_daily_state_${piecesNum}`);
              let piecesStatusStr = null;
              if (piecesStateStr) {
                try {
                  piecesStatusStr = JSON.parse(piecesStateStr).status;
                } catch(e) {}
              }

              // Human formatted date: Monday, June 1, 2026
              const formattedDate = dateVal.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              });

              // Check if it's the actual current daily date
              const todayDateString = getDailyPuzzle().dateString;
              const isToday = puzzle.dateString === todayDateString;

              return (
                <div 
                  key={puzzle.dateString} 
                  className={`w-full bg-white border-4 ${
                    isToday ? 'border-[#CE1126] shadow-[0_4px_12px_rgba(206,17,38,0.08)]' : 'border-[#e0e3e4]'
                  } p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-sans font-black text-sm text-[#191c1d] uppercase tracking-wide">
                        {formattedDate}
                      </span>
                      {isToday && (
                        <span className="text-[9px] font-black uppercase text-white bg-[#CE1126] px-1.5 py-0.5 rounded border border-red-200 animate-pulse">
                          Today
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 font-bold uppercase tracking-wider">
                      <span>Classic Guess #{puzzle.puzzleNumber}</span>
                      <span>&bull;</span>
                      <span>Guess Pieces #{piecesNum}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Play Classic button with state preservation feedback */}
                    <button
                      onClick={() => playClassicArchive(dateVal)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:translate-y-0.5 shadow-sm border-b-4 ${
                        classicStatusStr === 'WON'
                          ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-700 text-white'
                          : classicStatusStr === 'LOST'
                          ? 'bg-neutral-400 hover:bg-neutral-500 border-neutral-600 text-white'
                          : 'bg-[#002B7F] hover:bg-[#00205f] border-[#001D57] text-white'
                      }`}
                    >
                      Classic {classicStatusStr === 'WON' ? '🏆' : classicStatusStr === 'LOST' ? '💀' : 'Play'}
                    </button>

                    {/* Play Guess Pieces button inside archive */}
                    <button
                      onClick={() => playPiecesArchive(dateVal)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:translate-y-0.5 shadow-sm border-b-4 ${
                        piecesStatusStr === 'WON'
                          ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-700 text-white'
                          : piecesStatusStr === 'LOST'
                          ? 'bg-neutral-400 hover:bg-neutral-500 border-neutral-600 text-white'
                          : 'bg-[#0e59c3] hover:bg-[#0c4ca5] border-[#003da1] text-white'
                      }`}
                    >
                      Pieces {piecesStatusStr === 'WON' ? '🏆' : piecesStatusStr === 'LOST' ? '💀' : 'Play'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Back Button to return home */}
          <button
            onClick={handleBackToHome}
            className="w-full max-w-sm mt-4 bg-[#002B7F] hover:bg-[#00205f] text-white font-black text-xs uppercase py-3.5 rounded-xl border-b-4 border-[#001D57] shadow-md transition-all active:translate-y-0.5 active:border-b-0 flex items-center justify-center gap-2 select-none cursor-pointer"
          >
            <ArrowLeft size={14} className="stroke-[2.5]" />
            Return to Main Menu
          </button>

        </main>
      ) : screen === 'TERMS' ? (
        <main className="flex-1 mt-24 mb-24 flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 md:px-6 py-6 gap-6 animate-[fadeSlideIn_0.3s_ease-out]">
          
          {/* Header Title with Scale symbol representing Legal/Terms */}
          <div className="flex items-center justify-center gap-3 mb-2 select-none">
            <Scale size={28} className="text-[#002B7F] shrink-0" />
            <h2 className="font-sans font-black text-2xl md:text-3xl text-[#191c1d] tracking-tight uppercase text-center">
              Terms &amp; Conditions
            </h2>
          </div>

          {/* Core Terms Card content */}
          <div className="w-full bg-white border-4 border-[#e0e3e4] p-6 md:p-10 rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.03)] font-sans text-sm text-neutral-600 leading-relaxed space-y-5">
            <p className="font-bold text-neutral-800 text-base">
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

            <div className="pt-6 border-t border-neutral-200 text-center text-xs text-neutral-400 font-bold uppercase tracking-widest select-none">
              Last Updated &bull; June 2026
            </div>
          </div>

          {/* Action Back Button */}
          <button
            onClick={() => setScreen('HOME')}
            className="w-full max-w-sm bg-[#002B7F] hover:bg-[#00205f] text-white font-black text-xs uppercase py-3.5 rounded-xl border-b-4 border-[#001D57] shadow-md transition-all active:translate-y-0.5 active:border-b-0 flex items-center justify-center gap-2 select-none cursor-pointer animate-pulse hover:animate-none"
          >
            <ArrowLeft size={14} className="stroke-[2.5]" />
            Return to Main Menu
          </button>

        </main>
      ) : screen === 'PRIVACY' ? (
        <main className="flex-1 mt-24 mb-24 flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 md:px-6 py-6 gap-6 animate-[fadeSlideIn_0.3s_ease-out]">
          
          {/* Header Title with Shield check representing Privacy safety */}
          <div className="flex items-center justify-center gap-3 mb-2 select-none">
            <ShieldCheck size={28} className="text-[#CE1126] shrink-0" />
            <h2 className="font-sans font-black text-2xl md:text-3xl text-[#191c1d] tracking-tight uppercase text-center">
              Privacy Policy
            </h2>
          </div>

          {/* Core Privacy Card content */}
          <div className="w-full bg-white border-4 border-[#e0e3e4] p-6 md:p-10 rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.03)] font-sans text-sm text-neutral-600 leading-relaxed space-y-5">
            <p className="font-bold text-neutral-800 text-base">
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

            <h3 className="font-black text-[#191c1d] uppercase tracking-wider text-xs pt-2">
              3. No Cookies or Trackers (Zero Tracking)
            </h3>
            <p>
              We do not use advertising cookies or behavior-tracking pixels. Fabi designed LEGODLE with strict respect for user data, allowing you to enjoy pure, clean puzzle fun with zero commercial telemetry.
            </p>

            <h3 className="font-black text-neutral-800 uppercase tracking-wider text-xs pt-2">
              4. External Website Resource Safety
            </h3>
            <p>
              If you click on external resources or social sharing links (such as Reddit or Discord), those separate systems operate under their own independent privacy agreements.
            </p>

            <div className="pt-6 border-t border-neutral-200 text-center text-xs text-neutral-400 font-bold uppercase tracking-widest select-none">
              Last Updated &bull; June 2026
            </div>
          </div>

          {/* Action Back Button */}
          <button
            onClick={() => setScreen('HOME')}
            className="w-full max-w-sm bg-[#CE1126] hover:bg-[#a10d1d] text-white font-black text-xs uppercase py-3.5 rounded-xl border-b-4 border-[#780a15] shadow-md transition-all active:translate-y-0.5 active:border-b-0 flex items-center justify-center gap-2 select-none cursor-pointer animate-pulse hover:animate-none"
          >
            <ArrowLeft size={14} className="stroke-[2.5]" />
            Return to Main Menu
          </button>

        </main>
      ) : (
        <main className="flex-1 mt-22 mb-28 flex flex-col items-center justify-start w-full max-w-2xl mx-auto px-4 md:px-6 gap-6 animate-[fadeSlideIn_0.2s_ease-out]">
          
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
                onClick={handleBackToHome}
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-black text-[10px] uppercase py-1.5 px-3 rounded-lg border-b-2 border-neutral-950 shadow-sm active:translate-y-0.5 cursor-pointer whitespace-nowrap"
              >
                Return to Live Day
              </button>
            </div>
          )}

          {/* Toggle Mode: Daily vs Practice training selector */}
          <div className="w-full flex justify-center">
            <div className="bg-[#eceeef] p-1 rounded-2xl border-2 border-[#e0e3e4] flex gap-1 relative shadow-inner">
              <button
                onClick={() => setGameMode('DAILY')}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  gameMode === 'DAILY'
                    ? 'bg-[#bb0026] text-white shadow-[0_3px_0_#92001b] border-b border-[#92001b]'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Zap size={14} className={gameMode === 'DAILY' ? 'animate-bounce' : ''} />
                Daily Puzzle #{dailyPuzzle.puzzleNumber}
              </button>
              <button
                onClick={() => setGameMode('PRACTICE')}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  gameMode === 'PRACTICE'
                    ? 'bg-[#0e59c3] text-white shadow-[0_3px_0_#004298] border-b border-[#004298]'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <RefreshCw size={14} className={gameMode === 'PRACTICE' ? 'animate-spin' : ''} />
                Practice Freeplay
              </button>
            </div>
          </div>

          {/* Practice game mode info alert */}
          {gameMode === 'PRACTICE' && (
            <div className="w-full justify-between items-center bg-blue-50 border-2 border-[#5d93ff] rounded-xl p-3 text-sm flex gap-3 text-[#002b69] font-medium shadow-sm leading-relaxed">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-[#0e59c3] inline-block flex-shrink-0" />
                <span>Practice mode guesses won't affect daily statistics. Guess any iconic sets infinitely!</span>
              </div>
              <button
                onClick={resetPracticeGame}
                className="bg-[#0e59c3] hover:bg-[#0c4ca5] text-white text-[10px] font-black uppercase py-1.5 px-3 rounded-lg border-b-2 border-[#004298] shadow-sm flex items-center gap-1 cursor-pointer select-none active:translate-y-0.5 active:border-b-0"
              >
                <RefreshCw size={10} />
                Reset Set
              </button>
            </div>
          )}

          {/* ACTIVE GAMEPLAY SEARCH BOX & HINT (If game is still active) */}
          {activeStatus === 'PLAYING' && (
            <div className="w-full flex flex-col gap-4">
              {/* Auto-suggest Input search tray */}
              <div className="w-full">
                <AutocompleteSearch
                  legoSets={LEGO_SETS}
                  onGuess={handleGuessSubmit}
                  disabled={false}
                  guessedIds={guessedIds}
                />
              </div>

              {/* Interactive hint or clue details under search bar */}
              <div className="w-full">
                {currentGuessesCount >= 3 ? (
                  <div>
                    {!showHint ? (
                      <button
                        onClick={() => setShowHint(true)}
                        className="w-full bg-[#caa802] hover:bg-[#baa006] text-[#4c3e00] font-bold text-xs uppercase py-3.5 px-5 rounded-xl border-b-4 border-[#554500] shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:translate-y-0.5 active:border-b-0"
                      >
                        <Lightbulb size={14} className="stroke-[2.5]" />
                        Stuck? Reveal target fact hint
                      </button>
                    ) : (
                      <div className="w-full p-4 bg-amber-50 rounded-xl border border-amber-300 text-sm font-semibold text-neutral-700 flex items-start gap-2.5 shadow-sm leading-relaxed animate-[fadeSlideIn_0.2s_ease-out]">
                        <Lightbulb size={20} className="text-[#caa802] flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-black text-[#caa802] block uppercase tracking-widest mb-1 leading-none">
                            Riddle Clue Unlocked
                          </span>
                          <span>"{activeTargetSet.hint}"</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-[#9e9e9e] uppercase tracking-widest text-center py-2">
                    Use {3 - currentGuessesCount} more guess{3 - currentGuessesCount > 1 ? 'es' : ''} to unlock a clue hint
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Main physical Board Baseplate container (Guessing grid) */}
          <div className="w-full flex flex-col gap-3 bg-[#eceeef] border-4 border-[#e0e3e4] hover:border-neutral-300 p-4 md:p-5 rounded-2xl shadow-[0_8px_0_rgba(0,0,0,0.06),inset_0_-4px_0_rgba(0,0,0,0.05)] relative transition-all">
            
            {/* Column metadata titles headers */}
            <div className="grid grid-cols-5 gap-1.5 md:gap-brick-gap text-center font-sans">
              {['Set ID', 'Year', 'Pieces', 'Theme', 'Minifigs'].map((col, cIdx) => (
                <span key={cIdx} className="text-[10px] md:text-xs font-black text-neutral-450 uppercase tracking-widest">
                  {col}
                </span>
              ))}
            </div>

            {/* Active Guesses list container */}
            <div className="flex flex-col gap-2.5 mt-1">
              {activeGuesses.map((guess, idx) => (
                <GuessRow key={guess.setId} guess={guess} index={idx} />
              ))}

              {/* Empty block rows slots visual representation */}
              {Array.from({ length: emptyRowsCount }).map((_, i) => (
                <EmptyRow key={i} />
              ))}
            </div>

          </div>

          {/* Post-game Reveal Outcome details section placed beautifully below the grid */}
          {activeStatus !== 'PLAYING' && (
            <div id="reveal-section" className="w-full">
              <MysterySetReveal
                targetSet={activeTargetSet}
                guesses={activeGuesses}
                won={activeStatus === 'WON'}
                puzzleNumber={dailyPuzzle.puzzleNumber}
              />
            </div>
          )}

        </main>
      )}

      {/* FOOTER METADATA */}
      <footer className="w-full bg-white border-t-4 border-[#e0e3e4] py-6 flex flex-col items-center justify-center gap-3 shadow-[0_-4px_8px_rgba(0,0,0,0.03)] px-4 mt-auto select-none">
        <p className="text-xs font-black text-neutral-450 uppercase tracking-wider text-center">
          LEGODLE &copy; 2026. All rights reserved. Created by <a href="https://fabian.tipa-hub.com/" target="_blank" rel="noopener noreferrer" className="text-[#002B7F] hover:underline hover:text-[#CE1126] transition-colors">Fabi</a>.
        </p>
        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-wider text-neutral-400">
          <button
            onClick={() => setScreen('TERMS')}
            className={`hover:text-[#002B7F] cursor-pointer transition-colors focus:outline-none ${screen === 'TERMS' ? 'text-[#002B7F]' : ''}`}
          >
            Terms &amp; Conditions
          </button>
          <span className="text-neutral-300 select-none">&bull;</span>
          <button
            onClick={() => setScreen('PRIVACY')}
            className={`hover:text-[#CE1126] cursor-pointer transition-colors focus:outline-none ${screen === 'PRIVACY' ? 'text-[#CE1126]' : ''}`}
          >
            Privacy Policy
          </button>
        </div>
      </footer>

      {/* MODAL POPUPS FOR TUTORIALS AND POLICIES */}
      <HelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </div>
  );
}
