# Scribble Table

A drawing-and-guessing party game you play with friends in the browser.

- **Draw and guess:** each turn, one person draws a secret word on a shared board. Everyone else types guesses in the chat, and faster guesses score more.
- **Two languages:** the game runs in English and Ukrainian, and a guess counts in either language.
- **Hints as the clock runs:** letters of the word appear while time passes, and a near miss gets a private "Close!".
- **No accounts, no leftovers:** share the table link to play. A table disappears about 10 minutes after the last person leaves.

It's a sibling of [Felt Table](https://github.com/nocs32/felt-table-jigsaw), the multiplayer jigsaw, and shares its stack, rules and look.

> **Status:** live tables run on the server, hosted at https://scribble.timnox.dev while `pnpm play` runs: share the link and play. A demo table in the browser, with sample players who draw, guess and chat, is still there for working on the UI (`pnpm demo`).

## Stack

| Part | Tech |
|---|---|
| Web (`modules/web`) | React 19, TypeScript, Vite, Panda CSS, MobX, Ark UI, i18next |
| API (`modules/core-api`) | Node.js, Express 5 and Colyseus 0.18 (run with `tsx`): the live tables |
| Shared | `modules/protocol` (the contract between the two) and `modules/engine` (pure game logic) |
| Tooling | pnpm workspaces, ESLint 10 + typescript-eslint, TypeScript 6.0 |

The server runs the game. It picks the words, keeps the clock, checks guesses and keeps the score, so the secret word never reaches the guessers' browsers before the reveal. Tables live in the server's memory only, so there is no database.

## Getting started

**Requirements:** Node.js 24 (see `.nvmrc`) and pnpm 11+.

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts both apps:

| App | URL |
|---|---|
| Web | http://localhost:5174 |
| API | http://localhost:2568 — the web dev server forwards `/api/*`, and `/live` for tables, to it |

Open the web URL to get a table, and open its link in another tab (or send it to a friend) to sit a second person down. A reload keeps your seat for 20 seconds.

`pnpm demo` runs the web app alone against a **demo table** instead: sample players join, chat, draw and guess, and the **Demo** buttons in the top bar skip ahead, make you the next drawer, or add and remove players.

The ports sit one above Felt Table's (5173 and 2567), so both games can run at the same time.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Runs the web app and the API with hot reload |
| `pnpm demo` | Runs the web app alone against the demo table (sample players, no server), for working on the UI |
| `pnpm lint` | Lints every module; `pnpm lint --fix` fixes spacing automatically |
| `pnpm typecheck` | Type-checks every module |
| `pnpm test` | Runs the engine and core-api tests; one module: `pnpm --filter @scribble-table/core-api test` |
| `pnpm build` | Builds the web app for production |
| `pnpm play` | Builds, then serves the game at https://scribble.timnox.dev from this computer (see below) |

**CI:** GitHub Actions (`.github/workflows/ci.yml`) runs lint, typecheck, test and build on every pull request and every push to `main`.

## Play with friends

There's no cloud server: `pnpm play` runs Scribble Table on your own computer, and a free [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) puts it on **https://scribble.timnox.dev**. No router ports are opened, and your home address stays hidden behind Cloudflare.

```bash
pnpm play
```

- It builds the web app, then starts core-api, the production web server (`vite preview` on `127.0.0.1:4174`) and the tunnel. Ctrl+C stops all three.
- Stop `pnpm dev` first: both use core-api's port 2568.
- It runs alongside Felt Table's `pnpm play`: each game has its own ports and its own tunnel.
- Keep the computer awake while you play. Closing the terminal or restarting wipes the tables, like any server restart.
- To ship a change, stop `pnpm play` and start it again. It rebuilds from what's checked out.

**One-time setup** on the computer that hosts: install `cloudflared` (`winget install Cloudflare.cloudflared`), open a new terminal so it's on PATH, then:

```bash
cloudflared tunnel login
cloudflared tunnel create scribble-table
cloudflared tunnel route dns scribble-table scribble.timnox.dev
```

`cloudflared tunnel login` is needed only once per computer; Felt Table's setup already did it here. The tunnel's credentials live in `~/.cloudflared/`, outside the repo. Keep them private.

## Project layout

```
modules/
├─ web/          React frontend
├─ core-api/     Express + Colyseus backend
├─ protocol/     shared contract: messages, events, error codes
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

**Word lists** live in `modules/core-api/src/words/word-list.b64`, base64-encoded so they can't be read at a glance: whoever reads them can't enjoy guessing them. Only the drawer's browser ever gets a word.

**TypeScript** stays on **6.0** until typescript-eslint supports TypeScript 7.

## Environment variables

| Variable | Used by | Default |
|---|---|---|
| `CORE_API_PORT` | core-api | `2568` |
