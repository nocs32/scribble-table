import { chatPace } from '@scribble-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Schedule } from '../../services';
import type { Translate } from '../locale';

export interface RoomChatPaceDeps {
  t: Translate;
  now: () => number;
  schedule: Schedule;
}

// ready → waiting (you typed faster than the table takes lines; yours stays in the box) or
// refused (the table turned a line down anyway) → ready again once the pace allows.
export type RoomChatPaceState = 'ready' | 'waiting' | 'refused';

// How fast you may chat (protocol `chatPace`), so a line is held back with a note instead of
// being dropped by the table.
export class RoomChatPaceStore {
  state: RoomChatPaceState = 'ready';
  readonly #deps: RoomChatPaceDeps;
  #sent: number[] = [];
  #cancel: (() => void) | null = null;

  constructor(deps: RoomChatPaceDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get note(): string | null {
    if (this.state === 'waiting') return this.#deps.t('chat.slowDown');

    return this.state === 'refused' ? this.#deps.t('chat.notSent') : null;
  }

  // Takes a slot for one line. False when it has to wait: the note says so until it may go.
  take(): boolean {
    const now = this.#deps.now();
    const recent = this.#sent.filter((at) => now - at < chatPace.windowMs);
    const oldest = recent[0];

    if (oldest !== undefined && recent.length >= chatPace.count) {
      this.#sent = recent;
      this.#hold('waiting', oldest + chatPace.windowMs - now);

      return false;
    }

    this.#sent = [...recent, now];
    this.settle();

    return true;
  }

  // The table refused a line for coming too fast.
  refuse(): void {
    this.#hold('refused', chatPace.windowMs);
  }

  settle(): void {
    this.#cancel?.();
    this.#cancel = null;
    this.state = 'ready';
  }

  #hold(state: RoomChatPaceState, delayMs: number): void {
    this.#cancel?.();
    this.state = state;
    this.#cancel = this.#deps.schedule(this.settle, Math.max(0, delayMs));
  }
}
