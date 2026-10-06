import { Popover } from '@ark-ui/react/popover';
import { Portal } from '@ark-ui/react/portal';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { TrashIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { Button } from '../../../../ui';
import { RoomStageToolsButton, RoomStageToolsConfirm, RoomStageToolsConfirmButtons, RoomStageToolsConfirmTitle } from './styled-components';

// Clearing the whole drawing asks first.
export const RoomStageToolsClear = observer(function RoomStageToolsClear(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { board } = room;

  return (
    <Popover.Root positioning={{ placement: 'top', gutter: 10 }} lazyMount>
      <Popover.Trigger asChild>
        <RoomStageToolsButton type="button" disabled={!board.canUndo} aria-label={t('board.clear')} title={t('board.clear')}>
          <TrashIcon />
        </RoomStageToolsButton>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <RoomStageToolsConfirm>
            <Popover.Title asChild>
              <RoomStageToolsConfirmTitle>{t('board.clearConfirm')}</RoomStageToolsConfirmTitle>
            </Popover.Title>
            <RoomStageToolsConfirmButtons>
              <Popover.CloseTrigger asChild>
                <Button tone="secondary" size="sm" type="button">
                  {t('board.clearNo')}
                </Button>
              </Popover.CloseTrigger>
              <Popover.CloseTrigger asChild>
                <Button tone="danger" size="sm" type="button" onClick={board.clear}>
                  {t('board.clearYes')}
                </Button>
              </Popover.CloseTrigger>
            </RoomStageToolsConfirmButtons>
          </RoomStageToolsConfirm>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
});
