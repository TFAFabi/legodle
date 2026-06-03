import { LegoSet, GuessFeedback, FeedbackType, PlayerStats } from './types';
import { LEGO_SETS } from './data';

// Deterministic daily puzzle selector
export function getDailyPuzzle(overrideDate?: Date) {
  const date = overrideDate || new Date();
  
  // Create a local date key (YYYY-MM-DD) so it resets at local midnight
  const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  
  // Hash function to select a set deterministically
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const totalSets = LEGO_SETS.length;
  const index = Math.abs(hash) % totalSets;
  
  // Generate a fun puzzle number based on days since a reference epoch (June 1, 2026)
  const epoch = new Date(2026, 5, 1, 0, 0, 0, 0).getTime(); // June 1, 2026 (Month is 0-indexed)
  const todayMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
  const diffTime = Math.max(0, todayMidnight - epoch);
  const puzzleNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return {
    targetSet: LEGO_SETS[index],
    puzzleNumber,
    dateString,
  };
}

// Compare a guessed set with the target set
export function compareGuess(guess: LegoSet, target: LegoSet): GuessFeedback {
  const getNumFeedback = (gVal: number, tVal: number): FeedbackType => {
    if (gVal === tVal) return 'correct';
    return tVal > gVal ? 'higher' : 'lower';
  };

  const getThemeFeedback = (gVal: string, tVal: string): FeedbackType => {
    return gVal.toLowerCase() === tVal.toLowerCase() ? 'correct' : 'incorrect';
  };

  return {
    setId: guess.id,
    name: guess.name,
    year: {
      value: guess.year,
      feedback: getNumFeedback(guess.year, target.year),
    },
    piece_count: {
      value: guess.piece_count,
      feedback: getNumFeedback(guess.piece_count, target.piece_count),
    },
    theme: {
      value: guess.theme,
      feedback: getThemeFeedback(guess.theme, target.theme),
    },
    minifigure_count: {
      value: guess.minifigure_count,
      feedback: getNumFeedback(guess.minifigure_count, target.minifigure_count),
    },
  };
}

// Local storage management for stats
const STATS_KEY = "legodle_player_stats_v1";

export function loadStats(): PlayerStats {
  try {
    const data = localStorage.getItem(STATS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Ensure guess distribution helper keys are fully present
      if (!parsed.guessDistribution) {
        parsed.guessDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      }
      return parsed;
    }
  } catch (e) {
    console.error("Could not load stats from localStorage", e);
  }

  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  };
}

export function saveStats(stats: PlayerStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Could not save stats to localStorage", e);
  }
}

// Record a new played game in player stats
export function recordFinishedGame(stats: PlayerStats, won: boolean, guessCount: number, dateKey: string): PlayerStats {
  // Prevent duplicate double-registration for the same date row to maintain accurate statistics
  if (stats.lastPlayedDate === dateKey) {
    return stats;
  }

  const updatedDistribution = { ...stats.guessDistribution };
  let currentStreak = stats.currentStreak;
  let wins = stats.wins;

  if (won) {
    wins += 1;
    currentStreak += 1;
    updatedDistribution[guessCount] = (updatedDistribution[guessCount] || 0) + 1;
  } else {
    currentStreak = 0;
  }

  const maxStreak = Math.max(stats.maxStreak, currentStreak);
  const played = stats.played + 1;

  const newStats: PlayerStats = {
    played,
    wins,
    currentStreak,
    maxStreak,
    guessDistribution: updatedDistribution,
    lastPlayedDate: dateKey,
  };

  saveStats(newStats);
  return newStats;
}
