import type { PlayerColor, TableIntents, TableIntentType } from '@scribble-table/protocol';

export type { PlayerColor };

// Asks the table for something (an intent); the answer comes back in the next snapshot.
export type TableSend = <T extends TableIntentType>(type: T, message: TableIntents[T]) => void;

// Reconnecting: the connection dropped and the table holds their seat for a while.
export type PresenceStatus = 'online' | 'reconnecting';

// What the board holds: strokes (which grow while they're drawn) and paint-bucket fills.
// Colours and sizes are positions in the protocol's `inkColors` and `brushSizes`.
export interface StrokeAction {
  kind: 'stroke';
  id: string;
  color: number;
  size: number;
  eraser: boolean;
  // x, y pairs in board units.
  points: number[];
}

export interface FillAction {
  kind: 'fill';
  id: string;
  x: number;
  y: number;
  color: number;
}

export type BoardAction = StrokeAction | FillAction;
