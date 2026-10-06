import { decodeDrawing } from '@scribble-table/engine';
import type { StrokeBatch } from '@scribble-table/protocol';
import { expect, test } from 'vitest';
import { TableRoomDrawing, type TableRoomDrawingMove } from './drawing.js';
import { TableRoomError } from './error.js';

// The drawer is "ana"; "bo" guessed and may draw lines; "cy" may do nothing.
const permit = (memberId: string, move: TableRoomDrawingMove): void => {
  if (memberId === 'ana' || (memberId === 'bo' && move === 'stroke')) return;

  throw new TableRoomError(move === 'stroke' ? 'CANT_DRAW' : 'NOT_DRAWER');
};

const createDrawing = (maxActions = 10, maxPoints = 100): TableRoomDrawing => new TableRoomDrawing({ permit, maxActions, maxPoints });

const batch = (strokeId: string, points: number[]): StrokeBatch => ({ strokeId, color: 0, size: 1, eraser: false, points });

test('strokes grow batch by batch and are passed on with their author, in half units', () => {
  const drawing = createDrawing();

  drawing.stroke('ana', batch('s1', [10, 10]));

  const op = drawing.stroke('ana', batch('s1', [20.3, 20.74]));

  expect(op).toEqual({ type: 'stroke', authorId: 'ana', batch: batch('s1', [20.5, 20.5]) });
  expect(drawing.actions).toHaveLength(1);
  expect(drawing.actions[0]?.kind === 'stroke' && drawing.actions[0].points).toEqual([10, 10, 20.5, 20.5]);
});

test('nobody may add to someone else\'s stroke, or reuse an id', () => {
  const drawing = createDrawing();

  drawing.stroke('ana', batch('s1', [10, 10]));
  expect(() => drawing.stroke('bo', batch('s1', [5, 5]))).toThrow('TAKEN_ID');
  expect(() => drawing.fill('ana', { id: 's1', x: 1, y: 1, color: 2 })).toThrow('TAKEN_ID');
});

test('the room\'s rules decide who may do what', () => {
  const drawing = createDrawing();

  expect(() => drawing.stroke('cy', batch('s1', [1, 1]))).toThrow('CANT_DRAW');
  expect(() => drawing.fill('bo', { id: 'f1', x: 1, y: 1, color: 2 })).toThrow('NOT_DRAWER');
  expect(() => drawing.clear('bo')).toThrow('NOT_DRAWER');
});

test('undo takes back the drawer\'s own last action and leaves saboteurs\' lines', () => {
  const drawing = createDrawing();

  drawing.stroke('ana', batch('s1', [1, 1]));
  drawing.stroke('bo', batch('s2', [2, 2]));
  expect(drawing.undo('ana')).toEqual({ type: 'undo', id: 's1' });
  expect(drawing.actions.map((action) => action.id)).toEqual(['s2']);
  expect(() => drawing.undo('ana')).toThrow('NOTHING_TO_UNDO');
});

test('the turn\'s drawing has a size cap', () => {
  const drawing = createDrawing(2, 3);

  drawing.stroke('ana', batch('s1', [1, 1, 2, 2]));
  expect(() => drawing.stroke('ana', batch('s1', [3, 3, 4, 4]))).toThrow('BOARD_FULL');
  drawing.fill('ana', { id: 'f1', x: 1, y: 1, color: 2 });
  expect(() => drawing.fill('ana', { id: 'f2', x: 1, y: 1, color: 2 })).toThrow('BOARD_FULL');
  drawing.clear('ana');
  expect(drawing.actions).toEqual([]);
});

test('the catch-up bytes hold the whole drawing', () => {
  const drawing = createDrawing();

  drawing.stroke('ana', batch('s1', [1, 1, 2.5, 2]));
  drawing.fill('ana', { id: 'f1', x: 10, y: 20, color: 3 });
  expect(decodeDrawing(drawing.encode())).toEqual(drawing.actions);
});
