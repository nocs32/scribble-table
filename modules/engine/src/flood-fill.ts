// The paint bucket: a scanline flood fill over RGBA pixels laid out like canvas ImageData.
// Pixels within `tolerance` of the start colour (per channel) count as the same area, which
// also swallows most of a line's soft anti-aliased edge.

export type Rgba = readonly [number, number, number, number];

interface FillArea {
  pixels: Uint8ClampedArray;
  width: number;
  height: number;
  target: Rgba;
  tolerance: number;
  visited: Uint8Array;
}

const colorAt = (pixels: Uint8ClampedArray, offset: number): Rgba => [
  pixels[offset] ?? 0,
  pixels[offset + 1] ?? 0,
  pixels[offset + 2] ?? 0,
  pixels[offset + 3] ?? 0,
];

const isSame = (a: Rgba, b: Rgba, tolerance: number): boolean => a.every((channel, index) => Math.abs(channel - (b[index] ?? 0)) <= tolerance);

const fits = (area: FillArea, x: number, y: number): boolean => {
  if (x < 0 || y < 0 || x >= area.width || y >= area.height) return false;

  const index = y * area.width + x;

  return area.visited[index] === 0 && isSame(colorAt(area.pixels, index * 4), area.target, area.tolerance);
};

// Fills the run of matching pixels through (x, y) and returns where it starts and ends.
const fillRun = (area: FillArea, x: number, y: number, color: Rgba): [number, number] => {
  let left = x;
  let right = x;

  while (fits(area, left - 1, y)) left--;

  while (fits(area, right + 1, y)) right++;

  for (let column = left; column <= right; column++) {
    const index = y * area.width + column;

    area.visited[index] = 1;
    area.pixels.set(color, index * 4);
  }

  return [left, right];
};

// Returns how many pixels were painted.
export const floodFill = (pixels: Uint8ClampedArray, width: number, height: number, x: number, y: number, color: Rgba, tolerance = 32): number => {
  const startX = Math.floor(x);
  const startY = Math.floor(y);

  if (startX < 0 || startY < 0 || startX >= width || startY >= height) return 0;

  const area: FillArea = { pixels, width, height, target: colorAt(pixels, (startY * width + startX) * 4), tolerance, visited: new Uint8Array(width * height) };
  const stack: Array<[number, number]> = [[startX, startY]];
  let painted = 0;

  while (stack.length > 0) {
    const [seedX, seedY] = stack.pop() as [number, number];

    if (!fits(area, seedX, seedY)) continue;

    const [left, right] = fillRun(area, seedX, seedY, color);

    painted += right - left + 1;

    for (let column = left; column <= right; column++) {
      stack.push([column, seedY - 1], [column, seedY + 1]);
    }
  }

  return painted;
};
