import { gameLimits, trickSeconds, type ActiveTrick, type TrickKind } from '@scribble-table/protocol';
import type { DemoDeps } from './types';

// One turn's tricks (spec D18): which are in play, and how many each player has played.
export class DemoTricks {
  #active: ActiveTrick[] = [];
  readonly #played = new Map<string, number>();
  readonly #deps: DemoDeps;

  constructor(deps: DemoDeps) {
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

  play(memberId: string, kind: TrickKind): ActiveTrick {
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
