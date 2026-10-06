import { Popover } from '@ark-ui/react/popover';
import { Switch } from '@ark-ui/react/switch';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import {
  RoomTopBarSoundPanelHint,
  RoomTopBarSoundPanelRoot,
  RoomTopBarSoundPanelSwitchControl,
  RoomTopBarSoundPanelSwitchLabel,
  RoomTopBarSoundPanelSwitchRoot,
  RoomTopBarSoundPanelSwitchText,
  RoomTopBarSoundPanelSwitchThumb,
  RoomTopBarSoundPanelTitle,
} from './styled-components';
import { RoomTopBarSoundPanelVolume } from './volume';

export const RoomTopBarSoundPanel = observer(function RoomTopBarSoundPanel(): ReactElement {
  const { locale, sound } = useRootStore();
  const { t } = locale;

  return (
    <RoomTopBarSoundPanelRoot>
      <Popover.Title asChild>
        <RoomTopBarSoundPanelTitle>{t('sound.title')}</RoomTopBarSoundPanelTitle>
      </Popover.Title>
      <RoomTopBarSoundPanelSwitchRoot checked={sound.isOn} onCheckedChange={(details) => sound.setOn(details.checked)}>
        <RoomTopBarSoundPanelSwitchText>
          <RoomTopBarSoundPanelSwitchLabel>{t('sound.drawing')}</RoomTopBarSoundPanelSwitchLabel>
          <RoomTopBarSoundPanelHint>{t('sound.hint')}</RoomTopBarSoundPanelHint>
        </RoomTopBarSoundPanelSwitchText>
        <RoomTopBarSoundPanelSwitchControl>
          <RoomTopBarSoundPanelSwitchThumb />
        </RoomTopBarSoundPanelSwitchControl>
        <Switch.HiddenInput />
      </RoomTopBarSoundPanelSwitchRoot>
      <RoomTopBarSoundPanelVolume />
    </RoomTopBarSoundPanelRoot>
  );
});
