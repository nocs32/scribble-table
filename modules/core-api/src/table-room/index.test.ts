import { Server } from '@colyseus/core';
import type { Room as SdkRoom } from '@colyseus/sdk';
import { ColyseusTestServer } from '@colyseus/testing';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { decodeDrawing } from '@scribble-table/engine';
import {
  tableProtocolVersion,
  tableRoomName,
  type BoardAction,
  type BoardOp,
  type FeedItem,
  type TableDrawingEvent,
  type TableFeedEvent,
  type TableSecret,
  type TableViewEvent,
} from '@scribble-table/protocol';
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest';
import { WordLists } from '../words/index.js';
import { TableRoom, type TableRoomOptions } from './index.js';
import { testWords } from './test-table.js';

let colyseus: ColyseusTestServer;

// Not 2568 (`boot` always uses it for a Server instance): the dev server may be running there.
const testPort = 2578;

beforeAll(async () => {
  const server = new Server({ transport: new WebSocketTransport(), greet: false, gracefullyShutdown: false });
  const options: TableRoomOptions = { words: new WordLists(testWords) };

  server.define(tableRoomName, TableRoom, options);
  await server.listen(testPort);
  colyseus = new ColyseusTestServer(server);
});

afterEach(async () => {
  await colyseus.cleanup();
});

afterAll(async () => {
  await colyseus.shutdown();
});

// One browser at the table: everything it was sent, in order, and what that adds up to.
interface Player {
  sdk: SdkRoom;
  id: string;
  log: Array<[string, unknown]>;
  view: TableViewEvent | null;
  feed: FeedItem[];
  secret: TableSecret | null;
  ops: BoardOp[];
  drawing: BoardAction[] | null;
  // Refused intents, as `type:code`.
  errors: string[];
}

const record = (player: Player, type: string, message: unknown): void => {
  player.log.push([type, message]);

  if (type === 'view') player.view = message as TableViewEvent;
  else if (type === 'feed') player.feed = (message as TableFeedEvent).reset ? (message as TableFeedEvent).items : [...player.feed, ...(message as TableFeedEvent).items];
  else if (type === 'secret') player.secret = message as TableSecret;
  else if (type === 'board') player.ops.push(message as BoardOp);
  else if (type === 'drawing') player.drawing = decodeDrawing((message as TableDrawingEvent).bytes);
  else if (type === 'error') player.errors.push(`${(message as { type: string }).type}:${(message as { code: string }).code}`);
};

const sit = async (room: TableRoom, name: string | null): Promise<Player> => {
  const sdk = await colyseus.connectTo(room, { protocolVersion: tableProtocolVersion, name });
  const player: Player = { sdk, id: sdk.sessionId, log: [], view: null, feed: [], secret: null, ops: [], drawing: null, errors: [] };

  sdk.onMessage('*', (type, message) => record(player, String(type), message));
  sdk.send('sync', {});
  await vi.waitFor(() => expect(player.drawing).not.toBeNull());

  return player;
};

const phaseOf = (player: Player): string | undefined => player.view?.game.phase;

const lines = (player: Player): string[] => player.feed.map((item) => (item.kind === 'message' ? item.text : item.event.type));

// Ana, Bo and Cy at a new table, with Ana drawing the easy test word.
const drawingTable = async (): Promise<{ room: TableRoom; ana: Player; bo: Player; cy: Player }> => {
  const room = await colyseus.createRoom<TableRoom>(tableRoomName);
  const [ana, bo, cy] = [await sit(room, 'Ana'), await sit(room, 'Bo'), await sit(room, 'Cy')];

  ana.sdk.send('start', {});
  await vi.waitFor(() => expect(ana.secret?.choices).toHaveLength(3));
  ana.sdk.send('chooseWord', { index: 0 });
  await vi.waitFor(() => expect(phaseOf(cy)).toBe('drawing'));

  return { room, ana, bo, cy };
};

test('people join with their own name or a made-up one, each in a different colour', async () => {
  const room = await colyseus.createRoom<TableRoom>(tableRoomName);
  const ana = await sit(room, 'Ana');
  const guest = await sit(room, null);

  await vi.waitFor(() => expect(ana.view?.members).toHaveLength(2));

  const [first, second] = ana.view?.members ?? [];

  expect(room.roomId).toMatch(/^[0-9a-z]{12}$/u);
  expect([first?.id, first?.name, second?.id]).toEqual([ana.id, 'Ana', guest.id]);
  expect(second?.name).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/u);
  expect(first?.color).not.toBe(second?.color);
  expect(lines(ana)).toEqual(['joined', 'joined']);
});

test('a web app on another protocol version is turned away', async () => {
  const room = await colyseus.createRoom<TableRoom>(tableRoomName);

  await expect(colyseus.connectTo(room, { protocolVersion: tableProtocolVersion + 1, name: null })).rejects.toThrow('PROTOCOL_MISMATCH');
});

test('bad or refused messages come back as typed errors, and the sender stays', async () => {
  const room = await colyseus.createRoom<TableRoom>(tableRoomName);
  const ana = await sit(room, 'Ana');

  ana.sdk.send('chat', { text: 'hi', extra: true });
  ana.sdk.send('start', {});
  ana.sdk.send('stroke', { strokeId: 's1', color: 0, size: 0, eraser: false, points: [1, 1] });
  await vi.waitFor(() => expect(ana.errors).toEqual(['chat:INVALID_MESSAGE', 'start:NOT_ENOUGH_PLAYERS', 'stroke:WRONG_PHASE']));
  expect(room.clients).toHaveLength(1);
});

test('chat faster than the server allows is refused, and the refusal names the chat', async () => {
  const room = await colyseus.createRoom<TableRoom>(tableRoomName);
  const ana = await sit(room, 'Ana');

  Array.from({ length: 10 }, (_, index) => ana.sdk.send('chat', { text: `line ${index}` }));
  await vi.waitFor(() => expect(ana.errors).toEqual(['chat:RATE_LIMITED', 'chat:RATE_LIMITED']));
  expect(lines(ana).filter((line) => line.startsWith('line'))).toHaveLength(8);
});

test('a turn: the drawer gets the choices, the drawing reaches everyone else, a right guess ends it', async () => {
  const { ana, bo, cy } = await drawingTable();

  expect(bo.secret).toEqual({ choices: null, word: null });
  expect(ana.secret?.word?.en).toBe('zorblat');
  ana.sdk.send('stroke', { strokeId: 's1', color: 3, size: 1, eraser: false, points: [10, 10, 20, 20] });
  await vi.waitFor(() => expect(cy.ops).toEqual([{ type: 'stroke', authorId: ana.id, batch: { strokeId: 's1', color: 3, size: 1, eraser: false, points: [10, 10, 20, 20] } }]));
  expect(ana.ops).toEqual([]);
  bo.sdk.send('chat', { text: 'Zorblat' });
  cy.sdk.send('chat', { text: 'зорблат' });
  await vi.waitFor(() => expect(phaseOf(ana)).toBe('reveal'));
  expect(ana.view?.game.reveal?.reason).toBe('everyone');
  expect(ana.view?.members.map((member) => member.score)).toEqual([50, 100, 100]);
});

test('the secret never reaches a guesser before the reveal, in any message', async () => {
  const { ana, bo, cy } = await drawingTable();
  const forms = testWords.flatMap((word) => [word.forms.en, word.forms.uk, ...word.alternatives]);

  ana.sdk.send('stroke', { strokeId: 's1', color: 0, size: 0, eraser: false, points: [1, 1] });
  bo.sdk.send('chat', { text: 'zorblat' });
  bo.sdk.send('chat', { text: 'it was zorblat, so easy' });
  cy.sdk.send('chat', { text: 'zorblot' });
  await vi.waitFor(() => expect(lines(cy).at(-1)).toBe('close'));
  await new Promise((resolve) => setTimeout(resolve, 50));

  const leaked = forms.filter((form) => JSON.stringify(cy.log).toLowerCase().includes(form.toLowerCase()));

  expect(leaked).toEqual([]);
  expect(JSON.stringify(ana.log)).toContain('zorblat');
  expect(lines(cy)).not.toContain('it was zorblat, so easy');
  expect(lines(bo)).toContain('it was zorblat, so easy');
});

test('those who guessed may scribble, others may not; the drawer\'s undo reaches everyone', async () => {
  const { ana, bo, cy } = await drawingTable();

  cy.sdk.send('stroke', { strokeId: 'c1', color: 0, size: 0, eraser: false, points: [5, 5] });
  await vi.waitFor(() => expect(cy.errors).toEqual(['stroke:CANT_DRAW']));
  bo.sdk.send('chat', { text: 'zorblat' });
  bo.sdk.send('stroke', { strokeId: 'b1', color: 0, size: 0, eraser: false, points: [5, 5] });
  ana.sdk.send('fill', { id: 'f1', x: 50, y: 50, color: 4 });
  ana.sdk.send('undo', {});
  await vi.waitFor(() => expect(cy.ops.map((op) => op.type)).toEqual(['stroke', 'fill', 'undo']));
  expect(cy.ops[0]).toMatchObject({ authorId: bo.id });
  expect(cy.ops[2]).toEqual({ type: 'undo', id: 'f1' });
});

test('a browser that joins mid-turn gets the whole drawing so far', async () => {
  const { room, ana } = await drawingTable();

  ana.sdk.send('stroke', { strokeId: 's1', color: 2, size: 3, eraser: false, points: [10, 10, 30.5, 40] });
  ana.sdk.send('fill', { id: 'f1', x: 50, y: 50, color: 4 });
  await room.waitForMessage('fill');

  const di = await sit(room, 'Di');

  expect(di.drawing?.map((action) => action.id)).toEqual(['s1', 'f1']);
  expect(di.view?.game.turnId).toBe(ana.view?.game.turnId);
});

test('tricks show in everyone\'s view', async () => {
  const { bo, cy } = await drawingTable();

  bo.sdk.send('chat', { text: 'zorblat' });
  bo.sdk.send('trick', { kind: 'flip' });
  await vi.waitFor(() => expect(cy.view?.game.tricks.map((trick) => trick.kind)).toEqual(['flip']));
  expect(cy.view?.game.trickedIds).toEqual([bo.id]);
});

test('reactions go to everyone else', async () => {
  const room = await colyseus.createRoom<TableRoom>(tableRoomName);
  const ana = await sit(room, 'Ana');
  const bo = await sit(room, 'Bo');
  const received = bo.sdk.waitForMessage('reaction');

  ana.sdk.send('react', { emoji: '🎉' });
  expect(await received).toEqual({ memberId: ana.id, emoji: '🎉' });
});

test('the drawer leaving ends the turn; with one person left the table goes back to the lobby', async () => {
  const { ana, bo, cy } = await drawingTable();

  await ana.sdk.leave();
  await vi.waitFor(() => expect(bo.view?.game.reveal?.reason).toBe('drawerLeft'));
  await cy.sdk.leave();
  await vi.waitFor(() => expect(phaseOf(bo)).toBe('lobby'));
});
