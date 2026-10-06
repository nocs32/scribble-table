import type { FeedEvent, FeedItem } from '@scribble-table/protocol';
import type { DemoTurn } from './turn';
import type { DemoDeps, DemoMember } from './types';

interface DemoFeedEntry {
  item: FeedItem;
  // A line only one person sees ("close!").
  onlyFor: string | null;
  // Guessed chat: only those who know this turn's word see it.
  turn: DemoTurn | null;
}

const maxEntries = 200;

// The chat and system lines, and who may see each one.
export class DemoFeed {
  #entries: DemoFeedEntry[] = [];
  readonly #deps: DemoDeps;

  constructor(deps: DemoDeps) {
    this.#deps = deps;
  }

  system(author: DemoMember, event: FeedEvent, onlyFor: string | null = null): void {
    this.#add({ ...this.#base(author), kind: 'system', event }, onlyFor, null);
  }

  // `turn`: post it to that turn's guessed chat instead of to everyone.
  message(author: DemoMember, text: string, turn: DemoTurn | null): void {
    this.#add({ ...this.#base(author), kind: 'message', text, audience: turn ? 'guessed' : 'everyone' }, null, turn);
  }

  visibleTo(viewerId: string): FeedItem[] {
    return this.#entries.filter((entry) => this.#canSee(entry, viewerId)).map((entry) => entry.item);
  }

  #canSee(entry: DemoFeedEntry, viewerId: string): boolean {
    if (entry.onlyFor !== null) return entry.onlyFor === viewerId;

    return entry.turn === null || entry.turn.knowsWord(viewerId);
  }

  #base(author: DemoMember): Pick<FeedItem, 'id' | 'authorId' | 'authorName' | 'authorColor' | 'at'> {
    return { id: this.#deps.createId(), authorId: author.id, authorName: author.name, authorColor: author.color, at: this.#deps.now() };
  }

  #add(item: FeedItem, onlyFor: string | null, turn: DemoTurn | null): void {
    this.#entries = [...this.#entries, { item, onlyFor, turn }].slice(-maxEntries);
  }
}
