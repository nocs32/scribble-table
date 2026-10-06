import { guesserPoints, hintOrder, hintsDue, judgeGuess, letterPositions, maskWord, type GuessVerdict } from '@scribble-table/engine';
import type { TurnGain, WordForms, WordLanguage } from '@scribble-table/protocol';
import type { WordEntry } from '../words/index.js';

export interface TableRoomTurnOptions {
  word: WordEntry;
  drawerId: string;
  startedAt: number;
  drawMs: number;
  hints: boolean;
  random: () => number;
}

// One drawing turn: the word, its letter hints over time, who guessed it for how much, and who
// gave up (spec §4.3, §5.3–§5.5).
export class TableRoomTurn {
  readonly word: WordEntry;
  readonly drawerId: string;
  readonly startedAt: number;
  readonly drawMs: number;
  readonly guesses: TurnGain[] = [];
  readonly gaveUpIds: string[] = [];
  readonly #hints: boolean;
  readonly #order: Record<WordLanguage, number[]>;

  constructor(options: TableRoomTurnOptions) {
    this.word = options.word;
    this.drawerId = options.drawerId;
    this.startedAt = options.startedAt;
    this.drawMs = options.drawMs;
    this.#hints = options.hints;
    this.#order = { en: hintOrder(options.word.forms.en, options.random), uk: hintOrder(options.word.forms.uk, options.random) };
  }

  get endsAt(): number {
    return this.startedAt + this.drawMs;
  }

  // When new letters show: half time and three quarters.
  get hintTimes(): number[] {
    return this.#hints ? [0.5, 0.75].map((fraction) => this.startedAt + fraction * this.drawMs) : [];
  }

  get guessedIds(): string[] {
    return this.guesses.map((guess) => guess.memberId);
  }

  masks(now: number): WordForms {
    return { en: this.#mask('en', now), uk: this.#mask('uk', now) };
  }

  hasGuessed(memberId: string): boolean {
    return this.guesses.some((guess) => guess.memberId === memberId);
  }

  // The drawer, and whoever guessed it or gave up. They chat in guessed chat.
  knowsWord(memberId: string): boolean {
    return memberId === this.drawerId || this.hasGuessed(memberId) || this.gaveUpIds.includes(memberId);
  }

  // A right guess in either language counts (spec D9).
  judge(text: string): GuessVerdict {
    return judgeGuess(text, [this.word.forms.en, this.word.forms.uk, ...this.word.alternatives]);
  }

  // Records a right guess and returns its points.
  addGuess(memberId: string, now: number): number {
    const points = guesserPoints(this.endsAt - now, this.drawMs);

    this.guesses.push({ memberId, points });

    return points;
  }

  giveUp(memberId: string): void {
    this.gaveUpIds.push(memberId);
  }

  #mask(language: WordLanguage, now: number): string {
    const form = this.word.forms[language];
    const due = this.#hints ? hintsDue(letterPositions(form).length, (now - this.startedAt) / this.drawMs) : 0;

    return maskWord(form, new Set(this.#order[language].slice(0, due)));
  }
}
