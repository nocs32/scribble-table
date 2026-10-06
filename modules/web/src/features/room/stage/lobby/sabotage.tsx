import { Switch } from '@ark-ui/react/switch';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomStageLobbyHint, RoomStageLobbySwitchControl, RoomStageLobbySwitchLabel, RoomStageLobbySwitchRoot, RoomStageLobbySwitchText, RoomStageLobbySwitchThumb } from './styled-components';

// Sabotage on or off: players who guessed scribble on the board and play tricks.
export const RoomStageLobbySabotage = observer(function RoomStageLobbySabotage(): ReactElement {
  const { locale, room } = useRootStore();
  const { settings } = room.game;

  return (
    <RoomStageLobbySwitchRoot checked={settings.sabotage} disabled={!settings.isEditable} onCheckedChange={(details) => settings.setSabotage(details.checked)}>
      <RoomStageLobbySwitchText>
        <RoomStageLobbySwitchLabel>{locale.t('lobby.sabotage')}</RoomStageLobbySwitchLabel>
        <RoomStageLobbyHint>{locale.t('lobby.sabotageHint')}</RoomStageLobbyHint>
      </RoomStageLobbySwitchText>
      <RoomStageLobbySwitchControl>
        <RoomStageLobbySwitchThumb />
      </RoomStageLobbySwitchControl>
      <Switch.HiddenInput />
    </RoomStageLobbySwitchRoot>
  );
});
