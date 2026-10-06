import { styled } from 'styled-system/jsx';

export const RoomChatFeedRoot = styled('div', {
  base: { flex: '1', minHeight: '0', overflowY: 'auto', paddingBlock: '8px', overscrollBehavior: 'contain' },
});

export const RoomChatFeedMessageRoot = styled('article', {
  base: {
    display: 'grid',
    gridTemplateColumns: '36px minmax(0, 1fr)',
    columnGap: '8px',
    paddingInline: '14px',
    paddingBlock: '2px',
    _hover: { bg: 'bg.hover' },
  },
  variants: {
    startsGroup: {
      true: { paddingTop: '8px' },
      false: {},
    },
    // Guessed chat: only the drawer and those who got it see these.
    guessed: {
      true: { bg: 'success.tint', _hover: { bg: 'success.tint' } },
      false: {},
    },
  },
  defaultVariants: { startsGroup: true, guessed: false },
});

export const RoomChatFeedGutter = styled('div', {
  base: { display: 'flex', justifyContent: 'center', paddingTop: '2px' },
});

export const RoomChatFeedMeta = styled('div', {
  base: { display: 'flex', alignItems: 'baseline', gap: '8px' },
});

export const RoomChatFeedAuthor = styled('span', {
  base: { fontSize: '15px', fontWeight: '900' },
});

export const RoomChatFeedTime = styled('time', {
  base: { fontSize: '12px', color: 'fg.muted', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
});

export const RoomChatFeedText = styled('p', {
  base: { fontSize: '15px', lineHeight: '1.47', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' },
});

export const RoomChatFeedSystemRoot = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: '36px minmax(0, 1fr) auto',
    columnGap: '8px',
    alignItems: 'center',
    paddingInline: '14px',
    paddingBlock: '6px',
    fontSize: '13px',
    color: 'fg.muted',
  },
  variants: {
    tone: {
      default: {},
      guessed: {},
      success: { bg: 'success.tint', color: 'success.text', fontWeight: '700' },
      notice: { bg: 'accent.tint', color: 'accent.text', fontWeight: '700' },
    },
  },
  defaultVariants: { tone: 'default' },
});

export const RoomChatFeedSystemName = styled('span', {
  base: { fontWeight: '700', color: 'fg.default' },
});

export const RoomChatFeedTag = styled('span', {
  base: { fontSize: '11px', fontWeight: '700', color: 'success.text', textTransform: 'lowercase' },
});
