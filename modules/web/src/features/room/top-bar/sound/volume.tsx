import { Slider } from '@ark-ui/react/slider';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import {
  RoomTopBarSoundPanelVolumeControl,
  RoomTopBarSoundPanelVolumeHead,
  RoomTopBarSoundPanelVolumeLabel,
  RoomTopBarSoundPanelVolumeRange,
  RoomTopBarSoundPanelVolumeRoot,
  RoomTopBarSoundPanelVolumeThumb,
  RoomTopBarSoundPanelVolumeTrack,
  RoomTopBarSoundPanelVolumeValue,
} from './styled-components';

// Letting go plays a short pencil line at the new volume.
export const RoomTopBarSoundPanelVolume = observer(function RoomTopBarSoundPanelVolume(): ReactElement {
  const { locale, sound } = useRootStore();

  return (
    <RoomTopBarSoundPanelVolumeRoot
      value={[sound.volume]}
      min={0}
      max={100}
      step={5}
      disabled={!sound.isOn}
      onValueChange={(details) => sound.previewVolume(details.value)}
      onValueChangeEnd={sound.commitVolume}
    >
      <RoomTopBarSoundPanelVolumeHead>
        <Slider.Label asChild>
          <RoomTopBarSoundPanelVolumeLabel>{locale.t('sound.volume')}</RoomTopBarSoundPanelVolumeLabel>
        </Slider.Label>
        <RoomTopBarSoundPanelVolumeValue>{sound.volumeText}</RoomTopBarSoundPanelVolumeValue>
      </RoomTopBarSoundPanelVolumeHead>
      <RoomTopBarSoundPanelVolumeControl>
        <RoomTopBarSoundPanelVolumeTrack>
          <RoomTopBarSoundPanelVolumeRange />
        </RoomTopBarSoundPanelVolumeTrack>
        <RoomTopBarSoundPanelVolumeThumb index={0}>
          <Slider.HiddenInput />
        </RoomTopBarSoundPanelVolumeThumb>
      </RoomTopBarSoundPanelVolumeControl>
    </RoomTopBarSoundPanelVolumeRoot>
  );
});
