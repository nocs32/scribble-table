import { styled } from 'styled-system/jsx';

// On a phone the stage comes first, then players, then chat; on desktop they sit side by side.
export const RoomStageRoot = styled('section', {
  base: {
    order: '1',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: '0',
    minHeight: '0',
    overflow: 'hidden',
    borderRadius: '10px',
    border: '1px solid',
    borderColor: 'chrome.border',
    bg: 'bg.surface',
    lg: { order: '0' },
  },
});

// Where the board (or the lobby) sits. On desktop it's a size container, so the 4:3 paper can
// fit both its width and its height.
export const RoomStageArea = styled('div', {
  base: {
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    padding: '10px',
    lg: { flex: '1', minHeight: '0', containerType: 'size' },
  },
});

export const RoomStageDock = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    flexShrink: '0',
    minHeight: '58px',
    paddingInline: '8px',
    paddingBlock: '8px',
    borderTop: '1px solid',
    borderColor: 'border.subtle',
  },
});

// Next to the reactions while you guess.
export const RoomStageGiveUpButton = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: '0',
    height: '38px',
    paddingInline: '12px',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: 'border.default',
    color: 'fg.muted',
    fontSize: '14px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease, border-color 0.12s ease',
    _hover: { bg: 'bg.hover', color: 'fg.default' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    '&[data-state=open]': { bg: 'accent.tint', color: 'accent.text', borderColor: 'transparent' },
    '& svg': { width: '16px', height: '16px' },
  },
});

export const RoomStageFlightsRoot = styled('div', {
  base: { position: 'absolute', inset: '0', zIndex: '6', overflow: 'hidden', pointerEvents: 'none', containerType: 'size' },
});

export const RoomStageFlightsRise = styled('div', {
  base: {
    position: 'absolute',
    bottom: '58px',
    animation: 'emojiRise 3s cubic-bezier(0.2, 0.6, 0.3, 1) forwards',
    willChange: 'transform, opacity',
    _motionReduce: { animation: 'emojiPop 1.6s ease-out forwards' },
  },
  variants: {
    lane: {
      l1: { left: '14%' },
      l2: { left: '23%' },
      l3: { left: '32%' },
      l4: { left: '41%' },
      l5: { left: '50%' },
      l6: { left: '59%' },
      l7: { left: '68%' },
      l8: { left: '77%' },
      l9: { left: '86%' },
    },
  },
});

export const RoomStageFlightsSway = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: 'emoji',
    fontSize: '40px',
    lineHeight: '1',
    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25))',
    _motionReduce: { animation: 'none' },
  },
  variants: {
    sway: {
      gentle: { animation: 'swayGentle 1.4s ease-in-out infinite alternate' },
      wide: { animation: 'swayWide 1.1s ease-in-out infinite alternate' },
      wobbly: { animation: 'swayWobbly 0.7s ease-in-out infinite alternate' },
    },
  },
});

export const RoomStageFlightsName = styled('span', {
  base: {
    marginTop: '4px',
    paddingInline: '6px',
    borderRadius: '4px',
    bg: 'sand.1',
    color: 'fg.default',
    fontFamily: 'body',
    fontSize: '11px',
    fontWeight: '700',
  },
});
