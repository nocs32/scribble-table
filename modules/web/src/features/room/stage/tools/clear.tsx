import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { TrashIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { ConfirmPopover } from '../../../../ui';
import { RoomStageToolsButton } from './styled-components';

// Clearing the whole drawing asks first.
export const RoomStageToolsClear = observer(function RoomStageToolsClear(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { board } = room;

  return (
    <ConfirmPopover title={t('board.clearConfirm')} cancelLabel={t('board.clearNo')} confirmLabel={t('board.clearYes')} onConfirm={board.clear}>
      <RoomStageToolsButton type="button" disabled={!board.canClear} aria-label={t('board.clear')} title={t('board.clear')}>
        <TrashIcon />
      </RoomStageToolsButton>
    </ConfirmPopover>
  );
});
