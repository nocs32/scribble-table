import { makeAutoObservable } from 'mobx';
import type { Schedule } from '../../../services';

export interface RoomGameClockDeps {
  now: () => number;
  repeat: Schedule;
}

export type RoomGameClockState = 'stopped' | 'running';

const tickMs = 250;
const urgentSeconds = 10;

// Counts down to the end of the current phase (choosing, drawing, reveal): stopped ⇄ running.
// The table decides when time is up; this only shows it.
export class RoomGameClockStore {
  state: RoomGameClockState = 'stopped';
  now: number;
  endsAt: number | null = null;
  readonly #deps: RoomGameClockDeps;
  #stopTicking: (() => void) | null = null;

  constructor(deps: RoomGameClockDeps) {
    this.#deps = deps;
    this.now = deps.now();
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get secondsLeft(): number {
    return this.endsAt === null ? 0 : Math.max(0, Math.ceil((this.endsAt - this.now) / 1000));
  }

  get isRunning(): boolean {
    return this.state === 'running';
  }

  get isUrgent(): boolean {
    return this.isRunning && this.secondsLeft > 0 && this.secondsLeft <= urgentSeconds;
  }

  track(endsAt: number | null): void {
    this.endsAt = endsAt;
    this.now = this.#deps.now();

    if (endsAt === null) {
      this.#stopTicking?.();
      this.#stopTicking = null;
      this.state = 'stopped';
    } else if (this.state === 'stopped') {
      this.state = 'running';
      this.#stopTicking = this.#deps.repeat(this.tick, tickMs);
    }
  }

  tick(): void {
    this.now = this.#deps.now();
  }
}
