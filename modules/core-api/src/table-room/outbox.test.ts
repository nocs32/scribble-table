import type { TableEvents, TableSecret } from '@scribble-table/protocol';
import { expect, test } from 'vitest';
import { TableRoomFeed, type TableRoomFeedTurn } from './feed.js';
import { TableRoomOutbox } from './outbox.js';
import { createTestTable } from './test-table.js';

type Sent = [string, keyof TableEvents, unknown];

const ana = { id: 'ana', name: 'Ana', color: 'sky' } as const;

const createOutbox = (): { outbox: TableRoomOutbox; feed: TableRoomFeed; sent: Sent[]; secrets: Map<string, TableSecret> } => {
  const { members, game } = createTestTable();
  const feed = new TableRoomFeed({ now: () => 1, createId: () => 'line', maxItems: 50 });
  const sent: Sent[] = [];
  const secrets = new Map<string, TableSecret>();

  members.join('ana', 'Ana');

  const outbox = new TableRoomOutbox({
    feed,
    view: () => ({ members: members.snapshot, game: game.snapshot(1) }),
    secretFor: (memberId) => secrets.get(memberId) ?? { choices: null, word: null },
    now: () => 99,
    send: (memberId, type, message) => sent.push([memberId, type, message]),
    broadcast: (type, message) => sent.push(['*', type, message]),
  });

  return { outbox, feed, sent, secrets };
};

const kinds = (sent: Sent[]): string[] => sent.map(([to, type]) => `${to}:${type}`);

test('sync sends everything to one browser: the view with the server clock, the feed and the secret', () => {
  const { outbox, sent } = createOutbox();

  outbox.sync('ana');
  expect(kinds(sent)).toEqual(['ana:view', 'ana:feed', 'ana:secret']);
  expect(sent[0]?.[2]).toMatchObject({ now: 99 });
});

test('the shared view goes out only when it changed', () => {
  const { outbox, sent } = createOutbox();

  outbox.flush();
  outbox.flush();
  expect(kinds(sent)).toEqual(['*:view']);
});

test('nothing personal goes to a browser before it syncs, or after it drops', () => {
  const { outbox, feed, sent } = createOutbox();

  feed.message(ana, 'hi', null);
  outbox.flush();
  expect(kinds(sent)).toEqual(['*:view']);
  outbox.sync('bo');
  outbox.forget('bo');
  feed.message(ana, 'again', null);
  outbox.flush();
  expect(kinds(sent).filter((kind) => kind.startsWith('bo:feed'))).toHaveLength(1);
});

test('after syncing, a browser gets only new lines it may see, and its secret when it changes', () => {
  const { outbox, feed, sent, secrets } = createOutbox();

  outbox.sync('bo');
  sent.length = 0;
  feed.message(ana, 'hi', null);
  feed.system(ana, { type: 'close', guess: 'zorblot' }, 'ana');
  secrets.set('bo', { choices: null, word: { en: 'zorblat', uk: 'зорблат' } });
  outbox.flush();
  expect(kinds(sent)).toEqual(['*:view', 'bo:feed', 'bo:secret']);
  expect(sent[1]?.[2]).toMatchObject({ reset: false, items: [{ text: 'hi' }] });
});

test('when guessed chat opens up, the next feed is the whole of it', () => {
  const { outbox, feed, sent } = createOutbox();
  const knowing = new Set<string>();
  const turn: TableRoomFeedTurn = { knowsWord: (id) => knowing.has(id) };

  outbox.sync('bo');
  feed.message(ana, 'psst', turn);
  outbox.flush();
  sent.length = 0;
  knowing.add('bo');
  outbox.reset('bo');
  outbox.flush();
  expect(sent).toEqual([['bo', 'feed', { reset: true, items: [expect.objectContaining({ text: 'psst' })] }]]);
});
