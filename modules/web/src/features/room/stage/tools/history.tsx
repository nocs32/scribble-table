import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { UndoIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomStageToolsClear } from './clear';
import { RoomStageToolsButton, RoomStageToolsGroup } from './styled-components';

// The drawer's undo (their own lines only) and clear.
export const RoomStageToolsHistory = observer(function RoomStageToolsHistory(): ReactElement {
  const { locale, room } = useRootStore();
  const { board } = room;

  return (
    <RoomStageToolsGroup>
      <RoomStageToolsButton type="button" disabled={!board.canUndo} aria-label={locale.t('board.undo')} title={locale.t('board.undo')} onClick={board.undo}>
        <UndoIcon />
      </RoomStageToolsButton>
      <RoomStageToolsClear />
    </RoomStageToolsGroup>
  );
});
