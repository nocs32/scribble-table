import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomStageHeaderCenter, RoomStageHeaderHeadline, RoomStageHeaderRoot, RoomStageHeaderRound, RoomStageHeaderSide } from './styled-components';
import { RoomStageHeaderTimer } from './timer';
import { RoomStageHeaderWord } from './word';

// Round on the left, what to do and the word in the middle, the clock on the right.
export const RoomStageHeader = observer(function RoomStageHeader(): ReactElement {
  const { game } = useRootStore().room;

  return (
    <RoomStageHeaderRoot>
      <RoomStageHeaderRound>{game.roundLabel}</RoomStageHeaderRound>
      <RoomStageHeaderCenter>
        <RoomStageHeaderHeadline>{game.headline}</RoomStageHeaderHeadline>
        {game.slots.length > 0 && <RoomStageHeaderWord />}
      </RoomStageHeaderCenter>
      <RoomStageHeaderSide>{game.clock.isRunning && <RoomStageHeaderTimer />}</RoomStageHeaderSide>
    </RoomStageHeaderRoot>
  );
});
