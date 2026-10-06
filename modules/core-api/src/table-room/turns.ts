// The drawing order (spec §4.4–§4.5): people draw in the order they joined, once a round.
// Someone who joins mid-game draws at the end of the round; someone who left is skipped.
export class TableRoomTurns {
  round = 0;
  #order: string[] = [];
  #index = -1;

  // Round 1, with everyone at the table, in the order they joined.
  start(memberIds: readonly string[]): void {
    this.round = 1;
    this.#order = [...memberIds];
    this.#index = -1;
  }

  join(memberId: string): void {
    if (this.round > 0 && !this.#order.includes(memberId)) this.#order.push(memberId);
  }

  // The next drawer among `memberIds` (everyone at the table now), or null once `rounds` are over.
  next(memberIds: readonly string[], rounds: number): string | null {
    if (memberIds.length === 0) return null;

    for (;;) {
      this.#index += 1;

      if (this.#index >= this.#order.length) {
        this.round += 1;
        this.#index = 0;
        this.#order = [...memberIds];
      }

      if (this.round > rounds) return null;

      const drawerId = this.#order[this.#index];

      if (drawerId !== undefined && memberIds.includes(drawerId)) return drawerId;
    }
  }

  stop(): void {
    this.round = 0;
    this.#order = [];
    this.#index = -1;
  }
}
