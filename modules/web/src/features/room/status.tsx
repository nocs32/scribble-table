import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { LogoMark, SpinnerIcon } from '../../assets';
import { useRootStore } from '../../stores/use-root-store';
import { RoomStatusCard, RoomStatusLogo, RoomStatusRoot, RoomStatusSpinner, RoomStatusTitle } from './styled-components';

// While the table opens.
export const RoomStatus = observer(function RoomStatus(): ReactElement {
  const { locale } = useRootStore();

  return (
    <RoomStatusRoot>
      <RoomStatusCard role="status">
        <RoomStatusLogo>
          <LogoMark />
        </RoomStatusLogo>
        <RoomStatusTitle>{locale.t('status.connecting')}</RoomStatusTitle>
        <RoomStatusSpinner>
          <SpinnerIcon />
        </RoomStatusSpinner>
      </RoomStatusCard>
    </RoomStatusRoot>
  );
});
