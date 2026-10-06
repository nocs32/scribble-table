import { styled } from 'styled-system/jsx';

export const RoomChatRoot = styled('section', {
  base: {
    order: '3',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '320px',
    overflow: 'hidden',
    borderRadius: '10px',
    border: '1px solid',
    borderColor: 'chrome.border',
    bg: 'bg.surface',
    lg: { order: '0', minHeight: '0' },
  },
});

export const RoomChatHeader = styled('header', {
  base: {
    display: 'flex',
    alignItems: 'center',
    height: '42px',
    flexShrink: '0',
    paddingInline: '14px',
    borderBottom: '1px solid',
    borderColor: 'border.subtle',
  },
});

export const RoomChatTitle = styled('h2', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '900',
    '& svg': { width: '16px', height: '16px', color: 'fg.muted' },
  },
});

// Empty (and taking no room) unless you're typing too fast; it's always there, so screen readers
// hear it change.
export const RoomChatComposerNote = styled('p', {
  base: {
    flexShrink: '0',
    marginInline: '12px',
    fontSize: '12px',
    fontWeight: '700',
    color: 'accent.text',
    '&:not(:empty)': { marginBottom: '6px', animation: 'fadeIn 0.2s ease-out' },
  },
});

export const RoomChatComposerRoot = styled('form', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: '0',
    marginInline: '10px',
    marginBottom: '10px',
    paddingBlock: '4px',
    paddingLeft: '12px',
    paddingRight: '4px',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: 'border.default',
    bg: 'bg.subtle',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    _focusWithin: { borderColor: 'border.strong', boxShadow: '0 0 0 1px {colors.border.strong}' },
  },
  variants: {
    guessing: {
      true: { borderColor: 'accent.default', _focusWithin: { borderColor: 'accent.default', boxShadow: '0 0 0 1px {colors.accent.default}' } },
      false: {},
    },
  },
  defaultVariants: { guessing: false },
});

export const RoomChatComposerInput = styled('input', {
  base: {
    flex: '1',
    minWidth: '0',
    height: '32px',
    bg: 'transparent',
    fontSize: '15px',
    outline: 'none',
    _placeholder: { color: 'fg.subtle' },
  },
});

export const RoomChatComposerSend = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    color: 'fg.muted',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease',
    _disabled: { cursor: 'default', opacity: '0.5' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    '& svg': { width: '16px', height: '16px' },
  },
  variants: {
    ready: {
      true: { bg: 'action.primary', color: 'fg.onAccent', _hover: { bg: 'action.primaryHover' } },
      false: {},
    },
  },
  defaultVariants: { ready: false },
});
