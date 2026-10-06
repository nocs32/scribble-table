import { gameLimits, trickSeconds, type ActiveTrick, type TrickKind } from '@scribble-table/protocol';
import { TableRoomError } from './error.js';

export interface TableRoomTricksDeps {
  now: () => number;
  createId: () => string;
  random: () => number;
}

// One turn's tricks (spec D18): which are in play, and who has used theirs.
export class TableRoomTricks {
  #active: ActiveTrick[] = [];
  readonly #played = new Map<string, number>();
  readonly #deps: TableRoomTricksDeps;

  constructor(deps: TableRoomTricksDeps) {
    this.#deps = deps;
  }

  // Who has used up their tricks this turn.
  get playedIds(): string[] {
    return [...this.#played.keys()].filter((id) => !this.canPlay(id));
  }

  active(now: number): ActiveTrick[] {
    return this.#active.filter((trick) => trick.endsAt > now);
  }

  canPlay(memberId: string): boolean {
    return (this.#played.get(memberId) ?? 0) < gameLimits.tricksPerTurn;
  }

  // `spot` picks where it lands (which corner folds, where the paint splats), the same on every screen.
  play(memberId: string, kind: TrickKind): ActiveTrick {
    if (!this.canPlay(memberId)) throw new TableRoomError('NO_TRICKS_LEFT');

    const now = this.#deps.now();
    const trick = { id: this.#deps.createId(), kind, fromId: memberId, endsAt: now + trickSeconds[kind] * 1000, spot: Math.floor(this.#deps.random() * 1000) };

    this.#played.set(memberId, (this.#played.get(memberId) ?? 0) + 1);
    this.#active = [...this.active(now), trick];

    return trick;
  }

  reset(): void {
    this.#active = [];
    this.#played.clear();
  }
}
