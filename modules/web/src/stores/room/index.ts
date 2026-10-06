import { personNameMaxLength, type BoardOp, type TableReactionEvent, type TableSecret, type TableSnapshot, type WordLanguage } from '@scribble-table/protocol';
import { makeAutoObservable, observableRef } from 'mobx';
import type { DemoControls, Services, TableLink } from '../../services';
import type { LocaleStore } from '../locale';
import { NameFieldStore } from '../name-field';
import { RoomBoardStore } from './board';
import { RoomFeedStore } from './feed';
import { RoomGameStore } from './game';
import { RoomPresenceStore } from './presence';
import { RoomReactionsStore } from './reactions';
import { RoomShareStore } from './share';
import type { TableSend } from './types';

// connecting → open. The table client sends snapshots, secrets, board ops and reactions;
// this store hands them to its parts and sends their intents back.
export type RoomState = 'connecting' | 'open';

export class RoomStore {
  state: RoomState = 'connecting';
  link: TableLink | null = null;
  readonly presence: RoomPresenceStore;
  readonly game: RoomGameStore;
  readonly board: RoomBoardStore;
  readonly feed: RoomFeedStore;
  readonly reactions: RoomReactionsStore;
  readonly share: RoomShareStore;
  readonly myNameField: NameFieldStore;
  readonly #services: Services;
  readonly #locale: LocaleStore;

  constructor(services: Services, locale: LocaleStore) {
    const { t } = locale;
    const send: TableSend = (type, message) => this.link?.send(type, message);
    const language = (): WordLanguage => locale.language;

    this.#services = services;
    this.#locale = locale;

    this.presence = new RoomPresenceStore({
      t,
      drawerId: () => this.game.drawerId,
      guessedIds: () => this.game.guessedIds,
      gaveUpIds: () => this.game.gaveUpIds,
      gains: () => this.game.reveal?.gains ?? [],
    });

    this.game = new RoomGameStore({ t, language, presence: this.presence, send, now: services.now, repeat: services.repeat });
    this.board = new RoomBoardStore({ t, send, canDraw: () => this.game.canDraw, sounds: services.sounds, now: services.now, createId: services.createId, schedule: services.schedule });
    this.feed = new RoomFeedStore({ presence: this.presence, locale, language, send: (text) => send('chat', { text }) });
    this.reactions = new RoomReactionsStore({ ...services, t, send: (emoji) => send('react', { emoji }) });
    this.share = new RoomShareStore({ ...services, roomId: () => this.link?.roomId ?? null, t });

    this.myNameField = new NameFieldStore({
      read: () => this.presence.me?.name ?? '',
      write: (name) => this.rename(name),
      placeholder: () => t('people.namePlaceholder'),
      normalize: (text) => text.slice(0, personNameMaxLength),
      finish: (text) => text.trim().replace(/\s+/gu, ' '),
    });

    makeAutoObservable(this, { link: observableRef }, { autoBind: true });
  }

  get isOpen(): boolean {
    return this.state === 'open';
  }

  // Only the demo table has these.
  get demo(): DemoControls | null {
    return this.link?.demo ?? null;
  }

  get composerPlaceholder(): string {
    const { t } = this.#locale;

    if (this.game.canGuess) return t('chat.guessPlaceholder');

    return this.game.state === 'drawing' ? t('chat.guessedPlaceholder') : t('chat.placeholder');
  }

  open(): void {
    const { tableClient, address, preferences } = this.#services;
    const listeners = { snapshot: this.receiveSnapshot, secret: this.receiveSecret, board: this.receiveBoard, reaction: this.receiveReaction };

    void tableClient.open(address.roomId(), preferences.loadName(), listeners).then(this.opened);
  }

  opened(link: TableLink): void {
    this.link = link;
    this.state = 'open';
    this.#services.address.showRoom(link.roomId);
  }

  receiveSnapshot(snapshot: TableSnapshot): void {
    this.presence.receive(snapshot.members, this.link?.meId ?? '');
    this.game.receive(snapshot.game);
    this.board.syncTurn(snapshot.game.turnId);
    this.feed.receive(snapshot.feed);
  }

  receiveSecret(secret: TableSecret): void {
    this.game.receiveSecret(secret);
  }

  receiveBoard(op: BoardOp): void {
    this.board.receive(op);
  }

  receiveReaction(event: TableReactionEvent): void {
    this.reactions.receive(event.emoji, event.memberId, this.presence.find(event.memberId)?.name ?? '');
  }

  rename(name: string): void {
    const me = this.presence.me;

    if (!me) return;

    this.presence.rename(me.id, name);
    this.#services.preferences.saveName(name);
    this.link?.send('rename', { name });
  }
}
