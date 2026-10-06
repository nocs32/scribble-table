import { boardHeight, boardWidth, isPenTrick, trickKinds, type ActiveTrick, type GameSnapshot, type TrickKind } from '@scribble-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { TranslationKey } from '../../i18n';
import type { Schedule } from '../../services';
import type { Translate } from '../locale';
import type { TableSend } from './types';

export type SplatSpot = 'nw' | 'ne' | 'sw' | 'se' | 'center';
export type SplatInk = 'red' | 'blue' | 'violet' | 'green' | 'orange';
export type FoldCorner = 'nw' | 'ne' | 'sw' | 'se';

export interface TrickButtonView {
  kind: TrickKind;
  emoji: string;
  label: string;
  isDisabled: boolean;
}

export interface SplatView {
  id: string;
  spot: SplatSpot;
  ink: SplatInk;
}

export interface FoldView {
  id: string;
  corner: FoldCorner;
}

export interface SabotageNote {
  id: string;
  text: string;
}

export interface RoomSabotageDeps {
  t: Translate;
  send: TableSend;
  meId: () => string;
  // A turn is being drawn and the table has sabotage on.
  isOn: () => boolean;
  // You draw this turn: pen tricks bend your lines.
  isDrawer: () => boolean;
  // You got it this turn: you may sabotage.
  hasGuessed: () => boolean;
  nameOf: (id: string) => string;
  now: () => number;
  schedule: Schedule;
}

const trickEmoji: Record<TrickKind, string> = { splat: '🎨', flip: '🙃', fold: '📄', shake: '🫨', mirror: '🪞' };
const splatSpots: readonly SplatSpot[] = ['nw', 'ne', 'sw', 'se', 'center'];
const splatInks: readonly SplatInk[] = ['red', 'blue', 'violet', 'green', 'orange'];
const foldCorners: readonly FoldCorner[] = ['nw', 'ne', 'sw', 'se'];

// How long "Ana is scribbling" stays after their last line.
const scribbleNoteMs = 1500;

// Sabotage (spec D18): players who guessed scribble on the board and play one trick a turn. Board
// tricks show on everyone's board, the drawer's too, so saboteurs see what they did; pen tricks
// bend the drawer's lines. This holds the tricks in play and who is scribbling right now.
export class RoomSabotageStore {
  tricks: ActiveTrick[] = [];
  trickedIds: string[] = [];
  scribblerIds: string[] = [];
  readonly #deps: RoomSabotageDeps;
  readonly #scribbleStops = new Map<string, () => void>();

  constructor(deps: RoomSabotageDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // You guessed it and sabotage is on: the board takes your lines.
  get canScribble(): boolean {
    return this.#deps.isOn() && this.#deps.hasGuessed();
  }

  get canPlayTrick(): boolean {
    return this.canScribble && !this.trickedIds.includes(this.#deps.meId());
  }

  get trickButtons(): TrickButtonView[] {
    const { t } = this.#deps;

    return trickKinds.map((kind) => ({
      kind,
      emoji: trickEmoji[kind],
      label: this.canPlayTrick ? t(`trick.button.${kind}`) : t('trick.played'),
      isDisabled: !this.canPlayTrick,
    }));
  }

  get splat(): SplatView | null {
    const trick = this.#latest('splat');

    if (!trick) return null;

    return { id: trick.id, spot: splatSpots[trick.spot % splatSpots.length] ?? 'center', ink: splatInks[Math.floor(trick.spot / splatSpots.length) % splatInks.length] ?? 'red' };
  }

  get fold(): FoldView | null {
    const trick = this.#latest('fold');

    return trick ? { id: trick.id, corner: foldCorners[trick.spot % foldCorners.length] ?? 'ne' } : null;
  }

  // The paper's fold variant.
  get foldCorner(): FoldCorner | 'none' {
    return this.fold?.corner ?? 'none';
  }

  get isFlipped(): boolean {
    return this.#latest('flip') !== undefined;
  }

  get isShaking(): boolean {
    return this.#latest('shake') !== undefined;
  }

  get isMirrored(): boolean {
    return this.#latest('mirror') !== undefined;
  }

  // The chips over the board: whose tricks are in play, and who is scribbling.
  get notes(): SabotageNote[] {
    const { t, nameOf } = this.#deps;
    const names = this.scribblerIds.map(nameOf);
    const tricks = this.tricks.map((trick) => ({ id: trick.id, text: t(this.#noticeKey(trick.kind), { name: nameOf(trick.fromId) }) }));
    const scribbling = names.length > 0 ? [{ id: 'scribbling', text: t('trick.scribbling', { count: names.length, names: names.join(', ') }) }] : [];

    return [...tricks, ...scribbling];
  }

  // Where a point you draw lands. On a flipped board it still lands under your pointer; the
  // drawer's also gets mirrored and shaken.
  bend(x: number, y: number): [number, number] {
    const [fx, fy] = this.isFlipped ? [boardWidth - x, boardHeight - y] : [x, y];

    if (!this.#deps.isDrawer()) return [fx, fy];

    const mx = this.isMirrored ? boardWidth - fx : fx;

    if (!this.isShaking) return [mx, fy];

    const time = this.#deps.now() / 1000;

    return [mx + 9 * Math.sin(time * 23) + 5 * Math.sin(time * 61), fy + 9 * Math.cos(time * 19) + 5 * Math.sin(time * 53)];
  }

  receive(game: GameSnapshot): void {
    this.tricks = game.tricks;
    this.trickedIds = game.trickedIds;
  }

  playTrick(kind: TrickKind): void {
    if (this.canPlayTrick) this.#deps.send('trick', { kind });
  }

  // Someone other than the drawer drew a line just now.
  markScribbling(authorId: string): void {
    if (authorId === this.#deps.meId()) return;

    if (!this.scribblerIds.includes(authorId)) this.scribblerIds = [...this.scribblerIds, authorId];

    this.#scribbleStops.get(authorId)?.();
    this.#scribbleStops.set(authorId, this.#deps.schedule(() => this.forgetScribbler(authorId), scribbleNoteMs));
  }

  forgetScribbler(authorId: string): void {
    this.scribblerIds = this.scribblerIds.filter((id) => id !== authorId);
    this.#scribbleStops.delete(authorId);
  }

  #latest(kind: TrickKind): ActiveTrick | undefined {
    return this.tricks.findLast((trick) => trick.kind === kind);
  }

  // A pen trick reads "your pen" to the drawer and "the drawer's pen" to everyone else.
  #noticeKey(kind: TrickKind): TranslationKey {
    if (!isPenTrick(kind) || this.#deps.isDrawer()) return `trick.notice.${kind}`;

    return kind === 'shake' ? 'trick.notice.shakeOthers' : 'trick.notice.mirrorOthers';
  }
}
