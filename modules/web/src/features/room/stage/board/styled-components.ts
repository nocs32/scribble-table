import { styled } from 'styled-system/jsx';

// The board and the notes over it. On desktop it fits the stage both ways (the stage area is a size
// container).
export const RoomStageBoardRoot = styled('div', {
  base: { position: 'relative', width: '100%', lg: { width: 'min(100cqw, calc(100cqh * 4 / 3))' } },
});

// 4:3 white paper. Tricks turn it upside down or fold a corner over.
export const RoomStageBoardPaper = styled('div', {
  base: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4 / 3',
    borderRadius: '8px',
    overflow: 'hidden',
    bg: 'board.paper',
    boxShadow: '0 0 0 1px {colors.board.edge}, 0 10px 30px rgba(0, 0, 0, 0.45)',
    transition: 'transform 0.6s cubic-bezier(0.5, 0, 0.2, 1)',
  },
  variants: {
    flipped: {
      true: { transform: 'rotate(180deg)' },
      false: {},
    },
    fold: {
      none: {},
      nw: { animation: 'foldPaperNw 7s ease-in-out forwards' },
      ne: { animation: 'foldPaperNe 7s ease-in-out forwards' },
      se: { animation: 'foldPaperSe 7s ease-in-out forwards' },
      sw: { animation: 'foldPaperSw 7s ease-in-out forwards' },
    },
  },
  defaultVariants: { flipped: false, fold: 'none' },
});

// The folded-over corner: the back of the paper, with a soft shadow where it lies on the drawing.
export const RoomStageBoardFlapRoot = styled('div', {
  base: { position: 'absolute', inset: '0', zIndex: '1', pointerEvents: 'none', filter: 'drop-shadow(2px 3px 4px rgba(0, 0, 0, 0.35))' },
});

export const RoomStageBoardFlapFace = styled('div', {
  base: { position: 'absolute', inset: '0' },
  variants: {
    corner: {
      nw: { bgImage: 'linear-gradient(to bottom right, {colors.board.flapShade} 20%, {colors.board.flap} 42%)', animation: 'foldFlapNw 7s ease-in-out forwards' },
      ne: { bgImage: 'linear-gradient(to bottom left, {colors.board.flapShade} 20%, {colors.board.flap} 42%)', animation: 'foldFlapNe 7s ease-in-out forwards' },
      se: { bgImage: 'linear-gradient(to top left, {colors.board.flapShade} 20%, {colors.board.flap} 42%)', animation: 'foldFlapSe 7s ease-in-out forwards' },
      sw: { bgImage: 'linear-gradient(to top right, {colors.board.flapShade} 20%, {colors.board.flap} 42%)', animation: 'foldFlapSw 7s ease-in-out forwards' },
    },
  },
});

// Paint over part of the board (the splat trick).
export const RoomStageBoardSplatRoot = styled('div', {
  base: {
    position: 'absolute',
    zIndex: '1',
    width: '46%',
    aspectRatio: '1',
    pointerEvents: 'none',
    animation: 'splat 6s ease-out forwards',
    '& svg': { width: '100%', height: '100%' },
  },
  variants: {
    spot: {
      nw: { left: '6%', top: '4%' },
      ne: { right: '6%', top: '4%' },
      sw: { left: '6%', bottom: '4%' },
      se: { right: '6%', bottom: '4%' },
      center: { left: '27%', top: '19%' },
    },
    ink: {
      red: { color: 'ink.red' },
      blue: { color: 'ink.blue' },
      violet: { color: 'ink.violet' },
      green: { color: 'ink.green' },
      orange: { color: 'ink.orange' },
    },
  },
});

// Who got you and who is scribbling, over the board's top left. Outside the paper, so they stay
// upright when it flips.
export const RoomStageBoardNotesRoot = styled('div', {
  base: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    right: '10px',
    zIndex: '3',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '6px',
    pointerEvents: 'none',
  },
});

export const RoomStageBoardNote = styled('p', {
  base: {
    paddingInline: '10px',
    paddingBlock: '4px',
    borderRadius: 'full',
    bg: 'bg.surface',
    color: 'fg.default',
    fontSize: '13px',
    fontWeight: '700',
    boxShadow: 'floating',
    animation: 'dialogIn 0.2s ease-out',
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
