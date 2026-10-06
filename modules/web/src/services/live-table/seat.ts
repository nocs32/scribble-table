// The seat for each table this tab sits at. sessionStorage is per tab and survives a reload,
// which is exactly "reloading keeps my seat" (the server holds it for 20 seconds).
const seatKey = (roomId: string): string => `scribble-table:seat:${roomId}`;

export const readSeat = (roomId: string): string | null => {
  try {
    return window.sessionStorage.getItem(seatKey(roomId));
  } catch {
    return null;
  }
};

export const writeSeat = (roomId: string, token: string | null): void => {
  try {
    if (token === null) window.sessionStorage.removeItem(seatKey(roomId));
    else window.sessionStorage.setItem(seatKey(roomId), token);
  } catch {
    // Storage can be blocked; a reload then just joins as someone new.
  }
};
