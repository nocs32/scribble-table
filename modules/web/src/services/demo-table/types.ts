import type {
  GamePhase,
  GameSettings,
  PlayerColor,
  RevealSnapshot,
  WordDifficulty,
  WordForms,
  WordLanguage,
} from '@scribble-table/protocol';
import type { Schedule } from '../types';

export interface DemoDeps {
  schedule: Schedule;
  random: () => number;
  now: () => number;
  createId: () => string;
}

export interface DemoMember {
  id: string;
  name: string;
  color: PlayerColor;
  score: number;
  connected: boolean;
  isBot: boolean;
  // The language a sample player guesses and chats in.
  language: WordLanguage;
}

export const demoSketchNames = [
  'snowman',
  'rainbow',
  'balloon',
  'glasses',
  'lollipop',
  'sailboat',
  'cactus',
  'candle',
  'mushroom',
  'ladder',
  'kite',
  'dice',
] as const;

export type DemoSketchName = (typeof demoSketchNames)[number];

export interface DemoWord {
  forms: WordForms;
  // Other answers that also count as right.
  alternatives: readonly string[];
  difficulty: WordDifficulty;
  // How a sample player draws it; null for custom words (they just scribble).
  sketch: DemoSketchName | null;
}

export type DemoSketchStep = { kind: 'stroke'; color: number; size: number; points: number[] } | { kind: 'fill'; x: number; y: number; color: number };

// The parts of the referee that the views read.
export interface DemoTableState {
  readonly members: readonly DemoMember[];
  readonly settings: GameSettings;
  readonly phase: GamePhase;
  readonly round: number;
  readonly turnId: string;
  readonly drawerId: string | null;
  readonly endsAt: number | null;
  readonly reveal: RevealSnapshot | null;
}
