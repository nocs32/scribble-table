import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { tableRoomName } from '@scribble-table/protocol';
import { config } from './config.js';
import { describeError, errorMiddleware, notFoundMiddleware } from './errors/index.js';
import { healthRouter } from './health/index.js';
import { logger } from './logger.js';
import { TableRoom, type TableRoomOptions } from './table-room/index.js';
import { WordLists } from './words/index.js';

// The secret word lists, read once; a broken file stops core-api here.
const words = WordLists.load();

// One HTTP server for both: Colyseus answers its matchmaking routes and the WebSocket upgrades
// for live tables; every other request falls through to the Express app below.
const server = new Server({
  transport: new WebSocketTransport(),
  greet: false,
  express: (app) => {
    app.use('/api/health', healthRouter);
    app.use('/api', notFoundMiddleware);
    app.use(errorMiddleware);
  },
});

const tableRoomOptions: TableRoomOptions = { words };

server.define(tableRoomName, TableRoom, tableRoomOptions);

server.listen(config.port).then(
  () => {
    logger.info('core-api listening', { url: `http://localhost:${config.port}`, words: words.entries.length });
  },
  (error: unknown) => {
    logger.error('core-api failed to start', { port: config.port, error: describeError(error) });
    process.exitCode = 1;
  },
);
