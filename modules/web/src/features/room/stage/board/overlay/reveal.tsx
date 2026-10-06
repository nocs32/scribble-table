import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../../stores/use-root-store';
import { Avatar } from '../../../../../ui';
import {
  RoomStageBoardOverlayAlso,
  RoomStageBoardOverlayCard,
  RoomStageBoardOverlayGain,
  RoomStageBoardOverlayGainName,
  RoomStageBoardOverlayGainNote,
  RoomStageBoardOverlayGainPoints,
  RoomStageBoardOverlayGains,
  RoomStageBoardOverlayHint,
  RoomStageBoardOverlayRoot,
  RoomStageBoardOverlayWord,
} from './styled-components';

// After a turn: why it ended, the word (in your language, and the other one that also counted),
// and who scored what.
export const RoomStageBoardOverlayReveal = observer(function RoomStageBoardOverlayReveal(): ReactElement | null {
  const { locale, room } = useRootStore();
  const view = room.game.revealView;

  if (!view) return null;

  return (
    <RoomStageBoardOverlayRoot>
      <RoomStageBoardOverlayCard role="status">
        <RoomStageBoardOverlayHint>{view.reasonLabel}</RoomStageBoardOverlayHint>
        <RoomStageBoardOverlayHint>{locale.t('game.wordWas')}</RoomStageBoardOverlayHint>
        <RoomStageBoardOverlayWord>{view.word}</RoomStageBoardOverlayWord>
        {view.alsoCounts && <RoomStageBoardOverlayAlso>{view.alsoCounts}</RoomStageBoardOverlayAlso>}
        <RoomStageBoardOverlayGains>
          {view.gains.map((gain) => (
            <RoomStageBoardOverlayGain key={gain.id}>
              <Avatar initial={gain.initial} color={gain.color} size="sm" />
              <RoomStageBoardOverlayGainName>
                {gain.name}
                {gain.note && <RoomStageBoardOverlayGainNote>{gain.note}</RoomStageBoardOverlayGainNote>}
              </RoomStageBoardOverlayGainName>
              <RoomStageBoardOverlayGainPoints>{gain.pointsLabel}</RoomStageBoardOverlayGainPoints>
            </RoomStageBoardOverlayGain>
          ))}
        </RoomStageBoardOverlayGains>
      </RoomStageBoardOverlayCard>
    </RoomStageBoardOverlayRoot>
  );
});
