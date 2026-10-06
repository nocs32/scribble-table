import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomStageLobbyChoices } from './choices';
import { RoomStageLobbyHints } from './hints';
import { RoomStageLobbySlider } from './slider';
import { RoomStageLobbyStart } from './start';
import { RoomStageLobbyCard, RoomStageLobbyHead, RoomStageLobbyRoot, RoomStageLobbySubtitle, RoomStageLobbyTitle } from './styled-components';
import { RoomStageLobbyWords } from './words';

// Before a game: the shared settings card, in place of the board.
export const RoomStageLobby = observer(function RoomStageLobby(): ReactElement {
  const { locale, room } = useRootStore();
  const { settings } = room.game;

  return (
    <RoomStageLobbyRoot>
      <RoomStageLobbyCard>
        <RoomStageLobbyHead>
          <RoomStageLobbyTitle>{locale.t('lobby.title')}</RoomStageLobbyTitle>
          <RoomStageLobbySubtitle>{locale.t('lobby.subtitle')}</RoomStageLobbySubtitle>
        </RoomStageLobbyHead>
        <RoomStageLobbySlider
          label={locale.t('lobby.rounds')}
          valueText={settings.roundsLabel}
          value={settings.rounds}
          range={settings.limits.rounds}
          step={1}
          disabled={!settings.isEditable}
          onPreview={settings.previewRounds}
          onCommit={settings.commitSliders}
        />
        <RoomStageLobbySlider
          label={locale.t('lobby.drawTime')}
          valueText={settings.drawTimeLabel}
          value={settings.drawSeconds}
          range={settings.limits.drawSeconds}
          step={settings.limits.drawSeconds.step}
          disabled={!settings.isEditable}
          onPreview={settings.previewDrawSeconds}
          onCommit={settings.commitSliders}
        />
        <RoomStageLobbyChoices />
        <RoomStageLobbyHints />
        <RoomStageLobbyWords />
        <RoomStageLobbyStart />
      </RoomStageLobbyCard>
    </RoomStageLobbyRoot>
  );
});
