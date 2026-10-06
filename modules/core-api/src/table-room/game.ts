import { applySettings, changedSettings, customWordForms, drawerPoints, pickWordChoices, settingValue, wordKey } from '@scribble-table/engine';
import {
  defaultGameSettings,
  gameLimits,
  type GamePhase,
  type GameSettings,
  type GameSnapshot,
  type RevealSnapshot,
  type TableSecret,
  type TrickKind,
  type TurnEndReason,
} from '@scribble-table/protocol';
import type { WordEntry } from '../words/index.js';
import type { TableRoomDrawingMove } from './drawing.js';
import { TableRoomError } from './error.js';
import type { TableRoomFeed } from './feed.js';
import type { Schedule } from './lifecycle.js';
import type { TableRoomMember, TableRoomMembers } from './members.js';
import { TableRoomTricks } from './tricks.js';
import { TableRoomTurn } from './turn.js';
import { TableRoomTurns } from './turns.js';

export interface TableRoomGameDeps {
  members: TableRoomMembers;
  feed: TableRoomFeed;
  words: () => readonly WordEntry[];
  schedule: Schedule;
  now: () => number;
  random: () => number;
  createId: () => string;
  // A new turn starts on a blank board.
  clearBoard: () => void;
  // Guessed chat just opened up to this person (they guessed it or gave up).
  opened: (memberId: string) => void;
  // Something changed on its own, on a timer: tell everyone.
  changed: () => void;
}

const customEntry = (word: string): WordEntry => ({ forms: customWordForms(word), alternatives: [], difficulty: 'medium' });

// The game (spec §4): lobby → choosing → drawing → reveal → choosing … → podium → lobby. The
// server decides everything: the words, the clock, the guesses and the score.
export class TableRoomGame {
  phase: GamePhase = 'lobby';
  settings: GameSettings = { ...defaultGameSettings };
  turnId = '';
  drawerId: string | null = null;
  endsAt: number | null = null;
  reveal: RevealSnapshot | null = null;
  readonly #deps: TableRoomGameDeps;
  readonly #turns = new TableRoomTurns();
  readonly #tricks: TableRoomTricks;
  #choices: WordEntry[] = [];
  #turn: TableRoomTurn | null = null;
  readonly #used = new Set<string>();
  #timers: Array<() => void> = [];

  constructor(deps: TableRoomGameDeps) {
    this.#deps = deps;
    this.#tricks = new TableRoomTricks(deps);
  }

  get isRunning(): boolean {
    return this.phase === 'choosing' || this.phase === 'drawing' || this.phase === 'reveal';
  }

  snapshot(now: number): GameSnapshot {
    const turn = this.#turn;
    const drawing = this.phase === 'drawing';

    return {
      phase: this.phase,
      settings: this.settings,
      round: this.#turns.round,
      turnId: this.turnId,
      drawerId: this.drawerId,
      masks: drawing && turn ? turn.masks(now) : null,
      endsAt: this.endsAt,
      guessedIds: turn ? turn.guessedIds : [],
      gaveUpIds: turn ? [...turn.gaveUpIds] : [],
      tricks: drawing ? this.#tricks.active(now) : [],
      trickedIds: this.#tricks.playedIds,
      reveal: this.reveal,
    };
  }

  // The words to choose from go to the drawer; the word itself to the drawer and to whoever got
  // it or gave up. Everyone else sees only the mask until the reveal (spec D6).
  secretFor(viewerId: string): TableSecret {
    const turn = this.#turn;
    const choosing = this.phase === 'choosing' && this.drawerId === viewerId;
    const knows = this.phase === 'drawing' && turn !== null && turn.knowsWord(viewerId);

    return {
      choices: choosing ? this.#choices.map(({ forms, difficulty }) => ({ forms, difficulty })) : null,
      word: knows ? turn.word.forms : null,
    };
  }

  start(memberId: string): void {
    const starter = this.#deps.members.get(memberId);
    const { members, feed } = this.#deps;

    if (this.phase !== 'lobby') throw new TableRoomError('WRONG_PHASE');

    if (members.count < gameLimits.minPlayers) throw new TableRoomError('NOT_ENOUGH_PLAYERS');

    members.resetScores();
    this.#turns.start(members.all.map((member) => member.id));
    this.#used.clear();
    feed.system(starter, { type: 'started', rounds: this.settings.rounds });
    this.#nextTurn();
  }

  // Anyone may change the settings, in the lobby only (spec D8). Each change gets a feed line.
  updateSettings(memberId: string, patch: Partial<GameSettings>): void {
    const author = this.#deps.members.get(memberId);

    if (this.phase !== 'lobby') throw new TableRoomError('WRONG_PHASE');

    const next = applySettings(this.settings, patch);

    changedSettings(this.settings, next).forEach((key) => this.#deps.feed.system(author, { type: 'setting', setting: key, value: settingValue(next, key) }));
    this.settings = next;
  }

  chooseWord(memberId: string, index: number): void {
    const word = this.#choices[index];

    if (this.phase !== 'choosing') throw new TableRoomError('WRONG_PHASE');

    if (memberId !== this.drawerId) throw new TableRoomError('NOT_DRAWER');

    if (!word) throw new TableRoomError('NO_SUCH_CHOICE');

    this.#beginDrawing(word);
  }

  // While drawing, a guesser's line is a guess; those who know the word talk in guessed chat.
  chat(memberId: string, text: string): void {
    const author = this.#deps.members.get(memberId);
    const clean = text.trim();
    const turn = this.#turn;

    if (!clean) return;

    if (this.phase === 'drawing' && turn) this.#chatWhileDrawing(author, clean, turn);
    else this.#deps.feed.message(author, clean, null);
  }

  // A guesser stops guessing: no points, but they see the word and move to guessed chat (spec D15).
  giveUp(memberId: string): void {
    const member = this.#deps.members.get(memberId);
    const turn = this.#drawingTurn();

    if (turn.knowsWord(memberId)) throw new TableRoomError('ALREADY_KNOWS_WORD');

    turn.giveUp(memberId);
    this.#deps.feed.system(member, { type: 'gaveUp' });
    this.#deps.opened(memberId);
    this.#endIfNobodyGuessing(turn);
  }

  // A player who guessed plays a trick (spec D18); it ends on its own, so everyone hears then.
  playTrick(memberId: string, kind: TrickKind): void {
    const member = this.#deps.members.get(memberId);
    const turn = this.#drawingTurn();

    if (!this.settings.sabotage) throw new TableRoomError('SABOTAGE_OFF');

    if (!turn.hasGuessed(memberId)) throw new TableRoomError('CANT_SABOTAGE');

    const trick = this.#tricks.play(memberId, kind);

    this.#deps.feed.system(member, { type: 'trick', trick: kind });
    this.#later(trick.endsAt - this.#deps.now(), this.#deps.changed);
  }

  playAgain(memberId: string): void {
    this.#deps.members.get(memberId);

    if (this.phase !== 'podium') throw new TableRoomError('WRONG_PHASE');

    this.#toLobby();
  }

  // The drawer may do anything on the board; with sabotage on, those who guessed may draw lines.
  permit(memberId: string, move: TableRoomDrawingMove): void {
    const turn = this.#drawingTurn();
    const scribbler = move === 'stroke' && this.settings.sabotage && turn.hasGuessed(memberId);

    if (memberId === turn.drawerId || scribbler) return;

    throw new TableRoomError(move === 'stroke' ? 'CANT_DRAW' : 'NOT_DRAWER');
  }

  // Someone joined mid-game: they guess straight away and draw at the end of the round.
  join(memberId: string): void {
    if (this.isRunning) this.#turns.join(memberId);
  }

  // A dropped connection can end the turn: the rest may all know the word already.
  drop(): void {
    if (this.phase === 'drawing' && this.#turn) this.#endIfNobodyGuessing(this.#turn);
  }

  // After the member is gone from the table (spec §4.5).
  leave(memberId: string): void {
    if (!this.isRunning) return;

    if (this.#deps.members.count < gameLimits.minPlayers) this.#toLobby();
    else if (memberId === this.drawerId && this.phase === 'drawing') this.#endTurn('drawerLeft');
    else if (memberId === this.drawerId && this.phase === 'choosing') this.#nextTurn();
    else this.drop();
  }

  dispose(): void {
    this.#clearTimers();
  }

  #chatWhileDrawing(author: TableRoomMember, text: string, turn: TableRoomTurn): void {
    const { feed } = this.#deps;

    if (turn.knowsWord(author.id)) {
      feed.message(author, text, turn);

      return;
    }

    const verdict = turn.judge(text);

    if (verdict === 'right') {
      turn.addGuess(author.id, this.#deps.now());
      feed.system(author, { type: 'guessed' });
      this.#deps.opened(author.id);
      this.#endIfNobodyGuessing(turn);

      return;
    }

    feed.message(author, text, null);

    if (verdict === 'close') feed.system(author, { type: 'close', guess: text }, author.id);
  }

  // Ends the turn once everyone still connected knows the word (and there's someone to guess).
  #endIfNobodyGuessing(turn: TableRoomTurn): void {
    const guessers = this.#deps.members.all.filter((member) => member.connected && member.id !== turn.drawerId);

    if (this.phase !== 'drawing' || guessers.length === 0 || !guessers.every((member) => turn.knowsWord(member.id))) return;

    this.#endTurn(turn.gaveUpIds.length > 0 ? 'gaveUp' : 'everyone');
  }

  #drawingTurn(): TableRoomTurn {
    if (this.phase !== 'drawing' || !this.#turn) throw new TableRoomError('WRONG_PHASE');

    return this.#turn;
  }

  #nextTurn(): void {
    const drawerId = this.#turns.next(this.#deps.members.all.map((member) => member.id), this.settings.rounds);
    const drawer = drawerId === null ? undefined : this.#deps.members.find(drawerId);

    if (drawer) this.#beginChoosing(drawer);
    else this.#podium();
  }

  #beginChoosing(drawer: TableRoomMember): void {
    const chooseMs = gameLimits.chooseSeconds * 1000;
    const pool = this.#pool();

    this.#reset('choosing');
    this.#deps.clearBoard();
    this.turnId = this.#deps.createId();
    this.drawerId = drawer.id;
    this.#choices = pickWordChoices(pool, this.#used, this.settings.wordChoices, this.#deps.random);
    this.endsAt = this.#deps.now() + chooseMs;
    this.#deps.feed.system(drawer, { type: 'drawing' });

    this.#later(chooseMs, () => {
      const word = this.#choices[Math.floor(this.#deps.random() * this.#choices.length)];

      if (word) this.#beginDrawing(word);

      this.#deps.changed();
    });
  }

  #beginDrawing(word: WordEntry): void {
    const now = this.#deps.now();
    const turn = new TableRoomTurn({ word, drawerId: this.drawerId ?? '', startedAt: now, drawMs: this.settings.drawSeconds * 1000, hints: this.settings.hints, random: this.#deps.random });

    this.#reset('drawing');
    this.#turn = turn;
    this.#used.add(wordKey(word));
    this.endsAt = turn.endsAt;
    turn.hintTimes.forEach((at) => this.#later(at - now, this.#deps.changed));

    this.#later(turn.drawMs, () => {
      this.#endTurn('time');
      this.#deps.changed();
    });
  }

  #endTurn(reason: TurnEndReason): void {
    const turn = this.#turn;
    const revealMs = gameLimits.revealSeconds * 1000;

    if (this.phase !== 'drawing' || !turn) return;

    const drawer = this.#deps.members.find(turn.drawerId);
    const gains = reason === 'drawerLeft' ? [] : [...turn.guesses, { memberId: turn.drawerId, points: drawerPoints(turn.guesses.length) }];

    this.#reset('reveal');
    this.#turn = turn;
    gains.forEach((gain) => this.#deps.members.award(gain.memberId, gain.points));
    this.reveal = { word: turn.word.forms, gains, reason };
    this.endsAt = this.#deps.now() + revealMs;

    if (drawer) this.#deps.feed.system(drawer, { type: 'drew', word: turn.word.forms });

    this.#later(revealMs, () => {
      this.#nextTurn();
      this.#deps.changed();
    });
  }

  #podium(): void {
    this.#reset('podium');
    this.drawerId = null;
  }

  #toLobby(): void {
    this.#reset('lobby');
    this.#turns.stop();
    this.#deps.clearBoard();
    this.drawerId = null;
    this.#deps.members.resetScores();
  }

  // The table's words plus the custom ones, or only the custom ones.
  #pool(): WordEntry[] {
    const custom = this.settings.customWords.map(customEntry);

    return this.settings.onlyCustomWords ? custom : [...this.#deps.words(), ...custom];
  }

  // Leaves the current phase behind: its timers, tricks, turn and reveal.
  #reset(phase: GamePhase): void {
    this.#clearTimers();
    this.#tricks.reset();
    this.phase = phase;
    this.#turn = null;
    this.reveal = null;
    this.endsAt = null;
  }

  #later(delayMs: number, action: () => void): void {
    this.#timers.push(this.#deps.schedule(action, Math.max(0, delayMs)));
  }

  #clearTimers(): void {
    this.#timers.forEach((stop) => stop());
    this.#timers = [];
  }
}
