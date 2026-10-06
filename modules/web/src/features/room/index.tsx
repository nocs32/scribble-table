import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../stores/use-root-store';
import { RoomChat } from './chat';
import { RoomPlayers } from './players';
import { RoomStage } from './stage';
import { RoomStatus } from './status';
import { RoomBody, RoomRoot } from './styled-components';
import { RoomTopBar } from './top-bar';

// The whole page: the top bar, then players, the stage (board, word, timer) and the chat.
// Until the table is open, a status card stands in for all of it.
export const Room = observer(function Room(): ReactElement {
  const { room } = useRootStore();

  if (!room.isOpen) {
    return <RoomStatus />;
  }

  return (
    <RoomRoot>
      <RoomTopBar />
      <RoomBody>
        <RoomPlayers />
        <RoomStage />
        <RoomChat />
      </RoomBody>
    </RoomRoot>
  );
});
