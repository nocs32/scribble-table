---
paths:
  - "modules/core-api/**"
---

# Core API rules (`modules/core-api`)

Node + Express 5 for HTTP, and Colyseus 0.18 for the live multiplayer rooms. These rules come on top of the lint rules in `eslint.config.mjs` and follow the same ideas as the web rules: thin edges, small named units, and logic in small state machines.

**Colyseus specifics:**
- One process serves both: `new Server({ transport: new WebSocketTransport(), express: (app) => … })` in `src/index.ts`. Colyseus answers `/matchmake/*` and the WebSocket upgrades; everything else falls through to Express. No Redis (one process, spec D4).
- Room classes extend Colyseus `Room<{ client }>`. Class fields like `maxClients` and `autoDispose` are fine (Colyseus re-installs its accessors in `__init`).
- **No Schema state** (spec D19). The room sends each person their own view as messages, through `TableRoomOutbox`: `view` (shared, sent when it changed), `feed` and `secret` (per person), plus `board`, `drawing`, `reaction` and `error` events. Messages arrive in order, which state patches don't promise. A browser gets nothing personal until it sends `sync`.
- Message handlers follow rule 3 through the room's `#on(type, handle)`: valibot schema from the protocol, then the rate limit, then one call. Don't pass a schema to Colyseus's own `onMessage`/`validate`: a failed check there disconnects the sender. Refusals go back as an `error` event (`{ code }`).
- Join options are checked in `onJoin`; a refused join throws `ServerError` with the typed code as its message.
- Tests: unit tests per part (`*.test.ts` next to it) and a room test through a real server with `@colyseus/testing` (`table-room/index.test.ts`). Run `pnpm --filter @scribble-table/core-api test`.

## 1. Names follow the owner
A unit that belongs to another starts with its owner's name:
- `TableRoom` → `TableRoomTurns` → `TableRoomTurnsTimer`
- `TableRoom` → `TableRoomDrawing` → `TableRoomDrawingLimits`
- `WordLists` → `WordListsPicker`

Shared building blocks are named for what they are: `WordLists`, `logger`, `limits`.

## 2. One unit per file
- One class, one router or one handler group per file.
- Files and folders are kebab-case, named after what they hold: `table-room-turns.ts` (`TableRoomTurns`), `health-router.ts` (`healthRouter`). The lint rule `local/kebab-case-filenames` enforces it.
- A unit with sub-units becomes a folder: `index.ts` holds the main unit, and each sub-unit gets a short-named file next to it (`table-room/index.ts`, `table-room/turns.ts`).

## 3. Edges are thin
This is the backend version of "components only render". Express route handlers and live message handlers do exactly three things:
1. Validate the input with the shared schema.
2. Call **one** method on a service or room class.
3. Send the result, or a typed error.

No game rules, storage or calculations inside handlers.

## 4. Logic lives in small state-machine classes
- **Composed rooms.** A room is built from small classes, each owning one concern: turns, drawing, guesses, feed/chat, lifecycle (the 10-minute empty timer), rate limits. `TableRoom` only wires them together.
- **Explicit states.** Each class has a fixed set of states:
  - room lifecycle: `'active' | 'emptyGrace' | 'closed'`;
  - a turn: `'choosing' | 'drawing' | 'reveal'`.
- **Transitions** are methods named after events: `join`, `leave`, `chooseWord`, `guess`, `expire`. An invalid transition is rejected with a typed error code.
- **Pure game logic** (guess matching, scoring, hints, stroke encoding) lives in the shared engine module and has no I/O.
- **Tests.** Each state-machine class has unit tests for its transitions, including the rejected ones.

## 5. The server decides; clients only ask
- **Intents, not results.** Clients send intents such as `chooseWord` or `guess`, and the server works out the result. Never accept a finished result from a client, like "I guessed it" or "I scored 100".
- **Validate everything.** Check every message and request body against its schema:
  - reject unknown fields;
  - clamp numbers to sane ranges;
  - check the sender is allowed (only the drawer can send strokes).
- **Limits in one place.** Rate limits and size caps are constants in a single `limits.ts`.

## 6. Every piece of memory has an owner
- **No database.** Tables and the word lists live in memory (spec D4).
- **Cleanup.** Every `Map`, timer and interval belongs to a class that clears it in `dispose()`.
- **No module-level mutable state**, except the composition root (`src/index.ts`), which creates the long-lived instances.

## 7. Config, errors and logs
- **Config:** environment variables are read and validated once in `src/config.ts`. Nothing else reads `process.env`.
- **Errors:** use typed error codes shared with the web app, like `'TABLE_NOT_FOUND'` or `'NOT_DRAWER'`. Never use raw strings.
- **Logs:** log through `src/logger.ts` with context such as `roomId` and `sessionId`. No `console.log` anywhere else.

## 8. One shared contract
- Intent schemas, server events, error codes and name rules live in `@scribble-table/protocol`. Both apps import them. Never redefine them in core-api.
- Changing an intent's or an event's shape bumps `tableProtocolVersion`.

## Folder example
```
src/
├─ index.ts                 composition root: config, logger, Express, Colyseus, listen
├─ config.ts
├─ logger.ts
├─ limits.ts
├─ errors/                  ApiErrorException, errorMiddleware, notFoundMiddleware
├─ health/index.ts          healthRouter (/api/health)
├─ words/                   WordLists: the secret word lists (never sent whole to browsers)
└─ table-room/
   ├─ index.ts              TableRoom: wires the parts to Colyseus
   ├─ members.ts            TableRoomMembers
   ├─ feed.ts               TableRoomFeed (who may see each line)
   ├─ game.ts               TableRoomGame (lobby → choosing → drawing → reveal → podium, settings)
   ├─ turn.ts               TableRoomTurn (one turn: the word, hints, guesses, give-ups)
   ├─ turns.ts              TableRoomTurns (drawing order, joins and leaves mid-game)
   ├─ tricks.ts             TableRoomTricks (sabotage: one trick a turn)
   ├─ drawing.ts            TableRoomDrawing (the turn's strokes and fills, undo, clear, limits)
   ├─ outbox.ts             TableRoomOutbox (what each person is sent)
   ├─ rate-limits.ts        TableRoomRateLimits
   ├─ lifecycle.ts          TableRoomLifecycle
   └─ *.test.ts             (test-table.ts: made-up words and a hand-cranked clock)
```
