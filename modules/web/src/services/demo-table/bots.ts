import type { BoardOp } from '@scribble-table/protocol';
import { demoSketch } from './sketches';
import type { DemoTurn } from './turn';
import type { DemoDeps, DemoMember, DemoSketchStep, DemoWord } from './types';

// What sample players can do at the table: the same things people do.
export interface DemoBotsHost {
  chat: (memberId: string, text: string) => void;
  choose: (memberId: string, index: number) => void;
  draw: (op: BoardOp) => void;
  react: (memberId: string, emoji: string) => void;
}

// What sample players type: their own chat, not UI text, so it isn't translated.
const greetings = { en: ['hey all 👋', 'hi! ready to draw'], uk: ['привіт усім 👋', 'всім привіт!'] };
const praise = { en: ['nice drawing!', 'ha, got it', 'easy one'], uk: ['гарно малюєш!', 'ха, є', 'легке'] };
const cheers = ['🎉', '👏', '🔥', '😂'];

const pointsPerBatch = 5;
const batchMs = 50;
const strokePauseMs = 300;

// Sample players: they greet, pick words, draw their sketch stroke by stroke, and guess
// (some wrong, some one letter off, most right) at random moments.
export class DemoBots {
  #stops: Array<() => void> = [];
  readonly #deps: DemoDeps;
  readonly #host: DemoBotsHost;

  constructor(deps: DemoDeps, host: DemoBotsHost) {
    this.#deps = deps;
    this.#host = host;
  }

  cancel(): void {
    this.#stops.forEach((stop) => stop());
    this.#stops = [];
  }

  greet(bot: DemoMember): void {
    this.#later(1200 + this.#deps.random() * 2500, () => this.#host.chat(bot.id, this.#pick(greetings[bot.language])));
  }

  choose(drawer: DemoMember, count: number): void {
    this.#later(1500 + this.#deps.random() * 2000, () => this.#host.choose(drawer.id, Math.floor(this.#deps.random() * count)));
  }

  cheer(bot: DemoMember): void {
    this.#later(300 + this.#deps.random() * 900, () => this.#host.react(bot.id, this.#pick(cheers)));
  }

  guess(bot: DemoMember, turn: DemoTurn, others: readonly DemoWord[]): void {
    const answer = turn.word.forms[bot.language];
    const wrongCount = Math.floor(this.#deps.random() * 3);

    for (let index = 0; index < wrongCount && others.length > 0; index++) {
      this.#at(turn, 0.08 + this.#deps.random() * 0.45, () => this.#host.chat(bot.id, this.#pick(others).forms[bot.language]));
    }

    if (this.#deps.random() < 0.35 && [...answer].length >= 5) {
      this.#at(turn, 0.3 + this.#deps.random() * 0.3, () => this.#host.chat(bot.id, this.#typo(answer)));
    }

    if (this.#deps.random() < 0.85) {
      const at = 0.2 + this.#deps.random() * 0.7;

      this.#at(turn, at, () => this.#host.chat(bot.id, answer));

      if (this.#deps.random() < 0.4) this.#at(turn, at + 0.04, () => this.#host.chat(bot.id, this.#pick(praise[bot.language])));
    }
  }

  draw(word: DemoWord): void {
    demoSketch(word.sketch, this.#deps.random).reduce((startMs, step) => this.#planStep(step, startMs), 1200);
  }

  // Sends one sketch step from `startMs` on and returns when the next one can start.
  #planStep(step: DemoSketchStep, startMs: number): number {
    if (step.kind === 'fill') {
      const fill = { id: this.#deps.createId(), x: step.x, y: step.y, color: step.color };

      this.#later(startMs + 250, () => this.#host.draw({ type: 'fill', fill }));

      return startMs + 600;
    }

    const strokeId = this.#deps.createId();
    let atMs = startMs;

    for (let first = 0; first < step.points.length; first += pointsPerBatch * 2) {
      const points = step.points.slice(first, first + pointsPerBatch * 2);

      this.#later(atMs, () => this.#host.draw({ type: 'stroke', batch: { strokeId, color: step.color, size: step.size, eraser: false, points } }));
      atMs += batchMs;
    }

    return atMs + strokePauseMs;
  }

  // One letter dropped from the middle: close, but not right.
  #typo(word: string): string {
    const letters = [...word];
    const middle = Math.floor(letters.length / 2);

    return letters.filter((_, index) => index !== middle).join('');
  }

  #pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.#deps.random() * items.length)] as T;
  }

  #at(turn: DemoTurn, fraction: number, action: () => void): void {
    this.#later(turn.startedAt + fraction * turn.drawMs - this.#deps.now(), action);
  }

  #later(delayMs: number, action: () => void): void {
    this.#stops.push(this.#deps.schedule(action, Math.max(0, delayMs)));
  }
}
