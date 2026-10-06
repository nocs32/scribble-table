import { Popover } from '@ark-ui/react/popover';
import { Portal } from '@ark-ui/react/portal';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { VolumeIcon, VolumeOffIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTopBarSoundPanel } from './panel';
import { RoomTopBarSoundTrigger } from './styled-components';

// A small speaker in the top bar, out of the way: it opens the sound settings.
export const RoomTopBarSound = observer(function RoomTopBarSound(): ReactElement {
  const { sound } = useRootStore();

  return (
    <Popover.Root positioning={{ placement: 'bottom-end', gutter: 8 }} lazyMount>
      <RoomTopBarSoundTrigger aria-label={sound.buttonLabel} title={sound.buttonLabel} muted={!sound.isOn}>
        {sound.isOn ? <VolumeIcon /> : <VolumeOffIcon />}
      </RoomTopBarSoundTrigger>
      <Portal>
        <Popover.Positioner>
          <RoomTopBarSoundPanel />
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
});
