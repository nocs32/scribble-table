import { styled } from 'styled-system/jsx';

// 4:3 white paper. On desktop it fits the stage both ways (the stage area is a size container).
export const RoomStageBoardPaper = styled('div', {
  base: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4 / 3',
    borderRadius: '8px',
    overflow: 'hidden',
    bg: 'board.paper',
    boxShadow: '0 0 0 1px {colors.board.edge}, 0 10px 30px rgba(0, 0, 0, 0.45)',
    lg: { width: 'min(100cqw, calc(100cqh * 4 / 3))' },
  },
});

export const RoomStageBoardCanvas = styled('canvas', {
  base: { display: 'block', width: '100%', height: '100%', touchAction: 'none', userSelect: 'none' },
  variants: {
    cursor: {
      none: { cursor: 'default' },
      brush: { cursor: 'crosshair' },
      fill: { cursor: 'cell' },
    },
  },
  defaultVariants: { cursor: 'none' },
});
