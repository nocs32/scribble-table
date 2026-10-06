// Points (spec §5.5). Starting numbers, to tune after the first game night.

const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, value));

// 100 for a guess right away, falling evenly to 50 at the last second, rounded to 5.
export const guesserPoints = (timeLeftMs: number, drawMs: number): number => {
  const fraction = drawMs > 0 ? clamp(timeLeftMs / drawMs, 0, 1) : 0;

  return Math.round((50 + 50 * fraction) / 5) * 5;
};

// The drawer scores for everyone who got it.
export const drawerPoints = (correctGuessers: number): number => 25 * Math.max(0, correctGuessers);

export interface Placed<T> {
  item: T;
  // 1-based; equal scores share a place (1, 1, 3).
  place: number;
}

// Highest score first; the order among equal scores is kept.
export const rankByScore = <T>(items: readonly T[], scoreOf: (item: T) => number): Array<Placed<T>> => {
  const sorted = [...items].sort((a, b) => scoreOf(b) - scoreOf(a));

  return sorted.map((item) => ({ item, place: 1 + sorted.filter((other) => scoreOf(other) > scoreOf(item)).length }));
};
