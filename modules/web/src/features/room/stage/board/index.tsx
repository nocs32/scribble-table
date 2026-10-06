import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { boardPixelHeight, boardPixelWidth } from '../../../../services/board-painter';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomStageBoardFlap } from './flap';
import { RoomStageBoardNotes } from './notes';
import { RoomStageBoardOverlay } from './overlay';
import { RoomStageBoardSplat } from './splat';
import { RoomStageBoardCanvas, RoomStageBoardPaper, RoomStageBoardRoot } from './styled-components';
import { useRoomStageBoardCanvas } from './use-canvas';

// The white paper everyone sees the drawing on, and the tricks that mess with it. Word choice,
// the reveal and the podium sit on top.
export const RoomStageBoard = observer(function RoomStageBoard(): ReactElement {
  const { locale, room } = useRootStore();
  const { board, sabotage } = room;
  const canvasRef = useRoomStageBoardCanvas(board);

  return (
    <RoomStageBoardRoot>
      <RoomStageBoardPaper flipped={sabotage.isFlipped} fold={sabotage.foldCorner}>
        <RoomStageBoardCanvas
          ref={canvasRef}
          width={boardPixelWidth}
          height={boardPixelHeight}
          cursor={board.cursor}
          role="img"
          aria-label={locale.t('board.label')}
        />
        {sabotage.fold && <RoomStageBoardFlap key={sabotage.fold.id} corner={sabotage.fold.corner} />}
        {sabotage.splat && <RoomStageBoardSplat key={sabotage.splat.id} splat={sabotage.splat} />}
        <RoomStageBoardOverlay />
      </RoomStageBoardPaper>
      <RoomStageBoardNotes />
    </RoomStageBoardRoot>
  );
});
