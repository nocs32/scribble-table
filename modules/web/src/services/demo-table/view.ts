import type { TableSecret, TableSnapshot } from '@scribble-table/protocol';
import type { DemoFeed } from './feed';
import type { DemoTurn } from './turn';
import type { DemoTableState, DemoWord } from './types';

export interface DemoView {
  state: DemoTableState;
  turn: DemoTurn | null;
  choices: readonly DemoWord[];
  feed: DemoFeed;
  now: number;
}

// The table as one person sees it: the word shows only as a mask, and guessed chat only to
// those who may read it.
export const snapshotFor = ({ state, turn, feed, now }: DemoView, viewerId: string): TableSnapshot => ({
  members: state.members.map(({ id, name, color, connected, score }) => ({ id, name, color, connected, score })),
  game: {
    phase: state.phase,
    settings: state.settings,
    round: state.round,
    turnId: state.turnId,
    drawerId: state.drawerId,
    masks: state.phase === 'drawing' && turn ? turn.masks(now) : null,
    endsAt: state.endsAt,
    guessedIds: turn ? turn.guesses.map((guess) => guess.memberId) : [],
    gaveUpIds: turn ? [...turn.gaveUpIds] : [],
    reveal: state.reveal,
  },
  feed: feed.visibleTo(viewerId),
});

// The words to choose from go to the drawer; the word itself to the drawer and to whoever got
// it or gave up.
export const secretFor = ({ state, turn, choices }: DemoView, viewerId: string): TableSecret => {
  const isDrawer = state.drawerId === viewerId;
  const knowsWord = state.phase === 'drawing' && turn !== null && turn.knowsWord(viewerId);

  return {
    choices: state.phase === 'choosing' && isDrawer ? choices.map(({ forms, difficulty }) => ({ forms, difficulty })) : null,
    word: knowsWord ? turn.word.forms : null,
  };
};
