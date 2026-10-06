import { styled } from 'styled-system/jsx';

export const RoomRoot = styled('div', {
  base: {
    display: 'grid',
    gridTemplateRows: '44px minmax(0, 1fr)',
    height: '100dvh',
    bg: 'chrome.app',
    color: 'fg.default',
  },
});

// Desktop: players | stage | chat. Narrower: the stage on top, then players, then chat, scrolling.
export const RoomBody = styled('main', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minHeight: '0',
    paddingInline: '6px',
    paddingBottom: '6px',
    overflowY: 'auto',
    lg: {
      display: 'grid',
      gridTemplateColumns: '230px minmax(0, 1fr) 320px',
      overflowY: 'hidden',
    },
  },
});

// Instead of the table, while it opens.
export const RoomStatusRoot = styled('main', {
  base: { display: 'grid', placeItems: 'center', minHeight: '100dvh', padding: '24px', bg: 'chrome.app', color: 'fg.default' },
});

export const RoomStatusCard = styled('section', {
  base: {
    display: 'grid',
    justifyItems: 'center',
    gap: '12px',
    width: '100%',
    maxWidth: '400px',
    padding: '28px',
    borderRadius: '14px',
    border: '1px solid',
    borderColor: 'chrome.border',
    bg: 'bg.surface',
    boxShadow: 'floating',
    textAlign: 'center',
    animation: 'dialogIn 0.25s ease-out',
  },
});

export const RoomStatusLogo = styled('span', {
  base: { display: 'inline-flex', marginBottom: '4px', '& svg': { width: '44px', height: '44px' } },
});

export const RoomStatusTitle = styled('h1', {
  base: { fontSize: '20px', fontWeight: '900', letterSpacing: '-0.01em' },
});

export const RoomStatusSpinner = styled('span', {
  base: {
    display: 'inline-flex',
    color: 'accent.text',
    '& svg': { width: '22px', height: '22px', animation: 'spin' },
    _motionReduce: { '& svg': { animation: 'none' } },
  },
});

export const RoomPlayersRoot = styled('section', {
  base: {
    order: '2',
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

export const RoomPlayersHeader = styled('h2', {
  base: {
    display: 'none',
    alignItems: 'center',
    gap: '8px',
    height: '42px',
    flexShrink: '0',
    paddingInline: '14px',
    borderBottom: '1px solid',
    borderColor: 'border.subtle',
    fontSize: '14px',
    fontWeight: '900',
    '& svg': { width: '16px', height: '16px', color: 'fg.muted' },
    lg: { display: 'flex' },
  },
});

export const RoomPlayersList = styled('ul', {
  base: {
    display: 'flex',
    gap: '4px',
    padding: '6px',
    overflowX: 'auto',
    lg: { flexDirection: 'column', overflowX: 'hidden', overflowY: 'auto' },
  },
});

export const RoomPlayersItemRoot = styled('li', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: '0',
    minHeight: '44px',
    paddingInline: '8px',
    borderRadius: '8px',
    transition: 'background-color 0.2s ease',
  },
  variants: {
    me: {
      true: { bg: 'bg.subtle' },
      false: {},
    },
    turn: {
      drawing: {},
      guessed: { bg: 'success.tint' },
      gaveUp: {},
      none: {},
    },
  },
  defaultVariants: { me: false, turn: 'none' },
});

export const RoomPlayersItemPlace = styled('span', {
  base: { display: 'none', width: '26px', fontSize: '12px', fontWeight: '700', color: 'fg.subtle', fontVariantNumeric: 'tabular-nums', lg: { display: 'inline' } },
});

export const RoomPlayersItemText = styled('span', {
  base: { display: 'grid', flex: '1', minWidth: '0', lineHeight: '1.25' },
});

export const RoomPlayersItemName = styled('span', {
  base: { maxWidth: '140px', fontSize: '14px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lg: { maxWidth: 'none' } },
});

export const RoomPlayersItemNote = styled('span', {
  base: { fontSize: '12px', color: 'fg.subtle' },
});

export const RoomPlayersItemStatus = styled('span', {
  base: { display: 'inline-flex', '& svg': { width: '16px', height: '16px' } },
  variants: {
    turn: {
      drawing: { color: 'accent.text' },
      guessed: { color: 'success.text' },
      gaveUp: { color: 'fg.subtle' },
      none: {},
    },
  },
  defaultVariants: { turn: 'none' },
});

export const RoomPlayersItemScore = styled('span', {
  base: { position: 'relative', minWidth: '28px', fontSize: '14px', fontWeight: '900', textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
});

// "+85" while a turn's points are shown.
export const RoomPlayersItemGain = styled('span', {
  base: {
    position: 'absolute',
    right: '0',
    bottom: '100%',
    fontSize: '11px',
    fontWeight: '900',
    color: 'success.text',
    whiteSpace: 'nowrap',
    animation: 'pop 0.4s ease-out',
  },
});
