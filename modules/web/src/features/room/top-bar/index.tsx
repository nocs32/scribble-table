import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { LinkIcon, LogoMark } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTopBarDemo } from './demo';
import { RoomTopBarLink } from './link';
import { RoomTopBarPeople } from './people';
import { RoomTopBarSound } from './sound';
import {
  RoomTopBarBrand,
  RoomTopBarEnd,
  RoomTopBarLanguage,
  RoomTopBarRoot,
  RoomTopBarShare,
  RoomTopBarShareLabel,
  RoomTopBarStart,
} from './styled-components';

export const RoomTopBar = observer(function RoomTopBar(): ReactElement {
  const { locale, room } = useRootStore();

  return (
    <RoomTopBarRoot>
      <RoomTopBarStart>
        <RoomTopBarBrand>
          <LogoMark />
          Scribble Table
        </RoomTopBarBrand>
        <RoomTopBarDemo />
      </RoomTopBarStart>
      <RoomTopBarLink />
      <RoomTopBarEnd>
        <RoomTopBarPeople />
        <RoomTopBarSound />
        <RoomTopBarLanguage type="button" aria-label={locale.toggleLabel} title={locale.toggleLabel} onClick={locale.toggle}>
          {locale.code}
        </RoomTopBarLanguage>
        <RoomTopBarShare type="button" onClick={room.share.copy}>
          <LinkIcon />
          <RoomTopBarShareLabel>{room.share.shareLabel}</RoomTopBarShareLabel>
        </RoomTopBarShare>
      </RoomTopBarEnd>
    </RoomTopBarRoot>
  );
});
