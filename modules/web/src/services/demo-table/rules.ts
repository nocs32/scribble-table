import { playerColors, type GameSettings, type PlayerColor, type WordLanguage } from '@scribble-table/protocol';
import type { DemoMember, DemoWord } from './types';
import { customWord, demoWords } from './words';

// The demo's own rules: its word pool and sample players. Settings, word picking and names follow
// the same shared rules as the server (engine and protocol).

export const wordPool = (settings: GameSettings): DemoWord[] => {
  const custom = settings.customWords.map(customWord);

  return settings.onlyCustomWords ? custom : [...demoWords, ...custom];
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
