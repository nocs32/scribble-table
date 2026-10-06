// Picking the words a drawer chooses from (spec §5.2).
import type { WordDifficulty, WordForms } from '@scribble-table/protocol';

export interface PickableWord {
  forms: WordForms;
  difficulty: WordDifficulty;
}

// One of each difficulty first, so three choices are easy, medium and hard.
const difficultyPattern: readonly WordDifficulty[] = ['easy', 'medium', 'hard', 'easy', 'medium'];

// A custom word exists only as typed, so it is the same in both languages.
export const customWordForms = (word: string): WordForms => ({ en: word, uk: word });

// The key a word is remembered by, so a game never offers it twice.
export const wordKey = (word: PickableWord): string => word.forms.en;

// `count` words, one of each difficulty where it can, none used yet this game. Once fewer than
// `count` fresh words are left, used ones come back.
export const pickWordChoices = <T extends PickableWord>(pool: readonly T[], used: ReadonlySet<string>, count: number, random: () => number): T[] => {
  const fresh = pool.filter((word) => !used.has(wordKey(word)));
  const available = fresh.length >= count ? fresh : [...pool];

  return difficultyPattern.slice(0, count).reduce<T[]>((picked, difficulty) => {
    const left = available.filter((word) => !picked.includes(word));
    const preferred = left.filter((word) => word.difficulty === difficulty);
    const from = preferred.length > 0 ? preferred : left;
    const word = from[Math.floor(random() * from.length)];

    return word ? [...picked, word] : picked;
  }, []);
};
