# Scribble Table

A drawing-and-guessing party game you play with friends in the browser.

- **Draw and guess:** each turn, one person draws a secret word on a shared board. Everyone else types guesses in the chat, and faster guesses score more.
- **Two languages:** the game runs in English and Ukrainian, and a guess counts in either language.
- **Hints as the clock runs:** letters of the word appear while time passes, and a near miss gets a private "Close!".
- **No accounts, no leftovers:** share the table link to play. A table disappears about 10 minutes after the last person leaves.

It's a sibling of [Felt Table](https://github.com/nocs32/felt-table-jigsaw), the multiplayer jigsaw, and shares its stack, rules and look.

> **Status:** early setup. A skeleton web app and API are running; the game itself is not built yet.

## Stack

| Part | Tech |
|---|---|
| Web (`modules/web`) | React 19, TypeScript, Vite, Panda CSS, MobX, i18next. Coming next: Ark UI and the drawing board. |
| API (`modules/core-api`) | Node.js, Express 5 and Colyseus 0.18 (run with `tsx`). Coming next: the live tables. |
| Shared | `modules/protocol` (the contract between the two) and `modules/engine` (pure game logic) |
| Tooling | pnpm workspaces, ESLint 10 + typescript-eslint, TypeScript 6.0 |

The server runs the game. It picks the words, keeps the clock, checks guesses and keeps the score, so the secret word never reaches the guessers' browsers before the reveal. Tables live in the server's memory only, so there is no database.

## Getting started

**Requirements:** Node.js 24+ and pnpm 11+.

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts both apps:

| App | URL |
|---|---|
| Web | http://localhost:5174 |
| API | http://localhost:2568 — the web dev server forwards `/api/*` to it |

Open the web URL. If everything is wired up, the page says **"Server online"**.

The ports sit one above Felt Table's (5173 and 2567), so both games can run at the same time.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Runs the web app and the API with hot reload |
| `pnpm lint` | Lints every module; `pnpm lint --fix` fixes spacing automatically |
| `pnpm typecheck` | Type-checks every module |
| `pnpm --filter @scribble-table/core-api test` | Runs the API's tests (also: `@scribble-table/engine`) |

## Project layout

```
modules/
├─ web/          React frontend
├─ core-api/     Express + Colyseus backend
├─ protocol/     shared contract: messages, error codes, state
└─ engine/       pure game logic, shared by both apps
eslint.config.mjs   house lint rules
eslint-rules/       custom lint rules used by the config
```

## Conventions

**Code style** (enforced by `pnpm lint`):
- **Size:** at most 40 lines per function (components included) and 300 lines per file.
- **Nested functions:** inside a function, only arrow functions.
- **Names:** camelCase. PascalCase only for React components and for types and classes.
- **Return types:** every function that returns a value declares its return type.
- **Blank lines:** one before and after every code block.

**Web**
- **Component names follow their parent:** `Room` → `RoomBoard` → `RoomBoardTools`.
- **One component per `.tsx` file.** Components only render.
  - Logic lives in custom hooks and small MobX stores, which are modelled as state machines.
  - Styles live in `styled-components.ts` files written with Panda CSS.
- **All UI text is translated** into English and Ukrainian.

**API**
- **Thin handlers:** they validate, call one service, and respond.
- **Logic** lives in small state-machine classes.
- **The server decides:** browsers send intents (a stroke, a guess) and never results.

**TypeScript** stays on **6.0** until typescript-eslint supports TypeScript 7.

## Environment variables

| Variable | Used by | Default |
|---|---|---|
| `CORE_API_PORT` | core-api | `2568` |
