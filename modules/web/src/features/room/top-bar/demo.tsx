import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { FlaskIcon, PencilIcon, SkipIcon, UserMinusIcon, UserPlusIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTopBarDemoButton, RoomTopBarDemoLabel, RoomTopBarDemoRoot } from './styled-components';

// Only on the demo table: move the game along and change who's playing, for trying it alone.
export const RoomTopBarDemo = observer(function RoomTopBarDemo(): ReactElement | null {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { demo } = room;

  if (!demo) return null;

  return (
    <RoomTopBarDemoRoot role="toolbar" aria-label={t('demo.title')}>
      <RoomTopBarDemoLabel title={t('demo.hint')}>
        <FlaskIcon />
        {t('demo.title')}
      </RoomTopBarDemoLabel>
      <RoomTopBarDemoButton type="button" onClick={demo.skip} aria-label={t('demo.skip')} title={t('demo.skip')}>
        <SkipIcon />
      </RoomTopBarDemoButton>
      <RoomTopBarDemoButton type="button" onClick={demo.drawNext} aria-label={t('demo.drawNext')} title={t('demo.drawNext')}>
        <PencilIcon />
      </RoomTopBarDemoButton>
      <RoomTopBarDemoButton type="button" onClick={demo.addPlayer} aria-label={t('demo.addPlayer')} title={t('demo.addPlayer')}>
        <UserPlusIcon />
      </RoomTopBarDemoButton>
      <RoomTopBarDemoButton type="button" onClick={demo.removePlayer} aria-label={t('demo.removePlayer')} title={t('demo.removePlayer')}>
        <UserMinusIcon />
      </RoomTopBarDemoButton>
    </RoomTopBarDemoRoot>
  );
});
