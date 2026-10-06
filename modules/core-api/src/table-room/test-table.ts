import { createRandom } from '@scribble-table/engine';
import { feedMaxItems } from '@scribble-table/protocol';
import type { WordEntry } from '../words/index.js';
import { TableRoomFeed } from './feed.js';
import { TableRoomGame } from './game.js';
import type { Schedule } from './lifecycle.js';
import { TableRoomMembers } from './members.js';

// Made-up words for tests, never from the real lists (spec D9a). One of each difficulty, so a
// turn's three choices are always these three.
export const testWords: readonly WordEntry[] = [
  { forms: { en: 'zorblat', uk: 'зорблат' }, alternatives: ['zorbo'], difficulty: 'easy' },
  { forms: { en: 'quindle', uk: 'квіндель' }, alternatives: [], difficulty: 'medium' },
  { forms: { en: 'frumpet horn', uk: 'фрумпет' }, alternatives: [], difficulty: 'hard' },
];

interface TestTimer {
  at: number;
  callback: () => void;
  cancelled: boolean;
}

// A hand-cranked clock: `advance` moves time on and runs whatever fell due, in order.
export const createTestClock = (start = 1_000_000): { now: () => number; schedule: Schedule; advance: (ms: number) => void } => {
  let now = start;
  const timers: TestTimer[] = [];

  const schedule: Schedule = (callback, delayMs) => {
    const timer = { at: now + delayMs, callback, cancelled: false };

    timers.push(timer);

    return () => {
      timer.cancelled = true;
    };
  };

  const advance = (ms: number): void => {
    const until = now + ms;

    for (;;) {
      const due = timers.filter((timer) => !timer.cancelled && timer.at <= until).sort((a, b) => a.at - b.at)[0];

      if (!due) break;

      due.cancelled = true;
      now = Math.max(now, due.at);
      due.callback();
    }

    now = until;
  };

  return { now: () => now, schedule, advance };
};

export interface TestTable {
  game: TableRoomGame;
  members: TableRoomMembers;
  feed: TableRoomFeed;
  advance: (ms: number) => void;
  now: () => number;
  opened: string[];
  changes: () => number;
  clears: () => number;
}

// A game with its own members and feed, on the test clock and seeded randomness.
export const createTestTable = (words: readonly WordEntry[] = testWords): TestTable => {
  const clock = createTestClock();
  const random = createRandom(7);
  const members = new TableRoomMembers(random);
  let ids = 0;
  const createId = (): string => `id${(ids += 1)}`;
  const feed = new TableRoomFeed({ now: clock.now, createId, maxItems: feedMaxItems });
  const opened: string[] = [];
  let changes = 0;
  let clears = 0;

  const game = new TableRoomGame({
    members,
    feed,
    words: () => words,
    schedule: clock.schedule,
    now: clock.now,
    random,
    createId,
    clearBoard: () => (clears += 1),
    opened: (memberId) => opened.push(memberId),
    changed: () => (changes += 1),
  });

  return { game, members, feed, advance: clock.advance, now: clock.now, opened, changes: () => changes, clears: () => clears };
};
