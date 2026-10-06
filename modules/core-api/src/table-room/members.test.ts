import { playerColors } from '@scribble-table/protocol';
import { expect, test } from 'vitest';
import { TableRoomError } from './error.js';
import { pickMemberName } from './member-names.js';
import { TableRoomMembers } from './members.js';

test('a newcomer without a saved name gets a made-up one; a saved name is cleaned up', () => {
  const members = new TableRoomMembers(Math.random);

  expect(members.join('a', null).name).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/u);
  expect(members.join('b', '  Ana   Maria ').name).toBe('Ana Maria');
  expect(members.join('c', '   ').name).not.toBe('');
});

test('colours stay unique until the palette runs out', () => {
  const members = new TableRoomMembers(Math.random);
  const colors = playerColors.map((_, index) => members.join(`p${index}`, null).color);

  expect(new Set(colors).size).toBe(playerColors.length);
  expect(playerColors).toContain(members.join('extra', null).color);
});

test('a dropped member keeps their seat and score until they leave', () => {
  const members = new TableRoomMembers(Math.random);

  members.join('a', 'Ana');
  members.award('a', 75);
  members.drop('a');
  expect(members.snapshot).toEqual([{ id: 'a', name: 'Ana', color: expect.any(String), connected: false, score: 75 }]);
  members.reconnect('a');
  expect(members.get('a').connected).toBe(true);
  expect(members.leave('a').name).toBe('Ana');
  expect(members.count).toBe(0);
});

test('scores reset for a new game', () => {
  const members = new TableRoomMembers(Math.random);

  members.join('a', 'Ana');
  members.award('a', 100);
  members.resetScores();
  expect(members.get('a').score).toBe(0);
});

test('rename cleans the name and reports when nothing changed', () => {
  const members = new TableRoomMembers(Math.random);

  members.join('a', 'Ana');
  expect(members.rename('a', ' Ana  B ')).toBe('Ana B');
  expect(members.rename('a', 'Ana B')).toBeNull();
  expect(() => members.rename('a', '   ')).toThrow(new TableRoomError('EMPTY_NAME'));
});

test('unknown and duplicate members are refused with typed codes', () => {
  const members = new TableRoomMembers(Math.random);

  members.join('a', 'Ana');
  expect(() => members.join('a', 'Ana')).toThrow(new TableRoomError('ALREADY_A_MEMBER'));
  expect(() => members.drop('ghost')).toThrow(new TableRoomError('NOT_A_MEMBER'));
  expect(() => members.leave('ghost')).toThrow(new TableRoomError('NOT_A_MEMBER'));
});

test('made-up names avoid the ones already taken', () => {
  const always = (): number => 0;
  const first = pickMemberName(new Set(), always);

  expect(pickMemberName(new Set([first]), always)).toBe(`${first} 2`);
});
