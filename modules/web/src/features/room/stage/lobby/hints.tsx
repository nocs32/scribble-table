import { Switch } from '@ark-ui/react/switch';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomStageLobbyHint, RoomStageLobbySwitchControl, RoomStageLobbySwitchLabel, RoomStageLobbySwitchRoot, RoomStageLobbySwitchText, RoomStageLobbySwitchThumb } from './styled-components';

// Letter hints on or off.
export const RoomStageLobbyHints = observer(function RoomStageLobbyHints(): ReactElement {
  const { locale, room } = useRootStore();
  const { settings } = room.game;

  return (
    <RoomStageLobbySwitchRoot checked={settings.hints} disabled={!settings.isEditable} onCheckedChange={(details) => settings.setHints(details.checked)}>
      <RoomStageLobbySwitchText>
        <RoomStageLobbySwitchLabel>{locale.t('lobby.hints')}</RoomStageLobbySwitchLabel>
        <RoomStageLobbyHint>{locale.t('lobby.hintsHint')}</RoomStageLobbyHint>
      </RoomStageLobbySwitchText>
      <RoomStageLobbySwitchControl>
        <RoomStageLobbySwitchThumb />
      </RoomStageLobbySwitchControl>
      <Switch.HiddenInput />
    </RoomStageLobbySwitchRoot>
  );
});
