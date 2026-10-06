import { gameLimits, type GameSettings } from '@scribble-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../../locale';
import type { TableSend } from '../types';

export interface RoomGameSettingsDeps {
  t: Translate;
  send: TableSend;
  // Settings change only in the lobby.
  isEditable: () => boolean;
}

// idle → dragging (a slider is held: the table's values don't overwrite it) or typingWords.
export type RoomGameSettingsState = 'idle' | 'dragging' | 'typingWords';

export interface WordChoiceOption {
  value: string;
  label: string;
}

const parseWords = (text: string): string[] =>
  text
    .split(/[,\n]/u)
    .map((word) => word.trim())
    .filter((word) => word.length > 0);

// The lobby's settings card. Values come from the table; a slider shows where you drag at once
// and sends when you let go. Anyone at the table may change them.
export class RoomGameSettingsStore {
  state: RoomGameSettingsState = 'idle';
  rounds = 0;
  drawSeconds = 0;
  wordChoices = 0;
  hints = true;
  customWords: string[] = [];
  onlyCustomWords = false;
  sabotage = true;
  wordsDraft = '';
  readonly limits = gameLimits;
  readonly #deps: RoomGameSettingsDeps;

  constructor(deps: RoomGameSettingsDeps) {
    this.#deps = deps;
    makeAutoObservable(this, { limits: false }, { autoBind: true });
  }

  get isEditable(): boolean {
    return this.#deps.isEditable();
  }

  get roundsLabel(): string {
    return String(this.rounds);
  }

  get drawTimeLabel(): string {
    return this.#deps.t('lobby.seconds', { count: this.drawSeconds });
  }

  get wordChoiceOptions(): WordChoiceOption[] {
    return Array.from({ length: gameLimits.wordChoices.max }, (_, index) => ({ value: String(index + 1), label: String(index + 1) }));
  }

  get wordChoicesValue(): string {
    return String(this.wordChoices);
  }

  get wordCountLabel(): string {
    const count = this.state === 'typingWords' ? parseWords(this.wordsDraft).length : this.customWords.length;

    return this.#deps.t('lobby.wordCount', { count });
  }

  get canUseOnlyCustom(): boolean {
    return this.isEditable && this.customWords.length >= gameLimits.customWords.minForOnly;
  }

  get onlyCustomHint(): string {
    return this.#deps.t('lobby.onlyCustomHint', { count: gameLimits.customWords.minForOnly });
  }

  receive(settings: GameSettings): void {
    if (this.state !== 'dragging') {
      this.rounds = settings.rounds;
      this.drawSeconds = settings.drawSeconds;
    }

    this.wordChoices = settings.wordChoices;
    this.hints = settings.hints;
    this.customWords = settings.customWords;
    this.onlyCustomWords = settings.onlyCustomWords;
    this.sabotage = settings.sabotage;

    if (this.state !== 'typingWords') this.wordsDraft = settings.customWords.join(', ');
  }

  previewRounds(values: number[]): void {
    this.state = 'dragging';
    this.rounds = values[0] ?? this.rounds;
  }

  previewDrawSeconds(values: number[]): void {
    this.state = 'dragging';
    this.drawSeconds = values[0] ?? this.drawSeconds;
  }

  commitSliders(): void {
    this.state = 'idle';
    this.#deps.send('updateSettings', { rounds: this.rounds, drawSeconds: this.drawSeconds });
  }

  chooseWordChoices(value: string | null): void {
    const count = Number(value);

    if (Number.isInteger(count) && count > 0) this.#deps.send('updateSettings', { wordChoices: count });
  }

  setHints(checked: boolean): void {
    this.#deps.send('updateSettings', { hints: checked });
  }

  setSabotage(checked: boolean): void {
    this.#deps.send('updateSettings', { sabotage: checked });
  }

  setOnlyCustom(checked: boolean): void {
    this.#deps.send('updateSettings', { onlyCustomWords: checked });
  }

  typeWords(text: string): void {
    this.state = 'typingWords';
    this.wordsDraft = text;
  }

  commitWords(): void {
    if (this.state !== 'typingWords') return;

    this.state = 'idle';
    this.#deps.send('updateSettings', { customWords: parseWords(this.wordsDraft) });
  }
}
