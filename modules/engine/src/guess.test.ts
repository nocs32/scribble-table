import { expect, test } from 'vitest';
import { editDistance, judgeGuess, tidyGuess } from './guess.js';

// Made-up words only: the real word lists stay secret (spec D9a).
const answers = ['wobblefish', 'хвилерибка'];

test('tidyGuess ignores case, spacing, hyphens and edge punctuation', () => {
  expect(tidyGuess('  Wobble-Fish!! ')).toBe('wobble fish');
  expect(tidyGuess('ZIP   zap?')).toBe('zip zap');
  expect(tidyGuess('...')).toBe('');
});

test('tidyGuess treats every apostrophe style as one', () => {
  expect(tidyGuess('м’ята')).toBe(tidyGuess("м'ята"));
  expect(tidyGuess('мʼята')).toBe(tidyGuess("м'ята"));
});

test('tidyGuess reads a Latin i in a Cyrillic word as the Ukrainian і', () => {
  expect(tidyGuess('кiт')).toBe('кіт');
  expect(tidyGuess('kit')).toBe('kit');
});

test('editDistance counts a swap of neighbours as one edit', () => {
  expect(editDistance('wobble', 'wobble')).toBe(0);
  expect(editDistance('wobble', 'wobbel')).toBe(1);
  expect(editDistance('wobble', 'wobbl')).toBe(1);
  expect(editDistance('wobble', 'wubbly')).toBe(2);
  expect(editDistance('', 'abc')).toBe(3);
});

test('judgeGuess accepts any form in either language', () => {
  expect(judgeGuess('Wobblefish', answers)).toBe('right');
  expect(judgeGuess('ХВИЛЕРИБКА', answers)).toBe('right');
  expect(judgeGuess('something else', answers)).toBe('wrong');
  expect(judgeGuess('   ', answers)).toBe('wrong');
});

test('judgeGuess calls a one-letter miss close, but not for short words', () => {
  expect(judgeGuess('wobblefsh', answers)).toBe('close');
  expect(judgeGuess('хвилерибко', answers)).toBe('close');
  expect(judgeGuess('wobblefihs', answers)).toBe('close');
  expect(judgeGuess('zop', ['zap'])).toBe('wrong');
});
