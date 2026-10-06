import { rankByScore } from '@scribble-table/engine';
import type { MemberSnapshot, TurnGain } from '@scribble-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../locale';
import type { PlayerColor, PresenceStatus } from './types';

export interface PlayerView {
  id: string;
  name: string;
  initial: string;
  color: PlayerColor;
  status: PresenceStatus;
  isMe: boolean;
  // Shown after the name: "you", "reconnecting" or nothing.
  note: string;
  score: number;
  scoreTitle: string;
  place: number;
  placeLabel: string;
  // What they do in this turn, for the icon next to their name.
  turnStatus: PlayerTurnStatus;
  // "Drawing now", "Guessed the word" or "Gave up".
  statusLabel: string;
  // "+85" while a turn's points are shown; null otherwise.
  gainLabel: string | null;
}

export type PlayerTurnStatus = 'drawing' | 'guessed' | 'gaveUp' | 'none';

export interface RoomPresenceDeps {
  t: Translate;
  drawerId: () => string | null;
  guessedIds: () => readonly string[];
  gaveUpIds: () => readonly string[];
  gains: () => readonly TurnGain[];
}

const stackSize = 5;

// Who is at the table, in join order, with their scores. Each person is online ⇄ reconnecting.
export class RoomPresenceStore {
  members: MemberSnapshot[] = [];
  meId = '';
  readonly #deps: RoomPresenceDeps;

  constructor(deps: RoomPresenceDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get placeById(): ReadonlyMap<string, number> {
    return new Map(rankByScore(this.members, (member) => member.score).map(({ item, place }) => [item.id, place]));
  }

  get views(): PlayerView[] {
    return this.members.map((member) => this.#toView(member));
  }

  // Highest score first; equal scores share a place.
  get standings(): PlayerView[] {
    return [...this.views].sort((a, b) => a.place - b.place);
  }

  get stack(): PlayerView[] {
    return this.views.slice(0, stackSize);
  }

  get overflow(): number {
    return Math.max(0, this.members.length - stackSize);
  }

  get hasOverflow(): boolean {
    return this.overflow > 0;
  }

  get count(): number {
    return this.members.length;
  }

  get countLabel(): string {
    return this.#deps.t('people.count', { number: this.count });
  }

  get showLabel(): string {
    return this.#deps.t('people.show', { number: this.count });
  }

  get me(): PlayerView | undefined {
    return this.views.find((view) => view.isMe);
  }

  find(id: string): PlayerView | undefined {
    return this.views.find((view) => view.id === id);
  }

  receive(members: MemberSnapshot[], meId: string): void {
    this.members = members;
    this.meId = meId;
  }

  // Shows a new name before the table confirms it.
  rename(id: string, name: string): void {
    this.members = this.members.map((member) => (member.id === id ? { ...member, name } : member));
  }

  #turnStatus(memberId: string): PlayerTurnStatus {
    const { drawerId, guessedIds, gaveUpIds } = this.#deps;

    if (memberId === drawerId()) return 'drawing';

    if (guessedIds().includes(memberId)) return 'guessed';

    return gaveUpIds().includes(memberId) ? 'gaveUp' : 'none';
  }

  #toView(member: MemberSnapshot): PlayerView {
    const { t, gains } = this.#deps;
    const isMe = member.id === this.meId;
    const place = this.placeById.get(member.id) ?? this.members.length;
    const gain = gains().find((entry) => entry.memberId === member.id);
    const turnStatus = this.#turnStatus(member.id);

    return {
      id: member.id,
      name: member.name,
      initial: member.name.charAt(0).toUpperCase(),
      color: member.color,
      status: member.connected ? 'online' : 'reconnecting',
      isMe,
      note: isMe ? t('people.you') : member.connected ? '' : t('people.reconnecting'),
      score: member.score,
      scoreTitle: t('players.points', { count: member.score }),
      place,
      placeLabel: t('players.place', { place }),
      turnStatus,
      statusLabel: turnStatus === 'none' ? '' : t(`players.${turnStatus}`),
      gainLabel: gain && gain.points > 0 ? t('players.gain', { points: gain.points }) : null,
    };
  }
}
