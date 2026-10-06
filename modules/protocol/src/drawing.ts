// The shared drawing board (spec §6). Everything is in board units, so a line lands in the same
// place on every screen; colours and sizes travel as positions in these lists.

export const boardWidth = 800;
export const boardHeight = 600;

// The 16 inks. Their colours live in the web app's Panda tokens (`ink.*`).
export const inkColors = [
  'black',
  'charcoal',
  'gray',
  'silver',
  'white',
  'red',
  'orange',
  'yellow',
  'lime',
  'green',
  'teal',
  'sky',
  'blue',
  'violet',
  'pink',
  'brown',
] as const;

export type InkColor = (typeof inkColors)[number];

// Brush diameters, in board units.
export const brushSizes = [4, 10, 22, 44] as const;

// Points in one stroke batch (spec §9.5). A batch goes out every 50 ms, so this is generous.
export const strokeBatchMaxPoints = 200;

export type BoardTool = 'brush' | 'eraser' | 'fill';

// New points of one stroke: x, y pairs in board units. The first batch of a stroke starts it.
export interface StrokeBatch {
  strokeId: string;
  color: number;
  size: number;
  eraser: boolean;
  points: number[];
}

export interface BoardFill {
  id: string;
  x: number;
  y: number;
  color: number;
}

// What someone did on the board (the drawer, or a player who guessed and is sabotaging), passed
// on to everyone else. `undo` names the drawer's action it takes away.
export type BoardOp =
  | { type: 'stroke'; authorId: string; batch: StrokeBatch }
  | { type: 'fill'; authorId: string; fill: BoardFill }
  | { type: 'undo'; id: string }
  | { type: 'clear' };

// What the board holds: strokes (which grow while they're drawn) and paint-bucket fills, each with
// who made it (the drawer, or a saboteur). Colours and sizes are positions in `inkColors` and
// `brushSizes`.
export interface StrokeAction {
  kind: 'stroke';
  id: string;
  authorId: string;
  color: number;
  size: number;
  eraser: boolean;
  // x, y pairs in board units.
  points: number[];
}

export interface FillAction {
  kind: 'fill';
  id: string;
  authorId: string;
  x: number;
  y: number;
  color: number;
}

export type BoardAction = StrokeAction | FillAction;
