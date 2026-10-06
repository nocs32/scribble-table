import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomStageBoardNote, RoomStageBoardNotesRoot } from './styled-components';

// "Ana splatted your board", "Bo is scribbling": who's messing with the board.
export const RoomStageBoardNotes = observer(function RoomStageBoardNotes(): ReactElement | null {
  const { sabotage } = useRootStore().room;

  if (sabotage.notes.length === 0) return null;

  return (
    <RoomStageBoardNotesRoot aria-live="polite">
      {sabotage.notes.map((note) => (
        <RoomStageBoardNote key={note.id}>{note.text}</RoomStageBoardNote>
      ))}
    </RoomStageBoardNotesRoot>
  );
});
