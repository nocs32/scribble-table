// The masked word guessers see, and when letters are revealed (spec §5.3).
import { shuffle } from './random.js';

// Hidden letters show as this. Spaces, hyphens and apostrophes are never hidden.
export const maskChar = '_';

const shownAlways = /[\s'’ʼ-]/u;

const isHidden = (char: string): boolean => !shownAlways.test(char);

// Positions (in code points) of the letters that start hidden.
export const letterPositions = (word: string): number[] =>
  [...word].flatMap((char, index) => (isHidden(char) ? [index] : []));

export const maskWord = (word: string, revealed: ReadonlySet<number>): string =>
  [...word].map((char, index) => (isHidden(char) && !revealed.has(index) ? maskChar : char)).join('');

// How many letters are revealed by now: one at half time, another at three quarters, never more
// than a third of the letters, and none for words of three letters or fewer.
export const hintsDue = (letterCount: number, elapsedFraction: number): number => {
  if (letterCount <= 3) return 0;

  const byTime = elapsedFraction >= 0.75 ? 2 : elapsedFraction >= 0.5 ? 1 : 0;

  return Math.min(byTime, Math.floor(letterCount / 3));
};

// The order letters get revealed in, picked once per turn.
export const hintOrder = (word: string, random: () => number): number[] => shuffle(letterPositions(word), random);

// The letter counts of each word in the mask, for the "7" or "5 · 4" label.
export const wordLengths = (mask: string): number[] =>
  mask
    .split(/\s+/u)
    .filter((part) => part.length > 0)
    .map((part) => letterPositions(part).length);
