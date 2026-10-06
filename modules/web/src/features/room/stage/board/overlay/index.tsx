import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../../stores/use-root-store';
import { RoomStageBoardOverlayChoose } from './choose';
import { RoomStageBoardOverlayPodium } from './podium';
import { RoomStageBoardOverlayReveal } from './reveal';
import { RoomStageBoardOverlayWaiting } from './waiting';

// The card over the board between drawings: picking a word, waiting for one, the reveal, the podium.
export const RoomStageBoardOverlay = observer(function RoomStageBoardOverlay(): ReactElement | null {
  const { game } = useRootStore().room;

  if (game.state === 'choosing') {
    return game.isChoosing ? <RoomStageBoardOverlayChoose /> : <RoomStageBoardOverlayWaiting />;
  }

  if (game.state === 'reveal') return <RoomStageBoardOverlayReveal />;

  return game.state === 'podium' ? <RoomStageBoardOverlayPodium /> : null;
});
