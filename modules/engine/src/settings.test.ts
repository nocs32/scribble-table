import { defaultGameSettings } from '@scribble-table/protocol';
import { expect, test } from 'vitest';
import { applySettings, changedSettings, settingValue, tidyCustomWords } from './settings.js';

test('numbers are clamped and rounded to their steps', () => {
  const settings = applySettings(defaultGameSettings, { rounds: 99, drawSeconds: 44, wordChoices: 0 });

  expect([settings.rounds, settings.drawSeconds, settings.wordChoices]).toEqual([10, 40, 1]);
  expect(applySettings(defaultGameSettings, { drawSeconds: 5000 }).drawSeconds).toBe(180);
});

test('custom words are tidied: trimmed, single-spaced, no blanks, repeats or overlong ones', () => {
  expect(tidyCustomWords(['  zorp  ', 'zorp', '', 'blip   blop', 'x'.repeat(31)])).toEqual(['zorp', 'blip blop']);
});

test('only custom words needs at least ten of them', () => {
  const few = applySettings(defaultGameSettings, { customWords: ['zorp', 'blip'], onlyCustomWords: true });
  const enough = applySettings(defaultGameSettings, { customWords: Array.from({ length: 10 }, (_, index) => `zorp${index}`), onlyCustomWords: true });

  expect(few.onlyCustomWords).toBe(false);
  expect(enough.onlyCustomWords).toBe(true);
});

test('changes are listed in a fixed order, and custom words show as their count', () => {
  const after = applySettings(defaultGameSettings, { sabotage: false, rounds: 5, customWords: ['zorp', 'blip'] });

  expect(changedSettings(defaultGameSettings, after)).toEqual(['rounds', 'customWords', 'sabotage']);
  expect(settingValue(after, 'customWords')).toBe(2);
  expect(settingValue(after, 'sabotage')).toBe(false);
});
