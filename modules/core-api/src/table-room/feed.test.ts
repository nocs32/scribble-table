import { expect, test } from 'vitest';
import { TableRoomFeed, type TableRoomFeedAuthor, type TableRoomFeedTurn } from './feed.js';

const ana: TableRoomFeedAuthor = { id: 'ana', name: 'Ana', color: 'sky' };

const createFeed = (maxItems = 10): TableRoomFeed => {
  let ids = 0;

  return new TableRoomFeed({ now: () => 5, createId: () => `line${(ids += 1)}`, maxItems });
};

const texts = (feed: TableRoomFeed, viewerId: string, since = 0): string[] =>
  feed.since(since, viewerId).map((item) => (item.kind === 'message' ? item.text : item.event.type));

test('public lines go to everyone, with who wrote them', () => {
  const feed = createFeed();

  feed.message(ana, 'hi', null);
  expect(feed.visibleTo('bo')).toEqual([{ id: 'line1', authorId: 'ana', authorName: 'Ana', authorColor: 'sky', at: 5, kind: 'message', text: 'hi', audience: 'everyone' }]);
});

test('guessed chat shows to whoever knows the word, including later', () => {
  const feed = createFeed();
  const knowing = new Set(['ana']);
  const turn: TableRoomFeedTurn = { knowsWord: (id) => knowing.has(id) };

  feed.message(ana, 'psst', turn);
  expect(texts(feed, 'bo')).toEqual([]);
  knowing.add('bo');
  expect(texts(feed, 'bo')).toEqual(['psst']);
});

test('a line for one person shows only to them', () => {
  const feed = createFeed();

  feed.system(ana, { type: 'close', guess: 'zorblot' }, 'ana');
  expect(texts(feed, 'ana')).toEqual(['close']);
  expect(texts(feed, 'bo')).toEqual([]);
});

test('lines are numbered, so a browser gets only the new ones', () => {
  const feed = createFeed();

  feed.message(ana, 'one', null);

  const seen = feed.seq;

  feed.message(ana, 'two', null);
  expect(texts(feed, 'bo', seen)).toEqual(['two']);
});

test('the oldest lines go first', () => {
  const feed = createFeed(2);

  ['one', 'two', 'three'].forEach((text) => feed.message(ana, text, null));
  expect(texts(feed, 'bo')).toEqual(['two', 'three']);
});
