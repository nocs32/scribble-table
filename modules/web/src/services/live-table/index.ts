import { Client, ErrorCode, type Room } from '@colyseus/sdk';
import { decodeDrawing } from '@scribble-table/engine';
import { tableProtocolVersion, tableRoomName, type TableEvents, type TableJoinOptions } from '@scribble-table/protocol';
import type { TableClientService, TableLink, TableLinkListeners, TableOpenFailure } from '../types';
import { readSeat, writeSeat } from './seat';
import { LiveTableView } from './view';

// Vite (and later the production host) forwards /live to core-api's Colyseus server.
const livePath = '/live';

type LiveRoom = Room;

const failureOf = (error: unknown): TableOpenFailure => {
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
  const message = error instanceof Error ? error.message : '';

  if (message === 'PROTOCOL_MISMATCH') return 'outdated';

  if (code === ErrorCode.MATCHMAKE_INVALID_ROOM_ID) return message.includes('locked') ? 'full' : 'gone';

  return 'unreachable';
};

// Back into the seat this tab had, if the server still holds it; otherwise a fresh join.
const enter = async (client: Client, roomId: string | null, options: TableJoinOptions): Promise<LiveRoom> => {
  if (roomId === null) return client.create(tableRoomName, options);

  const seat = readSeat(roomId);

  if (seat !== null) {
    try {
      return await client.reconnect(seat);
    } catch {
      writeSeat(roomId, null);
    }
  }

  return client.joinById(roomId, options);
};

// Every server event goes to the stores in the shape they know. Once listening, the browser
// asks for everything with `sync`, again after each reconnect.
const listen = (room: LiveRoom, listeners: TableLinkListeners, now: () => number): void => {
  const view = new LiveTableView(now, listeners.snapshot);
  const on = <K extends keyof TableEvents>(type: K, handle: (message: TableEvents[K]) => void): void => void room.onMessage(type, handle);

  on('view', (message) => view.view(message));
  on('feed', (message) => view.feed(message));
  on('secret', listeners.secret);
  on('board', listeners.board);
  on('drawing', ({ turnId, bytes }) => listeners.drawing(turnId, decodeDrawing(bytes)));
  on('reaction', listeners.reaction);
  on('error', listeners.refused);
  room.onDrop(() => listeners.connection('reconnecting'));

  // The SDK calls this before it stores the new seat token, so the token is saved a moment later
  // (otherwise a reload after a reconnect would lose the seat).
  room.onReconnect(() => {
    window.setTimeout(() => writeSeat(room.roomId, room.reconnectionToken), 0);
    room.send('sync', {});
    listeners.connection('live');
  });

  // The seat is lost, or the SDK gave up reconnecting (it doesn't try in the first seconds after
  // joining). The saved seat stays: sitting down again tries it first, while the table still holds it.
  room.onLeave(() => listeners.closed());

  room.send('sync', {});
};

const toLink = (room: LiveRoom): TableLink => ({
  roomId: room.roomId,
  meId: room.sessionId,
  demo: null,
  send: (type, message) => room.send(type, message),
  close: () => void room.leave(),
});

// Live tables on core-api (spec M2).
export const createLiveTable = (origin: string, now: () => number): TableClientService => {
  const client = new Client(`${origin}${livePath}`);

  return {
    open: async (roomId, name, listeners) => {
      try {
        const room = await enter(client, roomId, { protocolVersion: tableProtocolVersion, name });

        writeSeat(room.roomId, room.reconnectionToken);
        listen(room, listeners, now);

        return { ok: true, link: toLink(room) };
      } catch (error) {
        return { ok: false, failure: failureOf(error) };
      }
    },
  };
};
