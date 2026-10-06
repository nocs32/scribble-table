import type { BoardAction } from '@scribble-table/protocol';
import { expect, test } from 'vitest';
import { decodeDrawing, encodeDrawing } from './drawing-bytes.js';

const drawing: BoardAction[] = [
  { kind: 'stroke', id: 'stroke-1', authorId: 'drawer', color: 0, size: 2, eraser: false, points: [0, 0, 12.5, 40, 800, 600] },
  { kind: 'fill', id: 'fill-1', authorId: 'drawer', x: 399.5, y: 300, color: 7 },
  { kind: 'stroke', id: 'stroke-2', authorId: 'saboteur', color: 15, size: 0, eraser: true, points: [100, 100] },
];

test('a drawing round-trips exactly, in order, with who made each action', () => {
  expect(decodeDrawing(encodeDrawing(drawing))).toEqual(drawing);
});

test('an empty board round-trips', () => {
  expect(decodeDrawing(encodeDrawing([]))).toEqual([]);
});

test('points take two bytes each', () => {
  const long: BoardAction[] = [{ kind: 'stroke', id: 's', authorId: 'a', color: 0, size: 0, eraser: false, points: Array.from({ length: 1000 }, (_, index) => index % 600) }];

  expect(encodeDrawing(long).length).toBeLessThan(2100);
});

test('unknown bytes are refused', () => {
  expect(() => decodeDrawing(new Uint8Array([9, 0, 0, 0, 0, 0]))).toThrow('Unknown drawing format');
});
