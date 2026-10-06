import type { GameSettings, TableIntents, TableIntentType, TrickKind } from '@scribble-table/protocol';

export type DemoHandlers = { [K in TableIntentType]: (memberId: string, message: TableIntents[K]) => void };

// What the referee does when someone asks.
export interface DemoMoves {
  start: (memberId: string) => void;
  updateSettings: (memberId: string, patch: Partial<GameSettings>) => void;
  chooseWord: (memberId: string, index: number) => void;
  chat: (memberId: string, text: string) => void;
  giveUp: (memberId: string) => void;
  playTrick: (memberId: string, kind: TrickKind) => void;
  rename: (memberId: string, name: string) => void;
  playAgain: () => void;
}

const ignore = (): void => undefined;

// Each intent and the move that answers it. Board intents (the drawer's, or a saboteur's) and
// reactions matter only to other people, and at the demo table everyone else is a sample player.
// The demo sends everything as it changes, so `sync` has nothing to catch up on.
export const demoHandlers = (moves: DemoMoves): DemoHandlers => ({
  sync: ignore,
  start: (id) => moves.start(id),
  updateSettings: (id, patch) => moves.updateSettings(id, patch),
  chooseWord: (id, { index }) => moves.chooseWord(id, index),
  chat: (id, { text }) => moves.chat(id, text),
  giveUp: (id) => moves.giveUp(id),
  trick: (id, { kind }) => moves.playTrick(id, kind),
  rename: (id, { name }) => moves.rename(id, name),
  playAgain: () => moves.playAgain(),
  stroke: ignore,
  fill: ignore,
  undo: ignore,
  clear: ignore,
  react: ignore,
});
