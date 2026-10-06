import { gameLimits, type FeedItem } from '@scribble-table/protocol';
import { expect, test } from 'vitest';
import { createTestTable, type TestTable } from './test-table.js';

const seat = (table: TestTable, ...names: string[]): string[] => names.map((name) => table.members.join(name.toLowerCase(), name).id);

// A started game where Ana draws and has picked the word at `index` (the turn's three choices
// are the three test words, easy → medium → hard).
const drawing = (index = 0, names = ['Ana', 'Bo', 'Cy']): TestTable => {
  const table = createTestTable();

  seat(table, ...names);
  table.game.start('ana');
  table.game.chooseWord('ana', index);

  return table;
};

const events = (table: TestTable, viewerId: string): string[] =>
  table.feed.visibleTo(viewerId).map((item: FeedItem) => (item.kind === 'system' ? item.event.type : `${item.audience}:${item.text}`));

test('start needs the lobby and two people', () => {
  const table = createTestTable();

  seat(table, 'Ana');
  expect(() => table.game.start('ana')).toThrow('NOT_ENOUGH_PLAYERS');
  seat(table, 'Bo');
  table.game.start('ana');
  expect(table.game.phase).toBe('choosing');
  expect(() => table.game.start('bo')).toThrow('WRONG_PHASE');
});

test('settings change in the lobby only, clamped, with a feed line per change', () => {
  const table = createTestTable();

  seat(table, 'Ana', 'Bo');
  table.game.updateSettings('ana', { rounds: 99, hints: false });
  expect([table.game.settings.rounds, table.game.settings.hints]).toEqual([10, false]);
  expect(events(table, 'bo')).toEqual(['setting', 'setting']);
  table.game.start('ana');
  expect(() => table.game.updateSettings('bo', { rounds: 2 })).toThrow('WRONG_PHASE');
});

test('only the drawer sees the choices, and only the drawer may pick', () => {
  const table = createTestTable();

  seat(table, 'Ana', 'Bo');
  table.game.start('ana');
  expect(table.game.secretFor('ana').choices?.map((choice) => choice.difficulty)).toEqual(['easy', 'medium', 'hard']);
  expect(table.game.secretFor('bo')).toEqual({ choices: null, word: null });
  expect(() => table.game.chooseWord('bo', 0)).toThrow('NOT_DRAWER');
  expect(() => table.game.chooseWord('ana', 4)).toThrow('NO_SUCH_CHOICE');
});

test('nobody picks in time: a word is picked for the drawer', () => {
  const table = createTestTable();

  seat(table, 'Ana', 'Bo');
  table.game.start('ana');
  table.advance(gameLimits.chooseSeconds * 1000);
  expect(table.game.phase).toBe('drawing');
  expect(table.changes()).toBe(1);
});

test('guessers see masks, the drawer sees the word', () => {
  const table = drawing(0);
  const { masks } = table.game.snapshot(table.now());

  expect(masks).toEqual({ en: '_______', uk: '_______' });
  expect(table.game.secretFor('ana').word?.en).toBe('zorblat');
  expect(table.game.secretFor('bo').word).toBeNull();
});

test('letters show at half time and three quarters', () => {
  const table = drawing(0);
  const half = table.game.settings.drawSeconds * 500;

  table.advance(half);
  expect(table.game.snapshot(table.now()).masks?.en.replaceAll('_', '')).toHaveLength(1);
  table.advance(half / 2);
  expect(table.game.snapshot(table.now()).masks?.en.replaceAll('_', '')).toHaveLength(2);
});

test('a right guess in either language scores, is never shown, and opens guessed chat', () => {
  const table = drawing(0);

  table.game.chat('bo', 'ЗОРБЛАТ!');
  expect(table.game.snapshot(table.now()).guessedIds).toEqual(['bo']);
  expect(table.opened).toEqual(['bo']);
  expect(table.game.secretFor('bo').word?.en).toBe('zorblat');
  expect(events(table, 'cy').slice(-1)).toEqual(['guessed']);
  table.game.chat('bo', 'that was easy');
  expect(events(table, 'bo').slice(-1)).toEqual(['guessed:that was easy']);
  expect(events(table, 'cy').slice(-1)).toEqual(['guessed']);
});

test('a close guess is a public line plus a hint only the guesser sees', () => {
  const table = drawing(0);

  table.game.chat('bo', 'zorblot');
  expect(events(table, 'bo').slice(-2)).toEqual(['everyone:zorblot', 'close']);
  expect(events(table, 'cy').slice(-1)).toEqual(['everyone:zorblot']);
});

test('everyone guessing ends the turn: the reveal has the points, then the next turn starts', () => {
  const table = drawing(0);

  table.game.chat('bo', 'zorbo');
  table.game.chat('cy', 'zorblat');
  expect(table.game.phase).toBe('reveal');
  expect(table.game.reveal?.reason).toBe('everyone');
  expect(table.game.reveal?.gains.map((gain) => gain.memberId)).toEqual(['bo', 'cy', 'ana']);
  expect(table.members.get('ana').score).toBe(50);
  table.advance(gameLimits.revealSeconds * 1000);
  expect([table.game.phase, table.game.drawerId]).toEqual(['choosing', 'bo']);
});

test('time running out ends the turn', () => {
  const table = drawing(0);

  table.advance(table.game.settings.drawSeconds * 1000);
  expect(table.game.reveal?.reason).toBe('time');
});

test('giving up: no points, sees the word, and can end the turn', () => {
  const table = drawing(0);

  table.game.giveUp('bo');
  expect(() => table.game.giveUp('bo')).toThrow('ALREADY_KNOWS_WORD');
  expect(() => table.game.giveUp('ana')).toThrow('ALREADY_KNOWS_WORD');
  expect(table.game.secretFor('bo').word?.en).toBe('zorblat');
  table.game.chat('cy', 'zorblat');
  expect(table.game.reveal?.reason).toBe('gaveUp');
  expect(table.game.reveal?.gains.map((gain) => gain.memberId)).toEqual(['cy', 'ana']);
});

test('tricks: only for those who guessed, one a turn, and never with sabotage off', () => {
  const table = drawing(0);

  expect(() => table.game.playTrick('bo', 'flip')).toThrow('CANT_SABOTAGE');
  table.game.chat('bo', 'zorblat');
  table.game.playTrick('bo', 'flip');
  expect(table.game.snapshot(table.now()).tricks.map((trick) => trick.kind)).toEqual(['flip']);
  expect(() => table.game.playTrick('bo', 'splat')).toThrow('NO_TRICKS_LEFT');
  table.advance(5000);
  expect(table.game.snapshot(table.now()).tricks).toEqual([]);
  expect(table.changes()).toBe(1);
});

test('sabotage off: no tricks and no scribbling', () => {
  const table = createTestTable();

  seat(table, 'Ana', 'Bo', 'Cy');
  table.game.updateSettings('ana', { sabotage: false });
  table.game.start('ana');
  table.game.chooseWord('ana', 0);
  table.game.chat('bo', 'zorblat');
  expect(() => table.game.playTrick('bo', 'flip')).toThrow('SABOTAGE_OFF');
  expect(() => table.game.permit('bo', 'stroke')).toThrow('CANT_DRAW');
});

test('the board: the drawer does anything, those who guessed only draw lines', () => {
  const table = drawing(0, ['Ana', 'Bo', 'Cy', 'Di']);

  expect(() => table.game.permit('ana', 'fill')).not.toThrow();
  expect(() => table.game.permit('bo', 'stroke')).toThrow('CANT_DRAW');
  table.game.chat('bo', 'zorblat');
  expect(() => table.game.permit('bo', 'stroke')).not.toThrow();
  expect(() => table.game.permit('bo', 'clear')).toThrow('NOT_DRAWER');
  table.game.giveUp('cy');
  expect(() => table.game.permit('cy', 'stroke')).toThrow('CANT_DRAW');
});

test('the drawer leaving ends the turn with nobody scoring', () => {
  const table = drawing(0);

  table.game.chat('bo', 'zorblat');
  table.members.leave('ana');
  table.game.leave('ana');
  expect(table.game.reveal?.reason).toBe('drawerLeft');
  expect(table.game.reveal?.gains).toEqual([]);
  expect(table.members.get('bo').score).toBe(0);
});

test('fewer than two left: back to the lobby with scores reset', () => {
  const table = drawing(0, ['Ana', 'Bo']);

  table.members.leave('bo');
  table.game.leave('bo');
  expect([table.game.phase, table.game.snapshot(table.now()).round]).toEqual(['lobby', 0]);
});

test('a dropped guesser does not hold up the turn when everyone else got it', () => {
  const table = drawing(0);

  table.game.chat('bo', 'zorblat');
  table.members.drop('cy');
  table.game.drop();
  expect(table.game.reveal?.reason).toBe('everyone');
});

test('someone joining mid-game draws at the end of the round', () => {
  const table = drawing(0, ['Ana', 'Bo']);

  seat(table, 'Di');
  table.game.join('di');
  table.advance(table.game.settings.drawSeconds * 1000 + gameLimits.revealSeconds * 1000);
  table.game.chooseWord('bo', 0);
  table.advance(table.game.settings.drawSeconds * 1000 + gameLimits.revealSeconds * 1000);
  expect(table.game.drawerId).toBe('di');
});

test('after the last round comes the podium, and play again goes back to the lobby', () => {
  const table = createTestTable();
  const turnMs = (gameLimits.chooseSeconds + table.game.settings.drawSeconds + gameLimits.revealSeconds) * 1000;

  seat(table, 'Ana', 'Bo');
  table.game.updateSettings('ana', { rounds: 1 });
  table.game.start('ana');
  expect(() => table.game.playAgain('ana')).toThrow('WRONG_PHASE');
  table.advance(turnMs * 2);
  expect(table.game.phase).toBe('podium');
  table.game.playAgain('bo');
  expect(table.game.phase).toBe('lobby');
});

test('words are not offered twice in a game while fresh ones are left', () => {
  const table = createTestTable();

  seat(table, 'Ana', 'Bo');
  table.game.updateSettings('ana', { wordChoices: 1 });
  table.game.start('ana');

  const first = table.game.secretFor('ana').choices?.[0]?.forms.en;

  table.game.chooseWord('ana', 0);
  table.advance(table.game.settings.drawSeconds * 1000 + gameLimits.revealSeconds * 1000);
  expect(table.game.secretFor('bo').choices?.[0]?.forms.en).not.toBe(first);
});

test('only custom words: the choices come from them, the same in both languages', () => {
  const table = createTestTable();
  const custom = Array.from({ length: 10 }, (_, index) => `blorp ${index}`);

  seat(table, 'Ana', 'Bo');
  table.game.updateSettings('ana', { customWords: custom, onlyCustomWords: true });
  table.game.start('ana');

  const choice = table.game.secretFor('ana').choices?.[0];

  expect(custom).toContain(choice?.forms.en);
  expect(choice?.forms.uk).toBe(choice?.forms.en);
});
