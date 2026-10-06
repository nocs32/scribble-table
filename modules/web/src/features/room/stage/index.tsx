import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomStageBoard } from './board';
import { RoomStageFlights } from './flights';
import { RoomStageHeader } from './header';
import { RoomStageLobby } from './lobby';
import { RoomStageReactions } from './reactions';
import { RoomStageArea, RoomStageDock, RoomStageRoot } from './styled-components';
import { RoomStageTools } from './tools';

// The middle of the page: the word and the clock on top, the board (or the lobby's settings),
// and under it the drawing tools while you draw, or the reactions.
export const RoomStage = observer(function RoomStage(): ReactElement {
  const { game, board } = useRootStore().room;

  return (
    <RoomStageRoot>
      <RoomStageHeader />
      <RoomStageArea>{game.state === 'lobby' ? <RoomStageLobby /> : <RoomStageBoard />}</RoomStageArea>
      <RoomStageDock>{board.canDraw ? <RoomStageTools /> : <RoomStageReactions />}</RoomStageDock>
      <RoomStageFlights />
    </RoomStageRoot>
  );
});
