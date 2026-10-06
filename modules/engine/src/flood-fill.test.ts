import { expect, test } from 'vitest';
import { floodFill, type Rgba } from './flood-fill.js';

const white: Rgba = [255, 255, 255, 255];
const black: Rgba = [0, 0, 0, 255];
const red: Rgba = [230, 40, 40, 255];

const canvas = (width: number, height: number): Uint8ClampedArray => {
  const pixels = new Uint8ClampedArray(width * height * 4);

  for (let index = 0; index < width * height; index++) pixels.set(white, index * 4);

  return pixels;
};

const at = (pixels: Uint8ClampedArray, width: number, x: number, y: number): number[] => [...pixels.slice((y * width + x) * 4, (y * width + x) * 4 + 4)];

test('floodFill paints the whole open area', () => {
  const pixels = canvas(6, 4);

  expect(floodFill(pixels, 6, 4, 2, 1, red)).toBe(24);
  expect(at(pixels, 6, 5, 3)).toEqual([...red]);
});

test('floodFill stops at a closed line', () => {
  const pixels = canvas(7, 5);

  // A vertical wall at x = 3 splits the canvas in two.
  for (let y = 0; y < 5; y++) pixels.set(black, (y * 7 + 3) * 4);

  expect(floodFill(pixels, 7, 5, 0, 0, red)).toBe(15);
  expect(at(pixels, 7, 2, 4)).toEqual([...red]);
  expect(at(pixels, 7, 3, 2)).toEqual([...black]);
  expect(at(pixels, 7, 4, 2)).toEqual([...white]);
});

test('floodFill counts near colours as the same area', () => {
  const pixels = canvas(3, 1);

  pixels.set([240, 240, 240, 255], 4);

  expect(floodFill(pixels, 3, 1, 0, 0, red, 32)).toBe(3);
});

test('floodFill does nothing outside the canvas, and ends when refilling the same colour', () => {
  const pixels = canvas(4, 4);

  expect(floodFill(pixels, 4, 4, -1, 2, red)).toBe(0);
  expect(floodFill(pixels, 4, 4, 1, 1, white)).toBe(16);
});
