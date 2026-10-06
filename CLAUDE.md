# Scribble Table

A multiplayer drawing-and-guessing game:
- share a table by URL; each turn one person draws a secret word and everyone else guesses it in the chat;
- the table is thrown away about 10 minutes after everyone leaves.

It's Felt Table's sibling (`../felt-table-jigsaw`): same stack, same house rules, same look. The full spec is in `.scratch/SPEC.md`. Read §0 "Decisions so far" before planning any feature.

## How we work
Each phase gets its own branch and PR, as in Felt Table:
1. **Web UI**, on local MobX stores with sample data. We review it together, then PR and merge.
2. **Backend, and connecting the UI to it.** We review and check it together, then PR and merge.
3. **CI.** PR and merge.

## The word lists are secret
The user plays this game, so knowing the words would spoil it.
- **Never show a word from the lists:** not in chat, commit messages, PR descriptions, docs, code comments or test names. Talk about the lists only in aggregate: counts, languages, difficulty mix.
- **Tests use made-up words** that aren't in the lists, or pick words in code without printing them.
- **Browsers never get the full lists.** Only the drawer's browser gets the turn's word.

## Layout
- `modules/web`: frontend. Vite + React 19 + TypeScript, Panda CSS, MobX, Ark UI, i18next (English and Ukrainian).
- `modules/core-api`: backend. Node + Express 5 + Colyseus 0.18 (live tables), one process on :2568.
- `modules/protocol`: the shared contract. Message schemas, error codes, and later the Colyseus state classes.
- `modules/engine`: pure game logic (guess matching, scoring, hints, stroke encoding), shared by both apps.
- `eslint.config.mjs` + `eslint-rules/`: the house lint rules for every module.
- `.scratch/`: spec and notes, ignored by git.

## Rules: read them before writing code
- **Before** creating or editing anything in `modules/web/**`, read `.claude/rules/web.md` and follow it.
- **Before** creating or editing anything in `modules/core-api/**`, read `.claude/rules/core-api.md` and follow it.
- These rules load automatically only once a matching file is opened. Read them first anyway, especially when creating new files.
- **Before calling a change done,** run `pnpm lint` and `pnpm typecheck` and fix what they report. Don't disable rules or add `eslint-disable` comments without asking.

**House lint rules** (enforced everywhere):
- **Size:** at most 40 lines per function (components included) and 300 lines per file. Blank lines and comments don't count.
- **Nested functions:** inside a function, only arrow functions. No nested `function` declarations or expressions, and no object or class methods.
- **Names:** camelCase for everything. PascalCase only for React components (which must render JSX) and for types and classes.
- **Return types:** required on every function that returns a value. Lambdas passed as arguments or JSX props are exempt.
- **Blank lines:** exactly one before and after every code block (functions, if, loops, switch, try, multi-line statements). `pnpm lint --fix` adds them.

## Commands
```bash
pnpm install
pnpm dev           # web on http://localhost:5174 + core-api on :2568 (Vite forwards /api, and /live for tables)
pnpm demo          # web only, against the demo table (no server): for UI work, now and after M2
pnpm lint          # add --fix to auto-fix spacing
pnpm typecheck
pnpm --filter @scribble-table/core-api test   # also: @scribble-table/engine
```

## Gotchas
- **Ports are 5174, 2568 and 4174** (web, core-api, preview), one above Felt Table's (5173, 2567, 4173), so both projects can run at once, each behind its own Cloudflare Tunnel when hosted. All are `strictPort`: a taken port fails loudly instead of moving.
- **TypeScript is pinned to 6.0.** typescript-eslint doesn't support TypeScript 7 yet. Don't upgrade it.
- **pnpm workspaces:** the packages are listed in `pnpm-workspace.yaml`. Add a dependency with `pnpm --filter @scribble-table/<module> add <pkg>`.
- **pnpm's release-age guard:** pnpm refuses versions published in the last day. Pick the previous version instead of adding exceptions.
- **The demo table:** the web app plays against a referee in the browser, `services/demo-table`, with sample players who chat, draw, guess and sabotage. A reload starts a new table. `pnpm demo` runs it with no server; it must keep working after M2 (live tables), for UI-only work. Its 12 sample words show in the UI, so the real word lists must never contain them.
- **Dev handle:** in development the root store is `window.scribbleTable`, for checking state from the console or a test script, e.g. `scribbleTable.room.game.state` or `scribbleTable.room.demo.skip()`.
