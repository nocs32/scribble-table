import { readFileSync } from 'node:fs';
import type { WordDifficulty, WordForms } from '@scribble-table/protocol';
import * as v from 'valibot';

// One idea in both languages, plus other answers that also count as right (spec §10).
export interface WordEntry {
  forms: WordForms;
  alternatives: readonly string[];
  difficulty: WordDifficulty;
}

const form = v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(40));

// The file's shape: base64 of a JSON array of these.
const fileSchema = v.array(
  v.strictObject({
    en: form,
    uk: form,
    alternatives: v.array(form),
    difficulty: v.picklist(['easy', 'medium', 'hard']),
  }),
);

// The secret word lists (spec D9a, D9b), shared by every table. They never go to browsers whole:
// only the drawer's browser gets a turn's choices.
export class WordLists {
  readonly entries: readonly WordEntry[];

  constructor(entries: readonly WordEntry[]) {
    this.entries = entries;
  }

  // Throws when the text isn't a valid list, so a broken file stops core-api at start.
  static fromBase64(text: string): WordLists {
    const json: unknown = JSON.parse(Buffer.from(text.replace(/\s+/gu, ''), 'base64').toString('utf8'));
    const rows = v.parse(fileSchema, json);

    return new WordLists(rows.map(({ en, uk, alternatives, difficulty }) => ({ forms: { en, uk }, alternatives, difficulty })));
  }

  // The committed lists, next to this file.
  static load(): WordLists {
    return WordLists.fromBase64(readFileSync(new URL('./word-list.b64', import.meta.url), 'utf8'));
  }
}
