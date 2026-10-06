import { styled } from 'styled-system/jsx';

export const RoomStageHeaderRoot = styled('header', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
    alignItems: 'center',
    gap: '12px',
    minHeight: '64px',
    flexShrink: '0',
    paddingInline: '14px',
    paddingBlock: '8px',
    borderBottom: '1px solid',
    borderColor: 'border.subtle',
  },
});

export const RoomStageHeaderRound = styled('p', {
  base: { fontSize: '13px', fontWeight: '700', color: 'fg.muted', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
});

export const RoomStageHeaderCenter = styled('div', {
  base: { display: 'grid', justifyItems: 'center', gap: '4px', minWidth: '0', textAlign: 'center' },
});

export const RoomStageHeaderHeadline = styled('p', {
  base: { fontSize: '12px', fontWeight: '900', color: 'fg.muted', textTransform: 'uppercase', letterSpacing: '0.08em' },
});

export const RoomStageHeaderSide = styled('div', {
  base: { display: 'flex', justifyContent: 'flex-end' },
});

export const RoomStageHeaderWordRoot = styled('div', {
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'center',
    columnGap: '4px',
    rowGap: '6px',
    fontSize: '24px',
    fontWeight: '900',
    lineHeight: '1.1',
    sm: { fontSize: '28px' },
  },
});

export const RoomStageHeaderWordSlot = styled('span', {
  base: { display: 'inline-flex', justifyContent: 'center', minWidth: '0.75em', height: '1.25em' },
  variants: {
    kind: {
      letter: { borderBottom: '3px solid', borderColor: 'fg.default', animation: 'pop 0.35s ease-out' },
      hidden: { borderBottom: '3px solid', borderColor: 'fg.subtle' },
      gap: { minWidth: '0.6em' },
      mark: { minWidth: '0.35em' },
    },
  },
});

export const RoomStageHeaderWordLength = styled('span', {
  base: { alignSelf: 'center', marginLeft: '8px', fontSize: '13px', fontWeight: '700', color: 'fg.subtle', fontVariantNumeric: 'tabular-nums' },
});

export const RoomStageHeaderTimerRoot = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '36px',
    paddingInline: '12px',
    borderRadius: 'full',
    bg: 'bg.subtle',
    fontSize: '18px',
    fontWeight: '900',
    fontVariantNumeric: 'tabular-nums',
    '& svg': { width: '18px', height: '18px', color: 'fg.muted' },
  },
  variants: {
    urgent: {
      true: { bg: 'accent.tint', color: 'accent.text', animation: 'urgent 1s ease-in-out infinite', '& svg': { color: 'accent.text' } },
      false: {},
    },
  },
  defaultVariants: { urgent: false },
});
