import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { boardPixelHeight, boardPixelWidth } from '../../../../services/board-painter';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomStageBoardOverlay } from './overlay';
import { RoomStageBoardCanvas, RoomStageBoardPaper } from './styled-components';
import { useRoomStageBoardCanvas } from './use-canvas';

// The white paper everyone sees the drawing on. Word choice, the reveal and the podium sit on top.
export const RoomStageBoard = observer(function RoomStageBoard(): ReactElement {
  const { locale, room } = useRootStore();
  const canvasRef = useRoomStageBoardCanvas(room.board);

  return (
    <RoomStageBoardPaper>
      <RoomStageBoardCanvas
        ref={canvasRef}
        width={boardPixelWidth}
        height={boardPixelHeight}
        cursor={room.board.cursor}
        role="img"
        aria-label={locale.t('board.label')}
      />
      <RoomStageBoardOverlay />
    </RoomStageBoardPaper>
  );
});
