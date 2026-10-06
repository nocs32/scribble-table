import type { BoardFill, StrokeBatch } from './drawing.js';
import type { GamePhase, GameSettingKey, GameSettings, TrickKind, TurnEndReason, WordChoice, WordForms } from './game.js';
import type { PlayerColor } from './players.js';

// What a table looks like to one person: shared state, plus the lines of the feed they may see.
// The web app's stores read only these shapes, so the demo referee and the real server are
// interchangeable behind them.

export interface MemberSnapshot {
  id: string;
  name: string;
  color: PlayerColor;
  connected: boolean;
  score: number;
}

export interface TurnGain {
  memberId: string;
  points: number;
}

export interface RevealSnapshot {
  word: WordForms;
  gains: TurnGain[];
  reason: TurnEndReason;
}

// A trick in play. `spot` picks where it lands (which corner folds, where the paint splats), so
// it lands in the same place on every screen.
export interface ActiveTrick {
  id: string;
  kind: TrickKind;
  fromId: string;
  endsAt: number;
  spot: number;
}

export interface GameSnapshot {
  phase: GamePhase;
  settings: GameSettings;
  // 1-based; 0 in the lobby.
  round: number;
  // Changes every turn, which clears the board.
  turnId: string;
  drawerId: string | null;
  // The word with hidden letters, in both languages; null until the drawer has picked.
  masks: WordForms | null;
  // When the current phase ends (choosing, drawing, reveal), in server time.
  endsAt: number | null;
  // Who guessed this turn, in order.
  guessedIds: string[];
  // Who gave up this turn: they score nothing, but see the word.
  gaveUpIds: string[];
  // Tricks still in play this turn, and who has played theirs.
  tricks: ActiveTrick[];
  trickedIds: string[];
  reveal: RevealSnapshot | null;
}

// What a system line says. Kept as data, so each viewer reads it in their own language.
export type FeedEvent =
  | { type: 'joined' }
  | { type: 'left' }
  | { type: 'renamed'; name: string }
  | { type: 'started'; rounds: number }
  | { type: 'drawing' }
  | { type: 'guessed' }
  | { type: 'gaveUp' }
  | { type: 'drew'; word: WordForms }
  | { type: 'setting'; setting: GameSettingKey; value: number | boolean }
  | { type: 'trick'; trick: TrickKind }
  // Only the guesser sees it.
  | { type: 'close'; guess: string };

// `guessed`: a line only those who know the word can see: the drawer, and whoever guessed it or gave up.
export type FeedAudience = 'everyone' | 'guessed';

interface FeedItemBase {
  id: string;
  authorId: string;
  // Their latest name and their colour, kept for when they're no longer at the table.
  authorName: string;
  authorColor: PlayerColor;
  at: number;
}

export type FeedItem =
  | (FeedItemBase & { kind: 'message'; text: string; audience: FeedAudience })
  | (FeedItemBase & { kind: 'system'; event: FeedEvent });

export interface TableSnapshot {
  members: MemberSnapshot[];
  game: GameSnapshot;
  feed: FeedItem[];
}

// Only for you: the words to choose from and, once you draw, have guessed or gave up, the word itself.
export interface TableSecret {
  choices: WordChoice[] | null;
  word: WordForms | null;
}

// Client → server. Intents only: the server works out every result (spec D5).
export interface TableIntents {
  start: Record<string, never>;
  updateSettings: Partial<GameSettings>;
  chooseWord: { index: number };
  chat: { text: string };
  giveUp: Record<string, never>;
  trick: { kind: TrickKind };
  stroke: StrokeBatch;
  fill: BoardFill;
  undo: Record<string, never>;
  clear: Record<string, never>;
  react: { emoji: string };
  rename: { name: string };
  playAgain: Record<string, never>;
}

export type TableIntentType = keyof TableIntents;

export interface TableReactionEvent {
  memberId: string;
  emoji: string;
}

export const chatMaxLength = 200;
