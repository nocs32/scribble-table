import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { EraserIcon, PaintBucketIcon, PencilIcon, UndoIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomStageToolsClear } from './clear';
import { RoomStageToolsColors } from './colors';
import { RoomStageToolsSizes } from './sizes';
import { RoomStageToolsButton, RoomStageToolsGroup, RoomStageToolsRoot } from './styled-components';

// The drawer's bar under the board: tool, size, colour, undo and clear.
export const RoomStageTools = observer(function RoomStageTools(): ReactElement {
  const { locale, room } = useRootStore();
  const { board } = room;

  return (
    <RoomStageToolsRoot role="toolbar" aria-label={locale.t('board.tools')}>
      <RoomStageToolsGroup>
        {board.toolViews.map((view) => (
          <RoomStageToolsButton
            key={view.tool}
            type="button"
            aria-pressed={view.isSelected}
            aria-label={view.label}
            title={view.label}
            onClick={() => board.selectTool(view.tool)}
          >
            {view.tool === 'brush' && <PencilIcon />}
            {view.tool === 'eraser' && <EraserIcon />}
            {view.tool === 'fill' && <PaintBucketIcon />}
          </RoomStageToolsButton>
        ))}
      </RoomStageToolsGroup>
      <RoomStageToolsSizes />
      <RoomStageToolsColors />
      <RoomStageToolsGroup>
        <RoomStageToolsButton type="button" disabled={!board.canUndo} aria-label={locale.t('board.undo')} title={locale.t('board.undo')} onClick={board.undo}>
          <UndoIcon />
        </RoomStageToolsButton>
        <RoomStageToolsClear />
      </RoomStageToolsGroup>
    </RoomStageToolsRoot>
  );
});
