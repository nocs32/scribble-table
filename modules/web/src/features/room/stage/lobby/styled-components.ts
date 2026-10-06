import { SegmentGroup } from '@ark-ui/react/segment-group';
import { Slider } from '@ark-ui/react/slider';
import { Switch } from '@ark-ui/react/switch';
import { styled } from 'styled-system/jsx';

export const RoomStageLobbyRoot = styled('div', {
  base: { display: 'grid', placeItems: 'center', width: '100%', lg: { height: '100%', overflowY: 'auto' } },
});

export const RoomStageLobbyCard = styled('section', {
  base: {
    display: 'grid',
    gap: '18px',
    width: '100%',
    maxWidth: '560px',
    padding: '22px',
    borderRadius: '14px',
    border: '1px solid',
    borderColor: 'border.subtle',
    bg: 'bg.subtle',
    animation: 'dialogIn 0.25s ease-out',
  },
});

export const RoomStageLobbyHead = styled('header', {
  base: { display: 'grid', gap: '2px' },
});

export const RoomStageLobbyTitle = styled('h2', {
  base: { fontSize: '20px', fontWeight: '900', letterSpacing: '-0.01em' },
});

export const RoomStageLobbySubtitle = styled('p', {
  base: { fontSize: '13px', color: 'fg.muted' },
});

export const RoomStageLobbyField = styled('div', {
  base: { display: 'grid', gap: '8px' },
});

export const RoomStageLobbyFieldHead = styled('div', {
  base: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' },
});

export const RoomStageLobbyLabel = styled('label', {
  base: { fontSize: '14px', fontWeight: '700' },
});

export const RoomStageLobbyValue = styled('span', {
  base: { fontSize: '14px', fontWeight: '900', color: 'accent.text', fontVariantNumeric: 'tabular-nums' },
});

export const RoomStageLobbyHint = styled('span', {
  base: { fontSize: '12px', color: 'fg.subtle' },
});

export const RoomStageLobbySliderRoot = styled(Slider.Root, {
  base: { display: 'grid', gap: '10px', '&[data-disabled]': { opacity: '0.55' } },
});

export const RoomStageLobbySliderControl = styled(Slider.Control, {
  base: { position: 'relative', display: 'flex', alignItems: 'center', height: '20px' },
});

export const RoomStageLobbySliderTrack = styled(Slider.Track, {
  base: { flex: '1', height: '6px', borderRadius: 'full', bg: 'bg.muted', overflow: 'hidden' },
});

export const RoomStageLobbySliderRange = styled(Slider.Range, {
  base: { height: '100%', bg: 'accent.default' },
});

export const RoomStageLobbySliderThumb = styled(Slider.Thumb, {
  base: {
    width: '20px',
    height: '20px',
    borderRadius: 'full',
    bg: 'fg.default',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
    cursor: 'grab',
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
  },
});

export const RoomStageLobbySegmentRoot = styled(SegmentGroup.Root, {
  base: {
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '4px',
    '& > label:first-child': { width: '100%', marginBottom: '4px' },
    '&[data-disabled]': { opacity: '0.55' },
  },
});

export const RoomStageLobbySegmentIndicator = styled(SegmentGroup.Indicator, {
  base: { position: 'absolute', left: 'var(--left)', top: 'var(--top)', width: 'var(--width)', height: 'var(--height)', borderRadius: '8px', bg: 'accent.default', zIndex: '0' },
});

export const RoomStageLobbySegmentItem = styled(SegmentGroup.Item, {
  base: {
    position: 'relative',
    zIndex: '1',
    display: 'grid',
    placeItems: 'center',
    width: '44px',
    height: '36px',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: 'border.default',
    fontSize: '15px',
    fontWeight: '900',
    cursor: 'pointer',
    '&[data-state=checked]': { borderColor: 'transparent', color: 'fg.onAccent' },
    '&[data-focus-visible]': { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
  },
});

export const RoomStageLobbySwitchRoot = styled(Switch.Root, {
  base: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', cursor: 'pointer', '&[data-disabled]': { opacity: '0.55', cursor: 'not-allowed' } },
});

// Ark's own label part: the switch is already a <label>, and labels can't nest.
export const RoomStageLobbySwitchLabel = styled(Switch.Label, {
  base: { fontSize: '14px', fontWeight: '700' },
});

export const RoomStageLobbySwitchText = styled('span', {
  base: { display: 'grid', gap: '2px' },
});

export const RoomStageLobbySwitchControl = styled(Switch.Control, {
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

export const RoomStageLobbySwitchThumb = styled(Switch.Thumb, {
  base: {
    width: '20px',
    height: '20px',
    borderRadius: 'full',
    bg: 'fg.default',
    transition: 'transform 0.15s ease',
    '&[data-state=checked]': { transform: 'translateX(16px)' },
  },
});

export const RoomStageLobbyTextarea = styled('textarea', {
  base: {
    width: '100%',
    minHeight: '60px',
    paddingInline: '10px',
    paddingBlock: '8px',
    borderRadius: '8px',
    bg: 'bg.surface',
    boxShadow: 'inset 0 0 0 1px {colors.border.default}',
    fontSize: '14px',
    resize: 'vertical',
    outline: 'none',
    _placeholder: { color: 'fg.subtle' },
    _focus: { boxShadow: 'inset 0 0 0 1px {colors.accent.ring}' },
    _disabled: { opacity: '0.55' },
  },
});

export const RoomStageLobbyStartRoot = styled('footer', {
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    paddingTop: '14px',
    borderTop: '1px solid',
    borderColor: 'border.subtle',
  },
});

export const RoomStageLobbyStartHint = styled('p', {
  base: { fontSize: '13px', fontWeight: '700', color: 'fg.muted' },
});

export const RoomStageLobbyStartButtons = styled('div', {
  base: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
});
