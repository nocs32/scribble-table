import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CrownIcon, PlayAgainIcon } from '../../../../../assets';
import { useRootStore } from '../../../../../stores/use-root-store';
import { Button } from '../../../../../ui';
import { RoomStageBoardOverlayPodiumPlace } from './podium-place';
import {
  RoomStageBoardOverlayCard,
  RoomStageBoardOverlayCrown,
  RoomStageBoardOverlayOther,
  RoomStageBoardOverlayOtherPlace,
  RoomStageBoardOverlayOtherScore,
  RoomStageBoardOverlayOthers,
  RoomStageBoardOverlayPlaces,
  RoomStageBoardOverlayRoot,
  RoomStageBoardOverlayTitle,
} from './styled-components';

// The end of the game: the top three on a podium, everyone else below, and Play again.
export const RoomStageBoardOverlayPodium = observer(function RoomStageBoardOverlayPodium(): ReactElement {
  const { locale, room } = useRootStore();
  const { game } = room;
  const { podium } = game;

  return (
    <RoomStageBoardOverlayRoot>
      <RoomStageBoardOverlayCard wide role="status">
        <RoomStageBoardOverlayCrown>
          <CrownIcon />
        </RoomStageBoardOverlayCrown>
        <RoomStageBoardOverlayTitle>{podium.title}</RoomStageBoardOverlayTitle>
        <RoomStageBoardOverlayPlaces>
          {podium.places.map((place) => (
            <RoomStageBoardOverlayPodiumPlace key={place.player.id} place={place} />
          ))}
        </RoomStageBoardOverlayPlaces>
        {podium.others.length > 0 && (
          <RoomStageBoardOverlayOthers>
            {podium.others.map((player) => (
              <RoomStageBoardOverlayOther key={player.id}>
                <RoomStageBoardOverlayOtherPlace>{player.placeLabel}</RoomStageBoardOverlayOtherPlace>
                {player.name}
                <RoomStageBoardOverlayOtherScore>{player.score}</RoomStageBoardOverlayOtherScore>
              </RoomStageBoardOverlayOther>
            ))}
          </RoomStageBoardOverlayOthers>
        )}
        <Button tone="primary" type="button" onClick={game.playAgain}>
          <PlayAgainIcon />
          {locale.t('podium.playAgain')}
        </Button>
      </RoomStageBoardOverlayCard>
    </RoomStageBoardOverlayRoot>
  );
});
