// Error codes of the live table. A refused join arrives as the join error's message; a refused
// intent arrives as an `error` event ({ code }) and the sender stays at the table.
export const tableErrorCodes = [
  // The web app and the server speak different protocol versions: reload.
  'PROTOCOL_MISMATCH',
  'INVALID_JOIN',
  'INVALID_MESSAGE',
  'RATE_LIMITED',
  'NOT_A_MEMBER',
  'ALREADY_A_MEMBER',
  'ROOM_CLOSED',
  // A rename that's empty once cleaned up.
  'EMPTY_NAME',
  // The game isn't in the phase this needs (settings outside the lobby, a guess outside drawing…).
  'WRONG_PHASE',
  'NOT_ENOUGH_PLAYERS',
  // Only the drawer may pick the word, fill, undo and clear.
  'NOT_DRAWER',
  'NO_SUCH_CHOICE',
  // Giving up after guessing it (or as the drawer).
  'ALREADY_KNOWS_WORD',
  // Sabotage (spec D18): it's off, you haven't guessed it, or your trick is used up.
  'SABOTAGE_OFF',
  'CANT_SABOTAGE',
  'NO_TRICKS_LEFT',
  // Drawing when it isn't your turn and you may not scribble.
  'CANT_DRAW',
  // The turn's drawing hit its size cap.
  'BOARD_FULL',
  // A stroke or fill id someone else's action already has.
  'TAKEN_ID',
  'NOTHING_TO_UNDO',
] as const;

export type TableErrorCode = (typeof tableErrorCodes)[number];

export const isTableErrorCode = (value: unknown): value is TableErrorCode =>
  typeof value === 'string' && (tableErrorCodes as readonly string[]).includes(value);
