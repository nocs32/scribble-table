// The game's phases, settings and timings (spec §4–§5).

export const gamePhases = ['lobby', 'choosing', 'drawing', 'reveal', 'podium'] as const;

export type GamePhase = (typeof gamePhases)[number];

// Every word comes in both languages; each player sees it in their own (spec D9).
export const wordLanguages = ['en', 'uk'] as const;

export type WordLanguage = (typeof wordLanguages)[number];

export type WordForms = Record<WordLanguage, string>;

export type WordDifficulty = 'easy' | 'medium' | 'hard';

export interface WordChoice {
  forms: WordForms;
  difficulty: WordDifficulty;
}

export interface GameSettings {
  rounds: number;
  drawSeconds: number;
  wordChoices: number;
  hints: boolean;
  customWords: string[];
  onlyCustomWords: boolean;
  // Players who guessed may scribble on the board and play tricks (spec D18).
  sabotage: boolean;
}

export type GameSettingKey = keyof GameSettings;

export const gameLimits = {
  rounds: { min: 1, max: 10 },
  drawSeconds: { min: 30, max: 180, step: 10 },
  wordChoices: { min: 1, max: 5 },
  customWords: { max: 200, maxLength: 30, minForOnly: 10 },
  // A game needs at least this many people at the table.
  minPlayers: 2,
  chooseSeconds: 15,
  revealSeconds: 5,
  // Each player who guessed may play this many tricks a turn.
  tricksPerTurn: 1,
} as const;

export const defaultGameSettings: GameSettings = {
  rounds: 3,
  drawSeconds: 80,
  wordChoices: 3,
  hints: true,
  customWords: [],
  onlyCustomWords: false,
  sabotage: true,
};

// Tricks a player who guessed can play (spec D18). Board tricks show on everyone's board; pen
// tricks bend the drawer's pen.
export const boardTricks = ['splat', 'flip', 'fold'] as const;
export const penTricks = ['shake', 'mirror'] as const;
export const trickKinds = [...boardTricks, ...penTricks] as const;

export type TrickKind = (typeof trickKinds)[number];

// How long each trick lasts.
export const trickSeconds: Record<TrickKind, number> = { splat: 6, flip: 5, fold: 7, shake: 6, mirror: 6 };

export const isPenTrick = (kind: TrickKind): boolean => (penTricks as readonly TrickKind[]).includes(kind);

// Why a turn ended. `everyone`: all the guessers got it; `gaveUp`: nobody was left guessing,
// because some of them gave up.
export type TurnEndReason = 'time' | 'everyone' | 'gaveUp' | 'drawerLeft';
