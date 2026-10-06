import { expect, test } from 'vitest';
import { hintOrder, hintsDue, letterPositions, maskWord, wordLengths } from './hints.js';
import { createRandom } from './random.js';

test('maskWord hides letters but keeps spaces, hyphens and apostrophes', () => {
  expect(maskWord('zip zap', new Set())).toBe('___ ___');
  expect(maskWord('flip-flop', new Set([0]))).toBe('f___-____');
  expect(maskWord('м’ята', new Set())).toBe('_’___');
});

test('letterPositions counts code points, so Cyrillic works like Latin', () => {
  expect(letterPositions('кіт')).toEqual([0, 1, 2]);
  expect(letterPositions('a b')).toEqual([0, 2]);
});

test('hintsDue reveals one letter at half time and another at three quarters', () => {
  expect(hintsDue(9, 0.2)).toBe(0);
  expect(hintsDue(9, 0.5)).toBe(1);
  expect(hintsDue(9, 0.8)).toBe(2);
});

test('hintsDue never reveals more than a third, and nothing for short words', () => {
  expect(hintsDue(4, 0.9)).toBe(1);
  expect(hintsDue(3, 0.9)).toBe(0);
});

test('hintOrder is a repeatable shuffle of the letter positions', () => {
  const order = hintOrder('zip zap', createRandom(5));

  expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 4, 5, 6]);
  expect(hintOrder('zip zap', createRandom(5))).toEqual(order);
});

test('wordLengths reads the letter count of each word in a mask', () => {
  expect(wordLengths('_______')).toEqual([7]);
  expect(wordLengths('___ _a__')).toEqual([3, 4]);
  expect(wordLengths('f___-____')).toEqual([8]);
});
