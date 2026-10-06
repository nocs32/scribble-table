import { encodeDrawing } from '@scribble-table/engine';
import type { BoardAction, BoardFill, BoardOp, StrokeBatch } from '@scribble-table/protocol';
import { TableRoomError } from './error.js';

// What someone may do on the board this turn: the drawer anything, a saboteur only strokes.
export type TableRoomDrawingMove = 'stroke' | 'fill' | 'undo' | 'clear';

export interface TableRoomDrawingDeps {
  // Throws when this person may not make this move now (not their turn, no sabotage…).
  permit: (memberId: string, move: TableRoomDrawingMove) => void;
  maxActions: number;
  maxPoints: number;
}

// Board units are kept in halves (spec §6.3), so every screen and the catch-up bytes agree.
const half = (value: number): number => Math.round(value * 2) / 2;

// The turn's drawing (spec §6.3–§6.5): every stroke and fill with who made it, so latecomers and
// reloads get it all. Each move returns what to pass on to everyone else.
export class TableRoomDrawing {
  #actions: BoardAction[] = [];
  readonly #byId = new Map<string, BoardAction>();
  #points = 0;
  readonly #deps: TableRoomDrawingDeps;

  constructor(deps: TableRoomDrawingDeps) {
    this.#deps = deps;
  }

  get actions(): readonly BoardAction[] {
    return this.#actions;
  }

  // A new stroke, or more points of one this person started.
  stroke(authorId: string, batch: StrokeBatch): BoardOp {
    this.#deps.permit(authorId, 'stroke');

    const points = batch.points.map(half);
    const existing = this.#byId.get(batch.strokeId);

    if (existing && (existing.kind !== 'stroke' || existing.authorId !== authorId)) throw new TableRoomError('TAKEN_ID');

    this.#reserve(existing ? 0 : 1, points.length / 2);

    if (existing?.kind === 'stroke') existing.points.push(...points);
    else this.#add({ kind: 'stroke', id: batch.strokeId, authorId, color: batch.color, size: batch.size, eraser: batch.eraser, points });

    return { type: 'stroke', authorId, batch: { ...batch, points } };
  }

  fill(authorId: string, fill: BoardFill): BoardOp {
    this.#deps.permit(authorId, 'fill');

    if (this.#byId.has(fill.id)) throw new TableRoomError('TAKEN_ID');

    const placed = { ...fill, x: half(fill.x), y: half(fill.y) };

    this.#reserve(1, 0);
    this.#add({ kind: 'fill', authorId, ...placed });

    return { type: 'fill', authorId, fill: placed };
  }

  // Takes back this person's own last action; saboteurs' lines stay.
  undo(authorId: string): BoardOp {
    this.#deps.permit(authorId, 'undo');

    const index = this.#actions.findLastIndex((action) => action.authorId === authorId);
    const action = this.#actions[index];

    if (!action) throw new TableRoomError('NOTHING_TO_UNDO');

    this.#actions = this.#actions.filter((_, at) => at !== index);
    this.#byId.delete(action.id);
    this.#points -= action.kind === 'stroke' ? action.points.length / 2 : 0;

    return { type: 'undo', id: action.id };
  }

  clear(authorId: string): BoardOp {
    this.#deps.permit(authorId, 'clear');
    this.reset();

    return { type: 'clear' };
  }

  // A new turn: a blank board.
  reset(): void {
    this.#actions = [];
    this.#byId.clear();
    this.#points = 0;
  }

  encode(): Uint8Array {
    return encodeDrawing(this.#actions);
  }

  #reserve(actions: number, points: number): void {
    if (this.#actions.length + actions > this.#deps.maxActions || this.#points + points > this.#deps.maxPoints) throw new TableRoomError('BOARD_FULL');

    this.#points += points;
  }

  #add(action: BoardAction): void {
    this.#actions.push(action);
    this.#byId.set(action.id, action);
  }
}
