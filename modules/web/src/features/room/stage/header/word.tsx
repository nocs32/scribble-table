import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomStageHeaderWordLength, RoomStageHeaderWordRoot, RoomStageHeaderWordSlot } from './styled-components';

// The word spelled out on lines, like hangman: blanks for hidden letters, which fill in as
// hints arrive, and the whole word once you know it.
export const RoomStageHeaderWord = observer(function RoomStageHeaderWord(): ReactElement {
  const { game } = useRootStore().room;

  return (
    <RoomStageHeaderWordRoot aria-label={game.wordLabel}>
      {game.slots.map((slot) => (
        <RoomStageHeaderWordSlot key={slot.key} kind={slot.kind} aria-hidden>
          {slot.kind === 'hidden' ? '' : slot.char}
        </RoomStageHeaderWordSlot>
      ))}
      {game.lengthLabel && <RoomStageHeaderWordLength aria-hidden>{game.lengthLabel}</RoomStageHeaderWordLength>}
    </RoomStageHeaderWordRoot>
  );
});
