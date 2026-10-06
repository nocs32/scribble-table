import { personNameMaxLength, type BoardAction, type BoardOp, type TableErrorEvent, type TableReactionEvent, type TableSecret, type TableSnapshot, type WordLanguage } from '@scribble-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { DemoControls, Services } from '../../services';
import type { LocaleStore, Translate } from '../locale';
import { NameFieldStore } from '../name-field';
import { RoomBoardStore } from './board';
import { RoomChatPaceStore } from './chat-pace';
import { RoomConnectionStore } from './connection';
import { RoomFeedStore } from './feed';
import { RoomGameStore } from './game';
import { RoomPresenceStore } from './presence';
import { RoomReactionsStore } from './reactions';
import { RoomSabotageStore } from './sabotage';
import { RoomShareStore } from './share';
import type { TableSend } from './types';

// The table sends; the room hands it to its parts. Wrapped, because the room's actions are bound
// only once its constructor has run makeAutoObservable.
const createConnection = (room: RoomStore, services: Services, t: Translate): RoomConnectionStore =>
  new RoomConnectionStore({
    ...services,
    t,
    receivers: {
      snapshot: (snapshot) => room.receiveSnapshot(snapshot),
      secret: (secret) => room.receiveSecret(secret),
      board: (op) => room.receiveBoard(op),
      reaction: (event) => room.receiveReaction(event),
      drawing: (turnId, actions) => room.receiveDrawing(turnId, actions),
      refused: (event) => room.receiveRefusal(event),
    },
  });

// Sabotage reads the game and the people at the table as they change.
const createSabotage = (room: RoomStore, services: Services, t: Translate, send: TableSend): RoomSabotageStore =>
  new RoomSabotageStore({
    t,
    send,
    meId: () => room.presence.meId,
    isOn: () => room.game.state === 'drawing' && room.game.settings.sabotage,
    isDrawer: () => room.game.canDraw,
    hasGuessed: () => room.game.hasGuessed,
    nameOf: (id) => room.presence.find(id)?.name ?? t('chat.someone'),
    now: services.now,
    schedule: services.schedule,
  });

// The drawer draws with every tool, a saboteur with brush and eraser; tricks bend the drawer's pen.
const createBoard = (room: RoomStore, services: Services, t: Translate, send: TableSend): RoomBoardStore =>
  new RoomBoardStore({
    t,
    send,
    isDrawer: () => room.game.canDraw,
    canScribble: () => room.sabotage.canScribble,
    meId: () => room.presence.meId,
    bend: (x, y) => room.sabotage.bend(x, y),
    sounds: services.sounds,
    now: services.now,
    createId: services.createId,
    schedule: services.schedule,
  });

// The table: its connection hands snapshots, secrets, board ops and reactions to the parts, and
// the parts send their intents back through it.
export class RoomStore {
  readonly connection: RoomConnectionStore;
  readonly presence: RoomPresenceStore;
  readonly game: RoomGameStore;
  readonly board: RoomBoardStore;
  readonly sabotage: RoomSabotageStore;
  readonly feed: RoomFeedStore;
  readonly chatPace: RoomChatPaceStore;
  readonly reactions: RoomReactionsStore;
  readonly share: RoomShareStore;
  readonly myNameField: NameFieldStore;
  readonly #services: Services;
  readonly #locale: LocaleStore;

  constructor(services: Services, locale: LocaleStore) {
    const { t } = locale;
    const send: TableSend = (type, message) => this.connection.link?.send(type, message);
    const language = (): WordLanguage => locale.language;

    this.#services = services;
    this.#locale = locale;

    this.connection = createConnection(this, services, t);

    this.presence = new RoomPresenceStore({
      t,
      drawerId: () => this.game.drawerId,
      guessedIds: () => this.game.guessedIds,
      gaveUpIds: () => this.game.gaveUpIds,
      gains: () => this.game.reveal?.gains ?? [],
    });

    this.game = new RoomGameStore({ t, language, presence: this.presence, send, now: services.now, repeat: services.repeat });
    this.sabotage = createSabotage(this, services, t, send);
    this.board = createBoard(this, services, t, send);
    this.chatPace = new RoomChatPaceStore({ t, now: services.now, schedule: services.schedule });
    this.feed = new RoomFeedStore({ presence: this.presence, locale, language, send: (text) => send('chat', { text }), takeTurn: () => this.chatPace.take() });
    this.reactions = new RoomReactionsStore({ ...services, t, send: (emoji) => send('react', { emoji }) });
    this.share = new RoomShareStore({ ...services, roomId: () => this.connection.roomId, t });

    this.myNameField = new NameFieldStore({
      read: () => this.presence.me?.name ?? '',
      write: (name) => this.rename(name),
      placeholder: () => t('people.namePlaceholder'),
      normalize: (text) => text.slice(0, personNameMaxLength),
      finish: (text) => text.trim().replace(/\s+/gu, ' '),
    });

    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isOpen(): boolean {
    return this.connection.isOpen;
  }

  // Only the demo table has these.
  get demo(): DemoControls | null {
    return this.connection.link?.demo ?? null;
  }

  get composerPlaceholder(): string {
    const { t } = this.#locale;

    if (this.game.canGuess) return t('chat.guessPlaceholder');

    return this.game.state === 'drawing' ? t('chat.guessedPlaceholder') : t('chat.placeholder');
  }

  open(): void {
    this.connection.open();
  }

  receiveSnapshot(snapshot: TableSnapshot): void {
    this.presence.receive(snapshot.members, this.connection.meId);
    this.game.receive(snapshot.game);
    this.sabotage.receive(snapshot.game);
    this.board.syncTurn(snapshot.game.turnId);
    this.feed.receive(snapshot.feed);
  }

  receiveSecret(secret: TableSecret): void {
    this.game.receiveSecret(secret);
  }

  receiveBoard(op: BoardOp): void {
    this.board.receive(op);

    if (op.type === 'stroke' && op.authorId !== this.game.drawerId) this.sabotage.markScribbling(op.authorId);
  }

  // Joining or reconnecting mid-turn: the whole drawing so far, at once.
  receiveDrawing(turnId: string, actions: BoardAction[]): void {
    this.board.restore(turnId, actions);
  }

  // A chat line the table turned down for coming too fast gets a note, instead of vanishing.
  receiveRefusal(event: TableErrorEvent): void {
    if (event.type === 'chat' && event.code === 'RATE_LIMITED') this.chatPace.refuse();
  }

  receiveReaction(event: TableReactionEvent): void {
    this.reactions.receive(event.emoji, event.memberId, this.presence.find(event.memberId)?.name ?? '');
  }

  rename(name: string): void {
    const me = this.presence.me;

    if (!me) return;

    this.presence.rename(me.id, name);
    this.#services.preferences.saveName(name);
    this.connection.link?.send('rename', { name });
  }
}
