import type { FeedEvent, FeedItem } from '@scribble-table/protocol';

// Who wrote a line: their name and colour are kept with it, for when they've left.
export interface TableRoomFeedAuthor {
  id: string;
  name: string;
  color: FeedItem['authorColor'];
}

// The turn a guessed-chat line belongs to: only those who know its word may read it.
export interface TableRoomFeedTurn {
  knowsWord: (memberId: string) => boolean;
}

export interface TableRoomFeedDeps {
  now: () => number;
  createId: () => string;
  maxItems: number;
}

interface TableRoomFeedEntry {
  // Counts up, so each browser can be sent just the lines it hasn't had.
  seq: number;
  item: FeedItem;
  // A line only one person sees ("Close!").
  onlyFor: string | null;
  turn: TableRoomFeedTurn | null;
}

// The chat and system lines, and who may see each one (spec §7): public lines, guessed chat, and
// lines for one person.
export class TableRoomFeed {
  #entries: TableRoomFeedEntry[] = [];
  #seq = 0;
  readonly #deps: TableRoomFeedDeps;

  constructor(deps: TableRoomFeedDeps) {
    this.#deps = deps;
  }

  // The newest line's number (0 before the first).
  get seq(): number {
    return this.#seq;
  }

  system(author: TableRoomFeedAuthor, event: FeedEvent, onlyFor: string | null = null): void {
    this.#add({ ...this.#base(author), kind: 'system', event }, onlyFor, null);
  }

  // `turn`: post it to that turn's guessed chat instead of to everyone.
  message(author: TableRoomFeedAuthor, text: string, turn: TableRoomFeedTurn | null): void {
    this.#add({ ...this.#base(author), kind: 'message', text, audience: turn ? 'guessed' : 'everyone' }, null, turn);
  }

  visibleTo(viewerId: string): FeedItem[] {
    return this.since(0, viewerId);
  }

  // Lines after `seq` that this person may see.
  since(seq: number, viewerId: string): FeedItem[] {
    return this.#entries.filter((entry) => entry.seq > seq && this.#canSee(entry, viewerId)).map((entry) => entry.item);
  }

  #canSee(entry: TableRoomFeedEntry, viewerId: string): boolean {
    if (entry.onlyFor !== null) return entry.onlyFor === viewerId;

    return entry.turn === null || entry.turn.knowsWord(viewerId);
  }

  #base(author: TableRoomFeedAuthor): Pick<FeedItem, 'id' | 'authorId' | 'authorName' | 'authorColor' | 'at'> {
    return { id: this.#deps.createId(), authorId: author.id, authorName: author.name, authorColor: author.color, at: this.#deps.now() };
  }

  #add(item: FeedItem, onlyFor: string | null, turn: TableRoomFeedTurn | null): void {
    this.#seq += 1;
    this.#entries = [...this.#entries, { seq: this.#seq, item, onlyFor, turn }].slice(-this.#deps.maxItems);
  }
}
