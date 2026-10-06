import { styled } from 'styled-system/jsx';

// A veil over the paper with a card in the middle.
export const RoomStageBoardOverlayRoot = styled('div', {
  base: {
    position: 'absolute',
    inset: '0',
    zIndex: '2',
    display: 'grid',
    placeItems: 'center',
    padding: '12px',
    overflowY: 'auto',
    bg: 'board.veil',
    animation: 'fadeIn 0.2s ease-out',
  },
});

export const RoomStageBoardOverlayCard = styled('section', {
  base: {
    display: 'grid',
    justifyItems: 'center',
    gap: '8px',
    width: '100%',
    maxWidth: '440px',
    paddingInline: '22px',
    paddingBlock: '20px',
    borderRadius: '14px',
    bg: 'bg.surface',
    boxShadow: 'dialog',
    textAlign: 'center',
    animation: 'dialogIn 0.25s ease-out',
  },
  variants: {
    wide: {
      true: { maxWidth: '560px' },
      false: {},
    },
  },
  defaultVariants: { wide: false },
});

export const RoomStageBoardOverlayTitle = styled('h2', {
  base: { fontSize: '20px', fontWeight: '900', letterSpacing: '-0.01em', textWrap: 'balance' },
});

export const RoomStageBoardOverlayHint = styled('p', {
  base: { fontSize: '13px', fontWeight: '700', color: 'fg.muted' },
});

export const RoomStageBoardOverlayChoices = styled('div', {
  base: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '8px' },
});

export const RoomStageBoardOverlayChoice = styled('button', {
  base: {
    display: 'grid',
    justifyItems: 'center',
    gap: '6px',
    minWidth: '112px',
    paddingInline: '14px',
    paddingBlock: '12px',
    borderRadius: '10px',
    border: '1px solid',
    borderColor: 'border.default',
    bg: 'bg.subtle',
    cursor: 'pointer',
    transition: 'transform 0.12s ease, border-color 0.12s ease',
    _hover: { transform: 'translateY(-2px)', borderColor: 'accent.default' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
  },
  variants: {
    difficulty: {
      easy: { '& > span:last-child': { bg: 'success.tint', color: 'success.text' } },
      medium: { '& > span:last-child': { bg: 'bg.muted', color: 'fg.muted' } },
      hard: { '& > span:last-child': { bg: 'accent.tint', color: 'accent.text' } },
    },
  },
});

export const RoomStageBoardOverlayChoiceWord = styled('span', {
  base: { fontSize: '18px', fontWeight: '900' },
});

export const RoomStageBoardOverlayChoiceLevel = styled('span', {
  base: { paddingInline: '8px', borderRadius: 'full', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' },
});

export const RoomStageBoardOverlayWord = styled('p', {
  base: { fontSize: '32px', fontWeight: '900', letterSpacing: '-0.01em', lineHeight: '1.1', overflowWrap: 'anywhere' },
});

export const RoomStageBoardOverlayAlso = styled('p', {
  base: { marginTop: '-4px', fontSize: '13px', color: 'fg.subtle' },
});

export const RoomStageBoardOverlayGains = styled('ul', {
  base: { display: 'grid', gap: '4px', width: '100%', maxWidth: '280px', marginTop: '6px' },
});

export const RoomStageBoardOverlayGain = styled('li', {
  base: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', textAlign: 'left' },
});

export const RoomStageBoardOverlayGainName = styled('span', {
  base: { flex: '1', minWidth: '0', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export const RoomStageBoardOverlayGainNote = styled('span', {
  base: { marginLeft: '6px', fontWeight: '400', color: 'fg.subtle' },
});

export const RoomStageBoardOverlayGainPoints = styled('span', {
  base: { fontWeight: '900', color: 'success.text', fontVariantNumeric: 'tabular-nums' },
});

export const RoomStageBoardOverlayCrown = styled('span', {
  base: { display: 'inline-flex', color: 'medal.gold', '& svg': { width: '32px', height: '32px' } },
});

export const RoomStageBoardOverlayPlaces = styled('div', {
  base: { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '10px', width: '100%', marginBlock: '10px' },
});

export const RoomStageBoardOverlayPodiumPlaceRoot = styled('div', {
  base: { display: 'grid', justifyItems: 'center', gap: '4px', width: '120px', minWidth: '0', animation: 'podiumRise 0.5s ease-out backwards' },
  variants: {
    medal: {
      gold: { order: '2', animationDelay: '0.3s' },
      silver: { order: '1', animationDelay: '0.15s' },
      bronze: { order: '3' },
    },
  },
});

export const RoomStageBoardOverlayPodiumPlaceName = styled('span', {
  base: { maxWidth: '100%', fontSize: '14px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export const RoomStageBoardOverlayPodiumPlaceScore = styled('span', {
  base: { fontSize: '13px', fontWeight: '900', color: 'fg.muted', fontVariantNumeric: 'tabular-nums' },
});

export const RoomStageBoardOverlayPodiumPlaceBlock = styled('span', {
  base: {
    display: 'grid',
    placeItems: 'center',
    width: '100%',
    borderTopRadius: '8px',
    color: 'sand.1',
    fontSize: '18px',
    fontWeight: '900',
  },
  variants: {
    medal: {
      gold: { height: '88px', bg: 'medal.gold' },
      silver: { height: '64px', bg: 'medal.silver' },
      bronze: { height: '48px', bg: 'medal.bronze' },
    },
  },
});

export const RoomStageBoardOverlayOthers = styled('ol', {
  base: { display: 'grid', gap: '2px', width: '100%', maxWidth: '280px', marginBottom: '8px' },
});

export const RoomStageBoardOverlayOther = styled('li', {
  base: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' },
});

export const RoomStageBoardOverlayOtherPlace = styled('span', {
  base: { width: '28px', fontSize: '12px', fontWeight: '700', color: 'fg.subtle' },
});

export const RoomStageBoardOverlayOtherScore = styled('span', {
  base: { marginLeft: 'auto', fontWeight: '900', fontVariantNumeric: 'tabular-nums' },
});
