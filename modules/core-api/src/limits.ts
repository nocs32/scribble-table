// Every rate limit, size cap and timeout of core-api, in one place (spec §9.5).
export const limits = {
  table: {
    // People at one table (spec D12). Seats held for reconnecting people count too.
    maxClients: 12,
    // An empty table is kept this long, then thrown away (spec D12).
    emptyGraceMs: 10 * 60 * 1000,
    // A dropped connection keeps its seat this long.
    reconnectSeconds: 20,
    // Hard cap on messages from one connection; Colyseus disconnects anyone above it. Drawing
    // sends a stroke batch every 50 ms.
    maxMessagesPerSecond: 100,
    // One turn's drawing: actions (strokes and fills) and points in all strokes together.
    drawing: { maxActions: 3000, maxPoints: 100_000 },
    // Per person and intent: at most `count` in any `windowMs`. Extra messages are refused.
    rates: {
      sync: { count: 5, windowMs: 10_000 },
      start: { count: 5, windowMs: 5000 },
      updateSettings: { count: 20, windowMs: 5000 },
      chooseWord: { count: 5, windowMs: 5000 },
      // Looser than the browser's pace (protocol `chatPace`, 5 in 3 s), so jitter never trips it.
      chat: { count: 8, windowMs: 3000 },
      giveUp: { count: 5, windowMs: 5000 },
      trick: { count: 5, windowMs: 5000 },
      stroke: { count: 30, windowMs: 1000 },
      fill: { count: 10, windowMs: 1000 },
      // Generous: undo happens in the drawer's browser at once, so a refused one would leave
      // everyone else's board behind.
      undo: { count: 30, windowMs: 1000 },
      clear: { count: 10, windowMs: 5000 },
      react: { count: 8, windowMs: 1000 },
      rename: { count: 10, windowMs: 10_000 },
      playAgain: { count: 5, windowMs: 5000 },
    },
  },
} as const;
