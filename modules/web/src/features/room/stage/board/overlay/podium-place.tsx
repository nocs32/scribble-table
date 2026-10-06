import type { ReactElement } from 'react';
import type { PodiumPlaceView } from '../../../../../stores/room/game';
import { Avatar } from '../../../../../ui';
import {
  RoomStageBoardOverlayPodiumPlaceBlock,
  RoomStageBoardOverlayPodiumPlaceName,
  RoomStageBoardOverlayPodiumPlaceRoot,
  RoomStageBoardOverlayPodiumPlaceScore,
} from './styled-components';

interface RoomStageBoardOverlayPodiumPlaceProps {
  place: PodiumPlaceView;
}

// One step of the podium: silver, gold and bronze stand left to right.
export function RoomStageBoardOverlayPodiumPlace({ place }: RoomStageBoardOverlayPodiumPlaceProps): ReactElement {
  const { player, medal } = place;

  return (
    <RoomStageBoardOverlayPodiumPlaceRoot medal={medal}>
      <Avatar initial={player.initial} color={player.color} size="lg" />
      <RoomStageBoardOverlayPodiumPlaceName>{player.name}</RoomStageBoardOverlayPodiumPlaceName>
      <RoomStageBoardOverlayPodiumPlaceScore title={player.scoreTitle}>{player.score}</RoomStageBoardOverlayPodiumPlaceScore>
      <RoomStageBoardOverlayPodiumPlaceBlock medal={medal}>{player.placeLabel}</RoomStageBoardOverlayPodiumPlaceBlock>
    </RoomStageBoardOverlayPodiumPlaceRoot>
  );
}
