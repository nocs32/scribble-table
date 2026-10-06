import { chatMaxLength, type FeedEvent, type FeedItem, type GameSettingKey, type WordLanguage } from '@scribble-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Localizer, Translate } from '../locale';
import type { RoomPresenceStore } from './presence';
import type { PlayerColor } from './types';

// default: everyone's chat · guessed: only those who know the word · success: a right guess ·
// notice: a line only you see ("close!").
export type FeedEntryTone = 'default' | 'guessed' | 'success' | 'notice';

export interface FeedEntry {
  id: string;
  kind: FeedItem['kind'];
  tone: FeedEntryTone;
  text: string;
  authorName: string;
  authorInitial: string;
  authorColor: PlayerColor;
  timeLabel: string;
  startsGroup: boolean;
  // "Only those who know can see this" on guessed-chat lines.
  tag: string | null;
  // A line only you see ("close!") is about you, so it doesn't repeat your name.
  showsAuthor: boolean;
}

export interface RoomFeedDeps {
  presence: RoomPresenceStore;
  locale: Localizer;
  language: () => WordLanguage;
  send: (text: string) => void;
  // Takes a slot for one line; false when you're chatting faster than the table takes lines.
  takeTurn: () => boolean;
}

const groupWindowMs = 5 * 60_000;

// Slack groups consecutive messages from one person within a few minutes under one header.
const isGroupStart = (item: FeedItem, previous: FeedItem | undefined): boolean =>
  item.kind === 'system' ||
  previous?.kind !== 'message' ||
  previous.authorId !== item.authorId ||
  previous.audience !== item.audience ||
  item.at - previous.at > groupWindowMs;

const describeSetting = (setting: GameSettingKey, value: number | boolean, t: Translate): string => {
  switch (setting) {
    case 'hints':
      return t(value ? 'feed.setting.hintsOn' : 'feed.setting.hintsOff');
    case 'onlyCustomWords':
      return t(value ? 'feed.setting.onlyCustomOn' : 'feed.setting.onlyCustomOff');
    case 'sabotage':
      return t(value ? 'feed.setting.sabotageOn' : 'feed.setting.sabotageOff');
    case 'customWords':
      return t('feed.setting.customWords', { count: Number(value) });
    default:
      return t(`feed.setting.${setting}`, { value: Number(value) });
  }
};

const describe = (event: FeedEvent, t: Translate, language: WordLanguage): string => {
  switch (event.type) {
    case 'started':
      return t('feed.started', { count: event.rounds });
    case 'renamed':
      return t('feed.renamed', { name: event.name });
    case 'drew':
      return t('feed.drew', { word: event.word[language] });
    case 'setting':
      return describeSetting(event.setting, event.value, t);
    case 'close':
      return t('feed.close', { guess: event.guess });
    case 'trick':
      return t(`feed.trick.${event.trick}`);
    default:
      return t(`feed.${event.type}`);
  }
};

const toneOf = (item: FeedItem): FeedEntryTone => {
  if (item.kind === 'message') return item.audience === 'guessed' ? 'guessed' : 'default';

  if (item.event.type === 'guessed') return 'success';

  return item.event.type === 'close' ? 'notice' : 'default';
};

// Chat messages and system lines from the table, newest last, plus the composer draft.
export class RoomFeedStore {
  items: FeedItem[] = [];
  draft = '';
  readonly #deps: RoomFeedDeps;

  constructor(deps: RoomFeedDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get entries(): FeedEntry[] {
    return this.items.map((item, index) => this.#toEntry(item, this.items[index - 1]));
  }

  get canSend(): boolean {
    return this.draft.trim().length > 0;
  }

  get isDraftEmpty(): boolean {
    return !this.canSend;
  }

  get maxLength(): number {
    return chatMaxLength;
  }

  receive(items: FeedItem[]): void {
    this.items = items;
  }

  setDraft(draft: string): void {
    this.draft = draft.slice(0, chatMaxLength);
  }

  // The message shows once the table has added it to the feed. Too fast, and it stays in the box.
  send(): void {
    const text = this.draft.trim();

    if (!text || !this.#deps.takeTurn()) return;

    this.#deps.send(text);
    this.draft = '';
  }

  #toEntry(item: FeedItem, previous: FeedItem | undefined): FeedEntry {
    const { locale, presence, language } = this.#deps;
    // Someone still at the table shows as they are right now; someone who left, as the line kept them.
    const author = presence.find(item.authorId);
    const authorName = author?.name ?? item.authorName;

    return {
      id: item.id,
      kind: item.kind,
      tone: toneOf(item),
      text: item.kind === 'message' ? item.text : describe(item.event, locale.t, language()),
      authorName: authorName || locale.t('chat.someone'),
      authorInitial: authorName.charAt(0).toUpperCase() || '?',
      authorColor: author?.color ?? item.authorColor,
      timeLabel: locale.formatTime(item.at),
      startsGroup: isGroupStart(item, previous),
      tag: toneOf(item) === 'guessed' ? locale.t('chat.guessedTag') : null,
      showsAuthor: toneOf(item) !== 'notice',
    };
  }
}
