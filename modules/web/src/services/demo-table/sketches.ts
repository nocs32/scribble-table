import { inkColors, type InkColor } from '@scribble-table/protocol';
import type { DemoSketchName, DemoSketchStep } from './types';

// The sample players' drawings, built from simple shapes in board units (800 × 600).

const ink = (name: InkColor): number => inkColors.indexOf(name);

// Half a board unit, like real strokes on the wire.
const snap = (value: number): number => Math.round(value * 2) / 2;

// Splits long straight segments so a sample player draws them at hand speed.
const densify = (xy: readonly number[], maxStep = 12): number[] => {
  const out: number[] = [xy[0] ?? 0, xy[1] ?? 0];

  for (let index = 2; index + 1 < xy.length; index += 2) {
    const [x0, y0, x1, y1] = [xy[index - 2] ?? 0, xy[index - 1] ?? 0, xy[index] ?? 0, xy[index + 1] ?? 0];
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / maxStep));

    for (let step = 1; step <= steps; step++) out.push(x0 + ((x1 - x0) * step) / steps, y0 + ((y1 - y0) * step) / steps);
  }

  return out.map(snap);
};

const ellipse = (cx: number, cy: number, rx: number, ry: number, from = 0, to = Math.PI * 2, steps = 44): number[] =>
  Array.from({ length: steps + 1 }, (_, k) => {
    const angle = from + ((to - from) * k) / steps;

    return [snap(cx + rx * Math.cos(angle)), snap(cy + ry * Math.sin(angle))];
  }).flat();

// A wavy line from (x0, y0) to (x1, y1), swinging `swing` units to each side.
const wave = (x0: number, y0: number, x1: number, y1: number, swing: number, waves: number): number[] => {
  const length = Math.hypot(x1 - x0, y1 - y0) || 1;
  const [nx, ny] = [-(y1 - y0) / length, (x1 - x0) / length];

  return Array.from({ length: 61 }, (_, k) => {
    const along = k / 60;
    const offset = swing * Math.sin(along * waves * Math.PI * 2);

    return [snap(x0 + (x1 - x0) * along + nx * offset), snap(y0 + (y1 - y0) * along + ny * offset)];
  }).flat();
};

const spiral = (cx: number, cy: number, turns: number, growth: number): number[] =>
  Array.from({ length: turns * 40 + 1 }, (_, k) => {
    const angle = (k / 40) * Math.PI * 2;

    return [snap(cx + (6 + growth * angle) * Math.cos(angle)), snap(cy + (6 + growth * angle) * Math.sin(angle))];
  }).flat();

const line = (color: InkColor, size: number, xy: readonly number[]): DemoSketchStep => ({ kind: 'stroke', color: ink(color), size, points: densify(xy) });

const curve = (color: InkColor, size: number, points: number[]): DemoSketchStep => ({ kind: 'stroke', color: ink(color), size, points });

const dot = (color: InkColor, size: number, x: number, y: number): DemoSketchStep => ({ kind: 'stroke', color: ink(color), size, points: [x, y, x + 0.5, y] });

const fill = (color: InkColor, x: number, y: number): DemoSketchStep => ({ kind: 'fill', x, y, color: ink(color) });

const sketches: Record<DemoSketchName, () => DemoSketchStep[]> = {
  snowman: () => [
    curve('black', 1, ellipse(400, 450, 110, 95)),
    curve('black', 1, ellipse(400, 290, 80, 70)),
    curve('black', 1, ellipse(400, 170, 55, 50)),
    dot('black', 2, 382, 160),
    dot('black', 2, 418, 160),
    line('orange', 2, [400, 180, 445, 188]),
    line('black', 1, [345, 125, 455, 125, 435, 125, 435, 70, 365, 70, 365, 125]),
    fill('black', 400, 100),
    line('brown', 1, [325, 280, 250, 228]),
    line('brown', 1, [475, 280, 550, 228]),
  ],
  rainbow: () => [
    ...(['red', 'orange', 'yellow', 'green', 'blue', 'violet'] as const).map((color, k) => curve(color, 2, ellipse(400, 500, 290 - k * 22, 290 - k * 22, Math.PI, Math.PI * 2))),
    curve('gray', 1, ellipse(150, 495, 70, 30)),
    curve('gray', 1, ellipse(650, 495, 70, 30)),
  ],
  balloon: () => [
    curve('red', 1, ellipse(400, 230, 120, 150)),
    fill('red', 400, 230),
    line('red', 1, [390, 380, 410, 380, 400, 392, 390, 380]),
    curve('charcoal', 0, wave(400, 392, 400, 580, 12, 2)),
  ],
  glasses: () => [
    curve('black', 2, ellipse(290, 300, 95, 80)),
    curve('black', 2, ellipse(510, 300, 95, 80)),
    fill('sky', 290, 300),
    fill('sky', 510, 300),
    curve('black', 2, ellipse(400, 292, 20, 16, Math.PI, Math.PI * 2)),
    line('black', 2, [196, 285, 120, 250]),
    line('black', 2, [604, 285, 680, 250]),
  ],
  lollipop: () => [curve('pink', 2, spiral(400, 220, 3, 6.4)), line('brown', 2, [400, 350, 400, 575])],
  sailboat: () => [
    line('brown', 1, [220, 420, 580, 420, 520, 490, 280, 490, 220, 420]),
    fill('brown', 400, 455),
    line('charcoal', 1, [400, 420, 400, 110]),
    line('red', 1, [412, 125, 412, 400, 600, 400, 412, 125]),
    fill('red', 470, 330),
    curve('blue', 1, wave(80, 525, 720, 525, 10, 6)),
  ],
  cactus: () => [
    line('green', 2, [350, 520, 350, 170, 365, 140, 395, 130, 425, 140, 440, 170, 440, 520]),
    line('green', 2, [350, 360, 290, 360, 280, 350, 280, 260]),
    line('green', 2, [440, 320, 500, 320, 510, 310, 510, 230]),
    line('brown', 1, [200, 522, 600, 522]),
  ],
  candle: () => [
    line('red', 1, [350, 250, 450, 250, 450, 540, 350, 540, 350, 250]),
    fill('pink', 400, 400),
    line('charcoal', 1, [400, 250, 400, 226]),
    curve('orange', 1, ellipse(400, 190, 22, 38)),
    fill('yellow', 400, 195),
  ],
  mushroom: () => [
    curve('red', 1, ellipse(400, 300, 190, 140, Math.PI, Math.PI * 2)),
    line('red', 1, [210, 300, 590, 300]),
    fill('red', 400, 250),
    dot('white', 3, 330, 240),
    dot('white', 3, 455, 215),
    dot('white', 3, 400, 275),
    line('gray', 1, [340, 300, 335, 520, 465, 520, 460, 300]),
  ],
  ladder: () => [
    line('brown', 2, [300, 80, 300, 560]),
    line('brown', 2, [500, 80, 500, 560]),
    ...[140, 220, 300, 380, 460, 540].map((y) => line('brown', 1, [300, y, 500, y])),
  ],
  kite: () => [
    line('violet', 1, [400, 90, 540, 260, 400, 470, 260, 260, 400, 90]),
    fill('violet', 400, 250),
    line('charcoal', 0, [400, 90, 400, 470]),
    line('charcoal', 0, [260, 260, 540, 260]),
    curve('charcoal', 0, wave(400, 470, 340, 590, 14, 2)),
    dot('red', 2, 385, 520),
    dot('red', 2, 360, 560),
  ],
  dice: () => [
    line('black', 2, [250, 150, 550, 150, 550, 450, 250, 450, 250, 150]),
    ...[
      [325, 225],
      [475, 225],
      [400, 300],
      [325, 375],
      [475, 375],
    ].map(([x, y]) => dot('black', 3, x ?? 0, y ?? 0)),
  ],
};

// For a custom word: a few loose loops.
const scribble = (random: () => number): DemoSketchStep[] =>
  Array.from({ length: 4 }, () => curve(inkColors[Math.floor(random() * 4) + 5] ?? 'black', 1, ellipse(200 + random() * 400, 150 + random() * 300, 40 + random() * 80, 30 + random() * 60)));

export const demoSketch = (name: DemoSketchName | null, random: () => number): DemoSketchStep[] => (name ? sketches[name]() : scribble(random));
