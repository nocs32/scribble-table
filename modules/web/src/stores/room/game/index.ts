import { maskChar, wordLengths } from '@scribble-table/engine';
import {
  gameLimits,
  type GamePhase,
  type GameSnapshot,
  type RevealSnapshot,
  type TableSecret,
  type WordChoice,
  type WordDifficulty,
  type WordForms,
  type WordLanguage,
} from '@scribble-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Schedule } from '../../../services';
import type { Translate } from '../../locale';
import type { PlayerView, RoomPresenceStore } from '../presence';
import type { PlayerColor, TableSend } from '../types';
import { RoomGameClockStore } from './clock';
import { RoomGameSettingsStore } from './settings';

export type WordSlotKind = 'letter' | 'hidden' | 'gap' | 'mark';

export interface WordSlot {
  key: string;
  char: string;
  kind: WordSlotKind;
}

export interface ChoiceView {
  index: number;
  word: string;
  difficulty: WordDifficulty;
  difficultyLabel: string;
}

export interface GainView {
  id: string;
  name: string;
  initial: string;
  color: PlayerColor;
  pointsLabel: string;
  note: string;
}

export interface RevealView {
  word: string;
  // The other language's form, which counted too.
  alsoCounts: string | null;
  reasonLabel: string;
  gains: GainView[];
}

export type Medal = 'gold' | 'silver' | 'bronze';

export interface PodiumPlaceView {
  player: PlayerView;
  medal: Medal;
}

export interface PodiumView {
  title: string;
  places: PodiumPlaceView[];
  others: PlayerView[];
}

export interface RoomGameDeps {
  t: Translate;
  language: () => WordLanguage;
  presence: RoomPresenceStore;
  send: TableSend;
  now: () => number;
  repeat: Schedule;
}

const medals: readonly Medal[] = ['gold', 'silver', 'bronze'];

const slotKind = (char: string): WordSlotKind => {
  if (/\s/u.test(char)) return 'gap';

  if (char === maskChar) return 'hidden';

  return /['’ʼ-]/u.test(char) ? 'mark' : 'letter';
};

// The game as you see it: its phase (the state), the word or its mask in your language, and the
// labels for the header, the overlays and the podium. The table runs the game; this only asks.
export class RoomGameStore {
  state: GamePhase = 'lobby';
  round = 0;
  turnId = '';
  drawerId: string | null = null;
  masks: WordForms | null = null;
  guessedIds: string[] = [];
  reveal: RevealSnapshot | null = null;
  choices: WordChoice[] | null = null;
  word: WordForms | null = null;
  readonly settings: RoomGameSettingsStore;
  readonly clock: RoomGameClockStore;
  readonly #deps: RoomGameDeps;

  constructor(deps: RoomGameDeps) {
    this.#deps = deps;
    this.settings = new RoomGameSettingsStore({ t: deps.t, send: deps.send, isEditable: () => this.state === 'lobby' });
    this.clock = new RoomGameClockStore({ now: deps.now, repeat: deps.repeat });
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isDrawer(): boolean {
    return this.drawerId !== null && this.drawerId === this.#deps.presence.meId;
  }

  get hasGuessed(): boolean {
    return this.guessedIds.includes(this.#deps.presence.meId);
  }

  get canGuess(): boolean {
    return this.state === 'drawing' && !this.isDrawer && !this.hasGuessed;
  }

  // You draw now: the board takes your strokes.
  get canDraw(): boolean {
    return this.state === 'drawing' && this.isDrawer;
  }

  get isPlaying(): boolean {
    return this.state !== 'lobby' && this.state !== 'podium';
  }

  get drawer(): PlayerView | undefined {
    return this.#deps.presence.find(this.drawerId ?? '');
  }

  get drawerName(): string {
    return this.drawer?.name ?? this.#deps.t('chat.someone');
  }

  get roundLabel(): string {
    const { t } = this.#deps;

    if (this.state === 'lobby') return t('game.lobby');

    // On the podium the round counter has run past the last round.
    const round = Math.min(this.round, this.settings.rounds);

    return t('game.round', { round, rounds: this.settings.rounds });
  }

  get headline(): string {
    const { t } = this.#deps;

    const lines: Record<GamePhase, () => string> = {
      lobby: () => t('game.waiting'),
      choosing: () => (this.isDrawer ? t('game.youChoose') : t('game.choosing', { name: this.drawerName })),
      drawing: () => (this.isDrawer ? t('game.drawThis') : this.hasGuessed ? t('game.youGotIt') : t('game.guessThis')),
      reveal: () => t('game.wordWas'),
      podium: () => t('game.over'),
    };

    return lines[this.state]();
  }

  // What the header spells out: the word once you know it, the mask while you guess.
  get shownWord(): string | null {
    const language = this.#deps.language();

    if (this.state === 'reveal') return this.reveal?.word[language] ?? null;

    if (this.state !== 'drawing') return null;

    return this.word?.[language] ?? this.masks?.[language] ?? null;
  }

  get slots(): WordSlot[] {
    return [...(this.shownWord ?? '')].map((char, index) => ({ key: String(index), char, kind: slotKind(char) }));
  }

  get isMasked(): boolean {
    return this.state === 'drawing' && this.word === null;
  }

  // "7" or "5 · 4": the letter count of each word, while you guess.
  get lengthLabel(): string {
    return this.isMasked && this.shownWord ? wordLengths(this.shownWord).join(' · ') : '';
  }

  // What a screen reader says for the word: the word, or how many letters it hides.
  get wordLabel(): string {
    return this.isMasked ? this.#deps.t('game.hiddenWord', { lengths: this.lengthLabel }) : (this.shownWord ?? '');
  }

  get timerLabel(): string {
    return this.#deps.t('game.timeLeft', { count: this.clock.secondsLeft });
  }

  get choiceViews(): ChoiceView[] {
    const language = this.#deps.language();

    return (this.choices ?? []).map((choice, index) => ({
      index,
      word: choice.forms[language],
      difficulty: choice.difficulty,
      difficultyLabel: this.#deps.t(`choose.${choice.difficulty}`),
    }));
  }

  get isChoosing(): boolean {
    return this.state === 'choosing' && this.isDrawer && this.choiceViews.length > 0;
  }

  get revealView(): RevealView | null {
    const reveal = this.reveal;

    if (this.state !== 'reveal' || !reveal) return null;

    const language = this.#deps.language();
    const other = reveal.word[language === 'en' ? 'uk' : 'en'];

    return {
      word: reveal.word[language],
      alsoCounts: other !== reveal.word[language] ? this.#deps.t('reveal.alsoCounts', { word: other }) : null,
      reasonLabel: this.#reasonLabel(reveal),
      gains: reveal.gains.flatMap((gain) => this.#gainView(gain.memberId, gain.points)),
    };
  }

  get podium(): PodiumView {
    const { standings } = this.#deps.presence;
    const winners = standings.filter((player) => player.place === 1);
    const title = winners.length === 1 ? this.#deps.t('podium.winner', { name: winners[0]?.name ?? '' }) : this.#deps.t('podium.tie');

    const places = standings.filter((player) => player.place <= 3).map((player) => ({ player, medal: medals[player.place - 1] ?? 'bronze' }));

    return { title, places, others: standings.filter((player) => player.place > 3) };
  }

  get canStart(): boolean {
    return this.state === 'lobby' && this.#deps.presence.count >= gameLimits.minPlayers;
  }

  get startHint(): string {
    const { t, presence } = this.#deps;

    return this.canStart ? t('lobby.players', { count: presence.count }) : t('lobby.needPlayers', { count: gameLimits.minPlayers });
  }

  receive(game: GameSnapshot): void {
    this.state = game.phase;
    this.round = game.round;
    this.turnId = game.turnId;
    this.drawerId = game.drawerId;
    this.masks = game.masks;
    this.guessedIds = game.guessedIds;
    this.reveal = game.reveal;
    this.settings.receive(game.settings);
    this.clock.track(game.endsAt);
  }

  receiveSecret(secret: TableSecret): void {
    this.choices = secret.choices;
    this.word = secret.word;
  }

  start(): void {
    if (this.canStart) this.#deps.send('start', {});
  }

  chooseWord(index: number): void {
    if (this.isChoosing) this.#deps.send('chooseWord', { index });
  }

  playAgain(): void {
    if (this.state === 'podium') this.#deps.send('playAgain', {});
  }

  #reasonLabel(reveal: RevealSnapshot): string {
    const { t } = this.#deps;

    if (reveal.reason === 'everyone') return t('reveal.everyone');

    if (reveal.reason === 'drawerLeft') return t('reveal.drawerLeft');

    return reveal.gains.some((gain) => gain.memberId !== this.drawerId && gain.points > 0) ? t('reveal.time') : t('reveal.nobody');
  }

  #gainView(memberId: string, points: number): GainView[] {
    const player = this.#deps.presence.find(memberId);

    if (!player) return [];

    const note = memberId === this.drawerId ? this.#deps.t('reveal.drawer') : '';

    return [{ id: player.id, name: player.name, initial: player.initial, color: player.color, pointsLabel: this.#deps.t('players.gain', { points }), note }];
  }
}
