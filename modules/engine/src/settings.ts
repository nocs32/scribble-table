// The table's settings (spec §5.1): a change from anyone at the table, kept within the limits.
import { gameLimits, type GameSettingKey, type GameSettings } from '@scribble-table/protocol';

const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, Math.round(value)));

// Custom words as typed, tidied: single spaces, no blanks or repeats, each within the length cap.
export const tidyCustomWords = (words: readonly string[]): string[] => {
  const tidy = words.map((word) => word.trim().replace(/\s+/gu, ' ')).filter((word) => word.length > 0 && word.length <= gameLimits.customWords.maxLength);

  return [...new Set(tidy)].slice(0, gameLimits.customWords.max);
};

export const applySettings = (current: GameSettings, patch: Partial<GameSettings>): GameSettings => {
  const { rounds, drawSeconds, wordChoices } = gameLimits;
  const customWords = tidyCustomWords(patch.customWords ?? current.customWords);
  const drawStep = drawSeconds.step;

  return {
    rounds: clamp(patch.rounds ?? current.rounds, rounds.min, rounds.max),
    drawSeconds: clamp(Math.round((patch.drawSeconds ?? current.drawSeconds) / drawStep) * drawStep, drawSeconds.min, drawSeconds.max),
    wordChoices: clamp(patch.wordChoices ?? current.wordChoices, wordChoices.min, wordChoices.max),
    hints: patch.hints ?? current.hints,
    customWords,
    onlyCustomWords: (patch.onlyCustomWords ?? current.onlyCustomWords) && customWords.length >= gameLimits.customWords.minForOnly,
    sabotage: patch.sabotage ?? current.sabotage,
  };
};

const settingKeys: readonly GameSettingKey[] = ['rounds', 'drawSeconds', 'wordChoices', 'hints', 'customWords', 'onlyCustomWords', 'sabotage'];

// Which settings differ, in a fixed order (one feed line each).
export const changedSettings = (before: GameSettings, after: GameSettings): GameSettingKey[] =>
  settingKeys.filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]));

// How a setting shows in its feed line; custom words show as their count.
export const settingValue = (settings: GameSettings, key: GameSettingKey): number | boolean => {
  const value = settings[key];

  return Array.isArray(value) ? value.length : value;
};
