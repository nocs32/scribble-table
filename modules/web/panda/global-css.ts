import { defineGlobalStyles } from '@pandacss/dev';

export const globalCss = defineGlobalStyles({
  html: {
    colorScheme: 'dark',
  },
  'html, body, #root': {
    height: '100%',
  },
  body: {
    fontFamily: 'body',
    fontSize: '15px',
    lineHeight: '1.47',
    color: 'fg.default',
    bg: 'chrome.app',
    overflow: 'hidden',
    WebkitFontSmoothing: 'antialiased',
  },
  'button, input, textarea, select': {
    font: 'inherit',
    color: 'inherit',
  },
  '::selection': {
    bg: 'rgba(235, 94, 65, 0.35)',
  },
});
