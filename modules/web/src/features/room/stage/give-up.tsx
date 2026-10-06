import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { FlagIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { ConfirmPopover } from '../../../ui';
import { RoomStageGiveUpButton } from './styled-components';

// For a guesser who can't get it and would rather not wait for the clock: it asks first, then
// shows them the word for no points.
export const RoomStageGiveUp = observer(function RoomStageGiveUp(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;

  return (
    <ConfirmPopover title={t('giveUp.title')} note={t('giveUp.note')} cancelLabel={t('giveUp.keep')} confirmLabel={t('giveUp.confirm')} onConfirm={room.game.giveUp}>
      <RoomStageGiveUpButton type="button">
        <FlagIcon />
        {t('giveUp.button')}
      </RoomStageGiveUpButton>
    </ConfirmPopover>
  );
});
