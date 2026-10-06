import { readFileSync } from 'node:fs';
import { tidyGuess } from '@scribble-table/engine';
import { expect, test } from 'vitest';
import { WordLists, type WordEntry } from './index.js';

// Every check on the real lists reports numbers only, so a failing test never shows a word
// (spec D9a).

const encode = (rows: unknown): string => Buffer.from(JSON.stringify(rows), 'utf8').toString('base64');

test('a list is read from base64, with line breaks allowed', () => {
  const text = encode([{ en: 'zorblat', uk: 'зорблат', alternatives: ['zorbo'], difficulty: 'easy' }]);
  const lists = WordLists.fromBase64(`${text.slice(0, 10)}\n${text.slice(10)}\n`);

  expect(lists.entries).toEqual([{ forms: { en: 'zorblat', uk: 'зорблат' }, alternatives: ['zorbo'], difficulty: 'easy' }]);
});

test('a broken list is refused', () => {
  expect(() => WordLists.fromBase64(encode([{ en: 'zorblat', uk: 'зорблат', difficulty: 'easy' }]))).toThrow();
  expect(() => WordLists.fromBase64(encode([{ en: 'zorblat', uk: '', alternatives: [], difficulty: 'easy' }]))).toThrow();
  expect(() => WordLists.fromBase64('not base64 json')).toThrow();
});

const answersOf = (entry: WordEntry): string[] => [entry.forms.en, entry.forms.uk, ...entry.alternatives].map(tidyGuess);

// The demo table's sample words, read from the web app: they're shown in the UI, so the real
// lists must never contain them.
const demoAnswers = (): Set<string> => {
  const source = readFileSync(new URL('../../../web/src/services/demo-table/words.ts', import.meta.url), 'utf8');
  const quoted = [...source.matchAll(/forms: \{ en: '([^']+)', uk: '([^']+)' \}, alternatives: \[([^\]]*)\]/gu)];

  return new Set(quoted.flatMap(([, en = '', uk = '', alternatives = '']) => [en, uk, ...[...alternatives.matchAll(/'([^']+)'/gu)].map((match) => match[1] ?? '')]).map(tidyGuess));
};

test('the real lists: about 400 entries, roughly a third of each difficulty', () => {
  const { entries } = WordLists.load();
  const count = (difficulty: string): number => entries.filter((entry) => entry.difficulty === difficulty).length;

  expect(entries.length).toBeGreaterThanOrEqual(380);
  expect([count('easy'), count('medium'), count('hard')].every((each) => each >= entries.length / 4)).toBe(true);
});

test('the real lists: every answer belongs to one entry only, and none is a demo word', () => {
  const { entries } = WordLists.load();
  const owners = new Map<string, number>();
  const demo = demoAnswers();

  entries.forEach((entry, index) => new Set(answersOf(entry)).forEach((answer) => owners.set(answer, owners.has(answer) ? -1 : index)));

  const shared = [...owners.values()].filter((owner) => owner === -1).length;
  const demoClashes = [...owners.keys()].filter((answer) => demo.has(answer)).length;

  expect(demo.size).toBeGreaterThanOrEqual(24);
  expect({ shared, demoClashes }).toEqual({ shared: 0, demoClashes: 0 });
});

test('the real lists: forms are tidy, short and in the right alphabet', () => {
  const { entries } = WordLists.load();
  const latin = /^[a-z][a-z' -]*$/u;
  const ukrainian = /^[а-щьюяєіїґ][а-щьюяєіїґ' -]*$/u;
  const fits = (form: string, alphabet: RegExp): boolean => alphabet.test(form) && form.length <= 24 && form === form.trim() && !form.includes('  ');
  const bad = entries.filter((entry) => !fits(entry.forms.en, latin) || !fits(entry.forms.uk, ukrainian)).length;

  expect(bad).toBe(0);
});
