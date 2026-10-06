import { Popover } from '@ark-ui/react/popover';
import { Slider } from '@ark-ui/react/slider';
import { Switch } from '@ark-ui/react/switch';
import { styled } from 'styled-system/jsx';

export const RoomTopBarSoundTrigger = styled(Popover.Trigger, {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '28px',
    borderRadius: '6px',
    color: 'chrome.fg',
    cursor: 'pointer',
    _hover: { bg: 'chrome.hover', color: 'chrome.fgStrong' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    '&[data-state=open]': { bg: 'chrome.hover', color: 'chrome.fgStrong' },
    '& svg': { width: '17px', height: '17px' },
  },
  variants: {
    muted: {
      true: { color: 'fg.subtle' },
      false: {},
    },
  },
  defaultVariants: { muted: false },
});

export const RoomTopBarSoundPanelRoot = styled(Popover.Content, {
  base: {
    zIndex: '40',
    display: 'grid',
    gap: '16px',
    width: '280px',
    maxWidth: 'calc(100vw - 24px)',
    padding: '14px',
    borderRadius: '12px',
    bg: 'bg.surface',
    color: 'fg.default',
    boxShadow: 'dialog',
    outline: 'none',
    '&[data-state=open]': { animation: 'dialogIn 0.15s ease-out' },
  },
});

export const RoomTopBarSoundPanelTitle = styled('p', {
  base: { fontSize: '15px', fontWeight: '900' },
});

export const RoomTopBarSoundPanelHint = styled('span', {
  base: { fontSize: '12px', color: 'fg.subtle' },
});

export const RoomTopBarSoundPanelSwitchRoot = styled(Switch.Root, {
  base: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', cursor: 'pointer' },
});

// Ark's own label part: the switch is already a <label>, and labels can't nest.
export const RoomTopBarSoundPanelSwitchLabel = styled(Switch.Label, {
  base: { fontSize: '14px', fontWeight: '700' },
});

export const RoomTopBarSoundPanelSwitchText = styled('span', {
  base: { display: 'grid', gap: '2px' },
});

export const RoomTopBarSoundPanelSwitchControl = styled(Switch.Control, {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: '0',
    width: '40px',
    height: '24px',
    padding: '2px',
    borderRadius: 'full',
    bg: 'bg.muted',
    transition: 'background-color 0.15s ease',
    '&[data-state=checked]': { bg: 'accent.default' },
    '&[data-focus-visible]': { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
  },
});

export const RoomTopBarSoundPanelSwitchThumb = styled(Switch.Thumb, {
  base: {
    width: '20px',
    height: '20px',
    borderRadius: 'full',
    bg: 'fg.default',
    transition: 'transform 0.15s ease',
    '&[data-state=checked]': { transform: 'translateX(16px)' },
  },
});

export const RoomTopBarSoundPanelVolumeRoot = styled(Slider.Root, {
  base: { display: 'grid', gap: '10px', '&[data-disabled]': { opacity: '0.45' } },
});

export const RoomTopBarSoundPanelVolumeHead = styled('div', {
  base: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' },
});

export const RoomTopBarSoundPanelVolumeLabel = styled('label', {
  base: { fontSize: '14px', fontWeight: '700' },
});

export const RoomTopBarSoundPanelVolumeValue = styled('span', {
  base: { fontSize: '14px', fontWeight: '900', color: 'accent.text', fontVariantNumeric: 'tabular-nums' },
});

export const RoomTopBarSoundPanelVolumeControl = styled(Slider.Control, {
  base: { position: 'relative', display: 'flex', alignItems: 'center', height: '20px' },
});

export const RoomTopBarSoundPanelVolumeTrack = styled(Slider.Track, {
  base: { flex: '1', height: '6px', borderRadius: 'full', bg: 'bg.muted', overflow: 'hidden' },
});

export const RoomTopBarSoundPanelVolumeRange = styled(Slider.Range, {
  base: { height: '100%', bg: 'accent.default' },
});

export const RoomTopBarSoundPanelVolumeThumb = styled(Slider.Thumb, {
  base: {
    width: '18px',
    height: '18px',
    borderRadius: 'full',
    bg: 'fg.default',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
    cursor: 'grab',
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
  },
});
