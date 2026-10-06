import { boardHeight, boardWidth, brushSizes, inkColors, type BoardOp, type BoardTool, type InkColor, type StrokeBatch } from '@scribble-table/protocol';
import { makeAutoObservable, observableShallow } from 'mobx';
import type { BoardSoundsService, Schedule } from '../../services';
import type { Translate } from '../locale';
import type { BoardAction, StrokeAction, TableSend } from './types';

export interface ToolView {
  tool: BoardTool;
  label: string;
  isSelected: boolean;
}

export interface ColorView {
  index: number;
  name: InkColor;
  label: string;
  isSelected: boolean;
}

export type SizeDot = 'xs' | 'sm' | 'md' | 'lg';

export interface SizeView {
  index: number;
  label: string;
  isSelected: boolean;
  // How big the dot on its button is.
  dot: SizeDot;
}

export interface RoomBoardDeps {
  t: Translate;
  send: TableSend;
  // The drawer, while drawing: every tool.
  isDrawer: () => boolean;
  // A player who guessed, with sabotage on: brush and eraser on the shared board (spec D18).
  canScribble: () => boolean;
  meId: () => string;
  // Tricks on the drawer's pen (shaky hand, mirror) move where a point lands.
  bend: (x: number, y: number) => [number, number];
  // The pencil, eraser and spray, for your strokes and the drawer's.
  sounds: BoardSoundsService;
  now: () => number;
  createId: () => string;
  schedule: Schedule;
}

// idle ⇄ stroking (your pointer is down on the board).
export type RoomBoardState = 'idle' | 'stroking';

export type BoardCursor = 'none' | 'brush' | 'fill';

const drawerTools: readonly BoardTool[] = ['brush', 'eraser', 'fill'];
const scribblerTools: readonly BoardTool[] = ['brush', 'eraser'];
const sizeDots: readonly SizeDot[] = ['xs', 'sm', 'md', 'lg'];
const toolKeys: Readonly<Record<string, BoardTool>> = { b: 'brush', e: 'eraser', f: 'fill' };

// Your stroke goes out in batches this often.
const flushMs = 50;
// Board units between two recorded points.
const minStep = 1.5;

const half = (value: number): number => Math.round(value * 2) / 2;

const clamp = (value: number, high: number): number => half(Math.min(high, Math.max(0, value)));

// The length of a line through flat [x, y, x, y, …] points, starting from `from` when given.
const pathLength = (points: readonly number[], from: readonly number[]): number => {
  const all = [...from, ...points];
  let length = 0;

  for (let index = 2; index + 1 < all.length; index += 2) {
    length += Math.hypot((all[index] ?? 0) - (all[index - 2] ?? 0), (all[index + 1] ?? 0) - (all[index - 1] ?? 0));
  }

  return length;
};

// The longest gap between two of your points that still counts as one movement, for the sound.
const maxGapMs = 80;

// The drawing: what's on the board (strokes and fills), your tool, colour and size, and your
// strokes going out to the table. `revision` changes when something is taken away (undo, clear,
// a new turn), so the canvas starts over; `version` changes with every new point.
export class RoomBoardStore {
  state: RoomBoardState = 'idle';
  actions: BoardAction[] = [];
  revision = 0;
  version = 0;
  tool: BoardTool = 'brush';
  color = inkColors.indexOf('black');
  size = 1;
  readonly #deps: RoomBoardDeps;
  #turnId = '';
  #live: StrokeAction | null = null;
  // Points of your current stroke already sent.
  #sent = 0;
  #lastPointAt = 0;
  #cancelFlush: (() => void) | null = null;

  constructor(deps: RoomBoardDeps) {
    this.#deps = deps;
    makeAutoObservable(this, { actions: observableShallow }, { autoBind: true });
  }

  get isDrawer(): boolean {
    return this.#deps.isDrawer();
  }

  // The drawer, or a saboteur.
  get canDraw(): boolean {
    return this.isDrawer || this.#deps.canScribble();
  }

  // Saboteurs have no fill: a fill tool left over from your own turn draws as a brush.
  get activeTool(): BoardTool {
    return this.tool === 'fill' && !this.isDrawer ? 'brush' : this.tool;
  }

  // What the canvas paints. It carries `version`, so the painter runs again on every new point.
  get drawing(): { actions: readonly BoardAction[]; revision: number; version: number } {
    return { actions: this.actions, revision: this.revision, version: this.version };
  }

  get cursor(): BoardCursor {
    if (!this.canDraw) return 'none';

    return this.activeTool === 'fill' ? 'fill' : 'brush';
  }

  get toolViews(): ToolView[] {
    return (this.isDrawer ? drawerTools : scribblerTools).map((tool) => ({ tool, label: this.#deps.t(`board.${tool}`), isSelected: tool === this.activeTool }));
  }

  get colorViews(): ColorView[] {
    return inkColors.map((name, index) => ({ index, name, label: this.#deps.t(`ink.${name}`), isSelected: index === this.color }));
  }

  get sizeViews(): SizeView[] {
    return brushSizes.map((_, index) => ({
      index,
      label: this.#deps.t('board.size', { number: index + 1 }),
      isSelected: index === this.size,
      dot: sizeDots[index] ?? 'lg',
    }));
  }

  // Undo takes back the drawer's own lines only; saboteurs' lines stay.
  get canUndo(): boolean {
    return this.isDrawer && this.actions.some((action) => action.authorId === this.#deps.meId());
  }

  get canClear(): boolean {
    return this.isDrawer && this.actions.length > 0;
  }

  selectTool(tool: BoardTool): void {
    this.tool = tool;
  }

  selectColor(index: number): void {
    this.color = index;

    if (this.tool === 'eraser') this.tool = 'brush';
  }

  selectSize(index: number): void {
    this.size = index;

    if (this.tool === 'fill') this.tool = 'brush';
  }

  // Pointer down at (x, y), in board units: a fill, or the start of a stroke.
  press(x: number, y: number): void {
    if (!this.canDraw || this.state !== 'idle') return;

    const [bx, by] = this.#deps.bend(x, y);
    const [px, py] = [clamp(bx, boardWidth), clamp(by, boardHeight)];
    const authorId = this.#deps.meId();

    if (this.activeTool === 'fill') {
      const fill = { id: this.#deps.createId(), x: px, y: py, color: this.color };

      this.actions.push({ kind: 'fill', authorId, ...fill });
      this.version += 1;
      this.#deps.send('fill', fill);
      this.#deps.sounds.spray();

      return;
    }

    this.#live = { kind: 'stroke', id: this.#deps.createId(), authorId, color: this.color, size: this.size, eraser: this.activeTool === 'eraser', points: [px, py] };
    this.#sent = 0;
    this.#lastPointAt = this.#deps.now();
    this.actions.push(this.#live);
    this.state = 'stroking';
    this.version += 1;
    this.#scheduleFlush();
  }

  drag(x: number, y: number): void {
    const live = this.#live;

    if (this.state !== 'stroking' || !live) return;

    const [bx, by] = this.#deps.bend(x, y);
    const [px, py] = [clamp(bx, boardWidth), clamp(by, boardHeight)];
    const [lastX, lastY] = live.points.slice(-2);
    const step = Math.hypot(px - (lastX ?? px), py - (lastY ?? py));
    const now = this.#deps.now();

    if (step < minStep) return;

    live.points.push(px, py);
    this.version += 1;
    this.#scheduleFlush();
    this.#deps.sounds.scratch(live.eraser, step, Math.min(maxGapMs, now - this.#lastPointAt));
    this.#lastPointAt = now;
  }

  release(): void {
    if (this.state !== 'stroking') return;

    this.flush();
    this.#live = null;
    this.state = 'idle';
  }

  // Sends the points of your stroke that haven't gone out yet.
  flush(): void {
    const live = this.#live;

    this.#cancelFlush?.();
    this.#cancelFlush = null;

    if (!live || live.points.length <= this.#sent) return;

    const batch: StrokeBatch = { strokeId: live.id, color: live.color, size: live.size, eraser: live.eraser, points: live.points.slice(this.#sent) };

    this.#sent = live.points.length;
    this.#deps.send('stroke', batch);
  }

  // Takes back your own last line or fill.
  undo(): void {
    const meId = this.#deps.meId();
    const index = this.actions.findLastIndex((action) => action.authorId === meId);

    if (!this.canUndo || index < 0) return;

    this.release();
    this.#remove(this.actions.filter((_, at) => at !== index));
    this.#deps.send('undo', {});
  }

  clear(): void {
    if (!this.canClear) return;

    this.release();
    this.#remove([]);
    this.#deps.send('clear', {});
  }

  // B, E, F pick a tool, 1–4 a size, Ctrl/Cmd+Z undoes. Returns whether the key was used.
  pressKey(key: string, withModifier: boolean): boolean {
    const lower = key.toLowerCase();
    const size = Number(key);

    if (!this.canDraw) return false;

    if (withModifier) {
      if (lower === 'z') this.undo();

      return lower === 'z';
    }

    const tool = toolKeys[lower];

    if (tool) this.selectTool(tool);
    else if (Number.isInteger(size) && size >= 1 && size <= brushSizes.length) this.selectSize(size - 1);

    return Boolean(tool) || (Number.isInteger(size) && size >= 1 && size <= brushSizes.length);
  }

  // What someone else does on the board: the drawer, or a saboteur.
  receive(op: BoardOp): void {
    if (op.type === 'stroke') this.#deps.sounds.scratch(op.batch.eraser, this.#appendRemote(op.authorId, op.batch), flushMs);
    else if (op.type === 'fill') this.actions.push({ kind: 'fill', authorId: op.authorId, ...op.fill });
    else this.#remove(op.type === 'undo' ? this.actions.filter((action) => action.id !== op.id) : []);

    if (op.type === 'fill') this.#deps.sounds.spray();

    this.version += 1;
  }

  // A new turn starts with a blank board.
  syncTurn(turnId: string): void {
    if (turnId === this.#turnId) return;

    this.#turnId = turnId;
    this.release();
    this.#remove([]);
  }

  // Adds the batch to its stroke and returns how far it drew.
  #appendRemote(authorId: string, batch: StrokeBatch): number {
    const existing = this.actions.findLast((action) => action.kind === 'stroke' && action.id === batch.strokeId);

    if (existing?.kind === 'stroke') {
      const length = pathLength(batch.points, existing.points.slice(-2));

      existing.points.push(...batch.points);

      return length;
    }

    this.actions.push({ kind: 'stroke', id: batch.strokeId, authorId, color: batch.color, size: batch.size, eraser: batch.eraser, points: [...batch.points] });

    return pathLength(batch.points, []);
  }

  #remove(remaining: BoardAction[]): void {
    this.actions = remaining;
    this.revision += 1;
    this.version += 1;
  }

  #scheduleFlush(): void {
    this.#cancelFlush ??= this.#deps.schedule(this.flush, flushMs);
  }
}
