import { styled } from 'styled-system/jsx';

export const RoomStageToolsRoot = styled('div', {
  base: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '6px 14px' },
});

export const RoomStageToolsGroup = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '2px' },
});

export const RoomStageToolsButton = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    color: 'fg.muted',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease',
    _hover: { bg: 'bg.hover', color: 'fg.default' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    _disabled: { opacity: '0.4', cursor: 'not-allowed', _hover: { bg: 'transparent', color: 'fg.muted' } },
    '&[aria-pressed=true], &[data-state=open]': { bg: 'accent.tint', color: 'accent.text' },
    '& svg': { width: '20px', height: '20px' },
  },
});

export const RoomStageToolsDot = styled('span', {
  base: { display: 'block', borderRadius: 'full', bg: 'currentColor' },
  variants: {
    dot: {
      xs: { width: '4px', height: '4px' },
      sm: { width: '8px', height: '8px' },
      md: { width: '14px', height: '14px' },
      lg: { width: '22px', height: '22px' },
    },
  },
});

export const RoomStageToolsSwatches = styled('div', {
  base: { display: 'grid', gridTemplateColumns: 'repeat(8, 22px)', gap: '4px' },
});

export const RoomStageToolsSwatch = styled('button', {
  base: {
    width: '22px',
    height: '22px',
    borderRadius: '6px',
    boxShadow: 'inset 0 0 0 1px {colors.border.default}',
    cursor: 'pointer',
    transition: 'transform 0.1s ease',
    _hover: { transform: 'scale(1.12)' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
  },
  variants: {
    ink: {
      black: { bg: 'ink.black' },
      charcoal: { bg: 'ink.charcoal' },
      gray: { bg: 'ink.gray' },
      silver: { bg: 'ink.silver' },
      white: { bg: 'ink.white' },
      red: { bg: 'ink.red' },
      orange: { bg: 'ink.orange' },
      yellow: { bg: 'ink.yellow' },
      lime: { bg: 'ink.lime' },
      green: { bg: 'ink.green' },
      teal: { bg: 'ink.teal' },
      sky: { bg: 'ink.sky' },
      blue: { bg: 'ink.blue' },
      violet: { bg: 'ink.violet' },
      pink: { bg: 'ink.pink' },
      brown: { bg: 'ink.brown' },
    },
    selected: {
      true: { outline: '2px solid', outlineColor: 'fg.default', outlineOffset: '2px' },
      false: {},
    },
  },
  defaultVariants: { selected: false },
});
