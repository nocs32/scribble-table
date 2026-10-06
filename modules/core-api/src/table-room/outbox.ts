import type { GameSnapshot, MemberSnapshot, TableEvents, TableSecret } from '@scribble-table/protocol';
import type { TableRoomFeed } from './feed.js';

type TableRoomOutboxSend = <K extends keyof TableEvents>(memberId: string, type: K, message: TableEvents[K]) => void;

export interface TableRoomOutboxDeps {
  feed: TableRoomFeed;
  // The shared part of the table, the same for everyone.
  view: () => { members: MemberSnapshot[]; game: GameSnapshot };
  secretFor: (memberId: string) => TableSecret;
  now: () => number;
  send: TableRoomOutboxSend;
  broadcast: <K extends keyof TableEvents>(type: K, message: TableEvents[K]) => void;
}

// What one browser has been sent so far.
interface TableRoomOutboxSeen {
  feedSeq: number;
  secret: string;
}

// What goes out after every change (spec §9.3): the shared view to everyone when it changed, and
// to each browser the feed lines it may see and hasn't had yet, and its secret when that changed.
// A browser gets nothing personal until it asks with `sync`, so it's listening by then.
export class TableRoomOutbox {
  #view = '';
  readonly #seen = new Map<string, TableRoomOutboxSeen>();
  readonly #resets = new Set<string>();
  readonly #deps: TableRoomOutboxDeps;

  constructor(deps: TableRoomOutboxDeps) {
    this.#deps = deps;
  }

  // Everything again, for a browser that just joined or reconnected.
  sync(memberId: string): void {
    const { feed, send } = this.#deps;
    const secret = this.#deps.secretFor(memberId);

    send(memberId, 'view', { now: this.#deps.now(), ...this.#deps.view() });
    send(memberId, 'feed', { reset: true, items: feed.visibleTo(memberId) });
    send(memberId, 'secret', secret);
    this.#seen.set(memberId, { feedSeq: feed.seq, secret: JSON.stringify(secret) });
    this.#resets.delete(memberId);
  }

  // Guessed chat opened up to this person: their next feed is the whole of it.
  reset(memberId: string): void {
    this.#resets.add(memberId);
  }

  // Their connection dropped or they left: nothing personal until they sync again.
  forget(memberId: string): void {
    this.#seen.delete(memberId);
    this.#resets.delete(memberId);
  }

  flush(): void {
    const view = this.#deps.view();
    const text = JSON.stringify(view);

    if (text !== this.#view) {
      this.#view = text;
      this.#deps.broadcast('view', { now: this.#deps.now(), ...view });
    }

    this.#seen.forEach((seen, memberId) => this.#flushPersonal(memberId, seen));
  }

  dispose(): void {
    this.#seen.clear();
    this.#resets.clear();
  }

  #flushPersonal(memberId: string, seen: TableRoomOutboxSeen): void {
    const { feed, send } = this.#deps;
    const reset = this.#resets.has(memberId);
    const items = reset ? feed.visibleTo(memberId) : feed.since(seen.feedSeq, memberId);
    const secret = this.#deps.secretFor(memberId);
    const secretText = JSON.stringify(secret);

    if (reset || items.length > 0) send(memberId, 'feed', { reset, items });

    if (secretText !== seen.secret) send(memberId, 'secret', secret);

    this.#seen.set(memberId, { feedSeq: feed.seq, secret: secretText });
    this.#resets.delete(memberId);
  }
}
