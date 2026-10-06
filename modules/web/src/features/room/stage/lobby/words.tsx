import { Switch } from '@ark-ui/react/switch';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import {
  RoomStageLobbyField,
  RoomStageLobbyFieldHead,
  RoomStageLobbyHint,
  RoomStageLobbyLabel,
  RoomStageLobbySwitchControl,
  RoomStageLobbySwitchLabel,
  RoomStageLobbySwitchRoot,
  RoomStageLobbySwitchText,
  RoomStageLobbySwitchThumb,
  RoomStageLobbyTextarea,
  RoomStageLobbyValue,
} from './styled-components';

// Your own words, mixed in with ours, or used on their own once there are enough of them.
export const RoomStageLobbyWords = observer(function RoomStageLobbyWords(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { settings } = room.game;

  return (
    <RoomStageLobbyField>
      <RoomStageLobbyFieldHead>
        <RoomStageLobbyLabel htmlFor="custom-words">{t('lobby.customWords')}</RoomStageLobbyLabel>
        <RoomStageLobbyValue>{settings.wordCountLabel}</RoomStageLobbyValue>
      </RoomStageLobbyFieldHead>
      <RoomStageLobbyTextarea
        id="custom-words"
        rows={2}
        value={settings.wordsDraft}
        placeholder={t('lobby.customWordsPlaceholder')}
        disabled={!settings.isEditable}
        onChange={(event) => settings.typeWords(event.target.value)}
        onBlur={settings.commitWords}
      />
      <RoomStageLobbyHint>{t('lobby.customWordsHint')}</RoomStageLobbyHint>
      <RoomStageLobbySwitchRoot checked={settings.onlyCustomWords} disabled={!settings.canUseOnlyCustom} onCheckedChange={(details) => settings.setOnlyCustom(details.checked)}>
        <RoomStageLobbySwitchText>
          <RoomStageLobbySwitchLabel>{t('lobby.onlyCustom')}</RoomStageLobbySwitchLabel>
          <RoomStageLobbyHint>{settings.onlyCustomHint}</RoomStageLobbyHint>
        </RoomStageLobbySwitchText>
        <RoomStageLobbySwitchControl>
          <RoomStageLobbySwitchThumb />
        </RoomStageLobbySwitchControl>
        <Switch.HiddenInput />
      </RoomStageLobbySwitchRoot>
    </RoomStageLobbyField>
  );
});
