import { expect, test } from 'vitest';
import { drawerPoints, guesserPoints, rankByScore } from './scoring.js';

test('guesserPoints falls from 100 to 50 over the draw time, in steps of 5', () => {
  expect(guesserPoints(80_000, 80_000)).toBe(100);
  expect(guesserPoints(40_000, 80_000)).toBe(75);
  expect(guesserPoints(0, 80_000)).toBe(50);
  expect(guesserPoints(-5, 80_000)).toBe(50);
  expect(guesserPoints(31_000, 80_000)).toBe(70);
});

test('drawerPoints pays 25 for each person who guessed', () => {
  expect(drawerPoints(0)).toBe(0);
  expect(drawerPoints(3)).toBe(75);
});

test('rankByScore puts the highest first and lets ties share a place', () => {
  const players = [
    { name: 'a', score: 120 },
    { name: 'b', score: 300 },
    { name: 'c', score: 120 },
    { name: 'd', score: 40 },
  ];

  const ranked = rankByScore(players, (player) => player.score);

  expect(ranked.map((entry) => [entry.item.name, entry.place])).toEqual([
    ['b', 1],
    ['a', 2],
    ['c', 2],
    ['d', 4],
  ]);
});
