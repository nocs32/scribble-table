import { defineSemanticTokens } from '@pandacss/dev';

// Dark only. Names say what a colour is for; values come from tokens.ts.
export const semanticTokens = defineSemanticTokens({
  colors: {
    chrome: {
      app: { value: '{colors.sand.1}' },
      fg: { value: '{colors.sand.11}' },
      fgStrong: { value: '{colors.sand.12}' },
      hover: { value: '{colors.sand.3}' },
      border: { value: '{colors.sand.4}' },
      field: { value: '{colors.sand.2}' },
      fieldHover: { value: '{colors.sand.3}' },
    },
    bg: {
      surface: { value: '{colors.sand.2}' },
      subtle: { value: '{colors.sand.3}' },
      muted: { value: '{colors.sand.4}' },
      hover: { value: 'rgba(255, 251, 237, 0.06)' },
      overlay: { value: 'rgba(0, 0, 0, 0.72)' },
      tooltip: { value: '{colors.sand.12}' },
    },
    fg: {
      default: { value: '{colors.sand.12}' },
      muted: { value: '{colors.sand.11}' },
      subtle: { value: '{colors.sand.10}' },
      onAccent: { value: '#FFFFFF' },
      onTooltip: { value: '{colors.sand.1}' },
    },
    border: {
      subtle: { value: '{colors.sand.4}' },
      default: { value: '{colors.sand.6}' },
      strong: { value: '{colors.sand.7}' },
    },
    action: {
      primary: { value: '{colors.coral.9}' },
      primaryHover: { value: '{colors.coral.10}' },
    },
    accent: {
      default: { value: '{colors.coral.9}' },
      text: { value: '{colors.coral.11}' },
      tint: { value: 'rgba(235, 94, 65, 0.16)' },
      ring: { value: '{colors.coral.9}' },
    },
    danger: { value: '{colors.status.red}' },
    success: {
      default: { value: '{colors.status.green}' },
      tint: { value: 'rgba(48, 164, 108, 0.16)' },
      text: { value: '#5BD69B' },
    },
    // The drawing board is white paper on the dark app.
    board: {
      paper: { value: '{colors.ink.white}' },
      edge: { value: 'rgba(0, 0, 0, 0.35)' },
      // Behind a card that sits on the board (word choice, reveal, podium).
      veil: { value: 'rgba(17, 17, 16, 0.62)' },
      // The back of the paper, on a folded corner (the fold trick): lighter at the tip, shaded at the crease.
      flap: { value: '#EEEAE3' },
      flapShade: { value: '#C9C3B8' },
    },
    presence: { online: { value: '{colors.status.green}' } },
  },
  shadows: {
    floating: { value: '0 0 0 1px rgba(255, 251, 237, 0.08), 0 8px 24px rgba(0, 0, 0, 0.6)' },
    dialog: { value: '0 0 0 1px rgba(255, 251, 237, 0.1), 0 24px 48px rgba(0, 0, 0, 0.8)' },
  },
});
