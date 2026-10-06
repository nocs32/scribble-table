import { boardHeight, boardWidth } from '@scribble-table/protocol';
import { autorun } from 'mobx';
import { useEffect, useRef, type RefObject } from 'react';
import { BoardPainter } from '../../../../services/board-painter';
import type { RoomBoardStore } from '../../../../stores/room/board';

// The pointer's position in board units.
const toBoard = (canvas: HTMLCanvasElement, event: PointerEvent): [number, number] => {
  const rect = canvas.getBoundingClientRect();

  return [((event.clientX - rect.left) / rect.width) * boardWidth, ((event.clientY - rect.top) / rect.height) * boardHeight];
};

const listenToPointer = (canvas: HTMLCanvasElement, board: RoomBoardStore): (() => void) => {
  const down = (event: PointerEvent): void => {
    if (!board.canDraw || event.button !== 0) return;

    canvas.setPointerCapture(event.pointerId);
    board.press(...toBoard(canvas, event));
  };

  // Coalesced events: every point the pointer passed, not just one per frame.
  const move = (event: PointerEvent): void => {
    if (board.state !== 'stroking') return;

    const events = event.getCoalescedEvents();

    (events.length > 0 ? events : [event]).forEach((each) => board.drag(...toBoard(canvas, each)));
  };

  const up = (): void => board.release();

  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);

  return () => {
    canvas.removeEventListener('pointerdown', down);
    canvas.removeEventListener('pointermove', move);
    canvas.removeEventListener('pointerup', up);
    canvas.removeEventListener('pointercancel', up);
  };
};

// Paints the board's actions onto the canvas as they change, and turns the pointer into
// strokes and fills while you draw. Canvas painting and pointer capture are DOM work, so they
// live here rather than in the store.
export const useRoomStageBoardCanvas = (board: RoomBoardStore): RefObject<HTMLCanvasElement | null> => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext('2d', { willReadFrequently: true });

    if (!canvas || !context) return undefined;

    const painter = new BoardPainter(context);

    const stopPainting = autorun(() => {
      const { actions, revision } = board.drawing;

      painter.sync(actions, revision);
    });

    const stopListening = listenToPointer(canvas, board);

    return () => {
      stopPainting();
      stopListening();
      board.release();
    };
  }, [board]);

  return ref;
};
