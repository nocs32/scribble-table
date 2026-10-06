import { gameLimits, personNameMaxLength, playerColors, type GameSettingKey, type GameSettings, type PlayerColor, type WordDifficulty, type WordLanguage } from '@scribble-table/protocol';
import type { DemoMember, DemoWord } from './types';
import { customWord, demoWords } from './words';

// What the real server will check too: settings within limits, word picking, names and colours.

const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, Math.round(value)));

const tidyWords = (words: readonly string[]): string[] =>
  [...new Set(words.map((word) => word.trim().replace(/\s+/gu, ' ')).filter((word) => word.length > 0 && word.length <= gameLimits.customWords.maxLength))].slice(
    0,
    gameLimits.customWords.max,
  );

// A settings change from someone at the table, kept within the limits.
export const applySettings = (current: GameSettings, patch: Partial<GameSettings>): GameSettings => {
  const { rounds, drawSeconds, wordChoices } = gameLimits;
  const customWords = tidyWords(patch.customWords ?? current.customWords);
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

export const changedSettings = (before: GameSettings, after: GameSettings): GameSettingKey[] =>
  settingKeys.filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]));

// How a setting shows in its system line; custom words show as their count.
export const settingValue = (settings: GameSettings, key: GameSettingKey): number | boolean => {
  const value = settings[key];

  return Array.isArray(value) ? value.length : value;
};

export const wordPool = (settings: GameSettings): DemoWord[] => {
  const custom = settings.customWords.map(customWord);

  return settings.onlyCustomWords ? custom : [...demoWords, ...custom];
};

const difficultyPattern: readonly WordDifficulty[] = ['easy', 'medium', 'hard', 'easy', 'medium'];

// `count` words to choose from, one of each difficulty where it can, none used yet this game.
export const pickChoices = (pool: readonly DemoWord[], used: ReadonlySet<string>, count: number, random: () => number): DemoWord[] => {
  const fresh = pool.filter((word) => !used.has(word.forms.en));
  const available = fresh.length >= count ? fresh : [...pool];

  return difficultyPattern.slice(0, count).reduce<DemoWord[]>((picked, difficulty) => {
    const left = available.filter((word) => !picked.includes(word));
    const preferred = left.filter((word) => word.difficulty === difficulty);
    const from = preferred.length > 0 ? preferred : left;
    const word = from[Math.floor(random() * from.length)];

    return word ? [...picked, word] : picked;
  }, []);
};

const botProfiles: ReadonlyArray<{ name: string; language: WordLanguage }> = [
  { name: 'Nimble Finch', language: 'en' },
  { name: 'Тиха Рись', language: 'uk' },
  { name: 'Breezy Heron', language: 'en' },
  { name: 'Сонячна Видра', language: 'uk' },
  { name: 'Bold Badger', language: 'en' },
  { name: 'Весела Сова', language: 'uk' },
  { name: 'Lucky Newt', language: 'en' },
];

export const freeColor = (members: readonly DemoMember[]): PlayerColor => playerColors.find((color) => !members.some((member) => member.color === color)) ?? 'indigo';

// The next sample player who isn't at the table yet.
export const nextBot = (members: readonly DemoMember[], createId: () => string): DemoMember | null => {
  const profile = botProfiles.find((candidate) => !members.some((member) => member.name === candidate.name));

  return profile ? { id: createId(), ...profile, color: freeColor(members), score: 0, connected: true, isBot: true } : null;
};

export const tidyName = (name: string): string => name.trim().replace(/\s+/gu, ' ').slice(0, personNameMaxLength);
