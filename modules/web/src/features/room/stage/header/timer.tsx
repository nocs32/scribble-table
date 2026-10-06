import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { TimerIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomStageHeaderTimerRoot } from './styled-components';

// Seconds left in this phase; it pulses in the last ten.
export const RoomStageHeaderTimer = observer(function RoomStageHeaderTimer(): ReactElement {
  const { game } = useRootStore().room;

  return (
    <RoomStageHeaderTimerRoot role="timer" aria-label={game.timerLabel} title={game.timerLabel} urgent={game.clock.isUrgent}>
      <TimerIcon />
      {game.clock.secondsLeft}
    </RoomStageHeaderTimerRoot>
  );
});
