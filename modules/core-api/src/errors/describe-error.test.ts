import { expect, test } from 'vitest';
import { describeError } from './describe-error.js';

test('describeError names the error and its message', () => {
  expect(describeError(new TypeError('bad input'))).toBe('TypeError: bad input');
});

test('describeError adds the cause, where fetch hides the network error', () => {
  const error = new Error('fetch failed', { cause: new Error('ECONNREFUSED') });

  expect(describeError(error)).toBe('Error: fetch failed (ECONNREFUSED)');
});

test('describeError turns anything else into a string', () => {
  expect(describeError('plain text')).toBe('plain text');
  expect(describeError(42)).toBe('42');
});
