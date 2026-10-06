import { randomUUID } from 'node:crypto';
import { ErrorCode, Room, ServerError, type Client } from '@colyseus/core';
import {
  feedMaxItems,
  tableIntentSchemas,
  tableJoinOptionsSchema,
  tableProtocolVersion,
  type BoardOp,
  type TableErrorCode,
  type TableEvents,
  type TableIntents,
  type TableIntentType,
  type TableJoinOptions,
} from '@scribble-table/protocol';
import { customAlphabet } from 'nanoid';
import * as v from 'valibot';
import { limits } from '../limits.js';
import { logger } from '../logger.js';
import { WordLists } from '../words/index.js';
import { TableRoomDrawing } from './drawing.js';
import { TableRoomError } from './error.js';
import { TableRoomFeed } from './feed.js';
import { TableRoomGame } from './game.js';
import { TableRoomLifecycle, type Schedule } from './lifecycle.js';
import { TableRoomMembers } from './members.js';
import { TableRoomOutbox } from './outbox.js';
import { TableRoomRateLimits } from './rate-limits.js';

export type TableClient = Client<{ messages: TableEvents }>;

// Given once in `server.define(tableRoomName, TableRoom, options)`. Colyseus merges these over
// the browser's create options, so a browser can't replace them.
export interface TableRoomOptions {
  words: WordLists;
}

type TableRoomHandler<K extends TableIntentType> = (client: TableClient, message: TableIntents[K]) => void;

const { table } = limits;

// Intents that change only the board or nothing shared: no view or feed to send afterwards.
const quietIntents: ReadonlySet<TableIntentType> = new Set(['sync', 'stroke', 'fill', 'undo', 'clear', 'react']);

// 12 characters of [0-9a-z]: about 62 bits, so table links can't be guessed.
const createRoomId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

// The client reads the code from the refused join's error message.
const joinError = (code: TableErrorCode): ServerError => new ServerError(ErrorCode.APPLICATION_ERROR, code);

// A join with bad options, or from a web app on another protocol version, is turned away.
const readJoinOptions = (options: unknown): TableJoinOptions => {
  const result = v.safeParse(tableJoinOptionsSchema, options);

  if (!result.success) throw joinError('INVALID_JOIN');

  if (result.output.protocolVersion !== tableProtocolVersion) throw joinError('PROTOCOL_MISMATCH');

  return result.output;
};

// One shared table. Its parts own the rules: who is here, the game, the drawing, the feed, what
// each person is sent, rate limits, and when the empty table is thrown away. This class only
// wires them to Colyseus.
export class TableRoom extends Room<{ client: TableClient }> {
  override maxClients = table.maxClients;
  // The lifecycle decides when an empty table goes, not Colyseus.
  override autoDispose = false;
  override maxMessagesPerSecond = table.maxMessagesPerSecond;
  #words = new WordLists([]);
  readonly #schedule: Schedule = (callback, delayMs) => {
    const delayed = this.clock.setTimeout(callback, delayMs);

    return () => delayed.clear();
  };

  readonly #members = new TableRoomMembers(Math.random);
  readonly #feed = new TableRoomFeed({ now: Date.now, createId: randomUUID, maxItems: feedMaxItems });
  readonly #rateLimits = new TableRoomRateLimits(table.rates, Date.now);
  readonly #game = new TableRoomGame({
    members: this.#members,
    feed: this.#feed,
    words: () => this.#words.entries,
    schedule: this.#schedule,
    now: Date.now,
    random: Math.random,
    createId: randomUUID,
    clearBoard: () => this.#drawing.reset(),
    opened: (memberId) => this.#outbox.reset(memberId),
    changed: () => this.#outbox.flush(),
  });

  readonly #drawing = new TableRoomDrawing({ ...table.drawing, permit: (memberId, move) => this.#game.permit(memberId, move) });
  readonly #outbox = new TableRoomOutbox({
    feed: this.#feed,
    view: () => ({ members: this.#members.snapshot, game: this.#game.snapshot(Date.now()) }),
    secretFor: (memberId) => this.#game.secretFor(memberId),
    now: Date.now,
    send: (memberId, type, message) => this.clients.getById(memberId)?.send(type, message),
    broadcast: (type, message) => this.broadcast(type, message),
  });

  readonly #lifecycle = new TableRoomLifecycle({ schedule: this.#schedule, graceMs: table.emptyGraceMs, close: () => void this.disconnect() });

  override onCreate(options: TableRoomOptions): void {
    this.roomId = createRoomId();
    this.#words = options.words;
    this.#listen();
    this.#lifecycle.open();
    logger.info('table created', { roomId: this.roomId });
  }

  override onJoin(client: TableClient, options: unknown): void {
    const { name } = readJoinOptions(options);
    const member = this.#members.join(client.sessionId, name);

    this.#lifecycle.join();
    this.#feed.system(member, { type: 'joined' });
    this.#game.join(member.id);
    this.#outbox.flush();
    logger.info('table joined', { roomId: this.roomId, sessionId: client.sessionId, people: this.#members.count });
  }

  // A lost connection keeps its seat for a while; the browser reconnects on its own and asks
  // for everything again with `sync`.
  override onDrop(client: TableClient): void {
    this.#members.drop(client.sessionId);
    this.#outbox.forget(client.sessionId);
    this.#game.drop();
    this.#outbox.flush();
    this.allowReconnection(client, table.reconnectSeconds);
  }

  override onReconnect(client: TableClient): void {
    this.#members.reconnect(client.sessionId);
    this.#outbox.flush();
  }

  override onLeave(client: TableClient): void {
    if (!this.#members.has(client.sessionId)) return;

    const member = this.#members.leave(client.sessionId);

    this.#rateLimits.forget(client.sessionId);
    this.#outbox.forget(client.sessionId);
    this.#feed.system(member, { type: 'left' });
    this.#game.leave(member.id);
    this.#lifecycle.leave(this.#members.count);
    this.#outbox.flush();
  }

  override onDispose(): void {
    this.#game.dispose();
    this.#lifecycle.dispose();
    this.#rateLimits.dispose();
    this.#outbox.dispose();
    logger.info('table closed', { roomId: this.roomId });
  }

  #listen(): void {
    const game = this.#game;
    const drawing = this.#drawing;

    this.#on('sync', (client) => this.#sync(client));
    this.#on('start', (client) => game.start(client.sessionId));
    this.#on('updateSettings', (client, patch) => game.updateSettings(client.sessionId, patch));
    this.#on('chooseWord', (client, { index }) => game.chooseWord(client.sessionId, index));
    this.#on('chat', (client, { text }) => game.chat(client.sessionId, text));
    this.#on('giveUp', (client) => game.giveUp(client.sessionId));
    this.#on('trick', (client, { kind }) => game.playTrick(client.sessionId, kind));
    this.#on('playAgain', (client) => game.playAgain(client.sessionId));
    this.#on('stroke', (client, batch) => this.#pass(client, drawing.stroke(client.sessionId, batch)));
    this.#on('fill', (client, fill) => this.#pass(client, drawing.fill(client.sessionId, fill)));
    this.#on('undo', (client) => this.#pass(client, drawing.undo(client.sessionId)));
    this.#on('clear', (client) => this.#pass(client, drawing.clear(client.sessionId)));
    this.#on('react', (client, { emoji }) => this.broadcast('reaction', { memberId: client.sessionId, emoji }, { except: client }));
    this.#on('rename', (client, { name }) => this.#rename(client, name));
  }

  // Every handler: validate the message, check the sender's rate, then call the part that owns it,
  // then send out what changed. Anything refused goes back to the sender as an `error` event;
  // nobody gets disconnected for it.
  #on<K extends TableIntentType>(type: K, handle: TableRoomHandler<K>): void {
    this.onMessage(type, (client: TableClient, input: unknown) => {
      const result = v.safeParse(tableIntentSchemas[type], input);

      if (!result.success) return this.#refuse(client, type, 'INVALID_MESSAGE');

      if (!this.#rateLimits.allow(client.sessionId, type)) return this.#refuse(client, type, 'RATE_LIMITED');

      try {
        handle(client, result.output as TableIntents[K]);
      } catch (error) {
        if (!(error instanceof TableRoomError)) throw error;

        this.#refuse(client, type, error.code);
      }

      if (!quietIntents.has(type)) this.#outbox.flush();
    });
  }

  // Everything this person may see, then the turn's drawing so far (spec §6.3).
  #sync(client: TableClient): void {
    this.#outbox.sync(client.sessionId);
    client.send('drawing', { turnId: this.#game.turnId, bytes: this.#drawing.encode() });
  }

  // A board op goes to everyone else; the sender has it already.
  #pass(client: TableClient, op: BoardOp): void {
    this.broadcast('board', op, { except: client });
  }

  #rename(client: TableClient, text: string): void {
    const name = this.#members.rename(client.sessionId, text);

    if (name !== null) this.#feed.system(this.#members.get(client.sessionId), { type: 'renamed', name });
  }

  #refuse(client: TableClient, type: TableIntentType, code: TableErrorCode): void {
    // Rate limits, and moves that crossed a phase change (a last stroke as time ran out), are expected.
    if (code !== 'RATE_LIMITED' && code !== 'WRONG_PHASE') {
      logger.warn('table message refused', { roomId: this.roomId, sessionId: client.sessionId, type, code });
    }

    client.send('error', { code, type });
  }
}
