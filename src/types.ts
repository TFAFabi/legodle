export interface LegoSet {
  id: string; // Set number, e.g., "75192"
  name: string;
  year: number;
  theme: string;
  piece_count: number;
  minifigure_count: number;
  hint?: string;
  colorTheme?: string; // Dominant colors for rendering brick representations, e.g., "red-yellow"
  imagePrompt?: string; // Short descriptor of structure
}

export type FeedbackType = 'correct' | 'higher' | 'lower' | 'incorrect';

export interface AttributeState<T> {
  value: T;
  feedback: FeedbackType;
}

export interface GuessFeedback {
  setId: string;
  name: string;
  year: AttributeState<number>;
  piece_count: AttributeState<number>;
  theme: AttributeState<string>;
  minifigure_count: AttributeState<number>;
}

export interface PlayerStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: { [key: number]: number };
  lastPlayedDate?: string; // To track daily completion
}

export interface GameState {
  guesses: GuessFeedback[];
  status: 'PLAYING' | 'WON' | 'LOST';
  targetSet: LegoSet;
  puzzleNumber: number;
}
