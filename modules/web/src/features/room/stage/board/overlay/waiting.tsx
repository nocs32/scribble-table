import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../../stores/use-root-store';
import { Avatar } from '../../../../../ui';
import { RoomStageBoardOverlayCard, RoomStageBoardOverlayHint, RoomStageBoardOverlayRoot, RoomStageBoardOverlayTitle } from './styled-components';

// Everyone else, while the drawer picks a word.
export const RoomStageBoardOverlayWaiting = observer(function RoomStageBoardOverlayWaiting(): ReactElement {
  const { locale, room } = useRootStore();
  const { game } = room;

  return (
    <RoomStageBoardOverlayRoot>
      <RoomStageBoardOverlayCard role="status">
        {game.drawer && <Avatar initial={game.drawer.initial} color={game.drawer.color} size="lg" />}
        <RoomStageBoardOverlayTitle>{locale.t('choose.waiting', { name: game.drawerName })}</RoomStageBoardOverlayTitle>
        <RoomStageBoardOverlayHint>{locale.t('choose.waitingHint')}</RoomStageBoardOverlayHint>
      </RoomStageBoardOverlayCard>
    </RoomStageBoardOverlayRoot>
  );
});
