import type { BoardOp } from './drawing.js';
import type { GamePhase, GameSettingKey, GameSettings, TrickKind, TurnEndReason, WordChoice, WordForms } from './game.js';
import type { PlayerColor } from './players.js';
import type { TableErrorCode } from './table-errors.js';
import type { TableIntentType } from './table-messages.js';

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

export interface TableReactionEvent {
  memberId: string;
  emoji: string;
}

// Feed lines a table keeps (and a browser shows); the oldest go first.
export const feedMaxItems = 200;

// Server → client events of the live table. The web app's table client turns them back into
// `TableSnapshot`s, so the stores read the same shapes as from the demo table.

// The shared part of the table, the same for everyone. `now` is the server's clock, so browsers
// can count down to `endsAt` (spec §9.4).
export interface TableViewEvent {
  now: number;
  members: MemberSnapshot[];
  game: GameSnapshot;
}

// Feed lines this person may see: new ones, or (`reset`) all of them, after joining or when
// guessed chat opens up to them.
export interface TableFeedEvent {
  reset: boolean;
  items: FeedItem[];
}

// The whole drawing of the turn (engine `encodeDrawing`), for a browser that joined or reloaded
// mid-turn (spec §6.3).
export interface TableDrawingEvent {
  turnId: string;
  bytes: Uint8Array;
}

// A refused intent, and which one it was.
export interface TableErrorEvent {
  code: TableErrorCode;
  type: TableIntentType;
}

export interface TableEvents {
  view: TableViewEvent;
  feed: TableFeedEvent;
  secret: TableSecret;
  board: BoardOp;
  drawing: TableDrawingEvent;
  reaction: TableReactionEvent;
  error: TableErrorEvent;
}
