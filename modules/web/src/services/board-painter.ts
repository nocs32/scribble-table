import { floodFill, type Rgba } from '@scribble-table/engine';
import { boardHeight, boardWidth, brushSizes, inkColors } from '@scribble-table/protocol';
import { token } from 'styled-system/tokens';
import type { BoardAction, StrokeAction } from '../stores/room/types';

// The board is painted at twice its unit size: sharp lines on dense screens, and every fill
// happens on the same pixel grid on every screen.
export const boardScale = 2;

export const boardPixelWidth = boardWidth * boardScale;
export const boardPixelHeight = boardHeight * boardScale;

const inkHex: readonly string[] = inkColors.map((name) => token(`colors.ink.${name}`));

const paperIndex = inkColors.indexOf('white');

// Edges are anti-aliased, so a fill swallows pixels this close to the colour it starts on.
const fillTolerance = 48;

const toRgba = (hex: string): Rgba => [Number.parseInt(hex.slice(1, 3), 16), Number.parseInt(hex.slice(3, 5), 16), Number.parseInt(hex.slice(5, 7), 16), 255];

const inkOf = (index: number): string => inkHex[index] ?? inkHex[0] ?? '#000000';

// Keeps a canvas in step with the board's actions. Only new strokes, new points and new fills
// are painted, and several strokes can grow at once (the drawer's and saboteurs'). When something
// is taken away (undo, clear, a new turn) it starts over.
export class BoardPainter {
  readonly #context: CanvasRenderingContext2D;
  #revision = -1;
  // How far each action has been painted: points for a stroke, 1 for a fill.
  readonly #painted = new Map<string, number>();

  constructor(context: CanvasRenderingContext2D) {
    this.#context = context;
  }

  sync(actions: readonly BoardAction[], revision: number): void {
    if (revision !== this.#revision) this.#restart(revision);

    actions.forEach((action) => {
      const done = this.#painted.get(action.id) ?? 0;
      const now = action.kind === 'fill' ? this.#fill(action, done) : this.#stroke(action, done);

      if (now !== done) this.#painted.set(action.id, now);
    });
  }

  #restart(revision: number): void {
    const context = this.#context;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = inkOf(paperIndex);
    context.fillRect(0, 0, boardPixelWidth, boardPixelHeight);
    context.setTransform(boardScale, 0, 0, boardScale, 0, 0);
    this.#revision = revision;
    this.#painted.clear();
  }

  // Paints the points from `from` on (an index into `points`) and returns how far it got.
  #stroke(action: StrokeAction, from: number): number {
    const { points } = action;
    const context = this.#context;
    const color = inkOf(action.eraser ? paperIndex : action.color);
    const width = brushSizes[action.size] ?? brushSizes[0];

    if (points.length < 2 || from >= points.length) return from;

    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = width;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    if (from === 0) {
      context.beginPath();
      context.arc(points[0] ?? 0, points[1] ?? 0, width / 2, 0, Math.PI * 2);
      context.fill();
    }

    context.beginPath();
    context.moveTo(points[Math.max(0, from - 2)] ?? 0, points[Math.max(1, from - 1)] ?? 0);

    for (let index = Math.max(2, from); index + 1 < points.length; index += 2) context.lineTo(points[index] ?? 0, points[index + 1] ?? 0);

    context.stroke();

    return points.length;
  }

  #fill(action: Extract<BoardAction, { kind: 'fill' }>, progress: number): number {
    if (progress > 0) return progress;

    const image = this.#context.getImageData(0, 0, boardPixelWidth, boardPixelHeight);

    floodFill(image.data, boardPixelWidth, boardPixelHeight, action.x * boardScale, action.y * boardScale, toRgba(inkOf(action.color)), fillTolerance);
    this.#context.putImageData(image, 0, 0);

    return 1;
  }
}
