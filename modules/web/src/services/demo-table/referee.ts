import { drawerPoints } from '@scribble-table/engine';
import {
  chatMaxLength,
  defaultGameSettings,
  gameLimits,
  type GamePhase,
  type GameSettings,
  type RevealSnapshot,
  type TableIntents,
  type TableIntentType,
  type TurnEndReason,
} from '@scribble-table/protocol';
import type { TableLinkListeners } from '../types';
import { DemoBots } from './bots';
import { DemoFeed } from './feed';
import { applySettings, changedSettings, nextBot, pickChoices, settingValue, tidyName, wordPool } from './rules';
import { DemoTurn } from './turn';
import type { DemoDeps, DemoMember, DemoTableState, DemoWord } from './types';
import { secretFor, snapshotFor } from './view';

type DemoHandlers = { [K in TableIntentType]: (memberId: string, message: TableIntents[K]) => void };

const ignore = (): void => undefined;

// Plays the server's part in the browser: lobby → choosing → drawing → reveal → … → podium,
// with sample players. The real server (core-api) takes over with the same snapshots and intents.
export class DemoReferee implements DemoTableState {
  members: DemoMember[] = [];
  settings: GameSettings = { ...defaultGameSettings };
  phase: GamePhase = 'lobby';
  round = 0;
  turnId = '';
  drawerId: string | null = null;
  endsAt: number | null = null;
  reveal: RevealSnapshot | null = null;
  readonly #deps: DemoDeps;
  readonly #out: TableLinkListeners;
  readonly #meId: string;
  readonly #feed: DemoFeed;
  readonly #bots: DemoBots;
  readonly #handlers: DemoHandlers;
  #order: string[] = [];
  #drawerIndex = -1;
  #choices: DemoWord[] = [];
  #turn: DemoTurn | null = null;
  #used = new Set<string>();
  #timers: Array<() => void> = [];

  constructor(deps: DemoDeps, out: TableLinkListeners, meId: string) {
    this.#deps = deps;
    this.#out = out;
    this.#meId = meId;
    this.#feed = new DemoFeed(deps);

    this.#bots = new DemoBots(deps, {
      chat: (id, text) => this.chat(id, text),
      giveUp: (id) => this.giveUp(id),
      choose: (id, index) => this.chooseWord(id, index),
      draw: (op) => out.board(op),
      react: (id, emoji) => out.reaction({ memberId: id, emoji }),
    });

    this.#handlers = {
      start: (id) => this.start(id),
      updateSettings: (id, patch) => this.updateSettings(id, patch),
      chooseWord: (id, { index }) => this.chooseWord(id, index),
      chat: (id, { text }) => this.chat(id, text),
      giveUp: (id) => this.giveUp(id),
      rename: (id, { name }) => this.rename(id, name),
      playAgain: () => this.playAgain(),
      // Board intents and reactions matter only to other people, and here everyone else is a sample player.
      stroke: ignore,
      fill: ignore,
      undo: ignore,
      clear: ignore,
      react: ignore,
    };
  }

  handle<T extends TableIntentType>(memberId: string, type: T, message: TableIntents[T]): void {
    (this.#handlers[type] as (memberId: string, message: TableIntents[T]) => void)(memberId, message);
  }

  join(member: DemoMember): void {
    this.members.push(member);

    if (this.phase !== 'lobby' && this.phase !== 'podium') this.#order.push(member.id);

    this.#feed.system(member, { type: 'joined' });

    if (member.isBot) this.#bots.greet(member);

    this.#emit();
  }

  leave(memberId: string): void {
    const member = this.#member(memberId);

    if (!member) return;

    this.members = this.members.filter((other) => other !== member);
    this.#feed.system(member, { type: 'left' });

    if (this.phase !== 'lobby' && this.phase !== 'podium' && this.members.length < gameLimits.minPlayers) this.#toLobby();
    else if (memberId === this.drawerId && this.phase === 'drawing') this.#endTurn('drawerLeft');
    else if (memberId === this.drawerId && this.phase === 'choosing') this.#nextTurn();
    else if (this.#turn) this.#endIfNobodyGuessing(this.#turn);

    this.#emit();
  }

  start(memberId: string): void {
    const starter = this.#member(memberId);

    if (this.phase !== 'lobby' || !starter || this.members.length < gameLimits.minPlayers) return;

    this.members.forEach((member) => {
      member.score = 0;
    });

    this.round = 1;
    this.#order = this.members.map((member) => member.id);
    this.#drawerIndex = -1;
    this.#used.clear();
    this.#feed.system(starter, { type: 'started', rounds: this.settings.rounds });
    this.#nextTurn();
  }

  updateSettings(memberId: string, patch: Partial<GameSettings>): void {
    const author = this.#member(memberId);

    if (this.phase !== 'lobby' || !author) return;

    const next = applySettings(this.settings, patch);

    changedSettings(this.settings, next).forEach((key) => this.#feed.system(author, { type: 'setting', setting: key, value: settingValue(next, key) }));
    this.settings = next;
    this.#emit();
  }

  chooseWord(memberId: string, index: number): void {
    const word = this.#choices[index];

    if (this.phase === 'choosing' && memberId === this.drawerId && word) this.#beginDrawing(word);
  }

  chat(memberId: string, text: string): void {
    const author = this.#member(memberId);
    const clean = text.trim().slice(0, chatMaxLength);

    if (!author || !clean) return;

    if (this.phase === 'drawing' && this.#turn) this.#chatWhileDrawing(author, clean, this.#turn);
    else this.#feed.message(author, clean, null);

    this.#emit();
  }

  // A guesser stops guessing: no points, but they see the word and move to guessed chat.
  giveUp(memberId: string): void {
    const member = this.#member(memberId);
    const turn = this.#turn;

    if (this.phase !== 'drawing' || !turn || !member || turn.knowsWord(memberId)) return;

    turn.giveUp(memberId);
    this.#feed.system(member, { type: 'gaveUp' });
    this.#endIfNobodyGuessing(turn);
    this.#emit();
  }

  rename(memberId: string, name: string): void {
    const member = this.#member(memberId);
    const clean = tidyName(name);

    if (!member || !clean || clean === member.name) return;

    member.name = clean;
    this.#feed.system(member, { type: 'renamed', name: clean });
    this.#emit();
  }

  playAgain(): void {
    if (this.phase === 'podium') this.#toLobby();
  }

  // Demo buttons.
  skip(): void {
    const actions: Record<GamePhase, () => void> = {
      lobby: () => this.start(this.#meId),
      choosing: () => this.chooseWord(this.drawerId ?? '', 0),
      drawing: () => this.#endTurn('time'),
      reveal: () => this.#nextTurn(),
      podium: () => this.playAgain(),
    };

    actions[this.phase]();
  }

  drawNext(): void {
    const others = this.members.filter((member) => member.id !== this.#meId);
    const me = this.#member(this.#meId);

    if (this.phase === 'lobby' && me) this.members = [me, ...others];

    const rest = this.#order.slice(this.#drawerIndex + 1).filter((id) => id !== this.#meId);

    if (this.phase !== 'lobby') this.#order = [...this.#order.slice(0, this.#drawerIndex + 1), this.#meId, ...rest];
  }

  addBot(): void {
    const bot = nextBot(this.members, this.#deps.createId);

    if (bot) this.join(bot);
  }

  removeBot(): void {
    const bot = this.members.findLast((member) => member.isBot);

    if (bot) this.leave(bot.id);
  }

  dispose(): void {
    this.#clearTimers();
    this.#bots.cancel();
  }

  #chatWhileDrawing(author: DemoMember, text: string, turn: DemoTurn): void {
    if (turn.knowsWord(author.id)) {
      this.#feed.message(author, text, turn);

      return;
    }

    const verdict = turn.judge(text);

    if (verdict === 'right') {
      this.#rightGuess(author, turn);

      return;
    }

    this.#feed.message(author, text, null);

    if (verdict === 'close') this.#feed.system(author, { type: 'close', guess: text }, author.id);
  }

  #rightGuess(author: DemoMember, turn: DemoTurn): void {
    turn.addGuess(author.id, this.#deps.now());
    this.#feed.system(author, { type: 'guessed' });

    const cheerer = this.members.find((member) => member.isBot && member.id !== author.id && this.#deps.random() < 0.4);

    if (cheerer) this.#bots.cheer(cheerer);

    this.#endIfNobodyGuessing(turn);
  }

  #endIfNobodyGuessing(turn: DemoTurn): void {
    if (this.phase !== 'drawing' || !this.members.every((member) => turn.knowsWord(member.id))) return;

    this.#endTurn(turn.gaveUpIds.length > 0 ? 'gaveUp' : 'everyone');
  }

  #nextTurn(): void {
    this.#drawerIndex += 1;

    if (this.#drawerIndex >= this.#order.length) {
      this.round += 1;
      this.#drawerIndex = 0;
      this.#order = this.members.map((member) => member.id);
    }

    if (this.round > this.settings.rounds) {
      this.#podium();

      return;
    }

    const drawer = this.#member(this.#order[this.#drawerIndex] ?? '');

    if (drawer) this.#beginChoosing(drawer);
    else this.#nextTurn();
  }

  #beginChoosing(drawer: DemoMember): void {
    const chooseMs = gameLimits.chooseSeconds * 1000;

    this.#reset('choosing');
    this.turnId = this.#deps.createId();
    this.drawerId = drawer.id;
    this.#choices = pickChoices(wordPool(this.settings), this.#used, this.settings.wordChoices, this.#deps.random);
    this.endsAt = this.#deps.now() + chooseMs;
    this.#later(chooseMs, () => this.chooseWord(drawer.id, Math.floor(this.#deps.random() * this.#choices.length)));
    this.#feed.system(drawer, { type: 'drawing' });

    if (drawer.isBot) this.#bots.choose(drawer, this.#choices.length);

    this.#emit();
  }

  #beginDrawing(word: DemoWord): void {
    const now = this.#deps.now();
    const turn = new DemoTurn({ word, drawerId: this.drawerId ?? '', startedAt: now, drawMs: this.settings.drawSeconds * 1000, hints: this.settings.hints, random: this.#deps.random });
    const others = wordPool(this.settings).filter((other) => other !== word);

    this.#reset('drawing');
    this.#turn = turn;
    this.#used.add(word.forms.en);
    this.endsAt = turn.endsAt;
    turn.hintTimes.forEach((at) => this.#later(at - now, () => this.#emit()));
    this.#later(turn.drawMs, () => this.#endTurn('time'));
    this.members.filter((member) => member.isBot && member.id !== turn.drawerId).forEach((bot) => this.#bots.guess(bot, turn, others));

    if (this.#member(turn.drawerId)?.isBot) this.#bots.draw(word);

    this.#emit();
  }

  #endTurn(reason: TurnEndReason): void {
    const turn = this.#turn;

    if (this.phase !== 'drawing' || !turn) return;

    const drawer = this.#member(turn.drawerId);
    const gains = reason === 'drawerLeft' ? [] : [...turn.guesses, { memberId: turn.drawerId, points: drawerPoints(turn.guesses.length) }];

    this.#reset('reveal');
    this.#turn = turn;

    gains.forEach((gain) => {
      const member = this.#member(gain.memberId);

      if (member) member.score += gain.points;
    });

    this.reveal = { word: turn.word.forms, gains, reason };
    this.endsAt = this.#deps.now() + gameLimits.revealSeconds * 1000;
    this.#later(gameLimits.revealSeconds * 1000, () => this.#nextTurn());

    if (drawer) this.#feed.system(drawer, { type: 'drew', word: turn.word.forms });

    this.#emit();
  }

  #podium(): void {
    this.#reset('podium');
    this.drawerId = null;
    this.#emit();
  }

  #toLobby(): void {
    this.#reset('lobby');
    this.round = 0;
    this.drawerId = null;

    this.members.forEach((member) => {
      member.score = 0;
    });

    this.#emit();
  }

  // Leaves the current phase behind: timers, sample players' plans, the turn and the reveal.
  #reset(phase: GamePhase): void {
    this.#clearTimers();
    this.#bots.cancel();
    this.phase = phase;
    this.#turn = null;
    this.reveal = null;
    this.endsAt = null;
  }

  #member(id: string): DemoMember | undefined {
    return this.members.find((member) => member.id === id);
  }

  #later(delayMs: number, action: () => void): void {
    this.#timers.push(this.#deps.schedule(action, Math.max(0, delayMs)));
  }

  #clearTimers(): void {
    this.#timers.forEach((stop) => stop());
    this.#timers = [];
  }

  #emit(): void {
    const view = { state: this, turn: this.#turn, choices: this.#choices, feed: this.#feed, now: this.#deps.now() };

    this.#out.snapshot(snapshotFor(view, this.#meId));
    this.#out.secret(secretFor(view, this.#meId));
  }
}
