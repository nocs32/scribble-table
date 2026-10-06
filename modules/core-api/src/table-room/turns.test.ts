import { expect, test } from 'vitest';
import { TableRoomTurns } from './turns.js';

test('everyone draws once a round, in the order they joined', () => {
  const turns = new TableRoomTurns();
  const ids = ['ana', 'bo'];

  turns.start(ids);
  expect([turns.next(ids, 2), turns.next(ids, 2), turns.round]).toEqual(['ana', 'bo', 1]);
  expect([turns.next(ids, 2), turns.round]).toEqual(['ana', 2]);
  turns.next(ids, 2);
  expect(turns.next(ids, 2)).toBeNull();
});

test('someone who joins mid-round draws at its end; someone who left is skipped', () => {
  const turns = new TableRoomTurns();

  turns.start(['ana', 'bo', 'cy']);
  turns.next(['ana', 'bo', 'cy'], 3);
  turns.join('di');
  expect(turns.next(['ana', 'cy', 'di'], 3)).toBe('cy');
  expect(turns.next(['ana', 'cy', 'di'], 3)).toBe('di');
  expect([turns.next(['ana', 'cy', 'di'], 3), turns.round]).toEqual(['ana', 2]);
});

test('joining outside a game changes nothing; stop goes back to round 0', () => {
  const turns = new TableRoomTurns();

  turns.join('ana');
  turns.start(['bo']);
  expect([turns.next(['ana', 'bo'], 1), turns.next(['ana', 'bo'], 1)]).toEqual(['bo', null]);
  turns.stop();
  expect(turns.round).toBe(0);
});
