// Judging a guess against the accepted forms of the secret word (spec §5.4). Both sides are tidied
// first, so case, spacing, hyphens and the style of apostrophe never decide anything.

export type GuessVerdict = 'right' | 'close' | 'wrong';

// Words shorter than this get no "close" hint: one letter off would give too much away.
const closeMinLength = 4;

const apostrophes = /['’ʼ`´]/gu;
const edgePunctuation = /^[.,!?;:"«»()]+|[.,!?;:"«»()]+$/gu;
const cyrillic = /[Ѐ-ӿ]/u;

// Ukrainian typed on a keyboard without "і" often uses the Latin "i", which looks the same.
const fixLatinI = (text: string): string => (cyrillic.test(text) ? text.replace(/i/gu, 'і') : text);

export const tidyGuess = (text: string): string => {
  const plain = text
    .normalize('NFC')
    .toLowerCase()
    .replace(apostrophes, "'")
    .replace(/-/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
    .replace(edgePunctuation, '')
    .trim();

  return fixLatinI(plain);
};

// Edit distance where swapping two neighbouring letters also counts as one edit.
export const editDistance = (a: string, b: string): number => {
  const left = [...a];
  const right = [...b];
  const rows = Array.from({ length: left.length + 1 }, (_, i) => Array.from({ length: right.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));

  for (let i = 1; i <= left.length; i++) {
    for (let j = 1; j <= right.length; j++) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      const row = rows[i] as number[];
      const above = rows[i - 1] as number[];
      let best = Math.min((above[j] as number) + 1, (row[j - 1] as number) + 1, (above[j - 1] as number) + cost);

      if (i > 1 && j > 1 && left[i - 1] === right[j - 2] && left[i - 2] === right[j - 1]) {
        best = Math.min(best, ((rows[i - 2] as number[])[j - 2] as number) + 1);
      }

      row[j] = best;
    }
  }

  return (rows[left.length] as number[])[right.length] as number;
};

const isOneOff = (guess: string, form: string): boolean =>
  [...form].length >= closeMinLength && editDistance(guess, form) === 1;

export const judgeGuess = (guess: string, answers: readonly string[]): GuessVerdict => {
  const tidy = tidyGuess(guess);
  const forms = answers.map(tidyGuess).filter((form) => form.length > 0);

  if (tidy.length === 0) return 'wrong';

  if (forms.includes(tidy)) return 'right';

  return forms.some((form) => isOneOff(tidy, form)) ? 'close' : 'wrong';
};
