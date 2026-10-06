import type { WordDifficulty } from '@scribble-table/protocol';
import { expect, test } from 'vitest';
import { createRandom } from './random.js';
import { customWordForms, pickWordChoices, wordKey, type PickableWord } from './words.js';

// Made-up words, never from the real lists.
const word = (name: string, difficulty: WordDifficulty): PickableWord => ({ forms: { en: name, uk: `${name}-uk` }, difficulty });

const pool = [word('zorp', 'easy'), word('blip', 'easy'), word('quab', 'medium'), word('frell', 'medium'), word('snerk', 'hard'), word('gloam', 'hard')];

test('three choices are one easy, one medium and one hard', () => {
  const picked = pickWordChoices(pool, new Set(), 3, createRandom(1));

  expect(picked.map((choice) => choice.difficulty)).toEqual(['easy', 'medium', 'hard']);
});

test('used words are not offered again while fresh ones are left', () => {
  const used = new Set(['zorp', 'quab', 'snerk']);
  const picked = pickWordChoices(pool, used, 3, createRandom(2));

  expect(picked.map(wordKey).sort()).toEqual(['blip', 'frell', 'gloam']);
});

test('once fresh words run out, used ones come back rather than offering fewer', () => {
  const used = new Set(pool.map(wordKey).slice(0, 5));

  expect(pickWordChoices(pool, used, 3, createRandom(3))).toHaveLength(3);
});

test('a missing difficulty is filled from the rest, never twice the same word', () => {
  const easyOnly = [word('zorp', 'easy'), word('blip', 'easy'), word('quab', 'easy')];
  const picked = pickWordChoices(easyOnly, new Set(), 3, createRandom(4));

  expect(new Set(picked).size).toBe(3);
});

test('a custom word is the same in both languages', () => {
  expect(customWordForms('zorp')).toEqual({ en: 'zorp', uk: 'zorp' });
});
