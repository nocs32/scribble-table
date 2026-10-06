import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { EraserIcon, PaintBucketIcon, PencilIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomStageToolsColors } from './colors';
import { RoomStageToolsHistory } from './history';
import { RoomStageToolsSizes } from './sizes';
import { RoomStageToolsButton, RoomStageToolsGroup, RoomStageToolsRoot } from './styled-components';
import { RoomStageToolsTricks } from './tricks';

// The bar under the board while you draw: tool, size and colour, then undo and clear for the
// drawer, or tricks for a saboteur.
export const RoomStageTools = observer(function RoomStageTools(): ReactElement {
  const { locale, room } = useRootStore();
  const { board, sabotage } = room;

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
      {board.isDrawer && <RoomStageToolsHistory />}
      {sabotage.canScribble && <RoomStageToolsTricks />}
    </RoomStageToolsRoot>
  );
});
