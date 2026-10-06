import { styled } from 'styled-system/jsx';

export const HomeRoot = styled('main', {
  base: {
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    height: '100%',
    padding: '16px',
  },
});

export const HomeLanguage = styled('button', {
  base: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '34px',
    height: '28px',
    paddingInline: '6px',
    borderRadius: '6px',
    border: '1px solid',
    borderColor: 'chrome.border',
    color: 'chrome.fg',
    fontSize: '12px',
    fontWeight: '900',
    letterSpacing: '0.04em',
    cursor: 'pointer',
    _hover: { bg: 'chrome.hover', color: 'chrome.fgStrong' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
  },
});

export const HomeCard = styled('section', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    width: 'min(420px, 100%)',
    paddingBlock: '40px',
    paddingInline: '32px',
    borderRadius: '16px',
    bg: 'bg.surface',
    boxShadow: 'floating',
    textAlign: 'center',
    animation: 'dialogIn 0.3s ease-out',
    _motionReduce: { animation: 'none' },
  },
});

export const HomeBrand = styled('div', {
  base: {
    display: 'flex',
    marginBottom: '6px',
    '& svg': { width: '64px', height: '64px' },
  },
});

export const HomeTitle = styled('h1', {
  base: {
    fontSize: '28px',
    fontWeight: '900',
    letterSpacing: '-0.02em',
    lineHeight: '1.2',
  },
});

export const HomeTagline = styled('p', {
  base: { color: 'fg.muted', fontSize: '16px' },
});

// The dot before the label shows the state: pulsing grey, green or red.
export const HomeStatus = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    height: '28px',
    marginTop: '10px',
    paddingInline: '12px',
    borderRadius: 'full',
    bg: 'bg.subtle',
    color: 'fg.muted',
    fontSize: '13px',
    fontWeight: '700',
    _before: { content: '""', width: '8px', height: '8px', borderRadius: 'full', bg: 'fg.subtle' },
  },
  variants: {
    status: {
      checking: { _before: { animation: 'shimmer 1.2s ease-in-out infinite' } },
      online: { _before: { bg: 'presence.online' } },
      offline: { _before: { bg: 'danger' } },
    },
  },
});
